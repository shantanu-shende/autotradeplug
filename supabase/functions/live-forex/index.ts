import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory tick storage
const latestTicks: Map<string, { pair: string; price: number; ts: number }> = new Map();

// Forex pairs to track - includes major pairs and commodities
const FOREX_PAIRS = [
  { symbol: 'EUR/USD', base: 1.0565 },
  { symbol: 'GBP/USD', base: 1.2720 },
  { symbol: 'USD/JPY', base: 151.50 },
  { symbol: 'USD/CHF', base: 0.8820 },
  { symbol: 'AUD/USD', base: 0.6380 },
  { symbol: 'USD/CAD', base: 1.4180 },
  { symbol: 'NZD/USD', base: 0.5780 },
  { symbol: 'EUR/GBP', base: 0.8310 },
  { symbol: 'XAU/USD', base: 2650.50 }, // Gold
  { symbol: 'XAG/USD', base: 31.25 },   // Silver
];

// Simulate realistic price movements
function simulatePrice(basePrice: number, symbol: string): number {
  // Different volatility for different assets
  let volatility = 0.0002; // 0.02% for forex
  
  if (symbol.includes('XAU')) {
    volatility = 0.0008; // 0.08% for gold (more volatile)
  } else if (symbol.includes('XAG')) {
    volatility = 0.0012; // 0.12% for silver (most volatile)
  } else if (symbol.includes('JPY')) {
    volatility = 0.0003; // Slightly higher for JPY pairs
  }
  
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
  return basePrice + change;
}

// Get decimal places based on symbol
function getDecimals(symbol: string): number {
  if (symbol.includes('JPY')) return 2;
  if (symbol.includes('XAU')) return 2;
  if (symbol.includes('XAG')) return 2;
  return 4;
}

// Initialize and update prices
function updatePrices() {
  const now = Date.now();
  
  FOREX_PAIRS.forEach(({ symbol, base }) => {
    const existing = latestTicks.get(symbol);
    const currentBase = existing ? existing.price : base;
    const newPrice = simulatePrice(currentBase, symbol);
    const decimals = getDecimals(symbol);
    
    latestTicks.set(symbol, {
      pair: symbol,
      price: Number(newPrice.toFixed(decimals)),
      ts: now
    });
  });
  
  console.log(`Updated ${latestTicks.size} forex prices at ${new Date(now).toISOString()}`);
}

// Initialize prices immediately
updatePrices();

// Update prices every 1 second for real-time feel
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
