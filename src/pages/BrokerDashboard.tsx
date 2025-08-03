import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, HelpCircle, Shield, RefreshCw, Wifi } from 'lucide-react';
import BrokerSummaryStats from '@/components/broker/BrokerSummaryStats';
import EnhancedBrokerCard from '@/components/broker/EnhancedBrokerCard';
import BrokerConnectionModal from '@/components/broker/BrokerConnectionModal';

// Mock broker data with logos
const AVAILABLE_BROKERS = [
  {
    id: 'groww',
    name: 'Groww',
    logo: 'https://groww.in/logo-groww.svg',
    type: 'oauth' as const
  },
  {
    id: 'zerodha',
    name: 'Zerodha',
    logo: 'https://zerodha.com/static/images/logo.svg',
    type: 'api_key' as const
  },
  {
    id: 'angelone',
    name: 'Angel One',
    logo: 'https://www.angelone.in/images/logo.svg',
    type: 'credentials' as const
  },
  {
    id: '5paisa',
    name: '5paisa',
    logo: 'https://images.5paisa.com/5paisa-logo.png',
    type: 'api_key' as const
  },
  {
    id: 'mstocks',
    name: 'Motilal Oswal',
    logo: 'https://www.motilaloswal.com/images/logo.png',
    type: 'credentials' as const
  },
  {
    id: 'dhan',
    name: 'Dhan',
    logo: 'https://dhan.co/logo.svg',
    type: 'api_key' as const
  },
  {
    id: 'upstox',
    name: 'Upstox',
    logo: 'https://upstox.com/app/themes/upstox/dist/img/logo.svg',
    type: 'oauth' as const
  }
];

interface Broker {
  id: string;
  broker_name: string;
  status: string;
  last_sync?: string;
  metadata?: any;
  connected_at?: string;
  user_id: string;
  token?: string;
  refresh_token?: string;
  broker_user_id?: string;
  created_at: string;
  updated_at: string;
}

const BrokerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<typeof AVAILABLE_BROKERS[0] | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    fetchBrokers();
  }, [user]);

  const fetchBrokers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBrokers((data || []) as Broker[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch brokers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (broker: typeof AVAILABLE_BROKERS[0]) => {
    setSelectedBroker(broker);
    setShowConnectionModal(true);
  };

  const handleConnectionSubmit = async (credentials: any) => {
    if (!user || !selectedBroker) return;

    // Check if broker already exists
    const existingBroker = brokers.find(b => b.broker_name === selectedBroker.id);
    
    if (existingBroker) {
      // Update existing broker
      const { error } = await supabase
        .from('brokers')
        .update({
          status: 'connected',
          connected_at: new Date().toISOString(),
          last_sync: new Date().toISOString(),
          metadata: { ...credentials, balance: Math.floor(Math.random() * 100000) + 10000 }
        })
        .eq('id', existingBroker.id);

      if (error) throw error;
    } else {
      // Create new broker connection
      const { error } = await supabase
        .from('brokers')
        .insert({
          user_id: user.id,
          broker_name: selectedBroker.id,
          status: 'connected',
          connected_at: new Date().toISOString(),
          last_sync: new Date().toISOString(),
          metadata: { ...credentials, balance: Math.floor(Math.random() * 100000) + 10000 }
        });

      if (error) throw error;
    }

    await fetchBrokers();
  };

  const handleDisconnect = async (brokerId: string) => {
    try {
      const { error } = await supabase
        .from('brokers')
        .update({ status: 'disconnected', last_sync: null })
        .eq('id', brokerId);

      if (error) throw error;
      
      toast({
        title: "Broker Disconnected",
        description: "Broker has been disconnected successfully",
      });

      await fetchBrokers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect broker",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async (brokerId?: string) => {
    setRefreshing(true);
    try {
      if (brokerId) {
        // Refresh specific broker
        const { error } = await supabase
          .from('brokers')
          .update({ 
            last_sync: new Date().toISOString(),
            metadata: brokers.find(b => b.id === brokerId)?.metadata || {}
          })
          .eq('id', brokerId);

        if (error) throw error;
      }
      
      await fetchBrokers();
      toast({
        title: "Refreshed",
        description: "Broker data has been refreshed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh broker data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getBrokerWithStatus = (availableBroker: typeof AVAILABLE_BROKERS[0]) => {
    const connectedBroker = brokers.find(b => b.broker_name === availableBroker.id);
    const status = connectedBroker?.status || 'disconnected';
    
    return {
      id: connectedBroker?.id || availableBroker.id,
      name: availableBroker.name,
      logo: availableBroker.logo,
      status: ['connected', 'disconnected', 'error', 'expired'].includes(status) 
        ? status as 'connected' | 'disconnected' | 'error' | 'expired'
        : 'disconnected' as const,
      lastSync: connectedBroker?.last_sync ? 
        new Date(connectedBroker.last_sync).toLocaleTimeString() : undefined,
      balance: connectedBroker?.metadata?.balance
    };
  };

  const connectedCount = brokers.filter(b => b.status === 'connected').length;
  const totalBalance = brokers
    .filter(b => b.status === 'connected')
    .reduce((sum, b) => sum + (b.metadata?.balance || 0), 0);
  const healthScore = Math.round((connectedCount / AVAILABLE_BROKERS.length) * 100);

  const handleAddBroker = () => {
    setIsConnectModalOpen(true);
  };

  const handleEnhancedConnect = (brokerId: string) => {
    const broker = AVAILABLE_BROKERS.find(b => b.id === brokerId);
    if (broker) {
      handleConnect(broker);
    }
  };

  const handleEnhancedDisconnect = (brokerId: string) => {
    const broker = brokers.find(b => b.broker_name === brokerId);
    if (broker) {
      handleDisconnect(broker.id);
    }
  };

  const handleEnhancedRefresh = (brokerId: string) => {
    const broker = brokers.find(b => b.broker_name === brokerId);
    if (broker) {
      handleRefresh(broker.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broker Summary Stats */}
      <BrokerSummaryStats
        connectedCount={connectedCount}
        totalBrokers={AVAILABLE_BROKERS.length}
        totalBalance={totalBalance}
        healthScore={healthScore}
        onAddBroker={handleAddBroker}
      />

      {/* Help Section */}
      <Card className="glass-panel border-dashed border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Why connect a broker?</h3>
              <p className="text-sm text-muted-foreground">
                Connect your broker account to execute live trades, access real-time data, and deploy strategies automatically.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Bank-level security</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-card/50 rounded-lg animate-pulse border border-border/50"></div>
          ))}
        </div>
      ) : (
        <>
          {connectedCount > 0 && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-success" />
                <span className="text-success font-medium">
                  {connectedCount} broker{connectedCount > 1 ? 's' : ''} connected and ready for trading
                </span>
              </div>
            </div>
          )}

          {/* Enhanced Broker Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AVAILABLE_BROKERS.map((broker, index) => {
              const connectedBroker = brokers.find(b => b.broker_name === broker.id);
              const status = connectedBroker?.status || 'disconnected';
              
              return (
                <motion.div
                  key={broker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnhancedBrokerCard
                    id={broker.id}
                    name={broker.name}
                    logo={broker.logo}
                    status={['connected', 'disconnected', 'error', 'syncing'].includes(status) 
                      ? status as 'connected' | 'disconnected' | 'error' | 'syncing'
                      : 'disconnected'}
                    balance={connectedBroker?.metadata?.balance || 0}
                    lastSync={connectedBroker?.last_sync ? 
                      new Date(connectedBroker.last_sync).toLocaleTimeString() : 'Never'}
                    supportedMarkets={broker.id === 'zerodha' ? ['Equity', 'F&O', 'Currency'] :
                                     broker.id === 'groww' ? ['Equity', 'MF'] :
                                     broker.id === 'angelone' ? ['Equity', 'F&O', 'MF'] :
                                     ['Equity', 'F&O']}
                    errorMessage={status === 'error' ? 'Token expired - please reconnect' : undefined}
                    tokenExpiry={connectedBroker?.metadata?.token_expiry}
                    onConnect={handleEnhancedConnect}
                    onDisconnect={handleEnhancedDisconnect}
                    onRefresh={handleEnhancedRefresh}
                  />
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating Add Broker Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          onClick={handleAddBroker}
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-5 w-5 mr-2" />
          Connect Broker
        </Button>
      </motion.div>

      {/* Connect Broker Modal */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Connect New Broker</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from our supported brokers to start trading with AutoTradePlug
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_BROKERS.map((broker, i) => (
                <motion.div
                  key={broker.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <img src={broker.logo} alt={broker.name} className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{broker.name}</h4>
                          <div className="text-xs text-muted-foreground">
                            Setup time: 3-5 mins
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Supported Markets:</div>
                        <div className="flex flex-wrap gap-1">
                          {(broker.id === 'zerodha' ? ['Equity', 'F&O', 'Currency'] :
                            broker.id === 'groww' ? ['Equity', 'MF'] :
                            broker.id === 'angelone' ? ['Equity', 'F&O', 'MF'] :
                            ['Equity', 'F&O']).map((market) => (
                            <Badge key={market} variant="outline" className="text-xs">
                              {market}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => {
                          setIsConnectModalOpen(false);
                          handleConnect(broker);
                        }}
                      >
                        Connect {broker.name}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BrokerConnectionModal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false);
          setSelectedBroker(null);
        }}
        broker={selectedBroker}
        onConnect={handleConnectionSubmit}
      />
    </div>
  );
};

export default BrokerDashboard;