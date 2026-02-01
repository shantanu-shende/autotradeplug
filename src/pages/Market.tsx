import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Globe, ExternalLink, Expand, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { ForexTicker } from '@/components/market/ForexTicker';
import { useRealtimeMarketData } from '@/hooks/useRealtimeMarketData';

interface MarketSessionData {
  name: string;
  status: 'open' | 'closed' | 'pre-market';
  hours: string;
}

const Market = () => {
  const navigate = useNavigate();

  // Live market data from simulated realtime service
  const {
    indices,
    gainers,
    losers,
    mostActive,
    metrics,
    isLive,
    lastUpdate
  } = useRealtimeMarketData(2000);

  // Market sessions
  const sessions: MarketSessionData[] = [
    { name: 'Sydney', status: 'open', hours: '22:00-07:00 UTC' },
    { name: 'Tokyo', status: 'open', hours: '00:00-09:00 UTC' },
    { name: 'London', status: 'open', hours: '08:00-17:00 UTC' },
    { name: 'New York', status: 'open', hours: '13:00-22:00 UTC' },
  ];

  const getChangeColor = (change: number) => change >= 0 ? 'text-success' : 'text-destructive';
  
  const formatPrice = (price: number) => {
    if (price >= 100) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(4);
  };

  if (!indices || indices.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span>{isLive ? 'Live' : 'Delayed'}</span>
          <span>• Last update: {lastUpdate.toLocaleTimeString()}</span>
        </div>
        <Button size="sm" onClick={() => navigate('/trading-zone')} className="gap-2">
          <BarChart3 className="w-4 h-4" />
          Trading Zone
        </Button>
      </div>

      {/* Live Forex Ticker with Cross-Tab Sync */}
      <ForexTicker />

      {/* Top Metrics Panel - Forex Majors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AnimatePresence mode="popLayout">
          {indices.map((index) => (
            <motion.div
              key={index.symbol}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card className="glass-panel hover:glow-primary transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground font-medium">{index.symbol}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <motion.div
                    key={index.ltp}
                    initial={{ scale: 1.02, color: 'hsl(var(--primary))' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    transition={{ duration: 0.3 }}
                    className="text-xl font-bold mb-1"
                  >
                    {formatPrice(index.ltp)}
                  </motion.div>
                  <div className={`flex items-center text-sm ${getChangeColor(index.change)}`}>
                    {index.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    <motion.span
                      key={`${index.symbol}-change`}
                      initial={{ backgroundColor: index.change >= 0 ? 'hsl(var(--success) / 0.3)' : 'hsl(var(--destructive) / 0.3)' }}
                      animate={{ backgroundColor: 'transparent' }}
                      transition={{ duration: 0.5 }}
                      className="rounded px-1"
                    >
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(4)} ({index.changePercent.toFixed(2)}%)
                    </motion.span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Vol: {index.volume}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Market Volatility Metrics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="relative"
        >
          <Card className="glass-panel hover:glow-primary transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-medium">Volatility</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium">VIX: {metrics.vix.value}</div>
                  <div className={`text-xs ${getChangeColor(metrics.vix.change)}`}>
                    {metrics.vix.change >= 0 ? '+' : ''}{metrics.vix.change.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">PCR: {metrics.pcr.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    Strike: {metrics.maxPain.toFixed(4)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div>
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span>Top Gainers</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Expand className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {gainers.slice(0, 3).map((stock, i) => (
                    <motion.div
                      key={stock.symbol}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{stock.symbol}</div>
                        <motion.div
                          key={stock.ltp}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          className="text-xs text-muted-foreground"
                        >
                          {formatPrice(stock.ltp)}
                        </motion.div>
                      </div>
                      <div className="text-right">
                        <motion.div
                          key={`${stock.symbol}-pct`}
                          initial={{ backgroundColor: 'hsl(var(--success) / 0.3)' }}
                          animate={{ backgroundColor: 'transparent' }}
                          transition={{ duration: 0.5 }}
                          className="text-xs text-success font-medium rounded px-1"
                        >
                          +{stock.changePercent.toFixed(2)}%
                        </motion.div>
                        <div className="w-16 h-4 bg-success/20 rounded overflow-hidden mt-1">
                          <motion.div
                            className="h-full bg-success rounded"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(stock.changePercent * 30, 100)}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Top Losers */}
        <div>
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  <span>Top Losers</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Expand className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {losers.slice(0, 3).map((stock, i) => (
                    <motion.div
                      key={stock.symbol}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{stock.symbol}</div>
                        <motion.div
                          key={stock.ltp}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          className="text-xs text-muted-foreground"
                        >
                          {formatPrice(stock.ltp)}
                        </motion.div>
                      </div>
                      <div className="text-right">
                        <motion.div
                          key={`${stock.symbol}-pct`}
                          initial={{ backgroundColor: 'hsl(var(--destructive) / 0.3)' }}
                          animate={{ backgroundColor: 'transparent' }}
                          transition={{ duration: 0.5 }}
                          className="text-xs text-destructive font-medium rounded px-1"
                        >
                          {stock.changePercent.toFixed(2)}%
                        </motion.div>
                        <div className="w-16 h-4 bg-destructive/20 rounded overflow-hidden mt-1">
                          <motion.div
                            className="h-full bg-destructive rounded"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(Math.abs(stock.changePercent) * 30, 100)}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Sessions */}
        <div>
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span>Market Sessions</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session, i) => (
                  <motion.div
                    key={session.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.status === 'open' ? 'bg-success' : 'bg-muted'}`} />
                      <span className="font-medium text-sm">{session.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{session.hours}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Row - Most Active */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active */}
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Most Active</span>
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Expand className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {mostActive.map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                    </div>
                    <div className="text-right">
                      <motion.div
                        key={stock.ltp}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className="font-bold"
                      >
                        {formatPrice(stock.ltp)}
                      </motion.div>
                      <div className={`text-sm ${getChangeColor(stock.change)}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Market News */}
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <span>Market News</span>
              </CardTitle>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {[
                  { tag: '📈', type: 'Fed', headline: 'Fed signals steady rates through Q2 2026', time: '2 mins ago', source: 'Reuters' },
                  { tag: '📰', type: 'ECB', headline: 'ECB considers rate cut amid slowing growth', time: '15 mins ago', source: 'Bloomberg' },
                  { tag: '💰', type: 'Gold', headline: 'Gold hits new highs on safe-haven demand', time: '1 hour ago', source: 'FX Wire' },
                  { tag: '🛢️', type: 'Oil', headline: 'WTI drops on inventory buildup', time: '2 hours ago', source: 'CNBC' },
                ].map((news, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <span className="text-lg">{news.tag}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">{news.type}</Badge>
                        <span className="text-xs text-muted-foreground">{news.source}</span>
                      </div>
                      <div className="text-sm font-medium">{news.headline}</div>
                      <div className="text-xs text-muted-foreground mt-1">{news.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;
