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
  Brain,
  Sparkles,
  Kanban,
  ListFilter,
  Zap,
  Check
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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

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

  const nextStatusMap: Record<Status, Status> = {
    open: 'in_progress',
    in_progress: 'in_review',
    in_review: 'closed',
    closed: 'open',
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto flex flex-col min-h-full pb-28 lg:pb-8">
      {/* Top Banner & Control Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-[#131924] to-zinc-900 border border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shadow-inner">
            <Hexagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Bead Task Directory & Kanban
              <span className="text-[11px] font-mono bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30 font-bold">
                {beads.length} ACTIVE BEADS
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Live multi-agent convoy task pipeline with instant progression controls and priority tagging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'kanban' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              List View
            </button>
          </div>

          <button
            onClick={onOpenNewBeadModal}
            className="flex items-center gap-2 bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-lg shadow-yellow-500/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Bead</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> OPEN BEADS
          </span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{openCount}</span>
        </div>
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-wider text-yellow-400 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> IN PROGRESS
          </span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{inProgressCount}</span>
        </div>
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> IN REVIEW
          </span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{inReviewCount}</span>
        </div>
        <div className="bg-[#121720] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> CLOSED
          </span>
          <span className="text-2xl font-bold text-zinc-100 font-mono">{closedCount}</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#121720] border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beads by title, assignee, or tag..."
            className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">All Priorities</option>
              <option value="high" className="bg-zinc-900">High / Blockers</option>
              <option value="medium" className="bg-zinc-900">Medium</option>
              <option value="low" className="bg-zinc-900">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3 py-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">All Types</option>
              <option value="bug" className="bg-zinc-900">Bug Fixes</option>
              <option value="feature" className="bg-zinc-900">Features</option>
              <option value="issue" className="bg-zinc-900">Issues</option>
              <option value="merge_request" className="bg-zinc-900">Merge Requests</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Switcher Output */}
      {viewMode === 'kanban' ? (
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
                className="flex-1 flex flex-col gap-3 min-w-[280px] sm:min-w-[310px] max-w-[350px] bg-[#121720]/80 border border-zinc-800/80 rounded-xl p-3.5 shrink-0 shadow-xl"
              >
                {/* Column Title Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${columnHeaderColor}`}>
                    {label} ({colBeads.length})
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {Math.round((colBeads.length / Math.max(1, beads.length)) * 100)}%
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[62vh] pr-1">
                  {colBeads.map((bead) => (
                    <div
                      key={bead.id}
                      onClick={() => onSelectBead(bead)}
                      className="bg-[#171e2b] border border-zinc-800/90 hover:border-blue-500/60 rounded-xl p-4 transition-all cursor-pointer group shadow-md flex flex-col gap-3 relative overflow-hidden"
                    >
                      {/* Priority left accent bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          bead.priority === 'high'
                            ? 'bg-red-500'
                            : bead.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />

                      <div className="flex items-start justify-between gap-2 pl-1">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">{bead.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                              bead.priority === 'high'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : bead.priority === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {bead.priority}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(bead.id, nextStatusMap[bead.status]);
                            }}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Advance Status"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2 pl-1">
                        {bead.title}
                      </h4>

                      {bead.tags && bead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-1">
                          {bead.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900/90 text-zinc-300 border border-zinc-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400 pl-1">
                        {bead.assignee ? (
                          <span className="text-blue-400 font-medium flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            {bead.assignee}
                          </span>
                        ) : (
                          <span className="text-zinc-500">Unassigned</span>
                        )}

                        <span className="text-zinc-500">{bead.createdAt}</span>
                      </div>
                    </div>
                  ))}

                  {colBeads.length === 0 && (
                    <div className="p-8 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-800/80 rounded-xl">
                      No beads in {label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Mode */
        <div className="bg-[#121720] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="bg-zinc-900/95 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Assignee</th>
                  <th className="py-3 px-4 font-semibold">Tags</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredBeads.map((bead) => (
                  <tr
                    key={bead.id}
                    onClick={() => onSelectBead(bead)}
                    className="hover:bg-zinc-900/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-bold text-zinc-400">{bead.id}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-100 group-hover:text-blue-400 max-w-xs truncate">
                      {bead.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        bead.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                        bead.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        bead.status === 'in_review' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {bead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        bead.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        bead.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {bead.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {bead.assignee || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {bead.tags?.map((t, idx) => (
                          <span key={idx} className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(bead.id, nextStatusMap[bead.status]);
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] rounded transition-colors"
                      >
                        Advance
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No matching beads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
