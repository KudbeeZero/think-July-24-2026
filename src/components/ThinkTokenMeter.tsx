import React from 'react';
import { Brain, Cpu, Zap, Activity } from 'lucide-react';

interface ThinkTokenMeterProps {
  totalReasoningTokens: number;
  maxBudget?: number;
  activeModel?: string;
  tokensPerSec?: number;
  onOpenTerminal?: () => void;
}

export const ThinkTokenMeter: React.FC<ThinkTokenMeterProps> = ({
  totalReasoningTokens,
  maxBudget = 1000000,
  activeModel = 'deepseek-reasoner',
  tokensPerSec = 42,
  onOpenTerminal
}) => {
  const percentage = Math.min(100, Math.round((totalReasoningTokens / maxBudget) * 100));

  return (
    <div 
      onClick={onOpenTerminal}
      className="flex items-center gap-2 sm:gap-3 bg-zinc-900/90 border border-yellow-500/30 hover:border-yellow-500/60 transition-all rounded-lg px-2.5 sm:px-3 py-1.5 cursor-pointer group shadow-lg shadow-yellow-500/5 select-none"
      title="Click to view Reasoning Terminal & Live Token Feed"
    >
      <div className="relative flex items-center justify-center">
        <Brain className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform animate-pulse" />
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
      </div>

      <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
        <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-1">
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            THINK TOKENS
          </span>
          <span className="text-zinc-400 font-semibold">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-700/50">
          <div
            className="bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mt-0.5">
          <span>{totalReasoningTokens.toLocaleString()} tkns</span>
          <span className="text-emerald-400/90 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" />
            {tokensPerSec} t/s
          </span>
        </div>
      </div>

      <div className="hidden md:flex flex-col border-l border-zinc-800 pl-2 text-[10px] text-zinc-400 font-mono">
        <span className="text-zinc-500 text-[8px] uppercase tracking-wider">Engine</span>
        <span className="text-yellow-300 font-semibold truncate max-w-[90px]">
          {activeModel === 'deepseek-reasoner' ? 'DeepSeek R1' : 'Grok-3 Fast'}
        </span>
      </div>
    </div>
  );
};
