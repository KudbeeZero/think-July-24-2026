import React, { useState } from 'react';
import { X, Plus, Tag, AlertCircle, User, FileText } from 'lucide-react';
import { Bead, Priority, BeadType, Status } from '../types';

interface NewBeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBead: (bead: Omit<Bead, 'id' | 'createdAt'>) => void;
}

export function NewBeadModal({ isOpen, onClose, onAddBead }: NewBeadModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [type, setType] = useState<BeadType>('issue');
  const [status, setStatus] = useState<Status>('open');
  const [assignee, setAssignee] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Phase 11']);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddBead({
      title: title.trim(),
      priority,
      type,
      status,
      assignee: assignee.trim() || undefined,
      tags,
    });

    setTitle('');
    setAssignee('');
    setTags(['Phase 11']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-zinc-100">Create New Bead</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Bead Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remove deprecated Redis rate limit URL"
              className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority / Blocker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as BeadType)}
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="issue">Issue</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug Fix</option>
                <option value="merge_request">Merge Request</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="">Unassigned</option>
                <option value="Toast">Toast (Polecat)</option>
                <option value="Maple">Maple (Polecat)</option>
                <option value="refinery">refinery (Verification)</option>
                <option value="Shadow">Shadow (Polecat)</option>
                <option value="Clover">Clover (Polecat)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="flex-1 bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
            >
              Dispatch Bead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
