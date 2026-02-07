import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeTradingData } from './useRealtimeTradingData';

export interface Portfolio {
  id: string;
  user_id: string;
  portfolio_name: string;
  portfolio_type: 'real' | 'demo';
  broker_connection_id: string | null;
  balance: number;
  equity: number;
  margin_used: number;
  margin_available: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  portfolio_id: string;
  user_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  volume: number;
  entry_price: number;
  current_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  profit_loss: number;
  opened_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  portfolio_id: string;
  user_id: string;
  bot_id: string | null;
  symbol: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  volume: number;
  price: number | null;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  filled_price: number | null;
  filled_at: string | null;
  created_at: string;
}

export function usePortfolio() {
  const { session } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscriptions
  const { isConnected: isRealtimeConnected } = useRealtimeTradingData({
    onPortfolioChange: useCallback((payload) => {
      const eventType = payload.eventType;
      if (eventType === 'INSERT') {
        const newP = payload.new as unknown as Portfolio;
        setPortfolios(prev => prev.some(p => p.id === newP.id) ? prev : [...prev, newP]);
      } else if (eventType === 'UPDATE') {
        const updated = payload.new as unknown as Portfolio;
        setPortfolios(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        setCurrentPortfolio(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
      } else if (eventType === 'DELETE') {
        const deleted = payload.old as { id: string };
        setPortfolios(prev => prev.filter(p => p.id !== deleted.id));
        setCurrentPortfolio(prev => prev?.id === deleted.id ? null : prev);
      }
    }, []),
    onPositionChange: useCallback((payload) => {
      const eventType = payload.eventType;
      if (eventType === 'INSERT') {
        const newPos = payload.new as unknown as Position;
        setPositions(prev => prev.some(p => p.id === newPos.id) ? prev : [...prev, newPos]);
      } else if (eventType === 'UPDATE') {
        const updated = payload.new as unknown as Position;
        setPositions(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      } else if (eventType === 'DELETE') {
        const deleted = payload.old as { id: string };
        setPositions(prev => prev.filter(p => p.id !== deleted.id));
      }
    }, []),
    onOrderChange: useCallback((payload) => {
      const eventType = payload.eventType;
      if (eventType === 'INSERT') {
        const newOrder = payload.new as unknown as Order;
        setOrders(prev => prev.some(o => o.id === newOrder.id) ? prev : [...prev, newOrder]);
      } else if (eventType === 'UPDATE') {
        const updated = payload.new as unknown as Order;
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
      } else if (eventType === 'DELETE') {
        const deleted = payload.old as { id: string };
        setOrders(prev => prev.filter(o => o.id !== deleted.id));
      }
    }, []),
  });

  const callPortfolioAPI = useCallback(async (action: string, data?: Record<string, unknown>) => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-manager`,
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

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callPortfolioAPI('list');
      setPortfolios(result.portfolios || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  }, [callPortfolioAPI]);

  const fetchPortfolioDetails = useCallback(async (portfolioId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callPortfolioAPI('get', { portfolio_id: portfolioId });
      setCurrentPortfolio(result.portfolio);
      setPositions(result.positions || []);
      setOrders(result.orders || []);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callPortfolioAPI]);

  const createPortfolio = useCallback(async (
    name: string,
    type: 'real' | 'demo' = 'demo',
    balance?: number,
    currency: string = 'USD'
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callPortfolioAPI('create', {
        data: {
          portfolio_name: name,
          portfolio_type: type,
          balance,
          currency,
        },
      });
      await fetchPortfolios();
      return result.portfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callPortfolioAPI, fetchPortfolios]);

  const addFunds = useCallback(async (portfolioId: string, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callPortfolioAPI('add_funds', {
        portfolio_id: portfolioId,
        data: { amount },
      });
      await fetchPortfolios();
      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolio(result.portfolio);
      }
      return result.portfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add funds');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callPortfolioAPI, fetchPortfolios, currentPortfolio?.id]);

  const withdrawFunds = useCallback(async (portfolioId: string, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callPortfolioAPI('withdraw', {
        portfolio_id: portfolioId,
        data: { amount },
      });
      await fetchPortfolios();
      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolio(result.portfolio);
      }
      return result.portfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw funds');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callPortfolioAPI, fetchPortfolios, currentPortfolio?.id]);

  const deletePortfolio = useCallback(async (portfolioId: string) => {
    setLoading(true);
    setError(null);
    try {
      await callPortfolioAPI('delete', { portfolio_id: portfolioId });
      await fetchPortfolios();
      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolio(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callPortfolioAPI, fetchPortfolios, currentPortfolio?.id]);

  return {
    portfolios,
    currentPortfolio,
    positions,
    orders,
    loading,
    error,
    isRealtimeConnected,
    fetchPortfolios,
    fetchPortfolioDetails,
    createPortfolio,
    addFunds,
    withdrawFunds,
    deletePortfolio,
    setCurrentPortfolio,
  };
}
