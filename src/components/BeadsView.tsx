import React, { useState } from 'react';
import {
  Hexagon,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Tag,
  User,
  MoreVertical,
  ChevronRight,
  Brain
} from 'lucide-react';
import { Bead, Status, Priority } from '../types';

interface BeadsViewProps {
  beads: Bead[];
  onSelectBead: (bead: Bead) => void;
  onOpenNewBeadModal: () => void;
  onStatusChange: (beadId: string, newStatus: Status) => void;
}

export const BeadsView: React.FC<BeadsViewProps> = ({
  beads,
  onSelectBead,
  onOpenNewBeadModal,
  onStatusChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredBeads = beads.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.assignee && b.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = priorityFilter === 'all' || b.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || b.type === typeFilter;

    return matchesSearch && matchesPriority && matchesType;
  });

  const openCount = beads.filter((b) => b.status === 'open').length;
  const inProgressCount = beads.filter((b) => b.status === 'in_progress').length;
  const inReviewCount = beads.filter((b) => b.status === 'in_review').length;
  const closedCount = beads.filter((b) => b.status === 'closed').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* Top Banner & Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121720] border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Hexagon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              Bead Task Directory & Kanban
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                {beads.length} BEADS
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Track and manage task beads across town agent convoys</p>
          </div>
        </div>

        <button
          onClick={onOpenNewBeadModal}
          className="flex items-center gap-2 bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md shadow-yellow-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Bead</span>
        </button>
      </div>

      {/* Quick Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121720] border border-zinc-800/80 rounded-lg p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">OPEN BEADS</span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{openCount}</span>
        </div>
        <div className="bg-[#121720] border border-zinc-800/80 rounded-lg p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider text-yellow-400 uppercase">IN PROGRESS</span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{inProgressCount}</span>
        </div>
        <div className="bg-[#121720] border border-zinc-800/80 rounded-lg p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase">IN REVIEW</span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{inReviewCount}</span>
        </div>
        <div className="bg-[#121720] border border-zinc-800/80 rounded-lg p-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">CLOSED</span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{closedCount}</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#121720] border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beads by title, assignee, or tag..."
            className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#181f2a] border border-zinc-700/80 rounded-lg px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono"
            >
              <option value="all">All Priorities</option>
              <option value="high">High / Blockers</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#181f2a] border border-zinc-700/80 rounded-lg px-2.5 py-1">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono"
            >
              <option value="all">All Types</option>
              <option value="bug">Bug Fixes</option>
              <option value="feature">Features</option>
              <option value="issue">Issues</option>
              <option value="merge_request">Merge Requests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 overflow-x-auto pb-6 flex gap-4 min-w-0 snap-x custom-scrollbar">
        {(['open', 'in_progress', 'in_review', 'closed'] as Status[]).map((colStatus) => {
          const colBeads = filteredBeads.filter((b) => b.status === colStatus);
          const label =
            colStatus === 'open'
              ? 'Open'
              : colStatus === 'in_progress'
              ? 'In Progress'
              : colStatus === 'in_review'
              ? 'In Review'
              : 'Closed';

          const columnHeaderColor =
            colStatus === 'open'
              ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
              : colStatus === 'in_progress'
              ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
              : colStatus === 'in_review'
              ? 'text-purple-400 border-purple-500/30 bg-purple-500/10'
              : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

          return (
            <div
              key={colStatus}
              className="flex-1 flex flex-col gap-3 min-w-[280px] sm:min-w-[300px] max-w-[340px] bg-[#121720]/60 border border-zinc-800/80 rounded-xl p-3 shrink-0"
            >
              {/* Column Title Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${columnHeaderColor}`}>
                  {label} ({colBeads.length})
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {Math.round((colBeads.length / Math.max(1, beads.length)) * 100)}%
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[60vh] pr-1">
                {colBeads.map((bead) => (
                  <div
                    key={bead.id}
                    onClick={() => onSelectBead(bead)}
                    className="bg-[#171e2b] border border-zinc-800 hover:border-yellow-500/50 rounded-lg p-3.5 transition-all cursor-pointer group shadow-sm flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{bead.id}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                          bead.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : bead.priority === 'medium'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {bead.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {bead.title}
                    </h4>

                    {bead.tags && bead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {bead.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
                      {bead.assignee ? (
                        <span className="text-yellow-400/90 font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-yellow-400" />
                          {bead.assignee}
                        </span>
                      ) : (
                        <span className="text-zinc-600">Unassigned</span>
                      )}

                      <span>{bead.createdAt}</span>
                    </div>
                  </div>
                ))}

                {colBeads.length === 0 && (
                  <div className="p-6 text-center text-xs text-zinc-600 font-mono border border-dashed border-zinc-800 rounded-lg">
                    No beads in {label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
