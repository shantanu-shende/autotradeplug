import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface PinVerificationProps {
  onPinVerified: () => void;
  onForgotPin: () => void;
  onLogout: () => void;
}

const PinVerification: React.FC<PinVerificationProps> = ({
  onPinVerified,
  onForgotPin,
  onLogout
}) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const maxAttempts = 3;

  const verifyPin = async () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 4-digit PIN",
        variant: "destructive"
      });
      return;
    }

    if (isLocked) {
      toast({
        title: "Account Locked",
        description: "Too many failed attempts. Please use 'Forgot PIN?' option.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get user profile with PIN hash
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('pin_hash')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!profile?.pin_hash) {
        toast({
          title: "PIN Not Set",
          description: "Please contact support to set up your PIN",
          variant: "destructive"
        });
        return;
      }

      // Verify PIN
      const isValidPin = await bcrypt.compare(pin, profile.pin_hash);

      if (isValidPin) {
        toast({
          title: "PIN Verified",
          description: "Welcome back!",
        });
        onPinVerified();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');

        if (newAttempts >= maxAttempts) {
          setIsLocked(true);
          toast({
            title: "Account Locked",
            description: `Too many failed attempts. Please use 'Forgot PIN?' to reset.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Incorrect PIN",
            description: `${maxAttempts - newAttempts} attempts remaining`,
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify PIN",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md border-0 bg-background/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          {/* Logo placeholder */}
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded opacity-80"></div>
          </div>
          
          <div>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              Enter your 4-digit PIN to continue
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">Enter PIN</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPin(!showPin)}
                  className="h-auto p-1"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <InputOTP
                value={pin}
                onChange={setPin}
                maxLength={4}
                type={showPin ? "text" : "password"}
                disabled={isLocked}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {attempts > 0 && !isLocked && (
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  {maxAttempts - attempts} attempts remaining
                </p>
              </div>
            )}

            {isLocked && (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">Account locked due to multiple failed attempts</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={verifyPin} 
              disabled={loading || pin.length !== 4 || isLocked}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock'
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={onForgotPin}
              className="w-full"
            >
              Forgot PIN?
            </Button>

            <Button 
              variant="ghost" 
              onClick={onLogout}
              className="w-full text-sm text-muted-foreground"
            >
              Sign out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Your data is protected with end-to-end encryption
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinVerification;