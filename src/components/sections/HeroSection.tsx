import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, TrendingUp, Zap, Shield } from 'lucide-react';

interface HeroSectionProps {
  onAuthClick: () => void;
}

const HeroSection = ({ onAuthClick }: HeroSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  const stats = [
    { label: 'Active Strategies', value: '500+', icon: TrendingUp },
    { label: 'Trades Executed', value: '1M+', icon: Zap },
    { label: 'Success Rate', value: '94%', icon: Shield },
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-dark"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl floating"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl floating" style={{ animationDelay: '-1.5s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="space-y-8"
        >
          {/* Main Headline */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient">Automate Your Trading</span>
              <br />
              <span className="text-foreground">in 3 Simple Steps</span>
            </h1>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Deploy, test, and monetize trading strategies without writing a single line of code. 
              Connect your broker, choose a strategy, and let AI handle the rest.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="glow-button text-lg px-8 py-4 group"
              onClick={onAuthClick}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-border hover:border-primary/50 group">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Three Steps */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                step: '01',
                title: 'Connect Your Broker',
                description: 'Securely link your trading account',
                icon: '🔗',
              },
              {
                step: '02',
                title: 'Choose A Strategy',
                description: 'Pick from 500+ proven algorithms',
                icon: '📊',
              },
              {
                step: '03',
                title: 'Activate Auto Trade',
                description: 'Sit back and watch profits grow',
                icon: '⚡',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="trading-card text-center group"
                whileHover={{ y: -10 }}
                transition={{ type: 'spring' as const, stiffness: 300 }}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-sm text-primary font-semibold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;