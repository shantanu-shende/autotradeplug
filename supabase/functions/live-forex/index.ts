import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory tick storage with change data
interface TickData {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
  ts: number;
}

const latestTicks: Map<string, TickData> = new Map();

// Forex pairs and commodities to track
const FOREX_PAIRS = [
  { symbol: 'EUR/USD', twelveSymbol: 'EUR/USD' },
  { symbol: 'GBP/USD', twelveSymbol: 'GBP/USD' },
  { symbol: 'USD/JPY', twelveSymbol: 'USD/JPY' },
  { symbol: 'USD/CHF', twelveSymbol: 'USD/CHF' },
  { symbol: 'AUD/USD', twelveSymbol: 'AUD/USD' },
  { symbol: 'USD/CAD', twelveSymbol: 'USD/CAD' },
  { symbol: 'NZD/USD', twelveSymbol: 'NZD/USD' },
  { symbol: 'EUR/GBP', twelveSymbol: 'EUR/GBP' },
  { symbol: 'XAU/USD', twelveSymbol: 'XAU/USD' }, // Gold
  { symbol: 'XAG/USD', twelveSymbol: 'XAG/USD' }, // Silver
];

// Fallback data
const fallbackData: Record<string, { price: number; change: number; changePercent: number }> = {
  'EUR/USD': { price: 1.0565, change: 0.0012, changePercent: 0.11 },
  'GBP/USD': { price: 1.2720, change: -0.0025, changePercent: -0.20 },
  'USD/JPY': { price: 151.50, change: 0.45, changePercent: 0.30 },
  'USD/CHF': { price: 0.8820, change: -0.0008, changePercent: -0.09 },
  'AUD/USD': { price: 0.6380, change: 0.0015, changePercent: 0.24 },
  'USD/CAD': { price: 1.4180, change: 0.0022, changePercent: 0.16 },
  'NZD/USD': { price: 0.5780, change: -0.0010, changePercent: -0.17 },
  'EUR/GBP': { price: 0.8310, change: 0.0005, changePercent: 0.06 },
  'XAU/USD': { price: 2650.50, change: 12.30, changePercent: 0.47 },
  'XAG/USD': { price: 31.25, change: -0.15, changePercent: -0.48 },
};

let lastFetchTime = 0;
const FETCH_INTERVAL = 10000; // 10 seconds
let consecutiveErrors = 0;

function getDecimals(symbol: string): number {
  if (symbol.includes('JPY')) return 2;
  if (symbol.includes('XAU')) return 2;
  if (symbol.includes('XAG')) return 2;
  return 4;
}

// Fetch real forex data with quotes (includes change data)
async function fetchForexData() {
  const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
  
  if (!apiKey) {
    console.log('TWELVE_DATA_API_KEY not set, using fallback data');
    initializeFallbackData();
    return;
  }

  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) {
    return;
  }
  lastFetchTime = now;

  try {
    // Use quote endpoint for price + change data
    const symbols = FOREX_PAIRS.map(p => p.twelveSymbol).join(',');
    
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Twelve Data quote response received');
    
    if (data.code && data.code !== 200) {
      throw new Error(`API Error: ${data.message || data.code}`);
    }
    
    FOREX_PAIRS.forEach(({ symbol, twelveSymbol }) => {
      const quoteData = data[twelveSymbol];
      
      if (quoteData && quoteData.close) {
        const price = parseFloat(quoteData.close);
        const change = parseFloat(quoteData.change || 0);
        const changePercent = parseFloat(quoteData.percent_change || 0);
        const decimals = getDecimals(symbol);
        
        latestTicks.set(symbol, {
          pair: symbol,
          price: Number(price.toFixed(decimals)),
          change: Number(change.toFixed(decimals)),
          changePercent: Number(changePercent.toFixed(2)),
          ts: Date.now()
        });
        console.log(`Updated ${symbol}: ${price} (${changePercent > 0 ? '+' : ''}${changePercent}%)`);
      } else if (quoteData && quoteData.status === 'error') {
        console.error(`Error for ${symbol}: ${quoteData.message}`);
        if (!latestTicks.has(symbol)) {
          const fb = fallbackData[symbol];
          latestTicks.set(symbol, { pair: symbol, ...fb, ts: Date.now() });
        }
      }
    });
    
    consecutiveErrors = 0;
    console.log(`Successfully updated ${latestTicks.size} forex prices with change data`);
    
  } catch (error) {
    console.error('Error fetching forex data:', error);
    consecutiveErrors++;
    
    if (consecutiveErrors >= 3) {
      console.log('Using fallback data due to repeated errors');
      initializeFallbackData();
    }
  }
}

function initializeFallbackData() {
  const now = Date.now();
  FOREX_PAIRS.forEach(({ symbol }) => {
    if (!latestTicks.has(symbol)) {
      const fb = fallbackData[symbol];
      latestTicks.set(symbol, { pair: symbol, ...fb, ts: now });
    }
  });
  console.log('Initialized fallback data');
}

// Initialize immediately
initializeFallbackData();
fetchForexData();
setInterval(fetchForexData, FETCH_INTERVAL);

serve(async (req) => {
  const url = new URL(req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (url.pathname.endsWith('/snapshot') || url.searchParams.get('action') === 'snapshot') {
    const ticks = Array.from(latestTicks.values());
    return new Response(JSON.stringify({ ticks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log("Forex WebSocket client connected");
      const ticks = Array.from(latestTicks.values());
      socket.send(JSON.stringify({ type: 'SNAPSHOT', payload: ticks }));
      
      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          const ticks = Array.from(latestTicks.values());
          socket.send(JSON.stringify({ type: 'SNAPSHOT', payload: ticks }));
        } else {
          clearInterval(interval);
        }
      }, 2000);
      
      socket.onclose = () => {
        console.log("Forex WebSocket client disconnected");
        clearInterval(interval);
      };
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;
  }

  const ticks = Array.from(latestTicks.values());
  return new Response(JSON.stringify({ ticks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
