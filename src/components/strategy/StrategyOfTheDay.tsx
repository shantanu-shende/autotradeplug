import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Play,
  BarChart3,
  TestTube
} from 'lucide-react';

interface StrategyCard {
  id: string;
  name: string;
  description: string;
  pnl: number;
  winRate: number;
  popularity: number;
  activeUsers: number;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
  assetClass: string;
  setupLogic: string;
  entryRules: string[];
  exitRules: string[];
  backtestResults: {
    totalTrades: number;
    winRate: number;
    avgPnl: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

const mockStrategies: StrategyCard[] = [
  {
    id: '1',
    name: 'Iron Condor Weekly',
    description: 'Low-risk weekly iron condor strategy targeting premium decay',
    pnl: 15.2,
    winRate: 78.5,
    popularity: 92,
    activeUsers: 1247,
    tags: ['Iron Condor', 'Weekly', 'Premium Selling'],
    riskLevel: 'low',
    assetClass: 'Options',
    setupLogic: 'Sell OTM call and put spreads when IV > 25th percentile',
    entryRules: [
      'Market trending sideways for 3+ days',
      'VIX below 20',
      'Minimum 7 DTE',
      'Delta range: 15-20 for short strikes'
    ],
    exitRules: [
      'Close at 50% max profit',
      'Stop loss at 200% of premium received',
      'Close 1 DTE if losing position'
    ],
    backtestResults: {
      totalTrades: 156,
      winRate: 78.5,
      avgPnl: 245.80,
      maxDrawdown: -2.8,
      sharpeRatio: 1.42
    }
  },
  {
    id: '2',
    name: 'Momentum Breakout',
    description: 'High-frequency momentum strategy for trending markets',
    pnl: 28.7,
    winRate: 65.2,
    popularity: 85,
    activeUsers: 934,
    tags: ['Momentum', 'Breakout', 'High Frequency'],
    riskLevel: 'high',
    assetClass: 'Futures',
    setupLogic: 'Enter long on breakout above 20-day high with volume confirmation',
    entryRules: [
      'Price breaks 20-day high',
      'Volume > 1.5x average',
      'RSI < 80',
      'No major resistance nearby'
    ],
    exitRules: [
      'Trail stop at 2 ATR',
      'Take profit at 1:3 R:R',
      'Exit if volume dries up'
    ],
    backtestResults: {
      totalTrades: 89,
      winRate: 65.2,
      avgPnl: 580.40,
      maxDrawdown: -5.2,
      sharpeRatio: 1.18
    }
  },
  {
    id: '3',
    name: 'Mean Reversion Pairs',
    description: 'Statistical arbitrage using sector pair correlation',
    pnl: 12.4,
    winRate: 72.1,
    popularity: 76,
    activeUsers: 567,
    tags: ['Mean Reversion', 'Pairs Trading', 'Statistical Arbitrage'],
    riskLevel: 'medium',
    assetClass: 'Equities',
    setupLogic: 'Trade divergence between correlated stock pairs',
    entryRules: [
      'Correlation > 0.8 over 60 days',
      'Z-score > 2.0',
      'Both stocks liquid',
      'No earnings within 2 weeks'
    ],
    exitRules: [
      'Close when z-score < 0.5',
      'Stop loss at z-score > 3.5',
      'Maximum hold period: 10 days'
    ],
    backtestResults: {
      totalTrades: 234,
      winRate: 72.1,
      avgPnl: 120.90,
      maxDrawdown: -1.8,
      sharpeRatio: 1.65
    }
  }
];

const StrategyOfTheDay: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyCard | null>(null);

  const currentStrategy = mockStrategies[currentIndex];

  const nextStrategy = () => {
    setCurrentIndex((prev) => (prev + 1) % mockStrategies.length);
  };

  const prevStrategy = () => {
    setCurrentIndex((prev) => (prev - 1 + mockStrategies.length) % mockStrategies.length);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return <Badge variant="outline" className="text-success border-success">Low Risk</Badge>;
      case 'high': return <Badge variant="outline" className="text-destructive border-destructive">High Risk</Badge>;
      default: return <Badge variant="outline" className="text-warning border-warning">Medium Risk</Badge>;
    }
  };

  return (
    <>
      <Card className="glass-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Strategy of the Day</CardTitle>
              <p className="text-muted-foreground">Top recommended strategies by our AI</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={prevStrategy}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} / {mockStrategies.length}
              </div>
              <Button variant="ghost" size="sm" onClick={nextStrategy}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{currentStrategy.name}</h3>
                <p className="text-muted-foreground text-sm">{currentStrategy.description}</p>
              </div>
              {getRiskBadge(currentStrategy.riskLevel)}
            </div>

            <div className="flex flex-wrap gap-2">
              {currentStrategy.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {currentStrategy.pnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                  )}
                  <span className={`font-semibold ${
                    currentStrategy.pnl >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {currentStrategy.pnl >= 0 ? '+' : ''}{currentStrategy.pnl}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">P&L</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-primary mr-1" />
                  <span className="font-semibold">{currentStrategy.winRate}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="h-4 w-4 text-warning mr-1" />
                  <span className="font-semibold">{currentStrategy.popularity}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Popularity</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-primary mr-1" />
                  <span className="font-semibold">{currentStrategy.activeUsers.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setSelectedStrategy(currentStrategy)}
              >
                <Play className="h-4 w-4 mr-1" />
                Simulate
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-1" />
                Backtest
              </Button>
              <Button size="sm" className="flex-1">
                <TestTube className="h-4 w-4 mr-1" />
                Deploy
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Strategy Preview Modal */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStrategy?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedStrategy && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Setup Logic</h4>
                <p className="text-muted-foreground">{selectedStrategy.setupLogic}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Entry Rules</h4>
                  <ul className="space-y-1">
                    {selectedStrategy.entryRules.map((rule, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-2 h-2 bg-success rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Exit Rules</h4>
                  <ul className="space-y-1">
                    {selectedStrategy.exitRules.map((rule, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-2 h-2 bg-destructive rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Backtest Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold">{selectedStrategy.backtestResults.totalTrades}</div>
                    <div className="text-xs text-muted-foreground">Total Trades</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-success">
                      {selectedStrategy.backtestResults.winRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-primary">
                      ₹{selectedStrategy.backtestResults.avgPnl}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg P&L</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-destructive">
                      {selectedStrategy.backtestResults.maxDrawdown}%
                    </div>
                    <div className="text-xs text-muted-foreground">Max DD</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold">{selectedStrategy.backtestResults.sharpeRatio}</div>
                    <div className="text-xs text-muted-foreground">Sharpe</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button className="flex-1">
                  <TestTube className="h-4 w-4 mr-2" />
                  Try This Strategy
                </Button>
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full Backtest
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StrategyOfTheDay;