import { useLiveForex } from '@/contexts/LiveForexContext';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PriceChange {
  pair: string;
  direction: 'up' | 'down' | 'none';
}

export function ForexTicker() {
  const { ticks, isConnected, isLeader, lastUpdate } = useLiveForex();
  const [priceChanges, setPriceChanges] = useState<Map<string, PriceChange>>(new Map());
  const [prevPrices, setPrevPrices] = useState<Map<string, number>>(new Map());

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
            <div key={i} className="animate-pulse bg-muted/50 rounded h-12" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Live Forex</h3>
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <AnimatePresence>
          {tickArray.map(tick => {
            const change = priceChanges.get(tick.pair);
            const isUp = change?.direction === 'up';
            const isDown = change?.direction === 'down';
            
            return (
              <motion.div
                key={tick.pair}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-2 rounded-md border transition-colors ${
                  isUp ? 'bg-green-500/10 border-green-500/30' :
                  isDown ? 'bg-red-500/10 border-red-500/30' :
                  'bg-muted/30 border-border/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{tick.pair}</span>
                  {isUp && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {isDown && <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>
                <motion.div
                  key={tick.price}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`text-sm font-mono font-semibold ${
                    isUp ? 'text-green-500' :
                    isDown ? 'text-red-500' :
                    'text-foreground'
                  }`}
                >
                  {tick.price.toFixed(tick.pair.includes('JPY') ? 2 : 4)}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {lastUpdate && (
        <div className="mt-2 text-xs text-muted-foreground text-right">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
