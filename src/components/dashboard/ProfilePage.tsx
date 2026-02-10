import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckCircle2, Wifi, Activity, Clock, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">My Profile</h2>
        <p className="text-sm text-muted-foreground">Your identity and automation overview</p>
      </div>

      {/* Identity Card */}
      <Card className="bg-card/40 border-border/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{userName}</h3>
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="text-[10px] h-5 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0">Email Verified</Badge>
                <Badge className="text-[10px] h-5 bg-primary/15 text-primary border-0">Broker Linked</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-[hsl(var(--success))]" />
              <span className="text-xs text-muted-foreground">Broker Connections</span>
            </div>
            <p className="text-lg font-semibold">2 Active</p>
            <p className="text-xs text-muted-foreground mt-1">XM, IC Markets</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Risk Level</span>
            </div>
            <p className="text-lg font-semibold">Moderate</p>
            <p className="text-xs text-muted-foreground mt-1">5 strategies active</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Execution</span>
            </div>
            <p className="text-lg font-semibold">2 min ago</p>
            <p className="text-xs text-muted-foreground mt-1">Momentum Scalper</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Security</span>
            </div>
            <p className="text-lg font-semibold">Strong</p>
            <p className="text-xs text-muted-foreground mt-1">MFA enabled</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
