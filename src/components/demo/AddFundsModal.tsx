import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onFundsAdded: () => void;
}

export const AddFundsModal = ({ open, onOpenChange, accountId, onFundsAdded }: AddFundsModalProps) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fundAmount = parseFloat(amount);
    if (!fundAmount || fundAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

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
          action: 'add_funds',
          amount: fundAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add funds');
      }

      toast({
        title: 'Success',
        description: `₹${fundAmount.toLocaleString('en-IN')} added to account successfully`,
      });

      setAmount('');
      onOpenChange(false);
      onFundsAdded();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add funds',
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
            <Plus className="h-5 w-5" />
            Add Funds
          </DialogTitle>
          <DialogDescription>
            Add virtual funds to your demo account. Maximum balance limit is ₹2,50,000.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="250000"
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter amount between ₹1 to ₹2,50,000
            </p>
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
              {isLoading ? 'Adding...' : 'Add Funds'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};