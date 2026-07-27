import React, { useState } from 'react';
import { Brain, Layers, Zap, Hexagon } from 'lucide-react';

interface ThinkTokenCubeProps {
  totalTokens?: number;
  maxTokens?: number;
  activeModel?: string;
  className?: string;
}

export const ThinkTokenCube: React.FC<ThinkTokenCubeProps> = ({
  totalTokens = 180750,
  maxTokens = 1000000,
  activeModel = "deepseek-reasoner",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate 6x6x6 isometric block grid coordinates
  const GRID_SIZE = 6; 
  const blocks = [];

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Find the center core for the "Heart/Valve" logic
        const isCore = (x >= 2 && x <= 3) && (y >= 2 && y <= 3) && (z >= 2 && z <= 3);

        const isoX = (x - y) * 16;
        // Increase spacing (5-6 pixels as requested: - z * 16 instead of 14)
        const isoY = (x + y) * 9 - z * 16;
        const opacity = 0.3 + (z / GRID_SIZE) * 0.5; // Glass projection opacity
        
        blocks.push({ x, y, z, isoX, isoY, opacity, isCore });
      }
    }
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      
      {/* 3D Isometric Matrix Token Container */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-full group cursor-pointer p-4 rounded-xl bg-[#030305]/90 border border-purple-900/40 hover:border-purple-500/60 shadow-[0_10px_40px_rgba(147,51,234,0.15)] transition-all overflow-hidden"
      >
        {/* Background Grid Floor Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Floating "SHIPPED / ACTIVE" Status Pill */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-900/50 border border-purple-500/40 text-[8px] font-mono font-bold text-purple-300 uppercase tracking-widest shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          <span>ACTIVE CUBE</span>
        </div>

        {/* 3D Isometric Canvas Representation */}
        <div className="relative w-full h-48 flex items-center justify-center my-2 perspective-1000">
          
          {/* Wireframe Bounding Box (No-contact field) */}
          <div className="absolute w-40 h-40 border border-cyan-500/20 rounded-xl transform rotate-45 skew-x-12 skew-y-12 pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />

          {/* Isometric Floating Blocks Stack */}
          <div className="relative transform translate-y-4 scale-90">
            {blocks.map((b, i) => {
              if (b.isCore) return null; // Render core separately later to ensure z-index/glow dominance

              return (
                <div
                  key={i}
                  className="absolute w-3.5 h-3.5 transition-all duration-300 group-hover:scale-105"
                  style={{
                    transform: `translate(${b.isoX}px, ${b.isoY}px)`,
                    zIndex: b.x + b.y + b.z * 10
                  }}
                >
                  {/* Isometric Top Face (Glass projection) */}
                  <div 
                    className="w-3.5 h-2.5 bg-purple-400/20 border-t border-l border-purple-200/40 backdrop-blur-sm"
                    style={{
                      transform: 'skewX(-45deg) rotate(15deg)',
                      opacity: b.opacity
                    }}
                  />
                  {/* Isometric Side Face */}
                  <div 
                    className="w-3.5 h-2 bg-purple-900/30 border-r border-b border-purple-800/50 backdrop-blur-sm"
                    style={{
                      transform: 'skewY(35deg)',
                      opacity: b.opacity
                    }}
                  />
                </div>
              );
            })}

            {/* Pulsing Energy Core (Heart Valve) */}
            <div className="absolute w-12 h-12 left-[-20px] top-[-30px] z-[500] pointer-events-none flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl animate-pulse" />
              <Hexagon className="w-6 h-6 text-cyan-300 animate-[spin_10s_linear_infinite]" />
              <div className="absolute w-3 h-3 bg-white rounded-full blur-sm animate-ping" />
            </div>
          </div>
        </div>

        {/* Live Token Metric Footer */}
        <div className="flex items-center justify-between border-t border-purple-900/40 pt-2 font-mono relative z-20">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-black text-purple-200">
              {totalTokens.toLocaleString()}
            </span>
            <span className="text-[9px] text-purple-400/70">/ 1M TKN</span>
          </div>

          <div className="flex items-center gap-1 text-[9px] text-zinc-400">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Energy Core Active</span>
          </div>
        </div>
      </div>

      {/* Expanded Breakdown Modal */}
      {isExpanded && (
        <div className="mt-2 w-full p-3 rounded-lg bg-[#030305]/95 border border-purple-500/30 text-xs font-mono text-zinc-300 space-y-1.5 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between border-b border-zinc-800 pb-1 text-[10px] text-purple-400 font-bold">
            <span>ISOLATED AGENT ARCHITECTURE</span>
            <span>GLASS PROJECTION</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Core Heart Valve =</span>
            <span className="text-cyan-300 font-bold">Compression Engine Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">No-Contact Order =</span>
            <span className="text-emerald-400">Agents Isolated & Shielded</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Active Model =</span>
            <span className="text-amber-400 font-bold">{activeModel}</span>
          </div>
        </div>
      )}
    </div>
  );
};
