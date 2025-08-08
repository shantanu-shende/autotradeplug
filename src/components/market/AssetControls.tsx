import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { TvInterval } from "./MarketChart";

interface AssetControlsProps {
  symbol: string;
  onSymbolChange: (s: string) => void;
  interval: TvInterval;
  onIntervalChange: (i: TvInterval) => void;
  rsi: boolean;
  onRsiChange: (v: boolean) => void;
  ema: boolean;
  onEmaChange: (v: boolean) => void;
}

const popularSymbols = [
  { value: "NSE:NIFTY", label: "NIFTY 50" },
  { value: "NSE:BANKNIFTY", label: "BANK NIFTY" },
  { value: "NSE:MIDCAP", label: "MIDCAP" },
  { value: "NASDAQ:AAPL", label: "AAPL" },
  { value: "NASDAQ:NVDA", label: "NVDA" },
];

const intervals: { value: TvInterval; label: string }[] = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "60", label: "1h" },
  { value: "D", label: "1D" },
  { value: "W", label: "1W" },
  { value: "M", label: "1M" },
];

export default function AssetControls({
  symbol,
  onSymbolChange,
  interval,
  onIntervalChange,
  rsi,
  onRsiChange,
  ema,
  onEmaChange,
}: AssetControlsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Symbol Selector */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Symbol</Label>
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Select symbol" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            {popularSymbols.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Interval Selector */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Timeframe</Label>
        <Select value={interval} onValueChange={(v) => onIntervalChange(v as TvInterval)}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            {intervals.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch id="rsi" checked={rsi} onCheckedChange={onRsiChange} />
          <Label htmlFor="rsi" className="text-sm">RSI</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="ema" checked={ema} onCheckedChange={onEmaChange} />
          <Label htmlFor="ema" className="text-sm">EMA</Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Save Favorite
        </Button>
        <Badge variant="secondary" className="hidden md:inline">Live</Badge>
      </div>
    </div>
  );
}
