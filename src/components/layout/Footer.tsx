import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { 
  Youtube, 
  Instagram, 
  Twitter, 
  Linkedin,
  ChevronUp,
  Star
} from 'lucide-react';

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  const footerLinks = {
    assets: [
      { label: 'Stocks', href: '#' },
      { label: 'Mutual Funds', href: '#' },
    ],
    tools: [
      { label: 'Strategy Builder', href: '#' },
      { label: 'Backtester', href: '#' },
      { label: 'Broker Integrations', href: '#' },
      { label: 'Risk Profiler', href: '#' },
    ],
    learn: [
      { label: 'Blog', href: '#' },
      { label: 'Glossary', href: '#' },
      { label: 'Tutorials', href: '#' },
      { label: 'Webinars', href: '#' },
    ],
    finePrint: [
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Disclosures', href: '#' },
      { label: 'Community Guidelines', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer ref={ref} className="relative bg-slate-900 text-slate-200 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-900 to-slate-950"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-6 gap-8"
          >
            {/* Company Info */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ATP</span>
                </div>
                <span className="text-xl font-bold text-white">AutoTradePlug</span>
              </div>
              <p className="text-lg font-medium text-slate-300 mb-4">
                Automate your trading, effortlessly.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                Deploy, test, and monetize trading strategies without writing a single line of code. 
                Connect your broker, choose a strategy, and let AI handle the rest.
              </p>
              <div className="text-sm text-slate-400 mb-6">
                <p className="font-medium text-slate-300 mb-1">AutoTradePlug Technologies Pvt Ltd</p>
                <p>123 Innovation Street, Tech Park</p>
                <p>Bengaluru, Karnataka - 560001</p>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Assets */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Assets</h3>
              <ul className="space-y-3">
                {footerLinks.assets.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-slate-400 hover:text-primary transition-colors story-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Tools */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Tools</h3>
              <ul className="space-y-3">
                {footerLinks.tools.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-slate-400 hover:text-primary transition-colors story-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Learn & Share */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Learn & Share</h3>
              <ul className="space-y-3">
                {footerLinks.learn.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-slate-400 hover:text-primary transition-colors story-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Fine Print */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Fine Print</h3>
              <ul className="space-y-3">
                {footerLinks.finePrint.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-slate-400 hover:text-primary transition-colors story-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8 }}
          className="border-t border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Help & Support */}
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-slate-400">
                  Help & Support: 
                  <a href="mailto:support@autotradeplug.com" className="text-primary ml-1 hover:underline">
                    support@autotradeplug.com
                  </a>
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-slate-400">Loving AutoTradePlug? Rate Us</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">4.7</span>
                  </div>
                  <span className="text-slate-400">App Rating</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg z-50 group"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ delay: 1 }}
      >
        <ChevronUp className="h-6 w-6 text-white group-hover:translate-y-[-2px] transition-transform" />
      </motion.button>
    </footer>
  );
};

export default Footer;