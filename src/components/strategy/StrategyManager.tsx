import React, { useState, useEffect } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StrategyOfTheDay from './StrategyOfTheDay';
import { StrategyCard } from './StrategyCard';
import { StrategyInfoModal } from './StrategyInfoModal';
import { StrategyTestModal } from './StrategyTestModal';
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Edit3, 
  Trash2, 
  Code, 
  TrendingUp,
  Activity,
  Clock,
  Target,
  Filter,
  SortAsc,
  Search,
  BarChart3
} from 'lucide-react';

interface UserStrategy {
  id: string;
  strategy_name: string;
  description: string | null;
  strategy_type: string;
  status: string;
  risk_level: string;
  config: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface MarketplaceStrategy {
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

const StrategyManager: React.FC = () => {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<UserStrategy[]>([]);
  const [marketplaceStrategies, setMarketplaceStrategies] = useState<MarketplaceStrategy[]>([]);
  const [filteredMarketplaceStrategies, setFilteredMarketplaceStrategies] = useState<MarketplaceStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<UserStrategy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMarketplaceStrategy, setSelectedMarketplaceStrategy] = useState<MarketplaceStrategy | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    strategy_name: string;
    description: string;
    strategy_type: string;
    risk_level: string;
    code: string;
  }>({
    strategy_name: '',
    description: '',
    strategy_type: 'custom',
    risk_level: 'medium',
    code: ''
  });

  const categories = [
    { id: 'all', name: 'All Strategies', icon: Target },
    { id: 'reversal', name: 'Reversal', icon: TrendingUp },
    { id: 'momentum', name: 'Momentum', icon: Activity },
    { id: 'scalping', name: 'Scalping', icon: BarChart3 },
  ];

