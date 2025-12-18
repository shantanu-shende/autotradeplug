import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Shield, CheckCircle } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  isReturningUser?: boolean;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  firstName,
  isReturningUser = false
}) => {
  // Auto-dismiss after animation if needed
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        // Optional: auto-close after 5 seconds
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.8],
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * -100 - 20],
      transition: {
        duration: 2,
        delay: i * 0.1,
        repeat: Infinity,
        repeatDelay: 1
      }
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-b from-background via-background to-primary/5 backdrop-blur-xl p-0 overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative p-8"
            >
              {/* Floating Particles Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={particleVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute w-2 h-2 rounded-full bg-primary/30"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: '40%'
                    }}
                  />
                ))}
              </div>

              {/* Main Content */}
              <div className="relative z-10 text-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.1 
                  }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <Sparkles className="w-10 h-10 text-primary" />
                  </motion.div>
                </motion.div>

                {/* Welcome Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2 mb-6"
                >
                  <h2 className="text-2xl font-bold text-foreground">
                    {isReturningUser ? (
                      <>Welcome back, {firstName} 👋</>
                    ) : (
                      <>Welcome to Auto Trade Plug, {firstName}! 🎉</>
                    )}
                  </h2>
                  <p className="text-muted-foreground">
                    {isReturningUser 
                      ? "Your trading dashboard is ready. Let's continue your journey with Auto Trade Plug."
                      : "Your trading journey starts now. Explore automated strategies and take control of your investments."
                    }
                  </p>
                </motion.div>

                {/* Trust Signals */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-4 mb-8"
                >
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure Login</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isReturningUser ? 'OTP Verified' : 'Account Created'}</span>
                  </div>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 gap-3 mb-8"
                >
                  <div className="p-3 rounded-xl bg-muted/50 text-left">
                    <TrendingUp className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-medium text-foreground">Smart Strategies</p>
                    <p className="text-xs text-muted-foreground">AI-powered trading</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-left">
                    <Shield className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-medium text-foreground">Bank-Grade Security</p>
                    <p className="text-xs text-muted-foreground">256-bit encryption</p>
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    onClick={onClose}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Start Trading
                  </Button>
                </motion.div>

                {/* Security Footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-xs text-muted-foreground"
                >
                  Your data is protected with industry-standard encryption
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
