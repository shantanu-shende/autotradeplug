// Simulated market data service for demo/fallback when API is unavailable

export interface SimulatedIndexData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: string;
  prevClose: number;
}

export interface SimulatedStockData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: string;
}

export interface SimulatedOptionData {
  strike: number;
  call_oi: number;
  put_oi: number;
  call_ltp: number;
  put_ltp: number;
  call_volume: number;
  put_volume: number;
}

// Base data that gets updated with realistic price movements
const baseIndices: SimulatedIndexData[] = [
  { symbol: 'NIFTY 50', ltp: 24850.75, change: 157.80, changePercent: 0.64, volume: '2.5Cr', prevClose: 24692.95 },
  { symbol: 'BANK NIFTY', ltp: 53250.30, change: 234.15, changePercent: 0.44, volume: '1.8Cr', prevClose: 53016.15 },
  { symbol: 'SENSEX', ltp: 81892.60, change: 489.40, changePercent: 0.60, volume: '98L', prevClose: 81403.20 },
];

const baseGainers: SimulatedStockData[] = [
  { symbol: 'ADANIPORTS', ltp: 1285.50, change: 78.20, changePercent: 6.48, volume: '2.5Cr' },
  { symbol: 'BAJFINANCE', ltp: 7834.75, change: 312.45, changePercent: 4.15, volume: '1.2Cr' },
  { symbol: 'HDFCBANK', ltp: 1747.30, change: 67.85, changePercent: 4.04, volume: '3.1Cr' },
  { symbol: 'RELIANCE', ltp: 2985.50, change: 89.30, changePercent: 3.08, volume: '5.2Cr' },
  { symbol: 'TCS', ltp: 4256.75, change: 98.45, changePercent: 2.37, volume: '4.8Cr' },
];

const baseLosers: SimulatedStockData[] = [
  { symbol: 'DRREDDY', ltp: 1234.20, change: -56.30, changePercent: -4.36, volume: '85L' },
  { symbol: 'CIPLA', ltp: 1456.75, change: -58.25, changePercent: -3.85, volume: '67L' },
  { symbol: 'SUNPHARMA', ltp: 1789.40, change: -62.60, changePercent: -3.38, volume: '92L' },
  { symbol: 'DIVISLAB', ltp: 4567.80, change: -134.20, changePercent: -2.85, volume: '45L' },
  { symbol: 'APOLLOHOSP', ltp: 6234.50, change: -156.30, changePercent: -2.44, volume: '32L' },
];

const baseMostActive: SimulatedStockData[] = [
  { symbol: 'RELIANCE', ltp: 2985.50, change: 89.30, changePercent: 3.08, volume: '8.2Cr' },
  { symbol: 'TCS', ltp: 4256.75, change: 98.45, changePercent: 2.37, volume: '6.8Cr' },
  { symbol: 'INFY', ltp: 1867.80, change: 25.60, changePercent: 1.39, volume: '5.1Cr' },
  { symbol: 'HDFC', ltp: 1747.30, change: 67.85, changePercent: 4.04, volume: '4.9Cr' },
  { symbol: 'ICICIBANK', ltp: 1289.45, change: 18.35, changePercent: 1.44, volume: '4.5Cr' },
];

const baseOptionChain: SimulatedOptionData[] = [
  { strike: 24700, call_oi: 1850000, put_oi: 890000, call_ltp: 185.50, put_ltp: 35.20, call_volume: 125000, put_volume: 89000 },
  { strike: 24750, call_oi: 2180000, put_oi: 1200000, call_ltp: 152.80, put_ltp: 52.40, call_volume: 156000, put_volume: 112000 },
  { strike: 24800, call_oi: 2850000, put_oi: 1650000, call_ltp: 118.20, put_ltp: 78.90, call_volume: 189000, put_volume: 145000 },
  { strike: 24850, call_oi: 3200000, put_oi: 2100000, call_ltp: 88.50, put_ltp: 98.30, call_volume: 245000, put_volume: 198000 },
  { strike: 24900, call_oi: 2950000, put_oi: 2450000, call_ltp: 62.30, put_ltp: 125.60, call_volume: 178000, put_volume: 212000 },
  { strike: 24950, call_oi: 2400000, put_oi: 2800000, call_ltp: 42.10, put_ltp: 158.90, call_volume: 134000, put_volume: 245000 },
  { strike: 25000, call_oi: 1950000, put_oi: 3200000, call_ltp: 28.40, put_ltp: 195.20, call_volume: 98000, put_volume: 289000 },
];

