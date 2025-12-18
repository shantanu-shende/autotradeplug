import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  // Automatically redirect to home with market tab - no white screens or 404s
  useEffect(() => {
    navigate("/", { replace: true, state: { defaultTab: 'market' } });
  }, [navigate]);

  return null;
};

export default NotFound;
