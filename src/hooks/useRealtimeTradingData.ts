import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ChangePayload<T = Record<string, unknown>> = RealtimePostgresChangesPayload<T>;

interface RealtimeCallbacks {
  onBotChange?: (payload: ChangePayload) => void;
  onPortfolioChange?: (payload: ChangePayload) => void;
  onPositionChange?: (payload: ChangePayload) => void;
  onOrderChange?: (payload: ChangePayload) => void;
}

export function useRealtimeTradingData(callbacks: RealtimeCallbacks) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref current without re-subscribing
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!user?.id) {
      setIsConnected(false);
      return;
    }

    const userId = user.id;

    const channel = supabase
      .channel('trading-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trading_bots' },
        (payload) => {
          // RLS filters to user's own data, but double-check
          const record = (payload.new as Record<string, unknown>) || (payload.old as Record<string, unknown>);
          if (record?.user_id === userId) {
            callbacksRef.current.onBotChange?.(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolios' },
        (payload) => {
          const record = (payload.new as Record<string, unknown>) || (payload.old as Record<string, unknown>);
          if (record?.user_id === userId) {
            callbacksRef.current.onPortfolioChange?.(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions' },
        (payload) => {
          const record = (payload.new as Record<string, unknown>) || (payload.old as Record<string, unknown>);
          if (record?.user_id === userId) {
            callbacksRef.current.onPositionChange?.(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const record = (payload.new as Record<string, unknown>) || (payload.old as Record<string, unknown>);
          if (record?.user_id === userId) {
            callbacksRef.current.onOrderChange?.(payload);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [user?.id]);

  return { isConnected };
}
