import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import MarketChart from '@/components/market/MarketChart';
import AssetControls from '@/components/market/AssetControls';
import { useLiveForex } from '@/contexts/LiveForexContext';
import { motion } from 'framer-motion';

const TradingZone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ticks } = useLiveForex();
  
  const symbolParam = searchParams.get('symbol') || 'NSE:NIFTY';
  const [tvSymbol, setTvSymbol] = useState<string>(symbolParam);
  const [interval, setInterval] = useState<'1'|'5'|'60'|'D'|'W'|'M'>('D');
  const [rsi, setRsi] = useState<boolean>(true);
  const [ema, setEma] = useState<boolean>(false);

  // Update symbol when URL param changes
  useEffect(() => {
    if (symbolParam) {
      setTvSymbol(symbolParam);
    }
  }, [symbolParam]);

  // Get current tick data if it's a forex pair
  const forexPair = symbolParam.replace('FX:', '').replace('OANDA:', '');
  const currentTick = ticks.get(forexPair);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trading Zone</h1>
            <p className="text-sm text-muted-foreground">Advanced charting & analysis</p>
          </div>
        </div>
        
        {currentTick && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50"
          >
            <span className="text-sm text-muted-foreground">{forexPair}</span>
            <span className="text-lg font-mono font-bold">
              {currentTick.price.toFixed(forexPair.includes('JPY') ? 2 : 4)}
            </span>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Main Chart */}
      <Card className="glass-panel mb-6">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{tvSymbol}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {interval === 'D' ? 'Daily' : interval === 'W' ? 'Weekly' : interval === 'M' ? 'Monthly' : `${interval}min`}
            </Badge>
          </div>
          <AssetControls
            symbol={tvSymbol}
            onSymbolChange={setTvSymbol}
            interval={interval}
            onIntervalChange={setInterval}
            rsi={rsi}
            onRsiChange={setRsi}
            ema={ema}
            onEmaChange={setEma}
          />
        </CardHeader>
        <CardContent>
          <div className="h-[60vh] min-h-[400px]">
            <MarketChart symbol={tvSymbol} interval={interval} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Forex Pairs */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-sm">Quick Switch - Forex Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(ticks.values()).map(tick => (
              <Button
                key={tick.pair}
                variant={tvSymbol.includes(tick.pair.replace('/', '')) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTvSymbol(`FX:${tick.pair.replace('/', '')}`)}
                className="gap-2"
              >
                <span>{tick.pair}</span>
                <span className="font-mono text-xs">
                  {tick.price.toFixed(tick.pair.includes('JPY') ? 2 : 4)}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingZone;
