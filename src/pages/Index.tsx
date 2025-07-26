import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/landing/LandingPage';
import Dashboard from './Dashboard';
import AuthModal from '@/components/auth/AuthModal';
import { OnboardingForm } from '@/components/auth/OnboardingForm';

const Index = () => {
  const { user, session, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    const { signOut } = useAuth();
    await signOut();
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user needs onboarding (Google OAuth users without complete profile)
  const needsOnboarding = user && user.user_metadata && !user.user_metadata.onboarding_complete;

  if (needsOnboarding) {
    return <OnboardingForm onComplete={() => window.location.reload()} />;
  }

  // User is authenticated and onboarded
  if (user && session) {
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
