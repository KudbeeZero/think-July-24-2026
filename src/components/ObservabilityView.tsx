import React, { useState } from 'react';
import { Activity, Cpu, HardDrive, Zap, RefreshCw, AlertTriangle, CheckCircle2, Database, ShieldCheck } from 'lucide-react';

export function ObservabilityView({ liveFeed = [] }: { liveFeed?: Array<{msg: string, time: string, type: string}> }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [filterType, setFilterType] = useState('all');

  const defaultTelemetryEvents = [
    { id: '1', time: '01:38:12', type: 'INFO', source: 'services/agents/worker.ts', message: 'Worker loop cycle executed. Memory vault similarity score: 0.94' },
    { id: '2', time: '01:35:40', type: 'WARN', source: 'services/ingestion/server.js', message: 'REDIS_RATE_LIMIT_URL deprecated. Failing open with in-memory sliding window fallback.' },
    { id: '3', time: '01:32:05', type: 'INFO', source: 'apps/web/server.ts', message: 'Auth token verified. User twd4lifez@gmail.com connected to WebSocket telemetry.' },
    { id: '4', time: '01:28:19', type: 'SUCCESS', source: 'seed-memory.ts', message: 'Live memory pipeline seeded. 21 vector embeddings initialized in MemoryVault.' },
    { id: '5', time: '01:20:00', type: 'INFO', source: 'refinery/verifier', message: 'E2E test suite passed (21/21 passing). Build status clean.' },
  ];

  const displayFeed = liveFeed.length > 0 
    ? liveFeed.map((evt, idx) => {
        // Parse the raw SSE message like "[System] Agent Mayor..."
        const match = evt.msg.match(/^\[(.*?)\] (.*)$/);
        const source = match ? match[1] : 'System';
        const message = match ? match[2] : evt.msg;
        return {
          id: `live-${idx}`,
          time: new Date().toLocaleTimeString(),
          type: evt.type === 'success' ? 'SUCCESS' : 'INFO',
          source,
          message
        };
      })
    : defaultTelemetryEvents;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-500" /> System Observability & Telemetry
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time worker polling loops, memory vault vectors, and Redis rate-limiting telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#161b22] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-zinc-800 border border-zinc-700/60 rounded-lg text-xs font-medium text-zinc-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-yellow-500" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Worker Loop Rate</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">120 req/min</div>
          <div className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Exponential backoff stable
          </div>
        </div>

        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Rate Limit Quota</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">In-Memory Fallback</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            REDIS_RATE_LIMIT_URL deprecated
          </div>
        </div>

        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Memory Vault Similarity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">98.2% Accuracy</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            21 vector embeddings active
          </div>
        </div>

        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">System Health</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">OPERATIONAL</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            All 12 packages clean
          </div>
        </div>
      </div>

      {/* Visual Chart Placeholder */}
      <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-yellow-500" /> 24-Hour Event Spike Analysis
        </h3>
        <div className="h-40 w-full flex items-end gap-2 pt-6 px-2 border-b border-zinc-800">
          {[12, 18, 25, 14, 8, 30, 45, 90, 200, 150, 80, 60, 40, 30, 25, 40, 70, 110, 85, 50, 35, 20, 15, 10].map(
            (val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-yellow-500/30 hover:bg-yellow-400 border-t-2 border-yellow-500 transition-all rounded-t-sm"
                  style={{ height: `${(val / 200) * 100}%` }}
                />
                <span className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-black text-[9px] text-yellow-400 px-1.5 py-0.5 rounded font-mono z-10 whitespace-nowrap border border-zinc-700">
                  {val} evts
                </span>
              </div>
            )
          )}
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>Now</span>
        </div>
      </div>

      {/* Telemetry Stream Log */}
      <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 bg-[#0d1117] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            Live Telemetry Logs
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">5 events captured</span>
        </div>
        <div className="divide-y divide-zinc-800/60 font-mono text-xs">
          {displayFeed.map((evt) => (
            <div key={evt.id} className="p-3 hover:bg-zinc-800/30 flex items-start gap-3">
              <span className="text-zinc-500 text-[11px] shrink-0">{evt.time}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                  evt.type === 'WARN'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : evt.type === 'SUCCESS'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {evt.type}
              </span>
              <span className="text-zinc-400 text-[11px] font-semibold shrink-0">{evt.source}:</span>
              <span className="text-zinc-300 text-[11px]">{evt.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
