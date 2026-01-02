import { useLiveForex, ForexTick } from '@/contexts/LiveForexContext';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getInstrumentByInternalSymbol,
  getDecimalsForSymbol 
} from '@/data/instrumentRegistry';
import { Sparkline } from './Sparkline';

interface PriceChange {
  pair: string;
  direction: 'up' | 'down' | 'none';
}

export function ForexTicker() {
  const { ticks, isConnected, isLeader, lastUpdate } = useLiveForex();
  const [priceChanges, setPriceChanges] = useState<Map<string, PriceChange>>(new Map());
  const [prevPrices, setPrevPrices] = useState<Map<string, number>>(new Map());
  const navigate = useNavigate();

  // Track price changes for animation
  useEffect(() => {
    const newChanges = new Map<string, PriceChange>();
    
    ticks.forEach((tick, pair) => {
      const prevPrice = prevPrices.get(pair);
      if (prevPrice !== undefined) {
        if (tick.price > prevPrice) {
          newChanges.set(pair, { pair, direction: 'up' });
        } else if (tick.price < prevPrice) {
          newChanges.set(pair, { pair, direction: 'down' });
        } else {
          newChanges.set(pair, { pair, direction: 'none' });
        }
      } else {
        newChanges.set(pair, { pair, direction: 'none' });
      }
    });
    
    setPriceChanges(newChanges);
    setPrevPrices(new Map(Array.from(ticks.entries()).map(([k, v]) => [k, v.price])));
  }, [ticks]);

  const tickArray = Array.from(ticks.values());

  // Get decimal places from registry
  const getDecimals = (pair: string): number => {
    const cleanSymbol = pair.replace('/', '');
    return getDecimalsForSymbol(cleanSymbol);
  };

  // Navigate to trading zone with proper TradingView symbol from registry
  const handleNavigate = (tick: ForexTick) => {
    const cleanSymbol = tick.pair.replace('/', '');
    const instrument = getInstrumentByInternalSymbol(cleanSymbol);
    
    if (instrument && instrument.supported) {
      navigate(`/trading-zone?symbol=${encodeURIComponent(instrument.tradingview_symbol)}`);
    }
  };

  if (tickArray.length === 0) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Live Forex</h3>
          <Badge variant="outline" className="text-xs">
            <WifiOff className="w-3 h-3 mr-1" />
            Connecting...
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-muted/50 rounded h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Live Forex & Commodities</h3>
          <Badge variant="secondary" className="text-xs gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Verified Feed
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isLeader && (
            <Badge variant="secondary" className="text-xs">
              Leader
            </Badge>
          )}
          <Badge variant={isConnected ? "default" : "outline"} className="text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Polling
              </>
            )}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <AnimatePresence>
          {tickArray.map(tick => {
            const change = priceChanges.get(tick.pair);
            const isUp = change?.direction === 'up';
            const isDown = change?.direction === 'down';
            const decimals = getDecimals(tick.pair);
            const dailyUp = (tick.changePercent ?? 0) >= 0;
            
            return (
              <motion.div
                key={tick.pair}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(tick)}
                className={`p-2.5 rounded-md border transition-colors cursor-pointer ${
                  isUp ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' :
                  isDown ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                  'bg-muted/30 border-border/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{tick.pair}</span>
                  {isUp && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {isDown && <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <motion.div
                    key={tick.price}
                    initial={{ scale: 1.15, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className={`text-sm font-mono font-semibold ${
                      isUp ? 'text-green-500' :
                      isDown ? 'text-red-500' :
                      'text-foreground'
                    }`}
                  >
                    {tick.price.toFixed(decimals)}
                  </motion.div>
                  
                  {/* Mini Sparkline Chart */}
                  {tick.history && tick.history.length > 1 && (
                    <Sparkline 
                      data={tick.history} 
                      width={40} 
                      height={16} 
                      positive={dailyUp}
                    />
                  )}
                </div>
                
                {/* Daily Change Percentage */}
                {tick.changePercent !== undefined && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                    dailyUp ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {dailyUp ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    <span>{dailyUp ? '+' : ''}{tick.changePercent.toFixed(2)}%</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {lastUpdate && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Live data synced
          </span>
          <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}
