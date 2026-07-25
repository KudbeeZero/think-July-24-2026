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
  ArrowRightLeft
} from 'lucide-react';
import { Agent, Convoy, TelemetryLog } from '../../types';

interface DawExecutiveRackProps {
  agents: Agent[];
  convoys: Convoy[];
  liveFeed: TelemetryLog[];
  onOpenSpinUpModal: () => void;
  onOpenGrokTerminal: () => void;
  onSelectAgent: (agent: Agent) => void;
  onRunTestTask: (agentName: string, prompt: string, model: string) => Promise<any>;
}

interface TrackChannel {
  id: string;
  name: string;
  type: 'agent' | 'model' | 'redis' | 'memory';
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  gain: number;
  pan: number;
  temperature: number;
  reasoningBudget: number;
  status: 'active' | 'bypassed' | 'clipped';
  vuLevel: number;
}

interface QueueItem {
  id: string;
  title: string;
  sourceTrack: string;
  status: 'queued' | 'processing' | 'verified' | 'failed';
  tokens: number;
  timestamp: string;
}

interface DBConnectorPlugin {
  id: string;
  name: string;
  type: 'postgres' | 'redis' | 'sqlite' | 'neon';
  status: 'connected' | 'syncing' | 'offline';
  latencyMs: number;
  endpoint: string;
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
  // DAW Transport States
  const [isPlaying, setIsPlaying] = useState(true);
  const [tempo, setTempo] = useState(128);
  const [masterVolume, setMasterVolume] = useState(85);
  const [timecode, setTimecode] = useState('01:24:45:12');

  // Track Channels State (3x3 / 3x4 modular rack strips)
  const [tracks, setTracks] = useState<TrackChannel[]>([
    {
      id: 'track-01',
      name: 'DeepSeek R1 Reasoner',
      type: 'model',
      muted: false,
      soloed: false,
      armed: true,
      gain: 90,
      pan: 0,
      temperature: 0.6,
      reasoningBudget: 8192,
      status: 'active',
      vuLevel: 78
    },
    {
      id: 'track-02',
      name: 'Grok-3 Fast Router',
      type: 'model',
      muted: false,
      soloed: false,
      armed: true,
      gain: 85,
      pan: -10,
      temperature: 0.4,
      reasoningBudget: 4096,
      status: 'active',
      vuLevel: 64
    },
    {
      id: 'track-03',
      name: 'Redis Stream Bus',
      type: 'redis',
      muted: false,
      soloed: false,
      armed: true,
      gain: 95,
      pan: 0,
      temperature: 0.2,
      reasoningBudget: 2048,
      status: 'active',
      vuLevel: 92
    },
    {
      id: 'track-04',
      name: 'Vector Memory Shards',
      type: 'memory',
      muted: false,
      soloed: false,
      armed: false,
      gain: 70,
      pan: 15,
      temperature: 0.1,
      reasoningBudget: 1024,
      status: 'active',
      vuLevel: 45
    },
    {
      id: 'track-05',
      name: 'Agent Worker [Toast]',
      type: 'agent',
      muted: false,
      soloed: false,
      armed: true,
      gain: 88,
      pan: -5,
      temperature: 0.7,
      reasoningBudget: 8192,
      status: 'active',
      vuLevel: 83
    },
    {
      id: 'track-06',
      name: 'Agent Worker [refinery]',
      type: 'agent',
      muted: false,
      soloed: false,
      armed: true,
      gain: 92,
      pan: 10,
      temperature: 0.5,
      reasoningBudget: 16384,
      status: 'active',
      vuLevel: 89
    }
  ]);

  const [selectedTrackId, setSelectedTrackId] = useState<string>('track-01');

