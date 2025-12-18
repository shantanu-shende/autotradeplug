import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnsupportedInstrumentModalProps {
  open: boolean;
  onClose: () => void;
  symbol?: string;
}

export function UnsupportedInstrumentModal({ 
  open, 
  onClose, 
  symbol 
}: UnsupportedInstrumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl">Instrument Unavailable</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {symbol ? (
                <>The instrument <span className="font-mono font-semibold text-foreground">{symbol}</span> is currently unavailable for charting.</>
              ) : (
                <>This instrument is currently unavailable for charting.</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Please select a supported instrument from our market overview.
            </p>
            
            <Button 
              onClick={onClose} 
              className="w-full"
              variant="default"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Market
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Need this instrument? Contact support for availability updates.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
