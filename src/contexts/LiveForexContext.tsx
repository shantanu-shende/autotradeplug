import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BatchCollector } from '@/utils/concurrency';

export interface ForexTick {
  pair: string;
  price: number;
  change?: number;
  changePercent?: number;
  ts: number;
  history?: number[]; // Price history for sparkline
}

interface LiveForexContextType {
  ticks: Map<string, ForexTick>;
  isConnected: boolean;
  isLeader: boolean;
  lastUpdate: Date | null;
}

const LiveForexContext = createContext<LiveForexContextType>({
  ticks: new Map(),
  isConnected: false,
  isLeader: false,
  lastUpdate: null,
});

const BROADCAST_CHANNEL_NAME = 'live-forex-channel';
const LEADER_CHANNEL_NAME = 'live-forex-leader';
const STORAGE_KEY = 'live-forex-sync';
const LEADER_KEY = 'live-forex-leader-id';

export function LiveForexProvider({ 
  children, 
  wsUrl 
}: { 
  children: React.ReactNode;
  wsUrl?: string;
}) {
  const [ticks, setTicks] = useState<Map<string, ForexTick>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const leaderChannelRef = useRef<BroadcastChannel | null>(null);
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // OPTIMIZATION: Batch tick updates to reduce state updates
  const batchCollectorRef = useRef<BatchCollector<ForexTick> | null>(null);

  // Initialize batch collector
  useEffect(() => {
    if (!batchCollectorRef.current) {
      batchCollectorRef.current = new BatchCollector(async (batch) => {
        updateTicksBatch(batch);
      }, 50); // Collect updates for 50ms before processing
    }

    return () => {
      if (batchCollectorRef.current) {
        batchCollectorRef.current.clear();
      }
    };
  }, []);

  // Update ticks and broadcast to other tabs
  const updateTicks = useCallback((newTicks: ForexTick | ForexTick[]) => {
    const tickArray = Array.isArray(newTicks) ? newTicks : [newTicks];
    
    setTicks(prev => {
      const updated = new Map(prev);
      tickArray.forEach(tick => {
        updated.set(tick.pair, tick);
      });
      return updated;
    });
    
    setLastUpdate(new Date());
    
    // Broadcast to other tabs
    if (broadcastRef.current) {
      try {
        broadcastRef.current.postMessage({ type: 'TICKS', ticks: tickArray });
      } catch (e) {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          type: 'TICKS', 
          ticks: tickArray, 
          ts: Date.now() 
        }));
      }
    }
  }, []);

  // OPTIMIZATION: Batch update ticks (called by BatchCollector)
  const updateTicksBatch = useCallback((batch: ForexTick[]) => {
    setTicks(prev => {
      const updated = new Map(prev);
      batch.forEach(tick => {
        updated.set(tick.pair, tick);
      });
      return updated;
    });

    setLastUpdate(new Date());

    // Broadcast batched ticks to other tabs
    if (broadcastRef.current) {
      try {
        broadcastRef.current.postMessage({ type: 'TICKS_BATCH', ticks: batch });
      } catch (e) {
        // Fallback
        console.warn('Broadcast failed, using localStorage', e);
      }
    }
  }, []);

  // Leader election
  const electLeader = useCallback(() => {
    const currentLeader = localStorage.getItem(LEADER_KEY);
    const now = Date.now();
    
    if (!currentLeader) {
      localStorage.setItem(LEADER_KEY, JSON.stringify({ id: instanceId.current, ts: now }));
      setIsLeader(true);
      return true;
    }
    
    try {
      const leader = JSON.parse(currentLeader);
      // If leader is stale (>5 seconds), take over
      if (now - leader.ts > 5000) {
        localStorage.setItem(LEADER_KEY, JSON.stringify({ id: instanceId.current, ts: now }));
        setIsLeader(true);
        return true;
      }
      
      if (leader.id === instanceId.current) {
        // Refresh our leadership
        localStorage.setItem(LEADER_KEY, JSON.stringify({ id: instanceId.current, ts: now }));
        setIsLeader(true);
        return true;
      }
      
      setIsLeader(false);
      return false;
    } catch {
      localStorage.setItem(LEADER_KEY, JSON.stringify({ id: instanceId.current, ts: now }));
      setIsLeader(true);
      return true;
    }
  }, []);

  // Connect to WebSocket with authentication
  const connectWebSocket = useCallback(async () => {
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('No auth session, skipping WebSocket connection');
        return;
      }

      // Pass auth token as query parameter since WebSocket doesn't support custom headers
      const wsUrlWithAuth = new URL(wsUrl);
      wsUrlWithAuth.searchParams.set('token', session.access_token);
      
      const ws = new WebSocket(wsUrlWithAuth.toString());
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Forex WebSocket connected');
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // OPTIMIZATION: Use batch collector for tick updates
          if (data.type === 'SNAPSHOT' && data.payload) {
            const payloads = Array.isArray(data.payload) ? data.payload : [data.payload];
            payloads.forEach(payload => {
              if (batchCollectorRef.current) {
                batchCollectorRef.current.add(payload);
              }
            });
          } else if (data.type === 'TICK' && data.payload) {
            if (batchCollectorRef.current) {
              batchCollectorRef.current.add(data.payload);
            }
          }
        } catch (e) {
          console.error('Failed to parse forex message:', e);
        }
      };
      
      ws.onclose = () => {
        console.log('Forex WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        // Flush batch before reconnecting
        if (batchCollectorRef.current) {
          batchCollectorRef.current.flush();
        }
        
        // Reconnect after delay if still leader
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (electLeader()) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('Forex WebSocket error:', error);
      };
    } catch (e) {
      console.error('Failed to connect WebSocket:', e);
    }
  }, [wsUrl, updateTicks, electLeader]);

  // Fetch initial snapshot via HTTP with authentication
  const fetchSnapshot = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('No auth session, skipping forex fetch');
        return;
      }

      const response = await fetch(`https://gpbxdfrkpdzbalcxtovg.supabase.co/functions/v1/live-forex?action=snapshot`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYnhkZnJrcGR6YmFsY3h0b3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Nzk1NDMsImV4cCI6MjA4MDM1NTU0M30.Ypz4XkMEguDMUHGPpKLC3eSVtaWmR5NaSPEhGYlMMWM',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.ticks) {
        updateTicks(data.ticks);
      }
    } catch (e) {
      console.error('Failed to fetch forex snapshot:', e);
    }
  }, [updateTicks]);

  // Setup broadcast channels and leader election
  useEffect(() => {
    // Setup BroadcastChannel
    try {
      broadcastRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastRef.current.onmessage = (event) => {
        if (event.data.type === 'TICKS' && !isLeader) {
          const tickArray = event.data.ticks as ForexTick[];
          setTicks(prev => {
            const updated = new Map(prev);
            tickArray.forEach(tick => {
              updated.set(tick.pair, tick);
            });
            return updated;
          });
          setLastUpdate(new Date());
        }
      };
      
      leaderChannelRef.current = new BroadcastChannel(LEADER_CHANNEL_NAME);
    } catch {
      // BroadcastChannel not supported, use localStorage fallback
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue && !isLeader) {
          try {
            const data = JSON.parse(e.newValue);
            if (data.type === 'TICKS') {
              const tickArray = data.ticks as ForexTick[];
              setTicks(prev => {
                const updated = new Map(prev);
                tickArray.forEach(tick => {
                  updated.set(tick.pair, tick);
                });
                return updated;
              });
              setLastUpdate(new Date());
            }
          } catch {}
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }

    // Leader heartbeat
    const leaderInterval = setInterval(() => {
      const wasLeader = isLeader;
      const nowLeader = electLeader();
      
      if (nowLeader && !wasLeader) {
        // Became leader, connect WebSocket
        connectWebSocket();
      } else if (!nowLeader && wasLeader) {
        // Lost leadership, disconnect
        wsRef.current?.close();
      }
    }, 2000);

    // Initial leader election and connection
    if (electLeader()) {
      fetchSnapshot();
      connectWebSocket();
    } else {
      fetchSnapshot(); // Non-leaders also fetch initial snapshot
    }

    return () => {
      clearInterval(leaderInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      broadcastRef.current?.close();
      leaderChannelRef.current?.close();
      
      // Release leadership
      const currentLeader = localStorage.getItem(LEADER_KEY);
      if (currentLeader) {
        try {
          const leader = JSON.parse(currentLeader);
          if (leader.id === instanceId.current) {
            localStorage.removeItem(LEADER_KEY);
          }
        } catch {}
      }
    };
  }, [electLeader, connectWebSocket, fetchSnapshot, isLeader]);

  return (
    <LiveForexContext.Provider value={{ ticks, isConnected, isLeader, lastUpdate }}>
      {children}
    </LiveForexContext.Provider>
  );
}

export function useLiveForex() {
  return useContext(LiveForexContext);
}
