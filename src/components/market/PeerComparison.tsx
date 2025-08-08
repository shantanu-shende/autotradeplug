import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PeerItem {
  symbol: string;
  changePct: number;
  ltp: number;
}

const peers: PeerItem[] = [
  { symbol: "RELIANCE", changePct: 0.8, ltp: 2485.5 },
  { symbol: "TCS", changePct: -0.6, ltp: 3456.7 },
  { symbol: "INFY", changePct: 1.0, ltp: 1567.8 },
  { symbol: "HDFCBANK", changePct: 0.4, ltp: 1547.3 },
];

export default function PeerComparison() {
  const barCls = (v: number) => (v >= 0 ? "bg-success" : "bg-destructive");

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Peer Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {peers.map((p, i) => (
            <motion.div
              key={p.symbol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.symbol}</span>
                <span className={p.changePct >= 0 ? "text-success" : "text-destructive"}>
                  {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted rounded">
                <div className={`h-2 rounded ${barCls(p.changePct)}`} style={{ width: `${Math.min(Math.abs(p.changePct) * 20, 100)}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">₹{p.ltp.toFixed(2)}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
