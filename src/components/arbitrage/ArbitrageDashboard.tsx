import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useArbitrage, ArbitrageSignal } from '@/hooks/useArbitrage';
import { usePortfolio } from '@/hooks/usePortfolio';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap,
  Search,
  RefreshCw,
  TrendingUp,
  Clock,
  DollarSign,
  Play,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function ArbitrageDashboard() {
  const {
    signals,
    spreads,
    loading,
    error,
    lastScanResult,
    scanForOpportunities,
    fetchSignals,
    getSpreads,
    executeArbitrage,
  } = useArbitrage();

  const { portfolios, fetchPortfolios } = usePortfolio();
  const [showExecuteModal, setShowExecuteModal] = useState<ArbitrageSignal | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [volume, setVolume] = useState(0.1);
  const [minSpread, setMinSpread] = useState(0.5);

  useEffect(() => {
    fetchSignals();
    getSpreads();
    fetchPortfolios();
  }, [fetchSignals, getSpreads, fetchPortfolios]);

  const handleScan = async () => {
    try {
      await scanForOpportunities(undefined, minSpread);
      toast.success('Scan completed');
    } catch (err) {
      toast.error('Scan failed');
    }
  };

  const handleExecute = async () => {
    if (!showExecuteModal || !selectedPortfolio || volume <= 0) return;

    try {
      const result = await executeArbitrage(showExecuteModal.id, selectedPortfolio, volume);
      toast.success(result.message || 'Arbitrage executed');
      setShowExecuteModal(null);
    } catch (err) {
      toast.error('Execution failed');
    }
  };

  const demoPortfolios = portfolios.filter(p => p.portfolio_type === 'demo');
  const pendingSignals = signals.filter(s => !s.executed);
  const executedSignals = signals.filter(s => s.executed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Arbitrage Scanner
          </h2>
          <p className="text-sm text-muted-foreground">
            Detect and execute cross-source price differences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Min Spread:</Label>
            <Input
              type="number"
              value={minSpread}
              onChange={e => setMinSpread(Number(e.target.value))}
              className="w-20"
              step={0.1}
            />
            <span className="text-sm text-muted-foreground">pips</span>
          </div>
          <Button onClick={handleScan} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Scan Now
          </Button>
        </div>
      </div>

      {/* Last Scan Stats */}
      {lastScanResult && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-primary/10">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(lastScanResult.scan_timestamp).toLocaleTimeString()}
                </Badge>
                <span className="text-sm">
                  Scanned <strong>{lastScanResult.scanned_symbols}</strong> symbols
                </span>
                <span className="text-sm">
                  Found <strong className="text-primary">{lastScanResult.signals_found}</strong> opportunities
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Spreads */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Spread Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(spreads).map(([symbol, data]) => (
              <div key={symbol} className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">{symbol}</p>
                <p className="text-lg font-bold">
                  {data.max_spread.toFixed(1)} <span className="text-xs text-muted-foreground">pips</span>
                </p>
                <div className="flex gap-1 mt-1">
                  {data.sources.map((source, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {source.name}: {source.price.toFixed(5)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Opportunities */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Active Opportunities ({pendingSignals.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {pendingSignals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No active opportunities. Run a scan to detect arbitrage.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {pendingSignals.slice(0, 20).map(signal => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{signal.symbol_pair}</p>
                        <p className="text-xs text-muted-foreground">
                          {signal.source_a} → {signal.source_b}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        {signal.spread_pips.toFixed(1)} pips
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-500">
                          +${signal.potential_profit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per lot
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowExecuteModal(signal)}
                        disabled={demoPortfolios.length === 0}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Execute
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Executed History */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Execution History ({executedSignals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {executedSignals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No executed trades yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {executedSignals.slice(0, 20).map(signal => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">{signal.symbol_pair}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(signal.detected_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-500">
                        +${((signal.execution_result as { profit?: number })?.profit || signal.potential_profit).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">profit</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Execute Modal */}
      <Dialog open={showExecuteModal !== null} onOpenChange={() => setShowExecuteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Arbitrage</DialogTitle>
            <DialogDescription>
              Execute this arbitrage opportunity
            </DialogDescription>
          </DialogHeader>
          {showExecuteModal && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{showExecuteModal.symbol_pair}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy at</span>
                  <span>{showExecuteModal.source_a} ({showExecuteModal.price_a.toFixed(5)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sell at</span>
                  <span>{showExecuteModal.source_b} ({showExecuteModal.price_b.toFixed(5)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spread</span>
                  <span className="text-green-500 font-medium">{showExecuteModal.spread_pips.toFixed(2)} pips</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Portfolio</Label>
                <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoPortfolios.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.portfolio_name} (${Number(p.balance).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Volume (Lots)</Label>
                <Input
                  type="number"
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  step={0.01}
                  min={0.01}
                />
              </div>

              <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <div className="flex justify-between items-center">
                  <span>Potential Profit</span>
                  <span className="text-xl font-bold text-green-500">
                    ${(showExecuteModal.potential_profit * volume).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={loading || !selectedPortfolio || volume <= 0}
            >
              {loading ? 'Executing...' : 'Execute Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ArbitrageDashboard;
