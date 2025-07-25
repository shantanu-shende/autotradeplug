import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Github, Chrome, Shield, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'verify' | 'success'>('login');

  const handleEmailAuth = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAuthStep('verify');
    setIsLoading(false);
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAuthStep('success');
    setTimeout(() => {
      onAuthSuccess();
      onClose();
    }, 1500);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-gradient">
            {authStep === 'login' && 'Join AutoTradePlug'}
            {authStep === 'verify' && 'Check Your Email'}
            {authStep === 'success' && 'Welcome Aboard!'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {authStep === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-panel"
                    />
                  </div>
                  <Button 
                    onClick={handleEmailAuth}
                    disabled={isLoading || !email}
                    className="w-full glow-button"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Continue with Email
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-panel"
                    />
                  </div>
                  <Button 
                    onClick={handleEmailAuth}
                    disabled={isLoading || !email}
                    className="w-full glow-button"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                  className="glass-panel hover:bg-muted/50"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('github')}
                  disabled={isLoading}
                  className="glass-panel hover:bg-muted/50"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </motion.div>
          )}

          {authStep === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  We've sent a magic link to
                </p>
                <p className="font-medium">{email}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setAuthStep('login')}
                className="glass-panel"
              >
                Use Different Email
              </Button>
            </motion.div>
          )}

          {authStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-gradient">Authentication Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your dashboard...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;