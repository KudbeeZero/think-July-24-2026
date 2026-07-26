import React, { useState } from 'react';
import {
  Bot,
  Shield,
  Crown,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  HardDrive,
  Terminal,
  Activity,
  Zap,
  Server,
  Plug,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Search
} from 'lucide-react';
import { Agent } from '../types';

interface AgentsViewProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onToggleStatus: (agentId: string) => void;
}

export function AgentsView({ agents, onSelectAgent, onToggleStatus }: AgentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.currentAction && a.currentAction.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || a.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const activeCount = agents.filter((a) => a.status === 'working').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-28 font-mono select-none px-2 sm:px-4">
      
      {/* 1. AGENTS EXECUTIVE TRANSPORT & CONTROL BAR */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 backdrop-blur-md">
        
        {/* Left: Branding & Counts */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-inner shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-base font-extrabold text-zinc-100 tracking-wider uppercase">
                  ACTIVE WORKER AGENT FLEET & ORCHESTRATION
                </h1>
                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-bold">
                  {activeCount} / {agents.length} OPERATIONAL
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Polecat Workers, Refinery Verifiers, and Mayor Orchestrator Cluster V3.2
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Stats Pills */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-zinc-400">Working:</span>
            <span className="text-green-400 font-bold">{activeCount}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-zinc-400">Idle / Standby:</span>
            <span className="text-yellow-400 font-bold">{idleCount}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-zinc-400">Cluster Health:</span>
            <span className="text-blue-400 font-bold">99.8%</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          <button
            onClick={handleManualSync}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-yellow-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Cluster</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#121620] border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, role, or action..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-mono shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">All Roles</option>
              <option value="polecat" className="bg-zinc-900">Polecat Workers</option>
              <option value="refinery" className="bg-zinc-900">Refinery Verifiers</option>
              <option value="mayor" className="bg-zinc-900">Mayor Orchestrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* BENTO GRID OF AGENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAgents.map((agent) => {
          const isWorking = agent.status === 'working';
          const Icon = agent.icon === 'shield' ? Shield : Bot;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className="bg-[#121620] border-2 border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <div className="flex items-start justify-between pb-3 mb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-700/60 flex items-center justify-center text-yellow-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-yellow-400 transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-yellow-400/90">{agent.role}</span>
                        <span>•</span>
                        <span className={isWorking ? 'text-green-400 font-bold' : 'text-zinc-500'}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(agent.id);
                    }}
                    className={`p-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isWorking
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                    }`}
                    title={isWorking ? 'Pause Agent' : 'Start Agent'}
                  >
                    {isWorking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>

                {agent.hooked && (
                  <div className="text-[10px] text-zinc-400 font-mono bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 mb-3 truncate flex items-center justify-between">
                    <span>Hook: <span className="text-yellow-400 font-bold">{agent.hooked}</span></span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                <p className="text-[11px] text-zinc-300 font-sans italic line-clamp-2 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-850">
                  {agent.currentAction || 'Standing by for bead assignment in cluster queue...'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-4 pt-3 border-t border-zinc-850 font-mono">
                <span>Last Active: {agent.lastActive}</span>
                <span className="text-yellow-400 group-hover:translate-x-1 transition-transform font-bold flex items-center gap-1">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PARALLEL WORKER SERVERS & LIVE GITHUB STREAM HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Sub-Agent Parallel Server Cluster */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider">
                PARALLEL SUB-AGENT WORKER CLUSTERS
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              3 SERVERS ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <div className="text-xs font-bold text-zinc-100">Gateway Server (:3000)</div>
                  <div className="text-[10px] text-zinc-400">Express + Vite SSR / Redis Sync Engine</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                0.8ms Latency
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-zinc-100">Sub-Agent Worker Alpha</div>
                  <div className="text-[10px] text-zinc-400">Local Coding Node / DeepSeek Reasoner Exec</div>
                </div>
              </div>
              <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                PARALLEL RUNNING
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-zinc-100">GitHub Sync Daemon</div>
                  <div className="text-[10px] text-zinc-400">CI Pipeline Stream & Draft PR Webhook Listener</div>
                </div>
              </div>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                STREAMING
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Live Stream & PR Status */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider">
                GITHUB REPOSITORY STREAM & PR TRACKER
              </h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold">
              kilo-cloud/kudbee-monorepo
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="text-yellow-400 font-bold mr-2">PR #181:</span>
                <span className="text-zinc-200">memory seeding & MCP vault</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                MERGED (12/12 PASSED)
              </span>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="text-yellow-400 font-bold mr-2">PR #182:</span>
                <span className="text-zinc-200">fail-open rate limiter patch</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                IN REVIEW (11/11 PASSED)
              </span>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="text-yellow-400 font-bold mr-2">PR #183:</span>
                <span className="text-zinc-200">parallel sub-agent server runner</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> RUNNING CI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

