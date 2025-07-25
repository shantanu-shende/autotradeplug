import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import DashboardPreview from '@/components/sections/DashboardPreview';

interface LandingPageProps {
  onAuthClick: () => void;
}

const LandingPage = ({ onAuthClick }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={onAuthClick} />
      <main>
        <HeroSection onAuthClick={onAuthClick} />
        <FeaturesSection />
        <DashboardPreview />
      </main>
    </div>
  );
};

export default LandingPage;