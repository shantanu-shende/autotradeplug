import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Play, Pause, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Strategy {
  id: string;
  name: string;
  description: string;
  config: any;
  is_predefined: boolean;
}

interface StrategyDeploymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
}

export const StrategyDeploymentModal = ({ open, onOpenChange, accountId }: StrategyDeploymentModalProps) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [deployedStrategies, setDeployedStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStrategies = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('https://ogihrnxtsafuegosuujm.supabase.co/functions/v1/strategies', {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setStrategies(data.strategies);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const fetchDeployedStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('deployed_strategies')
        .select(`
          *,
          strategy:strategies(*)
        `)
        .eq('demo_account_id', accountId);

      if (error) {
        console.error('Error fetching deployed strategies:', error);
      } else {
        setDeployedStrategies(data || []);
      }
    } catch (error) {
      console.error('Error fetching deployed strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && accountId) {
      setLoading(true);
      Promise.all([fetchStrategies(), fetchDeployedStrategies()]);
    }
  }, [open, accountId]);

  const handleDeployStrategy = async (strategyId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('https://ogihrnxtsafuegosuujm.supabase.co/functions/v1/strategies?action=deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          demo_account_id: accountId,
          strategy_id: strategyId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Strategy deployed successfully',
        });
        fetchDeployedStrategies();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deploy strategy',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStrategy = async (deploymentId: string, isActive: boolean) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('https://ogihrnxtsafuegosuujm.supabase.co/functions/v1/strategies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          deployment_id: deploymentId,
          is_active: !isActive,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Strategy ${!isActive ? 'activated' : 'paused'} successfully`,
        });
        fetchDeployedStrategies();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update strategy',
        variant: 'destructive',
      });
    }
  };

  const isStrategyDeployed = (strategyId: string) => {
    return deployedStrategies.some(d => d.strategy_id === strategyId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Strategy Management
          </DialogTitle>
          <DialogDescription>
            Deploy and manage trading strategies for this demo account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deployed Strategies */}
          {deployedStrategies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Active Deployments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deployedStrategies.map((deployment) => (
                  <Card key={deployment.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{deployment.strategy.name}</CardTitle>
                        <Badge variant={deployment.is_active ? 'default' : 'secondary'}>
                          {deployment.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <CardDescription>{deployment.strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        variant={deployment.is_active ? 'outline' : 'default'}
                        onClick={() => handleToggleStrategy(deployment.id, deployment.is_active)}
                        className="flex items-center gap-2"
                      >
                        {deployment.is_active ? (
                          <>
                            <Pause className="h-3 w-3" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            Resume
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Strategies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{strategy.name}</CardTitle>
                      <Badge variant={strategy.is_predefined ? 'secondary' : 'outline'}>
                        {strategy.is_predefined ? 'Predefined' : 'Custom'}
                      </Badge>
                    </div>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      disabled={isStrategyDeployed(strategy.id)}
                      onClick={() => handleDeployStrategy(strategy.id)}
                      className="flex items-center gap-2"
                    >
                      <Bot className="h-3 w-3" />
                      {isStrategyDeployed(strategy.id) ? 'Deployed' : 'Deploy'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};