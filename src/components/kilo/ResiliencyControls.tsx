import React from 'react';
import { Power, Database, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

interface DeepHealthData {
  status: string;
  timestamp: string;
  redisSlow: { connected: boolean; tier: string; latencyMs: number };
  redisFast: { connected: boolean; tier: string; latencyMs: number };
  prunerLock: { locked: boolean; owner?: string; ageSeconds?: number };
  budget: { currentSpend: number; maxLimit: number; exceeds: boolean };
  circuitBreakers: { groqBreaker: string; deepseekBreaker: string };
}

interface ResiliencyControlsProps {
  healthData: DeepHealthData | null;
  isTripping: boolean;
  toggleCircuitBreaker: (action: 'trip' | 'reset') => Promise<void>;
}

export const ResiliencyControls: React.FC<ResiliencyControlsProps> = ({
  healthData,
  isTripping,
  toggleCircuitBreaker,
}) => {
  return (
    <div className="space-y-4">
      {/* Circuit Breaker Console */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl hover:border-red-500/10 transition-all">
        <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider mb-2">
          <Power className="w-4 h-4 text-red-500" />
          Synapse Circuit Breakers (Chaos)
        </h3>
        <p className="text-[10px] text-zinc-400 leading-normal font-mono mb-4">
          KUDBEE insulates API failovers using Circuit Breakers. Test our resiliency framework by manually tripping individual service pipelines.
        </p>

        <div className="space-y-3">
          {/* Groq Breaker */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Groq Breaker Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${healthData?.circuitBreakers?.groqBreaker === 'OPEN' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                <span className={`text-xs font-mono font-bold ${healthData?.circuitBreakers?.groqBreaker === 'OPEN' ? 'text-red-400' : 'text-green-400'}`}>
                  {healthData?.circuitBreakers?.groqBreaker || 'CLOSED (ACTIVE)'}
                </span>
              </div>
            </div>

            <div className="flex gap-1.5 font-mono">
              <button
                disabled={isTripping}
                onClick={() => toggleCircuitBreaker('trip')}
                className="bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-1 rounded transition-all active:scale-95 disabled:opacity-40"
              >
                Trip (Chaos)
              </button>
              <button
                disabled={isTripping}
                onClick={() => toggleCircuitBreaker('reset')}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[9px] font-bold px-2 py-1 rounded transition-all active:scale-95 disabled:opacity-40"
              >
                Reset
              </button>
            </div>
          </div>

          {/* DeepSeek Breaker */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">DeepSeek Breaker Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-mono font-bold text-green-400">
                  {healthData?.circuitBreakers?.deepseekBreaker || 'CLOSED (ACTIVE)'}
                </span>
              </div>
            </div>
            <span className="text-[8px] uppercase font-mono text-zinc-600 font-bold">Auto Managed</span>
          </div>
        </div>
      </div>

      {/* Deep Diagnostics Status Table */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-xl hover:border-green-500/10 transition-all font-mono">
        <div className="text-[10px] font-bold text-zinc-400 uppercase pb-2 border-b border-zinc-800 flex justify-between">
          <span>DEEP DIAGNOSTICS LAYER</span>
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            ONLINE
          </span>
        </div>
        
        <div className="space-y-2 text-[10px] pt-3">
          <div className="flex justify-between">
            <span className="text-zinc-500">Slow DB (Governance):</span>
            <span className={healthData?.redisSlow?.connected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {healthData?.redisSlow?.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Fast DB (Telemetry):</span>
            <span className={healthData?.redisFast?.connected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {healthData?.redisFast?.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Pruner Lock Manager:</span>
            <span className={healthData?.prunerLock?.locked ? 'text-yellow-400 font-bold' : 'text-zinc-400 font-bold'}>
              {healthData?.prunerLock?.locked ? 'LOCKED' : 'AVAILABLE (IDLE)'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Telemetry SSE Stream:</span>
            <span className="text-green-400 font-bold">NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
