import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, Bot, AlertTriangle,
  MoreHorizontal, Eye, Pause, Play, Square, TrendingDown as TrendDown,
  Zap, Target, BarChart3, Clock, ShieldAlert
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useCountUp } from '@/hooks/useCountUp';
import { ActiveStrategyHoverPanel } from './ActiveStrategyHoverPanel';

const DashboardHome = () => {
  const portfolioValue = useCountUp({ end: 29325.77, duration: 2500, prefix: '$', decimals: 2 });
  const activeStrategiesCount = useCountUp({ end: 9, duration: 1500 });
  const todaysPnl = useCountUp({ end: 302.37, duration: 2000, prefix: '+$', decimals: 2 });
  const winRate = useCountUp({ end: 73.2, duration: 2200, suffix: '%', decimals: 1 });

  const stats = [
    { title: 'Total Balance', value: portfolioValue, change: 'New', trend: 'up', icon: DollarSign },
    { title: 'Active Strategies', value: activeStrategiesCount, change: '', trend: 'up', icon: TrendingUp },
    { title: 'Total Profit / Loss', value: todaysPnl, change: '▲ ~1.0%', trend: 'up', icon: TrendingUp },
    { title: 'Win Rate', value: winRate, change: '', trend: 'up', icon: Activity },
  ];

  const activeStrategies = [
    { 
      name: 'Momentum Scalper', status: 'running', pnl: '+$362.50', trades: 12, lastUpdate: '2 min ago',
      icon: Zap,
      details: {
        assets: ['Forex', 'Crypto'], timeframe: '5m', riskMode: 'Moderate', uptime: '14h 32m',
        todayPnl: '+$362.50', weekPnl: '+$1,240.80', monthPnl: '+$4,870.20', winRateVal: '78%', avgRR: '1:2.4', maxDD: '-3.2%',
        openPositions: 4, netExposure: 'Long', topSymbols: ['EUR/USD', 'BTC/USD'], capitalAlloc: '35%',
        lastTrades: ['BUY EUR/USD +$42.10', 'SELL GBP/USD +$18.30', 'BUY BTC/USD -$12.50'],
        lastSignal: 'RSI oversold + MACD cross', lastWarning: null,
      }
    },
    { 
      name: 'Mean Reversion', status: 'running', pnl: '+$280.20', trades: 10, lastUpdate: '5 min ago',
      icon: Activity,
      details: {
        assets: ['Forex'], timeframe: '15m', riskMode: 'Conservative', uptime: '22h 10m',
        todayPnl: '+$280.20', weekPnl: '+$980.50', monthPnl: '+$3,420.00', winRateVal: '82%', avgRR: '1:1.8', maxDD: '-2.1%',
        openPositions: 3, netExposure: 'Neutral', topSymbols: ['GBP/USD', 'USD/JPY'], capitalAlloc: '25%',
        lastTrades: ['BUY GBP/USD +$55.20', 'SELL USD/JPY +$22.40', 'BUY EUR/GBP +$8.90'],
        lastSignal: 'Bollinger squeeze breakout', lastWarning: null,
      }
    },
    { 
      name: 'Breakout Hunter', status: 'running', pnl: '+$175.80', trades: 7, lastUpdate: '8 min ago',
      icon: Target,
      details: {
        assets: ['Crypto', 'Equity'], timeframe: '1h', riskMode: 'Aggressive', uptime: '8h 45m',
        todayPnl: '+$175.80', weekPnl: '+$620.30', monthPnl: '+$2,100.00', winRateVal: '68%', avgRR: '1:3.1', maxDD: '-5.4%',
        openPositions: 2, netExposure: 'Long', topSymbols: ['ETH/USD', 'AAPL'], capitalAlloc: '20%',
        lastTrades: ['BUY ETH/USD +$88.40', 'SELL AAPL +$34.20', 'BUY SOL/USD -$15.60'],
        lastSignal: 'Volume spike + resistance break', lastWarning: null,
      }
    },
    { 
      name: 'Trend Rider', status: 'running', pnl: '+$140.65', trades: 5, lastUpdate: '12 min ago',
      icon: TrendingUp,
      details: {
        assets: ['Forex'], timeframe: '4h', riskMode: 'Moderate', uptime: '48h 20m',
        todayPnl: '+$140.65', weekPnl: '+$520.40', monthPnl: '+$1,890.00', winRateVal: '74%', avgRR: '1:2.0', maxDD: '-4.0%',
        openPositions: 2, netExposure: 'Long', topSymbols: ['EUR/USD', 'AUD/USD'], capitalAlloc: '15%',
        lastTrades: ['BUY EUR/USD +$62.30', 'BUY AUD/USD +$28.10', 'SELL NZD/USD -$8.20'],
        lastSignal: 'EMA 50/200 golden cross', lastWarning: null,
      }
    },
    { 
      name: 'Range Sniper', status: 'running', pnl: '+$86.90', trades: 4, lastUpdate: '15 min ago',
      icon: BarChart3,
      details: {
        assets: ['Forex'], timeframe: '30m', riskMode: 'Conservative', uptime: '6h 15m',
        todayPnl: '+$86.90', weekPnl: '+$310.20', monthPnl: '+$1,050.00', winRateVal: '80%', avgRR: '1:1.5', maxDD: '-1.8%',
        openPositions: 1, netExposure: 'Short', topSymbols: ['USD/CHF'], capitalAlloc: '5%',
        lastTrades: ['SELL USD/CHF +$32.40', 'BUY USD/CHF +$18.70', 'SELL USD/CHF +$12.30'],
        lastSignal: 'Support/resistance bounce', lastWarning: null,
      }
    },
  ];

  const compoundPnl = '+$1,046.05';

  const recentAlerts = [
    { type: 'trade', message: 'Momentum Scalper executed BUY order for EUR/USD', time: '2 min ago' },
    { type: 'error', message: 'Mean Reversion: Insufficient margin warning', time: '5 min ago' },
    { type: 'trade', message: 'Breakout Hunter executed SELL order for ETH/USD', time: '12 min ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="bg-card/40 border-border/30 hover:border-border/50 card-lift">
                <CardContent className="p-5">
                  <div className="text-2xl font-bold tracking-tight mb-1.5">{stat.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.title}</span>
                    {stat.change && (
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  {stat.title === 'Active Strategies' || stat.title === 'Win Rate' ? (
                    <div className="flex justify-end mt-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Active Strategies - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-card/40 border-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Active Strategies</CardTitle>
                <CardDescription className="text-sm">Monitor your running trading bots</CardDescription>
              </div>
              {/* Global Strategy Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border/50">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Global Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Pause className="h-4 w-4 mr-2" /> Pause All Strategies
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrendingUp className="h-4 w-4 mr-2 text-[hsl(var(--success))]" /> Close All Profitable
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrendDown className="h-4 w-4 mr-2 text-destructive" /> Close All Losing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <DollarSign className="h-4 w-4 mr-2" /> Close All Positions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-amber-500 focus:text-amber-500">
                    <ShieldAlert className="h-4 w-4 mr-2" /> Emergency Kill Switch
                    <span className="ml-auto text-[10px] text-muted-foreground">stops execution</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[40px_1fr_140px_160px_120px_40px] items-center px-6 py-2.5 text-[11px] uppercase tracking-wider font-medium text-muted-foreground/70 border-b border-border/20">
              <span>#</span>
              <span>Strategy</span>
              <span>Trades</span>
              <span>P&L</span>
              <span>Updated</span>
              <span />
            </div>
            {/* Mobile header */}
            <div className="lg:hidden px-4 py-2.5 text-[11px] uppercase tracking-wider font-medium text-muted-foreground/70 border-b border-border/20">
              Active Strategies
            </div>

            {/* Strategy Rows */}
            {activeStrategies.map((strategy, index) => {
              const Icon = strategy.icon;
              return (
                <ActiveStrategyRow
                  key={strategy.name}
                  strategy={strategy}
                  index={index + 1}
                  Icon={Icon}
                />
              );
            })}

            {/* Compound P&L Summary */}
            <div className="hidden lg:grid grid-cols-[40px_1fr_140px_160px_120px_40px] items-center px-6 py-4 border-t border-border/20 bg-muted/5">
              <span />
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Live Automation P&L (Running Only)</span>
              <span />
              <span className="text-lg font-bold tracking-tight text-[hsl(var(--success))]">{compoundPnl}</span>
              <span />
              <span />
            </div>
            {/* Mobile P&L summary */}
            <div className="lg:hidden flex items-center justify-between px-4 py-4 border-t border-border/20 bg-muted/5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Live P&L</span>
              <span className="text-lg font-bold tracking-tight text-[hsl(var(--success))]">{compoundPnl}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card/40 border-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
                <CardDescription className="text-sm">Latest system notifications</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs border-border/40">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-xl bg-muted/20 row-hover"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  alert.type === 'trade' ? 'bg-[hsl(var(--success))]' : 
                  alert.type === 'error' ? 'bg-[hsl(var(--warning))]' : 'bg-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
                {alert.type === 'error' && (
                  <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))] flex-shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

/* ─── Individual Strategy Row with hover panel & 3-dot menu ─── */

interface StrategyRowProps {
  strategy: any;
  index: number;
  Icon: any;
}

const ActiveStrategyRow = ({ strategy, index, Icon }: StrategyRowProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-[40px_1fr_140px_160px_120px_40px] items-center px-6 py-3.5 row-hover border-b border-border/10 last:border-b-0 hidden lg:grid">
        {/* # */}
        <span className="text-sm font-medium text-muted-foreground">{index}</span>

        {/* Strategy Name + Badges */}
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{strategy.name}</span>
          <Badge className="text-[10px] h-5 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0 font-normal">
            {strategy.status}
          </Badge>
          {strategy.details?.riskMode && (
            <Badge variant="outline" className="text-[10px] h-5 border-border/40 font-normal">
              {strategy.details.riskMode}
            </Badge>
          )}
        </div>

        {/* Trades */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">{strategy.trades} trades today</span>
          <TrendingUp className="h-3 w-3 text-muted-foreground/50" />
        </div>

        {/* P&L */}
        <span className={`text-sm font-semibold ${
          strategy.pnl.startsWith('+') ? 'text-[hsl(var(--success))]' : 'text-destructive'
        }`}>
          {strategy.pnl}
        </span>

        {/* Last Update */}
        <span className="text-xs text-muted-foreground">{strategy.lastUpdate}</span>

        {/* 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/40 press-scale">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-popover border-border/50">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Safe Actions</DropdownMenuLabel>
            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Full Details</DropdownMenuItem>
            <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause Strategy</DropdownMenuItem>
            <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Restart Strategy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Conditional</DropdownMenuLabel>
            <DropdownMenuItem>
              <TrendingUp className="h-4 w-4 mr-2 text-[hsl(var(--success))]" /> Close Profitable Positions
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TrendDown className="h-4 w-4 mr-2 text-destructive/70" /> Close Losing Positions
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Activity className="h-4 w-4 mr-2" /> Reduce Exposure 50%
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-destructive/60">Destructive</DropdownMenuLabel>
            <DropdownMenuItem className="text-destructive/80 focus:text-destructive/80">
              <DollarSign className="h-4 w-4 mr-2" /> Close All Positions
              <span className="ml-auto text-[10px] text-muted-foreground">confirm</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive/80 focus:text-destructive/80">
              <Square className="h-4 w-4 mr-2" /> Stop Strategy
              <span className="ml-auto text-[10px] text-muted-foreground">confirm</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile strategy row */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3.5 row-hover border-b border-border/10 last:border-b-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs text-muted-foreground w-5 flex-shrink-0">{index}</span>
          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-medium text-sm truncate block">{strategy.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-semibold ${
                strategy.pnl.startsWith('+') ? 'text-[hsl(var(--success))]' : 'text-destructive'
              }`}>{strategy.pnl}</span>
              <span className="text-[10px] text-muted-foreground">{strategy.trades} trades</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className="text-[10px] h-5 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0 font-normal">
            {strategy.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/40 press-scale">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover border-border/50">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
              <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause</DropdownMenuItem>
              <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Restart</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive/80 focus:text-destructive/80">
                <Square className="h-4 w-4 mr-2" /> Stop Strategy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hover Analysis Panel - desktop only */}
      <div className="hidden lg:block">
        <ActiveStrategyHoverPanel isVisible={isHovered} details={strategy.details} />
      </div>
    </div>
  );
};

export default DashboardHome;
