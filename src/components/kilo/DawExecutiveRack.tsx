import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Activity, 
  Volume2, 
  VolumeX, 
  Radio, 
  Zap, 
  Brain, 
  Bot, 
  Play, 
  Square, 
  RotateCcw, 
  Disc, 
  Cpu, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  Gauge,
  Sparkles,
  RefreshCw,
  Database,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Plug,
  Server,
  ArrowRightLeft,
  X,
  Plus,
  Minus,
  Settings,
  Terminal,
  Cpu as CpuIcon
} from 'lucide-react';
import { Agent, Convoy, TelemetryLog } from '../../types';
import { useKilo } from '../../context/KiloContext';

interface DawExecutiveRackProps {
  agents: Agent[];
  convoys: Convoy[];
  liveFeed: TelemetryLog[];
  onOpenSpinUpModal: () => void;
  onOpenGrokTerminal: () => void;
  onSelectAgent: (agent: Agent) => void;
  onRunTestTask: (agentName: string, prompt: string, model: string) => Promise<any>;
}

// 1. Tactile Rotary Dial Component (replaces generic slider inputs)
interface RotaryDialProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  colorClass?: string;
  glowColor?: string;
  onChange: (val: number) => void;
}

const RotaryDial: React.FC<RotaryDialProps> = ({
  label,
  value,
  min,
  max,
  unit,
  colorClass = "text-yellow-400",
  glowColor = "rgba(234, 179, 8, 0.2)",
  onChange
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  // SVG arc variables
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleIncrement = () => {
    if (value < max) onChange(Math.min(max, value + 1));
  };

  const handleDecrement = () => {
    if (value > min) onChange(Math.max(min, value - 1));
  };

  return (
    <div className="flex flex-col items-center bg-[#0d1117] border border-zinc-850 p-3 rounded-xl shadow-inner select-none w-28 shrink-0">
      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-2 text-center h-6 flex items-center justify-center">
        {label}
      </span>

      {/* Interactive Knob Display */}
      <div className="relative w-16 h-16 flex items-center justify-center cursor-pointer group">
        <svg className="w-16 h-16 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="3.5"
            fill="transparent"
          />
          {/* Active indicator arc */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            className={`transition-all duration-300 ${colorClass}`}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />
        </svg>

        {/* Center digital read-out */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-0.5">
          <span className="text-xs font-black text-zinc-100 font-mono tracking-tighter">
            {value}
          </span>
          <span className="text-[7px] text-zinc-500 font-extrabold uppercase -mt-0.5">
            {unit}
          </span>
        </div>
      </div>

      {/* Stepper controls */}
      <div className="flex items-center gap-1.5 mt-2.5 w-full">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex-1 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 active:scale-95 transition-all text-center flex justify-center items-center"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          onClick={handleIncrement}
          className="flex-1 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 active:scale-95 transition-all text-center flex justify-center items-center"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

// 2. Individual Universal Modular Rack Plugin Definition
interface RackPlugin {
  id: string;
  name: string;
  type: 'synth' | 'gain' | 'cognitive' | 'db-patch' | 'telemetry';
  inputPort: string;
  outputPort: string;
  status: 'ONLINE' | 'STANDBY' | 'ERROR' | 'BYPASSED';
  errorCode?: string;
  parameters: {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    color: string;
    glow: string;
  }[];
  logs: string[];
}

export const DawExecutiveRack: React.FC<DawExecutiveRackProps> = ({
  agents,
  convoys,
  liveFeed,
  onOpenSpinUpModal,
  onOpenGrokTerminal,
  onSelectAgent,
  onRunTestTask
}) => {
  // Pull think token state and models directly from centralized KiloContext
  const { 
    totalReasoningTokens, 
    handleMintThinkTokens, 
    activeModel, 
    setActiveModel,
    beads,
    handleUpdateBeadStatus
  } = useKilo();

  // DAW Global states
  const [isPlaying, setIsPlaying] = useState(true);
  const [timecode, setTimecode] = useState('01:24:45:12');
  const [tempo, setTempo] = useState(128);
  const [masterVolume, setMasterVolume] = useState(85);

  // Monitor mode (Simulation vs Real Cloud Agent Streaming)
  const [monitorMode, setMonitorMode] = useState<'simulation' | 'cloud'>('simulation');

  // Rack Modules State (highly wrapped, hot-swappable plug-in data model)
  const [plugins, setPlugins] = useState<RackPlugin[]>([
    {
      id: 'kudbee-tempo-clock',
      name: 'KUDBEE TEMPO CLOCK',
      type: 'synth',
      inputPort: 'CLOCK_BUS_IN (128bpm)',
      outputPort: 'VITE_AGENT_SYNC_OUT',
      status: 'ONLINE',
      parameters: [
        { label: 'Clock BPM', value: 128, min: 60, max: 180, unit: 'BPM', color: 'stroke-yellow-400', glow: 'rgba(234, 179, 8, 0.2)' },
        { label: 'Jitter Dev', value: 2, min: 0, max: 15, unit: 'ms', color: 'stroke-cyan-400', glow: 'rgba(34, 211, 238, 0.2)' }
      ],
      logs: [
        'INIT: Synchronizing system clock locks...',
        'SYS: Phase-locked loop matching master standard 128.00Hz',
        'LOG: Low-latency sync buffer initialized (0 dropped frames)'
      ]
    },
    {
      id: 'master-gain',
      name: 'KUDBEE MASTER GAIN',
      type: 'gain',
      inputPort: 'AGENT_THREAD_BUS',
      outputPort: 'AUDIO_OUTPUT_STAGE',
      status: 'ONLINE',
      parameters: [
        { label: 'Master Gain', value: 85, min: 0, max: 100, unit: '%', color: 'stroke-emerald-400', glow: 'rgba(52, 211, 153, 0.2)' },
        { label: 'Compression', value: 30, min: 0, max: 100, unit: 'dB', color: 'stroke-amber-400', glow: 'rgba(251, 191, 36, 0.2)' }
      ],
      logs: [
        'INIT: Audio channel buffers mapped',
        'SYS: Automatic Level Control enabled',
        'LOG: Signal headroom stabilized at +3.2dB'
      ]
    },
    {
      id: 'cognitive-vault-core',
      name: 'COGNITIVE MEMORY CORE',
      type: 'cognitive',
      inputPort: 'MEMORY_VAULT_SHARDS',
      outputPort: 'AGENT_REASONING_BUS',
      status: 'ONLINE',
      parameters: [
        { label: 'Token Alloc', value: 25000, min: 1000, max: 100000, unit: 'TKN', color: 'stroke-purple-400', glow: 'rgba(192, 132, 252, 0.2)' },
        { label: 'Vector Depth', value: 42, min: 5, max: 100, unit: 'CLS', color: 'stroke-teal-400', glow: 'rgba(45, 212, 191, 0.2)' }
      ],
      logs: [
        'INIT: Binding MemoryVault vectors...',
        'SYS: 21 seeded memory clusters verified',
        'LOG: Semantic recall confidence threshold: 0.85'
      ]
    },
    {
      id: 'redis-resilience-bridge',
      name: 'REDIS RESILIENCE BRIDGE',
      type: 'db-patch',
      inputPort: 'UPSTASH_CLUSTERS',
      outputPort: 'LOCAL_QUEUE_FALLBACK',
      status: 'ONLINE',
      parameters: [
        { label: 'Backoff Exp', value: 4, min: 1, max: 30, unit: 'sec', color: 'stroke-red-400', glow: 'rgba(248, 113, 113, 0.2)' },
        { label: 'Window Safe', value: 15, min: 5, max: 60, unit: 'sec', color: 'stroke-fuchsia-400', glow: 'rgba(232, 121, 249, 0.2)' }
      ],
      logs: [
        'INIT: Connected rediss://upstash-free-cluster',
        'SYS: Sliding window frequency limiter active (100 req/min)',
        'LOG: In-memory queue backup standby loaded'
      ]
    }
  ]);

  // 10 Active Work Orders Executive Board State (Live Data)
  const workOrders = beads.slice(0, 10);

  const handleExecuteWorkOrder = async (woId: string, title: string) => {
    try {
      setQuickPayload(`Executing Work Order [${woId}]: ${title} via Flash Light Model (gemini-3.6-flash)`);
      if (handleMintThinkTokens) {
        await handleMintThinkTokens(2000, `Flash Model execution of ${woId}`, undefined, 'KudbeeRouter');
      }
      await onRunTestTask('Toast', `Execute work order ${woId}: ${title}`, 'gemini-3.6-flash');
      handleUpdateBeadStatus(woId, 'closed');
    } catch (err) {
      console.warn(err);
    }
  };
  const [quickPayload, setQuickPayload] = useState('Verify MemoryVault semantic recall drift across dynamic nodes');
  const [isRouting, setIsRouting] = useState(false);
  const [routeLogs, setRouteLogs] = useState<string[]>([]);

  // Simulation parameters for dynamic active simulation feeds
  const [simulatedMetricPackets, setSimulatedMetricPackets] = useState<string[]>([
    '[*SIMULATION ACTIVE*] [01:24:45] Thread-14 spawned: Ingesting telemetry data stream...',
    '[*SIMULATION ACTIVE*] [01:24:47] Redis sliding-window check: Pass (0/100 limit used)',
    '[*SIMULATION ACTIVE*] [01:24:48] MemoryVault Cosine Similarity recall check: 0.96 accuracy',
    '[*SIMULATION ACTIVE*] [01:24:50] Thread-14 successfully terminated. Allocated 8.5k Think-Tokens'
  ]);

  // Rotate character 'K' helper
  const [spinPhase, setSpinPhase] = useState(0);
  const spinFrames = ['/', '—', '\\', '|'];

  // Handle VU meters pulsing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSpinPhase(p => (p + 1) % 4);
      // Append a random simulation log occasionally if in simulation mode
      if (monitorMode === 'simulation' && Math.random() > 0.6) {
        const timeStr = new Date().toLocaleTimeString();
        const randActions = [
          `Thread-${Math.floor(Math.random() * 90) + 10} spawned: analyzing AST compiler tree...`,
          `Upstash connection check: ping ${Math.floor(Math.random() * 15) + 3}ms. Nominal.`,
          `MemoryVault index verified: 21 seeds fully locked.`,
          `Think-Tokens balanced check: available pool safe.`
        ];
        const newSimMsg = `[*SIMULATION ACTIVE*] [${timeStr}] ${randActions[Math.floor(Math.random() * randActions.length)]}`;
        setSimulatedMetricPackets(prev => [newSimMsg, ...prev].slice(0, 15));
      }
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying, monitorMode]);

  // Master Clock timecode ticks
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const frames = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      setTimecode(`${hrs}:${mins}:${secs}:${frames}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Mutator for single plug-in parameter
  const handlePluginParameterChange = (pluginId: string, paramIndex: number, newValue: number) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const updatedParams = [...p.parameters];
        updatedParams[paramIndex] = { ...updatedParams[paramIndex], value: newValue };
        
        // Push a log indicating parameter modification
        const updatedLogs = [
          `PARAM: Modified [${updatedParams[paramIndex].label}] to ${newValue} ${updatedParams[paramIndex].unit}`,
          ...p.logs
        ].slice(0, 10);

        // Sync local states to DAW global values for relevant panels
        if (pluginId === 'kudbee-tempo-clock' && paramIndex === 0) setTempo(newValue);
        if (pluginId === 'master-gain' && paramIndex === 0) setMasterVolume(newValue);

        return {
          ...p,
          parameters: updatedParams,
          logs: updatedLogs
        };
      }
      return p;
    }));
  };

  // Trigger error simulation on a plugin (demonstrates Error Handling fallback)
  const handleTriggerPluginError = (pluginId: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const errCodes = ['ERR_UPSTASH_REQUEST_CAP', 'ERR_COMPILER_AST_STALLED', 'ERR_MEMORY_RECALL_EMPTY', 'ERR_RESONANCE_SATURATION_CRITICAL'];
        const chosenErr = errCodes[Math.floor(Math.random() * errCodes.length)];
        return {
          ...p,
          status: 'ERROR',
          errorCode: chosenErr,
          logs: [
            `🚨 CRITICAL ERROR: [${chosenErr}] thrown inside isolated container thread!`,
            'SYS: Intercepting failure via Plugin Fail-Open Guard...',
            'SYS: Bypassing unit signal flow to prevent full rack crash.',
            ...p.logs
          ].slice(0, 10)
        };
      }
      return p;
    }));
  };

  // Reboot / Heal an errored plug-in module
  const handleRebootPlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        return {
          ...p,
          status: 'ONLINE',
          errorCode: undefined,
          logs: [
            '⚡ COLD-REBOOT INITIATED...',
            'SYS: Re-allocating thread namespaces...',
            'SYS: Initializing clean container state. ONLINE status recovered.',
            ...p.logs
          ].slice(0, 10)
        };
      }
      return p;
    }));
  };

  // Toggle Bypass state
  const handleToggleBypass = (pluginId: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === pluginId) {
        const isBypassing = p.status !== 'BYPASSED';
        return {
          ...p,
          status: isBypassing ? 'BYPASSED' : 'ONLINE',
          logs: [
            `SYS: Plug-in ${isBypassing ? 'BYPASSED' : 'RE-ACTIVATED'} by operator command.`,
            ...p.logs
          ].slice(0, 10)
        };
      }
      return p;
    }));
  };

  // Inject dynamic Think-Tokens to MemoryCore to simulate boost
  const handleBoostThinkTokens = async () => {
    const mintAmount = 15000;
    try {
      if (handleMintThinkTokens) {
        await handleMintThinkTokens(mintAmount, 'Kudbee Rack Tuning Boost', undefined, 'KudbeeRouter');
        
        // Append log to cognitive vault core
        setPlugins(prev => prev.map(p => {
          if (p.id === 'cognitive-vault-core') {
            return {
              ...p,
              logs: [
                `🧠 COGNITIVE BOOST: Injected +${mintAmount.toLocaleString()} active reasoning Think-Tokens!`,
                `SYS: Recalibrating MemoryVault confidence weight (0.85 -> 0.98)`,
                ...p.logs
              ].slice(0, 10)
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Dispatch payloads using specific selected rack unit channels
  const handlePayloadDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayload.trim()) return;
    setIsRouting(true);
    setRouteLogs([`[01:24:45] INGEST: Initialized payload bus on active rack...`]);

    try {
      // Allocate 5000 tokens for routing
      if (handleMintThinkTokens) {
        await handleMintThinkTokens(5000, `Dispatching Rack Payload: "${quickPayload.substring(0, 30)}"`, undefined, 'KudbeeRouter');
      }

      setRouteLogs(prev => [...prev, `[01:24:46] RESOLVE: Allocated 5,000 reasoning Think-Tokens for execution`]);
      setRouteLogs(prev => [...prev, `[01:24:47] QUERY: Scanning active MemoryVault database coordinates...`]);

      const res = await onRunTestTask('Toast', quickPayload, activeModel || 'gemini-2.5-pro');
      
      setRouteLogs(prev => [
        ...prev,
        `[01:24:48] PIPELINE: Live agent responded via ${activeModel || 'gemini-2.5-pro'}!`,
        `[01:24:49] OUT: ${res.response || 'Success'}`
      ]);
    } catch (err: any) {
      setRouteLogs(prev => [...prev, `🚨 ROUTE ERROR: ${err.message || 'Execution failed.'}`]);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-24 font-mono select-none px-2 sm:px-4">
      
      {/* FLASH LIGHT MODEL RACK BANNER (GEMINI 3.6 FLASH) */}
      <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-bl-xl shadow-md">
          ⚡ FLASH LIGHT MODEL ACTIVE
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner shrink-0 relative animate-pulse">
            <Zap className="w-6 h-6 text-amber-400 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-amber-300 tracking-wider uppercase">
                Gemini 3.6 Flash (Light Speed Engine)
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-black border border-amber-400/40">
                12ms Latency
              </span>
            </div>
            <p className="text-[10px] text-zinc-300 font-mono mt-0.5">
              Optimized low-latency inference engine powering real-time telemetry streaming and 10 active work orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="bg-black/60 border border-amber-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[8px] text-zinc-400 block uppercase font-bold">Inference Speed</span>
            <span className="text-xs font-black text-amber-400">450 TKN/sec</span>
          </div>
          <button
            onClick={() => {
              setActiveModel('gemini-3.6-flash');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Lock Flash Engine
          </button>
        </div>
      </div>

      {/* 1. MASTER DAW CONSOLE STATUS & DEPLOYMENT MONITOR DECK */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest border-l border-b border-zinc-800">
          SYSTEM CLOCK LOCK
        </div>

        {/* Brand Header */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1b2536] to-zinc-900 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-inner shrink-0 relative">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-yellow-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-950 rounded-full border border-zinc-800 flex items-center justify-center text-[8px] font-black text-emerald-400">
                {spinFrames[spinPhase]}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-base font-extrabold text-zinc-100 tracking-wider uppercase">
                  KUDBEE DAW EXECUTIVE RACK
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black">
                  ACTIVE DEPLOYMENT
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Plug-n-Play Modular Container Interface • Error Guard Protected
              </p>
            </div>
          </div>

          {/* Transport deck */}
          <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 p-1.5 rounded-xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title={isPlaying ? 'Pause Console Ticks' : 'Start Console Ticks'}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button 
              onClick={() => {
                setTimecode('01:00:00:00');
                setSimulatedMetricPackets([`[*SIMULATION ACTIVE*] [${new Date().toLocaleTimeString()}] Reset system transport clocks.`]);
              }}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
              title="Reset Clocks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="h-5 w-px bg-zinc-800 mx-1" />
            <div className="px-2.5 py-1 bg-black/80 rounded-lg border border-zinc-850 text-[10px] font-bold text-yellow-400 tracking-widest shadow-inner">
              {timecode}
            </div>
          </div>
        </div>

        {/* Central calibration parameter block */}
        <div className="flex flex-wrap items-center gap-4 bg-zinc-950/70 border border-zinc-850 p-2.5 rounded-xl w-full lg:w-auto justify-around">
          {/* Active Model Indicator */}
          <div className="flex flex-col items-start px-2">
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
              DEPLOYED ACTIVE ENGINE
            </span>
            <div className="flex items-center gap-1.5">
              <CpuIcon className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-100 uppercase">
                {activeModel || 'gemini-2.5-pro'}
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-zinc-800" />

          {/* Connected Think-Tokens balance */}
          <div className="flex flex-col items-start px-2">
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
              CONNECTED REASONING BALANCE
            </span>
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-xs font-black text-purple-400 tracking-tight">
                {totalReasoningTokens.toLocaleString()} <span className="text-[9px] text-zinc-500">TKN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={onOpenGrokTerminal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-yellow-400 text-xs font-bold border border-yellow-500/20 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Trace Node</span>
          </button>
          <button
            onClick={onOpenSpinUpModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-black text-xs transition-all shadow-lg active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-bounce" />
            <span>Spin Up Agent</span>
          </button>
        </div>
      </div>

      {/* 2. UNIVERSAL RACKMOUNT MODULAR PLUGIN SYSTEM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-yellow-400" />
            <h2 className="text-xs font-black text-zinc-300 uppercase tracking-wider">
              KUDBEE MODULAR SYSTEM RACK UNITS (HOT-SWAPPABLE PLUG-INS)
            </h2>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {plugins.length} slots registered • Error-Isolation Shield Enabled
          </span>
        </div>

        {/* Dynamic Plug-ins Grid / Rows */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {plugins.map((plugin) => {
            const hasError = plugin.status === 'ERROR';
            const isBypassed = plugin.status === 'BYPASSED';

            return (
              <div 
                key={plugin.id} 
                className={`relative bg-[#111520] border-2 rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-300 ${
                  hasError 
                    ? 'border-red-500/60 shadow-[0_0_24px_rgba(239,68,68,0.15)] bg-red-950/5' 
                    : isBypassed 
                    ? 'border-zinc-800 opacity-60' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 shadow-xl'
                }`}
              >
                {/* Rack mount steel ears */}
                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2.5 h-8 bg-zinc-800 rounded-r border-r border-zinc-700 flex flex-col justify-between p-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-600" />
                </div>
                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2.5 h-8 bg-zinc-800 rounded-l border-l border-zinc-700 flex flex-col justify-between p-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-600" />
                </div>

                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 mb-4 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Plug className={`w-4 h-4 ${hasError ? 'text-red-400' : isBypassed ? 'text-zinc-600' : 'text-yellow-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-100 tracking-wider">
                          {plugin.name}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          ID: {plugin.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] text-zinc-500 font-mono mt-0.5">
                        <span className="text-yellow-500/80">IN:</span>
                        <span className="text-zinc-400 font-bold truncate max-w-[120px]">{plugin.inputPort}</span>
                        <span className="text-emerald-500/80">OUT:</span>
                        <span className="text-zinc-400 font-bold truncate max-w-[120px]">{plugin.outputPort}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions and Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Badge */}
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border flex items-center gap-1 ${
                      hasError 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : isBypassed 
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${hasError ? 'bg-red-500 animate-ping' : isBypassed ? 'bg-zinc-500' : 'bg-emerald-400 animate-pulse'}`} />
                      {plugin.status}
                    </div>

                    {/* Operational overrides */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleBypass(plugin.id)}
                        className={`px-1.5 py-1 rounded text-[8px] font-bold border transition-colors ${
                          isBypassed 
                            ? 'bg-yellow-500 text-zinc-950 border-yellow-500' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100'
                        }`}
                        title="Bypass Signal Flow"
                      >
                        BYPASS
                      </button>
                      
                      {!hasError ? (
                        <button
                          onClick={() => handleTriggerPluginError(plugin.id)}
                          className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-red-950 hover:text-red-400 text-zinc-500 border border-zinc-800 text-[8px] font-bold"
                          title="Simulate Error Crash"
                        >
                          FAIL
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRebootPlugin(plugin.id)}
                          className="px-1.5 py-1 rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-[8px] font-black animate-pulse flex items-center gap-1"
                          title="Reboot Container Instance"
                        >
                          <RefreshCw className="w-2 h-2 animate-spin" /> REBOOT
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Body (Split into Left: Parameters, Right: Live Diagnostic Monitor) */}
                {hasError ? (
                  /* CRASHED FALLBACK TERMINAL VIEW */
                  <div className="flex-1 bg-red-950/10 border border-red-900/40 rounded-xl p-4 flex flex-col justify-between space-y-3 font-mono text-[10px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                        <span>CONTAINER SEGFAULT OVERRIDE TRIGGERED [BYPASS ACTIVE]</span>
                      </div>
                      <p className="text-zinc-400 text-[9px] leading-relaxed">
                        The plug-and-play module <span className="text-zinc-200 underline">{plugin.name}</span> has thrown error code <span className="text-red-400 font-extrabold">{plugin.errorCode}</span>.
                        The fail-open routing framework bypassed this node's data pipeline to protect adjacent processes.
                      </p>
                    </div>

                    <div className="bg-black/40 border border-red-900/30 p-2.5 rounded font-mono text-[8px] text-red-300 overflow-y-auto max-h-24 custom-scrollbar">
                      <div>&gt; STACK_TRACE: processUnhandledException() at module.ts:42</div>
                      <div>&gt; ERROR_DETAILS: Upstash redis / Ingestion rate limiter check: failed to complete.</div>
                      <div>&gt; FAIL_OPEN: Staging in-memory sliding-window backup: OK.</div>
                      <div>&gt; ALERT: Escalated to Mayor Orchestrator; ready for hot-swap.</div>
                    </div>

                    <button
                      onClick={() => handleRebootPlugin(plugin.id)}
                      className="w-full py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:from-red-500 hover:to-red-400 rounded-lg text-xs text-center transition-all flex items-center justify-center gap-2 active:scale-95 border border-red-400/20 shadow-lg shadow-red-600/15"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cold-Reboot Unit Container & Sync State</span>
                    </button>
                  </div>
                ) : (
                  /* NORMAL FUNCTIONAL PLUG-IN CONTROLS */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                    
                    {/* Parameters Group (Dials / Steppers replacing old horizontal range inputs) */}
                    <div className="md:col-span-6 flex flex-wrap gap-3 justify-center md:justify-start items-center">
                      {plugin.parameters.map((param, pIdx) => (
                        <RotaryDial
                          key={pIdx}
                          label={param.label}
                          value={param.value}
                          min={param.min}
                          max={param.max}
                          unit={param.unit}
                          colorClass={param.color}
                          glowColor={param.glow}
                          onChange={(val) => handlePluginParameterChange(plugin.id, pIdx, val)}
                        />
                      ))}

                      {/* Specialized Action Buttons inside parameters block */}
                      {plugin.id === 'cognitive-vault-core' && (
                        <div className="flex flex-col items-stretch justify-center h-full p-2 bg-purple-500/5 rounded-xl border border-purple-500/15 text-center gap-1.5 w-28">
                          <span className="text-[7px] text-purple-400 font-extrabold tracking-widest uppercase">
                            Memory Boost
                          </span>
                          <button
                            type="button"
                            onClick={handleBoostThinkTokens}
                            className="py-1 px-2 rounded bg-purple-600 text-zinc-100 hover:bg-purple-500 active:scale-95 transition-all text-[8px] font-black flex items-center justify-center gap-1"
                          >
                            <Brain className="w-2.5 h-2.5" />
                            <span>INJECT +15k</span>
                          </button>
                          <span className="text-[6px] text-zinc-500">
                            Allocate direct reasoning context
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Integrated Live Monitor Log Terminal */}
                    <div className="md:col-span-6 flex flex-col justify-between bg-zinc-950/80 border border-zinc-850 p-2.5 rounded-xl text-[9px] font-mono shadow-inner h-32 md:h-full">
                      <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-900 pb-1 mb-1.5 uppercase font-bold text-[8px]">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Terminal className="w-3 h-3 text-yellow-500/80" />
                          Diagnostic Monitor Logs
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                          Locked
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 text-zinc-300 pr-1 select-text">
                        {plugin.logs.map((log, lIdx) => (
                          <div key={lIdx} className="leading-normal">
                            <span className="text-zinc-600 mr-1.5">&gt;</span>
                            {log}
                          </div>
                        ))}
                      </div>

                      <div className="text-zinc-600 pt-1 border-t border-zinc-900/60 flex items-center justify-between text-[7px] font-bold">
                        <span>PORT BUFFER SECURE</span>
                        <span>0% THREAD DRIFT</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 10 ACTIVE WORK ORDERS EXECUTIVE BOARD (FLASH LIGHT MODEL POWERED) */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-zinc-100 uppercase tracking-wider">
                Active 10 Work Orders Executive Board
              </h3>
              <p className="text-[10px] text-zinc-400">
                Powered by Gemini 3.6 Flash (Light Speed Model). Click any work order to execute instantly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black">
              {workOrders.filter(w => w.status !== 'closed').length} PENDING / {workOrders.length} TOTAL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {workOrders.map((wo) => {
            const isClosed = wo.status === 'closed';
            const isWorking = wo.status === 'in_progress';
            return (
              <div 
                key={wo.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isClosed 
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-60' 
                    : isWorking 
                    ? 'bg-amber-500/5 border-amber-500/40 shadow-md' 
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-amber-400 font-mono">
                      {wo.id}
                    </span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      wo.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      wo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {wo.priority}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-zinc-200 line-clamp-2 mb-2">
                    {wo.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between mt-2">
                  <span className="text-[9px] text-zinc-500 font-bold">
                    {wo.assignee || 'Unassigned'}
                  </span>
                  
                  {isClosed ? (
                    <span className="text-[9px] text-emerald-400 font-black">✓ DONE</span>
                  ) : (
                    <button
                      onClick={() => handleExecuteWorkOrder(wo.id, wo.title)}
                      className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[9px] font-black transition-all shadow active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>Flash Run</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MULTI-MODE MONITORS: LIVE AGENTS VS SIMULATED TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: MASTER PAYLOAD DISPATCH (SLOT 4) */}
        <div className="lg:col-span-7 bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-yellow-400 fill-current" />
                <h3 className="text-xs font-black text-zinc-200 uppercase tracking-wider">
                  4. Master Payload Dispatcher
                </h3>
              </div>
              <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                Direct Bus Route
              </span>
            </div>

            <form onSubmit={handlePayloadDispatch} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={quickPayload}
                  onChange={(e) => setQuickPayload(e.target.value)}
                  placeholder="Enter custom task payload for direct model bus execution..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 font-mono shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isRouting}
                  className="flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shrink-0 shadow-lg shadow-yellow-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isRouting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Dispatch Payload</span>
                </button>
              </div>

              {routeLogs.length > 0 && (
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-[10px] font-mono text-zinc-200 max-h-40 overflow-y-auto custom-scrollbar shadow-inner space-y-1 select-text">
                  <div className="text-[8px] text-yellow-400 font-black mb-1.5 uppercase tracking-wider flex items-center justify-between border-b border-zinc-900 pb-1">
                    <span>Route Execution Result logs</span>
                    <button type="button" onClick={() => setRouteLogs([])} className="text-zinc-500 hover:text-zinc-300">
                      Clear Logs
                    </button>
                  </div>
                  {routeLogs.map((log, rIdx) => (
                    <div key={rIdx}>{log}</div>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="border-t border-zinc-850 pt-3 mt-4 text-[9px] text-zinc-500 flex items-center justify-between">
            <span>Zero-Latency Execution Bus</span>
            <span className="text-yellow-400 font-bold">READY</span>
          </div>
        </div>

        {/* RIGHT: DUAL-MODE TELEMETRY SPECTRUM STREAM MONITOR */}
        <div className="lg:col-span-5 bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-zinc-200 uppercase tracking-wider">
                  5. Telemetry Spectrum Stream
                </h3>
              </div>
              
              {/* Dual-mode monitor switch */}
              <div className="flex items-center bg-zinc-950 border border-zinc-850 p-0.5 rounded-lg text-[8px] font-bold">
                <button
                  type="button"
                  onClick={() => setMonitorMode('simulation')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    monitorMode === 'simulation' 
                      ? 'bg-yellow-500 text-zinc-950 font-black' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  *SIM*
                </button>
                <button
                  type="button"
                  onClick={() => setMonitorMode('cloud')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    monitorMode === 'cloud' 
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  *CLOUD*
                </button>
              </div>
            </div>

            {/* Active streaming block */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1 select-text">
              {monitorMode === 'simulation' ? (
                /* SIMULATED AGENT THREAD FEED */
                simulatedMetricPackets.map((msg, idx) => (
                  <div key={idx} className="p-2.5 bg-zinc-950/80 border border-zinc-850 rounded-xl text-[9px] font-mono space-y-0.5 shadow-inner">
                    <div className="flex items-center justify-between text-zinc-500 text-[7px] font-bold">
                      <span className="text-yellow-500/80 uppercase font-black tracking-widest">*SIMULATED AGENT THREAD*</span>
                      <span>ACTIVE</span>
                    </div>
                    <p className="text-zinc-300 leading-normal">{msg}</p>
                  </div>
                ))
              ) : (
                /* LIVE SERVER STREAMING MONITORS */
                liveFeed.length > 0 ? (
                  liveFeed.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-zinc-950/80 border border-emerald-900/25 rounded-xl text-[9px] font-mono space-y-0.5 shadow-inner">
                      <div className="flex items-center justify-between text-zinc-500 text-[7px] font-bold">
                        <span className="text-emerald-400 uppercase font-black tracking-widest">*CLOUD LIVE AGENT FEED*</span>
                        <span>{item.time || 'JUST NOW'}</span>
                      </div>
                      <p className="text-emerald-300 leading-normal font-bold">
                        [{item.source || 'CONTAINER_DYN1'}]: {item.msg || item.event}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-850 rounded-xl bg-zinc-950/50 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                    <span className="font-bold text-[9px] text-zinc-400">CONNECTING TO PRODUCTION STREAM PORT...</span>
                    <span className="text-[8px] text-zinc-600">Awaiting actual telemetry packet stream from backend</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="border-t border-zinc-850 pt-3 mt-4 text-[9px] text-zinc-500 flex items-center justify-between">
            <span>WebSocket / SSE Streaming Status:</span>
            <span className={monitorMode === 'cloud' ? "text-emerald-400 font-extrabold animate-pulse" : "text-yellow-400 font-extrabold"}>
              {monitorMode === 'cloud' ? 'CONNECTED (PORT 3000)' : 'SIMULATION MODE'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
