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
import { EmptyState } from '@/components/ui/empty-state';

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
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Bots</p>
                <p className="text-2xl font-bold tracking-tight">{runningBots.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{totalBots} total</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Equity</p>
                <p className="text-2xl font-bold tracking-tight">${totalEquity.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{portfolios.length} portfolios</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[hsl(var(--success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Demo Portfolios</p>
                <p className="text-2xl font-bold tracking-tight">{demoPortfolios.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">For testing</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Real Portfolios</p>
                <p className="text-2xl font-bold tracking-tight">{realPortfolios.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Connected to brokers</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--warning))]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[hsl(var(--warning))]" />
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
            <Card className="bg-card/40 border-border/30">
              <CardContent className="p-0">
                <EmptyState
                  icon={Bot}
                  title="No trading bots yet"
                  description="Create your first bot to start automating your trading strategies. You can configure risk levels, instruments, and execution rules."
                  actionLabel="Create Your First Bot"
                  onAction={() => setShowCreateModal(true)}
                />
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
