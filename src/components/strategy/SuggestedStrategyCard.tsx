import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Target, Play, TestTube, Rocket, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface StrategyData {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  rewardPotential: number;
  winRate: number;
  idealCondition: string;
  tags: string[];
  performanceData: Array<{ day: number; value: number }>;
  backtest: {
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

// Mock suggested strategy data
const mockSuggestedStrategy: StrategyData = {
  id: 'momentum-breakout-v2',
  name: 'Momentum Breakout Pro',
  description: 'Advanced momentum strategy that identifies high-probability breakouts with volume confirmation and trend analysis.',
  riskLevel: 'medium',
  rewardPotential: 85,
  winRate: 68.5,
  idealCondition: 'Trending markets with high volatility',
  tags: ['Momentum', 'Breakout', 'Volume Analysis', 'Trending'],
  performanceData: [
    { day: 1, value: 100 },
    { day: 2, value: 102.5 },
    { day: 3, value: 98.8 },
    { day: 4, value: 105.2 },
    { day: 5, value: 109.8 },
    { day: 6, value: 107.3 },
    { day: 7, value: 112.5 },
    { day: 8, value: 115.8 },
    { day: 9, value: 113.2 },
    { day: 10, value: 118.9 },
    { day: 11, value: 121.5 },
    { day: 12, value: 119.8 },
    { day: 13, value: 124.2 },
    { day: 14, value: 127.8 },
  ],
  backtest: {
    totalReturn: 27.8,
    maxDrawdown: -8.5,
    sharpeRatio: 1.85,
  },
};

const SuggestedStrategyCard = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const strategy = mockSuggestedStrategy;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAction = (action: string) => {
    setIsAnimating(true);
    console.log(`${action} action triggered for strategy:`, strategy.name);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Strategy of the Day</CardTitle>
              <p className="text-sm text-muted-foreground">AI-recommended based on market conditions</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Zap className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{strategy.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{strategy.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-green-600">{strategy.winRate}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">{strategy.backtest.totalReturn}%</div>
                <div className="text-xs text-muted-foreground">Total Return</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-blue-600">{strategy.backtest.sharpeRatio}</div>
                <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-red-600">{strategy.backtest.maxDrawdown}%</div>
                <div className="text-xs text-muted-foreground">Max Drawdown</div>
              </div>
            </div>

            {/* Strategy Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level</span>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {strategy.riskLevel.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reward Potential</span>
                  <span className="text-sm font-semibold">{strategy.rewardPotential}%</span>
                </div>
                <Progress value={strategy.rewardPotential} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Ideal Market Condition</span>
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  {strategy.idealCondition}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Strategy Tags</span>
                <div className="flex flex-wrap gap-2">
                  {strategy.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart & Actions */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                14-Day Backtest Performance
              </h4>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strategy.performanceData}>
                    <XAxis 
                      dataKey="day" 
                      hide 
                    />
                    <YAxis hide />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      strokeLinecap="round"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Day 1</span>
                <span className="text-green-600 font-medium">+{strategy.backtest.totalReturn}%</span>
                <span>Day 14</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.div
                animate={isAnimating ? { scale: 0.95 } : { scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                <Button 
                  className="w-full" 
                  onClick={() => handleAction('Deploy')}
                  disabled={isAnimating}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Strategy
                </Button>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction('Backtest')}
                  disabled={isAnimating}
                >
                  <TestTube className="w-4 h-4 mr-1" />
                  Backtest
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction('Simulate')}
                  disabled={isAnimating}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Simulate
                </Button>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => handleAction('View Details')}
              >
                <Target className="w-3 h-3 mr-1" />
                View Full Strategy Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedStrategyCard;