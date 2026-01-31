import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTradingBot, TradingBot, BotConfig } from '@/hooks/useTradingBot';
import { toast } from 'sonner';
import { Bot, TrendingUp, Zap, Grid3X3, LineChart } from 'lucide-react';

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const strategyOptions: Array<{
  value: TradingBot['strategy_type'];
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'trend_following',
    label: 'Trend Following',
    description: 'Follow market trends using EMA/RSI indicators',
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    value: 'arbitrage',
    label: 'Arbitrage',
    description: 'Exploit price differences across sources',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    value: 'scalping',
    label: 'Scalping',
    description: 'High-frequency small profit trades',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    value: 'grid',
    label: 'Grid Trading',
    description: 'Buy/sell at predetermined price intervals',
    icon: <Grid3X3 className="h-5 w-5" />,
  },
];

export function CreateBotModal({ open, onOpenChange, onSuccess }: CreateBotModalProps) {
  const { createBot, loading } = useTradingBot();
  const [step, setStep] = useState(1);
  const [botName, setBotName] = useState('');
  const [strategyType, setStrategyType] = useState<TradingBot['strategy_type']>('trend_following');
  const [config, setConfig] = useState<BotConfig>({
    max_positions: 5,
    max_drawdown_percent: 10,
    daily_loss_limit: 500,
    position_size_percent: 2,
    instruments: ['EURUSD', 'GBPUSD', 'USDJPY'],
    take_profit_pips: 20,
    stop_loss_pips: 10,
  });

  const handleCreate = async () => {
    if (!botName.trim()) {
      toast.error('Bot name is required');
      return;
    }

    try {
      await createBot(botName, strategyType, config);
      toast.success('Bot created successfully');
      onSuccess();
      resetForm();
    } catch (err) {
      toast.error('Failed to create bot');
    }
  };

  const resetForm = () => {
    setStep(1);
    setBotName('');
    setStrategyType('trend_following');
    setConfig({
      max_positions: 5,
      max_drawdown_percent: 10,
      daily_loss_limit: 500,
      position_size_percent: 2,
      instruments: ['EURUSD', 'GBPUSD', 'USDJPY'],
      take_profit_pips: 20,
      stop_loss_pips: 10,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Create Trading Bot
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Choose a strategy and name for your bot'}
            {step === 2 && 'Configure risk management settings'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                placeholder="My Trading Bot"
                value={botName}
                onChange={e => setBotName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Strategy Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {strategyOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setStrategyType(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      strategyType === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={strategyType === option.value ? 'text-primary' : 'text-muted-foreground'}>
                        {option.icon}
                      </div>
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Max Positions</Label>
                <span className="font-medium">{config.max_positions}</span>
              </div>
              <Slider
                value={[config.max_positions || 5]}
                onValueChange={([v]) => setConfig(prev => ({ ...prev, max_positions: v }))}
                min={1}
                max={20}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Position Size (%)</Label>
                <span className="font-medium">{config.position_size_percent}%</span>
              </div>
              <Slider
                value={[config.position_size_percent || 2]}
                onValueChange={([v]) => setConfig(prev => ({ ...prev, position_size_percent: v }))}
                min={0.5}
                max={10}
                step={0.5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Max Drawdown (%)</Label>
                <span className="font-medium">{config.max_drawdown_percent}%</span>
              </div>
              <Slider
                value={[config.max_drawdown_percent || 10]}
                onValueChange={([v]) => setConfig(prev => ({ ...prev, max_drawdown_percent: v }))}
                min={5}
                max={50}
                step={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Take Profit (pips)</Label>
                <Input
                  type="number"
                  value={config.take_profit_pips}
                  onChange={e => setConfig(prev => ({ ...prev, take_profit_pips: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stop Loss (pips)</Label>
                <Input
                  type="number"
                  value={config.stop_loss_pips}
                  onChange={e => setConfig(prev => ({ ...prev, stop_loss_pips: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Daily Loss Limit ($)</Label>
              <Input
                type="number"
                value={config.daily_loss_limit}
                onChange={e => setConfig(prev => ({ ...prev, daily_loss_limit: Number(e.target.value) }))}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!botName.trim()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Bot'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
