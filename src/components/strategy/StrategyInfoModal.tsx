import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Shield, 
  BarChart3,
  Target,
  Activity,
  Rocket
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

interface StrategyInfoModalProps {
  strategy: StrategyData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StrategyInfoModal = ({ strategy, open, onOpenChange }: StrategyInfoModalProps) => {
  if (!strategy) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-500 bg-green-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'High': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted/10';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <CategoryIcon className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl text-gradient">{strategy.name}</DialogTitle>
            <Badge variant={strategy.is_predefined ? 'default' : 'outline'}>
              {strategy.is_predefined ? 'Verified' : 'Custom'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-panel">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">{strategy.accuracy}</div>
                <p className="text-xs text-muted-foreground">Accuracy Rate</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{strategy.live_users}</div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{strategy.timeframe}</div>
                <p className="text-xs text-muted-foreground">Timeframe</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${getRiskColor(strategy.risk_level).split(' ')[0]}`}>
                  {strategy.risk_level}
                </div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Strategy Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{strategy.description}</p>
            </CardContent>
          </Card>

          {/* Trading Logic */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Trading Logic</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-500">Entry Conditions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primary:</span>
                        <span>{strategy.logic.entry.indicator} {strategy.logic.entry.condition} {strategy.logic.entry.value}</span>
                      </div>
                      {strategy.logic.confirmation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confirmation:</span>
                          <span>{strategy.logic.confirmation.indicator} {strategy.logic.confirmation.condition}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-red-500">Risk Management</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stop Loss:</span>
                        <span className="text-red-500">{strategy.logic.sl}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Take Profit:</span>
                        <span className="text-green-500">{strategy.logic.tp}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk/Reward:</span>
                        <span>1:{(strategy.logic.tp / strategy.logic.sl).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How It Works</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Monitor {strategy.logic.entry.indicator} for {strategy.logic.entry.condition} {strategy.logic.entry.value} condition</li>
                    {strategy.logic.confirmation && (
                      <li>Wait for {strategy.logic.confirmation.indicator} confirmation signal</li>
                    )}
                    <li>Execute {strategy.logic.action} order when all conditions are met</li>
                    <li>Set stop loss at {strategy.logic.sl}% and take profit at {strategy.logic.tp}%</li>
                    <li>Monitor position and exit based on predefined rules</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="bg-gradient-primary">
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Strategy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};