import React, { useState, useEffect } from 'react';
import { Flame, ShieldAlert, RefreshCw, Activity, Zap, CheckCircle2, AlertOctagon } from 'lucide-react';
import { HealthDeepStatus } from '../types';

export const ChaosMonkeyCard: React.FC = () => {
  const [health, setHealth] = useState<HealthDeepStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const fetchDeepHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/health-deep');
      const data: HealthDeepStatus = await res.json();
      setHealth(data);
    } catch (err) {
      console.error('[ChaosMonkeyCard] Deep health fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeepHealth();
  }, []);

  const handleTripGroqBreaker = async () => {
    try {
      const res = await fetch('/api/system/chaos/trip-groq', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message || 'Groq Circuit Breaker tripped to OPEN!');
      await fetchDeepHealth();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetGroqBreaker = async () => {
    try {
      const res = await fetch('/api/system/chaos/reset-groq', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message || 'Groq Circuit Breaker reset to CLOSED!');
      await fetchDeepHealth();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-5 shadow-xl font-mono">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Chaos Resilience & Circuit Breaker Control
            </h3>
            <p className="text-xs text-zinc-400">Deep Health Verification & Chaos Monkey Testing</p>
          </div>
        </div>

        <button
          onClick={fetchDeepHealth}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
          Health Deep-Check
        </button>
      </div>

      {message && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
          {message}
        </div>
      )}

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dual Redis Status */}
          <div className="bg-[#0d1117] border border-zinc-800 rounded-lg p-3 space-y-2 text-xs">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Dual-Redis Workload Isolation
            </h4>

            <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Slow DB (Governance & Reasoning):</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  health.redisSlow.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {health.redisSlow.connected ? 'ONLINE' : 'IN-MEMORY FALLBACK'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400">Fast DB (Telemetry & SSE):</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  health.redisFast.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {health.redisFast.connected ? 'ONLINE' : 'IN-MEMORY FALLBACK'}
              </span>
            </div>
          </div>

          {/* Circuit Breakers & Chaos Controls */}
          <div className="bg-[#0d1117] border border-zinc-800 rounded-lg p-3 space-y-2 text-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Circuit Breaker States
              </h4>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 mb-2">
                <span className="text-zinc-400">Groq Breaker:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    health.circuitBreakers.groqBreaker === 'CLOSED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  }`}
                >
                  {health.circuitBreakers.groqBreaker}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleTripGroqBreaker}
                className="flex-1 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded text-[11px] transition-colors"
              >
                ⚡ Chaos: Force OPEN
              </button>
              <button
                onClick={handleResetGroqBreaker}
                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded text-[11px] border border-zinc-700 transition-colors"
              >
                Reset CLOSED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
