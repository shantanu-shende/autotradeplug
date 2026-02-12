import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, Settings,
  Plus, TrendingUp, Shield
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

const availableBrokers: Broker[] = [
  { id: 'zerodha', name: 'Zerodha', logo: 'Z', status: 'connected', isPopular: true, features: ['Equity', 'F&O', 'Currency', 'Commodity'], connectionTime: '2 days ago', accountBalance: 45000, lastSync: '2 min ago' },
  { id: 'groww', name: 'Groww', logo: 'G', status: 'disconnected', isPopular: true, features: ['Equity', 'F&O', 'ETF', 'Mutual Funds'] },
  { id: 'upstox', name: 'Upstox', logo: 'U', status: 'error', features: ['Equity', 'F&O', 'Currency'], errorMessage: 'API token expired' },
  { id: '5paisa', name: '5paisa', logo: '5', status: 'disconnected', features: ['Equity', 'F&O', 'Currency', 'Commodity'] },
  { id: 'angelone', name: 'Angel One', logo: 'A', status: 'disconnected', isPopular: true, features: ['Equity', 'F&O', 'Currency', 'Commodity'] },
  { id: 'fyers', name: 'Fyers', logo: 'F', status: 'disconnected', features: ['Equity', 'F&O', 'Currency', 'Commodity'] },
];

const BrokerConnectionDashboard = () => {
  const [brokers, setBrokers] = useState<Broker[]>(availableBrokers);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  const connectedCount = brokers.filter(b => b.status === 'connected').length;
  const totalBalance = brokers.filter(b => b.status === 'connected' && b.accountBalance).reduce((sum, b) => sum + (b.accountBalance || 0), 0);
  const animatedBalance = useCountUp({ end: totalBalance, duration: 2000, prefix: '₹', suffix: '.00' });

  const handleConnect = async (brokerId: string) => {
    setIsConnecting(brokerId);
    setTimeout(() => {
      setBrokers(prev => prev.map(broker => 
        broker.id === brokerId 
          ? { ...broker, status: 'connected', connectionTime: 'Just now', accountBalance: Math.floor(Math.random() * 100000) + 10000, lastSync: 'Just now' }
          : broker
      ));
      setIsConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (brokerId: string) => {
    setBrokers(prev => prev.map(broker => 
      broker.id === brokerId 
        ? { ...broker, status: 'disconnected', connectionTime: undefined, accountBalance: undefined, lastSync: undefined }
        : broker
    ));
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'connected': return <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />;
      case 'connecting': return <Clock className="w-3.5 h-3.5 text-[hsl(var(--warning))] animate-spin" />;
      case 'error': return <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />;
      default: return <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-card/40 border-border/30 card-lift">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Connected</p>
                <p className="text-xl font-bold">{connectedCount}/{brokers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30 card-lift">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold">{animatedBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30 card-lift col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">Connection Health</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={(connectedCount / brokers.length) * 100} className="flex-1 h-1.5" />
                  <span className="text-xs font-medium">{Math.round((connectedCount / brokers.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {brokers.map((broker, index) => (
          <motion.div
            key={broker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <Card className={`bg-card/40 border-border/30 card-lift ${
              broker.status === 'connected' ? 'border-[hsl(var(--success))]/15' : ''
            }`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-primary font-bold text-sm">
                    {broker.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">{broker.name}</CardTitle>
                      {broker.isPopular && (
                        <Badge variant="outline" className="text-[9px] h-4 border-primary/20 text-primary font-normal">Popular</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getStatusIndicator(broker.status)}
                      <span className="text-[11px] text-muted-foreground capitalize">{broker.status}</span>
                      {broker.lastSync && (
                        <span className="text-[10px] text-muted-foreground/50">· synced {broker.lastSync}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {broker.status === 'connected' && (
                  <div className="space-y-1 p-2.5 rounded-lg bg-muted/10 border border-border/10">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Balance</span>
                      <span className="font-medium">₹{broker.accountBalance?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Connected</span>
                      <span className="text-muted-foreground">{broker.connectionTime}</span>
                    </div>
                  </div>
                )}

                {broker.status === 'error' && broker.errorMessage && (
                  <div className="p-2.5 rounded-lg bg-[hsl(var(--warning))]/5 border border-[hsl(var(--warning))]/10">
                    <p className="text-[11px] text-[hsl(var(--warning))]">{broker.errorMessage}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {broker.features.map((f) => (
                    <Badge key={f} variant="outline" className="text-[10px] h-5 border-border/30 text-muted-foreground font-normal">{f}</Badge>
                  ))}
                </div>

                {broker.status === 'connected' ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs press-scale" onClick={() => handleDisconnect(broker.id)}>
                      <WifiOff className="w-3.5 h-3.5 mr-1.5" /> Disconnect
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 press-scale">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full h-8 text-xs press-scale" onClick={() => handleConnect(broker.id)} disabled={isConnecting === broker.id}>
                    {isConnecting === broker.id ? (
                      <><Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Connecting…</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5 mr-1.5" /> Connect</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Request Broker */}
      <Card className="border-dashed border-2 border-border/20 bg-card/20">
        <CardContent className="p-5 text-center">
          <Plus className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">Need another broker?</p>
          <p className="text-xs text-muted-foreground mb-3">Request support for additional brokers</p>
          <Button variant="outline" size="sm" className="h-7 text-xs press-scale">Request Broker</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerConnectionDashboard;
