import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ArbitrageSignal {
  id: string;
  user_id: string;
  symbol_pair: string;
  source_a: string;
  source_b: string;
  price_a: number;
  price_b: number;
  spread_pips: number;
  potential_profit: number;
  detected_at: string;
  executed: boolean;
  execution_result: Record<string, unknown> | null;
  action_recommendation?: string;
}

export interface SpreadData {
  sources: Array<{ name: string; price: number; timestamp: number }>;
  max_spread: number;
  min_spread: number;
}

export function useArbitrage() {
  const { session } = useAuth();
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [spreads, setSpreads] = useState<Record<string, SpreadData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    scanned_symbols: number;
    signals_found: number;
    scan_timestamp: string;
  } | null>(null);

  const callArbitrageAPI = useCallback(async (action: string, data?: Record<string, unknown>) => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/arbitrage-detector`,
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

  const scanForOpportunities = useCallback(async (
    symbols?: string[],
    minSpreadPips?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callArbitrageAPI('scan', {
        data: {
          symbols,
          min_spread_pips: minSpreadPips,
        },
      });
      setSignals(prev => [...result.opportunities, ...prev]);
      setLastScanResult({
        scanned_symbols: result.scanned_symbols,
        signals_found: result.signals_found,
        scan_timestamp: result.scan_timestamp,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan for opportunities');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callArbitrageAPI]);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callArbitrageAPI('list_signals');
      setSignals(result.signals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  }, [callArbitrageAPI]);

  const getSpreads = useCallback(async (symbols?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callArbitrageAPI('get_spreads', {
        data: { symbols },
      });
      setSpreads(result.spreads || {});
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spreads');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callArbitrageAPI]);

  const executeArbitrage = useCallback(async (
    signalId: string,
    portfolioId: string,
    volume: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callArbitrageAPI('execute', {
        signal_id: signalId,
        data: {
          portfolio_id: portfolioId,
          volume,
        },
      });
      // Update the signal in state
      setSignals(prev =>
        prev.map(s =>
          s.id === signalId
            ? { ...s, executed: true, execution_result: result.execution }
            : s
        )
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute arbitrage');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callArbitrageAPI]);

  return {
    signals,
    spreads,
    loading,
    error,
    lastScanResult,
    scanForOpportunities,
    fetchSignals,
    getSpreads,
    executeArbitrage,
  };
}
