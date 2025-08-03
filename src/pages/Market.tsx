import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';

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
      {/* Top Metrics Snapshot */}
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Market Snapshot</CardTitle>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {indices.map((index, i) => (
              <motion.div
                key={index.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-sm text-muted-foreground">{index.symbol}</div>
                <div className="text-lg font-bold">₹{index.ltp.toFixed(2)}</div>
                <div className={`text-sm ${getChangeColor(index.change)}`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </div>
              </motion.div>
            ))}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">VIX</div>
              <div className="text-lg font-bold">{marketMetrics.vix.value}</div>
              <div className={getChangeColor(marketMetrics.vix.change)}>
                {marketMetrics.vix.change >= 0 ? '+' : ''}{marketMetrics.vix.change.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">PCR</div>
              <div className="text-lg font-bold">{marketMetrics.pcr.value}</div>
              <div className={getChangeColor(marketMetrics.pcr.change)}>
                {marketMetrics.pcr.change >= 0 ? '+' : ''}{marketMetrics.pcr.change.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview Tabs */}
        <div className="lg:col-span-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="gainers" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                  <TabsTrigger value="losers">Top Losers</TabsTrigger>
                  <TabsTrigger value="active">Most Active</TabsTrigger>
                  <TabsTrigger value="sectors">Sectors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="gainers" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {gainers.map((stock, i) => (
                        <motion.div
                          key={stock.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₹{stock.ltp.toFixed(2)}</div>
                            {getChangeBadge(stock.change, stock.changePercent)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="losers" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {losers.map((stock, i) => (
                        <motion.div
                          key={stock.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₹{stock.ltp.toFixed(2)}</div>
                            {getChangeBadge(stock.change, stock.changePercent)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="active" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {mostActive.map((stock, i) => (
                        <motion.div
                          key={stock.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₹{stock.ltp.toFixed(2)}</div>
                            {getChangeBadge(stock.change, stock.changePercent)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="sectors" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {sectors.map((sector, i) => (
                        <motion.div
                          key={sector.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <PieChart className="w-5 h-5 text-primary" />
                            <div className="font-medium">{sector.name}</div>
                          </div>
                          <div className="text-right">
                            {getChangeBadge(sector.change, sector.changePercent)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Live Alerts */}
        <div>
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Live Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{alert.symbol}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {alert.message}
                          </div>
                        </div>
                        <Badge variant="outline" className={`ml-2 ${getImpactColor(alert.impact)}`}>
                          {alert.impact}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {alert.timestamp}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Option Chain Analytics */}
      <Card className="glass-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Option Chain Analytics</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIFTY">NIFTY</SelectItem>
                  <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01-25">25 Jan 2024</SelectItem>
                  <SelectItem value="2024-02-01">01 Feb 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Max Pain</div>
                <div className="text-lg font-bold text-primary">19650</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">PCR (OI)</div>
                <div className="text-lg font-bold">0.85</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Call OI</div>
                <div className="text-lg font-bold">2.5Cr</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Put OI</div>
                <div className="text-lg font-bold">2.1Cr</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Strike</th>
                    <th className="text-right p-2">Call OI</th>
                    <th className="text-right p-2">Put OI</th>
                    <th className="text-right p-2">Call IV</th>
                    <th className="text-right p-2">Put IV</th>
                    <th className="text-right p-2">Delta</th>
                    <th className="text-right p-2">Theta</th>
                    <th className="text-right p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {optionChain.map((option, i) => (
                    <motion.tr
                      key={option.strike}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-2 font-medium">{option.strike}</td>
                      <td className="p-2 text-right">{(option.call_oi / 100000).toFixed(1)}L</td>
                      <td className="p-2 text-right">{(option.put_oi / 100000).toFixed(1)}L</td>
                      <td className="p-2 text-right">{option.call_iv.toFixed(1)}%</td>
                      <td className="p-2 text-right">{option.put_iv.toFixed(1)}%</td>
                      <td className="p-2 text-right">{option.delta.toFixed(2)}</td>
                      <td className="p-2 text-right">{option.theta.toFixed(1)}</td>
                      <td className="p-2 text-right">
                        <Button size="sm" variant="outline">
                          Deploy
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Market;