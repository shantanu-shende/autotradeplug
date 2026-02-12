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
  LayoutDashboard, Bot, TrendingUp, Bell, Menu, X, LogOut,
  Wifi, User, Settings, HelpCircle, ShieldAlert, ChevronUp,
  Activity, CheckCircle2,
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
        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-background/90 backdrop-blur-xl border-b border-border/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="h-9 w-9 p-0 press-scale"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0 press-scale"
            onClick={() => {
              const event = new CustomEvent('openNotifications');
              window.dispatchEvent(event);
            }}
          >
            <Bell className="w-4 h-4" />
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-[9px] font-medium text-destructive-foreground">3</span>
            </div>
          </Button>
        </div>

        {/* Sidebar Rail */}
        <motion.aside
          initial={false}
          animate={{ x: isSidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -72 }}
          className="fixed left-0 top-0 z-40 h-screen w-[72px] bg-card/60 backdrop-blur-xl border-r border-border/20 lg:translate-x-0 flex flex-col items-center"
        >
          {/* Logo */}
          <div className="py-5 w-full flex justify-center">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.2)]">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          {/* Close on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Nav Icons */}
          <nav className="flex-1 flex flex-col items-center gap-1 py-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { onPageChange(item.id); setIsSidebarOpen(false); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="bg-popover border-border/50 text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Profile */}
          <div className="pb-5 flex flex-col items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1 group cursor-pointer">
                  <Avatar className="w-8 h-8 border-2 border-border/40 group-hover:border-primary/40 transition-colors">
                    <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronUp className="w-3 h-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-60 bg-popover border-border/50">
                <div className="px-3 py-2.5 flex items-center gap-2.5">
                  <Avatar className="w-9 h-9 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--success))] flex-shrink-0" />
                </div>

                {/* Automation Status */}
                <div className="px-3 py-2 mx-2 mb-1 rounded-lg bg-muted/20 border border-border/15">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Automation</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
                      <span className="text-[hsl(var(--success))] font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1">
                    <span className="text-muted-foreground">Last Exec</span>
                    <span className="text-muted-foreground">2 min ago</span>
                  </div>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPageChange('profile')}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange('settings')}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange('support')}>
                  <HelpCircle className="h-4 w-4 mr-2" /> Support
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[hsl(var(--warning))] focus:text-[hsl(var(--warning))]">
                  <ShieldAlert className="h-4 w-4 mr-2" /> Emergency Stop
                  <span className="ml-auto text-[10px] text-muted-foreground">all bots</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-[72px] pt-[52px] lg:pt-0">
          {/* Desktop Top Bar */}
          <header className="hidden lg:block sticky top-0 z-30 border-b border-border/20 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-3">
              <h1 className="text-lg font-semibold capitalize tracking-tight">{currentPage}</h1>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0 press-scale"
                onClick={() => {
                  const event = new CustomEvent('openNotifications');
                  window.dispatchEvent(event);
                }}
              >
                <Bell className="w-[16px] h-[16px]" />
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-medium text-destructive-foreground">3</span>
                </div>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-3 sm:p-5">
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
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
