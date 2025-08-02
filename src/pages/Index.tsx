import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LandingPage from '@/components/landing/LandingPage';
import Dashboard from './Dashboard';
import AuthModal from '@/components/auth/AuthModal';
import LoadingScreen from '@/components/auth/LoadingScreen';
import PhoneVerification from '@/components/auth/PhoneVerification';
import PinSetup from '@/components/auth/PinSetup';
import PinVerification from '@/components/auth/PinVerification';

const Index = () => {
  const { user, session, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authFlow, setAuthFlow] = useState<'auth' | 'phone' | 'pin-setup' | 'pin-verify'>('auth');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Fetch user profile when user is authenticated
  useEffect(() => {
    if (user && session) {
      fetchUserProfile();
    }
  }, [user, session]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Profile will be fetched by useEffect when user changes
  };

  const handleLogout = async () => {
    await signOut();
    setUserProfile(null);
    setAuthFlow('auth');
  };

  const handleBackToAuth = async () => {
    // Log out the user and return to landing page
    await signOut();
    setUserProfile(null);
    setAuthFlow('auth');
    setShowAuthModal(false);
  };

  const handlePhoneVerified = (phone: string) => {
    setPhoneNumber(phone);
    setAuthFlow('pin-setup');
  };

  const handlePinSetup = () => {
    setAuthFlow('auth');
    fetchUserProfile(); // Refresh profile after setup
  };

  const handlePinVerified = () => {
    setAuthFlow('auth');
  };

  const handleForgotPin = () => {
    setAuthFlow('phone'); // Reset to phone verification
  };

  // Show loading state while checking authentication
  if (loading || profileLoading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  // User is authenticated - go directly to dashboard
  if (user && session) {
    // TODO: UNCOMMENT BELOW TO RE-ENABLE PHONE VERIFICATION AND PIN SETUP
    // Currently commented out for development - users go directly to dashboard
    
    /*
    // Check if user has completed onboarding
    if (!userProfile?.is_onboarded) {
      // New user - needs phone verification and PIN setup
      if (authFlow === 'phone') {
        return (
          <PhoneVerification
            onVerificationComplete={handlePhoneVerified}
            onBack={handleBackToAuth}
          />
        );
      }
      
      if (authFlow === 'pin-setup') {
        return (
          <PinSetup
            phoneNumber={phoneNumber}
            onPinSetup={handlePinSetup}
            onBack={() => setAuthFlow('phone')}
          />
        );
      }
      
      // Start with phone verification for new users
      if (authFlow === 'auth') {
        setAuthFlow('phone');
        return <LoadingScreen message="Setting up your account..." />;
      }
    } else {
      // Returning user - needs PIN verification
      if (authFlow === 'pin-verify') {
        return (
          <PinVerification
            onPinVerified={handlePinVerified}
            onForgotPin={handleForgotPin}
            onLogout={handleLogout}
          />
        );
      }
      
      if (authFlow === 'phone') {
        return (
          <PhoneVerification
            onVerificationComplete={(phone) => {
              setPhoneNumber(phone);
              setAuthFlow('pin-setup');
            }}
            onBack={handleBackToAuth}
          />
        );
      }
      
      if (authFlow === 'pin-setup') {
        return (
          <PinSetup
            phoneNumber={phoneNumber}
            onPinSetup={() => setAuthFlow('pin-verify')}
            onBack={() => setAuthFlow('phone')}
          />
        );
      }
      
      // Start with PIN verification for returning users
      if (authFlow === 'auth') {
        setAuthFlow('pin-verify');
        return <LoadingScreen message="Verifying your account..." />;
      }
    }
    */

    // User is authenticated - go directly to dashboard (bypassing phone/PIN verification)
    return <Dashboard onLogout={handleLogout} />;
  }

  // User is not authenticated - show landing page
  return (
    <>
      <LandingPage onAuthClick={() => setShowAuthModal(true)} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Index;
