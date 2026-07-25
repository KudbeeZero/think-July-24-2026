import React, { useState } from 'react';
import { X, Hexagon, GitBranch, Plus } from 'lucide-react';
import { Convoy } from '../types';

interface NewRigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConvoy: (convoy: Convoy) => void;
}

export function NewRigModal({ isOpen, onClose, onAddConvoy }: NewRigModalProps) {
  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState('convoy/phase-12-sprint');
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tasks = [];
    if (task1.trim()) tasks.push({ id: 't-1', title: task1.trim(), status: 'active' as const, assignee: 'Toast' });
    if (task2.trim()) tasks.push({ id: 't-2', title: task2.trim(), status: 'pending' as const });

    if (tasks.length === 0) {
      tasks.push({ id: 't-1', title: 'Initialize convoy tasks', status: 'active' as const, assignee: 'Toast' });
    }

    onAddConvoy({
      id: `c-${Date.now()}`,
      title: title.trim(),
      branch: branch.trim(),
      status: 'active',
      completedTasks: 0,
      totalTasks: tasks.length,
      tasks,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Create New Convoy / Rig</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Convoy Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Phase 12: Ingestion Server Hardening"
              className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Target Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Initial Tasks (Wave 1)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={task1}
                onChange={(e) => setTask1(e.target.value)}
                placeholder="Task 1 (e.g. Remove shouldFail hook)"
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
              <input
                type="text"
                value={task2}
                onChange={(e) => setTask2(e.target.value)}
                placeholder="Task 2 (e.g. Update memory layers)"
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Deploy Convoy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
