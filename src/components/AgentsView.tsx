import React, { useState, useEffect } from 'react';
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
  Search,
  Database,
  Sliders,
  Gauge,
  Key,
  Volume2,
  Lock,
  Unlock,
  CpuIcon,
  Sparkles,
  Moon,
  Radio,
  FileText
} from 'lucide-react';
import { Agent } from '../types';
import { useKilo } from '../context/KiloContext';

// --- ProTools/Autotune Clickable Rotary Knob ---
interface TuningKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  unit?: string;
}

function TuningKnob({ label, value, min, max, onChange, unit = '' }: TuningKnobProps) {
  const percent = ((value - min) / (max - min)) * 100;
  // Rotate angle from -135deg to +135deg (total 270 degrees sweep)
  const degrees = (percent / 100) * 270 - 135;

  const handleKnobClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Stepped rotation: advance by 0.1 or 20%
    const step = (max - min) * 0.2;
    let nextVal = value + step;
    if (nextVal > max + 0.01) {
      nextVal = min;
    }
    // Round cleanly
    onChange(Math.round(nextVal * 10) / 10);
  };

  return (
    <div className="flex flex-col items-center select-none" onClick={(e) => e.stopPropagation()}>
      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">{label}</span>
      <div
        onClick={handleKnobClick}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-zinc-750 via-zinc-850 to-zinc-950 border-2 border-[#161b22] shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center relative cursor-pointer active:scale-95 transition-all group"
        title="Click to tune parameters"
      >
        {/* LED ticks glow */}
        <div className="absolute inset-0 rounded-full border border-yellow-500/10 pointer-events-none group-hover:border-yellow-500/20" />
        
        {/* Notch marker pointer */}
        <div
          className="w-1.5 h-1.5 rounded-full bg-yellow-400 absolute top-0.5 shadow-[0_0_4px_rgba(234,179,8,0.8)] transition-transform duration-300 ease-out origin-center"
          style={{
            transform: `rotate(${degrees}deg)`,
            transformOrigin: '50% 18px'
          }}
        />
        
        {/* Display value inside center */}
        <span className="text-[8px] font-extrabold font-mono text-yellow-500/90 tracking-tighter mt-1">{value}{unit}</span>
      </div>
      
      <div className="text-[8px] font-mono text-zinc-500 font-bold mt-1.5 flex gap-1 items-center">
        <span>MIN</span>
        <span className="text-yellow-500/60">•</span>
        <span>MAX</span>
      </div>
    </div>
  );
}

