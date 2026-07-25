import React, { useState } from 'react';
import { X, Trash2, CheckCircle2, User, Clock, Tag, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Bead, Status, Priority } from '../types';

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
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: '1', author: 'Mayor', text: 'Staged for Phase 11 convoy dispatch. Waiting for Polecat agent confirmation.', time: '10 mins ago' },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-2">
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
            <span className="text-xs text-zinc-500 font-mono">ID: {bead.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDeleteBead(bead.id);
                onClose();
              }}
              className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
              title="Delete Bead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 leading-snug">{bead.title}</h2>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Created {bead.createdAt}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/40 text-zinc-300 uppercase text-[10px] font-semibold">
                {bead.type}
              </span>
            </div>
          </div>

          {/* Lifecycle Status Pipeline */}
          <div className="bg-[#0d1117] border border-zinc-800 rounded-lg p-3">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Move Status Pipeline
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['open', 'in_progress', 'in_review', 'closed'] as Status[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(bead.id, st)}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all text-center capitalize ${
                    bead.status === st
                      ? st === 'closed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40 font-semibold'
                        : st === 'in_progress'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-semibold'
                        : st === 'in_review'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 font-semibold'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-semibold'
                      : 'bg-zinc-800/40 text-zinc-400 border border-transparent hover:bg-zinc-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee & Tags */}
          <div className="grid grid-cols-2 gap-4 bg-[#0d1117] border border-zinc-800 rounded-lg p-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Assigned Agent
              </label>
              <select
                value={bead.assignee || ''}
                onChange={(e) => onUpdateAssignee(bead.id, e.target.value)}
                className="w-full bg-[#161b22] border border-zinc-700/60 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="">Unassigned</option>
                <option value="Toast">Toast (Polecat)</option>
                <option value="Maple">Maple (Polecat)</option>
                <option value="refinery">refinery (Verification)</option>
                <option value="Shadow">Shadow (Polecat)</option>
                <option value="Clover">Clover (Polecat)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {bead.tags && bead.tags.length > 0 ? (
                  bead.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700/60 text-zinc-300"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-600">No tags</span>
                )}
              </div>
            </div>
          </div>

          {/* Comments / Activity Feed */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3">
              Activity & Dispatch Thread
            </h4>
            <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="bg-[#0d1117] border border-zinc-800/60 rounded-md p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                    <span className="font-semibold text-zinc-300">{c.author}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-zinc-300 font-mono text-[11px]">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a dispatch instruction or note..."
                className="flex-1 bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors shrink-0"
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
