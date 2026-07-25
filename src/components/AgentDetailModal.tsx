import React from 'react';
import { X, Bot, Shield, Cpu, HardDrive, Terminal, Play, Pause, RefreshCw } from 'lucide-react';
import { Agent } from '../types';

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
  onToggleStatus: (agentId: string) => void;
}

export function AgentDetailModal({ agent, onClose, onToggleStatus }: AgentDetailModalProps) {
  if (!agent) return null;

  const isWorking = agent.status === 'working';
  const Icon = agent.icon === 'shield' ? Shield : Bot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-zinc-700/60 flex items-center justify-center text-yellow-400 bg-zinc-900">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{agent.name}</h3>
                <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  {agent.role}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Status: <span className={isWorking ? 'text-green-400 font-semibold' : 'text-zinc-500'}>{agent.status}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Action Trigger */}
          <div className="flex items-center justify-between bg-[#0d1117] border border-zinc-800 rounded-lg p-3">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Execution Engine Control</div>
              <div className="text-[11px] text-zinc-500">Toggle active worker process state</div>
            </div>
            <button
              onClick={() => onToggleStatus(agent.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                isWorking
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
              }`}
            >
              {isWorking ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Worker
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Worker
                </>
              )}
            </button>
          </div>

          {/* Telemetry metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1117] border border-zinc-800/80 rounded-lg p-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                <Cpu className="w-3 h-3 text-blue-400" /> CPU Usage
              </div>
              <div className="text-lg font-semibold text-zinc-100">{isWorking ? '18.4%' : '0.1%'}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: isWorking ? '18%' : '1%' }}
                ></div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-zinc-800/80 rounded-lg p-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                <HardDrive className="w-3 h-3 text-purple-400" /> Context Memory
              </div>
              <div className="text-lg font-semibold text-zinc-100">{isWorking ? '142K / 1M' : '12K / 1M'}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: isWorking ? '14%' : '1%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Hooked bead details */}
          {agent.hooked && (
            <div className="bg-[#0d1117] border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Currently Hooked Bead Hash
              </div>
              <div className="text-xs font-mono text-yellow-400/90 break-all bg-black/40 p-2 rounded border border-zinc-800/50">
                {agent.hooked}
              </div>
            </div>
          )}

          {/* Current Activity Stream */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-yellow-500" /> Live Action Output
              </span>
              <span className="text-[10px] text-zinc-500">Updated {agent.lastActive}</span>
            </div>
            <div className="bg-[#0a0d12] border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-300 leading-relaxed min-h-[80px]">
              {agent.currentAction || (isWorking ? 'Processing queue tasks...' : 'Agent standing by in idle state.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
