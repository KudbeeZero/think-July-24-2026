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
  const { playBeep, playHum } = useSoundEffects();

  useEffect(() => {
    const interval = setInterval(() => {
      // Faster, more erratic blink
      if (Math.random() > 0.4) setIsBlinking(prev => !prev);
      // Toggle text
      if (Math.random() > 0.5) {
        setActiveText(prev => prev === 'KUDBEE thinking...' ? 'KUDBEE flabbergasted...' : 'KUDBEE thinking...');
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

      {/* Input/Output Jacks */}
      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
      </div>
      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
      </div>
      <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
      </div>
      <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
      </div>

      {/* Rack mount steel ears */}
      <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-3 h-10 bg-zinc-600 rounded-r border-r border-zinc-900 shadow-lg flex flex-col justify-between p-0.5 z-20">
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800" />
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800" />
      </div>
      <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-3 h-10 bg-zinc-600 border-l border-zinc-900 shadow-lg flex flex-col justify-between p-0.5 z-20">
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800" />
        <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800" />
      </div>

      {title && (
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 mb-4 bg-zinc-800/50 -mx-4 -mt-4 p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-zinc-200 uppercase tracking-wider">{title}</h2>
            {showAgentStatus && isBlinking && (
              <span className="text-[10px] font-mono text-emerald-400 min-w-[140px] truncate">
                {activeText}
              </span>
            )}
          </div>
          <div className={`w-2 h-2 rounded-full transition-colors ${isBlinking ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-emerald-950'}`} />
        </div>
      )}
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}