// Generate realistic price movement
function getRandomPriceChange(basePrice: number, volatility: number = 0.001): number {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const magnitude = Math.random() * volatility * basePrice;
  return direction * magnitude;
}

// Deep clone and apply price movements
function applyPriceMovement<T extends { ltp: number; change: number; changePercent: number }>(
  item: T,
  volatility: number = 0.001
): T {
  const priceChange = getRandomPriceChange(item.ltp, volatility);
  const newLtp = Math.max(item.ltp + priceChange, 1);
  const prevClose = item.ltp - item.change;
  const newChange = newLtp - prevClose;
  const newChangePercent = (newChange / prevClose) * 100;
  
  return {
    ...item,
    ltp: Number(newLtp.toFixed(2)),
    change: Number(newChange.toFixed(2)),
    changePercent: Number(newChangePercent.toFixed(2)),
  };
}

// Current state (gets updated over time)
let currentIndices = [...baseIndices];
let currentGainers = [...baseGainers];
let currentLosers = [...baseLosers];
let currentMostActive = [...baseMostActive];
let currentOptionChain = [...baseOptionChain];

// Update all data with realistic movements
export function tickMarketData(): void {
  currentIndices = currentIndices.map(idx => applyPriceMovement(idx, 0.0005));
  currentGainers = currentGainers.map(stock => applyPriceMovement(stock, 0.002));
  currentLosers = currentLosers.map(stock => applyPriceMovement(stock, 0.002));
  currentMostActive = currentMostActive.map(stock => applyPriceMovement(stock, 0.0015));
  
  // Update option chain with OI and LTP changes
  currentOptionChain = currentOptionChain.map(option => {
    const oiChange = Math.floor((Math.random() - 0.5) * 50000);
    const ltpChange = (Math.random() - 0.5) * 2;
    
    return {
      ...option,
      call_oi: Math.max(option.call_oi + oiChange, 100000),
      put_oi: Math.max(option.put_oi + Math.floor((Math.random() - 0.5) * 50000), 100000),
      call_ltp: Math.max(option.call_ltp + ltpChange, 0.1),
      put_ltp: Math.max(option.put_ltp + (Math.random() - 0.5) * 2, 0.1),
    };
  });
}

// Getters for current data
export function getSimulatedIndices(): SimulatedIndexData[] {
  return currentIndices.map(idx => ({ ...idx }));
}

export function getSimulatedGainers(): SimulatedStockData[] {
  return currentGainers
    .map(stock => ({ ...stock }))
    .sort((a, b) => b.changePercent - a.changePercent);
}

export function getSimulatedLosers(): SimulatedStockData[] {
  return currentLosers
    .map(stock => ({ ...stock }))
    .sort((a, b) => a.changePercent - b.changePercent);
}

export function getSimulatedMostActive(): SimulatedStockData[] {
  return currentMostActive.map(stock => ({ ...stock }));
}

export function getSimulatedOptionChain(): SimulatedOptionData[] {
  return currentOptionChain.map(option => ({ ...option }));
}

export function getSimulatedExpiries(): string[] {
  const today = new Date();
  const expiries: string[] = [];
  
  // Generate next 4 weekly expiries (Thursdays)
  for (let i = 0; i < 4; i++) {
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7) + (i * 7));
    expiries.push(expiry.toISOString().split('T')[0]);
  }
  
  return expiries;
}

export function calculateSimulatedPCR(): number {
  const totalPutOI = currentOptionChain.reduce((sum, o) => sum + o.put_oi, 0);
  const totalCallOI = currentOptionChain.reduce((sum, o) => sum + o.call_oi, 0);
  return totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
}

export function getSimulatedMaxPain(): number {
  let maxPain = 0;
  let maxOI = 0;
  
  currentOptionChain.forEach(option => {
    const totalOI = option.call_oi + option.put_oi;
    if (totalOI > maxOI) {
      maxOI = totalOI;
      maxPain = option.strike;
    }
  });
  
  return maxPain;
}

export function getSimulatedVIX(): { value: number; change: number } {
  const baseVix = 13.45;
  const change = (Math.random() - 0.5) * 0.5;
  return {
    value: Number((baseVix + change).toFixed(2)),
    change: Number(change.toFixed(2)),
  };
}
