import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

declare global {
  interface Window {
    TradingView: any;
  }
}

export type TvInterval = "1" | "5" | "60" | "D" | "W" | "M";

interface MarketChartProps {
  symbol: string; // e.g., "NSE:NIFTY" or "NASDAQ:AAPL"
  interval?: TvInterval;
  height?: number;
  theme?: "light" | "dark";
}

const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

export default function MarketChart({
  symbol,
  interval = "D",
  height = 560,
  theme = "dark",
}: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(!!window.TradingView);
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "200px" });

  const containerId = useMemo(() => `tv_chart_${Math.random().toString(36).slice(2)}`,[symbol]);

  useEffect(() => {
    if (!inView) return;

    if (!scriptLoaded) {
      const existing = document.querySelector(`script[src='${TV_SCRIPT_SRC}']`);
      if (existing) {
        existing.addEventListener("load", () => setScriptLoaded(true), { once: true });
      } else {
        const script = document.createElement("script");
        script.src = TV_SCRIPT_SRC;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);
      }
    }
  }, [inView, scriptLoaded]);

  useEffect(() => {
    if (!inView || !scriptLoaded || !window.TradingView || !containerRef.current) return;

    // Clear previous instance content (simple cleanup)
    containerRef.current.innerHTML = "";

    try {
      new window.TradingView.widget({
        symbol: symbol || "OANDA:EURUSD",
        interval,
        container_id: containerId,
        autosize: true,
        theme,
        style: "1",
        locale: "en",
        withdateranges: true,
        allow_symbol_change: true,
        studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
        load_last_chart: false,
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (e) {
      // fail silently to avoid breaking the page
      // You may add toast here later
    }
  }, [inView, scriptLoaded, symbol, interval, theme, containerId]);

  return (
    <div ref={ref} className="w-full">
      <div id={containerId} ref={containerRef} style={{ height, width: "100%" }} />
    </div>
  );
}
