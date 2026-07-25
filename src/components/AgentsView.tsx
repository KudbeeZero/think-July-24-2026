import React from 'react';
import { Bot, Shield, Crown, Play, Pause, RefreshCw, Cpu, HardDrive, Terminal } from 'lucide-react';
import { Agent } from '../types';

interface AgentsViewProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onToggleStatus: (agentId: string) => void;
}

export function AgentsView({ agents, onSelectAgent, onToggleStatus }: AgentsViewProps) {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-28 lg:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-yellow-500" /> Active Worker Agent Fleet
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Polecat workers, Refinery verifiers, and Mayor orchestrator status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30">
            {agents.filter((a) => a.status === 'working').length} / {agents.length} Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isWorking = agent.status === 'working';
          const Icon = agent.icon === 'shield' ? Shield : Bot;

          return (
            <div
              key={agent.id}
              className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between group cursor-pointer"
              onClick={() => onSelectAgent(agent)}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-zinc-700/60 flex items-center justify-center text-yellow-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{agent.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="font-mono text-zinc-400">{agent.role}</span>
                        <span>•</span>
                        <span className={isWorking ? 'text-green-400 font-medium' : 'text-zinc-500'}>
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
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isWorking
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                    title={isWorking ? 'Pause Agent' : 'Start Agent'}
                  >
                    {isWorking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>

                {agent.hooked && (
                  <div className="text-[11px] text-zinc-500 font-mono bg-[#0d1117] p-2 rounded border border-zinc-800 mb-3 truncate">
                    Hook: <span className="text-yellow-400">{agent.hooked}</span>
                  </div>
                )}

                <p className="text-xs text-zinc-400 italic line-clamp-2 leading-relaxed bg-[#0d1117]/50 p-2.5 rounded border border-zinc-800/50">
                  {agent.currentAction || 'Standing by for bead assignment...'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-800/80">
                <span>Active {agent.lastActive}</span>
                <span className="text-yellow-500 group-hover:translate-x-1 transition-transform font-medium">
                  Inspect Agent →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
