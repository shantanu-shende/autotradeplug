// Global Instrument Registry - Single Source of Truth
// All components must use this registry for symbol mapping

export interface Instrument {
  internal_symbol: string;
  display_name: string;
  asset_class: 'forex' | 'commodity' | 'index';
  tradingview_symbol: string;
  fallback_symbol?: string;
  price_source: 'tradingview' | 'twelvedata';
  supported: boolean;
  decimals: number;
  category?: string;
}

// Forex Pairs (Primary: OANDA)
const forexInstruments: Instrument[] = [
  {
    internal_symbol: 'EURUSD',
    display_name: 'EUR/USD',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:EURUSD',
    fallback_symbol: 'FX:EURUSD',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Major'
  },
  {
    internal_symbol: 'GBPUSD',
    display_name: 'GBP/USD',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:GBPUSD',
    fallback_symbol: 'FX:GBPUSD',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Major'
  },
  {
    internal_symbol: 'USDJPY',
    display_name: 'USD/JPY',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:USDJPY',
    fallback_symbol: 'FX:USDJPY',
    price_source: 'twelvedata',
    supported: true,
    decimals: 2,
    category: 'Major'
  },
  {
    internal_symbol: 'USDCHF',
    display_name: 'USD/CHF',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:USDCHF',
    fallback_symbol: 'FX:USDCHF',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Major'
  },
  {
    internal_symbol: 'AUDUSD',
    display_name: 'AUD/USD',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:AUDUSD',
    fallback_symbol: 'FX:AUDUSD',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Major'
  },
  {
    internal_symbol: 'NZDUSD',
    display_name: 'NZD/USD',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:NZDUSD',
    fallback_symbol: 'FX:NZDUSD',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Major'
  },
  {
    internal_symbol: 'USDCAD',
    display_name: 'USD/CAD',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:USDCAD',
    fallback_symbol: 'FX:USDCAD',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Major'
  },
  {
    internal_symbol: 'EURGBP',
    display_name: 'EUR/GBP',
    asset_class: 'forex',
    tradingview_symbol: 'OANDA:EURGBP',
    fallback_symbol: 'FX:EURGBP',
    price_source: 'twelvedata',
    supported: true,
    decimals: 4,
    category: 'Cross'
  }
];

// Commodities
const commodityInstruments: Instrument[] = [
  {
    internal_symbol: 'XAUUSD',
    display_name: 'Gold',
    asset_class: 'commodity',
    tradingview_symbol: 'OANDA:XAUUSD',
    fallback_symbol: 'TVC:GOLD',
    price_source: 'twelvedata',
    supported: true,
    decimals: 2,
    category: 'Precious Metals'
  },
  {
    internal_symbol: 'XAGUSD',
    display_name: 'Silver',
    asset_class: 'commodity',
    tradingview_symbol: 'OANDA:XAGUSD',
    fallback_symbol: 'TVC:SILVER',
    price_source: 'twelvedata',
    supported: true,
    decimals: 2,
    category: 'Precious Metals'
  },
  {
    internal_symbol: 'USOIL',
    display_name: 'WTI Crude Oil',
    asset_class: 'commodity',
    tradingview_symbol: 'TVC:USOIL',
    fallback_symbol: 'NYMEX:CL1!',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'Energy'
  },
  {
    internal_symbol: 'UKOIL',
    display_name: 'Brent Crude Oil',
    asset_class: 'commodity',
    tradingview_symbol: 'TVC:UKOIL',
    fallback_symbol: 'NYMEX:BZ1!',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'Energy'
  }
];

