import React from 'react';
import { X, Bot, Shield, Cpu, HardDrive, Terminal, Play, Pause, RefreshCw, Plus, Search, Link, Hash, Activity, Zap, Wifi, CheckCircle2, Radio, Server } from 'lucide-react';
import { Agent, Bead } from '../types';
import { useDrawerA11y } from '../hooks/useDrawerA11y';
import { useKilo } from '../context/KiloContext';
import { DigitalSpectrumAnalyzer } from './kilo/DigitalSpectrumAnalyzer';
import { AgentActivityHistory } from './AgentActivityHistory';

const AVAILABLE_SKILLS = [
  'Drizzle Schema Migration',
  'Redis Resiliency & Fail-Open',
  'Memory Pipeline & Semantic Recall',
  'Google Maps Platform Checkout',
  'OAuth Popup Integrations',
  'Workspace API Sheet Integrations',
  'PCA Reducer Compiler',
  'Relational Database Sync',
  'Fail-Open Rate Limiter',
  'Middleware Guard Routing',
  'Upstash Redis Fallback',
  'Google Maps Geolocation',
  'Interactive Store Locators'
];

const AVAILABLE_PLUGINS = [
  'Drizzle DDL Engine',
  'Upstash Redis Failover Shield',
  'MemoryVault SQLite Indexer',
  'Google Maps JS Autocomplete',
  'OAuth Identity Gateway',
  'Gmail Workspace Hook',
  'Cloud SQL Executor',
  'Places Autocomplete Widget'
];

const AVAILABLE_TAGS = [
  'Think-Tokens',
  'Fast-Tokens',
  'Fail-Open',
  'Postgres-Sync',
  'Cosine-Semantic',
  'Verified-Trace',
  'Resilient-Pipe',
  'Maps-Widget',
  'OAuth-Flow'
];

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
  onToggleStatus: (agentId: string) => void;
  onRunTestTask?: (agentName: string, prompt: string, model: string) => Promise<any>;
}

