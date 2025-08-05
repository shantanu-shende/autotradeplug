import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import Market from '@/pages/Market';
import BrokerConnection from '@/components/dashboard/BrokerConnection';
import { DemoAccountsManager } from '@/components/demo/DemoAccountsManager';
import Marketplace from './Marketplace';
import BrokerDashboard from './BrokerDashboard';
import StrategyManager from '@/components/strategy/StrategyManager';
import BacktestCards from '@/components/backtest/BacktestCards';
import NotificationOverlay from '@/components/notifications/NotificationOverlay';

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications data
  const [notifications] = useState([
    {
      id: '1',
      type: 'trade' as const,
      title: 'Order Executed',
      message: 'Your buy order for RELIANCE has been filled at ₹2,485.50',
      timestamp: '2 minutes ago',
      status: 'unread' as const,
      priority: 'medium' as const,
      actionLabel: 'View Trade',
      actionUrl: '/trades/123'
    },
    {
      id: '2',
      type: 'strategy' as const,
      title: 'Strategy Alert',
      message: 'Iron Condor strategy reached 50% profit target',
      timestamp: '5 minutes ago',
      status: 'unread' as const,
      priority: 'high' as const,
      actionLabel: 'View Strategy',
      actionUrl: '/strategies/iron-condor'
    },
    {
      id: '3',
      type: 'portfolio' as const,
      title: 'Margin Warning',
      message: 'Your available margin is below 20% threshold',
      timestamp: '15 minutes ago',
      status: 'read' as const,
      priority: 'high' as const,
      actionLabel: 'Add Funds',
      actionUrl: '/portfolio/funds'
    }
  ]);

  useEffect(() => {
    const handleOpenNotifications = () => {
      setShowNotifications(true);
    };

    window.addEventListener('openNotifications', handleOpenNotifications);
    return () => {
      window.removeEventListener('openNotifications', handleOpenNotifications);
    };
  }, []);

  const handleMarkRead = (id: string) => {
    // Handle marking notification as read
    console.log('Marking notification as read:', id);
  };

  const handleMarkAllRead = () => {
    // Handle marking all notifications as read
    console.log('Marking all notifications as read');
  };

  const handleNotificationClick = (notification: any) => {
    // Handle notification click
    console.log('Notification clicked:', notification);
    if (notification.actionUrl) {
      // Navigate to action URL
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'market':
        return <Market />;
      case 'strategies':
        return <StrategyManager />;
        case 'marketplace':
          return <Marketplace />;
      case 'backtest':
        return <BacktestCards />;
      case 'brokers':
        return <BrokerDashboard />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gradient mb-4">Settings</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <>
      <DashboardLayout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={onLogout}
      >
        {renderCurrentPage()}
      </DashboardLayout>

      <NotificationOverlay
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
};

export default Dashboard;