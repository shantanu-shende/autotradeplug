import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  FileText, 
  Calendar,
  Target,
  Activity,
  DollarSign
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface BacktestResult {
  id: string;
  strategy: string;
  symbol: string;
  duration: string;
  winRate: number;
  avgPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  profitLoss: number;
  startDate: string;
  endDate: string;
  equityCurve: { date: string; value: number }[];
}

const BacktestCards = () => {
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Mock backtest data
  const backtestResults: BacktestResult[] = [
    {
      id: '1',
      strategy: 'Bull Put Spread',
      symbol: 'NIFTY',
      duration: '30D',
      winRate: 72,
      avgPnL: 1450,
      maxDrawdown: -8500,
      sharpeRatio: 1.85,
      totalTrades: 25,
      profitLoss: 36250,
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      equityCurve: [
        { date: '2023-12-01', value: 100000 },
        { date: '2023-12-05', value: 102500 },
        { date: '2023-12-10', value: 105800 },
        { date: '2023-12-15', value: 107200 },
        { date: '2023-12-20', value: 104500 },
        { date: '2023-12-25', value: 111800 },
        { date: '2023-12-31', value: 136250 },
      ]
    },
    {
      id: '2',
      strategy: 'Iron Condor',
      symbol: 'BANKNIFTY',
      duration: '15D',
      winRate: 68,
      avgPnL: 890,
      maxDrawdown: -5200,
      sharpeRatio: 1.62,
      totalTrades: 18,
      profitLoss: 16020,
      startDate: '2024-01-01',
      endDate: '2024-01-15',
      equityCurve: [
        { date: '2024-01-01', value: 100000 },
        { date: '2024-01-03', value: 101200 },
        { date: '2024-01-06', value: 103500 },
        { date: '2024-01-09', value: 98300 },
        { date: '2024-01-12', value: 105800 },
        { date: '2024-01-15', value: 116020 },
      ]
    },
    {
      id: '3',
      strategy: 'Straddle',
      symbol: 'NIFTY',
      duration: '7D',
      winRate: 45,
      avgPnL: 2150,
      maxDrawdown: -12800,
      sharpeRatio: 0.95,
      totalTrades: 12,
      profitLoss: 25800,
      startDate: '2024-01-08',
      endDate: '2024-01-15',
      equityCurve: [
        { date: '2024-01-08', value: 100000 },
        { date: '2024-01-09', value: 95500 },
        { date: '2024-01-10', value: 108200 },
        { date: '2024-01-11', value: 87200 },
        { date: '2024-01-12', value: 115800 },
        { date: '2024-01-15', value: 125800 },
      ]
    },
  ];

  const handleViewReport = (backtest: BacktestResult) => {
    setSelectedBacktest(backtest);
    setIsReportOpen(true);
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-success';
    if (winRate >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getPnLColor = (pnl: number) => pnl >= 0 ? 'text-success' : 'text-destructive';

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Backtests</h2>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            New Backtest
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backtestResults.map((backtest, i) => (
            <motion.div
              key={backtest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-panel hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{backtest.strategy}</CardTitle>
                    <Badge variant="outline">{backtest.symbol}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {backtest.duration}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className={`text-lg font-bold ${getWinRateColor(backtest.winRate)}`}>
                        {backtest.winRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg P&L</div>
                      <div className={`text-lg font-bold ${getPnLColor(backtest.avgPnL)}`}>
                        ₹{backtest.avgPnL.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total P&L</span>
                      <span className={`font-medium ${getPnLColor(backtest.profitLoss)}`}>
                        {backtest.profitLoss >= 0 ? '+' : ''}₹{backtest.profitLoss.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(Math.abs(backtest.profitLoss) / 50000 * 100, 100)} 
                      className="mt-1" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Max DD:</span>
                      <span className="ml-1 text-destructive">₹{backtest.maxDrawdown.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sharpe:</span>
                      <span className="ml-1">{backtest.sharpeRatio}</span>
                    </div>
                  </div>

                  {/* Mini equity curve on hover */}
                  <div className="h-16 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={backtest.equityCurve}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewReport(backtest)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Backtest Report Modal */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Backtest Report: {selectedBacktest?.strategy}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedBacktest && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                    <div className={`text-xl font-bold ${getPnLColor(selectedBacktest.profitLoss)}`}>
                      ₹{selectedBacktest.profitLoss.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className={`text-xl font-bold ${getWinRateColor(selectedBacktest.winRate)}`}>
                      {selectedBacktest.winRate}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-destructive" />
                    <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    <div className="text-xl font-bold text-destructive">
                      ₹{selectedBacktest.maxDrawdown.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                    <div className="text-xl font-bold">
                      {selectedBacktest.sharpeRatio}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Equity Curve */}
              <Card>
                <CardHeader>
                  <CardTitle>Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedBacktest.equityCurve}>
                        <XAxis dataKey="date" />
                        <YAxis 
                          domain={['dataMin - 5000', 'dataMax + 5000']}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trade Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">{selectedBacktest.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Winning Trades:</span>
                      <span className="font-medium text-success">
                        {Math.round(selectedBacktest.totalTrades * selectedBacktest.winRate / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Losing Trades:</span>
                      <span className="font-medium text-destructive">
                        {selectedBacktest.totalTrades - Math.round(selectedBacktest.totalTrades * selectedBacktest.winRate / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average P&L per Trade:</span>
                      <span className={`font-medium ${getPnLColor(selectedBacktest.avgPnL)}`}>
                        ₹{selectedBacktest.avgPnL.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Max Drawdown:</span>
                      <span className="font-medium text-destructive">
                        ₹{selectedBacktest.maxDrawdown.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio:</span>
                      <span className="font-medium">{selectedBacktest.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return %:</span>
                      <span className={`font-medium ${getPnLColor(selectedBacktest.profitLoss)}`}>
                        {(selectedBacktest.profitLoss / 100000 * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk-Reward Ratio:</span>
                      <span className="font-medium">1:2.4</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline">
                  Export PDF
                </Button>
                <Button variant="outline">
                  Export CSV
                </Button>
                <Button>
                  Deploy Strategy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BacktestCards;