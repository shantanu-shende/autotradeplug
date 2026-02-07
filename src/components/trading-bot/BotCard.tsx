import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTradingBot, TradingBot } from '@/hooks/useTradingBot';
import {
  Bot,
  Play,
  Pause,
  Square,
  Settings,
  Trash2,
  MoreVertical,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BotCardProps {
  bot: TradingBot;
  onRefresh: () => void;
}

const strategyColors: Record<string, string> = {
  arbitrage: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  scalping: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  grid: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  trend_following: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const statusColors: Record<string, string> = {
  running: 'bg-green-500',
  paused: 'bg-yellow-500',
  stopped: 'bg-gray-500',
  error: 'bg-red-500',
};

export function BotCard({ bot, onRefresh }: BotCardProps) {
  const { startBot, stopBot, pauseBot, deleteBot, loading } = useTradingBot();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStart = async () => {
    try {
      await startBot(bot.id);
      toast.success(`${bot.bot_name} started`);
      onRefresh();
    } catch (err) {
      toast.error('Failed to start bot');
    }
  };

  const handlePause = async () => {
    try {
      await pauseBot(bot.id);
      toast.success(`${bot.bot_name} paused`);
      onRefresh();
    } catch (err) {
      toast.error('Failed to pause bot');
    }
  };

  const handleStop = async () => {
    try {
      await stopBot(bot.id);
      toast.success(`${bot.bot_name} stopped`);
      onRefresh();
    } catch (err) {
      toast.error('Failed to stop bot');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBot(bot.id);
      toast.success(`${bot.bot_name} deleted`);
      setShowDeleteDialog(false);
      onRefresh();
    } catch (err) {
      toast.error('Failed to delete bot');
    }
  };

  const strategyLabel = bot.strategy_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{bot.bot_name}</CardTitle>
                <Badge variant="outline" className={`text-xs mt-1 ${strategyColors[bot.strategy_type]}`}>
                  {strategyLabel}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Activity className="h-4 w-4 mr-2" />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[bot.status]} ${bot.status === 'running' ? 'animate-pulse' : ''}`} />
            <span className="text-sm text-muted-foreground capitalize">{bot.status}</span>
          </div>

          {/* Config summary */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">Max Positions</p>
              <p className="font-medium">{bot.config.max_positions || 5}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">Position Size</p>
              <p className="font-medium">{bot.config.position_size_percent || 2}%</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">TP Pips</p>
              <p className="font-medium text-green-500">{bot.config.take_profit_pips || 20}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">SL Pips</p>
              <p className="font-medium text-red-500">{bot.config.stop_loss_pips || 10}</p>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex gap-2 pt-2">
            {bot.status === 'stopped' && (
              <Button className="flex-1" size="sm" onClick={handleStart} disabled={loading}>
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            {bot.status === 'running' && (
              <>
                <Button className="flex-1" variant="outline" size="sm" onClick={handlePause} disabled={loading}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button className="flex-1" variant="destructive" size="sm" onClick={handleStop} disabled={loading}>
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            {bot.status === 'paused' && (
              <>
                <Button className="flex-1" size="sm" onClick={handleStart} disabled={loading}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
                <Button className="flex-1" variant="destructive" size="sm" onClick={handleStop} disabled={loading}>
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            {bot.status === 'error' && (
              <Button className="flex-1" size="sm" onClick={handleStart} disabled={loading}>
                <Play className="h-4 w-4 mr-1" />
                Restart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bot.bot_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
