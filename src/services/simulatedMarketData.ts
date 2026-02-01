// Simulated market data service for demo/fallback when API is unavailable
// Focused on Forex, Commodities, and Global Indices

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

// Base data - Forex Majors as primary indices
const baseIndices: SimulatedIndexData[] = [
  { symbol: 'EUR/USD', ltp: 1.0875, change: 0.0023, changePercent: 0.21, volume: '2.5B', prevClose: 1.0852 },
  { symbol: 'GBP/USD', ltp: 1.2645, change: 0.0034, changePercent: 0.27, volume: '1.8B', prevClose: 1.2611 },
  { symbol: 'USD/JPY', ltp: 149.85, change: -0.45, changePercent: -0.30, volume: '1.2B', prevClose: 150.30 },
];

// Top Gainers - Forex pairs and commodities
const baseGainers: SimulatedStockData[] = [
  { symbol: 'XAU/USD', ltp: 2045.50, change: 28.20, changePercent: 1.40, volume: '850M' },
  { symbol: 'AUD/USD', ltp: 0.6578, change: 0.0065, changePercent: 1.00, volume: '420M' },
  { symbol: 'NZD/USD', ltp: 0.6125, change: 0.0045, changePercent: 0.74, volume: '180M' },
  { symbol: 'EUR/GBP', ltp: 0.8605, change: 0.0038, changePercent: 0.44, volume: '320M' },
  { symbol: 'XAG/USD', ltp: 24.85, change: 0.42, changePercent: 1.72, volume: '125M' },
];

// Top Losers - Forex pairs
const baseLosers: SimulatedStockData[] = [
  { symbol: 'USD/CHF', ltp: 0.8745, change: -0.0052, changePercent: -0.59, volume: '280M' },
  { symbol: 'USD/CAD', ltp: 1.3565, change: -0.0068, changePercent: -0.50, volume: '310M' },
  { symbol: 'EUR/JPY', ltp: 162.85, change: -0.75, changePercent: -0.46, volume: '195M' },
  { symbol: 'GBP/JPY', ltp: 189.45, change: -0.82, changePercent: -0.43, volume: '165M' },
  { symbol: 'WTI Oil', ltp: 78.25, change: -1.15, changePercent: -1.45, volume: '425M' },
];

// Most Active - Major pairs by volume
const baseMostActive: SimulatedStockData[] = [
  { symbol: 'EUR/USD', ltp: 1.0875, change: 0.0023, changePercent: 0.21, volume: '2.5B' },
  { symbol: 'GBP/USD', ltp: 1.2645, change: 0.0034, changePercent: 0.27, volume: '1.8B' },
  { symbol: 'USD/JPY', ltp: 149.85, change: -0.45, changePercent: -0.30, volume: '1.2B' },
  { symbol: 'XAU/USD', ltp: 2045.50, change: 28.20, changePercent: 1.40, volume: '850M' },
  { symbol: 'AUD/USD', ltp: 0.6578, change: 0.0065, changePercent: 1.00, volume: '420M' },
];

// Base option chain - simulated forex options
const baseOptionChain: SimulatedOptionData[] = [
  { strike: 1.0800, call_oi: 1850000, put_oi: 890000, call_ltp: 0.0085, put_ltp: 0.0012, call_volume: 125000, put_volume: 89000 },
  { strike: 1.0850, call_oi: 2180000, put_oi: 1200000, call_ltp: 0.0052, put_ltp: 0.0028, call_volume: 156000, put_volume: 112000 },
  { strike: 1.0875, call_oi: 2850000, put_oi: 1650000, call_ltp: 0.0035, put_ltp: 0.0038, call_volume: 189000, put_volume: 145000 },
  { strike: 1.0900, call_oi: 3200000, put_oi: 2100000, call_ltp: 0.0022, put_ltp: 0.0055, call_volume: 245000, put_volume: 198000 },
  { strike: 1.0950, call_oi: 2950000, put_oi: 2450000, call_ltp: 0.0012, put_ltp: 0.0085, call_volume: 178000, put_volume: 212000 },
  { strike: 1.1000, call_oi: 2400000, put_oi: 2800000, call_ltp: 0.0006, put_ltp: 0.0128, call_volume: 134000, put_volume: 245000 },
  { strike: 1.1050, call_oi: 1950000, put_oi: 3200000, call_ltp: 0.0003, put_ltp: 0.0175, call_volume: 98000, put_volume: 289000 },
];

// Generate realistic price movement for forex
function getRandomPriceChange(basePrice: number, volatility: number = 0.0002): number {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const magnitude = Math.random() * volatility * basePrice;
  return direction * magnitude;
}

// Deep clone and apply price movements
function applyPriceMovement<T extends { ltp: number; change: number; changePercent: number }>(
  item: T,
  volatility: number = 0.0002
): T {
  const priceChange = getRandomPriceChange(item.ltp, volatility);
  const newLtp = Math.max(item.ltp + priceChange, 0.0001);
  const prevClose = item.ltp - item.change;
  const newChange = newLtp - prevClose;
  const newChangePercent = (newChange / prevClose) * 100;
  
  // Determine decimal places based on price magnitude
  const decimals = newLtp < 10 ? 4 : 2;
  
  return {
    ...item,
    ltp: Number(newLtp.toFixed(decimals)),
    change: Number(newChange.toFixed(decimals)),
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
  currentIndices = currentIndices.map(idx => applyPriceMovement(idx, 0.0001));
  currentGainers = currentGainers.map(stock => applyPriceMovement(stock, 0.0003));
  currentLosers = currentLosers.map(stock => applyPriceMovement(stock, 0.0003));
  currentMostActive = currentMostActive.map(stock => applyPriceMovement(stock, 0.0002));
  
  // Update option chain with OI and LTP changes
  currentOptionChain = currentOptionChain.map(option => {
    const oiChange = Math.floor((Math.random() - 0.5) * 50000);
    const ltpChange = (Math.random() - 0.5) * 0.0002;
    
    return {
      ...option,
      call_oi: Math.max(option.call_oi + oiChange, 100000),
      put_oi: Math.max(option.put_oi + Math.floor((Math.random() - 0.5) * 50000), 100000),
      call_ltp: Math.max(option.call_ltp + ltpChange, 0.0001),
      put_ltp: Math.max(option.put_ltp + (Math.random() - 0.5) * 0.0002, 0.0001),
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
  
  // Generate next 4 weekly expiries (Fridays for forex)
  for (let i = 0; i < 4; i++) {
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7) + (i * 7));
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
  const baseVix = 15.45;
  const change = (Math.random() - 0.5) * 0.5;
  return {
    value: Number((baseVix + change).toFixed(2)),
    change: Number(change.toFixed(2)),
  };
}
