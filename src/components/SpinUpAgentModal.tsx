import React, { useState } from 'react';
import { Bot, X, Sparkles, Cpu, Play, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { Agent } from '../types';
import { useDrawerA11y } from '../hooks/useDrawerA11y';

interface SpinUpAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: Agent) => void;
  onRunTestTask: (agentName: string, prompt: string, model: string) => Promise<any>;
}

export const SpinUpAgentModal: React.FC<SpinUpAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
  onRunTestTask
}) => {
  const containerRef = useDrawerA11y<HTMLDivElement>({
    isOpen,
    onClose,
  });

  const [name, setName] = useState('');
  const [role, setRole] = useState<'polecat' | 'refinery' | 'mayor'>('polecat');
  const [model, setModel] = useState<'deepseek-reasoner' | 'grok-3-fast' | 'inception-v2'>('deepseek-reasoner');
  const [initialTask, setInitialTask] = useState('Inspect repository dependencies and summarize reasoning tokens trace');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [reasoningTrace, setReasoningTrace] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  // Agent Database, Standby Room & Directives configuration
  const [selectedDbIndex, setSelectedDbIndex] = useState<number>(3);
  const [startMode, setStartMode] = useState<'working' | 'standby'>('standby');
  const [syncAgentsMd, setSyncAgentsMd] = useState<boolean>(true);

  // Interactive skills, plugins & tags arrays
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const AVAILABLE_SKILLS = [
    'Drizzle Schema Migration',
    'Redis Resiliency & Fail-Open',
    'Memory Pipeline & Semantic Recall',
    'Google Maps Platform Checkout',
    'OAuth Popup Integrations',
    'Workspace API Sheet Integrations'
  ];

  const AVAILABLE_PLUGINS = [
    'Drizzle DDL Engine',
    'Upstash Redis Failover Shield',
    'MemoryVault SQLite Indexer',
    'Google Maps JS Autocomplete',
    'OAuth Identity Gateway',
    'Gmail Workspace Hook'
  ];

  const AVAILABLE_TAGS = [
    'Think-Tokens',
    'Fast-Tokens',
    'Fail-Open',
    'Postgres-Sync',
    'Cosine-Semantic'
  ];

  if (!isOpen) return null;

  const handleSpinUpAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsExecuting(true);
    setExecutionStatus('running');
    setExecutionOutput(null);
    setReasoningTrace(null);

    // Create the new agent object with selected skills, plugins, and tags
    const newAgent: Agent = {
      id: `a_${Date.now()}`,
      name: name.trim(),
      role,
      status: startMode === 'standby' ? 'standby' : 'working',
      inStandbyRoom: startMode === 'standby',
      redisDbIndex: selectedDbIndex,
      agentsMdSynced: syncAgentsMd,
      hooked: Math.random().toString(16).substring(2, 10) + '...',
      lastActive: startMode === 'standby' ? 'Standing by in sync room' : 'Just now',
      lastSleepTime: startMode === 'standby' ? 'Just now' : undefined,
      currentAction: startMode === 'standby' 
        ? `Standing by in Sync Chamber (Isolated Redis DB ${selectedDbIndex}). Ingesting peer telemetries & AGENTS.md.`
        : `Executing task on ${model}...`,
      icon: role === 'refinery' ? 'shield' : 'robot',
      model,
      reasoningTokensSpent: 0,
      promptTokensSpent: 0,
      completionTokensSpent: 0,
      totalTasksCompleted: 0,
      temperature: 0.2,
      skills: selectedSkills.length > 0 ? selectedSkills : ['General Purpose Reasoning'],
      plugins: selectedPlugins.length > 0 ? selectedPlugins : ['Core Cognitive Shield'],
      tags: selectedTags.length > 0 ? selectedTags : ['Fast-Tokens']
    };

    onAgentCreated(newAgent);

    try {
      const res = await onRunTestTask(name.trim(), initialTask, model);
      
      setExecutionStatus('success');
      setExecutionOutput(res.response || 'Agent task executed successfully');
      if (res.reasoning) {
        setReasoningTrace(res.reasoning);
      }
    } catch (err: any) {
      setExecutionStatus('error');
      setExecutionOutput(`Task Execution Error: ${err.message || 'Failed to reach API gateway'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Spin Up Worker Agent"
    >
      <div
        ref={containerRef}
        className="bg-[#12171f] border border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Spin Up Worker Agent
                <span className="text-[10px] font-mono bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                  LIVE TEST ENGINE
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Deploy an isolated worker node with reasoning token capture</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSpinUpAndTest} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Agent Name / Identifier
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amber, Beacon, Sentinel-1"
              className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Isolated Redis DB Key Namespace
              </label>
              <select
                value={selectedDbIndex}
                onChange={(e) => setSelectedDbIndex(Number(e.target.value))}
                className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-yellow-500"
              >
                <option value={1}>Redis DB 1 (kudbee:agent:db:1)</option>
                <option value={2}>Redis DB 2 (kudbee:agent:db:2)</option>
                <option value={3}>Redis DB 3 (kudbee:agent:db:3)</option>
                <option value={4}>Redis DB 4 (kudbee:agent:db:4)</option>
                <option value={5}>Redis DB 5 (kudbee:agent:db:5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Boot State
              </label>
              <select
                value={startMode}
                onChange={(e: any) => setStartMode(e.target.value)}
                className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500 font-mono"
              >
                <option value="standby">Standby Chamber (Ingest Context & Peer Telemetries)</option>
                <option value="working">Wake Up Immediately & Run Initial Task</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agents-md-sync"
                checked={syncAgentsMd}
                onChange={(e) => setSyncAgentsMd(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-yellow-500 focus:ring-yellow-500 bg-zinc-900 cursor-pointer"
              />
              <label htmlFor="agents-md-sync" className="text-xs text-zinc-200 font-mono cursor-pointer font-bold">
                Auto-read AGENTS.md Directives on Boot
              </label>
            </div>
            <span className="text-[10px] text-yellow-400/80 font-mono">INIT Step Pre-load</span>
          </div>

          {/* Interactive Skills */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Assign Skills
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/40 border border-zinc-800 rounded-lg">
              {AVAILABLE_SKILLS.map(skill => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Plugins */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Access Plugins
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/40 border border-zinc-800 rounded-lg">
              {AVAILABLE_PLUGINS.map(plugin => {
                const active = selectedPlugins.includes(plugin);
                return (
                  <button
                    key={plugin}
                    type="button"
                    onClick={() => setSelectedPlugins(prev => prev.includes(plugin) ? prev.filter(p => p !== plugin) : [...prev, plugin])}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {plugin}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Token Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Token & Operations Tags
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/40 border border-zinc-800 rounded-lg">
              {AVAILABLE_TAGS.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Test Prompt / First Task</span>
              <span className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live Run on Spin-Up
              </span>
            </label>
            <textarea
              rows={2}
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              placeholder="Prompt for initial test execution..."
              className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {/* Test Execution Logs Area */}
          {executionStatus !== 'idle' && (
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-2">
                  {isExecuting ? (
                    <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                  ) : executionStatus === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  {isExecuting ? 'Running AI Provider Query...' : executionStatus === 'success' ? 'Task Completed' : 'Task Error'}
                </span>
                <span className="text-zinc-500">{model}</span>
              </div>

              {reasoningTrace && (
                <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[11px] font-mono text-yellow-300/90 max-h-32 overflow-y-auto custom-scrollbar">
                  <div className="font-bold mb-1 text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Captured Thinking Trace:
                  </div>
                  <pre className="whitespace-pre-wrap">{reasoningTrace}</pre>
                </div>
              )}

              {executionOutput && (
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-200 max-h-40 overflow-y-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap">{executionOutput}</pre>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExecuting}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Spinning Up & Testing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Spin Up & Run Test
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
