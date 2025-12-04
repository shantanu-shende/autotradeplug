import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

interface ForexTick {
  pair: string;
  price: number;
  ts: number;
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

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Forex WebSocket connected');
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SNAPSHOT') {
            updateTicks(data.payload);
          } else if (data.type === 'TICK') {
            updateTicks(data.payload);
          }
        } catch (e) {
          console.error('Failed to parse forex message:', e);
        }
      };
      
      ws.onclose = () => {
        console.log('Forex WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
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

  // Fetch initial snapshot via HTTP
  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`https://gpbxdfrkpdzbalcxtovg.supabase.co/functions/v1/live-forex?action=snapshot`);
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
