import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

interface PinSetupProps {
  phoneNumber: string;
  onPinSetup: () => void;
  onBack: () => void;
}

const PinSetup: React.FC<PinSetupProps> = ({
  phoneNumber,
  onPinSetup,
  onBack
}) => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleCreatePin = () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive"
      });
      return;
    }

    setStep('confirm');
    setConfirmPin('');
  };

  const handleConfirmPin = async () => {
    if (confirmPin !== pin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs don't match. Please try again.",
        variant: "destructive"
      });
      setConfirmPin('');
      return;
    }

    setLoading(true);
    try {
      // Call server-side PIN operations Edge Function
      const { data, error } = await supabase.functions.invoke('pin-operations', {
        body: {
          action: 'set',
          pin: pin,
          phone_number: phoneNumber
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to set PIN');
      }

      // Also update auth metadata
      await supabase.auth.updateUser({
        data: { 
          onboarding_complete: true,
          phone_number: phoneNumber
        }
      });

      toast({
        title: "Setup Complete",
        description: "Your account has been successfully configured",
      });

      onPinSetup();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup PIN",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPin = () => {
    setStep('create');
    setPin('');
    setConfirmPin('');
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
            <CardTitle className="text-2xl">
              {step === 'create' ? 'Create App PIN' : 'Confirm Your PIN'}
            </CardTitle>
            <CardDescription>
              {step === 'create' 
                ? 'Set a 4-digit PIN to secure your account'
                : 'Re-enter your PIN to confirm'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {step === 'create' ? 'Enter 4-digit PIN' : 'Confirm PIN'}
                </p>
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
                value={step === 'create' ? pin : confirmPin}
                onChange={step === 'create' ? setPin : setConfirmPin}
                maxLength={4}
                type={showPin ? "text" : "password"}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {step === 'create' && (
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Choose a PIN you'll remember easily
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Avoid simple patterns (1234, 0000)</p>
                  <p>• Use a unique combination</p>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Your PIN will be used for secure access
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {step === 'create' ? (
              <>
                <Button 
                  onClick={handleCreatePin} 
                  disabled={pin.length !== 4}
                  className="w-full"
                >
                  Continue
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="w-full"
                >
                  Back
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleConfirmPin} 
                  disabled={loading || confirmPin.length !== 4}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetPin}
                  className="w-full"
                >
                  Change PIN
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Your PIN is encrypted and stored securely
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinSetup;