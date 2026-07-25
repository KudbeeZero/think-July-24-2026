import React, { useState } from 'react';
import {
  GitMerge,
  CheckCircle2,
  Clock,
  GitPullRequest,
  AlertCircle,
  Shield,
  Check,
  RefreshCw,
  Zap,
  Server,
  Plug,
  Activity,
  ArrowRight,
  Layers
} from 'lucide-react';

export function MergeQueueView() {
  const [isSyncing, setIsSyncing] = useState(false);

  const prList = [
    {
      id: 'pr-182',
      title: 'feat: Deprecate REDIS_RATE_LIMIT_URL & implement in-memory fallback',
      author: 'Toast',
      branch: 'convoy/phase-11-blockers-and-ui-hotfixes',
      status: 'In Refinery Review',
      checks: '22/22 Green',
      time: '12 mins ago',
    },
    {
      id: 'pr-181',
      title: 'feat: Kudbee Memory Seeding & MCP Integration Pipeline',
      author: 'Toast',
      branch: 'feat/kudbee-memory-seeding-and-mcp',
      status: 'Merged',
      checks: '21/21 Green',
      time: '1 hour ago',
    },
    {
      id: 'pr-179',
      title: 'fix: Upstash 500k Max Requests Exceeded exponential backoff',
      author: 'refinery',
      branch: 'fix/worker-redis-backoff',
      status: 'Merged',
      checks: '18/18 Green',
      time: '3 hours ago',
    },
  ];

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-28 font-mono select-none px-2 sm:px-4">
      
      {/* 1. MERGE QUEUE EXECUTIVE TRANSPORT & CONTROL BAR */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 backdrop-blur-md">
        
        {/* Left: Branding & Counts */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner shrink-0">
              <GitMerge className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-base font-extrabold text-zinc-100 tracking-wider uppercase">
                  AUTOMATED MERGE QUEUE & REFINERY PIPELINE
                </h1>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-bold">
                  {prList.length} QUEUED / LANDED
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Automated Verification Pipeline Managed by Refinery Agent Before Main Land V3.2
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Stats Pills */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-zinc-400">Refinery Status:</span>
            <span className="text-purple-400 font-bold">Active</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">CI Success Rate:</span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          <button
            onClick={handleManualSync}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Queue</span>
          </button>
        </div>
      </div>

      {/* BENTO GRID LAYOUT FOR MERGE QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Main List Box (Spans 2 cols) */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  Active Pull Requests & Merge Pipeline
                </h3>
              </div>
              <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
                Auto-Land Enabled
              </span>
            </div>

            <div className="space-y-3">
              {prList.map((pr) => (
                <div
                  key={pr.id}
                  className="bg-zinc-950/60 border border-zinc-850 hover:border-purple-500/50 rounded-xl p-4 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-400">{pr.id}</span>
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 font-sans">{pr.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                        <span>by <strong className="text-zinc-200">{pr.author}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-zinc-400">{pr.branch}</span>
                        <span>•</span>
                        <span>{pr.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {pr.checks}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          pr.status === 'Merged'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse'
                        }`}
                      >
                        {pr.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Branch Protection</span>
            <span className="text-purple-400 font-bold">Strict CI Rules Enforced</span>
          </div>
        </div>

        {/* Side Stats Box */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  Pipeline Security & Governance
                </h3>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Secured
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-200 font-bold">Draft PR Policy</span>
                  <span className="text-emerald-400 font-bold">Enforced</span>
                </div>
                <div className="text-[9px] text-zinc-500">All agent commits require draft PR setup instantly.</div>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-200 font-bold">Atomic EVAL Guard</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
                <div className="text-[9px] text-zinc-500">Redis EVAL locking prevents race conditions on main.</div>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Refinery Verifier</span>
            <span className="text-emerald-400 font-bold">All Green</span>
          </div>
        </div>

      </div>

    </div>
  );
}

