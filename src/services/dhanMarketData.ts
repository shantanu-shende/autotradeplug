import { getDhanOptionChain, getDhanExpiryList } from './dhanAPI';

export interface DhanStockData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface DhanIndexData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: string;
}

export interface DhanOptionChainData {
  strike: number;
  call_oi: number;
  put_oi: number;
  call_ltp: number;
  put_ltp: number;
  call_volume: number;
  put_volume: number;
}

// NSE Security IDs for major indices (from Dhan instruments CSV)
export const DHAN_INSTRUMENTS = {
  NIFTY: { UnderlyingScrip: 26000, UnderlyingSeg: "IDX_I" },
  BANKNIFTY: { UnderlyingScrip: 26009, UnderlyingSeg: "IDX_I" },
  FINNIFTY: { UnderlyingScrip: 26037, UnderlyingSeg: "IDX_I" },
  MIDCPNIFTY: { UnderlyingScrip: 26074, UnderlyingSeg: "IDX_I" }
} as const;

// Get NIFTY option chain data
export async function getNiftyOptionChain(expiry?: string): Promise<DhanOptionChainData[]> {
  try {
    const { UnderlyingScrip, UnderlyingSeg } = DHAN_INSTRUMENTS.NIFTY;
    
    // If no expiry provided, get first available expiry
    if (!expiry) {
      const expiryData = await getDhanExpiryList({ UnderlyingScrip, UnderlyingSeg });
      const expiries = (expiryData as any)?.expiries as string[];
      if (!expiries || expiries.length === 0) {
        throw new Error('No expiries available');
      }
      expiry = expiries[0];
    }

    const optionChainData = await getDhanOptionChain({ 
      UnderlyingScrip, 
      UnderlyingSeg, 
      Expiry: expiry 
    });

    // Transform Dhan response to our format
    const data = optionChainData as any;
    if (data?.optionchain) {
      return data.optionchain.map((option: any) => ({
        strike: option.strikePrice,
        call_oi: option.CE?.openInterest || 0,
        put_oi: option.PE?.openInterest || 0,
        call_ltp: option.CE?.ltp || 0,
        put_ltp: option.PE?.ltp || 0,
        call_volume: option.CE?.volume || 0,
        put_volume: option.PE?.volume || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching NIFTY option chain:', error);
    return [];
  }
}

// Get Bank NIFTY option chain data
export async function getBankNiftyOptionChain(expiry?: string): Promise<DhanOptionChainData[]> {
  try {
    const { UnderlyingScrip, UnderlyingSeg } = DHAN_INSTRUMENTS.BANKNIFTY;
    
    if (!expiry) {
      const expiryData = await getDhanExpiryList({ UnderlyingScrip, UnderlyingSeg });
      const expiries = (expiryData as any)?.expiries as string[];
      if (!expiries || expiries.length === 0) {
        throw new Error('No expiries available');
      }
      expiry = expiries[0];
    }

    const optionChainData = await getDhanOptionChain({ 
      UnderlyingScrip, 
      UnderlyingSeg, 
      Expiry: expiry 
    });

    const data = optionChainData as any;
    if (data?.optionchain) {
      return data.optionchain.map((option: any) => ({
        strike: option.strikePrice,
        call_oi: option.CE?.openInterest || 0,
        put_oi: option.PE?.openInterest || 0,
        call_ltp: option.CE?.ltp || 0,
        put_ltp: option.PE?.ltp || 0,
        call_volume: option.CE?.volume || 0,
        put_volume: option.PE?.volume || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching Bank NIFTY option chain:', error);
    return [];
  }
}

// Get available expiries for an instrument
export async function getAvailableExpiries(instrument: keyof typeof DHAN_INSTRUMENTS): Promise<string[]> {
  try {
    const { UnderlyingScrip, UnderlyingSeg } = DHAN_INSTRUMENTS[instrument];
    const expiryData = await getDhanExpiryList({ UnderlyingScrip, UnderlyingSeg });
    return (expiryData as any)?.expiries || [];
  } catch (error) {
    console.error(`Error fetching expiries for ${instrument}:`, error);
    return [];
  }
}

// Calculate Put-Call Ratio from option chain data
export function calculatePCR(optionData: DhanOptionChainData[]): number {
  const totalPutOI = optionData.reduce((sum, option) => sum + option.put_oi, 0);
  const totalCallOI = optionData.reduce((sum, option) => sum + option.call_oi, 0);
  
  return totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
}

// Find max pain (strike with highest total OI)
export function findMaxPain(optionData: DhanOptionChainData[]): number {
  let maxPain = 0;
  let maxOI = 0;

  optionData.forEach(option => {
    const totalOI = option.call_oi + option.put_oi;
    if (totalOI > maxOI) {
      maxOI = totalOI;
      maxPain = option.strike;
    }
  });

  return maxPain;
}