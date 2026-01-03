import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Calendar,
  Target,
  Activity,
  DollarSign,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Area, 
  AreaChart,
  ReferenceDot
} from 'recharts';

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
  totalReturn: number;
  startDate: string;
  endDate: string;
  equityCurve: { date: string; value: number; pnl: number }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.pnl >= 0;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          ₹{data.value.toLocaleString()}
        </p>
        <p className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}₹{data.pnl.toLocaleString()} P&L
        </p>
      </div>
    );
  }
  return null;
};

const BacktestCards = () => {
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Mock backtest data with more data points for smoother curves
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
      totalReturn: 102500,
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      equityCurve: [
        { date: 'Dec 1', value: 100000, pnl: 0 },
        { date: 'Dec 3', value: 101200, pnl: 1200 },
        { date: 'Dec 5', value: 102500, pnl: 2500 },
        { date: 'Dec 7', value: 104100, pnl: 4100 },
        { date: 'Dec 9', value: 103800, pnl: 3800 },
        { date: 'Dec 11', value: 106500, pnl: 6500 },
        { date: 'Dec 13', value: 108200, pnl: 8200 },
        { date: 'Dec 15', value: 107200, pnl: 7200 },
        { date: 'Dec 17', value: 110500, pnl: 10500 },
        { date: 'Dec 19', value: 113800, pnl: 13800 },
        { date: 'Dec 21', value: 115200, pnl: 15200 },
        { date: 'Dec 23', value: 118500, pnl: 18500 },
        { date: 'Dec 25', value: 121800, pnl: 21800 },
        { date: 'Dec 27', value: 125200, pnl: 25200 },
        { date: 'Dec 29', value: 130500, pnl: 30500 },
        { date: 'Dec 31', value: 136250, pnl: 36250 },
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
      totalReturn: 58500,
      startDate: '2024-01-01',
      endDate: '2024-01-15',
      equityCurve: [
        { date: 'Jan 1', value: 100000, pnl: 0 },
        { date: 'Jan 3', value: 101200, pnl: 1200 },
        { date: 'Jan 5', value: 103500, pnl: 3500 },
        { date: 'Jan 7', value: 102100, pnl: 2100 },
        { date: 'Jan 9', value: 98300, pnl: -1700 },
        { date: 'Jan 11', value: 102800, pnl: 2800 },
        { date: 'Jan 13', value: 108500, pnl: 8500 },
        { date: 'Jan 15', value: 116020, pnl: 16020 },
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
      totalReturn: 75200,
      startDate: '2024-01-08',
      endDate: '2024-01-15',
      equityCurve: [
        { date: 'Jan 8', value: 100000, pnl: 0 },
        { date: 'Jan 9', value: 95500, pnl: -4500 },
        { date: 'Jan 10', value: 108200, pnl: 8200 },
        { date: 'Jan 11', value: 87200, pnl: -12800 },
        { date: 'Jan 12', value: 98500, pnl: -1500 },
        { date: 'Jan 13', value: 115800, pnl: 15800 },
        { date: 'Jan 14', value: 120200, pnl: 20200 },
        { date: 'Jan 15', value: 125800, pnl: 25800 },
      ]
    },
    {
      id: '4',
      strategy: 'Butterfly Spread',
      symbol: 'SENSEX',
      duration: '21D',
      winRate: 78,
      avgPnL: 1820,
      maxDrawdown: -4200,
      sharpeRatio: 2.15,
      totalTrades: 14,
      profitLoss: 25480,
      totalReturn: 85600,
      startDate: '2024-01-01',
      endDate: '2024-01-21',
      equityCurve: [
        { date: 'Jan 1', value: 100000, pnl: 0 },
        { date: 'Jan 4', value: 102800, pnl: 2800 },
        { date: 'Jan 7', value: 105200, pnl: 5200 },
        { date: 'Jan 10', value: 108500, pnl: 8500 },
        { date: 'Jan 13', value: 112200, pnl: 12200 },
        { date: 'Jan 16', value: 118500, pnl: 18500 },
        { date: 'Jan 19', value: 122800, pnl: 22800 },
        { date: 'Jan 21', value: 125480, pnl: 25480 },
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

  const isPositiveTrend = (curve: { value: number }[]) => {
    if (curve.length < 2) return true;
    return curve[curve.length - 1].value > curve[0].value;
  };

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recent Backtests</h2>
          <Button className="bg-primary hover:bg-primary/90">
            <BarChart3 className="w-4 h-4 mr-2" />
            New Backtest
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {backtestResults.map((backtest, i) => {
            const isPositive = isPositiveTrend(backtest.equityCurve);
            const chartColor = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
            
            return (
              <motion.div
                key={backtest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="h-full"
              >
                <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {backtest.strategy}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {backtest.duration}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-muted/50 border-border text-foreground font-medium px-3 py-1"
                      >
                        {backtest.symbol}
                      </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Win Rate</div>
                        <div className={`text-xl font-bold ${getWinRateColor(backtest.winRate)}`}>
                          {backtest.winRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Avg P&L</div>
                        <div className={`text-xl font-bold ${getPnLColor(backtest.avgPnL)}`}>
                          ₹{backtest.avgPnL.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Total P&L Row */}
                    <div className="flex items-center justify-between py-2 border-t border-border/30 mb-3">
                      <span className="text-sm text-muted-foreground">Total P&L</span>
                      <span className={`text-base font-semibold ${getPnLColor(backtest.profitLoss)}`}>
                        {backtest.profitLoss >= 0 ? '+' : ''}₹{backtest.profitLoss.toLocaleString()}
                      </span>
                    </div>

                    {/* Secondary Stats */}
                    <div className="flex items-center justify-between text-xs mb-4">
                      <div>
                        <span className="text-muted-foreground">Max DD: </span>
                        <span className="text-destructive font-medium">
                          ₹{Math.abs(backtest.maxDrawdown).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sharpe: </span>
                        <span className="text-foreground font-medium">{backtest.sharpeRatio}</span>
                      </div>
                    </div>

                    {/* Interactive Equity Curve */}
                    <div className="flex-1 min-h-[100px] mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={backtest.equityCurve}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id={`gradient-${backtest.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop 
                                offset="0%" 
                                stopColor={chartColor} 
                                stopOpacity={0.3} 
                              />
                              <stop 
                                offset="100%" 
                                stopColor={chartColor} 
                                stopOpacity={0.05} 
                              />
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            content={<CustomChartTooltip />}
                            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartColor}
                            strokeWidth={2}
                            fill={`url(#gradient-${backtest.id})`}
                            dot={(props) => {
                              const { cx, cy, index } = props;
                              return (
                                <circle
                                  key={index}
                                  cx={cx}
                                  cy={cy}
                                  r={4}
                                  fill={chartColor}
                                  stroke="hsl(var(--card))"
                                  strokeWidth={2}
                                  className="cursor-pointer transition-all duration-150 hover:r-6"
                                />
                              );
                            }}
                            activeDot={{
                              r: 6,
                              fill: chartColor,
                              stroke: 'hsl(var(--card))',
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Total Return Badge */}
                    <div className="flex justify-center mb-4">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full border ${
                        isPositive 
                          ? 'border-success/30 bg-success/10 text-success' 
                          : 'border-destructive/30 bg-destructive/10 text-destructive'
                      }`}>
                        <ArrowUpRight className={`w-4 h-4 mr-1.5 ${!isPositive ? 'rotate-90' : ''}`} />
                        <span className="font-semibold">
                          ₹{backtest.totalReturn.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* View Report Button */}
                    <Button 
                      variant="outline" 
                      className="w-full bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30"
                      onClick={() => handleViewReport(backtest)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Full Report
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Backtest Report Modal */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Backtest Report: {selectedBacktest?.strategy}</span>
              {selectedBacktest && (
                <Badge variant="outline" className="ml-2">{selectedBacktest.symbol}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBacktest && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-muted/30 border-border/30">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
                    <div className={`text-xl font-bold ${getPnLColor(selectedBacktest.profitLoss)}`}>
                      ₹{selectedBacktest.profitLoss.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border/30">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                    <div className={`text-xl font-bold ${getWinRateColor(selectedBacktest.winRate)}`}>
                      {selectedBacktest.winRate}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border/30">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-destructive" />
                    <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
                    <div className="text-xl font-bold text-destructive">
                      ₹{Math.abs(selectedBacktest.maxDrawdown).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border/30">
                  <CardContent className="p-4 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Sharpe Ratio</div>
                    <div className="text-xl font-bold text-foreground">
                      {selectedBacktest.sharpeRatio}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Large Equity Curve */}
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={selectedBacktest.equityCurve}
                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      >
                        <defs>
                          <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--success))"
                          strokeWidth={2.5}
                          fill="url(#reportGradient)"
                          dot={{
                            fill: 'hsl(var(--success))',
                            stroke: 'hsl(var(--card))',
                            strokeWidth: 2,
                            r: 5,
                          }}
                          activeDot={{
                            r: 8,
                            fill: 'hsl(var(--success))',
                            stroke: 'hsl(var(--card))',
                            strokeWidth: 3,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/20 border-border/30">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold mb-4">Trade Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Trades</span>
                        <span className="font-semibold">{selectedBacktest.totalTrades}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Winning Trades</span>
                        <span className="font-semibold text-success">
                          {Math.round(selectedBacktest.totalTrades * selectedBacktest.winRate / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Losing Trades</span>
                        <span className="font-semibold text-destructive">
                          {selectedBacktest.totalTrades - Math.round(selectedBacktest.totalTrades * selectedBacktest.winRate / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Avg P&L per Trade</span>
                        <span className={`font-semibold ${getPnLColor(selectedBacktest.avgPnL)}`}>
                          ₹{selectedBacktest.avgPnL.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/30">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold mb-4">Risk Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Max Drawdown</span>
                        <span className="font-semibold text-destructive">
                          ₹{Math.abs(selectedBacktest.maxDrawdown).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sharpe Ratio</span>
                        <span className="font-semibold">{selectedBacktest.sharpeRatio}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Return %</span>
                        <span className={`font-semibold ${getPnLColor(selectedBacktest.profitLoss)}`}>
                          {(selectedBacktest.profitLoss / 100000 * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Risk-Reward Ratio</span>
                        <span className="font-semibold">1:2.4</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/30">
                <Button variant="outline" className="border-border/50">
                  Export PDF
                </Button>
                <Button variant="outline" className="border-border/50">
                  Export CSV
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
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
