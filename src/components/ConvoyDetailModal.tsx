import React from 'react';
import { X, Layers, GitBranch, GitMerge, CheckCircle2, Clock, User, ArrowRight, Play, RefreshCw } from 'lucide-react';
import { Convoy, Bead } from '../types';
import { useDrawerA11y } from '../hooks/useDrawerA11y';

interface ConvoyDetailModalProps {
  convoy: Convoy | null;
  onClose: () => void;
  onSelectBead?: (beadId: string) => void;
  beads?: Bead[];
}

export const ConvoyDetailModal: React.FC<ConvoyDetailModalProps> = ({
  convoy,
  onClose,
  onSelectBead,
  beads = []
}) => {
  const containerRef = useDrawerA11y<HTMLDivElement>({
    isOpen: !!convoy,
    onClose,
  });

  if (!convoy) return null;

  const progressPercent = convoy.totalTasks > 0
    ? Math.round((convoy.completedTasks / convoy.totalTasks) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Convoy Details: ${convoy.title}`}
    >
      <div
        ref={containerRef}
        className="bg-[#0d1117] border-l border-zinc-800 w-full max-w-xl h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800 bg-[#161b22] shrink-0">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3" /> CONVOY {convoy.status.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500 font-mono">ID: {convoy.id}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
              {convoy.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors shrink-0"
            title="Close Drawer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 bg-[#0d1117]">
          {/* Progress Tracker */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <span>Overall Multi-Bead Progress</span>
              <span className="font-mono text-purple-400">{convoy.completedTasks} / {convoy.totalTasks} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Convoy Metadata */}
          <div className="grid grid-cols-2 gap-4 bg-[#161b22] border border-zinc-800 rounded-xl p-4 text-xs font-mono">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Target Branch
              </span>
              <div className="flex items-center gap-1.5 text-zinc-200 truncate bg-zinc-900 p-2 rounded border border-zinc-800">
                <GitBranch className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{convoy.branch || 'main'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Merge Strategy
              </span>
              <div className="flex items-center gap-1.5 text-zinc-200 bg-zinc-900 p-2 rounded border border-zinc-800">
                <GitMerge className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>review-then-land</span>
              </div>
            </div>
          </div>

          {/* Beads List */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-yellow-400" /> Convoy Task Beads ({convoy.tasks.length})
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Click bead to inspect</span>
            </div>

            <div className="space-y-2.5">
              {convoy.tasks.map((task) => {
                const matchedBead = beads.find((b) => b.id === task.id || b.title === task.title);
                const isCompleted = task.status === 'completed';
                const isActive = task.status === 'active';

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectBead && onSelectBead(matchedBead ? matchedBead.id : task.id)}
                    className="p-3 bg-[#0d1117] border border-zinc-800 hover:border-yellow-500/60 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-900/80 group"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          isCompleted ? 'bg-emerald-400' : isActive ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-600'
                        }`} />
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-yellow-400 transition-colors">
                          {task.title}
                        </h4>
                      </div>
                      {task.assignee && (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                          <User className="w-3 h-3 text-yellow-500" /> Assigned: {task.assignee}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isActive
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {task.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-yellow-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Dispatch */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-200">Convoy Execution Control</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Dispatch all staged tasks to active Polecat agents</div>
            </div>
            <button
              onClick={() => alert(`Convoy "${convoy.title}" re-dispatched to active Polecat workers.`)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Dispatch Convoy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
