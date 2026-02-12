import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, Bot, AlertTriangle,
  MoreHorizontal, Eye, Pause, Play, Square, TrendingDown as TrendDown,
  Zap, Target, BarChart3, Clock, ShieldAlert, ChevronDown
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
      icon: Zap, heartbeat: 'healthy' as const,
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
      icon: Activity, heartbeat: 'healthy' as const,
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
      icon: Target, heartbeat: 'delayed' as const,
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
      icon: TrendingUp, heartbeat: 'healthy' as const,
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
      icon: BarChart3, heartbeat: 'paused' as const,
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
                {/* Heartbeat indicator with multi-state */}
                <HeartbeatIndicator status="healthy" />
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
            <div className="hidden lg:grid grid-cols-[32px_1.4fr_100px_120px_100px_36px] items-center px-5 py-2 text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60 border-b border-border/15">
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
            <div className="relative">
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
              <div className="flex items-center justify-between px-4 sm:px-5 py-4 bg-muted/8">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-[hsl(var(--success))]/30" />
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">Live Automation P&L</span>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">5 strategies · all running</p>
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[hsl(var(--success))]">{compoundPnl}</span>
              </div>
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

/* ─── Heartbeat Indicator ─── */

type HeartbeatStatus = 'healthy' | 'delayed' | 'paused' | 'disconnected';

const heartbeatConfig: Record<HeartbeatStatus, { label: string; className: string }> = {
  healthy: { label: 'Live', className: 'heartbeat-healthy' },
  delayed: { label: 'Delayed', className: 'heartbeat-delayed' },
  paused: { label: 'Paused', className: 'heartbeat-paused' },
  disconnected: { label: 'Offline', className: 'heartbeat-disconnected' },
};

const HeartbeatIndicator = ({ status }: { status: HeartbeatStatus }) => {
  const config = heartbeatConfig[status];
  const textColor = status === 'healthy' ? 'text-[hsl(var(--success))]'
    : status === 'delayed' ? 'text-[hsl(var(--warning))]'
    : status === 'paused' ? 'text-muted-foreground'
    : 'text-destructive/70';
  const bgColor = status === 'healthy' ? 'bg-[hsl(var(--success))]/8 border-[hsl(var(--success))]/15'
    : status === 'delayed' ? 'bg-[hsl(var(--warning))]/8 border-[hsl(var(--warning))]/15'
    : status === 'paused' ? 'bg-muted/20 border-border/20'
    : 'bg-destructive/8 border-destructive/15';

  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border ${bgColor}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.className}`} />
      <span className={`text-[10px] font-medium ${textColor}`}>{config.label}</span>
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
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [mobileTab, setMobileTab] = useState('overview');

  const heartbeatStatus: HeartbeatStatus = strategy.heartbeat || 'healthy';
  const hbClass = heartbeatConfig[heartbeatStatus].className;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop row */}
      <div className="hidden lg:grid grid-cols-[32px_1.4fr_100px_120px_100px_36px] items-center px-5 py-3 row-hover border-b border-border/10 last:border-b-0">
        <span className="text-xs text-muted-foreground/60 font-medium">{index}</span>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <Icon className="h-4 w-4 text-primary" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-[6px] h-[6px] rounded-full ${hbClass}`} />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-sm truncate block">{strategy.name}</span>
            <span className="text-[10px] text-muted-foreground/50 leading-none">
              {strategy.details?.assets?.join(' · ')} · {strategy.details?.timeframe} · {strategy.details?.riskMode}
            </span>
          </div>
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

      {/* Mobile row — tap to expand */}
      <div className="lg:hidden border-b border-border/10 last:border-b-0">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full flex items-center gap-3 px-4 py-3 row-hover text-left"
        >
          <span className="text-[10px] text-muted-foreground/50 w-4 text-center flex-shrink-0">{index}</span>
          <div className="relative flex-shrink-0">
            <Icon className="h-4 w-4 text-primary" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-[5px] h-[5px] rounded-full ${hbClass}`} />
          </div>
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
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 transition-transform duration-200 ${isMobileExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile inline drawer */}
        <div className={`expand-drawer ${isMobileExpanded ? 'is-open' : ''}`}>
          <div>
            <div className="px-4 pb-3">
              {/* Mobile tabs */}
              <div className="flex gap-1 mb-3 border-b border-border/15 pb-2">
                {(['overview', 'performance', 'exposure', 'activity'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMobileTab(tab)}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-md tab-smooth ${
                      mobileTab === tab ? 'bg-muted/30 text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="text-xs space-y-2">
                {mobileTab === 'overview' && strategy.details && (
                  <>
                    <MobileRow label="Assets" value={strategy.details.assets.join(', ')} />
                    <MobileRow label="Timeframe" value={strategy.details.timeframe} />
                    <MobileRow label="Risk Mode" value={strategy.details.riskMode} />
                    <MobileRow label="Uptime" value={strategy.details.uptime} />
                  </>
                )}
                {mobileTab === 'performance' && strategy.details && (
                  <>
                    <MobileRow label="Today P&L" value={strategy.details.todayPnl} valueClass="text-[hsl(var(--success))]" />
                    <MobileRow label="7D P&L" value={strategy.details.weekPnl} valueClass="text-[hsl(var(--success))]" />
                    <MobileRow label="Win Rate" value={strategy.details.winRateVal} />
                    <MobileRow label="Max DD" value={strategy.details.maxDD} />
                  </>
                )}
                {mobileTab === 'exposure' && strategy.details && (
                  <>
                    <MobileRow label="Open Positions" value={String(strategy.details.openPositions)} />
                    <MobileRow label="Net Exposure" value={strategy.details.netExposure} />
                    <MobileRow label="Capital" value={strategy.details.capitalAlloc} />
                  </>
                )}
                {mobileTab === 'activity' && strategy.details && (
                  <div className="space-y-1">
                    {strategy.details.lastTrades.map((t: string, i: number) => (
                      <div key={i} className="text-[11px] py-1 px-2 rounded bg-muted/15">{t}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mt-3 pt-2 border-t border-border/10">
                <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1 border-border/30 press-scale">
                  <Pause className="h-3 w-3 mr-1" /> Pause
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1 border-border/30 press-scale">
                  <Eye className="h-3 w-3 mr-1" /> Details
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] border-destructive/30 text-destructive/70 press-scale">
                  <Square className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Analysis Panel — desktop only */}
      <div className="hidden lg:block">
        <ActiveStrategyHoverPanel isVisible={isHovered} details={strategy.details} />
      </div>
    </div>
  );
};

const MobileRow = ({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default DashboardHome;
