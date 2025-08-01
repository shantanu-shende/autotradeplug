import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Key, Link as LinkIcon, Shield, AlertTriangle } from 'lucide-react';

interface BrokerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker: {
    id: string;
    name: string;
    logo: string;
    type: 'oauth' | 'api_key' | 'credentials';
  } | null;
  onConnect: (credentials: any) => Promise<void>;
}

const BrokerConnectionModal: React.FC<BrokerConnectionModalProps> = ({
  isOpen,
  onClose,
  broker,
  onConnect
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
    pin: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    if (!broker) return;

    setLoading(true);
    try {
      const credentials = {
        broker_name: broker.id,
        type: activeTab,
        ...formData
      };

      await onConnect(credentials);
      toast({
        title: "Broker Connected",
        description: `Successfully connected to ${broker.name}`,
      });
      onClose();
      setFormData({ apiKey: '', apiSecret: '', username: '', password: '', pin: '' });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to broker",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    if (!broker) return;
    
    toast({
      title: "OAuth Redirect",
      description: `Redirecting to ${broker.name} for authorization...`,
    });
    
    // Simulate OAuth flow - in real implementation, this would redirect to broker's OAuth page
    setTimeout(() => {
      handleConnect();
    }, 2000);
  };

  if (!broker) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <img 
                src={broker.logo} 
                alt={broker.name}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-5 h-5 rounded bg-primary/20 hidden items-center justify-center text-xs font-semibold text-primary">
                {broker.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <span>Connect to {broker.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-warning-foreground">Security Notice</p>
                  <p className="text-xs text-muted-foreground">
                    Your credentials are encrypted and stored securely. We never store your trading password.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="oauth" className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4" />
                <span>OAuth</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="text"
                    placeholder="Enter your API key"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="Enter your API secret"
                    value={formData.apiSecret}
                    onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                  />
                </div>

                {broker.name.toLowerCase() === 'zerodha' && (
                  <div className="space-y-2">
                    <Label htmlFor="pin">Trading PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="Enter your trading PIN"
                      value={formData.pin}
                      onChange={(e) => handleInputChange('pin', e.target.value)}
                      maxLength={6}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleConnect} 
                  disabled={loading || !formData.apiKey || !formData.apiSecret}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Connect Securely
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="oauth" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="p-6 border border-dashed border-border rounded-lg">
                  <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Secure OAuth Connection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect securely through {broker.name}'s official authorization system.
                  </p>
                  <Button onClick={handleOAuthConnect} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect with {broker.name}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerConnectionModal;