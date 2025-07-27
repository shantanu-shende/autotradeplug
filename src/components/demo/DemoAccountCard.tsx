import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, TrendingUp, Play, Pause, Trash2, Plus } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface DemoAccount {
  id: string;
  hash_id: string;
  account_name: string;
  balance: number;
  initial_balance: number;
  status: 'active' | 'inactive' | 'dumped';
  created_at: string;
}

interface DemoAccountCardProps {
  account: DemoAccount;
  onActivate: (id: string) => void;
  onDump: (id: string) => void;
  onAddFunds: (id: string) => void;
  onManageStrategies: (id: string) => void;
}

export const DemoAccountCard = ({ 
  account, 
  onActivate, 
  onDump, 
  onAddFunds, 
  onManageStrategies 
}: DemoAccountCardProps) => {
  const balance = useCountUp({ end: account.balance, duration: 1500, prefix: '₹', suffix: '.00' });
  const initialBalance = parseFloat(account.initial_balance.toString());
  const currentBalance = parseFloat(account.balance.toString());
  const pnlPercentage = initialBalance > 0 ? ((currentBalance - initialBalance) / initialBalance) * 100 : 0;
  const progressValue = Math.min((currentBalance / 250000) * 100, 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-yellow-500';
      case 'dumped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'dumped':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{account.account_name}</CardTitle>
          </div>
          <Badge variant={getStatusVariant(account.status)} className="capitalize">
            {account.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
            {account.hash_id}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-xl font-bold">{balance}</span>
          </div>
          
          <Progress value={progressValue} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Initial: ₹{initialBalance.toFixed(2)}
            </span>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {account.status === 'inactive' && (
            <Button 
              size="sm" 
              onClick={() => onActivate(account.id)}
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              Activate
            </Button>
          )}
          
          {account.status === 'active' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAddFunds(account.id)}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Funds
              </Button>
              
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => onManageStrategies(account.id)}
              >
                Strategies
              </Button>
            </>
          )}
          
          {account.status !== 'dumped' && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onDump(account.id)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Dump
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};