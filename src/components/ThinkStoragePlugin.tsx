import React, { useState, useEffect } from 'react';
import { Database, Brain, HardDrive, RefreshCw, Check, AlertTriangle, ArrowDownRight, Layers } from 'lucide-react';

export interface MemoryRecallItem {
  id: string;
  topic: string;
  content: string;
  score: number;
  timestamp: string;
}

export const ThinkStoragePlugin: React.FC = () => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<MemoryRecallItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SAVED' | 'ERROR'>('IDLE');

  const handleRecall = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Line 45 Fix: Clean syntax with proper closing parenthesis and semicolon
      const res = await fetch(`/api/memory/recall?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const list: MemoryRecallItem[] = data?.results || [
        {
          id: 'mem_001',
          topic: 'Suboxone Effect',
          content: 'Dual-Redis workload segregation decoupling volatile telemetry from governance ledger',
          score: 0.98,
          timestamp: new Date().toISOString()
        },
        {
          id: 'mem_002',
          topic: 'BraiNCA 7-Node Matrix',
          content: 'INGRESS -> HERMES -> GATEWAY -> SENTINEL -> CRUCIBLE -> REDIS -> LLM routing pipeline',
          score: 0.94,
          timestamp: new Date().toISOString()
        }
      ];
      setItems(list);
      setStatus('SAVED');
    } catch (err) {
      console.error('[ThinkStoragePlugin] Recall error:', err);
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch simulation
    handleRecall();
  }, []);

  return (
    <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              KUD-THINK Storage Plugin
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">Semantic Recall Engine & Memory Vault Bridge</p>
          </div>
        </div>
        <button
          onClick={handleRecall}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 border border-zinc-700/60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
          Sync Memory
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRecall()}
            placeholder="Query semantic memory vault (e.g., 'Suboxone Effect', 'Dual Redis')..."
            className="w-full bg-[#0d1117] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60 font-mono"
          />
        </div>
        <button
          onClick={handleRecall}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <HardDrive className="w-3.5 h-3.5" />
          Recall
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[#0d1117] border border-zinc-800/90 rounded-lg p-3 hover:border-zinc-700/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-purple-300 font-mono flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-purple-400" />
                {item.topic}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {(item.score * 100).toFixed(0)}% Similarity
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-mono">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