// Indices
const indexInstruments: Instrument[] = [
  {
    internal_symbol: 'SPX',
    display_name: 'S&P 500',
    asset_class: 'index',
    tradingview_symbol: 'TVC:SPX',
    fallback_symbol: 'SP:SPX',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'US Indices'
  },
  {
    internal_symbol: 'IXIC',
    display_name: 'Nasdaq',
    asset_class: 'index',
    tradingview_symbol: 'TVC:IXIC',
    fallback_symbol: 'NASDAQ:IXIC',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'US Indices'
  },
  {
    internal_symbol: 'DJI',
    display_name: 'Dow Jones',
    asset_class: 'index',
    tradingview_symbol: 'TVC:DJI',
    fallback_symbol: 'DJ:DJI',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'US Indices'
  },
  {
    internal_symbol: 'DAX',
    display_name: 'DAX',
    asset_class: 'index',
    tradingview_symbol: 'XETR:DAX',
    fallback_symbol: 'TVC:DEU40',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'European Indices'
  },
  {
    internal_symbol: 'NIFTY',
    display_name: 'Nifty 50',
    asset_class: 'index',
    tradingview_symbol: 'NSE:NIFTY',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'Indian Indices'
  },
  {
    internal_symbol: 'BANKNIFTY',
    display_name: 'Bank Nifty',
    asset_class: 'index',
    tradingview_symbol: 'NSE:BANKNIFTY',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'Indian Indices'
  },
  {
    internal_symbol: 'SENSEX',
    display_name: 'Sensex',
    asset_class: 'index',
    tradingview_symbol: 'BSE:SENSEX',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'Indian Indices'
  },
  {
    internal_symbol: 'INDIAVIX',
    display_name: 'India VIX',
    asset_class: 'index',
    tradingview_symbol: 'NSE:INDIAVIX',
    price_source: 'tradingview',
    supported: true,
    decimals: 2,
    category: 'Indian Indices'
  }
];

// Combined registry
export const instrumentRegistry: Instrument[] = [
  ...forexInstruments,
  ...commodityInstruments,
  ...indexInstruments
];

// Helper functions
export function getInstrumentByInternalSymbol(symbol: string): Instrument | undefined {
  return instrumentRegistry.find(i => i.internal_symbol === symbol);
}

export function getInstrumentByTradingViewSymbol(tvSymbol: string): Instrument | undefined {
  return instrumentRegistry.find(
    i => i.tradingview_symbol === tvSymbol || i.fallback_symbol === tvSymbol
  );
}

export function getTradingViewSymbol(internalSymbol: string): string | undefined {
  const instrument = getInstrumentByInternalSymbol(internalSymbol);
  return instrument?.tradingview_symbol;
}

export function isInstrumentSupported(symbol: string): boolean {
  const instrument = getInstrumentByInternalSymbol(symbol) || 
                     getInstrumentByTradingViewSymbol(symbol);
  return instrument?.supported ?? false;
}

export function getDecimalsForSymbol(symbol: string): number {
  const instrument = getInstrumentByInternalSymbol(symbol) || 
                     getInstrumentByTradingViewSymbol(symbol);
  return instrument?.decimals ?? 4;
}

export function getInstrumentsByAssetClass(assetClass: 'forex' | 'commodity' | 'index'): Instrument[] {
  return instrumentRegistry.filter(i => i.asset_class === assetClass);
}

export function getForexInstruments(): Instrument[] {
  return getInstrumentsByAssetClass('forex');
}

export function getCommodityInstruments(): Instrument[] {
  return getInstrumentsByAssetClass('commodity');
}

export function getIndexInstruments(): Instrument[] {
  return getInstrumentsByAssetClass('index');
}

// Parse any symbol format and return the instrument
export function parseSymbol(symbol: string): Instrument | undefined {
  // Remove common prefixes
  const cleanSymbol = symbol
    .replace(/^(FX:|OANDA:|TVC:|NSE:|BSE:|XETR:)/, '')
    .replace('/', '');
  
  return getInstrumentByInternalSymbol(cleanSymbol);
}

// Get the correct TradingView symbol from any input format
export function resolveTradingViewSymbol(inputSymbol: string): string | null {
  const instrument = parseSymbol(inputSymbol);
  if (!instrument || !instrument.supported) return null;
  return instrument.tradingview_symbol;
}
