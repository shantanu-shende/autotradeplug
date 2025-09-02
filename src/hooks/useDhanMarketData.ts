import { useQuery } from "@tanstack/react-query";
import { 
  getNiftyOptionChain, 
  getBankNiftyOptionChain, 
  getAvailableExpiries,
  calculatePCR,
  findMaxPain,
  DHAN_INSTRUMENTS
} from "@/services/dhanMarketData";

// Hook for NIFTY option chain with real-time updates
export function useNiftyOptionChain(expiry?: string) {
  return useQuery({
    queryKey: ['nifty-option-chain', expiry],
    queryFn: () => getNiftyOptionChain(expiry),
    refetchInterval: 3000, // 3 seconds to respect Dhan API limits
    staleTime: 2000,
    enabled: true,
  });
}

// Hook for Bank NIFTY option chain
export function useBankNiftyOptionChain(expiry?: string) {
  return useQuery({
    queryKey: ['banknifty-option-chain', expiry],
    queryFn: () => getBankNiftyOptionChain(expiry),
    refetchInterval: 3000,
    staleTime: 2000,
    enabled: true,
  });
}

// Hook for available expiries
export function useDhanExpiries(instrument: keyof typeof DHAN_INSTRUMENTS) {
  return useQuery({
    queryKey: ['dhan-expiries', instrument],
    queryFn: () => getAvailableExpiries(instrument),
    staleTime: 300000, // 5 minutes - expiries don't change often
    refetchInterval: 300000,
  });
}

// Hook for market metrics (PCR, Max Pain, etc.)
export function useMarketMetrics(instrument: 'NIFTY' | 'BANKNIFTY' = 'NIFTY', expiry?: string) {
  const optionChainQuery = instrument === 'NIFTY' 
    ? useNiftyOptionChain(expiry)
    : useBankNiftyOptionChain(expiry);

  const metrics = optionChainQuery.data ? {
    pcr: calculatePCR(optionChainQuery.data),
    maxPain: findMaxPain(optionChainQuery.data),
    totalCallOI: optionChainQuery.data.reduce((sum, option) => sum + option.call_oi, 0),
    totalPutOI: optionChainQuery.data.reduce((sum, option) => sum + option.put_oi, 0),
  } : null;

  return {
    ...optionChainQuery,
    metrics,
  };
}