export function AgentDetailModal({ agent, onClose, onToggleStatus, onRunTestTask }: AgentDetailModalProps) {
  if (!agent) return null;

  const containerRef = useDrawerA11y<HTMLDivElement>({
    isOpen: !!agent,
    onClose,
  });

  const { agents, setAgents, beads, liveFeed, handleUpdateBeadAssignee, handleUpdateBeadStatus, agentHeartbeat } = useKilo();
  const [agentPrompt, setAgentPrompt] = React.useState('');
  const [isRunningTask, setIsRunningTask] = React.useState(false);
  const [taskOutput, setTaskOutput] = React.useState<string | null>(null);

  const [beadSearch, setBeadSearch] = React.useState('');
  const [showBeadDropdown, setShowBeadDropdown] = React.useState(false);

  const currentAgent = agents.find(a => a.id === agent.id) || agent;

  const isWorking = currentAgent.status === 'working';
  const Icon = currentAgent.icon === 'shield' ? Shield : currentAgent.icon === 'cpu' ? Cpu : Bot;

  // Real-time telemetry attributes fetched directly from KiloContext telemetry layer
  const currentLatency = currentAgent.latency || 12;
  const currentStatus = currentAgent.status || 'idle';
  const healthScore = currentAgent.healthScore || 98;

  // Filter live telemetry log entries related to this agent/node
  const nodeLogs = (liveFeed || []).filter(item => 
    item.source?.toLowerCase().includes(currentAgent.name.toLowerCase()) || 
    item.event?.toLowerCase().includes(currentAgent.name.toLowerCase()) ||
    item.msg?.toLowerCase().includes(currentAgent.name.toLowerCase())
  ).slice(0, 3);

  // Calculate dynamic CPU Usage based on status
  const cpuVal = isWorking ? ((currentAgent.name.length * 4.3 + 12.8) % 25 + 14.1).toFixed(1) : '0.1';
  const cpuPct = isWorking ? Math.min(100, Math.round(parseFloat(cpuVal))) : 1;

  // Calculate Memory Usage
  const memK = isWorking ? Math.round((currentAgent.reasoningTokensSpent || 62410) / 1000) : 12;

  const toggleSkill = (skill: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === currentAgent.id) {
        const currentSkills = a.skills || [];
        const updatedSkills = currentSkills.includes(skill)
          ? currentSkills.filter(s => s !== skill)
          : [...currentSkills, skill];
        return { ...a, skills: updatedSkills };
      }
      return a;
    }));
  };

  const togglePlugin = (plugin: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === currentAgent.id) {
        const currentPlugins = a.plugins || [];
        const updatedPlugins = currentPlugins.includes(plugin)
          ? currentPlugins.filter(p => p !== plugin)
          : [...currentPlugins, plugin];
        return { ...a, plugins: updatedPlugins };
      }
      return a;
    }));
  };

  const toggleTag = (tag: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === currentAgent.id) {
        const currentTags = a.tags || [];
        const updatedTags = currentTags.includes(tag)
          ? currentTags.filter(t => t !== tag)
          : [...currentTags, tag];
        return { ...a, tags: updatedTags };
      }
      return a;
    }));
  };

  const openBeads = beads.filter(b => b.status === 'open' && (!b.assignee || b.assignee === 'none'));
  const filteredBeads = openBeads.filter(b => 
    b.title.toLowerCase().includes(beadSearch.toLowerCase()) || 
    b.id.toLowerCase().includes(beadSearch.toLowerCase())
  );

  const assignToBead = (bead: Bead) => {
    // 1. Update the bead status and assignee
    handleUpdateBeadAssignee(bead.id, currentAgent.name);
    handleUpdateBeadStatus(bead.id, 'in_progress');

    // 2. Update the agent
    setAgents(prev => prev.map(a => {
      if (a.id === currentAgent.id) {
        return { 
          ...a, 
          status: 'working',
          hooked: bead.id, 
          currentAction: `Hooked to bead [${bead.id}]: ${bead.title}`,
          lastActive: 'just now'
        };
      }
      return a;
    }));

    setShowBeadDropdown(false);
    setBeadSearch('');
  };

  const handleExecuteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentPrompt.trim() || !onRunTestTask) return;

    setIsRunningTask(true);
    setTaskOutput(null);

    try {
      if (!isWorking) {
        onToggleStatus(currentAgent.id);
      }
      const res = await onRunTestTask(currentAgent.name, agentPrompt, currentAgent.model || 'grok-3-fast');
      setTaskOutput(res.response || 'Task executed cleanly.');
      setAgentPrompt('');
    } catch (err: any) {
      setTaskOutput(`Error: ${err.message || 'Execution failed'}`);
    } finally {
      setIsRunningTask(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Agent Inspection: ${agent.name}`}
    >
      <div 
        ref={containerRef}
        className="bg-[#0d1117] border-l border-zinc-800 w-full max-w-xl h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-[#161b22] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
              isWorking ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/30' : 'border-zinc-700/60 text-yellow-400 bg-zinc-900'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">{agent.name}</h3>
                <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  {agent.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Status: <span className={isWorking ? 'text-green-400 font-semibold' : 'text-zinc-500 font-mono'}>
                  {isWorking ? '● WORKING' : '○ IDLE (STANDBY)'}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1 bg-[#0d1117]">
          {/* Action Trigger */}
          <div className="flex items-center justify-between bg-[#161b22] border border-zinc-800 rounded-xl p-4 shadow-sm">
            <div>
              <div className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Execution Engine Control</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {isWorking ? 'Worker process actively processing tasks' : 'Worker process paused in idle state'}
              </div>
            </div>
            <button
              onClick={() => onToggleStatus(agent.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                isWorking
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
              }`}
            >
              {isWorking ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Worker
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Worker
                </>
              )}
            </button>
          </div>

          {/* Telemetry metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU Usage
              </div>
              <div className="text-xl font-bold text-zinc-100 font-mono">{cpuVal}%</div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isWorking ? 'bg-blue-500' : 'bg-zinc-600'}`}
                  style={{ width: `${cpuPct}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Context Memory
              </div>
              <div className="text-xl font-bold text-zinc-100 font-mono">{memK}K / 1M</div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isWorking ? 'bg-purple-500' : 'bg-zinc-600'}`}
                  style={{ width: `${Math.min(100, Math.max(1, Math.round((memK / 1000) * 100)))}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Production Rack Space: Digital Spectrum Analyzer */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between px-1">
              <span>RACK SPACE INSTRUMENTATION</span>
              <span className="text-cyan-400">DSP VECTOR SCOPE</span>
            </div>
            <DigitalSpectrumAnalyzer 
              agentName={currentAgent.name} 
              latencyMs={currentLatency} 
              status={currentStatus} 
            />
          </div>

          <AgentActivityHistory 
            agent={currentAgent} 
            liveFeed={liveFeed} 
            onTriggerHeartbeat={agentHeartbeat} 
          />

          {/* Real-Time Telemetry Layer Node Health & Latency Dashboard */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> KiloContext Telemetry Layer
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase font-mono tracking-wider">SSE Stream Synchronized</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Real-time Latency Indicator */}
              <div className="bg-black/50 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Node Latency</span>
                  <Wifi className={`w-3.5 h-3.5 ${currentLatency <= 20 ? 'text-emerald-400' : currentLatency <= 50 ? 'text-amber-400' : 'text-red-400'}`} />
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-xl font-mono font-extrabold ${currentLatency <= 20 ? 'text-emerald-400' : currentLatency <= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {currentLatency}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">ms</span>
                </div>
                {/* Latency Ping Jitter Bar */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                    {[12, 18, 14, 22, 10, currentLatency].map((val, idx) => (
                      <div 
                        key={idx} 
                        className={`flex-1 rounded-sm ${val <= 20 ? 'bg-emerald-500' : val <= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ height: `${Math.min(100, Math.max(20, (val / 60) * 100))}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] text-zinc-500 font-mono">{currentLatency <= 20 ? 'OPT' : 'NORM'}</span>
                </div>
              </div>

              {/* Real-time Status Indicator */}
              <div className="bg-black/50 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Node Status</span>
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5 my-1">
                  <span className={`text-xs font-mono font-black uppercase px-2 py-0.5 rounded border ${
                    isWorking 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {currentStatus.toUpperCase()}
                  </span>
                </div>
                <div className="text-[8px] text-zinc-400 font-mono truncate">
                  {isWorking ? 'Processing tasks' : 'Idle standby pool'}
                </div>
              </div>

              {/* Health Score Indicator */}
              <div className="bg-black/50 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Health Score</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-xl font-mono font-extrabold text-emerald-400">{healthScore}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">%</span>
                </div>
                <div className="text-[8px] text-emerald-500/80 font-mono flex items-center gap-1 truncate">
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0" /> NOMINAL
                </div>
              </div>
            </div>

            {/* Live Telemetry Node Feed Stream Snippet */}
            <div className="bg-black/60 border border-zinc-850 rounded-lg p-2.5 space-y-1.5 font-mono text-[10px]">
              <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold uppercase border-b border-zinc-850 pb-1">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Telemetry Packet Stream
                </span>
                <span>Source: /api/telemetry/stream</span>
              </div>
              {nodeLogs.length > 0 ? (
                nodeLogs.map((log, i) => (
                  <div key={i} className="text-zinc-300 flex items-center justify-between gap-2 text-[9px]">
                    <span className="truncate text-zinc-400">{log.event || log.msg}</span>
                    <span className="text-[8px] text-zinc-600 shrink-0">{log.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic text-[9px] flex items-center justify-between">
                  <span>Packet tick: CPU {cpuVal}% | Memory {memK}K | Latency {currentLatency}ms</span>
                  <span className="text-emerald-400 font-bold text-[8px]">SYNCD</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Skills, Plugins & Tags Editor (SkillsManager) */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" /> Operational Skills Console
              </h4>
              <span className="text-[9px] sm:text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase font-mono">
                Interactive Console
              </span>
            </div>

            {/* Operational Skills Section */}
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Active Skills</span>
                <span className="text-[9px] text-zinc-500 font-mono">{(currentAgent.skills || []).length} assigned</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(currentAgent.skills || []).length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No specific operational skills assigned.</span>
                ) : (
                  (currentAgent.skills || []).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded font-semibold font-mono flex items-center gap-1 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer"
                      title="Click to remove skill"
                    >
                      {skill}
                      <X className="w-3 h-3 text-current shrink-0" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <div className="text-[9px] text-zinc-500 font-bold mb-1.5 uppercase tracking-wider">Add Operational Skill:</div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-black/40 border border-zinc-800/60 rounded-lg custom-scrollbar">
                  {AVAILABLE_SKILLS.filter(s => !(currentAgent.skills || []).includes(s)).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 px-2 py-1 rounded font-mono flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-zinc-500 shrink-0" /> {skill}
                    </button>
                  ))}
                  {AVAILABLE_SKILLS.filter(s => !(currentAgent.skills || []).includes(s)).length === 0 && (
                    <span className="text-[9px] text-zinc-600 font-semibold italic">All skills assigned.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Registered Plugins Section */}
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Registered Extensions / Plugins</span>
                <span className="text-[9px] text-zinc-500 font-mono">{(currentAgent.plugins || []).length} active</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(currentAgent.plugins || []).length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No custom plugins registered.</span>
                ) : (
                  (currentAgent.plugins || []).map(plugin => (
                    <button
                      key={plugin}
                      type="button"
                      onClick={() => togglePlugin(plugin)}
                      className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded font-semibold font-mono flex items-center gap-1 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer"
                      title="Click to deregister plugin"
                    >
                      {plugin}
                      <X className="w-3 h-3 text-current shrink-0" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <div className="text-[9px] text-zinc-500 font-bold mb-1.5 uppercase tracking-wider">Add Custom Extension:</div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-black/40 border border-zinc-800/60 rounded-lg custom-scrollbar">
                  {AVAILABLE_PLUGINS.filter(p => !(currentAgent.plugins || []).includes(p)).map(plugin => (
                    <button
                      key={plugin}
                      type="button"
                      onClick={() => togglePlugin(plugin)}
                      className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 px-2 py-1 rounded font-mono flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-zinc-500 shrink-0" /> {plugin}
                    </button>
                  ))}
                  {AVAILABLE_PLUGINS.filter(p => !(currentAgent.plugins || []).includes(p)).length === 0 && (
                    <span className="text-[9px] text-zinc-600 font-semibold italic">All extensions active.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Operational Tags Section */}
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Operations & Token Tags</span>
                <span className="text-[9px] text-zinc-500 font-mono">{(currentAgent.tags || []).length} tagged</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(currentAgent.tags || []).length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No operational tags assigned.</span>
                ) : (
                  (currentAgent.tags || []).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded font-bold font-mono flex items-center gap-1 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer"
                      title="Click to untag"
                    >
                      #{tag}
                      <X className="w-3 h-3 text-current shrink-0" />
                    </button>
                  ))
                )}
              </div>

              <div>
                <div className="text-[9px] text-zinc-500 font-bold mb-1.5 uppercase tracking-wider">Apply Tags:</div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-black/40 border border-zinc-800/60 rounded-lg custom-scrollbar">
                  {AVAILABLE_TAGS.filter(t => !(currentAgent.tags || []).includes(t)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 px-2 py-1 rounded font-bold font-mono flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-zinc-500 shrink-0" /> #{tag}
                    </button>
                  ))}
                  {AVAILABLE_TAGS.filter(t => !(currentAgent.tags || []).includes(t)).length === 0 && (
                    <span className="text-[9px] text-zinc-600 font-semibold italic">All tags applied.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Assign to Bead Dispatcher */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-blue-400" /> Quick Dispatch Assignment
              </div>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">COMMAND PALETTE</span>
            </div>

            <div className="relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search & assign open beads..."
                  value={beadSearch}
                  onChange={(e) => {
                    setBeadSearch(e.target.value);
                    setShowBeadDropdown(true);
                  }}
                  onFocus={() => setShowBeadDropdown(true)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                {(showBeadDropdown || beadSearch) && (
                  <button 
                    onClick={() => {
                      setShowBeadDropdown(false);
                      setBeadSearch('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {showBeadDropdown && (
                <div className="absolute z-50 mt-1.5 w-full bg-[#0d1117] border border-zinc-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                  {filteredBeads.length > 0 ? (
                    filteredBeads.map(bead => (
                      <button
                        key={bead.id}
                        onClick={() => assignToBead(bead)}
                        className="w-full text-left px-3.5 py-3 hover:bg-zinc-800 border-b border-zinc-800/50 last:border-0 transition-all flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-100 font-bold truncate group-hover:text-blue-400">{bead.title}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                              bead.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                              bead.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                              {bead.priority.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">#{bead.id}</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-zinc-500 flex items-center gap-2 font-mono">
                          <span className="uppercase tracking-tighter text-zinc-400">{bead.type}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>Created {bead.createdAt}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="text-xs text-zinc-500 italic mb-1">No matching open beads found.</div>
                      <div className="text-[10px] text-zinc-600">Try a different search query or check the beads list.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!showBeadDropdown && (
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <Hash className="w-3 h-3" />
                <span>Currently {openBeads.length} unassigned beads available in the pool.</span>
              </div>
            )}
          </div>

          {/* Hooked bead details */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Currently Hooked Bead Hash
            </div>
            <div className="text-xs font-mono text-yellow-400 break-all bg-black/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
              <span>{isWorking ? (currentAgent.hooked || 'e89f21a4-c4ec9718') : 'none (idle)'}</span>
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">HOOKED</span>
            </div>
          </div>

          {/* Direct Agent Command Input */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div className="text-xs font-bold text-zinc-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-yellow-400" /> Dispatch Task to {currentAgent.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{currentAgent.model || 'grok-3-fast'}</span>
            </div>
            <form onSubmit={handleExecuteTask} className="flex gap-2 mt-3">
              <input
                type="text"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder={`Instruct ${currentAgent.name}...`}
                className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                disabled={isRunningTask || !agentPrompt.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isRunningTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run
              </button>
            </form>

            {taskOutput && (
              <div className="mt-3 p-3 bg-black/60 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{taskOutput}</pre>
              </div>
            )}
          </div>

          {/* Current Activity Stream */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-yellow-500" /> Live Action Output Stream
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Last Active: {currentAgent.lastActive}</span>
            </div>
            <div className="bg-[#080c11] border border-zinc-850 rounded-lg p-3.5 font-mono text-xs text-zinc-300 leading-relaxed min-h-[100px] shadow-inner">
              {currentAgent.currentAction || (isWorking ? 'Processing queue tasks and telemetry synchronization...' : 'Agent standing by in idle standby state.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
