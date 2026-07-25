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
  Check,
  Sliders,
  Activity,
  Database,
  Plug,
  Server,
  RefreshCw,
  ShieldCheck,
  Layers
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
  const [viewMode, setViewMode] = useState<'bento' | 'kanban' | 'list'>('bento');
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-28 font-mono select-none px-2 sm:px-4">
      
      {/* 1. BEADS EXECUTIVE TRANSPORT & CONTROL BAR */}
      <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 backdrop-blur-md">
        
        {/* Left: Branding & Counts */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <Hexagon className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-base font-extrabold text-zinc-100 tracking-wider uppercase">
                  BEADS TASK & CONVOY PIPELINE
                </h1>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] font-bold">
                  {beads.length} ACTIVE BEADS
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Modular Bento Grid & Pluggable Task Routing Engine V3.2
              </p>
            </div>
          </div>

          {/* View Mode Switcher Deck */}
          <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800/80 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('bento')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'bento' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bento Matrix
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              List Table
            </button>
          </div>
        </div>

        {/* Center: Quick Stats Pills */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-zinc-400">Open:</span>
            <span className="text-blue-400 font-bold">{openCount}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-zinc-400">In Progress:</span>
            <span className="text-yellow-400 font-bold">{inProgressCount}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">Closed:</span>
            <span className="text-emerald-400 font-bold">{closedCount}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          <button
            onClick={handleManualSync}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={onOpenNewBeadModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Bead</span>
          </button>
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
            placeholder="Search beads by title, assignee, or tag..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
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

          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
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

      {/* VIEW RENDERER: BENTO MATRIX / KANBAN / LIST TABLE */}
      {viewMode === 'bento' ? (
        /* 3x3 / 3x4 MODULAR BENTO GRID ARCHITECTURE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* BOX 1: High Priority & Blockers Matrix */}
          <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                  <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                    1. High Priority & Blockers
                  </h3>
                </div>
                <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                  {beads.filter(b => b.priority === 'high').length} Blockers
                </span>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {beads.filter(b => b.priority === 'high').map((bead) => (
                  <div
                    key={bead.id}
                    onClick={() => onSelectBead(bead)}
                    className="bg-zinc-950/60 border border-zinc-850 hover:border-red-500/50 rounded-xl p-3 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-red-400 font-bold">{bead.id}</span>
                      <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold">High Priority</span>
                    </div>
                    <p className="text-xs text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-1 font-sans font-medium">{bead.title}</p>
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-900">
                      <span>{bead.assignee || 'Unassigned'}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(bead.id, nextStatusMap[bead.status]); }}
                        className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Advance <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Blocker Resolution SLA</span>
              <span className="text-red-400 font-bold">Active Watch</span>
            </div>
          </div>

          {/* BOX 2: In-Progress Convoy Pipeline */}
          <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                    2. In-Progress Convoy Pipeline
                  </h3>
                </div>
                <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                  {inProgressCount} Active
                </span>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {beads.filter(b => b.status === 'in_progress').map((bead) => (
                  <div
                    key={bead.id}
                    onClick={() => onSelectBead(bead)}
                    className="bg-zinc-950/60 border border-zinc-850 hover:border-yellow-500/50 rounded-xl p-3 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-yellow-400 font-bold">{bead.id}</span>
                      <span className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold">In Progress</span>
                    </div>
                    <p className="text-xs text-zinc-100 group-hover:text-yellow-400 transition-colors line-clamp-1 font-sans font-medium">{bead.title}</p>
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-900">
                      <span className="text-blue-400">{bead.assignee || 'Agent Worker'}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(bead.id, nextStatusMap[bead.status]); }}
                        className="text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Review <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Execution State</span>
              <span className="text-yellow-400 font-bold">Optimized Stream</span>
            </div>
          </div>

          {/* BOX 3: Database In/Out Sync Plug-in */}
          <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                    3. Database Connector Bridge
                  </h3>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  Live
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                      <Plug className="w-3 h-3 text-emerald-400" />
                      Neon Postgres Core
                    </span>
                    <span className="text-emerald-400 font-bold">14ms</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono truncate">postgres://core.neon.tech/kudbee_beads</div>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                      <Plug className="w-3 h-3 text-emerald-400" />
                      Upstash Redis Ring
                    </span>
                    <span className="text-emerald-400 font-bold">8ms</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono truncate">rediss://default:***@upstash.io</div>
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Interoperability Layer</span>
              <span className="text-emerald-400 font-bold">Connected</span>
            </div>
          </div>

          {/* BOX 4: Complete Bead Directory Matrix (Spans 2 columns on lg) */}
          <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between lg:col-span-2">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                    4. Complete Bead Master List ({filteredBeads.length})
                  </h3>
                </div>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                  Interactive Matrix
                </span>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredBeads.map((bead) => (
                  <div
                    key={bead.id}
                    onClick={() => onSelectBead(bead)}
                    className="bg-zinc-950/60 border border-zinc-850 hover:border-blue-500/50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-bold text-zinc-500 shrink-0">{bead.id}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-100 truncate">{bead.title}</div>
                        <div className="text-[9px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span className="text-blue-400">{bead.assignee || 'Unassigned'}</span>
                          <span>•</span>
                          <span className="uppercase">{bead.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        bead.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        bead.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {bead.priority}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(bead.id, nextStatusMap[bead.status]); }}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                        title="Advance Status"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Real-time Sync</span>
              <span className="text-blue-400 font-bold">Synced</span>
            </div>
          </div>

          {/* BOX 5: Quick Task Dispatcher Plug-in */}
          <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">
                    5. Quick Task Dispatcher
                  </h3>
                </div>
                <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                  Plug-n-Play
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] text-zinc-400">
                  Instantly spawn a new agent bead or push a priority verification task into the active execution queue.
                </p>
                <button
                  onClick={onOpenNewBeadModal}
                  className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-extrabold text-xs transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Dispatch Bead</span>
                </button>
              </div>
            </div>
            <div className="border-t border-zinc-850 pt-3 mt-4 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Dispatcher Ready</span>
              <span className="text-yellow-400 font-bold">Online</span>
            </div>
          </div>

        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN SWIMLANES */
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
                className="flex-1 flex flex-col gap-3 min-w-[280px] sm:min-w-[310px] max-w-[350px] bg-[#121620] border-2 border-zinc-800 rounded-2xl p-4 shrink-0 shadow-xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${columnHeaderColor}`}>
                    {label} ({colBeads.length})
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {Math.round((colBeads.length / Math.max(1, beads.length)) * 100)}%
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[62vh] pr-1">
                  {colBeads.map((bead) => (
                    <div
                      key={bead.id}
                      onClick={() => onSelectBead(bead)}
                      className="bg-zinc-950/80 border border-zinc-850 hover:border-blue-500/60 rounded-xl p-4 transition-all cursor-pointer group shadow-md flex flex-col gap-3 relative overflow-hidden"
                    >
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
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
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
                              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-850 text-[10px] font-mono text-zinc-400 pl-1">
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
                    <div className="p-8 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-800 rounded-xl">
                      No beads in {label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="bg-[#121620] border-2 border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
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
              <tbody className="divide-y divide-zinc-850">
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
                          <span key={idx} className="bg-zinc-900 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded border border-zinc-800">
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
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] rounded transition-colors cursor-pointer"
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
