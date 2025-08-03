import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';

interface BrokerCardProps {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  balance: number;
  lastSync: string;
  supportedMarkets: string[];
  errorMessage?: string;
  tokenExpiry?: string;
  onConnect: (brokerId: string) => void;
  onDisconnect: (brokerId: string) => void;
  onRefresh: (brokerId: string) => void;
}

const EnhancedBrokerCard: React.FC<BrokerCardProps> = ({
  id,
  name,
  logo,
  status,
  balance,
  lastSync,
  supportedMarkets,
  errorMessage,
  tokenExpiry,
  onConnect,
  onDisconnect,
  onRefresh
}) => {
  const [showBalance, setShowBalance] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      connected: 'default',
      syncing: 'secondary',
      error: 'destructive',
      disconnected: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {getStatusIcon()}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'border-success';
      case 'syncing': return 'border-warning';
      case 'error': return 'border-destructive';
      default: return 'border-muted';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh(id);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleToggleConnection = () => {
    if (status === 'connected') {
      onDisconnect(id);
    } else {
      onConnect(id);
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`glass-panel hover:shadow-lg transition-all duration-300 ${getStatusColor()} border-2`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <img src={logo} alt={name} className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Last sync: {lastSync}
                  </div>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Balance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Balance:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0"
                >
                  {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <div className="font-medium">
                {showBalance ? `₹${balance.toLocaleString()}` : '₹••••••'}
              </div>
            </div>

            {/* Supported Markets */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Supported Markets:</div>
              <div className="flex flex-wrap gap-1">
                {supportedMarkets.map((market) => (
                  <Badge key={market} variant="outline" className="text-xs">
                    {market}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Token Expiry Warning */}
            {tokenExpiry && (
              <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm text-warning">
                    Token expires: {tokenExpiry}
                  </span>
                </div>
              </div>
            )}

            {/* Connection Health */}
            {status === 'connected' && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Connection Health</span>
                  <span className="text-success">98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={status === 'connected'}
                  onCheckedChange={handleToggleConnection}
                  disabled={status === 'syncing'}
                />
                <span className="text-sm">
                  {status === 'connected' ? 'Connected' : 'Connect'}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing || status === 'disconnected'}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh connection</p>
                  </TooltipContent>
                </Tooltip>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>{name} Settings</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Connection Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="capitalize">{status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Sync:</span>
                            <span>{lastSync}</span>
                          </div>
                          {tokenExpiry && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Token Expires:</span>
                              <span>{tokenExpiry}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Security</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="h-4 w-4 text-success" />
                          <span>API connection is encrypted and secure</span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          View Logs
                        </Button>
                        <Button variant="outline" size="sm">
                          Reconnect
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default EnhancedBrokerCard;