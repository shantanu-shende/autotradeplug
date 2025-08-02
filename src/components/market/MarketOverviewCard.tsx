import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StockData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume?: number;
}

interface SectorData {
  name: string;
  change: number;
  changePercent: number;
}

interface MarketMetrics {
  vix: number;
  vixChange: number;
  pcr: number;
  pcrChange: number;
}

// Mock data - replace with real API calls
const mockGainers: StockData[] = [
  { symbol: 'RELIANCE', ltp: 2847.50, change: 45.20, changePercent: 1.61 },
  { symbol: 'TCS', ltp: 4123.80, change: 78.90, changePercent: 1.95 },
  { symbol: 'INFY', ltp: 1567.30, change: 23.40, changePercent: 1.52 },
  { symbol: 'HDFC', ltp: 2891.20, change: 41.80, changePercent: 1.47 },
  { symbol: 'ICICIBANK', ltp: 1234.60, change: 18.90, changePercent: 1.55 },
];

const mockLosers: StockData[] = [
  { symbol: 'BAJFINANCE', ltp: 6789.40, change: -123.60, changePercent: -1.79 },
  { symbol: 'ASIANPAINT', ltp: 3456.20, change: -67.80, changePercent: -1.93 },
  { symbol: 'MARUTI', ltp: 9876.50, change: -145.30, changePercent: -1.45 },
  { symbol: 'TITAN', ltp: 2987.60, change: -48.90, changePercent: -1.61 },
  { symbol: 'WIPRO', ltp: 567.80, change: -8.90, changePercent: -1.54 },
];

const mockActiveVolume: StockData[] = [
  { symbol: 'RELIANCE', ltp: 2847.50, change: 45.20, changePercent: 1.61, volume: 12450000 },
  { symbol: 'ICICIBANK', ltp: 1234.60, change: 18.90, changePercent: 1.55, volume: 8970000 },
  { symbol: 'BAJFINANCE', ltp: 6789.40, change: -123.60, changePercent: -1.79, volume: 6780000 },
  { symbol: 'HDFC', ltp: 2891.20, change: 41.80, changePercent: 1.47, volume: 5640000 },
  { symbol: 'TCS', ltp: 4123.80, change: 78.90, changePercent: 1.95, volume: 4320000 },
];

const mockSectors: SectorData[] = [
  { name: 'Banking', change: 234.50, changePercent: 0.78 },
  { name: 'IT', change: -89.20, changePercent: -0.45 },
  { name: 'Pharma', change: 156.80, changePercent: 1.23 },
  { name: 'Auto', change: -67.30, changePercent: -0.89 },
  { name: 'FMCG', change: 45.60, changePercent: 0.34 },
];

const mockMetrics: MarketMetrics = {
  vix: 14.85,
  vixChange: -0.34,
  pcr: 0.87,
  pcrChange: 0.02,
};

const MarketOverviewCard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeBadge = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <Badge 
        variant={isPositive ? "default" : "destructive"} 
        className={`text-xs ${isPositive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
      >
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {changePercent.toFixed(2)}%
      </Badge>
    );
  };

  const StockItem = ({ stock }: { stock: StockData }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors min-w-[280px]">
      <div>
        <div className="font-semibold text-sm">{stock.symbol}</div>
        <div className="text-lg font-bold">₹{stock.ltp.toFixed(2)}</div>
        {stock.volume && (
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            <Activity className="w-3 h-3 mr-1" />
            Vol: {formatVolume(stock.volume)}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${getChangeColor(stock.change)}`}>
          {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
        </div>
        {getChangeBadge(stock.change, stock.changePercent)}
      </div>
    </div>
  );

  const SectorItem = ({ sector }: { sector: SectorData }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors min-w-[200px]">
      <div className="font-medium text-sm">{sector.name}</div>
      <div className="text-right">
        <div className={`text-sm font-medium ${getChangeColor(sector.change)}`}>
          {sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}
        </div>
        {getChangeBadge(sector.change, sector.changePercent)}
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="min-w-[280px]">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Market Overview
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">India VIX</div>
              <div className={`font-semibold ${getChangeColor(mockMetrics.vixChange)}`}>
                {mockMetrics.vix} ({mockMetrics.vixChange > 0 ? '+' : ''}{mockMetrics.vixChange.toFixed(2)})
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">PCR</div>
              <div className={`font-semibold ${getChangeColor(mockMetrics.pcrChange)}`}>
                {mockMetrics.pcr.toFixed(2)} ({mockMetrics.pcrChange > 0 ? '+' : ''}{mockMetrics.pcrChange.toFixed(2)})
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gainers" className="text-xs">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="text-xs">Top Losers</TabsTrigger>
            <TabsTrigger value="volume" className="text-xs">Most Active</TabsTrigger>
            <TabsTrigger value="sectors" className="text-xs">Sectors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gainers" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {mockGainers.map((stock) => (
                    <StockItem key={stock.symbol} stock={stock} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="losers" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {mockLosers.map((stock) => (
                    <StockItem key={stock.symbol} stock={stock} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="volume" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {mockActiveVolume.map((stock) => (
                    <StockItem key={stock.symbol} stock={stock} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="sectors" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {mockSectors.map((sector) => (
                    <SectorItem key={sector.name} sector={sector} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketOverviewCard;