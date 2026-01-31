import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolio, Portfolio } from '@/hooks/usePortfolio';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Trash2,
  Eye,
  PlusCircle,
  MinusCircle,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PortfolioManager() {
  const {
    portfolios,
    currentPortfolio,
    positions,
    orders,
    loading,
    error,
    fetchPortfolios,
    fetchPortfolioDetails,
    createPortfolio,
    addFunds,
    withdrawFunds,
    deletePortfolio,
  } = usePortfolio();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState<'add' | 'withdraw' | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  // Create form state
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioType, setNewPortfolioType] = useState<'demo' | 'real'>('demo');
  const [newPortfolioBalance, setNewPortfolioBalance] = useState(10000);

  // Funds form state
  const [fundsAmount, setFundsAmount] = useState(1000);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      toast.error('Portfolio name is required');
      return;
    }

    try {
      await createPortfolio(newPortfolioName, newPortfolioType, newPortfolioBalance);
      toast.success('Portfolio created');
      setShowCreateModal(false);
      setNewPortfolioName('');
      setNewPortfolioBalance(10000);
    } catch (err) {
      toast.error('Failed to create portfolio');
    }
  };

  const handleAddFunds = async () => {
    if (!selectedPortfolio || fundsAmount <= 0) return;

    try {
      await addFunds(selectedPortfolio.id, fundsAmount);
      toast.success(`$${fundsAmount.toLocaleString()} added`);
      setShowFundsModal(null);
      setFundsAmount(1000);
    } catch (err) {
      toast.error('Failed to add funds');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedPortfolio || fundsAmount <= 0) return;

    try {
      await withdrawFunds(selectedPortfolio.id, fundsAmount);
      toast.success(`$${fundsAmount.toLocaleString()} withdrawn`);
      setShowFundsModal(null);
      setFundsAmount(1000);
    } catch (err) {
      toast.error('Failed to withdraw funds');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePortfolio(id);
      toast.success('Portfolio deleted');
      setShowDeleteDialog(null);
    } catch (err) {
      toast.error('Failed to delete portfolio');
    }
  };

  const handleViewDetails = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    fetchPortfolioDetails(portfolio.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Portfolio Manager</h2>
          <p className="text-sm text-muted-foreground">Manage your real and demo portfolios</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Portfolio
        </Button>
      </div>

      {/* Portfolio Grid */}
      {loading && portfolios.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : portfolios.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolios Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a demo portfolio to start testing your strategies
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map(portfolio => (
            <Card key={portfolio.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${portfolio.portfolio_type === 'demo' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                      <Wallet className={`h-5 w-5 ${portfolio.portfolio_type === 'demo' ? 'text-blue-500' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{portfolio.portfolio_name}</CardTitle>
                      <Badge variant="outline" className={`text-xs mt-1 ${
                        portfolio.portfolio_type === 'demo'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {portfolio.portfolio_type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(portfolio)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {portfolio.portfolio_type === 'demo' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPortfolio(portfolio);
                            setShowFundsModal('add');
                          }}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPortfolio(portfolio);
                            setShowFundsModal('withdraw');
                          }}>
                            <MinusCircle className="h-4 w-4 mr-2" />
                            Withdraw
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(portfolio.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Balance</p>
                    <p className="font-bold text-lg">${Number(portfolio.balance).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Equity</p>
                    <p className="font-bold text-lg">${Number(portfolio.equity).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Margin Used</p>
                    <p className="font-medium text-amber-500">${Number(portfolio.margin_used).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Free Margin</p>
                    <p className="font-medium text-green-500">${Number(portfolio.margin_available).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Portfolio Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Portfolio</DialogTitle>
            <DialogDescription>
              Create a new demo or real portfolio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Portfolio Name</Label>
              <Input
                placeholder="My Portfolio"
                value={newPortfolioName}
                onChange={e => setNewPortfolioName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Portfolio Type</Label>
              <Select value={newPortfolioType} onValueChange={(v: 'demo' | 'real') => setNewPortfolioType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Demo (Virtual funds)</SelectItem>
                  <SelectItem value="real">Real (Connect broker)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newPortfolioType === 'demo' && (
              <div className="space-y-2">
                <Label>Initial Balance ($)</Label>
                <Input
                  type="number"
                  value={newPortfolioBalance}
                  onChange={e => setNewPortfolioBalance(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePortfolio} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Withdraw Funds Modal */}
      <Dialog open={showFundsModal !== null} onOpenChange={() => setShowFundsModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showFundsModal === 'add' ? 'Add Funds' : 'Withdraw Funds'}
            </DialogTitle>
            <DialogDescription>
              {showFundsModal === 'add'
                ? 'Add virtual funds to your demo portfolio'
                : 'Withdraw funds from your demo portfolio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={fundsAmount}
                onChange={e => setFundsAmount(Number(e.target.value))}
              />
            </div>
            {selectedPortfolio && (
              <p className="text-sm text-muted-foreground">
                Current balance: ${Number(selectedPortfolio.balance).toLocaleString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundsModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={showFundsModal === 'add' ? handleAddFunds : handleWithdraw}
              disabled={loading || fundsAmount <= 0}
            >
              {loading ? 'Processing...' : showFundsModal === 'add' ? 'Add Funds' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this portfolio? All positions and orders will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PortfolioManager;
