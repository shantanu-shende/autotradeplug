import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  Rocket, 
  TestTube, 
  Users, 
  TrendingUp, 
  BarChart3,
  Activity,
  Target
} from 'lucide-react';

interface StrategyLogic {
  entry: {
    indicator: string;
    condition: string;
    value: number;
  };
  confirmation?: {
    indicator: string;
    condition: string;
    value: number;
  };
  action: string;
  sl: number;
  tp: number;
}

interface StrategyCardData {
  id: string;
  name: string;
  description: string;
  accuracy: string;
  live_users: number;
  category: string;
  logic: StrategyLogic;
  risk_level: 'Low' | 'Medium' | 'High';
  timeframe: string;
  is_predefined: boolean;
}

interface StrategyCardProps {
  strategy: StrategyCardData;
  onInfo: (strategy: StrategyCardData) => void;
  onDeploy: (strategy: StrategyCardData) => void;
  onTest: (strategy: StrategyCardData) => void;
}

export const StrategyCard = ({ strategy, onInfo, onDeploy, onTest }: StrategyCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'reversal': return TrendingUp;
      case 'momentum': return Activity;
      case 'scalping': return BarChart3;
      default: return Target;
    }
  };

  const CategoryIcon = getCategoryIcon(strategy.category);

  return (
    <div className="relative w-full h-80 perspective-1000">
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <Card className="absolute inset-0 w-full h-full glass-panel cursor-pointer backface-hidden border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CategoryIcon className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {strategy.category}
                </Badge>
              </div>
              <Badge variant={strategy.is_predefined ? 'default' : 'outline'} className="text-xs">
                {strategy.is_predefined ? 'Verified' : 'Custom'}
              </Badge>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 text-gradient">
                {strategy.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-green-500">
                    {strategy.accuracy}
                  </div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{strategy.live_users}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Live Users</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-muted-foreground">Risk: </span>
                  <span className={getRiskColor(strategy.risk_level)}>
                    {strategy.risk_level}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Timeframe: </span>
                  <span className="text-foreground">{strategy.timeframe}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground animate-pulse">
                Click to flip for details
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card className="absolute inset-0 w-full h-full glass-panel cursor-pointer backface-hidden transform-rotate-y-180 border-primary/20">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3 text-gradient">
                {strategy.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {strategy.description}
              </p>

              <div className="space-y-2 text-xs bg-muted/20 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry:</span>
                  <span>{strategy.logic.entry.indicator} {strategy.logic.entry.condition} {strategy.logic.entry.value}</span>
                </div>
                {strategy.logic.confirmation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirm:</span>
                    <span>{strategy.logic.confirmation.indicator} {strategy.logic.confirmation.condition}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SL/TP:</span>
                  <span>{strategy.logic.sl}% / {strategy.logic.tp}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center space-x-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onInfo(strategy);
                }}
              >
                <Info className="h-3 w-3" />
                <span>Info</span>
              </Button>
              
              <Button
                size="sm"
                className="flex items-center space-x-1 text-xs bg-gradient-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeploy(strategy);
                }}
              >
                <Rocket className="h-3 w-3" />
                <span>Deploy</span>
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="flex items-center space-x-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onTest(strategy);
                }}
              >
                <TestTube className="h-3 w-3" />
                <span>Test</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};