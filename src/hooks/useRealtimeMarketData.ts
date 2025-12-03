import { useState, useEffect, useCallback } from 'react';
import {
  tickMarketData,
  getSimulatedIndices,
  getSimulatedGainers,
  getSimulatedLosers,
  getSimulatedMostActive,
  getSimulatedOptionChain,
  getSimulatedExpiries,
  calculateSimulatedPCR,
  getSimulatedMaxPain,
  getSimulatedVIX,
  SimulatedIndexData,
  SimulatedStockData,
  SimulatedOptionData,
} from '@/services/simulatedMarketData';

interface MarketMetrics {
  pcr: number;
  maxPain: number;
  totalCallOI: number;
  totalPutOI: number;
  vix: { value: number; change: number };
}

interface RealtimeMarketData {
  indices: SimulatedIndexData[];
  gainers: SimulatedStockData[];
  losers: SimulatedStockData[];
  mostActive: SimulatedStockData[];
  optionChain: SimulatedOptionData[];
  expiries: string[];
  metrics: MarketMetrics;
  isLive: boolean;
  lastUpdate: Date;
}

export function useRealtimeMarketData(refreshInterval: number = 2000) {
  const [data, setData] = useState<RealtimeMarketData>(() => {
    const optionChain = getSimulatedOptionChain();
    return {
      indices: getSimulatedIndices(),
      gainers: getSimulatedGainers(),
      losers: getSimulatedLosers(),
      mostActive: getSimulatedMostActive(),
      optionChain,
      expiries: getSimulatedExpiries(),
      metrics: {
        pcr: calculateSimulatedPCR(),
        maxPain: getSimulatedMaxPain(),
        totalCallOI: optionChain.reduce((sum, o) => sum + o.call_oi, 0),
        totalPutOI: optionChain.reduce((sum, o) => sum + o.put_oi, 0),
        vix: getSimulatedVIX(),
      },
      isLive: true,
      lastUpdate: new Date(),
    };
  });

  const refreshData = useCallback(() => {
    tickMarketData();
    const optionChain = getSimulatedOptionChain();
    
    setData({
      indices: getSimulatedIndices(),
      gainers: getSimulatedGainers(),
      losers: getSimulatedLosers(),
      mostActive: getSimulatedMostActive(),
      optionChain,
      expiries: getSimulatedExpiries(),
      metrics: {
        pcr: calculateSimulatedPCR(),
        maxPain: getSimulatedMaxPain(),
        totalCallOI: optionChain.reduce((sum, o) => sum + o.call_oi, 0),
        totalPutOI: optionChain.reduce((sum, o) => sum + o.put_oi, 0),
        vix: getSimulatedVIX(),
      },
      isLive: true,
      lastUpdate: new Date(),
    });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(refreshData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshData, refreshInterval]);

  return data;
}

// Separate hook for just option chain data
export function useRealtimeOptionChain(instrument: 'NIFTY' | 'BANKNIFTY' = 'NIFTY') {
  const [data, setData] = useState(() => ({
    optionChain: getSimulatedOptionChain(),
    expiries: getSimulatedExpiries(),
    metrics: {
      pcr: calculateSimulatedPCR(),
      maxPain: getSimulatedMaxPain(),
      totalCallOI: getSimulatedOptionChain().reduce((sum, o) => sum + o.call_oi, 0),
      totalPutOI: getSimulatedOptionChain().reduce((sum, o) => sum + o.put_oi, 0),
    },
    isLoading: false,
    isFetching: false,
  }));

  useEffect(() => {
    const intervalId = setInterval(() => {
      tickMarketData();
      const optionChain = getSimulatedOptionChain();
      
      setData({
        optionChain,
        expiries: getSimulatedExpiries(),
        metrics: {
          pcr: calculateSimulatedPCR(),
          maxPain: getSimulatedMaxPain(),
          totalCallOI: optionChain.reduce((sum, o) => sum + o.call_oi, 0),
          totalPutOI: optionChain.reduce((sum, o) => sum + o.put_oi, 0),
        },
        isLoading: false,
        isFetching: false,
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [instrument]);

  return data;
}
