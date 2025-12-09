import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory tick storage
const latestTicks: Map<string, { pair: string; price: number; ts: number }> = new Map();

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

// Fallback prices if API fails
const fallbackPrices: Record<string, number> = {
  'EUR/USD': 1.0565,
  'GBP/USD': 1.2720,
  'USD/JPY': 151.50,
  'USD/CHF': 0.8820,
  'AUD/USD': 0.6380,
  'USD/CAD': 1.4180,
  'NZD/USD': 0.5780,
  'EUR/GBP': 0.8310,
  'XAU/USD': 2650.50,
  'XAG/USD': 31.25,
};

let lastFetchTime = 0;
const FETCH_INTERVAL = 10000; // 10 seconds to respect rate limits
let consecutiveErrors = 0;

// Get decimal places based on symbol
function getDecimals(symbol: string): number {
  if (symbol.includes('JPY')) return 2;
  if (symbol.includes('XAU')) return 2;
  if (symbol.includes('XAG')) return 2;
  return 4;
}

// Fetch real forex data from Twelve Data
async function fetchForexData() {
  const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
  
  if (!apiKey) {
    console.log('TWELVE_DATA_API_KEY not set, using fallback data');
    initializeFallbackData();
    return;
  }

  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) {
    return; // Rate limit protection
  }
  lastFetchTime = now;

  try {
    // Batch request for multiple symbols (Twelve Data supports this)
    const symbols = FOREX_PAIRS.map(p => p.twelveSymbol).join(',');
    
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Twelve Data response:', JSON.stringify(data));
    
    // Check for API errors
    if (data.code && data.code !== 200) {
      throw new Error(`API Error: ${data.message || data.code}`);
    }
    
    // Process batch response
    FOREX_PAIRS.forEach(({ symbol, twelveSymbol }) => {
      const priceData = data[twelveSymbol];
      
      if (priceData && priceData.price) {
        const price = parseFloat(priceData.price);
        const decimals = getDecimals(symbol);
        
        latestTicks.set(symbol, {
          pair: symbol,
          price: Number(price.toFixed(decimals)),
          ts: Date.now()
        });
        console.log(`Updated ${symbol}: ${price}`);
      } else if (priceData && priceData.status === 'error') {
        console.error(`Error for ${symbol}: ${priceData.message}`);
        // Use fallback for this symbol
        if (!latestTicks.has(symbol)) {
          latestTicks.set(symbol, {
            pair: symbol,
            price: fallbackPrices[symbol],
            ts: Date.now()
          });
        }
      }
    });
    
    consecutiveErrors = 0;
    console.log(`Successfully updated ${latestTicks.size} forex prices from Twelve Data`);
    
  } catch (error) {
    console.error('Error fetching forex data:', error);
    consecutiveErrors++;
    
    // After 3 consecutive errors, use fallback data
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
      latestTicks.set(symbol, {
        pair: symbol,
        price: fallbackPrices[symbol],
        ts: now
      });
    }
  });
  console.log('Initialized fallback data');
}

// Initialize with fallback data immediately so we always have something
initializeFallbackData();

// Try to fetch real data
fetchForexData();

// Update prices periodically
setInterval(fetchForexData, FETCH_INTERVAL);

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Snapshot endpoint
  if (url.pathname.endsWith('/snapshot') || url.searchParams.get('action') === 'snapshot') {
    const ticks = Array.from(latestTicks.values());
    console.log(`Snapshot requested, returning ${ticks.length} ticks`);
    return new Response(JSON.stringify({ ticks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // WebSocket upgrade for real-time streaming
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log("Forex WebSocket client connected");
      
      // Send initial snapshot
      const ticks = Array.from(latestTicks.values());
      socket.send(JSON.stringify({ type: 'SNAPSHOT', payload: ticks }));
      
      // Stream updates every 2 seconds
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

  // Default: return snapshot
  const ticks = Array.from(latestTicks.values());
  return new Response(JSON.stringify({ ticks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
