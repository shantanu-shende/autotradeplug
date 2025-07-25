import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Shield,
  Zap,
  BarChart3,
  Users,
  Lock
} from 'lucide-react';

const DashboardPreview = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const portfolioData = {
    value: '$32,450',
    change: '+$1,259',
    changePercent: '+4.03%',
    isPositive: true,
  };

  const strategies = [
    {
      name: 'Growth Alpha',
      risk: 'Medium',
      returns: '+25%',
      isActive: true,
      trend: 'up',
    },
    {
      name: 'Momentum Rider',
      risk: 'Medium',
      returns: '+35%',
      isActive: true,
      trend: 'up',
    },
    {
      name: 'Trend Navigator',
      risk: 'Low',
      returns: '+18%',
      isActive: false,
      trend: 'up',
    },
  ];

  const positions = [
    { name: 'Growth Alpha', risk: 'Medium', action: 'BUY', status: 'Active' },
    { name: 'Momentum Rider', risk: 'Medium', action: 'SELL', status: 'Active' },
    { name: 'Trend Navigator', risk: 'Low', action: 'TRX', status: 'Pending' },
  ];

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gradient">Complete Trading Dashboard</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor your portfolio, track performance, and manage strategies from one unified interface
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Portfolio Overview */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring' as const, stiffness: 300 }}
          >
            <Card className="trading-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Portfolio Value</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold">{portfolioData.value}</span>
                    <Badge className={`${portfolioData.isPositive ? 'profit-bg' : 'loss-bg'} border px-2 py-1`}>
                      {portfolioData.isPositive ? '+' : ''}{portfolioData.changePercent}
                    </Badge>
                  </div>
                  <p className={`text-sm ${portfolioData.isPositive ? 'text-profit' : 'text-loss'}`}>
                    {portfolioData.change} today
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="glow-button">Growth</Button>
                  <Button size="sm" variant="outline">Activate</Button>
                </div>
              </div>
              
              {/* Mock Chart */}
              <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg flex items-end justify-center relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100">
                  <path
                    d="M 0 80 Q 50 60 100 65 T 200 55 T 300 45 T 400 40"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M 0 80 Q 50 60 100 65 T 200 55 T 300 45 T 400 40 L 400 100 L 0 100 Z"
                    fill="url(#gradient)"
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </Card>

            {/* Strategy Store */}
            <Card className="trading-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Strategy Store</h3>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View all →
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.name}
                    className="strategy-card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{strategy.name}</h4>
                      {strategy.isActive && (
                        <div className="w-2 h-2 bg-success rounded-full pulse-glow"></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Risk</span>
                        <span>{strategy.risk}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Returns</span>
                        <span className="text-success font-medium">{strategy.returns}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Broker Connection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="trading-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Broker API</h3>
                  <Lock className="h-4 w-4 text-success" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Secure and Encrypted</p>
                  <Button size="sm" className="w-full glow-button">
                    Connect
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Active Positions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="trading-card">
                <h3 className="font-semibold mb-4">Dashboard</h3>
                <div className="space-y-3">
                  {positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{position.name}</div>
                        <div className="text-xs text-muted-foreground">{position.risk}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium">{position.action}</div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${position.status === 'Active' ? 'profit-bg' : 'border-warning text-warning'}`}
                        >
                          {position.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="w-full mt-4 text-primary">
                  View Details →
                </Button>
              </Card>
            </motion.div>

            {/* Billing */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="trading-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Billing</h3>
                  <Badge variant="outline" className="border-primary text-primary">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Unlock premium plan</p>
                <Button size="sm" className="w-full glow-button">
                  Upgrade
                </Button>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;