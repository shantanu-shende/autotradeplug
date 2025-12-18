import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Chrome, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingScreen from './LoadingScreen';
import AlreadyRegisteredModal from './AlreadyRegisteredModal';
import WelcomeModal from './WelcomeModal';

interface EnhancedAuthFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  const { signUp, signIn, signInWithGoogle } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const extractFirstName = (fullName: string, email: string): string => {
    if (fullName && fullName.trim()) {
      return fullName.trim().split(' ')[0];
    }
    const emailName = email.split('@')[0].split('.')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      
      if (error) {
        // Check for "already registered" error
        if (error.message.includes('already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('User already registered')) {
          // Show already registered modal
          setShowAlreadyRegistered(true);
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        // New user - show welcome modal
        const firstName = extractFirstName(formData.fullName, formData.email);
        setWelcomeName(firstName);
        setIsReturningUser(false);
        setShowWelcome(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        // Returning user - show welcome back modal
        const firstName = extractFirstName('', formData.email);
        setWelcomeName(firstName);
        setIsReturningUser(true);
        setShowWelcome(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast({
            title: "Google Sign-In Unavailable",
            description: "Google authentication is not configured. Please use email sign-in.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Google Sign-In Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Signing In",
          description: "Please wait while we verify your account...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred with Google sign-in",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAlreadyRegisteredSignIn = (firstName: string) => {
    setShowAlreadyRegistered(false);
    setWelcomeName(firstName);
    setIsReturningUser(true);
    // Show message that account exists
    toast({
      title: "Account already exists",
      description: "Signing you in securely...",
    });
    setShowWelcome(true);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    onSuccess();
  };

  if (googleLoading) {
    return <LoadingScreen message="Signing in with Google..." />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md border-0 bg-background/95 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-primary rounded opacity-80"></div>
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl">Welcome to Auto Trade Plug</CardTitle>
              <CardDescription>
                Your gateway to automated trading
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Sign-In Button */}
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-11 hover-scale"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Forms */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full hover-scale">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full hover-scale">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Security Trust Signals */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure Login</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-bit Encryption</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Already Registered Modal */}
      <AlreadyRegisteredModal
        isOpen={showAlreadyRegistered}
        onClose={() => setShowAlreadyRegistered(false)}
        email={formData.email}
        onSignInSuccess={handleAlreadyRegisteredSignIn}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
        firstName={welcomeName}
        isReturningUser={isReturningUser}
      />
    </>
  );
};

export default EnhancedAuthForm;