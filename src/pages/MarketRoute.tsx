import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// This component handles direct /market route navigation
// It redirects to the main app with a signal to show the market tab
const MarketRoute = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Navigate to home with state to indicate market tab should be shown
    navigate('/', { 
      replace: true, 
      state: { defaultTab: 'market' } 
    });
  }, [navigate]);

  return null;
};

export default MarketRoute;
