import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateDemoAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountCreated: () => void;
}

export const CreateDemoAccountModal = ({ open, onOpenChange, onAccountCreated }: CreateDemoAccountModalProps) => {
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState([50000]); // Default to ₹50,000
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an account name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('demo-accounts', {
        body: {
          account_name: accountName.trim(),
          initial_balance: balance[0],
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create demo account');
      }

      if (!data?.account) {
        throw new Error('Failed to create demo account');
      }

      toast({
        title: 'Success',
        description: `Demo account "${accountName}" created with ID: ${data.account.hash_id}`,
      });

      setAccountName('');
      setBalance([50000]);
      onOpenChange(false);
      onAccountCreated();
    } catch (error) {
      console.error('Error creating demo account:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create demo account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Create Demo Account
          </DialogTitle>
          <DialogDescription>
            Set up a new demo trading account with virtual funds between ₹5,000 to ₹2,50,000.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="My Trading Strategy"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Initial Balance: ₹{balance[0].toLocaleString('en-IN')}</Label>
            <Slider
              value={balance}
              onValueChange={setBalance}
              max={250000}
              min={5000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹5,000</span>
              <span>₹2,50,000</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};