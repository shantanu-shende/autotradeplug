import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealtimeOptionChain } from '@/hooks/useRealtimeMarketData';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveOptionChainSimulatedProps {
  instrument?: 'NIFTY' | 'BANKNIFTY';
  maxItems?: number;
}

const LiveOptionChainSimulated = ({ instrument = 'NIFTY', maxItems = 5 }: LiveOptionChainSimulatedProps) => {
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const { optionChain, expiries, metrics } = useRealtimeOptionChain(instrument);

  // Auto-select first expiry
  if (expiries.length > 0 && !selectedExpiry) {
    setSelectedExpiry(expiries[0]);
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>{instrument} Options</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </CardTitle>
          
          {expiries.length > 0 && (
            <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                {expiries.map((expiry) => (
                  <SelectItem key={expiry} value={expiry}>
                    {new Date(expiry).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Market Metrics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">PCR</div>
            <motion.div 
              key={metrics.pcr.toFixed(2)}
              initial={{ scale: 1.1, color: 'hsl(var(--primary))' }}
              animate={{ scale: 1, color: 'inherit' }}
              className="text-lg font-bold"
            >
              {metrics.pcr.toFixed(2)}
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Max Pain</div>
            <motion.div 
              key={metrics.maxPain}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold"
            >
              {metrics.maxPain.toLocaleString('en-IN')}
            </motion.div>
          </div>
        </div>

        {/* Option Chain Data */}
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground font-medium px-2">
            <div className="text-center">Strike</div>
            <div className="text-center">Call OI</div>
            <div className="text-center">Put OI</div>
            <div className="text-center">Call LTP</div>
            <div className="text-center">Put LTP</div>
          </div>
          
          <AnimatePresence mode="popLayout">
            {optionChain.slice(0, maxItems).map((option, i) => {
              const isATM = Math.abs(option.strike - metrics.maxPain) < 100;
              
              return (
                <motion.div
                  key={option.strike}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-5 gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors ${
                    isATM ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <div className="text-center font-medium text-sm">
                    {option.strike.toLocaleString('en-IN')}
                    {isATM && <Badge variant="secondary" className="ml-1 text-xs">ATM</Badge>}
                  </div>
                  
                  <div className="text-center">
                    <motion.div 
                      key={option.call_oi}
                      initial={{ backgroundColor: 'hsl(var(--success) / 0.3)' }}
                      animate={{ backgroundColor: 'transparent' }}
                      transition={{ duration: 0.5 }}
                      className="text-sm font-medium text-success rounded px-1"
                    >
                      {(option.call_oi / 100000).toFixed(1)}L
                    </motion.div>
                    <div className="w-full h-1 bg-success/20 rounded mt-1">
                      <motion.div 
                        className="h-full bg-success rounded"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((option.call_oi / metrics.totalCallOI) * 100, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <motion.div 
                      key={option.put_oi}
                      initial={{ backgroundColor: 'hsl(var(--destructive) / 0.3)' }}
                      animate={{ backgroundColor: 'transparent' }}
                      transition={{ duration: 0.5 }}
                      className="text-sm font-medium text-destructive rounded px-1"
                    >
                      {(option.put_oi / 100000).toFixed(1)}L
                    </motion.div>
                    <div className="w-full h-1 bg-destructive/20 rounded mt-1">
                      <motion.div 
                        className="h-full bg-destructive rounded"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((option.put_oi / metrics.totalPutOI) * 100, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  <motion.div 
                    key={option.call_ltp}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-center text-sm"
                  >
                    ₹{option.call_ltp.toFixed(2)}
                  </motion.div>
                  
                  <motion.div 
                    key={option.put_ltp}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-center text-sm"
                  >
                    ₹{option.put_ltp.toFixed(2)}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Live data indicator */}
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          Simulated live data • Updates every 3s
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOptionChainSimulated;
