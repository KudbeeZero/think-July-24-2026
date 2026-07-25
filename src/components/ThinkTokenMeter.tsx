import React from 'react';
import { Brain, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';

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

  // Soft limit is 80% of max budget
  const softLimit = maxBudget * 0.8;
  const isOverSoftLimit = totalReasoningTokens >= softLimit;

  return (
    <>
      {/* Self-contained critical styles for visual decay animations */}
      <style>{`
        @keyframes kilo-jitter {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-0.5px, 0.5px) rotate(-0.5deg); }
          20% { transform: translate(-0.5px, -0.5px) rotate(0.5deg); }
          30% { transform: translate(0.5px, 0.5px) rotate(0deg); }
          40% { transform: translate(0.5px, -0.5px) rotate(-0.5deg); }
          50% { transform: translate(-0.5px, 0.5px) rotate(0.5deg); }
          60% { transform: translate(-0.5px, -0.5px) rotate(0deg); }
          70% { transform: translate(0.5px, 0.5px) rotate(-0.5deg); }
          80% { transform: translate(0.5px, -0.5px) rotate(0.5deg); }
          90% { transform: translate(-0.5px, 0.5px) rotate(0deg); }
          100% { transform: translate(0, 0); }
        }

        @keyframes kilo-decay-flicker {
          0%, 100% { opacity: 0.95; filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.6)); }
          30% { opacity: 0.65; }
          32% { opacity: 0.9; }
          50% { opacity: 0.35; filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.9)); }
          75% { opacity: 0.8; }
          90% { opacity: 0.45; }
        }

        @keyframes kilo-warn-pulse {
          0%, 100% { border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 0 5px rgba(239, 68, 68, 0.15); }
          50% { border-color: rgba(249, 115, 22, 0.9); box-shadow: 0 0 15px rgba(249, 115, 22, 0.45); }
        }

        .animate-kilo-jitter {
          animation: kilo-jitter 0.25s infinite linear;
        }

        .animate-kilo-decay-flicker {
          animation: kilo-decay-flicker 0.6s infinite ease-in-out;
        }

        .animate-kilo-warn-pulse {
          animation: kilo-warn-pulse 1.5s infinite ease-in-out;
        }

        .decay-stripe-bg {
          background-image: linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(0, 0, 0, 0.15) 50%,
            rgba(0, 0, 0, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 8px 8px;
        }
      `}</style>

      <div 
        onClick={onOpenTerminal}
        className={`flex items-center gap-1.5 sm:gap-3 bg-zinc-900/95 border transition-all rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer group shadow-lg select-none shrink-0 ${
          isOverSoftLimit 
            ? 'animate-kilo-warn-pulse border-red-500/60' 
            : isGenerating 
              ? 'border-yellow-500/70 shadow-yellow-500/20 shadow-sm' 
              : 'border-zinc-800 hover:border-yellow-500/40'
        }`}
        title={
          isOverSoftLimit 
            ? `WARNING: Token allocation exceeds 80% soft limit (${softLimit.toLocaleString()} tokens). Visual decay active!` 
            : "Click to view Reasoning Terminal & Live Token Feed"
        }
      >
        <div className="relative flex items-center justify-center">
          {isOverSoftLimit ? (
            <ShieldAlert className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 animate-kilo-jitter`} />
          ) : (
            <Brain className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isGenerating 
                ? 'text-yellow-400 animate-pulse' 
                : 'text-zinc-400 group-hover:text-yellow-400'
            } transition-transform`} />
          )}

          {isGenerating && (
            <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping ${
              isOverSoftLimit ? 'bg-red-500' : 'bg-emerald-400'
            }`} />
          )}
        </div>

        {/* Mobile-only compact view */}
        <div className="flex items-center gap-1 sm:hidden">
          <span className={`text-[10px] font-bold font-mono ${
            isOverSoftLimit ? 'text-red-400 animate-pulse' : 'text-yellow-500'
          }`}>
            {totalReasoningTokens >= 1000 
              ? `${Math.round(totalReasoningTokens / 1000)}k` 
              : totalReasoningTokens}
          </span>
          {isOverSoftLimit && <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
        </div>

        {/* Desktop expanded view */}
        <div className="hidden sm:flex flex-col min-w-[100px] sm:min-w-[125px]">
          <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-1">
            <span className={`font-bold flex items-center gap-1 ${
              isOverSoftLimit 
                ? 'text-red-400 font-extrabold uppercase animate-pulse' 
                : isGenerating 
                  ? 'text-yellow-400' 
                  : 'text-zinc-300'
            }`}>
              {isOverSoftLimit ? (
                <span className="flex items-center gap-1 text-[9px]">
                  DECAY CRITICAL
                </span>
              ) : (
                'THINK TOKENS'
              )}
            </span>
            <span className={`font-bold text-[9px] ${
              isOverSoftLimit ? 'text-red-400 animate-kilo-decay-flicker' : 'text-zinc-400'
            }`}>
              {percentage}%
            </span>
          </div>

          {/* Progress Bar with Decay state support */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
            isOverSoftLimit 
              ? 'bg-red-950/40 border-red-900/60' 
              : 'bg-zinc-800 border-zinc-700/50'
          }`}>
            <div
              className={`h-full transition-all duration-500 relative ${
                isOverSoftLimit 
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 animate-kilo-decay-flicker decay-stripe-bg' 
                  : isGenerating
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400'
                    : 'bg-zinc-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mt-0.5">
            <span className={isOverSoftLimit ? 'text-red-400/80 font-bold' : 'text-zinc-500'}>
              {totalReasoningTokens.toLocaleString()}
            </span>
            <span className={
              isOverSoftLimit 
                ? 'text-red-400 font-bold flex items-center gap-0.5 animate-pulse' 
                : isGenerating 
                  ? 'text-emerald-400 font-bold flex items-center gap-0.5' 
                  : 'text-zinc-500'
            }>
              <Zap className={`w-2.5 h-2.5 ${
                isOverSoftLimit ? 'animate-bounce text-red-400' : isGenerating ? 'animate-bounce' : ''
              }`} />
              {isOverSoftLimit 
                ? 'DECAY ACTIVE' 
                : isGenerating 
                  ? `${activeRate} t/s` 
                  : '0 t/s'}
            </span>
          </div>
        </div>

        <div className={`hidden md:flex flex-col border-l pl-2 text-[10px] font-mono ${
          isOverSoftLimit ? 'border-red-900' : 'border-zinc-800'
        }`}>
          <span className={`${isOverSoftLimit ? 'text-red-500 font-extrabold' : 'text-zinc-500'} text-[8px] uppercase tracking-wider`}>
            {isOverSoftLimit ? 'BUDGET DANGER' : 'Engine'}
          </span>
          <span className={`font-semibold truncate max-w-[90px] ${
            isOverSoftLimit 
              ? 'text-red-400 animate-pulse' 
              : isGenerating 
                ? 'text-yellow-300' 
                : 'text-zinc-400'
          }`}>
            {isOverSoftLimit 
              ? 'STRESS EXCEEDED' 
              : activeModel === 'deepseek-reasoner' 
                ? 'DeepSeek R1' 
                : 'Grok-3 Fast'}
          </span>
        </div>
      </div>
    </>
  );
};
