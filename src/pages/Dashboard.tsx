import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import BrokerConnection from '@/components/dashboard/BrokerConnection';
import { DemoAccountsManager } from '@/components/demo/DemoAccountsManager';

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'strategies':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gradient mb-4">Strategy Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case 'backtest':
        return <DemoAccountsManager />;
      case 'marketplace':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gradient mb-4">Strategy Marketplace</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
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
    <DashboardLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={onLogout}
    >
      {renderCurrentPage()}
    </DashboardLayout>
  );
};

export default Dashboard;