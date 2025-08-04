import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, useAnimation } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart,
  ExternalLink,
  Expand,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface IndexData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: string;
}

interface StockData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: string;
}

interface SectorData {
  name: string;
  change: number;
  changePercent: number;
}

interface OptionData {
  strike: number;
  call_oi: number;
  put_oi: number;
  call_iv: number;
  put_iv: number;
  delta: number;
  theta: number;
}

interface AlertData {
  id: string;
  type: 'iv_surge' | 'volume_spike' | 'price_alert';
  symbol: string;
  message: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
}

const Market = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('2024-01-25');
  const [refreshing, setRefreshing] = useState(false);
  const controls = useAnimation();

  // Mock data
  const indices: IndexData[] = [
    { symbol: 'NIFTY 50', ltp: 19674.25, change: 157.80, changePercent: 0.81, volume: '2.5Cr' },
    { symbol: 'BANK NIFTY', ltp: 44512.30, change: 234.15, changePercent: 0.53, volume: '1.8Cr' },
    { symbol: 'MIDCAP', ltp: 32845.60, change: -89.40, changePercent: -0.27, volume: '98L' },
  ];

  const marketMetrics = {
    vix: { value: 13.45, change: -0.28 },
    pcr: { value: 0.89, change: -0.03 }
  };

  const gainers: StockData[] = [
    { symbol: 'ADANIPORTS', ltp: 785.50, change: 45.20, changePercent: 6.11, volume: '2.5Cr' },
    { symbol: 'BAJFINANCE', ltp: 6834.75, change: 298.45, changePercent: 4.57, volume: '1.2Cr' },
    { symbol: 'HDFCBANK', ltp: 1547.30, change: 67.85, changePercent: 4.58, volume: '3.1Cr' },
  ];

  const losers: StockData[] = [
    { symbol: 'DRREDDY', ltp: 4234.20, change: -186.30, changePercent: -4.22, volume: '85L' },
    { symbol: 'CIPLA', ltp: 1156.75, change: -48.25, changePercent: -4.00, volume: '67L' },
    { symbol: 'SUNPHARMA', ltp: 1089.40, change: -42.60, changePercent: -3.76, volume: '92L' },
  ];

  const mostActive: StockData[] = [
    { symbol: 'RELIANCE', ltp: 2485.50, change: 12.30, changePercent: 0.50, volume: '5.2Cr' },
    { symbol: 'TCS', ltp: 3456.75, change: -23.45, changePercent: -0.67, volume: '4.8Cr' },
    { symbol: 'INFY', ltp: 1567.80, change: 15.60, changePercent: 1.01, volume: '4.1Cr' },
  ];

  const sectors: SectorData[] = [
    { name: 'Banking', change: 234.15, changePercent: 0.53 },
    { name: 'IT', change: -45.80, changePercent: -0.32 },
    { name: 'Pharma', change: -123.45, changePercent: -2.85 },
    { name: 'Auto', change: 89.25, changePercent: 1.24 },
  ];

  const optionChain: OptionData[] = [
    { strike: 19600, call_oi: 1250000, put_oi: 890000, call_iv: 15.4, put_iv: 16.2, delta: 0.75, theta: -8.5 },
    { strike: 19650, call_oi: 1680000, put_oi: 1200000, call_iv: 14.8, put_iv: 15.9, delta: 0.68, theta: -9.2 },
    { strike: 19700, call_oi: 2100000, put_oi: 1850000, call_iv: 14.2, put_iv: 15.1, delta: 0.52, theta: -10.8 },
  ];

  const alerts: AlertData[] = [
    {
      id: '1',
      type: 'iv_surge',
      symbol: 'NIFTY 19700 PE',
      message: 'IV surge detected: 18.5% (+3.2%)',
      timestamp: '2 mins ago',
      impact: 'high'
    },
    {
      id: '2',
      type: 'volume_spike',
      symbol: 'BANKNIFTY',
      message: 'Volume spike: 250% above average',
      timestamp: '5 mins ago',
      impact: 'medium'
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 500);
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.3 }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [controls]);

  const getChangeColor = (change: number) => change >= 0 ? 'text-success' : 'text-destructive';
  const getChangeBadge = (change: number, changePercent: number) => (
    <Badge variant={change >= 0 ? 'default' : 'destructive'} className="text-xs">
      {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
      {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
    </Badge>
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {indices.map((index, i) => (
          <motion.div
            key={index.symbol}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={controls}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Card className="glass-panel hover:glow-primary transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">{index.symbol}</span>
                  {refreshing && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
                </div>
                <div className="text-xl font-bold mb-1">
                  ₹{index.ltp.toLocaleString('en-IN')}
                </div>
                <div className={`flex items-center text-sm ${getChangeColor(index.change)}`}>
                  {index.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </div>
                <div className="text-xs text-muted-foreground mt-1">Vol: {index.volume}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {/* F&O Metrics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={controls}
          whileHover={{ scale: 1.02 }}
          className="relative"
        >
          <Card className="glass-panel hover:glow-primary transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-medium">F&O</span>
                {refreshing && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium">VIX: {marketMetrics.vix.value}</div>
                  <div className={`text-xs ${getChangeColor(marketMetrics.vix.change)}`}>
                    {marketMetrics.vix.change >= 0 ? '+' : ''}{marketMetrics.vix.change.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">PCR: {marketMetrics.pcr.value}</div>
                  <div className={`text-xs ${getChangeColor(marketMetrics.pcr.change)}`}>
                    {marketMetrics.pcr.change >= 0 ? '+' : ''}{marketMetrics.pcr.change.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers / Losers */}
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
                {gainers.slice(0, 3).map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">₹{stock.ltp.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-success font-medium">+{stock.changePercent.toFixed(2)}%</div>
                      <div className="w-16 h-4 bg-success/20 rounded overflow-hidden">
                        <div className="h-full bg-success rounded" style={{width: `${Math.min(stock.changePercent * 10, 100)}%`}}></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                {losers.slice(0, 3).map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">₹{stock.ltp.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-destructive font-medium">{stock.changePercent.toFixed(2)}%</div>
                      <div className="w-16 h-4 bg-destructive/20 rounded overflow-hidden">
                        <div className="h-full bg-destructive rounded" style={{width: `${Math.min(Math.abs(stock.changePercent) * 10, 100)}%`}}></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Option Chain Analytics */}
        <div>
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>NIFTY Options</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Expand className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Max Pain</div>
                  <div className="text-lg font-bold text-primary">19650</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Call OI</div>
                  <div className="text-lg font-bold">12.45%</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { strike: 19600, callOI: 60, putOI: 40 },
                  { strike: 19650, callOI: 80, putOI: 65 },
                  { strike: 19700, callOI: 45, putOI: 85 }
                ].map((option, i) => (
                  <motion.div
                    key={option.strike}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/20"
                  >
                    <span className="text-sm font-medium">{option.strike}</span>
                    <div className="flex space-x-2">
                      <div className="w-8 h-2 bg-success/30 rounded">
                        <motion.div 
                          className="h-full bg-success rounded"
                          initial={{ width: 0 }}
                          animate={{ width: `${option.callOI}%` }}
                          transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                        />
                      </div>
                      <div className="w-8 h-2 bg-destructive/30 rounded">
                        <motion.div 
                          className="h-full bg-destructive rounded"
                          initial={{ width: 0 }}
                          animate={{ width: `${option.putOI}%` }}
                          transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button size="sm" className="w-full hover:glow-primary">
                Deploy Strategy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Row - Most Active & Sector Performance */}
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
              {mostActive.map((stock, i) => (
                <motion.div
                  key={stock.symbol}
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
                    <div className="font-bold">₹{stock.ltp.toFixed(2)}</div>
                    <div className={`text-sm ${getChangeColor(stock.change)}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-primary" />
                <span>Sector Performance</span>
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Expand className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectors.map((sector, i) => (
                <motion.div
                  key={sector.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{sector.name}</div>
                    {Math.abs(sector.changePercent) > 1.5 && (
                      <Badge variant="outline" className="text-xs">Trending</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-medium ${getChangeColor(sector.change)}`}>
                      {sector.change >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
                    </div>
                    <div className="w-16 h-2 bg-muted rounded overflow-hidden">
                      <div 
                        className={`h-full rounded ${sector.change >= 0 ? 'bg-success' : 'bg-destructive'}`}
                        style={{width: `${Math.min(Math.abs(sector.changePercent) * 30, 100)}%`}}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News & Events Feed */}
      <Card className="glass-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span>News & Events</span>
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
                { tag: '📈', type: 'Earnings', headline: 'RELIANCE Q4 results beat estimates', time: '2 mins ago', source: 'ET' },
                { tag: '📰', type: 'Macro', headline: 'RBI holds repo rate at 6.5%', time: '15 mins ago', source: 'Mint' },
                { tag: '📊', type: 'Dividend', headline: 'TCS announces Rs 22 dividend', time: '1 hour ago', source: 'MC' }
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
  );
};

export default Market;