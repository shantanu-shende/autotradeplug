import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import BrokerCard from '@/components/broker/BrokerCard';
import BrokerConnectionModal from '@/components/broker/BrokerConnectionModal';
import BrokerSummaryStats from '@/components/broker/BrokerSummaryStats';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi } from 'lucide-react';

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
    // Find first disconnected broker and open connection modal
    const disconnectedBroker = AVAILABLE_BROKERS.find(ab => 
      !brokers.some(b => b.broker_name === ab.id && b.status === 'connected')
    );
    if (disconnectedBroker) {
      handleConnect(disconnectedBroker);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broker Summary Stats - Moved from Dashboard */}
      <BrokerSummaryStats
        connectedCount={connectedCount}
        totalBrokers={AVAILABLE_BROKERS.length}
        totalBalance={totalBalance}
        healthScore={healthScore}
        onAddBroker={handleAddBroker}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">All Brokers</h2>
          <p className="text-muted-foreground">
            Manage your trading account connections
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRefresh()}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_BROKERS.map((broker, index) => {
              const brokerWithStatus = getBrokerWithStatus(broker);
              const connectedBroker = brokers.find(b => b.broker_name === broker.id);
              
              return (
                <div 
                  key={broker.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BrokerCard
                    broker={brokerWithStatus}
                    onConnect={() => handleConnect(broker)}
                    onDisconnect={() => connectedBroker && handleDisconnect(connectedBroker.id)}
                    onRefresh={() => connectedBroker && handleRefresh(connectedBroker.id)}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

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