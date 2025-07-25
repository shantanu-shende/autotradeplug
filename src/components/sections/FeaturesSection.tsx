import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Code2, 
  Brain, 
  DollarSign,
  BarChart3,
  Users,
  Globe,
  Workflow,
  Lock,
  Rocket
} from 'lucide-react';

const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: Code2,
      title: 'No-Code Strategy Builder',
      description: 'Create sophisticated trading algorithms without writing a single line of code using our visual flow builder.',
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Execution',
      description: 'Sub-millisecond order execution with real-time market data integration across multiple exchanges.',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Military-grade encryption, secure API connections, and multi-factor authentication protect your assets.',
      color: 'text-green-400'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms analyze market patterns and optimize your trading strategies.',
      color: 'text-purple-400'
    },
    {
      icon: DollarSign,
      title: 'Monetize Your Strategies',
      description: 'Turn your profitable strategies into income streams by selling them on our marketplace.',
      color: 'text-emerald-400'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive backtesting, performance metrics, and detailed reporting for data-driven decisions.',
      color: 'text-orange-400'
    },
    {
      icon: Globe,
      title: 'Multi-Broker Support',
      description: 'Connect to 15+ major brokers including Zerodha, AngelOne, Upstox, and international platforms.',
      color: 'text-cyan-400'
    },
    {
      icon: Workflow,
      title: 'Smart Automation',
      description: 'Set complex conditions, risk management rules, and let our engine handle everything automatically.',
      color: 'text-indigo-400'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of traders sharing strategies, insights, and collaborating on profitable algorithms.',
      color: 'text-pink-400'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  return (
    <section ref={ref} id="features" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gradient">Everything You Need</span>
            <br />
            <span className="text-foreground">to Trade Smarter</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From beginner-friendly tools to advanced algorithmic trading, 
            AutoTradePlug provides the complete ecosystem for modern traders.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
              }}
              className="group"
            >
              <Card className="trading-card h-full">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="glass-panel max-w-2xl mx-auto p-8">
            <Rocket className="h-12 w-12 text-primary mx-auto mb-4 floating" />
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join over 10,000 traders who have automated their success with AutoTradePlug
            </p>
            <motion.button
              className="glow-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
            >
              Start Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;