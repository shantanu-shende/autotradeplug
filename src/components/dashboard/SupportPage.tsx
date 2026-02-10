import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, MessageSquare, Search, BookOpen, 
  Zap, Shield, Settings, TrendingUp, ChevronRight,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const popularTopics = [
  { icon: Zap, title: 'Getting Started', description: 'How to set up your first strategy', category: 'Guides' },
  { icon: TrendingUp, title: 'Strategy Configuration', description: 'Risk modes, timeframes, and assets', category: 'Strategies' },
  { icon: Shield, title: 'Risk Management', description: 'Understanding kill switches and limits', category: 'Safety' },
  { icon: Settings, title: 'Broker Connection', description: 'Link your broker account', category: 'Setup' },
];

const SupportPage = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Hi {userName}, how can we help?</h2>
        <p className="text-sm text-muted-foreground">Search our knowledge base or reach out to our team</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQs, guides, troubleshooting..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card/40 border-border/30 h-11"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-card/40 border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Send a Message</p>
              <p className="text-xs text-muted-foreground">We typically reply within 2 hours</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-sm font-medium">Knowledge Base</p>
              <p className="text-xs text-muted-foreground">Browse guides and documentation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Topics */}
      <Card className="bg-card/40 border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Popular Topics</CardTitle>
          <CardDescription>Frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 p-3 pt-0">
          {popularTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.title}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
              >
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{topic.title}</p>
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </div>
                <Badge variant="outline" className="text-[10px] h-4 border-border/40 flex-shrink-0">{topic.category}</Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Message */}
      <Card className="bg-card/40 border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Message</CardTitle>
          <CardDescription>Describe your issue and we'll get back to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="bg-muted/20 border-border/20"
            />
            <Button size="sm" className="h-9 px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
