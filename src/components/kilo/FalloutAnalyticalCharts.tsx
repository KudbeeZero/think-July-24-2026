import React, { useState, useEffect } from 'react';
import { Activity, Shield, Database, Sliders, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

interface FalloutHistoryPoint {
  timestamp: string;
  falloutScore: number;
  latencyMs: number;
  memorySaturation: number;
}

interface FalloutAnalyticalChartsProps {
  healthData: {
    fallout?: {
      score: number;
      throughputDrop: number;
      memorySaturation: number;
      decayState: 'nominal' | 'warning' | 'critical';
      syntheticLatencyMs: number;
    };
  } | null;
}

export const FalloutAnalyticalCharts: React.FC<FalloutAnalyticalChartsProps> = ({ healthData }) => {
  const [history, setHistory] = useState<FalloutHistoryPoint[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Toggles for displaying individual data series
  const [showFallout, setShowFallout] = useState(true);
  const [showLatency, setShowLatency] = useState(true);
  const [showMemory, setShowMemory] = useState(true);

  // Initialize with some fluctuating baseline history to keep layout active
  useEffect(() => {
    const baseline: FalloutHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now - i * 15000);
      const timeStr = d.toTimeString().split(' ')[0];
      baseline.push({
        timestamp: timeStr,
        falloutScore: Math.round(15 + Math.random() * 10),
        latencyMs: Math.round(100 + Math.random() * 150),
        memorySaturation: Math.round(30 + Math.random() * 5),
      });
    }
    setHistory(baseline);
  }, []);

  // Update history when new healthData comes in
  useEffect(() => {
    if (!healthData) return;

    const currentScore = healthData.fallout?.score ?? 0;
    const currentLatency = healthData.fallout?.syntheticLatencyMs ?? 0;
    const currentMemory = healthData.fallout?.memorySaturation ?? 30;
    const timeStr = new Date().toTimeString().split(' ')[0];

    setHistory(prev => {
      // Check if we already appended this tick to avoid duplicate points on fast re-renders
      if (prev.length > 0 && prev[prev.length - 1].timestamp === timeStr) {
        return prev;
      }
      const updated = [
        ...prev,
        {
          timestamp: timeStr,
          falloutScore: currentScore,
          latencyMs: currentLatency,
          memorySaturation: currentMemory,
        }
      ];
      // Keep last 15 points
      return updated.slice(-15);
    });
  }, [healthData]);

  if (history.length === 0) return null;

  // Chart dimension constants
  const width = 600;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max bounds for scaling
  const maxFallout = 100;
  const maxLatency = Math.max(2000, ...history.map(p => p.latencyMs), 400); // Scale dynamically up to max latency
  const maxMemory = 100;

  // Helper to compute coordinates
  const getCoordinates = (point: FalloutHistoryPoint, index: number) => {
    const x = paddingLeft + (index / (history.length - 1)) * chartWidth;
    
    // Y positions scaled individually
    const yFallout = paddingTop + chartHeight - (point.falloutScore / maxFallout) * chartHeight;
    const yLatency = paddingTop + chartHeight - (point.latencyMs / maxLatency) * chartHeight;
    const yMemory = paddingTop + chartHeight - (point.memorySaturation / maxMemory) * chartHeight;

    return { x, yFallout, yLatency, yMemory };
  };

  // Generate SVG Paths
  let falloutPath = '';
  let latencyPath = '';
  let memoryPath = '';

  history.forEach((point, idx) => {
    const { x, yFallout, yLatency, yMemory } = getCoordinates(point, idx);
    if (idx === 0) {
      falloutPath = `M ${x} ${yFallout}`;
      latencyPath = `M ${x} ${yLatency}`;
      memoryPath = `M ${x} ${yMemory}`;
    } else {
      falloutPath += ` L ${x} ${yFallout}`;
      latencyPath += ` L ${x} ${yLatency}`;
      memoryPath += ` L ${x} ${yMemory}`;
    }
  });

  return (
    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/40 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Activity className="w-4 h-4 text-amber-500" /> Cognitive Fallout & Resilience Core Correlation Chart
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Live correlation mapping showing latency stress testing and volatile cache memory saturation.
            </p>
          </div>

          {/* Series Visibility Toggles */}
          <div className="flex items-center gap-2.5 text-[9px] font-mono shrink-0">
            <button
              onClick={() => setShowFallout(!showFallout)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                showFallout 
                  ? 'border-red-500/30 bg-red-500/10 text-red-400 font-bold' 
                  : 'border-zinc-800 text-zinc-500'
              }`}
            >
              {showFallout ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Fallout ({history[history.length - 1].falloutScore}%)</span>
            </button>

            <button
              onClick={() => setShowLatency(!showLatency)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                showLatency 
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold' 
                  : 'border-zinc-800 text-zinc-500'
              }`}
            >
              {showLatency ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Latency ({history[history.length - 1].latencyMs}ms)</span>
            </button>

            <button
              onClick={() => setShowMemory(!showMemory)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                showMemory 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold' 
                  : 'border-zinc-800 text-zinc-500'
              }`}
            >
              {showMemory ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Volatile Memory ({history[history.length - 1].memorySaturation}%)</span>
            </button>
          </div>
        </div>

        {/* The SVG Line Graph */}
        <div className="relative w-full overflow-hidden select-none bg-black/30 border border-zinc-900 rounded-lg p-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-zinc-700">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = paddingTop + ratio * chartHeight;
              return (
                <g key={index}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="rgba(63, 63, 70, 0.25)" 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    fill="rgba(161, 161, 170, 0.4)" 
                    fontSize="7" 
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {Math.round((1 - ratio) * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Timestamps X-Axis Labels */}
            {history.map((point, index) => {
              if (index % 3 !== 0 && index !== history.length - 1) return null;
              const x = paddingLeft + (index / (history.length - 1)) * chartWidth;
              return (
                <text 
                  key={index} 
                  x={x} 
                  y={height - 6} 
                  fill="rgba(161, 161, 170, 0.4)" 
                  fontSize="7" 
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {point.timestamp}
                </text>
              );
            })}

            {/* SVGs Lines */}
            {showLatency && (
              <path 
                d={latencyPath} 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {showMemory && (
              <path 
                d={memoryPath} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {showFallout && (
              <path 
                d={falloutPath} 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2.25" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* Hover Guides & Interactive Nodes */}
            {history.map((point, index) => {
              const { x, yFallout, yLatency, yMemory } = getCoordinates(point, index);

              return (
                <g key={index}>
                  {/* Invisible broad click/hover columns */}
                  <rect
                    x={x - (chartWidth / history.length) / 2}
                    y={paddingTop}
                    width={chartWidth / history.length}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Vertical indicator line on hover */}
                  {hoveredIndex === index && (
                    <line 
                      x1={x} 
                      y1={paddingTop} 
                      x2={x} 
                      y2={paddingTop + chartHeight} 
                      stroke="rgba(255,255,255,0.15)" 
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Data Points */}
                  {showLatency && hoveredIndex === index && (
                    <circle cx={x} cy={yLatency} r="4" fill="#06b6d4" stroke="#020617" strokeWidth="1.5" />
                  )}
                  {showMemory && hoveredIndex === index && (
                    <circle cx={x} cy={yMemory} r="4" fill="#10b981" stroke="#020617" strokeWidth="1.5" />
                  )}
                  {showFallout && hoveredIndex === index && (
                    <circle cx={x} cy={yFallout} r="4.5" fill="#f59e0b" stroke="#020617" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Render hover Tooltip box */}
          {hoveredIndex !== null && (
            <div className="absolute top-3 right-3 bg-zinc-900/95 border border-zinc-800 p-2 rounded-lg text-[9px] font-mono text-zinc-300 shadow-xl space-y-1 backdrop-blur-md pointer-events-none min-w-[120px] z-10 animate-fade-in">
              <div className="font-bold text-zinc-400 border-b border-zinc-800 pb-0.5 mb-1 flex items-center justify-between">
                <span>METRICS TICK</span>
                <span className="text-[8px] text-zinc-500 font-normal">{history[hoveredIndex].timestamp}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">Fallout Score:</span>
                <span className="font-bold text-amber-400">{history[hoveredIndex].falloutScore}%</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">Synaptic Latency:</span>
                <span className="font-bold text-cyan-400">{history[hoveredIndex].latencyMs}ms</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500">Volatile Mem:</span>
                <span className="font-bold text-emerald-400">{history[hoveredIndex].memorySaturation}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
