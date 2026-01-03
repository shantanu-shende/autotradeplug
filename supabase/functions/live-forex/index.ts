import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory tick storage with change data and history
interface TickData {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
  ts: number;
  history: number[]; // Last 24 price points for sparkline
}

const latestTicks: Map<string, TickData> = new Map();
const MAX_HISTORY_POINTS = 24; // 24 points for sparkline

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
        
        // Get existing history or create new
        const existing = latestTicks.get(symbol);
        const history = existing?.history || [];
        
        // Add new price to history and keep last MAX_HISTORY_POINTS
        history.push(Number(price.toFixed(decimals)));
        if (history.length > MAX_HISTORY_POINTS) {
          history.shift();
        }
        
        latestTicks.set(symbol, {
          pair: symbol,
          price: Number(price.toFixed(decimals)),
          change: Number(change.toFixed(decimals)),
          changePercent: Number(changePercent.toFixed(2)),
          ts: Date.now(),
          history
        });
        console.log(`Updated ${symbol}: ${price} (${changePercent > 0 ? '+' : ''}${changePercent}%)`);
      } else if (quoteData && quoteData.status === 'error') {
        console.error(`Error for ${symbol}: ${quoteData.message}`);
        if (!latestTicks.has(symbol)) {
          const fb = fallbackData[symbol];
          latestTicks.set(symbol, { pair: symbol, ...fb, ts: Date.now(), history: [fb.price] });
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
      // Generate simulated history with slight variations for sparkline
      const history = generateSimulatedHistory(fb.price, fb.changePercent);
      latestTicks.set(symbol, { pair: symbol, ...fb, ts: now, history });
    }
  });
  console.log('Initialized fallback data with history');
}

// Generate simulated price history for sparkline visualization
function generateSimulatedHistory(currentPrice: number, changePercent: number): number[] {
  const history: number[] = [];
  const volatility = Math.abs(changePercent) / 100 * 0.5 || 0.002;
  let price = currentPrice * (1 - (changePercent / 100)); // Start from previous close
  
  for (let i = 0; i < MAX_HISTORY_POINTS; i++) {
    // Add some randomness while trending toward current price
    const progress = i / MAX_HISTORY_POINTS;
    const targetPrice = currentPrice;
    const trend = (targetPrice - price) * 0.1;
    const noise = (Math.random() - 0.5) * currentPrice * volatility;
    price = price + trend + noise;
    history.push(Number(price.toFixed(4)));
  }
  
  // Ensure last point is close to current price
  history[history.length - 1] = currentPrice;
  return history;
}

// Helper function to verify user authentication
async function verifyAuth(req: Request): Promise<{ user: any; error: string | null }> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, error: 'Unauthorized' };
  }
  
  return { user, error: null };
}

// Initialize immediately
initializeFallbackData();
fetchForexData();
setInterval(fetchForexData, FETCH_INTERVAL);

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify user authentication for all requests
  const { user, error: authError } = await verifyAuth(req);
  if (authError || !user) {
    console.error('Authentication failed for live-forex request');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`Authenticated user ${user.id} accessing live-forex`);

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
      console.log(`Forex WebSocket client connected (user: ${user.id})`);
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
        console.log(`Forex WebSocket client disconnected (user: ${user.id})`);
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
