import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface BrokerCardProps {
  broker: {
    id: string;
    name: string;
    logo: string;
    status: 'connected' | 'disconnected' | 'error' | 'expired';
    lastSync?: string;
    balance?: number;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

const BrokerCard: React.FC<BrokerCardProps> = ({
  broker,
  onConnect,
  onDisconnect,
  onRefresh
}) => {
  const getStatusIcon = () => {
    switch (broker.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-warning" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (broker.status) {
      case 'connected':
        return <Badge variant="default" className="bg-success text-success-foreground">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Expired</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const getActionButton = () => {
    if (broker.status === 'connected') {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <Wifi className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      );
    }
    return (
      <Button onClick={onConnect} className="w-full">
        Connect
      </Button>
    );
  };

  return (
    <Card className="hover-scale border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <img 
                src={broker.logo} 
                alt={broker.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  // Fallback to initials if logo fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-6 h-6 rounded bg-primary/20 hidden items-center justify-center text-xs font-semibold text-primary">
                {broker.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{broker.name}</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {broker.status === 'connected' && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            {broker.balance !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-medium text-foreground">₹{broker.balance.toLocaleString()}</span>
              </div>
            )}
            {broker.lastSync && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="text-muted-foreground">{broker.lastSync}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

export default BrokerCard;