import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import MarketChart from '@/components/market/MarketChart';
import AssetControls from '@/components/market/AssetControls';
import { useLiveForex } from '@/contexts/LiveForexContext';
import { UnsupportedInstrumentModal } from '@/components/market/UnsupportedInstrumentModal';
import { motion } from 'framer-motion';
import { 
  parseSymbol, 
  resolveTradingViewSymbol,
  instrumentRegistry,
  getInstrumentByInternalSymbol,
  Instrument
} from '@/data/instrumentRegistry';

const TradingZone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ticks } = useLiveForex();
  
  const symbolParam = searchParams.get('symbol') || 'NSE:NIFTY';
  const [tvSymbol, setTvSymbol] = useState<string>('');
  const [interval, setInterval] = useState<'1'|'5'|'60'|'D'|'W'|'M'>('D');
  const [rsi, setRsi] = useState<boolean>(true);
  const [ema, setEma] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(null);

  // Validate and resolve symbol on mount or when URL param changes
  useEffect(() => {
    setIsLoading(true);
    
    // Try to resolve the symbol from registry
    const resolvedSymbol = resolveTradingViewSymbol(symbolParam);
    const instrument = parseSymbol(symbolParam);
    
    if (resolvedSymbol && instrument?.supported) {
      setTvSymbol(resolvedSymbol);
      setCurrentInstrument(instrument);
      setIsLoading(false);
    } else {
      // Symbol not supported - show modal
      setShowUnsupportedModal(true);
      setIsLoading(false);
    }
  }, [symbolParam]);

  // Handle unsupported modal close - navigate back to market
  const handleUnsupportedClose = () => {
    setShowUnsupportedModal(false);
    navigate('/market', { replace: true });
  };

  // Handle symbol change from controls
  const handleSymbolChange = (newSymbol: string) => {
    const resolvedSymbol = resolveTradingViewSymbol(newSymbol);
    const instrument = parseSymbol(newSymbol);
    
    if (resolvedSymbol && instrument?.supported) {
      setTvSymbol(resolvedSymbol);
      setCurrentInstrument(instrument);
      // Update URL without reload
      navigate(`/trading-zone?symbol=${encodeURIComponent(resolvedSymbol)}`, { replace: true });
    } else {
      setShowUnsupportedModal(true);
    }
  };

  // Get current tick data if it's a forex pair
  const cleanSymbol = currentInstrument?.internal_symbol || '';
  const forexPair = cleanSymbol.includes('/') ? cleanSymbol : 
                   `${cleanSymbol.slice(0, 3)}/${cleanSymbol.slice(3)}`;
  const currentTick = ticks.get(forexPair) || ticks.get(cleanSymbol);

  // Get supported forex instruments for quick switch
  const forexInstruments = instrumentRegistry.filter(
    i => (i.asset_class === 'forex' || i.asset_class === 'commodity') && i.supported
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background p-4 md:p-6"
    >
      {/* Unsupported Instrument Modal */}
      <UnsupportedInstrumentModal
        open={showUnsupportedModal}
        onClose={handleUnsupportedClose}
        symbol={symbolParam}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/market')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Market
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trading Zone</h1>
            <p className="text-sm text-muted-foreground">Advanced charting & analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentTick && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50"
            >
              <span className="text-sm text-muted-foreground">
                {currentInstrument?.display_name || cleanSymbol}
              </span>
              <span className="text-lg font-mono font-bold">
                {currentTick.price.toFixed(currentInstrument?.decimals ?? 2)}
              </span>
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Live
              </Badge>
            </motion.div>
          )}
          
          <Badge variant="secondary" className="text-xs gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Verified Price Feed
          </Badge>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="glass-panel mb-6">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                currentInstrument?.display_name || tvSymbol
              )}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {interval === 'D' ? 'Daily' : interval === 'W' ? 'Weekly' : interval === 'M' ? 'Monthly' : `${interval}min`}
            </Badge>
          </div>
          <AssetControls
            symbol={tvSymbol}
            onSymbolChange={handleSymbolChange}
            interval={interval}
            onIntervalChange={setInterval}
            rsi={rsi}
            onRsiChange={setRsi}
            ema={ema}
            onEmaChange={setEma}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[60vh] min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Skeleton className="h-[400px] w-full" />
                <p className="text-sm text-muted-foreground">Loading chart...</p>
              </div>
            </div>
          ) : tvSymbol ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="h-[60vh] min-h-[400px]"
            >
              <MarketChart symbol={tvSymbol} interval={interval} />
            </motion.div>
          ) : null}
        </CardContent>
      </Card>

      {/* Quick Forex & Commodity Pairs */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-sm">Quick Switch - Forex & Commodities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {forexInstruments.map(instrument => {
              const tick = ticks.get(instrument.display_name) || 
                          ticks.get(instrument.internal_symbol) ||
                          ticks.get(`${instrument.internal_symbol.slice(0, 3)}/${instrument.internal_symbol.slice(3)}`);
              const isActive = tvSymbol === instrument.tradingview_symbol;
              
              return (
                <Button
                  key={instrument.internal_symbol}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSymbolChange(instrument.tradingview_symbol)}
                  className="gap-2"
                >
                  <span>{instrument.display_name}</span>
                  {tick && (
                    <span className="font-mono text-xs">
                      {tick.price.toFixed(instrument.decimals)}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TradingZone;
