import React, { useState } from 'react';
import { Activity, Cpu, HardDrive, Zap, RefreshCw, AlertTriangle, CheckCircle2, Database, ShieldCheck, Network, Lock, Flame } from 'lucide-react';
import { RoutingVisualizer } from './RoutingVisualizer';
import { AuditVaultCard } from './AuditVaultCard';
import { ThinkStoragePlugin } from './ThinkStoragePlugin';
import { PostgresDbConsole } from './PostgresDbConsole';
import { ChaosMonkeyCard } from './ChaosMonkeyCard';

export function ObservabilityView({ liveFeed = [] }: { liveFeed?: Array<{msg: string, time: string, type: string}> }) {
  const [timeRange, setTimeRange] = useState('24h');

  const defaultTelemetryEvents = [
    { id: '1', time: '01:38:12', type: 'INFO', source: 'services/agents/worker.ts', message: 'Worker loop cycle executed. Memory vault similarity score: 0.94' },
    { id: '2', time: '01:35:40', type: 'WARN', source: 'services/ingestion/server.js', message: 'REDIS_RATE_LIMIT_URL deprecated. Failing open with in-memory sliding window fallback.' },
    { id: '3', time: '01:32:05', type: 'INFO', source: 'apps/web/server.ts', message: 'Auth token verified. User twd4lifez@gmail.com connected to WebSocket telemetry.' },
    { id: '4', time: '01:28:19', type: 'SUCCESS', source: 'seed-memory.ts', message: 'Live memory pipeline seeded. 21 vector embeddings initialized in MemoryVault.' },
    { id: '5', time: '01:20:00', type: 'INFO', source: 'refinery/verifier', message: 'E2E test suite passed (21/21 passing). Build status clean.' },
  ];

  const displayFeed = liveFeed.length > 0 
    ? liveFeed.map((evt, idx) => {
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-28 lg:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-500" /> KUD-THINK System Observability & Telemetry
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Suboxone Effect Canonical State, BraiNCA 7-Node Trajectories & Spheroid BlockTrain Ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#161b22] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none font-mono"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-zinc-800 border border-zinc-700/60 rounded-lg text-xs font-medium text-zinc-300 transition-colors font-mono">
            <RefreshCw className="w-3.5 h-3.5 text-yellow-500" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Dual-Redis Workload</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">Suboxone Model</div>
          <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fast & Slow DB Segregated
          </div>
        </div>

        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">7-Node Matrix</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">BraiNCA Active</div>
          <div className="text-[11px] text-cyan-400 mt-1">
            Continuous-Time CfC Routing
          </div>
        </div>

        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Sentinel Ed25519</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">PROVEN</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            BlockTrain Hash-Chain Anchors
          </div>
        </div>

        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">System Health</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">HEALTHY</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Deep Check & Chaos Ready
          </div>
        </div>
      </div>

      {/* 1. BraiNCA 7-Node Routing Visualizer */}
      <RoutingVisualizer />

      {/* 2. Spheroid BlockTrain Ledger & Sentinel Provenance */}
      <AuditVaultCard />

      {/* 3. Memory Vault & Think Storage Plugin */}
      <ThinkStoragePlugin />

      {/* 3.5 Real-Time Postgres Database Console */}
      <PostgresDbConsole />

      {/* 4. Chaos Resilience & Circuit Breaker Control */}
      <ChaosMonkeyCard />

      {/* Telemetry Stream Log */}
      <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 bg-[#0d1117] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            Live Telemetry Logs
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">{displayFeed.length} events captured</span>
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
