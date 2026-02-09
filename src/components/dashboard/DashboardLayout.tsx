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
        className="fixed left-0 top-0 z-40 h-screen w-56 glass-panel border-r lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gradient">AutoTradePlug</span>
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
          <div className="px-4 py-2.5 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">TR</span>
              </div>
              <div>
                <p className="text-xs font-medium">Trader User</p>
                <div className="flex items-center space-x-1.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Pro
                  </Badge>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full pulse-glow"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Overview - Moved from dashboard center */}
          <div className="px-3 py-2 border-b">
            <h4 className="text-[11px] font-medium mb-1.5 text-muted-foreground uppercase tracking-wider">Market</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">NIFTY</span>
                <span className="text-success">+0.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SENSEX</span>
                <span className="text-success">+1.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">VIX</span>
                <span className="text-destructive">-2.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">PCR</span>
                <span className="text-warning">-0.3%</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
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
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors text-xs ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 py-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive text-xs h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-56">
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