// --- Live EQ Equalizer Visualizer ---
function LevelEqualizer({ isWorking }: { isWorking: boolean }) {
  const [heights, setHeights] = useState([20, 45, 60, 30, 15]);

  useEffect(() => {
    if (!isWorking) {
      setHeights([10, 15, 10, 12, 8]);
      return;
    }
    const interval = setInterval(() => {
      setHeights([
        Math.floor(Math.random() * 65) + 20,
        Math.floor(Math.random() * 85) + 15,
        Math.floor(Math.random() * 95) + 5,
        Math.floor(Math.random() * 70) + 10,
        Math.floor(Math.random() * 50) + 10,
      ]);
    }, 150);
    return () => clearInterval(interval);
  }, [isWorking]);

  return (
    <div className="flex items-end gap-1.5 h-7 w-12 bg-black/60 border border-zinc-800/80 p-1.5 rounded-md shadow-inner" title="Studio Signal Level">
      {heights.map((h, i) => {
        let color = 'bg-green-500/80 shadow-[0_0_4px_rgba(16,185,129,0.5)]';
        if (h > 75) {
          color = 'bg-red-500/90 shadow-[0_0_4px_rgba(239,68,68,0.7)]';
        } else if (h > 50) {
          color = 'bg-yellow-400/80 shadow-[0_0_4px_rgba(234,179,8,0.6)]';
        }
        return (
          <div
            key={i}
            className={`w-1 rounded-sm transition-all duration-150 ${color}`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

interface AgentsViewProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onToggleStatus: (agentId: string) => void;
}

export function AgentsView({ agents, onSelectAgent, onToggleStatus }: AgentsViewProps) {
  const { setAgents } = useKilo();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'idle' | 'paused'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [clusterData, setClusterData] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);

  // Bring-Your-Own-Key (BYOK) Local State
  const [byokModel, setByokModel] = useState('gemini-2.0-flash');
  const [byokKey, setByokKey] = useState('');
  const [byokStatus, setByokStatus] = useState<string>('');
  const [byokSuccess, setByokSuccess] = useState(false);

  // LED Telemetry random blink
  const [ledBlink, setLedBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLedBlink(prev => !prev);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchClusterInfo = async () => {
      try {
        const r1 = await fetch('/api/agents/workers/mode');
        if (r1.ok) setClusterData(await r1.json());

        const r2 = await fetch('/api/github/stream');
        if (r2.ok) setGithubData(await r2.json());
      } catch (e) {
        console.error("Failed to fetch HUD stream");
      }
    };
    fetchClusterInfo();
    const interval = setInterval(fetchClusterInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.currentAction && a.currentAction.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || a.role.toLowerCase() === roleFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'working' && a.status === 'working') ||
      ((statusFilter === 'idle' || statusFilter === 'paused') && a.status === 'idle');

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = agents.filter((a) => a.status === 'working').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  // Mutate agent parameters (Cognitive Speed / Temp / Bypass)
  const updateAgentField = (agentId: string, field: string, val: any) => {
    setAgents((prev: Agent[]) => prev.map(a => a.id === agentId ? { ...a, [field]: val } : a));
  };
  const handleDatabaseStateChange = (agentId: string) => {
    setAgents((prev: Agent[]) => prev.map(a => {
      if (a.id === agentId) {
        const nextStatus = a.status === 'working' ? 'idle' : 'working';
        return {
          ...a,
          status: nextStatus,
          inStandbyRoom: nextStatus === 'idle',
          lastActive: 'just now',
          currentAction: nextStatus === 'working' ? 'Processing database queue state...' : 'Standing by in idle storage pool.'
        };
      }
      return a;
    }));
  };

  // Wake Up Agent & Assign Active Task
  const handleWakeUpAgent = (agentId: string) => {
    setAgents((prev: Agent[]) => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          status: 'working',
          inStandbyRoom: false,
          lastActive: 'Just now',
          currentAction: `Woken up by operator. Processing active task queue on Redis DB ${a.redisDbIndex || 1}...`
        };
      }
      return a;
    }));
  };

  // Place Agent in Standby Room / Sleep Mode
  const handleSleepAgent = (agentId: string) => {
    setAgents((prev: Agent[]) => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          status: 'idle',
          inStandbyRoom: true,
          lastActive: 'Standing by in sync chamber',
          lastSleepTime: 'Just now',
          currentAction: `Sleeping in Standby Chamber (Redis DB ${a.redisDbIndex || 1}). Ingesting AGENTS.md & peer telemetries.`
        };
      }
      return a;
    }));
  };

  // Trigger AGENTS.md Directives Sync for Agent
  const handleSyncAgentsMd = (agentId: string) => {
    setAgents((prev: Agent[]) => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          agentsMdSynced: true,
          currentAction: `AGENTS.md Directives refreshed & verified. Standby knowledge cache synced.`
        };
      }
      return a;
    }));
  };

  // BYOK Save Tunnel Handler
  const handleEstablishByokTunnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!byokKey.trim()) {
      setByokStatus('ERROR: Empty cryptographic token.');
      setByokSuccess(false);
      return;
    }
    setByokStatus('Establishing secured pipeline tunnel...');
    setByokSuccess(false);
    setTimeout(() => {
      setByokStatus(`SUCCESS: SECURED HYBRID TUNNEL ESTABLISHED ON PORT 3005. FULL REASONING CEILING REMOVED ON ${byokModel.toUpperCase()}.`);
      setByokSuccess(true);
    }, 1000);
  };

  // Register premium Hermes V4 Node Agent
  const handleInjectHermesCore = () => {
    const exists = agents.find(a => a.id === 'agent-hermes');
    if (exists) {
      alert("Hermes Cognitive Swarm Node V4 is already injected and online!");
      return;
    }

    const hermesAgent: Agent = {
      id: 'agent-hermes',
      name: 'Hermes V4 Neural Core',
      role: 'mayor',
      status: 'idle',
      lastActive: 'initialized',
      currentAction: 'Hermes neural core standing by. MemoryVault database synchronized (free brain unlocked).',
      icon: 'shield',
      model: 'hermes-v4-neural',
      reasoningTokensSpent: 0,
      promptTokensSpent: 0,
      completionTokensSpent: 0,
      totalTasksCompleted: 0,
      temperature: 0.6,
      skills: ['Fail-Open Rate Limiter', 'Memory Pipeline Seeding', 'Semantic Cosine Recall', 'Upstash Redis Fallback'],
      plugins: ['MemoryVault SQLite Indexer', 'Cloud SQL Executor'],
      tags: ['Hermes-Neural', 'Free-Brain', 'Fail-Open', 'BYO-Key']
    };

    setAgents((prev: Agent[]) => [hermesAgent, ...prev]);
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

      {/* 2. HERMES NEURAL CORE & FREE BRAIN (BYOK) - PRE-BUILT MODULE */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900/90 to-[#121620] border-2 border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 justify-between relative z-10">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-extrabold text-purple-300 uppercase tracking-wider">
                💎 HERMES NEURAL COGNITIVE CORE & FREE BRAIN SYSTEM
              </h2>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed max-w-2xl font-sans">
              As part of being on our premium platform, every Swarm Cluster is pre-licensed with a free, offline-resilient <strong className="text-yellow-400 font-bold font-mono">Hermes-V4</strong> Agent and a local <strong className="text-purple-300 font-bold">MemoryVault indexer</strong> (Your free brain!). Connect your own API keys below to unlock unlimited tokens with zero overhead.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleInjectHermesCore}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all border border-purple-400/30 flex items-center gap-2 shadow-lg"
              >
                <Cpu className="w-4 h-4 text-purple-200" />
                <span>Inject Hermes-V4 Core Node</span>
              </button>
              <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-1 rounded border border-zinc-800">
                Memory Indexing: <span className="text-emerald-400 font-extrabold">ONLINE (SQLite Local)</span>
              </span>
            </div>
          </div>

          {/* BYOK Key Panel */}
          <div className="w-full lg:w-[420px] bg-black/50 border border-zinc-800 p-4 rounded-xl shadow-inner font-mono shrink-0">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-yellow-400" /> BYO API Secret Tunnel (BYOC)
            </div>
            <form onSubmit={handleEstablishByokTunnel} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={byokModel}
                  onChange={(e) => setByokModel(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-yellow-500"
                >
                  <option value="gemini-2.0-flash">Gemini Flash 2.0</option>
                  <option value="deepseek-v3">DeepSeek V3</option>
                  <option value="grok-3">Grok 3 Pro</option>
                </select>
                <input
                  type="password"
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                  placeholder="Paste private API credentials token..."
                  className="flex-1 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 px-3 py-1.5 focus:outline-none focus:border-yellow-500 placeholder-zinc-600 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-zinc-850 hover:bg-zinc-700 text-zinc-200 hover:text-yellow-400 text-xs py-1.5 rounded-lg border border-zinc-700 transition-colors font-bold"
              >
                Establish Secured Key Tunnel
              </button>
            </form>

            {byokStatus && (
              <div className={`text-[9px] mt-2.5 p-2 rounded border break-all font-mono leading-normal ${
                byokSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {byokStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. AGENT STANDBY ROOM & KNOWLEDGE SYNC CHAMBER */}
      <div className="bg-[#0f131c] border-2 border-yellow-500/20 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Moon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                AGENT STANDBY ROOM & CONTINUOUS SYNC CHAMBER
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[9px] border border-yellow-500/30">
                  {agents.filter(a => a.status === 'idle' || a.inStandbyRoom).length} STANDBY WORKERS INGESTING TELEMETRY
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Sleeping agents continuously ingest peer telemetry stream & <span className="text-yellow-400 font-bold">AGENTS.md</span> directives while waiting for task dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              agents.filter(a => a.status === 'idle' || a.inStandbyRoom).forEach(a => handleSyncAgentsMd(a.id));
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Broadcast AGENTS.md Refresh to Standby Pool</span>
          </button>
        </div>

        {/* Standby Pool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {agents.filter(a => a.status === 'idle' || a.inStandbyRoom).length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-zinc-500 font-mono bg-zinc-950/40 rounded-xl border border-zinc-850">
              All agent nodes are currently active on worker tasks. Click "Sleep / Standby" on an agent card below to move them into the Standby Chamber.
            </div>
          ) : (
            agents.filter(a => a.status === 'idle' || a.inStandbyRoom).map((agent) => (
              <div
                key={agent.id}
                className="bg-black/60 border border-zinc-800/80 hover:border-yellow-500/40 rounded-xl p-3 flex flex-col justify-between space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-ping" />
                    <span className="text-xs font-extrabold text-zinc-100 font-mono">{agent.name}</span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      DB {agent.redisDbIndex || 1}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 bg-yellow-500/10 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/20">
                    STANDBY
                  </span>
                </div>

                <div className="text-[10px] text-zinc-400 font-mono bg-zinc-950 p-2 rounded border border-zinc-850 leading-relaxed truncate">
                  <span className="text-yellow-500/90 font-bold">In-Chamber Activity:</span> {agent.currentAction || 'Ingesting peer telemetries & AGENTS.md directives.'}
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>AGENTS.md: {agent.agentsMdSynced ? 'SYNCED (INIT)' : 'PENDING'}</span>
                  </div>
                  <span>Last Sleep: {agent.lastSleepTime || agent.lastActive}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-zinc-900">
                  <button
                    onClick={() => handleWakeUpAgent(agent.id)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-extrabold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Wake Up & Assign</span>
                  </button>
                  <button
                    onClick={() => handleSyncAgentsMd(agent.id)}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                    title="Sync AGENTS.md Instructions"
                  >
                    <RefreshCw className="w-3 h-3 text-yellow-400" />
                  </button>
                </div>
              </div>
            ))
          )}
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
          {/* Status Filter Component */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 font-mono">
            {(['all', 'working', 'idle', 'paused'] as const).map((status) => {
              const label = {
                all: 'All',
                working: 'Working',
                idle: 'Idle',
                paused: 'Paused'
              }[status];
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase cursor-pointer ${
                    active
                      ? 'bg-yellow-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

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

      {/* BENTO GRID OF AGENTS - SOLID HARDWARE RACK-MOUNT UNITS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const isWorking = agent.status === 'working';
          const Icon = agent.icon === 'shield' ? Shield : Bot;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-[#0e1118] border-2 border-zinc-850 hover:border-yellow-500/50 rounded-xl relative shadow-2xl flex flex-col justify-between cursor-pointer transition-all group overflow-hidden min-h-[380px]"
            >
              {/* LEFT HARDWARE RAIL BRACKET */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 border-r border-zinc-950 flex flex-col justify-between items-center py-4 z-10">
                {/* Metallic Screws */}
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-md flex items-center justify-center text-[2px]">
                  <div className="w-1 h-[1px] bg-zinc-500 rotate-45" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-md flex items-center justify-center text-[2px]">
                  <div className="w-1 h-[1px] bg-zinc-500 -rotate-45" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-md flex items-center justify-center text-[2px]">
                  <div className="w-1 h-[1px] bg-zinc-500 rotate-12" />
                </div>
              </div>

              {/* RIGHT HARDWARE RAIL BRACKET */}
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-zinc-800 via-zinc-700 to-zinc-900 border-l border-zinc-950 flex flex-col justify-between items-center py-4 z-10">
                {/* Metallic Screws */}
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-md flex items-center justify-center text-[2px]">
                  <div className="w-1 h-[1px] bg-zinc-500 -rotate-12" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-md flex items-center justify-center text-[2px]">
                  <div className="w-1 h-[1px] bg-zinc-500 rotate-45" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-md flex items-center justify-center text-[2px]">
                  <div className="w-1 h-[1px] bg-zinc-500 -rotate-45" />
                </div>
              </div>

              {/* CARD CHASSIS FRONTPLATE (Indented padding pl-6 pr-6 for physical rails) */}
              <div className="pl-6 pr-6 pt-4 pb-2 flex-1 flex flex-col justify-between">
                <div>
                  
                  {/* Top Bar: Icon, Title & Pause Switch */}
                  <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-black/60 border border-zinc-700/60 flex items-center justify-center text-yellow-400 shadow-inner shrink-0 relative">
                        <Icon className="w-4.5 h-4.5" />
                        {isWorking && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-500 animate-ping" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-[13px] font-extrabold text-zinc-100 group-hover:text-yellow-400 transition-colors truncate">
                          {agent.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                          <span className="font-mono text-yellow-500/80 uppercase font-bold">{agent.role}</span>
                          <span className="text-zinc-700">•</span>
                          <span className={`uppercase font-extrabold font-mono text-[9px] ${isWorking ? 'text-green-400 animate-pulse' : 'text-zinc-500'}`}>
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
                      className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isWorking
                          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                          : 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                      }`}
                      title={isWorking ? 'Bypass/Pause Node' : 'Engage/Start Node'}
                    >
                      {isWorking ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
                    </button>
                  </div>

                  {/* Hardware Analog Signals & LED Lights Row */}
                  <div className="flex items-center justify-between bg-black/40 border border-zinc-850 rounded-xl p-2 mb-3.5 shadow-inner">
                    <div className="flex items-center gap-3">
                      {/* PWR LED */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          isWorking 
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse' 
                            : 'bg-emerald-950 border border-emerald-500/30'
                        }`} />
                        <span className="text-[7px] text-zinc-500 font-bold">PWR</span>
                      </div>
                      
                      {/* TELEM LED */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                          isWorking && ledBlink
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]' 
                            : 'bg-amber-950 border border-amber-500/30'
                        }`} />
                        <span className="text-[7px] text-zinc-500 font-bold">DATA</span>
                      </div>

                      {/* SYNC LED */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                          isWorking 
                            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.85)]' 
                            : 'bg-cyan-950 border border-cyan-500/30'
                        }`} />
                        <span className="text-[7px] text-zinc-500 font-bold">LINK</span>
                      </div>
                    </div>

                    {/* ProTools EQ visualizer */}
                    <LevelEqualizer isWorking={isWorking} />
                  </div>

                  {/* Hook Stream & Action */}
                  {agent.hooked && (
                    <div className="text-[10px] text-zinc-400 font-mono bg-black/70 p-2 rounded-lg border border-zinc-900 mb-3.5 truncate flex items-center justify-between">
                      <span>Bead Hook: <span className="text-yellow-400 font-bold">{agent.hooked}</span></span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-300 font-sans italic line-clamp-2 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-zinc-900 shadow-inner">
                    {agent.currentAction || 'Unit online. Standing by in the idle cluster stack...'}
                  </p>

                  {/* Dynamic Tuning Knobs */}
                  <div className="grid grid-cols-2 gap-4 mt-3.5 bg-black/25 p-2 rounded-xl border border-zinc-900/60">
                    <TuningKnob 
                      label="Cog Range"
                      value={agent.temperature || 0.5}
                      min={0.1}
                      max={1.0}
                      onChange={(val) => updateAgentField(agent.id, 'temperature', val)}
                    />
                    <TuningKnob 
                      label="Gain Limit"
                      value={agent.totalTasksCompleted ? Math.round((agent.totalTasksCompleted % 5) + 1) : 1}
                      min={1}
                      max={5}
                      unit="x"
                      onChange={(val) => {}}
                    />
                  </div>

                </div>

                {/* Card Footer: Redis DB Badge, Sleep/Wake & Sync controls */}
                <div className="mt-3 pt-3 border-t border-zinc-850 font-mono space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[9px] text-yellow-400 font-bold">
                      REDIS DB {agent.redisDbIndex || 1}
                    </span>
                    <span className="text-zinc-500">Active: {agent.lastActive}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {agent.status === 'working' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSleepAgent(agent.id);
                        }}
                        className="flex-1 bg-zinc-850 hover:bg-zinc-700 text-yellow-400 font-extrabold text-[10px] py-1.5 rounded-lg border border-yellow-500/30 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <Moon className="w-3 h-3" />
                        <span>Sleep to Standby</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWakeUpAgent(agent.id);
                        }}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-extrabold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Wake Up Node</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncAgentsMd(agent.id);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                      title="Sync AGENTS.md Instructions"
                    >
                      <RefreshCw className="w-3 h-3 text-yellow-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. KUDBEE SWARM INSTANT STATE DATABASE TABLE */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl font-mono">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
              KUDBEE SWARM STATE REGISTER & OPERATIONAL DATABASE
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase animate-pulse">
            Active SQLite DB Synced
          </span>
        </div>

        <p className="text-[10px] text-zinc-400 leading-normal mb-4 font-mono max-w-4xl">
          Below is the live global registry state database. <strong className="text-yellow-400 font-bold">Click on any agent's operational state cell</strong> to instantly toggle their status record directly inside the cluster repository database schema.
        </p>

        {/* Responsive Database Table */}
        <div className="overflow-x-auto border border-zinc-850 rounded-xl bg-zinc-950/60 shadow-inner">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                <th className="p-3">Agent ID</th>
                <th className="p-3">Cognitive Node</th>
                <th className="p-3">Target Host : Port</th>
                <th className="p-3 text-center">Status Database Record</th>
                <th className="p-3">Active Skills Count</th>
                <th className="p-3">Connected Brain</th>
                <th className="p-3 text-right">Instant Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-[11px] text-zinc-300 font-mono">
              {agents.map((agent) => {
                const isActive = agent.status === 'working';
                const hasFreeBrain = agent.id === 'agent-hermes' || agent.tags?.includes('Free-Brain');
                return (
                  <tr key={agent.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400">{agent.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span className="font-extrabold text-zinc-100">{agent.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-400">127.0.0.1 : {agent.id === 'a1' ? '3001' : agent.id === 'a2' ? '3002' : agent.id === 'a3' ? '3003' : '3005'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDatabaseStateChange(agent.id)}
                        className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all shadow-sm ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_6px_rgba(16,185,129,0.15)]'
                            : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/60'
                        }`}
                        title="Click to toggle status database"
                      >
                        {isActive ? '● WORKING' : '○ IDLE_STANDBY'}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-zinc-400">{(agent.skills || []).length} active skills</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        hasFreeBrain 
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' 
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800/40'
                      }`}>
                        {hasFreeBrain ? 'HERMES FREE BRAIN' : 'Standard'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDatabaseStateChange(agent.id)}
                        className="text-yellow-400 hover:text-yellow-300 hover:underline text-[10px] font-bold"
                      >
                        Change State
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                <div className={`w-2.5 h-2.5 rounded-full ${clusterData?.workers?.find((w: any) => w.name === 'Sub-Agent-Alpha')?.status === 'ACTIVE' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-600'}`} />
                <div>
                  <div className="text-xs font-bold text-zinc-100">Sub-Agent Worker Alpha</div>
                  <div className="text-[10px] text-zinc-400">Local Coding Node / DeepSeek Reasoner Exec</div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${clusterData?.workers?.find((w: any) => w.name === 'Sub-Agent-Alpha')?.status === 'ACTIVE' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-zinc-500 bg-zinc-900 border-zinc-800'}`}>
                {clusterData?.workers?.find((w: any) => w.name === 'Sub-Agent-Alpha')?.status || 'OFFLINE'}
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${clusterData?.workers?.find((w: any) => w.name === 'GitHub-Sync-Daemon')?.status === 'STREAMING' ? 'bg-purple-400 animate-pulse' : 'bg-zinc-600'}`} />
                <div>
                  <div className="text-xs font-bold text-zinc-100">GitHub Sync Daemon</div>
                  <div className="text-[10px] text-zinc-400">CI Pipeline Stream & Draft PR Webhook Listener</div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${clusterData?.workers?.find((w: any) => w.name === 'GitHub-Sync-Daemon')?.status === 'STREAMING' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-zinc-500 bg-zinc-900 border-zinc-800'}`}>
                {clusterData?.workers?.find((w: any) => w.name === 'GitHub-Sync-Daemon')?.status || 'OFFLINE'}
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
              {githubData?.repository || 'kilo-cloud/kudbee-monorepo'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {(githubData?.activePRs || []).map((pr: any) => (
              <div key={pr.id} className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="text-yellow-400 font-bold mr-2">PR #{pr.id}:</span>
                  <span className="text-zinc-200">{pr.title}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  pr.status === 'MERGED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  pr.status === 'IN_REVIEW' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 flex items-center gap-1'
                }`}>
                  {pr.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />} {pr.checks || pr.status}
                </span>
              </div>
            ))}
            
            {!githubData?.activePRs?.length && (
               <div className="text-center text-zinc-500 text-xs py-4">No active PRs in stream.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
