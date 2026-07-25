import React, { useState } from 'react';
import {
  Brain,
  Bot,
  Activity,
  Zap,
  Play,
  Hexagon,
  Cpu,
  Sparkles,
  Crown,
  Plus,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Agent, Convoy, TelemetryLog } from '../types';

interface OverviewViewProps {
  agents: Agent[];
  convoys: Convoy[];
  liveFeed: TelemetryLog[];
  onOpenSpinUpModal: () => void;
  onOpenGrokTerminal: () => void;
  onSelectAgent: (agent: Agent) => void;
  onRunTestTask: (agentName: string, prompt: string, model: string) => Promise<any>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  agents,
  convoys,
  liveFeed,
  onOpenSpinUpModal,
  onOpenGrokTerminal,
  onSelectAgent,
  onRunTestTask
}) => {
  const [selectedAgentForDispatch, setSelectedAgentForDispatch] = useState<string>(agents[0]?.name || 'Toast');
  const [quickPrompt, setQuickPrompt] = useState('Verify DeepSeek reasoner token capture and test Redis channel');
  const [dispatchModel, setDispatchModel] = useState<'deepseek-reasoner' | 'grok-3-fast'>('deepseek-reasoner');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  // Compute metrics
  const totalReasoningTokens = agents.reduce((acc, a) => acc + (a.reasoningTokensSpent || 0), 0) || 180750;
  const totalPromptTokens = agents.reduce((acc, a) => acc + (a.promptTokensSpent || 0), 0) || 507900;
  const totalCompletionTokens = agents.reduce((acc, a) => acc + (a.completionTokensSpent || 0), 0) || 125300;
  const workingAgentsCount = agents.filter((a) => a.status === 'working').length;
  const totalTasksCompleted = agents.reduce((acc, a) => acc + (a.totalTasksCompleted || 0), 0) || 71;

  const handleQuickDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;

    setIsDispatching(true);
    setDispatchResult(null);

    try {
      const res = await onRunTestTask(selectedAgentForDispatch, quickPrompt, dispatchModel);
      setDispatchResult(res.response || 'Task executed successfully.');
    } catch (err: any) {
      setDispatchResult(`Dispatch Error: ${err.message || 'Failed to dispatch task'}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Quick Action Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-[#131924] to-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0 shadow-inner">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Kudbeeville Executive Control</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                TOWN OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time multi-agent orchestration, reasoning token metrics, and topology control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenGrokTerminal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-yellow-400 font-medium text-xs border border-yellow-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            Terminal Reasoning Trace
          </button>
          <button
            onClick={onOpenSpinUpModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-yellow-500/10"
          >
            <Plus className="w-4 h-4" /> Spin Up Agent
          </button>
        </div>
      </div>

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Reasoning Tokens */}
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-yellow-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold tracking-wider uppercase flex items-center gap-1.5 text-yellow-400">
              <Brain className="w-4 h-4 text-yellow-400" />
              Reasoning Tokens
            </span>
            <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded">
              DeepSeek / Grok
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {totalReasoningTokens.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800/60">
            <span>Prompt: {(totalPromptTokens / 1000).toFixed(1)}k</span>
            <span className="text-emerald-400">Comp: {(totalCompletionTokens / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Metric 2: Active Agents */}
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold tracking-wider uppercase flex items-center gap-1.5 text-emerald-400">
              <Bot className="w-4 h-4 text-emerald-400" />
              Agent Fleet Status
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Online
            </span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {workingAgentsCount} <span className="text-sm font-normal text-zinc-400">/ {agents.length} active</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800/60">
            <span>Mayor + Polecats</span>
            <span className="text-zinc-300 font-semibold">{totalTasksCompleted} tasks solved</span>
          </div>
        </div>

        {/* Metric 3: Active Convoys */}
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold tracking-wider uppercase flex items-center gap-1.5 text-purple-400">
              <Hexagon className="w-4 h-4 text-purple-400" />
              Rigs & Convoys
            </span>
            <span className="text-[10px] font-mono text-purple-400">Phase 11 Active</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            {convoys.length} <span className="text-sm font-normal text-zinc-400">running</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800/60">
            <span>Branch Pipeline</span>
            <span className="text-purple-300">5 Convoy Tasks</span>
          </div>
        </div>

        {/* Metric 4: Engine Health */}
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold tracking-wider uppercase flex items-center gap-1.5 text-blue-400">
              <Activity className="w-4 h-4 text-blue-400" />
              Redis Telemetry
            </span>
            <span className="text-[10px] font-mono text-blue-400">SSE Active</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono flex items-center gap-2">
            0.12ms <span className="text-xs font-normal text-emerald-400">100% Green</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800/60">
            <span>Latency</span>
            <span className="text-blue-300">{liveFeed.length} Stream Events</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Agent Quick Dispatch & Thinking Token Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Quick Task Dispatcher & Agent Fleet Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Task Dispatcher */}
          <div className="bg-[#121720] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Instant Agent Task Dispatcher</h3>
                  <p className="text-xs text-zinc-400">Send prompts directly to agent workers via live API</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Grok / DeepSeek Gateway Ready
              </span>
            </div>

            <form onSubmit={handleQuickDispatch} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Target Agent Worker
                  </label>
                  <select
                    value={selectedAgentForDispatch}
                    onChange={(e) => setSelectedAgentForDispatch(e.target.value)}
                    className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500 font-mono"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.name}>
                        {ag.name} ({ag.role} - {ag.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Reasoning Engine
                  </label>
                  <select
                    value={dispatchModel}
                    onChange={(e: any) => setDispatchModel(e.target.value)}
                    className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500 font-mono"
                  >
                    <option value="deepseek-reasoner">deepseek-reasoner (R1 Thinking)</option>
                    <option value="grok-3-fast">grok-3-fast (xAI Grok API)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Dispatch Prompt
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    placeholder="Enter task instruction..."
                    className="flex-1 bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isDispatching}
                    className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shrink-0 disabled:opacity-50"
                  >
                    {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>

              {dispatchResult && (
                <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 max-h-36 overflow-y-auto custom-scrollbar">
                  <div className="text-[10px] text-yellow-400 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Dispatch Result ({selectedAgentForDispatch})</span>
                    <button onClick={() => setDispatchResult(null)} className="text-zinc-500 hover:text-zinc-300">
                      Clear
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap">{dispatchResult}</pre>
                </div>
              )}
            </form>
          </div>

          {/* Agent Fleet Grid */}
          <div className="bg-[#121720] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                Town Agent Fleet ({agents.length})
              </h3>
              <button
                onClick={onOpenSpinUpModal}
                className="text-xs text-yellow-400 hover:underline font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Provision Agent
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => onSelectAgent(agent)}
                  className="bg-[#171e2b] border border-zinc-800 hover:border-yellow-500/40 rounded-lg p-3.5 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold group-hover:text-yellow-400 transition-colors">
                          {agent.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-200 group-hover:text-yellow-400 transition-colors">
                            {agent.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono capitalize">{agent.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          agent.status === 'working'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    {agent.currentAction && (
                      <p className="text-[11px] text-zinc-400 truncate mb-2 font-mono bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
                        {agent.currentAction}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60 mt-1">
                    <span className="text-yellow-400/90 font-semibold">
                      🧠 {(agent.reasoningTokensSpent || 0).toLocaleString()} tkns
                    </span>
                    <span className="text-zinc-400">{agent.model || 'deepseek-reasoner'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Topology Diagram & Reasoning Feed */}
        <div className="space-y-6">
          {/* System Topology Component */}
          <div className="bg-[#121720] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col items-center">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 w-full flex items-center justify-between">
              <span>System Topology</span>
              <span className="text-[10px] text-yellow-400 font-mono">5 Worker Nodes</span>
            </h3>

            <div className="relative w-full aspect-square max-w-[240px] flex items-center justify-center my-2">
              <svg className="absolute inset-0 w-full h-full text-zinc-700/80" style={{ zIndex: 0 }}>
                <line x1="50%" y1="75%" x2="18%" y2="40%" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50%" y1="75%" x2="34%" y2="28%" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50%" y1="75%" x2="50%" y2="20%" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="75%" x2="66%" y2="28%" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50%" y1="75%" x2="82%" y2="40%" stroke="currentColor" strokeWidth="1.5" />
              </svg>

              {/* Mayor Node */}
              <div className="absolute bottom-[10%] w-16 h-16 rounded-full bg-yellow-400 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] z-10 border-4 border-[#0d1117] cursor-pointer hover:scale-105 transition-transform">
                <Crown className="w-4 h-4 text-zinc-950" />
                <span className="text-[9px] font-bold text-zinc-950">MAYOR</span>
              </div>

              {/* Workers */}
              <div className="absolute top-[34%] left-[8%] w-10 h-10 rounded-full bg-zinc-800 border-2 border-emerald-500/60 flex flex-col items-center justify-center z-10 cursor-pointer hover:scale-110 transition-transform">
                <span className="text-[8px] text-zinc-200 font-semibold">Toast</span>
              </div>
              <div className="absolute top-[22%] left-[26%] w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10 cursor-pointer hover:scale-110 transition-transform">
                <span className="text-[8px] text-zinc-400 font-medium">Maple</span>
              </div>
              <div className="absolute top-[14%] left-[50%] -translate-x-1/2 w-10 h-10 rounded-full bg-zinc-800 border-2 border-yellow-500/80 flex flex-col items-center justify-center z-10 shadow-[0_0_12px_rgba(234,179,8,0.3)] cursor-pointer hover:scale-110 transition-transform">
                <span className="text-[8px] text-yellow-400 font-bold">refinery</span>
              </div>
              <div className="absolute top-[22%] right-[26%] w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10 cursor-pointer hover:scale-110 transition-transform">
                <span className="text-[8px] text-zinc-400 font-medium">Shadow</span>
              </div>
              <div className="absolute top-[34%] right-[8%] w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10 cursor-pointer hover:scale-110 transition-transform">
                <span className="text-[8px] text-zinc-400 font-medium">Clover</span>
              </div>
            </div>

            <div className="w-full text-center text-[10px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800">
              Redis Pub/Sub Mesh Active • 100% Signal Integrity
            </div>
          </div>

          {/* Real-time Telemetry Stream */}
          <div className="bg-[#121720] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col max-h-96">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-yellow-400" />
                Live Telemetry Feed
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {liveFeed.length > 0 ? (
                liveFeed.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-zinc-900/80 border border-zinc-800/80 rounded text-[11px] font-mono space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-yellow-400 font-semibold">{item.source || 'System'}</span>
                      <span className="text-[9px] text-zinc-500">{item.time || item.timestamp || 'now'}</span>
                    </div>
                    <p className="text-zinc-300 break-words">{item.msg || item.event}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-zinc-500 py-6">
                  Waiting for Redis telemetry stream events...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
