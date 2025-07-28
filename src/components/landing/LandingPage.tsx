import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import Footer from '@/components/layout/Footer';

interface LandingPageProps {
  onAuthClick: () => void;
}

const LandingPage = ({ onAuthClick }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={onAuthClick} />
      <main>
        <HeroSection onAuthClick={onAuthClick} />
        <FeaturesSection onAuthClick={onAuthClick} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;