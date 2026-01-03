import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Phone, Shield } from 'lucide-react';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  onBack: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationComplete,
  onBack
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return cleaned.substring(0, 10).replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Hash the OTP before storing
      const { data: hashedOtp, error: hashError } = await supabase
        .rpc('hash_otp_code', { otp_code: otpCode });

      if (hashError) {
        throw new Error("Failed to generate secure OTP");
      }

      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: phoneNumber.replace(/\D/g, ''),
          otp_code: hashedOtp,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        if (error.message.includes('can_request_otp') || error.message.includes('rate limit')) {
          throw new Error("Too many OTP requests. Please wait 15 minutes before trying again.");
        }
        throw error;
      }
      // In production, this OTP would be sent via SMS using a service like Twilio
      // The OTP is already securely hashed and stored in the database
      // User will enter the code they received via SMS for server-side verification
      // TODO: Integrate SMS provider here - await sendSMS(phoneNumber, otpCode);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });

      setStep('otp');
      setResendCount(resendCount + 1);
      setCooldown(60); // 1 minute cooldown
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use the secure verification function
      const { data, error } = await supabase
        .rpc('verify_otp_secure', {
          phone: phoneNumber.replace(/\D/g, ''),
          otp: otp
        });

      if (error) throw error;

      // Check if verification was successful
      if (!data || data.length === 0 || !data[0].success) {
        toast({
          title: "Invalid OTP",
          description: "The code is incorrect or has expired",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });

      onVerificationComplete(phoneNumber.replace(/\D/g, ''));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
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
            <CardTitle className="text-2xl">
              {step === 'phone' ? 'Verify Phone Number' : 'Enter OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'We need to verify your phone number for security'
                : `Enter the 6-digit code sent to ${phoneNumber}`
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="pl-10"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit mobile number
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={sendOTP} 
                  disabled={loading || !phoneNumber}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
                  <Label>Enter Verification Code</Label>
                </div>
                
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Code expires in 5 minutes
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={verifyOTP} 
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={sendOTP}
                  disabled={cooldown > 0 || resendCount >= 3}
                  className="w-full"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 
                   resendCount >= 3 ? 'Max attempts reached' : 'Resend OTP'}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => setStep('phone')}
                  className="w-full text-sm"
                >
                  Change Phone Number
                </Button>
              </div>
            </>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble? Contact support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneVerification;