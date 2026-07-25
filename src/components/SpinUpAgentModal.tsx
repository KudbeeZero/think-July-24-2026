import React, { useState } from 'react';
import { Bot, X, Sparkles, Cpu, Play, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { Agent } from '../types';

interface SpinUpAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: Agent) => void;
  onRunTestTask: (agentName: string, prompt: string, model: string) => Promise<any>;
}

export const SpinUpAgentModal: React.FC<SpinUpAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
  onRunTestTask
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'polecat' | 'refinery' | 'mayor'>('polecat');
  const [model, setModel] = useState<'deepseek-reasoner' | 'grok-3-fast' | 'inception-v2'>('deepseek-reasoner');
  const [initialTask, setInitialTask] = useState('Inspect repository dependencies and summarize reasoning tokens trace');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [reasoningTrace, setReasoningTrace] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSpinUpAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsExecuting(true);
    setExecutionStatus('running');
    setExecutionOutput(null);
    setReasoningTrace(null);

    // Create the new agent object
    const newAgent: Agent = {
      id: `a_${Date.now()}`,
      name: name.trim(),
      role,
      status: 'working',
      hooked: Math.random().toString(16).substring(2, 10) + '...',
      lastActive: 'Just now',
      currentAction: `Executing test run on ${model}...`,
      icon: role === 'refinery' ? 'shield' : 'robot',
      model,
      reasoningTokensSpent: 0,
      promptTokensSpent: 0,
      completionTokensSpent: 0,
      totalTasksCompleted: 0,
      temperature: 0.2
    };

    onAgentCreated(newAgent);

    try {
      const res = await onRunTestTask(name.trim(), initialTask, model);
      
      setExecutionStatus('success');
      setExecutionOutput(res.response || 'Agent task executed successfully');
      if (res.reasoning) {
        setReasoningTrace(res.reasoning);
      }
    } catch (err: any) {
      setExecutionStatus('error');
      setExecutionOutput(`Task Execution Error: ${err.message || 'Failed to reach API gateway'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12171f] border border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Spin Up Worker Agent
                <span className="text-[10px] font-mono bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                  LIVE TEST ENGINE
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Deploy an isolated worker node with reasoning token capture</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSpinUpAndTest} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Agent Name / Identifier
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amber, Beacon, Sentinel-1"
              className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Agent Role
              </label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500"
              >
                <option value="polecat">Polecat Worker (Tasks & Refactoring)</option>
                <option value="refinery">Refinery Gatekeeper (Code Review & Merge)</option>
                <option value="mayor">Mayor Orchestrator (Sub-task Dispatch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                AI Model & Reasoning Engine
              </label>
              <select
                value={model}
                onChange={(e: any) => setModel(e.target.value)}
                className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500 font-mono"
              >
                <option value="deepseek-reasoner">deepseek-reasoner (R1 Thinking Tokens)</option>
                <option value="grok-3-fast">grok-3-fast (xAI Grok Reasoning Engine)</option>
                <option value="inception-v2">Inception API Worker</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Test Prompt / First Task</span>
              <span className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live Run on Spin-Up
              </span>
            </label>
            <textarea
              rows={2}
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              placeholder="Prompt for initial test execution..."
              className="w-full bg-[#181f2a] border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {/* Test Execution Logs Area */}
          {executionStatus !== 'idle' && (
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-2">
                  {isExecuting ? (
                    <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                  ) : executionStatus === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  {isExecuting ? 'Running AI Provider Query...' : executionStatus === 'success' ? 'Task Completed' : 'Task Error'}
                </span>
                <span className="text-zinc-500">{model}</span>
              </div>

              {reasoningTrace && (
                <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[11px] font-mono text-yellow-300/90 max-h-32 overflow-y-auto custom-scrollbar">
                  <div className="font-bold mb-1 text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Captured Thinking Trace:
                  </div>
                  <pre className="whitespace-pre-wrap">{reasoningTrace}</pre>
                </div>
              )}

              {executionOutput && (
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-200 max-h-40 overflow-y-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap">{executionOutput}</pre>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExecuting}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Spinning Up & Testing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Spin Up & Run Test
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
