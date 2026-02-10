import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, Shield, Bell, Palette, FileText, Activity, 
  Lock, Smartphone, Monitor, Globe, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'automation', label: 'Automation', icon: Activity },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'legal', label: 'Legal', icon: FileText },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and automation preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Settings Nav */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'bg-card/80 text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'profile' && (
            <Card className="bg-card/40 border-border/30">
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingsRow label="Name" value={userName} />
                <SettingsRow label="Email" value={user?.email || ''} badge="Verified" />
                <SettingsRow label="Phone" value="+1 •••• ••42" badge="Verified" />
                <SettingsRow label="Country" value="United States" />
              </CardContent>
            </Card>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-4">
              <Card className="bg-card/40 border-border/30">
                <CardHeader>
                  <CardTitle className="text-base">Automation Controls</CardTitle>
                  <CardDescription>Configure risk and execution limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingsRow label="Max Daily Loss" value="$500" />
                  <SettingsRow label="Max Open Positions" value="10" />
                  <SettingsRow label="Allowed Instruments" value="Forex, Crypto" />
                  <SettingsRow label="Trading Window" value="24/7" />
                  <Separator className="bg-border/20" />
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium">Kill Switch Behavior</p>
                      <p className="text-xs text-muted-foreground">Stop execution only (do not close positions)</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-border/40">Stop Only</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <Card className="bg-card/40 border-border/30">
                <CardHeader>
                  <CardTitle className="text-base">Security</CardTitle>
                  <CardDescription>Protect your account and automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SettingsAction label="Change Password" description="Last changed 30 days ago" icon={Lock} />
                  <SettingsAction label="Two-Factor Authentication" description="Enabled via authenticator app" icon={Smartphone} badge="On" />
                  <SettingsAction label="Active Sessions" description="2 active sessions" icon={Monitor} />
                  <Separator className="bg-border/20" />
                  <SettingsAction label="Emergency Automation Lock" description="Immediately locks all automation" icon={AlertTriangle} destructive />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <Card className="bg-card/40 border-border/30">
                <CardHeader>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>Choose what alerts you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SettingsToggle label="Trade Executions" description="Get notified on every trade" defaultChecked />
                  <SettingsToggle label="Strategy Alerts" description="Pause, error, and warning alerts" defaultChecked />
                  <SettingsToggle label="Daily P&L Summary" description="End of day performance report" defaultChecked />
                  <SettingsToggle label="Risk Warnings" description="Margin and drawdown alerts" defaultChecked />
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/30">
                <CardHeader>
                  <CardTitle className="text-base">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SettingsRow label="Theme" value="Dark" />
                  <SettingsRow label="Language" value="English" />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'legal' && (
            <Card className="bg-card/40 border-border/30">
              <CardHeader>
                <CardTitle className="text-base">Legal Documents</CardTitle>
                <CardDescription>Execution software agreements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Terms of Service',
                  'Automation Risk Disclosure',
                  'Order Execution Disclaimer',
                  'Privacy Policy',
                  'Limitation of Liability',
                ].map((doc) => (
                  <button
                    key={doc}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    <span>{doc}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/* Helper sub-components */

const SettingsRow = ({ label, value, badge }: { label: string; value: string; badge?: string }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm">{value}</span>
      {badge && <Badge className="text-[10px] h-4 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0">{badge}</Badge>}
    </div>
  </div>
);

const SettingsAction = ({ label, description, icon: Icon, badge, destructive }: { label: string; description: string; icon: any; badge?: string; destructive?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors text-left ${destructive ? 'text-amber-500' : ''}`}>
    <Icon className="w-4 h-4 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {badge && <Badge variant="outline" className="text-[10px] h-4 border-border/40">{badge}</Badge>}
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

const SettingsToggle = ({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch defaultChecked={defaultChecked} />
  </div>
);

export default SettingsPage;
