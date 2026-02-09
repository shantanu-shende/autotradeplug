import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Wifi,
  Headphones
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
    <TooltipProvider delayDuration={200}>
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

        {/* Icon-only Sidebar Rail */}
        <motion.aside
          initial={false}
          animate={{
            x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -64
          }}
          className="fixed left-0 top-0 z-40 h-screen w-16 glass-panel border-r lg:translate-x-0 flex flex-col items-center"
        >
          {/* Logo */}
          <div className="py-4 border-b border-border/50 w-full flex justify-center">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          {/* Close button on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden mt-2"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation Icons */}
          <nav className="flex-1 flex flex-col items-center gap-1 py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => {
                        onPageChange(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Footer - Sign Out */}
          <div className="pb-4 flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Sign Out
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="lg:ml-16">
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
                    const event = new CustomEvent('openNotifications');
                    window.dispatchEvent(event);
                  }}
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-xs text-destructive-foreground">3</span>
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
    </TooltipProvider>
  );
};

export default DashboardLayout;