  // Sample marketplace data
  const sampleMarketplaceStrategies: MarketplaceStrategy[] = [
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
    fetchMarketplaceStrategies();
  }, [user]);

  useEffect(() => {
    filterMarketplaceStrategies();
  }, [marketplaceStrategies, searchTerm, selectedCategory]);

  const fetchStrategies = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setStrategies((data || []) as UserStrategy[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch strategies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplaceStrategies = async () => {
    try {
      // For now, use sample data. Later this will fetch from Supabase
      setMarketplaceStrategies(sampleMarketplaceStrategies);
      setMarketplaceLoading(false);
    } catch (error) {
      console.error('Error fetching marketplace strategies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace strategies',
        variant: 'destructive',
      });
      setMarketplaceLoading(false);
    }
  };

  const filterMarketplaceStrategies = () => {
    let filtered = marketplaceStrategies;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(strategy => strategy.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(strategy =>
        strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMarketplaceStrategies(filtered);
  };

  const handleCreateStrategy = async () => {
    if (!user || !formData.strategy_name.trim()) return;

    try {
      const { error } = await supabase
        .from('user_strategies')
        .insert({
          user_id: user.id,
          strategy_name: formData.strategy_name,
          description: formData.description,
          strategy_type: formData.strategy_type,
          risk_level: formData.risk_level,
          config: { code: formData.code }
        });

      if (error) throw error;

      toast({
        title: "Strategy Created",
        description: `Strategy "${formData.strategy_name}" has been created successfully`,
      });

      setShowCreateModal(false);
      setFormData({ strategy_name: '', description: '', strategy_type: 'custom', risk_level: 'medium', code: '' });
      fetchStrategies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create strategy",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStrategy = async () => {
    if (!editingStrategy || !formData.strategy_name.trim()) return;

    try {
      const { error } = await supabase
        .from('user_strategies')
        .update({
          strategy_name: formData.strategy_name,
          description: formData.description,
          risk_level: formData.risk_level,
          config: { code: formData.code }
        })
        .eq('id', editingStrategy.id);

      if (error) throw error;

      toast({
        title: "Strategy Updated",
        description: `Strategy "${formData.strategy_name}" has been updated successfully`,
      });

      setEditingStrategy(null);
      setFormData({ strategy_name: '', description: '', strategy_type: 'custom', risk_level: 'medium', code: '' });
      fetchStrategies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update strategy",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    try {
      const { error } = await supabase
        .from('user_strategies')
        .delete()
        .eq('id', strategyId);

      if (error) throw error;

      toast({
        title: "Strategy Deleted",
        description: "Strategy has been deleted successfully",
      });

      fetchStrategies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete strategy",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (strategyId: string, newStatus: UserStrategy['status']) => {
    try {
      const { error } = await supabase
        .from('user_strategies')
        .update({ status: newStatus })
        .eq('id', strategyId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Strategy status changed to ${newStatus}`,
      });

      fetchStrategies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (strategy: UserStrategy) => {
    setEditingStrategy(strategy);
    setFormData({
      strategy_name: strategy.strategy_name,
      description: strategy.description || '',
      strategy_type: strategy.strategy_type,
      risk_level: strategy.risk_level,
      code: strategy.config?.code || ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-success" />;
      case 'paused': return <Pause className="h-4 w-4 text-warning" />;
      case 'stopped': return <Square className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'paused': return <Badge variant="secondary" className="bg-warning text-warning-foreground">Paused</Badge>;
      case 'stopped': return <Badge variant="destructive">Stopped</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return <Badge variant="outline" className="text-success border-success">Low Risk</Badge>;
      case 'high': return <Badge variant="outline" className="text-destructive border-destructive">High Risk</Badge>;
      default: return <Badge variant="outline" className="text-warning border-warning">Medium Risk</Badge>;
    }
  };

  const handleMarketplaceInfo = (strategy: MarketplaceStrategy) => {
    setSelectedMarketplaceStrategy(strategy);
    setInfoModalOpen(true);
  };

  const handleMarketplaceDeploy = async (strategy: MarketplaceStrategy) => {
    try {
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

  const handleMarketplaceTest = (strategy: MarketplaceStrategy) => {
    setSelectedMarketplaceStrategy(strategy);
    setTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar and Filters from Marketplace */}
      <Card className="bg-card/40 border-border/30">
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
              {filteredMarketplaceStrategies.length} strategies found
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Cards Grid from Marketplace */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Strategy Marketplace</h2>
        {marketplaceLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarketplaceStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StrategyCard
                  strategy={strategy}
                  onInfo={handleMarketplaceInfo}
                  onDeploy={handleMarketplaceDeploy}
                  onTest={handleMarketplaceTest}
                />
              </motion.div>
            ))}
          </div>
        )}

        {filteredMarketplaceStrategies.length === 0 && !marketplaceLoading && (
          <Card className="bg-card/40 border-border/30">
            <CardContent className="p-0">
              <EmptyState
                icon={Target}
                title="No strategies match your search"
                description="Try adjusting your filters or search terms. You can also create a custom strategy from scratch."
                actionLabel="Clear Filters"
                onAction={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Strategy of the Day */}
      <StrategyOfTheDay />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">My Strategies</h2>
          <p className="text-sm text-muted-foreground">Create, manage and deploy your trading strategies</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div></div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="animate-scale-in">
              <Plus className="h-4 w-4 mr-2" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Strategy</DialogTitle>
            </DialogHeader>
            <StrategyForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateStrategy}
              submitLabel="Create Strategy"
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-0">
            <EmptyState
              icon={Code}
              title="No strategies created yet"
              description="Build your first custom strategy or choose one from the marketplace above. Strategies let you automate trading with your own rules."
              actionLabel="Create First Strategy"
              onAction={() => setShowCreateModal(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => (
            <Card key={strategy.id} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Code className="h-5 w-5 text-primary" />
                      <span>{strategy.strategy_name}</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {strategy.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(strategy.status)}
                    {getStatusBadge(strategy.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                  </div>
                  {getRiskBadge(strategy.risk_level)}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">{strategy.strategy_type}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2">
                  {strategy.status === 'draft' || strategy.status === 'stopped' ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusChange(strategy.id, 'active')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  ) : strategy.status === 'active' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(strategy.id, 'paused')}
                      className="flex-1"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusChange(strategy.id, 'active')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openEditModal(strategy)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Strategy Modal */}
      <Dialog open={!!editingStrategy} onOpenChange={() => setEditingStrategy(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Strategy</DialogTitle>
          </DialogHeader>
          <StrategyForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateStrategy}
            submitLabel="Update Strategy"
          />
        </DialogContent>
      </Dialog>

      {/* Marketplace Strategy Modals */}
      <StrategyInfoModal
        strategy={selectedMarketplaceStrategy}
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
      />
      
      <StrategyTestModal
        strategy={selectedMarketplaceStrategy}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />
    </div>
  );
};

// Strategy Form Component
interface StrategyFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  submitLabel: string;
}

const StrategyForm: React.FC<StrategyFormProps> = ({ formData, setFormData, onSubmit, submitLabel }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="strategy_name">Strategy Name</Label>
        <Input
          id="strategy_name"
          value={formData.strategy_name}
          onChange={(e) => setFormData(prev => ({ ...prev, strategy_name: e.target.value }))}
          placeholder="Enter strategy name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your strategy"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="strategy_type">Type</Label>
          <Select 
            value={formData.strategy_type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, strategy_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="imported">Imported</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="risk_level">Risk Level</Label>
          <Select 
            value={formData.risk_level} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, risk_level: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Strategy Code (Optional)</Label>
        <Textarea
          id="code"
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder="Enter your strategy logic or code"
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <Button 
        onClick={onSubmit} 
        disabled={!formData.strategy_name.trim()}
        className="w-full"
      >
        {submitLabel}
      </Button>
    </div>
  );
};

export default StrategyManager;