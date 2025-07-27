import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DemoAccountCard } from './DemoAccountCard';
import { CreateDemoAccountModal } from './CreateDemoAccountModal';
import { AddFundsModal } from './AddFundsModal';
import { StrategyDeploymentModal } from './StrategyDeploymentModal';

interface DemoAccount {
  id: string;
  hash_id: string;
  account_name: string;
  balance: number;
  initial_balance: number;
  status: 'active' | 'inactive' | 'dumped';
  created_at: string;
}

export const DemoAccountsManager = () => {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('https://ogihrnxtsafuegosuujm.supabase.co/functions/v1/demo-accounts', {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAccounts(data.accounts);
      } else {
        console.error('Error fetching accounts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleActivate = async (accountId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('https://ogihrnxtsafuegosuujm.supabase.co/functions/v1/demo-accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          account_id: accountId,
          action: 'activate',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Demo account activated successfully',
        });
        fetchAccounts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to activate account',
        variant: 'destructive',
      });
    }
  };

  const handleDump = async (accountId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('https://ogihrnxtsafuegosuujm.supabase.co/functions/v1/demo-accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          account_id: accountId,
          action: 'dump',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Demo account dumped successfully',
        });
        fetchAccounts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to dump account',
        variant: 'destructive',
      });
    }
  };

  const handleAddFunds = (accountId: string) => {
    setSelectedAccountId(accountId);
    setAddFundsModalOpen(true);
  };

  const handleManageStrategies = (accountId: string) => {
    setSelectedAccountId(accountId);
    setStrategyModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Demo Accounts</h2>
          <p className="text-muted-foreground">
            Manage your virtual trading accounts and deploy strategies
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>No Demo Accounts</CardTitle>
                <CardDescription className="mt-2">
                  Create your first demo account to start testing trading strategies
                </CardDescription>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                Create Your First Account
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <DemoAccountCard
              key={account.id}
              account={account}
              onActivate={handleActivate}
              onDump={handleDump}
              onAddFunds={handleAddFunds}
              onManageStrategies={handleManageStrategies}
            />
          ))}
        </div>
      )}

      <CreateDemoAccountModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onAccountCreated={fetchAccounts}
      />

      <AddFundsModal
        open={addFundsModalOpen}
        onOpenChange={setAddFundsModalOpen}
        accountId={selectedAccountId}
        onFundsAdded={fetchAccounts}
      />

      <StrategyDeploymentModal
        open={strategyModalOpen}
        onOpenChange={setStrategyModalOpen}
        accountId={selectedAccountId}
      />
    </div>
  );
};