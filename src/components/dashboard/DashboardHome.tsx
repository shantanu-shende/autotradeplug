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
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="bg-card/40 border-border/30 hover:border-border/50 card-lift">
              <CardContent className="p-4 sm:p-5">
                <div className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs text-muted-foreground">{stat.title}</span>
                  {stat.change && (
                    <span className={`text-[10px] sm:text-xs ${stat.trend === 'up' ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Strategies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-card/40 border-border/30">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold">Active Strategies</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Live automation monitoring</CardDescription>
                </div>
                {/* Heartbeat indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[hsl(var(--success))]/8 border border-[hsl(var(--success))]/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] pulse-glow" />
                  <span className="text-[10px] text-[hsl(var(--success))] font-medium">Live</span>
                </div>
              </div>
              {/* Global Strategy Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 press-scale">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border/50">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Global Actions</DropdownMenuLabel>
                  <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause All Strategies</DropdownMenuItem>
                  <DropdownMenuItem><TrendingUp className="h-4 w-4 mr-2 text-[hsl(var(--success))]" /> Close All Profitable</DropdownMenuItem>
                  <DropdownMenuItem><TrendDown className="h-4 w-4 mr-2 text-destructive" /> Close All Losing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><DollarSign className="h-4 w-4 mr-2" /> Close All Positions</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-amber-500 focus:text-amber-500">
                    <ShieldAlert className="h-4 w-4 mr-2" /> Emergency Kill Switch
                    <span className="ml-auto text-[10px] text-muted-foreground">stops exec</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-[32px_1fr_100px_120px_100px_36px] items-center px-5 py-2 text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60 border-b border-border/15">
              <span>#</span>
              <span>Strategy</span>
              <span>Trades</span>
              <span>P&L</span>
              <span>Last Exec</span>
              <span />
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
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-t border-border/20 bg-muted/5">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">Live Automation P&L</span>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[hsl(var(--success))]">{compoundPnl}</span>
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
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold">Recent Activity</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-[11px] border-border/40 press-scale">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-1.5">
            {recentAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 row-hover"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.type === 'trade' ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--warning))]'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

/* ─── Individual Strategy Row ─── */

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
      {/* Desktop row */}
      <div className="hidden lg:grid grid-cols-[32px_1fr_100px_120px_100px_36px] items-center px-5 py-3 row-hover border-b border-border/10 last:border-b-0">
        <span className="text-xs text-muted-foreground/60 font-medium">{index}</span>

        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-medium text-sm truncate">{strategy.name}</span>
          <Badge variant="outline" className="text-[10px] h-[18px] border-border/30 text-muted-foreground font-normal">
            {strategy.details?.riskMode}
          </Badge>
        </div>

        <span className="text-xs text-muted-foreground">{strategy.trades} today</span>

        <span className={`text-sm font-semibold ${
          strategy.pnl.startsWith('+') ? 'text-[hsl(var(--success))]' : 'text-destructive'
        }`}>
          {strategy.pnl}
        </span>

        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[11px] text-muted-foreground">{strategy.lastUpdate}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted/40 press-scale">
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-popover border-border/50">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Safe</DropdownMenuLabel>
            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
            <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause Strategy</DropdownMenuItem>
            <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Restart Strategy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Conditional</DropdownMenuLabel>
            <DropdownMenuItem><TrendingUp className="h-4 w-4 mr-2 text-[hsl(var(--success))]" /> Close Profitable</DropdownMenuItem>
            <DropdownMenuItem><TrendDown className="h-4 w-4 mr-2 text-destructive/70" /> Close Losing</DropdownMenuItem>
            <DropdownMenuItem><Activity className="h-4 w-4 mr-2" /> Reduce Exposure 50%</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-destructive/50">Destructive</DropdownMenuLabel>
            <DropdownMenuItem className="text-destructive/80 focus:text-destructive/80">
              <DollarSign className="h-4 w-4 mr-2" /> Close All Positions
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive/80 focus:text-destructive/80">
              <Square className="h-4 w-4 mr-2" /> Stop Strategy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile row — tap-friendly, no hover */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 row-hover border-b border-border/10 last:border-b-0">
        <span className="text-[10px] text-muted-foreground/50 w-4 text-center flex-shrink-0">{index}</span>
        <Icon className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{strategy.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-semibold ${
              strategy.pnl.startsWith('+') ? 'text-[hsl(var(--success))]' : 'text-destructive'
            }`}>{strategy.pnl}</span>
            <span className="text-[10px] text-muted-foreground">{strategy.trades} trades</span>
            <span className="text-[10px] text-muted-foreground/50">· {strategy.lastUpdate}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/40 press-scale flex-shrink-0">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-popover border-border/50">
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

      {/* Hover Analysis Panel — desktop only */}
      <div className="hidden lg:block">
        <ActiveStrategyHoverPanel isVisible={isHovered} details={strategy.details} />
      </div>
    </div>
  );
};

export default DashboardHome;
