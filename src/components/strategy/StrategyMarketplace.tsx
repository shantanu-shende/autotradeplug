import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StrategyCard } from './StrategyCard';
import { StrategyInfoModal } from './StrategyInfoModal';
import { StrategyTestModal } from './StrategyTestModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  TrendingUp,
  Activity,
  BarChart3,
  Target,
  Plus
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

export const StrategyMarketplace = () => {
  const [strategies, setStrategies] = useState<StrategyData[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<StrategyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyData | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Strategies', icon: Target },
    { id: 'reversal', name: 'Reversal', icon: TrendingUp },
    { id: 'momentum', name: 'Momentum', icon: Activity },
    { id: 'scalping', name: 'Scalping', icon: BarChart3 },
  ];

  // Sample data - will be replaced with actual Supabase data
  const sampleStrategies: StrategyData[] = [
    {
      id: 'atp-001',
      name: 'RSI Reversal Bot',
      description: 'Buy when RSI drops below 30 and MACD turns positive. Perfect for catching oversold bounces in trending markets.',
      accuracy: '84%',
      live_users: 47,
      category: 'reversal',
      risk_level: 'Medium',
      timeframe: '15m',
      is_predefined: true,
      logic: {
        entry: { indicator: 'RSI', condition: '<', value: 30 },
        confirmation: { indicator: 'MACD', condition: 'cross_over', value: 0 },
        action: 'BUY',
        sl: 2,
        tp: 5
      }
    },
    {
      id: 'atp-002',
      name: 'Momentum Breakout',
      description: 'Captures strong price movements when volume spikes above average and price breaks key resistance levels.',
      accuracy: '76%',
      live_users: 32,
      category: 'momentum',
      risk_level: 'High',
      timeframe: '5m',
      is_predefined: true,
      logic: {
        entry: { indicator: 'Volume', condition: '>', value: 1.5 },
        confirmation: { indicator: 'Price', condition: 'breaks', value: 0 },
        action: 'BUY',
        sl: 3,
        tp: 8
      }
    },
    {
      id: 'atp-003',
      name: 'EMA Crossover Scalper',
      description: 'Quick scalping strategy using EMA crossovers with tight stop losses for multiple small profits.',
      accuracy: '68%',
      live_users: 89,
      category: 'scalping',
      risk_level: 'Low',
      timeframe: '1m',
      is_predefined: true,
      logic: {
        entry: { indicator: 'EMA_9', condition: 'cross_above', value: 0 },
        confirmation: { indicator: 'EMA_21', condition: 'cross_above', value: 0 },
        action: 'BUY',
        sl: 1,
        tp: 2
      }
    }
  ];

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    filterStrategies();
  }, [strategies, searchTerm, selectedCategory]);

  const fetchStrategies = async () => {
    try {
      // For now, use sample data. Later this will fetch from Supabase
      setStrategies(sampleStrategies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load strategies',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const filterStrategies = () => {
    let filtered = strategies;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(strategy => strategy.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(strategy =>
        strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStrategies(filtered);
  };

  const handleInfo = (strategy: StrategyData) => {
    setSelectedStrategy(strategy);
    setInfoModalOpen(true);
  };

  const handleDeploy = async (strategy: StrategyData) => {
    try {
      // This will integrate with the existing strategy deployment system
      toast({
        title: 'Strategy Deployment',
        description: `${strategy.name} deployment initiated. Check your demo accounts to configure deployment.`,
      });
    } catch (error) {
      console.error('Error deploying strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to deploy strategy',
        variant: 'destructive',
      });
    }
  };

  const handleTest = (strategy: StrategyData) => {
    setSelectedStrategy(strategy);
    setTestModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Strategy Marketplace</h1>
          <p className="text-muted-foreground">Discover and deploy proven trading strategies</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-panel">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredStrategies.length} strategies found
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStrategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StrategyCard
              strategy={strategy}
              onInfo={handleInfo}
              onDeploy={handleDeploy}
              onTest={handleTest}
            />
          </motion.div>
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <Card className="glass-panel">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No strategies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or create a new strategy.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <StrategyInfoModal
        strategy={selectedStrategy}
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
      />
      
      <StrategyTestModal
        strategy={selectedStrategy}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />
    </div>
  );
};