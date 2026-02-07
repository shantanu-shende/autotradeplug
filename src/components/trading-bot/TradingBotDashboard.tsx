import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTradingBot, TradingBot } from '@/hooks/useTradingBot';
import { usePortfolio } from '@/hooks/usePortfolio';
import { BotCard } from './BotCard';
import { CreateBotModal } from './CreateBotModal';
import { PortfolioManager } from '@/components/portfolio/PortfolioManager';
import { ArbitrageDashboard } from '@/components/arbitrage/ArbitrageDashboard';
import { Bot, Wallet, TrendingUp, Activity, Plus, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function TradingBotDashboard() {
  const { bots, loading, error, fetchBots, isRealtimeConnected } = useTradingBot();
  const { portfolios, fetchPortfolios, isRealtimeConnected: isPortfolioRealtimeConnected } = usePortfolio();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bots');

  useEffect(() => {
    fetchBots();
    fetchPortfolios();
  }, [fetchBots, fetchPortfolios]);

  const runningBots = bots.filter(b => b.status === 'running');
  const totalBots = bots.length;
  const demoPortfolios = portfolios.filter(p => p.portfolio_type === 'demo');
  const realPortfolios = portfolios.filter(p => p.portfolio_type === 'real');
  const totalEquity = portfolios.reduce((sum, p) => sum + Number(p.equity), 0);

  const handleRefresh = () => {
    fetchBots();
    fetchPortfolios();
    toast.success('Data refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bots</p>
                <p className="text-2xl font-bold text-primary">{runningBots.length}</p>
                <p className="text-xs text-muted-foreground">{totalBots} total</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Equity</p>
                <p className="text-2xl font-bold">${totalEquity.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{portfolios.length} portfolios</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <Wallet className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demo Portfolios</p>
                <p className="text-2xl font-bold text-blue-500">{demoPortfolios.length}</p>
                <p className="text-xs text-muted-foreground">For testing</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Real Portfolios</p>
                <p className="text-2xl font-bold text-amber-500">{realPortfolios.length}</p>
                <p className="text-xs text-muted-foreground">Connected to brokers</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="bots" className="gap-2">
              <Bot className="h-4 w-4" />
              Trading Bots
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="gap-2">
              <Wallet className="h-4 w-4" />
              Portfolios
            </TabsTrigger>
            <TabsTrigger value="arbitrage" className="gap-2">
              <Zap className="h-4 w-4" />
              Arbitrage
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Realtime connection indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <div className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isRealtimeConnected ? 'Live' : 'Offline'}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {activeTab === 'bots' && (
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Bot
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="bots" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card className="bg-destructive/10 border-destructive/50">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchBots}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : bots.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Trading Bots Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first bot to start automated trading
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots.map(bot => (
                <BotCard key={bot.id} bot={bot} onRefresh={fetchBots} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolios">
          <PortfolioManager />
        </TabsContent>

        <TabsContent value="arbitrage">
          <ArbitrageDashboard />
        </TabsContent>
      </Tabs>

      <CreateBotModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchBots();
        }}
      />
    </div>
  );
}

export default TradingBotDashboard;
