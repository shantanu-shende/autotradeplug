import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Plus,
  TrendingUp,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';

interface Broker {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  isPopular?: boolean;
  features: string[];
  connectionTime?: string;
  accountBalance?: number;
  lastSync?: string;
  errorMessage?: string;
}

// Mock broker data - replace with real API
const availableBrokers: Broker[] = [
  {
    id: 'zerodha',
    name: 'Zerodha',
    logo: 'Z',
    status: 'connected',
    isPopular: true,
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
    connectionTime: '2 days ago',
    accountBalance: 45000,
    lastSync: '2 min ago'
  },
  {
    id: 'groww',
    name: 'Groww',
    logo: 'G',
    status: 'disconnected',
    isPopular: true,
    features: ['Equity', 'F&O', 'ETF', 'Mutual Funds'],
  },
  {
    id: 'upstox',
    name: 'Upstox',
    logo: 'U',
    status: 'error',
    features: ['Equity', 'F&O', 'Currency'],
    errorMessage: 'API token expired'
  },
  {
    id: '5paisa',
    name: '5paisa',
    logo: '5',
    status: 'disconnected',
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
  },
  {
    id: 'angelone',
    name: 'Angel One',
    logo: 'A',
    status: 'disconnected',
    isPopular: true,
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
  },
  {
    id: 'fyers',
    name: 'Fyers',
    logo: 'F',
    status: 'disconnected',
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
  },
];

const BrokerConnectionDashboard = () => {
  const [brokers, setBrokers] = useState<Broker[]>(availableBrokers);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  const connectedCount = brokers.filter(b => b.status === 'connected').length;
  const totalBalance = brokers
    .filter(b => b.status === 'connected' && b.accountBalance)
    .reduce((sum, b) => sum + (b.accountBalance || 0), 0);

  const animatedBalance = useCountUp({ 
    end: totalBalance, 
    duration: 2000, 
    prefix: '₹', 
    suffix: '.00' 
  });

  const handleConnect = async (brokerId: string) => {
    setIsConnecting(brokerId);
    
    // Simulate API call
    setTimeout(() => {
      setBrokers(prev => prev.map(broker => 
        broker.id === brokerId 
          ? { 
              ...broker, 
              status: 'connected', 
              connectionTime: 'Just now',
              accountBalance: Math.floor(Math.random() * 100000) + 10000,
              lastSync: 'Just now'
            }
          : broker
      ));
      setIsConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (brokerId: string) => {
    setBrokers(prev => prev.map(broker => 
      broker.id === brokerId 
        ? { 
            ...broker, 
            status: 'disconnected',
            connectionTime: undefined,
            accountBalance: undefined,
            lastSync: undefined
          }
        : broker
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-100 text-green-800 border-green-200',
      connecting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      disconnected: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.disconnected}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Connected Brokers</p>
                  <p className="text-2xl font-bold">{connectedCount}/{brokers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold">{animatedBalance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Connection Health</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={(connectedCount / brokers.length) * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{Math.round((connectedCount / brokers.length) * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Connection Alert */}
      {connectedCount === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Alert className="border-primary/20 bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>Connect a broker to enable live trading.</strong> 
              You need at least one connected broker to deploy strategies and access real-time market data.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Broker Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((broker, index) => (
          <motion.div
            key={broker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 5) }}
          >
            <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
              broker.status === 'connected' ? 'ring-2 ring-green-500/20 bg-green-50/50' : ''
            }`}>
              {broker.isPopular && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {broker.logo}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{broker.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(broker.status)}
                      {getStatusBadge(broker.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connection Details */}
                {broker.status === 'connected' && (
                  <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="font-medium">₹{broker.accountBalance?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="font-medium">{broker.lastSync}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connected:</span>
                      <span className="font-medium">{broker.connectionTime}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {broker.status === 'error' && broker.errorMessage && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{broker.errorMessage}</p>
                  </div>
                )}

                {/* Features */}
                <div>
                  <p className="text-sm font-medium mb-2">Supported Markets:</p>
                  <div className="flex flex-wrap gap-1">
                    {broker.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {broker.status === 'connected' ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDisconnect(broker.id)}
                      >
                        <WifiOff className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleConnect(broker.id)}
                      disabled={isConnecting === broker.id}
                    >
                      {isConnecting === broker.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Connect {broker.name}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Custom Broker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Plus className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="font-medium">Need another broker?</h3>
              <p className="text-sm text-muted-foreground">
                Request support for additional brokers or use our API integration guide.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Request Broker
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BrokerConnectionDashboard;