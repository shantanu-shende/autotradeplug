import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from '@/utils/concurrency';
import { useRealtimeTradingData } from './useRealtimeTradingData';

export interface TradingBot {
  id: string;
  user_id: string;
  bot_name: string;
  strategy_type: 'arbitrage' | 'scalping' | 'grid' | 'trend_following';
  status: 'running' | 'paused' | 'stopped' | 'error';
  config: BotConfig;
  created_at: string;
  updated_at: string;
}

export interface BotConfig {
  max_positions?: number;
  max_drawdown_percent?: number;
  daily_loss_limit?: number;
  position_size_percent?: number;
  instruments?: string[];
  take_profit_pips?: number;
  stop_loss_pips?: number;
}

export interface BotExecutionLog {
  id: string;
  bot_id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export function useTradingBot() {
  const { session } = useAuth();
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [currentBot, setCurrentBot] = useState<TradingBot | null>(null);
  const [logs, setLogs] = useState<BotExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OPTIMIZATION: Track pending updates to avoid duplicate refetches
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  // Real-time subscriptions
  const { isConnected: isRealtimeConnected } = useRealtimeTradingData({
    onBotChange: useCallback((payload) => {
      const eventType = payload.eventType;
      if (eventType === 'INSERT') {
        const newBot = payload.new as unknown as TradingBot;
        setBots(prev => {
          if (prev.some(b => b.id === newBot.id)) return prev;
          return [...prev, newBot];
        });
      } else if (eventType === 'UPDATE') {
        const updated = payload.new as unknown as TradingBot;
        setBots(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
        setCurrentBot(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
      } else if (eventType === 'DELETE') {
        const deleted = payload.old as { id: string };
        setBots(prev => prev.filter(b => b.id !== deleted.id));
        setCurrentBot(prev => prev?.id === deleted.id ? null : prev);
      }
    }, []),
  });

  const callBotAPI = useCallback(async (action: string, data?: Record<string, unknown>) => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-bot-engine`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action, ...data }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    return result;
  }, [session?.access_token]);

  const fetchBots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('list');
      setBots(result.bots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bots');
    } finally {
      setLoading(false);
    }
  }, [callBotAPI]);

  // OPTIMIZATION: Debounced version of fetchBots to batch multiple calls
  const debouncedFetchBots = useRef(debounce(() => fetchBots(), 300)).current;

  const fetchBotDetails = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('get', { bot_id: botId });
      setCurrentBot(result.bot);
      setLogs(result.logs || []);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bot details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI]);

  const createBot = useCallback(async (
    name: string,
    strategyType: TradingBot['strategy_type'] = 'trend_following',
    config?: Partial<BotConfig>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('create', {
        data: {
          bot_name: name,
          strategy_type: strategyType,
          config,
        },
      });

      // OPTIMIZATION: Optimistic update - add bot to local state immediately
      const newBot = result.bot;
      setBots((prev) => [...prev, newBot]);

      // Refetch in background (debounced to avoid redundant calls)
      debouncedFetchBots();

      return newBot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI, debouncedFetchBots]);

  const updateBot = useCallback(async (botId: string, updates: Partial<{ bot_name: string; strategy_type: TradingBot['strategy_type']; config: BotConfig }>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('update', {
        bot_id: botId,
        data: updates,
      });

      // OPTIMIZATION: Optimistic update
      setBots((prev) =>
        prev.map((bot) => (bot.id === botId ? result.bot : bot))
      );

      if (currentBot?.id === botId) {
        setCurrentBot(result.bot);
      }

      // Batch refetch with debouncing
      debouncedFetchBots();

      return result.bot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI, debouncedFetchBots, currentBot?.id]);

  const deleteBot = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    try {
      await callBotAPI('delete', { bot_id: botId });

      // OPTIMIZATION: Optimistic delete
      setBots((prev) => prev.filter((bot) => bot.id !== botId));

      if (currentBot?.id === botId) {
        setCurrentBot(null);
      }

      // Batch refetch with debouncing
      debouncedFetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI, debouncedFetchBots, currentBot?.id]);

  const startBot = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('start', { bot_id: botId });

      // OPTIMIZATION: Optimistic update
      setBots((prev) =>
        prev.map((bot) =>
          bot.id === botId ? { ...bot, status: 'running' as const } : bot
        )
      );

      if (currentBot?.id === botId) {
        setCurrentBot(result.bot);
      }

      // Batch refetch with debouncing
      debouncedFetchBots();

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI, debouncedFetchBots, currentBot?.id]);

  const stopBot = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('stop', { bot_id: botId });

      // OPTIMIZATION: Optimistic update
      setBots((prev) =>
        prev.map((bot) =>
          bot.id === botId ? { ...bot, status: 'stopped' as const } : bot
        )
      );

      if (currentBot?.id === botId) {
        setCurrentBot(result.bot);
      }

      // Batch refetch with debouncing
      debouncedFetchBots();

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI, debouncedFetchBots, currentBot?.id]);

  const pauseBot = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('pause', { bot_id: botId });

      // OPTIMIZATION: Optimistic update
      setBots((prev) =>
        prev.map((bot) =>
          bot.id === botId ? { ...bot, status: 'paused' as const } : bot
        )
      );

      if (currentBot?.id === botId) {
        setCurrentBot(result.bot);
      }

      // Batch refetch with debouncing
      debouncedFetchBots();

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI, debouncedFetchBots, currentBot?.id]);

  const executeOrder = useCallback(async (params: {
    bot_id?: string;
    portfolio_id: string;
    symbol: string;
    side: 'buy' | 'sell';
    volume: number;
    order_type?: 'market' | 'limit' | 'stop' | 'stop_limit';
    price?: number;
    stop_loss?: number;
    take_profit?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('execute_order', {
        bot_id: params.bot_id,
        data: params,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI]);

  const fetchLogs = useCallback(async (botId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBotAPI('get_logs', { bot_id: botId });
      setLogs(result.logs || []);
      return result.logs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callBotAPI]);

  return {
    bots,
    currentBot,
    logs,
    loading,
    error,
    isRealtimeConnected,
    fetchBots,
    fetchBotDetails,
    createBot,
    updateBot,
    deleteBot,
    startBot,
    stopBot,
    pauseBot,
    executeOrder,
    fetchLogs,
    setCurrentBot,
  };
}
