import React from 'react';
import { X, Bot, Shield, Cpu, HardDrive, Terminal, Play, Pause, RefreshCw } from 'lucide-react';
import { Agent } from '../types';
import { useDrawerA11y } from '../hooks/useDrawerA11y';

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
  onToggleStatus: (agentId: string) => void;
  onRunTestTask?: (agentName: string, prompt: string, model: string) => Promise<any>;
}

export function AgentDetailModal({ agent, onClose, onToggleStatus, onRunTestTask }: AgentDetailModalProps) {
  const containerRef = useDrawerA11y<HTMLDivElement>({
    isOpen: !!agent,
    onClose,
  });

  if (!agent) return null;

  const [agentPrompt, setAgentPrompt] = React.useState('');
  const [isRunningTask, setIsRunningTask] = React.useState(false);
  const [taskOutput, setTaskOutput] = React.useState<string | null>(null);

  const isWorking = agent.status === 'working';
  const Icon = agent.icon === 'shield' ? Shield : Bot;

  // Calculate dynamic CPU Usage based on status
  const cpuVal = isWorking ? ((agent.name.length * 4.3 + 12.8) % 25 + 14.1).toFixed(1) : '0.1';
  const cpuPct = isWorking ? Math.min(100, Math.round(parseFloat(cpuVal))) : 1;

  // Calculate Memory Usage
  const memK = isWorking ? Math.round((agent.reasoningTokensSpent || 62410) / 1000) : 12;

  const handleExecuteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentPrompt.trim() || !onRunTestTask) return;

    setIsRunningTask(true);
    setTaskOutput(null);

    try {
      if (!isWorking) {
        onToggleStatus(agent.id);
      }
      const res = await onRunTestTask(agent.name, agentPrompt, agent.model || 'grok-3-fast');
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

          {/* Hooked bead details */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Currently Hooked Bead Hash
            </div>
            <div className="text-xs font-mono text-yellow-400 break-all bg-black/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
              <span>{isWorking ? (agent.hooked || 'e89f21a4-c4ec9718') : 'none (idle)'}</span>
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">HOOKED</span>
            </div>
          </div>

          {/* Direct Agent Command Input */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div className="text-xs font-bold text-zinc-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-yellow-400" /> Dispatch Task to {agent.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{agent.model || 'grok-3-fast'}</span>
            </div>
            <form onSubmit={handleExecuteTask} className="flex gap-2 mt-3">
              <input
                type="text"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder={`Instruct ${agent.name}...`}
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
              <span className="text-[10px] text-zinc-400 font-mono">Last Active: {agent.lastActive}</span>
            </div>
            <div className="bg-[#080c11] border border-zinc-850 rounded-lg p-3.5 font-mono text-xs text-zinc-300 leading-relaxed min-h-[100px] shadow-inner">
              {agent.currentAction || (isWorking ? 'Processing queue tasks and telemetry synchronization...' : 'Agent standing by in idle standby state.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
