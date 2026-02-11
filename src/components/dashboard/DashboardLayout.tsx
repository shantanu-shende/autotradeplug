import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Bot, 
  TrendingUp, 
  Bell, 
  Menu,
  X,
  LogOut,
  Wifi,
  User,
  Settings,
  HelpCircle,
  ShieldAlert,
  ChevronUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  { id: 'backtest', label: 'Backtest', icon: Activity },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

const DashboardLayout = ({ children, currentPage, onPageChange, onLogout }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.slice(0, 2).toUpperCase();
  const userEmail = user?.email || '';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-3 left-3 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="bg-card/80 backdrop-blur-sm border-border/50 press-scale h-10 w-10 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

        {/* Icon-only Sidebar Rail */}
        <motion.aside
          initial={false}
          animate={{
            x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -72
          }}
          className="fixed left-0 top-0 z-40 h-screen w-[72px] bg-card/60 backdrop-blur-xl border-r border-border/30 lg:translate-x-0 flex flex-col items-center"
        >
          {/* Logo */}
          <div className="py-6 w-full flex justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          {/* Close button on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden mt-1 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation Icons */}
          <nav className="flex-1 flex flex-col items-center gap-1.5 py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onPageChange(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.25)]'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-[20px] h-[20px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="bg-popover border-border/50">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Profile Section at Bottom */}
          <div className="pb-6 flex flex-col items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
                  <Avatar className="w-9 h-9 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                    <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronUp className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-64 bg-popover border-border/50">
                {/* Profile Header */}
                <div className="px-3 py-3 flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
                </div>

                {/* Automation Status */}
                <div className="px-3 py-2 mx-2 mb-1 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Automation</span>
                    <Badge className="text-[10px] h-4 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className="text-foreground font-medium">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="text-muted-foreground">Last Exec</span>
                    <span className="text-muted-foreground">2 min ago</span>
                  </div>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-3">Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onPageChange('profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange('support')}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-amber-500 focus:text-amber-500">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Emergency Stop
                  <span className="ml-auto text-[10px] text-muted-foreground">all bots</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="lg:ml-[72px]">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-xl font-semibold capitalize tracking-tight">{currentPage}</h1>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-9 w-9 p-0"
                  onClick={() => {
                    const event = new CustomEvent('openNotifications');
                    window.dispatchEvent(event);
                  }}
                >
                  <Bell className="w-[18px] h-[18px]" />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-medium text-destructive-foreground">3</span>
                  </div>
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6">
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
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
