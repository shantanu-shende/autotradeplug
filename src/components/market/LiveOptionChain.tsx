import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketMetrics, useDhanExpiries } from '@/hooks/useDhanMarketData';
import { motion } from 'framer-motion';

interface LiveOptionChainProps {
  instrument?: 'NIFTY' | 'BANKNIFTY';
  maxItems?: number;
}

const LiveOptionChain = ({ instrument = 'NIFTY', maxItems = 5 }: LiveOptionChainProps) => {
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  
  const { data: expiries, isLoading: expiryLoading } = useDhanExpiries(instrument);
  const { data: optionData, metrics, isLoading, error, isFetching } = useMarketMetrics(
    instrument, 
    selectedExpiry || undefined
  );

  // Auto-select first expiry when available
  if (expiries && expiries.length > 0 && !selectedExpiry) {
    setSelectedExpiry(expiries[0]);
  }

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(maxItems)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );

  if (error) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Target className="w-5 h-5" />
            <span>{instrument} Options - Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Unable to load option chain data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>{instrument} Options</span>
            {isFetching && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
          </CardTitle>
          
          {expiries && expiries.length > 0 && (
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
        {metrics && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">PCR</div>
              <div className="text-lg font-bold text-primary">
                {metrics.pcr.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Max Pain</div>
              <div className="text-lg font-bold">
                {metrics.maxPain.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Option Chain Data */}
        {isLoading || expiryLoading ? (
          <LoadingSkeleton />
        ) : optionData && optionData.length > 0 ? (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground font-medium px-2">
              <div className="text-center">Strike</div>
              <div className="text-center">Call OI</div>
              <div className="text-center">Put OI</div>
              <div className="text-center">Call LTP</div>
              <div className="text-center">Put LTP</div>
            </div>
            
            {optionData.slice(0, maxItems).map((option, i) => {
              const isATM = metrics && Math.abs(option.strike - metrics.maxPain) < 100;
              
              return (
                <motion.div
                  key={option.strike}
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
                    <div className="text-sm font-medium text-success">
                      {(option.call_oi / 100000).toFixed(1)}L
                    </div>
                    <div className="w-full h-1 bg-success/20 rounded mt-1">
                      <div 
                        className="h-full bg-success rounded"
                        style={{ width: `${Math.min((option.call_oi / (metrics?.totalCallOI || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-destructive">
                      {(option.put_oi / 100000).toFixed(1)}L
                    </div>
                    <div className="w-full h-1 bg-destructive/20 rounded mt-1">
                      <div 
                        className="h-full bg-destructive rounded"
                        style={{ width: `${Math.min((option.put_oi / (metrics?.totalPutOI || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center text-sm">
                    ₹{option.call_ltp.toFixed(2)}
                  </div>
                  
                  <div className="text-center text-sm">
                    ₹{option.put_ltp.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">
            No option data available for selected expiry
          </div>
        )}
        
        {/* Live data indicator */}
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          Live data • Updates every 3s
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOptionChain;