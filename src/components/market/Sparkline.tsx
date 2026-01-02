import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  positive?: boolean;
}

export function Sparkline({ 
  data, 
  width = 60, 
  height = 20, 
  strokeWidth = 1.5,
  positive = true 
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return { x, y };
    });
    
    // Create smooth curve using quadratic bezier
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y} ${cpX} ${(prev.y + curr.y) / 2}`;
    }
    
    // Connect to last point
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    
    return d;
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <div 
        className="bg-muted/30 rounded animate-pulse" 
        style={{ width, height }} 
      />
    );
  }

  const strokeColor = positive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

  return (
    <svg 
      width={width} 
      height={height} 
      className="overflow-visible"
    >
      {/* Gradient fill under the line */}
      <defs>
        <linearGradient id={`sparkline-gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Fill area */}
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#sparkline-gradient-${positive ? 'up' : 'down'})`}
      />
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* End dot */}
      <circle
        cx={width}
        cy={data.length > 0 ? height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 4) - 2 : height / 2}
        r={2}
        fill={strokeColor}
      />
    </svg>
  );
}