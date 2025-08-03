import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, DollarSign, Bot, AlertTriangle } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import MarketOverviewCard from '@/components/market/MarketOverviewCard';
import SuggestedStrategyCard from '@/components/strategy/SuggestedStrategyCard';
import BrokerConnectionDashboard from '@/components/broker/BrokerConnectionDashboard';

const DashboardHome = () => {
  // Animated values using useCountUp hook
  const portfolioValue = useCountUp({ end: 24580, duration: 2500, prefix: '$', suffix: '.00' });
  const activeStrategiesCount = useCountUp({ end: 8, duration: 1500 });
  const todaysPnl = useCountUp({ end: 342.5, duration: 2000, prefix: '+$', decimals: 2 });
  const winRate = useCountUp({ end: 73.2, duration: 2200, suffix: '%', decimals: 1 });

  const stats = [
    {
      title: 'Portfolio Value',
      value: portfolioValue,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Active Strategies',
      value: activeStrategiesCount,
      change: '+2 this week',
      trend: 'up',
      icon: Bot,
    },
    {
      title: 'Today\'s P&L',
      value: todaysPnl,
      change: '+2.8%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Win Rate',
      value: winRate,
      change: '+1.2%',
      trend: 'up',
      icon: Activity,
    },
  ];

  const activeStrategies = [
    { name: 'Momentum Scalper', status: 'running', pnl: '+$125.50', trades: 12 },
    { name: 'Mean Reversion', status: 'running', pnl: '+$87.20', trades: 8 },
    { name: 'Breakout Hunter', status: 'paused', pnl: '+$45.80', trades: 4 },
    { name: 'Grid Trading', status: 'running', pnl: '-$23.10', trades: 15 },
  ];

  const recentAlerts = [
    { type: 'trade', message: 'Momentum Scalper executed BUY order for AAPL', time: '2 min ago' },
    { type: 'error', message: 'Mean Reversion: Insufficient margin', time: '5 min ago' },
    { type: 'trade', message: 'Breakout Hunter executed SELL order for TSLA', time: '12 min ago' },
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
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-panel">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-500' : 'text-destructive'}>
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Strategies */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Strategies</CardTitle>
                  <CardDescription>Monitor your running trading bots</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeStrategies.map((strategy, index) => (
                <motion.div
                  key={strategy.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      strategy.status === 'running' ? 'bg-green-500 pulse-glow' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{strategy.name}</p>
                      <p className="text-xs text-muted-foreground">{strategy.trades} trades today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      strategy.pnl.startsWith('+') ? 'text-green-500' : 'text-destructive'
                    }`}>
                      {strategy.pnl}
                    </p>
                    <Badge variant={strategy.status === 'running' ? 'default' : 'secondary'} className="text-xs">
                      {strategy.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>Latest system notifications</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'trade' ? 'bg-green-500' : 'bg-destructive'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                  {alert.type === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </div>
  );
};

export default DashboardHome;