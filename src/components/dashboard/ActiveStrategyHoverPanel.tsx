import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, BarChart3, Clock, TrendingUp, 
  AlertTriangle, Layers, Eye
} from 'lucide-react';

interface HoverPanelProps {
  isVisible: boolean;
  details: {
    assets: string[];
    timeframe: string;
    riskMode: string;
    uptime: string;
    todayPnl: string;
    weekPnl: string;
    monthPnl: string;
    winRateVal: string;
    avgRR: string;
    maxDD: string;
    openPositions: number;
    netExposure: string;
    topSymbols: string[];
    capitalAlloc: string;
    lastTrades: string[];
    lastSignal: string;
    lastWarning: string | null;
  };
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'performance', label: 'Perf', icon: TrendingUp },
  { id: 'exposure', label: 'Exposure', icon: Layers },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export const ActiveStrategyHoverPanel = ({ isVisible, details }: HoverPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div
      className={`absolute right-0 top-0 z-20 w-80 bg-popover/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-[0_8px_32px_hsl(var(--background)/0.6)] transition-all duration-200 pointer-events-none ${
        isVisible
          ? 'opacity-100 translate-x-[calc(100%+8px)] pointer-events-auto'
          : 'opacity-0 translate-x-[calc(100%+16px)]'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: isVisible ? '180ms' : '0ms' }}
    >
      {/* Tabs */}
      <div className="flex border-b border-border/20 px-1 pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'text-foreground bg-muted/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 text-xs space-y-3">
        {activeTab === 'overview' && (
          <>
            <Row label="Status">
              <Badge className="text-[10px] h-4 bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-0">running</Badge>
            </Row>
            <Row label="Assets">
              <div className="flex gap-1">
                {details.assets.map(a => (
                  <Badge key={a} variant="outline" className="text-[10px] h-4 border-border/40">{a}</Badge>
                ))}
              </div>
            </Row>
            <Row label="Timeframe"><span>{details.timeframe}</span></Row>
            <Row label="Risk Mode"><span>{details.riskMode}</span></Row>
            <Row label="Uptime"><span className="text-muted-foreground">{details.uptime}</span></Row>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <Row label="Today P&L"><span className="text-[hsl(var(--success))] font-medium">{details.todayPnl}</span></Row>
            <Row label="7D P&L"><span className="text-[hsl(var(--success))]">{details.weekPnl}</span></Row>
            <Row label="30D P&L"><span className="text-[hsl(var(--success))]">{details.monthPnl}</span></Row>
            <Row label="Win Rate"><span className="font-medium">{details.winRateVal}</span></Row>
            <Row label="Avg R:R"><span>{details.avgRR}</span></Row>
            <Row label="Max Drawdown"><span className="text-muted-foreground">{details.maxDD}</span></Row>
          </>
        )}

        {activeTab === 'exposure' && (
          <>
            <Row label="Open Positions"><span className="font-medium">{details.openPositions}</span></Row>
            <Row label="Net Exposure"><span>{details.netExposure}</span></Row>
            <Row label="Top Symbols">
              <div className="flex gap-1">
                {details.topSymbols.map(s => (
                  <Badge key={s} variant="outline" className="text-[10px] h-4 border-border/40">{s}</Badge>
                ))}
              </div>
            </Row>
            <Row label="Capital Alloc"><span>{details.capitalAlloc}</span></Row>
          </>
        )}

        {activeTab === 'activity' && (
          <>
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Last 3 Trades</span>
              {details.lastTrades.map((t, i) => (
                <div key={i} className="text-xs py-1 px-2 rounded bg-muted/20">{t}</div>
              ))}
            </div>
            <Row label="Signal"><span className="text-muted-foreground">{details.lastSignal}</span></Row>
            {details.lastWarning && (
              <Row label="Warning">
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {details.lastWarning}
                </span>
              </Row>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    {children}
  </div>
);
