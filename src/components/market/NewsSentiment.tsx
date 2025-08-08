import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface NewsItem {
  id: string;
  tag: "Earnings" | "Macro" | "Dividend" | "Update";
  title: string;
  timestamp: string; // e.g. "5m ago"
  source?: string;
  sentiment?: "positive" | "neutral" | "negative";
}

const mockNews: NewsItem[] = [
  { id: "1", tag: "Macro", title: "Fed signals prolonged rates pause amid cooling inflation", timestamp: "2m ago", source: "Bloomberg", sentiment: "neutral" },
  { id: "2", tag: "Earnings", title: "TCS beats estimates; margin expands 80 bps QoQ", timestamp: "12m ago", source: "Reuters", sentiment: "positive" },
  { id: "3", tag: "Dividend", title: "Infosys announces interim dividend of ₹18/share", timestamp: "21m ago", source: "Moneycontrol", sentiment: "positive" },
];

export default function NewsSentiment() {
  const sentimentCls = (s?: string) =>
    s === "positive" ? "text-success" : s === "negative" ? "text-destructive" : "text-muted-foreground";

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>News & Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {mockNews.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg hover:bg-muted/30"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{n.tag}</span>
                  <span>{n.timestamp}</span>
                </div>
                <div className="text-sm font-medium mt-1">{n.title}</div>
                <div className="text-xs mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground">{n.source}</span>
                  <span className={sentimentCls(n.sentiment)}>{n.sentiment}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
