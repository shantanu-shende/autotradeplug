import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Bot, 
  TrendingUp, 
  Settings, 
  Bell, 
  Menu,
  X,
  LogOut,
  Shield,
  Wifi
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market', label: 'Market', icon: TrendingUp },
  { id: 'strategies', label: 'Strategies', icon: Bot },
  { id: 'brokers', label: 'Brokers', icon: Wifi },
  { id: 'backtest', label: 'Backtest', icon: TrendingUp },
  { id: 'marketplace', label: 'Marketplace', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DashboardLayout = ({ children, currentPage, onPageChange, onLogout }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="glass-panel"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -280
        }}
        className="fixed left-0 top-0 z-40 h-screen w-70 glass-panel border-r lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">AutoTradePlug</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">TR</span>
              </div>
              <div>
                <p className="text-sm font-medium">Trader User</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Pro Plan
                  </Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse-glow"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Overview - Moved from dashboard center */}
          <div className="p-4 border-b">
            <h4 className="text-sm font-medium mb-3">Market Overview</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">NIFTY 50</div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">19,674.25</span>
                    <span className="text-success text-[10px]">+0.8%</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">SENSEX</div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">66,795.14</span>
                    <span className="text-success text-[10px]">+1.2%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">VIX</div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">13.45</span>
                    <span className="text-destructive text-[10px]">-2.1%</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">PCR</div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">0.89</span>
                    <span className="text-warning text-[10px]">-0.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-70">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b glass-panel">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold capitalize">{currentPage}</h1>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => {
                  // This will be handled by parent component
                  const event = new CustomEvent('openNotifications');
                  window.dispatchEvent(event);
                }}
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">3</span>
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}
    </div>
  );
};

export default DashboardLayout;