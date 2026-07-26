import React, { useState } from 'react';
import {
  X,
  Trash2,
  CheckCircle2,
  User,
  Clock,
  Tag,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  GitPullRequest,
  Terminal,
  FileCode,
  CheckSquare,
  AlertOctagon,
  History,
  Edit2
} from 'lucide-react';
import { Bead, Status, Priority } from '../types';
import { useDrawerA11y } from '../hooks/useDrawerA11y';

interface BeadDetailModalProps {
  bead: Bead | null;
  onClose: () => void;
  onUpdateStatus: (beadId: string, newStatus: Status) => void;
  onUpdateAssignee: (beadId: string, assignee: string) => void;
  onDeleteBead: (beadId: string) => void;
}

export function BeadDetailModal({
  bead,
  onClose,
  onUpdateStatus,
  onUpdateAssignee,
  onDeleteBead,
}: BeadDetailModalProps) {
  const containerRef = useDrawerA11y<HTMLDivElement>({
    isOpen: !!bead,
    onClose,
  });

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: '1',
      author: 'Mayor',
      text: 'Staged for Phase 11 convoy dispatch. Waiting for Polecat agent confirmation.',
      time: '10 mins ago',
    },
  ]);

  if (!bead) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        author: 'You (Operator)',
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    setCommentText('');
  };

  // Sample data fallback for Root Cause, Specific Fixes, and Verification steps if not custom set
  const descriptionText = bead.description || 
    `Fix issues in the worker execution loop causing module resolution failures or silent blackout screens upon deployment.`;

  const rootCauseText = bead.rootCause || (
    bead.type === 'bug'
      ? `worker.js (root) imports from TypeScript files using .js extensions, but the actual files are .ts. The Procfile runs node worker.js which cannot resolve .ts imports in production runtime environments.`
      : `BRPOP timeout backoff compounds in worker loop, causing processing cycles to exceed 30s test deadline window.`
  );

  const specificFixes = bead.specificFixes || [
    {
      step: 1,
      title: 'Fix import extensions in worker.js lines 27-28',
      details: 'Change import extensions from .js to .ts for agentLogger and circuitBreaker.',
      code: `import { agentLog, broadcastAgentState } from './services/lib/agentLogger.ts'\nimport { geminiBreaker } from './services/lib/circuitBreaker.ts'`,
    },
    {
      step: 2,
      title: 'Update Procfile line 4 to use npx tsx',
      details: 'Change hermes-worker from node --max-old-space-size=256 worker.js to npx tsx --max-old-space-size=256 worker.js.',
      code: `hermes-worker: npx tsx --max-old-space-size=256 worker.js`,
    }
  ];

  const verificationSteps = bead.verificationSteps || [
    'Run npx tsx worker.js --help to confirm clean module resolution without errors.',
    'Execute node scripts/verify-e2e.mjs locally with REDIS_URL=redis://localhost:6379 NODE_ENV=test PORT=9876 to verify test passes.',
    'Confirm no unhandled ERR_MODULE_NOT_FOUND crashes occur on deployment startup.'
  ];

  const relatedBeads = bead.relatedBeads || [
    { id: 'rel-1', title: 'Review: gt/birch/' + bead.id, status: 'failed', type: 'merge_request' },
    { id: 'rel-2', title: 'Review: gt/toast/' + bead.id, status: 'failed', type: 'merge_request' },
    { id: 'rel-3', title: 'Review: fix/hermes-worker-module-resol...', status: 'failed', type: 'merge_request' },
  ];

  const eventTimeline = bead.eventTimeline || [
    { event: 'Status changed: open → in_progress', time: '18 minutes ago' },
    { event: `Agent hooked to bead (${bead.assignee || 'Clover'})`, time: '18 minutes ago' },
    { event: `Bead created: ${bead.title}`, time: '22 minutes ago' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Bead Details: ${bead.title}`}
    >
      <div 
        ref={containerRef}
        className="bg-[#0d1117] border-l border-zinc-800 w-full max-w-2xl h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0 font-sans"
      >
        {/* Top Sticky Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800 bg-[#161b22] shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-yellow-400 font-mono text-xs font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                # Bead ID {bead.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  bead.priority === 'high'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : bead.priority === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}
              >
                {bead.priority} priority
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                {bead.type}
              </span>
              <span className="text-xs text-zinc-500 font-mono">Created {bead.createdAt}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100 leading-snug mt-2 flex items-center gap-2">
              {bead.title}
              <button 
                title="Edit Title"
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onDeleteBead(bead.id);
                onClose();
              }}
              className="text-zinc-500 hover:text-red-400 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
              title="Delete Bead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
              title="Close Drawer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 bg-[#0d1117]">
          
          {/* Metadata Grid (Assignee, Status, Labels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-yellow-400" /> Assignee Agent
              </label>
              <select
                value={bead.assignee || ''}
                onChange={(e) => onUpdateAssignee(bead.id, e.target.value)}
                className="w-full bg-[#0d1117] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-yellow-500"
              >
                <option value="">Unassigned</option>
                <option value="Clover">Clover (Polecat)</option>
                <option value="Toast">Toast (Polecat)</option>
                <option value="Maple">Maple (Polecat)</option>
                <option value="refinery">refinery (Verification)</option>
                <option value="Shadow">Shadow (Polecat)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" /> Labels & Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {bead.tags && bead.tags.length > 0 ? (
                  bead.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-700 text-yellow-400/90"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                    gt:bugfix, black-screen
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Pipeline Selection */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pipeline Lifecycle Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['open', 'in_progress', 'in_review', 'closed'] as Status[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(bead.id, st)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center capitalize border cursor-pointer ${
                    bead.status === st
                      ? st === 'closed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md'
                        : st === 'in_progress'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-md'
                        : st === 'in_review'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-md'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-md'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Related Beads Section */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5 text-purple-400" /> Related Beads & Merge Requests
            </div>
            <div className="space-y-2">
              {relatedBeads.map((rb, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-zinc-850 rounded-lg text-xs">
                  <div className="flex items-center gap-2 font-mono text-zinc-300">
                    <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{rb.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rb.status === 'failed'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {rb.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-blue-400" /> Description
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {descriptionText}
            </p>
          </div>

          {/* Root Cause Section */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Root Cause Breakdown
            </div>
            <div className="p-3 bg-[#080c11] border border-zinc-850 rounded-lg font-mono text-xs text-zinc-300 leading-relaxed">
              {rootCauseText}
            </div>
          </div>

          {/* Specific Fixes Section */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-400" /> Specific Fixes Required
            </div>
            <div className="space-y-3">
              {Array.isArray(specificFixes) ? specificFixes.map((fix: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#080c11] border border-zinc-850 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">
                      {fix.step || idx + 1}
                    </span>
                    {fix.title}
                  </div>
                  <p className="text-xs text-zinc-400">{fix.details}</p>
                  {fix.code && (
                    <pre className="p-2.5 bg-black/60 rounded border border-zinc-800 font-mono text-[11px] text-yellow-300/90 whitespace-pre-wrap overflow-x-auto">
                      {fix.code}
                    </pre>
                  )}
                </div>
              )) : (
                <div className="p-3 bg-[#080c11] border border-zinc-850 rounded-lg font-mono text-xs text-zinc-300">
                  {String(specificFixes)}
                </div>
              )}
            </div>
          </div>

          {/* Verification Section */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-yellow-400" /> Verification Instructions
            </div>
            <ul className="space-y-2">
              {verificationSteps.map((vStep, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-mono bg-[#080c11] p-2.5 rounded-lg border border-zinc-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                  <span>{vStep}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constraints */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-amber-400" /> Execution Constraints
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              • Make minimal, surgical changes — only modify what is necessary.<br />
              • Retain backward compatibility across all 12 monorepo packages.<br />
              • Confirm CI tests run clean prior to calling gt_done.
            </p>
          </div>

          {/* Event Timeline */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <History className="w-4 h-4 text-purple-400" /> Event Timeline
            </div>
            <div className="space-y-2">
              {eventTimeline.map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono p-2 bg-[#080c11] rounded border border-zinc-850 text-zinc-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    {ev.event}
                  </span>
                  <span className="text-[10px] text-zinc-500">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments / Activity Feed */}
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
              Dispatch Thread & Operator Comments
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="bg-[#0d1117] border border-zinc-800 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="font-bold text-zinc-200">{c.author}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-zinc-300 font-mono text-xs">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a dispatch instruction or note..."
                className="flex-1 bg-[#0d1117] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-md"
              >
                Send
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
