import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TestTube, 
  Play, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface StrategyData {
  id: string;
  name: string;
  description: string;
  accuracy: string;
  live_users: number;
  category: string;
  logic: any;
  risk_level: 'Low' | 'Medium' | 'High';
  timeframe: string;
  is_predefined: boolean;
}

interface StrategyTestModalProps {
  strategy: StrategyData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BacktestResult {
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  startBalance: number;
  endBalance: number;
}

export const StrategyTestModal = ({ strategy, open, onOpenChange }: StrategyTestModalProps) => {
  const [testParams, setTestParams] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialBalance: 10000,
    symbol: 'AAPL'
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<BacktestResult | null>(null);
  const { toast } = useToast();

  if (!strategy) return null;

  const handleRunTest = async () => {
    setTesting(true);
    
    // Simulate backtest processing
    setTimeout(() => {
      // Mock results - in real implementation, this would call the backend
      const mockResult: BacktestResult = {
        totalTrades: Math.floor(Math.random() * 100) + 50,
        winRate: Math.random() * 30 + 60, // 60-90%
        totalReturn: Math.random() * 50 + 10, // 10-60%
        maxDrawdown: Math.random() * 15 + 5, // 5-20%
        sharpeRatio: Math.random() * 2 + 1, // 1-3
        startBalance: testParams.initialBalance,
        endBalance: testParams.initialBalance * (1 + (Math.random() * 50 + 10) / 100)
      };
      
      setTestResult(mockResult);
      setTesting(false);
      
      toast({
        title: 'Backtest Complete',
        description: `Strategy tested successfully on ${testParams.symbol}`,
      });
    }, 3000);
  };

  const resetTest = () => {
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <TestTube className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl text-gradient">Test Strategy: {strategy?.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {!testResult ? (
            <>
              {/* Test Parameters */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Backtest Parameters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        value={testParams.symbol}
                        onChange={(e) => setTestParams(prev => ({ ...prev, symbol: e.target.value }))}
                        placeholder="AAPL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="balance">Initial Balance ($)</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={testParams.initialBalance}
                        onChange={(e) => setTestParams(prev => ({ ...prev, initialBalance: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={testParams.startDate}
                        onChange={(e) => setTestParams(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={testParams.endDate}
                        onChange={(e) => setTestParams(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">About Backtesting</h4>
                        <p className="text-sm text-muted-foreground">
                          Backtesting runs the strategy against historical data to simulate how it would have performed. 
                          Results are for educational purposes and past performance does not guarantee future results.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Info */}
              <Card className="glass-panel">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{strategy.timeframe}</div>
                      <p className="text-xs text-muted-foreground">Timeframe</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{strategy.risk_level}</div>
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{strategy.category}</div>
                      <p className="text-xs text-muted-foreground">Category</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Test Results */
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-panel">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-500">
                      +{testResult.totalReturn.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Total Return</p>
                  </CardContent>
                </Card>

                <Card className="glass-panel">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{testResult.winRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </CardContent>
                </Card>

                <Card className="glass-panel">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{testResult.totalTrades}</div>
                    <p className="text-xs text-muted-foreground">Total Trades</p>
                  </CardContent>
                </Card>

                <Card className="glass-panel">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-500">
                      -{testResult.maxDrawdown.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Max Drawdown</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Starting Balance</span>
                      <span className="font-semibold">${testResult.startBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Ending Balance</span>
                      <span className="font-semibold text-green-500">${testResult.endBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Sharpe Ratio</span>
                      <span className="font-semibold">{testResult.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Test Period</span>
                      <span className="font-semibold">{testParams.startDate} to {testParams.endDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-green-500/10 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-1">Backtest Complete</h4>
                    <p className="text-sm text-muted-foreground">
                      The strategy showed positive results during the test period. Consider deploying with proper risk management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {testResult && (
                <Button variant="outline" onClick={resetTest}>
                  Run New Test
                </Button>
              )}
            </div>
            
            <div className="space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              
              {!testResult ? (
                <Button
                  onClick={handleRunTest}
                  disabled={testing}
                  className="bg-gradient-primary"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Backtest
                    </>
                  )}
                </Button>
              ) : (
                <Button className="bg-gradient-primary">
                  Deploy Strategy
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};