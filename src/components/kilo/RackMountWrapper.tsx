import React, { useState, useEffect } from 'react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

interface RackMountWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showAgentStatus?: boolean;
}

export function RackMountWrapper({ children, title, className = '', showAgentStatus = false }: RackMountWrapperProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [activeText, setActiveText] = useState('KUDBEE thinking...');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning'>('healthy');
  const { playBeep, playHum } = useSoundEffects();

  useEffect(() => {
    const interval = setInterval(() => {
      // Faster, more erratic blink
      if (Math.random() > 0.4) setIsBlinking(prev => !prev);
      // Toggle text
      if (Math.random() > 0.5) {
        setActiveText(prev => prev === 'KUDBEE thinking...' ? 'KUDBEE flabbergasted...' : 'KUDBEE thinking...');
      }
      if (Math.random() > 0.8) {
        setHealthStatus(prev => prev === 'healthy' ? 'warning' : 'healthy');
      }
    }, 1500);
    playHum();
    return () => clearInterval(interval);
  }, [playHum]);

  return (
    <div 
      className={`relative bg-zinc-700 border-t-2 border-l-2 border-zinc-500 border-b-2 border-r-2 border-zinc-900 rounded-lg p-4 sm:p-5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_10px_15px_-3px_rgba(0,0,0,0.5)] ${className}`}
      onMouseEnter={() => playBeep(220)}
    >
      {/* Ribbon Cable Animation */}
      <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-0 pointer-events-none">
        <div className="w-10 h-1 bg-emerald-500 animate-flow shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      </div>

      {/* SVG Patch Cables */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 drop-shadow-xl" style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))' }}>
        <path d="M 24 24 C 100 150, 150 150, 200 24" fill="transparent" stroke="#eab308" strokeWidth="6" strokeLinecap="round" className="opacity-80 transition-all duration-1000" />
        <path d="M 24 24 C 100 150, 150 150, 200 24" fill="transparent" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
        {/* Second cable */}
        <path d="M calc(100% - 24px) 24 C calc(100% - 100px) 200, 100 200, 24 calc(100% - 24px)" fill="transparent" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" className="opacity-70 transition-all duration-1000" />
        <path d="M calc(100% - 24px) 24 C calc(100% - 100px) 200, 100 200, 24 calc(100% - 24px)" fill="transparent" stroke="#be185d" strokeWidth="2" strokeLinecap="round" className="opacity-40" />
      </svg>

      {/* Input/Output Jacks */}
      <div className="absolute top-2 left-2 flex flex-col items-center gap-1 z-20">
        <span className="text-[8px] font-mono text-zinc-400 uppercase">CV In</span>
        <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
      <div className="absolute top-2 right-2 flex flex-col items-center gap-1 z-20">
        <span className="text-[8px] font-mono text-zinc-400 uppercase">Out 1</span>
        <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 flex flex-col items-center gap-1 z-20">
        <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
        <span className="text-[8px] font-mono text-zinc-400 uppercase">Aux In</span>
      </div>
      <div className="absolute bottom-2 right-2 flex flex-col items-center gap-1 z-20">
        <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => playBeep(880)}>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
        <span className="text-[8px] font-mono text-zinc-400 uppercase">Out 2</span>
      </div>

      {/* System Health LED Strip */}
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-0.5 p-1 bg-zinc-900 rounded-sm border border-zinc-800 z-10">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-0.5 rounded-sm transition-colors duration-300 ${
              healthStatus === 'healthy' 
                ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' 
                : i > 3 ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]'
            }`} 
            style={{ opacity: isBlinking ? 1 : 0.4 }}
          />
        ))}
      </div>

      {/* Cooling Fans */}
      <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 flex gap-4 opacity-30 pointer-events-none">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 border-[3px] border-zinc-700 border-dashed rounded-full animate-[spin_1s_linear_infinite]" />
          <div className="w-2 h-2 bg-zinc-600 rounded-full z-10 shadow-lg" />
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 border-[3px] border-zinc-700 border-dashed rounded-full animate-[spin_0.8s_linear_infinite]" />
          <div className="w-2 h-2 bg-zinc-600 rounded-full z-10 shadow-lg" />
        </div>
      </div>

      {/* Rack mount steel ears */}
      <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-3 h-10 bg-zinc-600 rounded-r border-r border-zinc-900 shadow-lg flex flex-col justify-between p-0.5 z-20">
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
      </div>
      <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-3 h-10 bg-zinc-600 border-l border-zinc-900 shadow-lg flex flex-col justify-between p-0.5 z-20">
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]" />
      </div>

      {title && (
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 mb-4 bg-zinc-800/50 -mx-4 -mt-4 p-4 rounded-t-lg animate-ambient-glow relative overflow-hidden z-20">
          {/* Masking tape label effect */}
          <div className="absolute -top-1 left-4 bg-[#f4e4bc] px-3 py-1 transform -rotate-2 shadow-sm border border-[#d3c299] flex items-center justify-center opacity-90">
             <span className="font-['Courier_New'] font-bold text-zinc-800 text-[10px] tracking-tighter uppercase" style={{ textShadow: '0px 0px 1px rgba(0,0,0,0.3)' }}>{title}</span>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {showAgentStatus && isBlinking && (
              <span className="text-[10px] font-mono text-emerald-400 min-w-[140px] text-right truncate bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {activeText}
              </span>
            )}
          </div>
          <div className={`ml-3 w-2 h-2 rounded-full transition-colors ${isBlinking ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-emerald-950'}`} />
        </div>
      )}
      <div className="mt-2 relative z-20">
        {children}
      </div>
    </div>
  );
}
