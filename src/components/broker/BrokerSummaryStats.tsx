import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  DollarSign, 
  Activity, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface BrokerSummaryStatsProps {
  connectedCount: number;
  totalBrokers: number;
  totalBalance: number;
  healthScore: number;
  onAddBroker: () => void;
}

const BrokerSummaryStats: React.FC<BrokerSummaryStatsProps> = ({
  connectedCount,
  totalBrokers,
  totalBalance,
  healthScore,
  onAddBroker
}) => {
  const connectionPercentage = (connectedCount / totalBrokers) * 100;
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-success" />;
    if (score >= 60) return <Clock className="h-4 w-4 text-warning" />;
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Connected Brokers */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connected Brokers</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{connectedCount}</div>
          <div className="text-xs text-muted-foreground">
            of {totalBrokers} available
          </div>
          <Progress value={connectionPercentage} className="mt-2" />
        </CardContent>
      </Card>

      {/* Total Balance */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalBalance.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Across all accounts
          </div>
        </CardContent>
      </Card>

      {/* Connection Health */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connection Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}%
            </div>
            {getHealthIcon(healthScore)}
          </div>
          <div className="text-xs text-muted-foreground">
            System health score
          </div>
        </CardContent>
      </Card>

      {/* Add Broker CTA */}
      <Card className="glass-panel border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Button 
            onClick={onAddBroker}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Broker
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Connect more brokers for better diversification
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerSummaryStats;