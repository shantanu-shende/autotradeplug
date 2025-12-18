import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LiveForexProvider } from "@/contexts/LiveForexContext";
import Index from "./pages/Index";
import TradingZone from "./pages/TradingZone";
import MarketRoute from "./pages/MarketRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const FOREX_WS_URL = `wss://gpbxdfrkpdzbalcxtovg.supabase.co/functions/v1/live-forex`;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LiveForexProvider wsUrl={FOREX_WS_URL}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/market" element={<MarketRoute />} />
              <Route path="/trading-zone" element={<TradingZone />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LiveForexProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