  // Plug-in Notification Awaiting Queue
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    { id: 'q-101', title: 'Verify token delta checksum across model nodes', sourceTrack: 'DeepSeek R1 Reasoner', status: 'processing', tokens: 1240, timestamp: '12:44:02' },
    { id: 'q-102', title: 'Sync Redis ring-buffer shards to Neon DB', sourceTrack: 'Redis Stream Bus', status: 'queued', tokens: 850, timestamp: '12:44:05' },
    { id: 'q-103', title: 'Run safety guardrail filter on user prompt stream', sourceTrack: 'Agent Worker [Toast]', status: 'verified', tokens: 410, timestamp: '12:43:50' }
  ]);

  // Plug-in Database In/Out Connectors
  const [dbConnectors, setDbConnectors] = useState<DBConnectorPlugin[]>([
    { id: 'db-1', name: 'Neon Postgres Core', type: 'postgres', status: 'connected', latencyMs: 14, endpoint: 'postgres://core.neon.tech:5432/kudbee' },
    { id: 'db-2', name: 'Upstash Redis Ingestion', type: 'redis', status: 'connected', latencyMs: 8, endpoint: 'rediss://default:***@us1-redis.upstash.io:3210' },
    { id: 'db-3', name: 'SQLite Mobile Cache', type: 'sqlite', status: 'syncing', latencyMs: 2, endpoint: 'file://local/cache/sqlite_mirror.db' }
  ]);

  const [quickPrompt, setQuickPrompt] = useState('Verify reasoning token saturation and test queue plug-in dispatch');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  // Live VU meter pulse effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTracks(prev => prev.map(t => {
        if (t.muted) return { ...t, vuLevel: 0 };
        const delta = Math.floor(Math.random() * 20) - 10;
        const newLevel = Math.max(10, Math.min(100, t.vuLevel + delta));
        return { ...t, vuLevel: newLevel };
      }));
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Timecode counter
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const frames = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      setTimecode(`${hrs}:${mins}:${secs}:${frames}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleToggleMute = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  };

  const handleToggleSolo = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, soloed: !t.soloed } : t));
  };

  const handleToggleArm = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, armed: !t.armed } : t));
  };

  const handleGainChange = (id: string, val: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, gain: val } : t));
  };

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    setIsDispatching(true);
    setDispatchResult(null);

    // Add item to queue plugin dynamically
    const newQueueItem: QueueItem = {
      id: `q-${Date.now().toString().slice(-4)}`,
      title: quickPrompt,
      sourceTrack: selectedTrack.name,
      status: 'processing',
      tokens: Math.floor(Math.random() * 2000) + 500,
      timestamp: new Date().toLocaleTimeString()
    };
    setQueueItems(prev => [newQueueItem, ...prev]);

    try {
      const res = await onRunTestTask('Toast', quickPrompt, 'deepseek-reasoner');
      setDispatchResult(res.response || 'DAW track routed task executed successfully.');
      
      // Mark queue item as verified
      setQueueItems(prev => prev.map(q => q.id === newQueueItem.id ? { ...q, status: 'verified' } : q));
    } catch (err: any) {
      setDispatchResult(`Route Execution Error: ${err.message || 'Failed'}`);
      setQueueItems(prev => prev.map(q => q.id === newQueueItem.id ? { ...q, status: 'failed' } : q));
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-24 font-mono select-none px-2 sm:px-4">
      
      {/* 1. DAW MASTER TRANSPORT & EXECUTIVE CONTROL BAR */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 backdrop-blur-md">
        
        {/* Left: Branding & Transport Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-inner shrink-0">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-base font-extrabold text-zinc-100 tracking-wider uppercase">
                  KUDBEE EXECUTIVE DAW RACK
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                  CLOCK LOCKED
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Plug-and-Play Audio Rack & Telemetry In/Out Engine V3.2
              </p>
            </div>
          </div>

          {/* Transport Control Deck */}
          <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800/80 p-1.5 rounded-xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title={isPlaying ? 'Pause Studio Engine' : 'Play Studio Engine'}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />}
            </button>
            <button 
              onClick={() => {}}
              className="p-2 sm:p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
              title="Rewind to Start"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="h-6 w-px bg-zinc-800 mx-1" />
            <div className="px-2.5 py-1 bg-black/60 rounded-lg border border-zinc-800 text-[11px] sm:text-xs font-bold text-yellow-400 tracking-widest shadow-inner">
              {timecode}
            </div>
          </div>
        </div>

        {/* Center: Tempo & Global Master Gain */}
        <div className="flex items-center gap-4 sm:gap-6 bg-zinc-950/60 border border-zinc-850 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl w-full xl:w-auto justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">SYNTH TEMPO (BPM)</span>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="60" 
                max="180" 
                value={tempo} 
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-20 sm:w-24 accent-yellow-500 h-1 bg-zinc-800 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-zinc-200 w-7">{tempo}</span>
            </div>
          </div>

          <div className="w-px h-8 bg-zinc-800" />

          <div className="flex flex-col items-center">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">MASTER GAIN</span>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={masterVolume} 
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="w-20 sm:w-24 accent-emerald-500 h-1 bg-zinc-800 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-emerald-400 w-7">{masterVolume}%</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          <button
            onClick={onOpenGrokTerminal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-xs font-bold border border-yellow-500/20 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>Trace</span>
          </button>
          <button
            onClick={onOpenSpinUpModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-extrabold text-xs transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Spin Up</span>
          </button>
        </div>
      </div>

      {/* 2. 3x3 / 3x4 MODULAR BENTO GRID (PLUG-IN ARCHITECTURE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* BOX 1: AI Model & Agent Track Inserter (Channel Strips) */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-yellow-500" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  1. Track Inserter & Channels
                </h3>
              </div>
              <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                6 Active Tracks
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {tracks.map((track) => {
                const isSelected = track.id === selectedTrackId;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`bg-zinc-950/60 border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_12px_rgba(234,179,8,0.1)]' : 'border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${track.muted ? 'bg-red-500' : track.armed ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                      <div>
                        <div className="text-xs font-bold text-zinc-100">{track.name}</div>
                        <div className="text-[9px] text-zinc-500 uppercase">{track.type} • Gain: {track.gain}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleMute(track.id); }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${track.muted ? 'bg-red-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        M
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleArm(track.id); }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${track.armed ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        R
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Selected: <span className="text-yellow-400 font-bold">{selectedTrack.name}</span></span>
            <span className="text-emerald-400">Ready</span>
          </div>
        </div>

        {/* BOX 2: Notification Awaiting Queue Plug-in */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  2. Awaiting Queue Plug-in
                </h3>
              </div>
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                {queueItems.length} Pending
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {queueItems.map((item) => (
                <div key={item.id} className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400 font-bold">{item.sourceTrack}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      item.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      item.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 truncate">{item.title}</p>
                  <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-900">
                    <span>Tokens: {item.tokens}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Queue Backpressure</span>
            <span className="text-cyan-400 font-bold">Optimized (0 dropped)</span>
          </div>
        </div>

        {/* BOX 3: Universal Database In/Out Plug-in Bridge */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  3. DB In/Out Connector Bridge
                </h3>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Plug-n-Play
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {dbConnectors.map((db) => (
                <div key={db.id} className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                      <Plug className="w-3 h-3 text-emerald-400" />
                      {db.name}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">{db.latencyMs}ms ping</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate bg-black/40 px-2 py-1 rounded border border-zinc-900 font-mono">
                    {db.endpoint}
                  </div>
                  <div className="flex items-center justify-between text-[9px] pt-1">
                    <span className="text-zinc-400 capitalize">Type: {db.type}</span>
                    <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {db.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Interoperability Layer</span>
            <span className="text-emerald-400 font-bold">Hot-Swappable Active</span>
          </div>
        </div>

        {/* BOX 4: Master Route Dispatcher (Plug-in Action Hub) */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between md:col-span-2 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-yellow-400 fill-current" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  4. Master Route Dispatcher [{selectedTrack.name}]
                </h3>
              </div>
              <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                Direct Bus Route
              </span>
            </div>

            <form onSubmit={handleDispatch} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Enter task payload for selected channel..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 font-mono shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shrink-0 shadow-lg shadow-yellow-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Dispatch Payload</span>
                </button>
              </div>

              {dispatchResult && (
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-200 max-h-32 overflow-y-auto custom-scrollbar shadow-inner">
                  <div className="text-[9px] text-yellow-400 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Route Execution Result [{selectedTrack.name}]</span>
                    <button type="button" onClick={() => setDispatchResult(null)} className="text-zinc-500 hover:text-zinc-300">
                      Clear
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap">{dispatchResult}</pre>
                </div>
              )}
            </form>
          </div>

          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Zero-Latency Execution Pipeline</span>
            <span className="text-yellow-400 font-bold">Ready</span>
          </div>
        </div>

        {/* BOX 5: Live Telemetry Spectrum Analyzer */}
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                  5. Telemetry Spectrum Stream
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {liveFeed.length > 0 ? (
                liveFeed.slice(-4).map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-zinc-950/80 border border-zinc-850 rounded-xl text-[10px] font-mono space-y-0.5 shadow-inner">
                    <div className="flex items-center justify-between text-zinc-500 text-[8px]">
                      <span className="text-yellow-400 font-bold">{item.source || 'Studio'}</span>
                      <span>{item.time || 'now'}</span>
                    </div>
                    <p className="text-zinc-300 truncate">{item.msg || item.event}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-zinc-500 py-6">
                  Waiting for studio stream packets...
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>WebSocket / SSE</span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
        </div>

      </div>
    </div>
  );
};
