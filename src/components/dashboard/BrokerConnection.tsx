import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Link, Loader } from 'lucide-react';

interface Broker {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  type: 'oauth' | 'token';
}

const brokers: Broker[] = [
  { id: 'zerodha', name: 'Zerodha', logo: '🟢', status: 'connected', type: 'oauth' },
  { id: 'upstox', name: 'Upstox', logo: '🟠', status: 'disconnected', type: 'oauth' },
  { id: 'angelone', name: 'Angel One', logo: '🔴', status: 'disconnected', type: 'token' },
  { id: 'fyers', name: 'Fyers', logo: '🔵', status: 'error', type: 'token' },
];

const BrokerConnection = () => {
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleConnect = async () => {
    if (!selectedBroker) return;
    
    setIsConnecting(true);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update broker status (in real app, this would come from API)
    setIsConnecting(false);
    setSelectedBroker(null);
    setApiKey('');
    setSecretKey('');
  };

  const getBrokerStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <Link className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getBrokerStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Broker Connections</h2>
        <p className="text-muted-foreground">
          Connect your trading accounts to start automated trading
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brokers.map((broker, index) => (
          <motion.div
            key={broker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-panel hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => broker.status !== 'connected' && setSelectedBroker(broker)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{broker.logo}</span>
                  <div>
                    <CardTitle className="text-lg">{broker.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {broker.type === 'oauth' ? 'OAuth Integration' : 'API Key Integration'}
                    </CardDescription>
                  </div>
                </div>
                {getBrokerStatusIcon(broker.status)}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getBrokerStatusBadge(broker.status)}
                  {broker.status !== 'connected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBroker(broker);
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connection Modal */}
      <Dialog open={!!selectedBroker} onOpenChange={() => setSelectedBroker(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <span className="text-2xl">{selectedBroker?.logo}</span>
              <span>Connect {selectedBroker?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedBroker?.type === 'oauth' ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to {selectedBroker.name} to authorize AutoTradePlug
                </p>
                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full glow-button"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Connect via OAuth
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="text"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="glass-panel"
                  />
                </div>
                <div>
                  <Label htmlFor="secret-key">Secret Key</Label>
                  <Input
                    id="secret-key"
                    type="password"
                    placeholder="Enter your secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="glass-panel"
                  />
                </div>
                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting || !apiKey || !secretKey}
                  className="w-full glow-button"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Account'
                  )}
                </Button>
              </div>
            )}

            {isConnecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <Link className="w-6 h-6 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Establishing secure connection...
                </p>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerConnection;