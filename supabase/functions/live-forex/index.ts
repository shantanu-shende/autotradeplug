import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory tick storage
const latestTicks: Map<string, { pair: string; price: number; ts: number }> = new Map();

// Forex pairs to track (Finnhub format: base currency quote)
const FOREX_PAIRS = [
  { symbol: 'OANDA:EUR_USD', display: 'EUR/USD' },
  { symbol: 'OANDA:GBP_USD', display: 'GBP/USD' },
  { symbol: 'OANDA:USD_JPY', display: 'USD/JPY' },
  { symbol: 'OANDA:USD_CHF', display: 'USD/CHF' },
  { symbol: 'OANDA:AUD_USD', display: 'AUD/USD' },
  { symbol: 'OANDA:USD_CAD', display: 'USD/CAD' },
];

// Fallback prices if API fails
const fallbackPrices: Record<string, number> = {
  'EUR/USD': 1.0875,
  'GBP/USD': 1.2650,
  'USD/JPY': 149.50,
  'USD/CHF': 0.8820,
  'AUD/USD': 0.6540,
  'USD/CAD': 1.3580,
};

let lastFetchTime = 0;
const FETCH_INTERVAL = 5000; // Fetch every 5 seconds to respect rate limits

// Fetch real forex data from Finnhub
async function fetchForexData() {
  const apiKey = Deno.env.get('FINNHUB_API_KEY');
  
  if (!apiKey) {
    console.log('FINNHUB_API_KEY not set, using fallback data');
    initializeFallbackData();
    return;
  }

  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) {
    return; // Rate limit protection
  }
  lastFetchTime = now;

  try {
    // Fetch quotes for each pair
    const fetchPromises = FOREX_PAIRS.map(async ({ symbol, display }) => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.c && data.c > 0) {
          latestTicks.set(display, {
            pair: display,
            price: Number(data.c.toFixed(display.includes('JPY') ? 2 : 4)),
            ts: Date.now()
          });
          console.log(`Updated ${display}: ${data.c}`);
        }
      } catch (err) {
        console.error(`Error fetching ${display}:`, err);
        // Keep existing data or use fallback
        if (!latestTicks.has(display)) {
          latestTicks.set(display, {
            pair: display,
            price: fallbackPrices[display],
            ts: Date.now()
          });
        }
      }
    });

    await Promise.all(fetchPromises);
  } catch (error) {
    console.error('Error fetching forex data:', error);
    initializeFallbackData();
  }
}

function initializeFallbackData() {
  FOREX_PAIRS.forEach(({ display }) => {
    if (!latestTicks.has(display)) {
      latestTicks.set(display, {
        pair: display,
        price: fallbackPrices[display],
        ts: Date.now()
      });
    }
  });
}

// Initial fetch
fetchForexData();

// Update prices periodically
setInterval(fetchForexData, FETCH_INTERVAL);

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Ensure we have data
  if (latestTicks.size === 0) {
    await fetchForexData();
  }

  // Snapshot endpoint
  if (url.pathname.endsWith('/snapshot') || url.searchParams.get('action') === 'snapshot') {
    const ticks = Array.from(latestTicks.values());
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
      
      // Stream updates every second
      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          const ticks = Array.from(latestTicks.values());
          socket.send(JSON.stringify({ type: 'SNAPSHOT', payload: ticks }));
        } else {
          clearInterval(interval);
        }
      }, 1000);
      
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
