import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory tick storage
const latestTicks: Map<string, { pair: string; price: number; ts: number }> = new Map();

// Forex pairs to track
const FOREX_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'];

// Initialize with realistic prices
const initPrices: Record<string, number> = {
  'EUR/USD': 1.0875,
  'GBP/USD': 1.2650,
  'USD/JPY': 149.50,
  'USD/CHF': 0.8820,
  'AUD/USD': 0.6540,
  'USD/CAD': 1.3580,
};

// Initialize ticks
FOREX_PAIRS.forEach(pair => {
  latestTicks.set(pair, {
    pair,
    price: initPrices[pair],
    ts: Date.now()
  });
});

// Simulate price movement
function updatePrices() {
  FOREX_PAIRS.forEach(pair => {
    const current = latestTicks.get(pair);
    if (current) {
      const volatility = pair.includes('JPY') ? 0.05 : 0.0003;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = Math.max(0.0001, current.price + change);
      latestTicks.set(pair, {
        pair,
        price: Number(newPrice.toFixed(pair.includes('JPY') ? 2 : 4)),
        ts: Date.now()
      });
    }
  });
}

// Update prices every second
setInterval(updatePrices, 1000);

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      
      // Start streaming ticks
      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          // Send random tick update
          const pairs = Array.from(latestTicks.keys());
          const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
          const tick = latestTicks.get(randomPair);
          if (tick) {
            socket.send(JSON.stringify({ type: 'TICK', payload: tick }));
          }
        } else {
          clearInterval(interval);
        }
      }, 500);
      
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
