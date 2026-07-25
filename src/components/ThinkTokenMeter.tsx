import React from 'react';
import { Brain, Cpu, Zap, Activity } from 'lucide-react';

interface ThinkTokenMeterProps {
  totalReasoningTokens: number;
  maxBudget?: number;
  activeModel?: string;
  tokensPerSec?: number;
  isGenerating?: boolean;
  onOpenTerminal?: () => void;
}

export const ThinkTokenMeter: React.FC<ThinkTokenMeterProps> = ({
  totalReasoningTokens,
  maxBudget = 1000000,
  activeModel = 'deepseek-reasoner',
  tokensPerSec = 0,
  isGenerating = false,
  onOpenTerminal
}) => {
  const percentage = Math.min(100, Math.round((totalReasoningTokens / maxBudget) * 100));
  const activeRate = isGenerating ? (tokensPerSec || 42) : 0;

  return (
    <div 
      onClick={onOpenTerminal}
      className={`flex items-center gap-1.5 sm:gap-3 bg-zinc-900/90 border ${
        isGenerating ? 'border-yellow-500/70 shadow-yellow-500/20' : 'border-zinc-800 hover:border-yellow-500/40'
      } transition-all rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer group shadow-lg select-none shrink-0`}
      title="Click to view Reasoning Terminal & Live Token Feed"
    >
      <div className="relative flex items-center justify-center">
        <Brain className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isGenerating ? 'text-yellow-400 animate-pulse' : 'text-zinc-400 group-hover:text-yellow-400'} transition-transform`} />
        {isGenerating && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
        )}
      </div>

      {/* Mobile-only compact view */}
      <div className="flex items-center gap-1 sm:hidden">
        <span className="text-[10px] font-bold font-mono text-yellow-500">
          {totalReasoningTokens >= 1000 
            ? `${Math.round(totalReasoningTokens / 1000)}k` 
            : totalReasoningTokens}
        </span>
      </div>

      {/* Desktop expanded view */}
      <div className="hidden sm:flex flex-col min-w-[95px] sm:min-w-[110px]">
        <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-1">
          <span className={`${isGenerating ? 'text-yellow-400' : 'text-zinc-300'} font-bold flex items-center gap-1`}>
            THINK TOKENS
          </span>
          <span className="text-zinc-400 font-semibold text-[9px]">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden border border-zinc-700/50">
          <div
            className={`h-full transition-all duration-500 ${
              isGenerating
                ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400'
                : 'bg-zinc-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mt-0.5">
          <span>{totalReasoningTokens.toLocaleString()}</span>
          <span className={isGenerating ? 'text-emerald-400 font-bold flex items-center gap-0.5' : 'text-zinc-500'}>
            <Zap className={`w-2.5 h-2.5 ${isGenerating ? 'animate-bounce' : ''}`} />
            {isGenerating ? `${activeRate} t/s` : '0 t/s'}
          </span>
        </div>
      </div>

      <div className="hidden md:flex flex-col border-l border-zinc-800 pl-2 text-[10px] text-zinc-400 font-mono">
        <span className="text-zinc-500 text-[8px] uppercase tracking-wider">Engine</span>
        <span className={`font-semibold truncate max-w-[90px] ${isGenerating ? 'text-yellow-300' : 'text-zinc-400'}`}>
          {activeModel === 'deepseek-reasoner' ? 'DeepSeek R1' : 'Grok-3 Fast'}
        </span>
      </div>
    </div>
  );
};
