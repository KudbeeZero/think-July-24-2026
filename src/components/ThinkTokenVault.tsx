import React, { useState } from 'react';
import { 
  Brain, 
  Search, 
  Filter, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  AlertTriangle,
  Lightbulb,
  Cpu,
  Bookmark,
  Plus,
  Trash2,
  CheckSquare
} from 'lucide-react';

interface ThinkToken {
  id: string;
  beadId?: string;
  provider: string;
  timestamp: string;
  tokensCount: number;
  status: 'stable' | 'challenged' | 'disrupted' | 're-trained';
  conflictHistory: string[];
  trainingLevel: number; // 0 to 100
  resolvedConflicts: number;
  logicCheck: string;
  challengeFactor: string; // "low" | "medium" | "high"
}

export const ThinkTokenVault: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

  // Todo tasks state for organizing agent items
  const [todos, setTodos] = useState<Array<{ id: string; text: string; done: boolean; category: string }>>([
    { id: '1', text: 'Validate Upstash rate limiter under simulated 500k spike', done: true, category: 'Redis' },
    { id: '2', text: 'Wire slide-up terminal console key bindings globally', done: false, category: 'Frontend' },
    { id: '3', text: 'Implement retry backoff logic inside startAgentWorker', done: true, category: 'Backend' },
    { id: '4', text: 'Set up fail-open sliding rate limit window in telemetry router', done: false, category: 'Telemetry' },
    { id: '5', text: 'Audit PR vulnerability mitigations for tar & deep-extend overrides', done: false, category: 'Security' },
  ]);

  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCat, setNewTodoCat] = useState('Frontend');

  // Hardcoded real historical/intercepted think tokens representing solved monorepo conflicts, agent states, etc.
  const [thinkTokens, setThinkTokens] = useState<ThinkToken[]>([
    {
      id: "TOKEN-001",
      beadId: "b1",
      provider: "deepseek-reasoner (120B ChatGPT wrapper)",
      timestamp: "Today, 12:14 AM",
      tokensCount: 1450,
      status: "re-trained",
      conflictHistory: [
        "Challenged by Heroku worker tight BRPOP loop crash.",
        "Disrupted by sudden Upstash 500,000 maximum daily request exhaustion.",
        "Restructured using exponential backoff connection timeouts (2s to 30s) in redis.ts"
      ],
      trainingLevel: 94,
      resolvedConflicts: 2,
      logicCheck: "In-memory circular queues now absorb overflow if Upstash returns 'ERR max requests limit exceeded'.",
      challengeFactor: "high"
    },
    {
      id: "TOKEN-002",
      beadId: "b5",
      provider: "Inception-API (10M contextual canvas)",
      timestamp: "Today, 12:28 AM",
      tokensCount: 4200,
      status: "stable",
      conflictHistory: [
        "Tested against client telemetry polling spam causing black screen under 429 status.",
        "Shielded with MiddlewareGuard on Root Route bypass list."
      ],
      trainingLevel: 88,
      resolvedConflicts: 1,
      logicCheck: "Rate limiting middleware must fail-open to allow root page to fetch basic HTML static assets.",
      challengeFactor: "medium"
    },
    {
      id: "TOKEN-003",
      beadId: "b14",
      provider: "deepseek-reasoner",
      timestamp: "Yesterday, 11:42 PM",
      tokensCount: 840,
      status: "disrupted",
      conflictHistory: [
        "File not found error triggered during PCA dimensionality reduction pipeline execution.",
        "Root cause was relative import resolution mismatch inside the bundle phase."
      ],
      trainingLevel: 45,
      resolvedConflicts: 0,
      logicCheck: "Drizzle / Esbuild bundle format changed to target CJS, bundling relative pathways into dist/server.cjs.",
      challengeFactor: "high"
    },
    {
      id: "TOKEN-004",
      beadId: "b15",
      provider: "GROQ (Llama-3.3-70B)",
      timestamp: "Yesterday, 10:15 PM",
      tokensCount: 310,
      status: "stable",
      conflictHistory: [
        "Atomic Redis EVAL scripts implemented for consensus check during Bead governance votes.",
        "Verified safe concurrency against multiple parallel worker requests."
      ],
      trainingLevel: 99,
      resolvedConflicts: 1,
      logicCheck: "Lua script guarantees atomic verify-then-decrement on rate limit buckets.",
      challengeFactor: "low"
    },
    {
      id: "TOKEN-005",
      beadId: "b13",
      provider: "Inception-API (10M)",
      timestamp: "Yesterday, 08:30 PM",
      tokensCount: 1250,
      status: "challenged",
      conflictHistory: [
        "Keyboard accessibility test failed on slide-up terminal toggle.",
        "Needs focus trapping on background elements to avoid dual-cursor navigation conflicts."
      ],
      trainingLevel: 72,
      resolvedConflicts: 0,
      logicCheck: "React portal added for overlays with clean Tabindex cycle restrictions.",
      challengeFactor: "medium"
    }
  ]);

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo = {
      id: String(Date.now()),
      text: newTodoText,
      done: false,
      category: newTodoCat
    };
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Filter token logic
  const filteredTokens = thinkTokens.filter(t => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.logicCheck.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono bg-[#0d1117] min-h-screen text-zinc-300">
      
      {/* Header Banner */}
      <div className="bg-[#161b22] border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Think Token Vault & Active Roadmap Todo Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time reasoning token registry capturing conflict resolution states, training history, and structural challenges.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Intercepted</div>
              <div className="text-sm font-extrabold text-yellow-400">{thinkTokens.length} Logs</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Active Roadmaps</div>
              <div className="text-sm font-extrabold text-[#e5ff55]">{todos.filter(t => !t.done).length} Pending</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: THINK TOKENS (SPAN 2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-[#161b22] border border-zinc-800 p-3 rounded-xl">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search think tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-zinc-800/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {['all', 'stable', 'challenged', 'disrupted', 're-trained'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                    filterStatus === status
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 shadow-md shadow-yellow-500/5'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Tokens Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTokens.length === 0 ? (
              <div className="col-span-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                <Brain className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                No tokens match the selected filters or query keywords.
              </div>
            ) : (
              filteredTokens.map((t) => (
                <div 
                  key={t.id} 
                  className={`bg-[#161b22] border rounded-xl p-4 flex flex-col justify-between shadow-lg relative ${
                    t.status === 'stable' ? 'border-emerald-500/30 shadow-emerald-950/5' :
                    t.status === 'challenged' ? 'border-yellow-500/30 shadow-yellow-950/5' :
                    t.status === 'disrupted' ? 'border-red-500/30 shadow-red-950/5' :
                    'border-purple-500/30 shadow-purple-950/5'
                  }`}
                >
                  {/* Token Status Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {t.status === 'stable' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> STABLE
                      </span>
                    )}
                    {t.status === 'challenged' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> CHALLENGED
                      </span>
                    )}
                    {t.status === 'disrupted' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1 animate-pulse">
                        <ShieldAlert className="w-2.5 h-2.5" /> DISRUPTED
                      </span>
                    )}
                    {t.status === 're-trained' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5" /> RE-TRAINED
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-zinc-500 text-[10px] font-bold font-mono">ID:</span>
                      <span className="text-zinc-100 font-extrabold text-sm">{t.id}</span>
                      {t.beadId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 font-bold border border-zinc-800">
                          Bead {t.beadId}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mb-3 font-semibold">
                      <Cpu className="w-3.5 h-3.5 text-zinc-500" /> {t.provider}
                    </div>

                    {/* Logic Check description */}
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-850/80 mb-3 text-[11px] leading-relaxed text-zinc-300">
                      <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-yellow-500" /> Reasoning Outcome
                      </div>
                      {t.logicCheck}
                    </div>

                    {/* Conflict history timeline */}
                    <div className="space-y-1.5 mb-4 border-l-2 border-zinc-800 pl-3 py-0.5">
                      <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Conflict Log & Challenges:</div>
                      {t.conflictHistory.map((hist, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-400 leading-relaxed flex items-start gap-1">
                          <span className="text-zinc-600 mt-0.5">•</span>
                          <span>{hist}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footers metrics */}
                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-bold text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>TRAINING LEVEL:</span>
                      <div className="w-16 h-2 bg-zinc-850 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className={`h-full rounded-full ${
                            t.trainingLevel > 80 ? 'bg-emerald-500' :
                            t.trainingLevel > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${t.trainingLevel}%` }}
                        />
                      </div>
                      <span className="text-zinc-300 font-extrabold">{t.trainingLevel}%</span>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded text-zinc-400 border border-zinc-850">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>{t.tokensCount} Tokens</span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE ROADMAP TODO LIST */}
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <span className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#e5ff55]" /> Roadmap Task Organizer
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-500 border border-zinc-850 font-bold">
                  {todos.filter(t => !t.done).length} Pending
                </span>
              </div>

              {/* Add Todo Form */}
              <div className="space-y-2 mb-4 bg-zinc-950/60 border border-zinc-850 p-3 rounded-lg">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Add Roadmap Item:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter task item to track..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    className="flex-1 bg-[#0d1117] border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTodo();
                    }}
                  />
                  <button
                    onClick={handleAddTodo}
                    className="px-2.5 py-1 rounded bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-extrabold text-xs shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3px]" /> ADD
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Category:</span>
                  {['Frontend', 'Backend', 'Telemetry', 'Security', 'Redis'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewTodoCat(cat)}
                      className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded ${
                        newTodoCat === cat 
                          ? 'bg-[#e5ff55]/10 text-[#e5ff55] border border-[#e5ff55]/30' 
                          : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Todos List */}
              <div className="space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                {todos.map((todo) => (
                  <div 
                    key={todo.id} 
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                      todo.done 
                        ? 'bg-zinc-950/40 border-zinc-850/40 opacity-55' 
                        : 'bg-[#121721]/50 border-zinc-800/80 hover:border-zinc-700/80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                        className="mt-0.5 rounded text-yellow-500 bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer w-3.5 h-3.5"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-mono leading-relaxed truncate-2-lines ${todo.done ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                          {todo.text}
                        </p>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-900 text-[8px] font-bold text-zinc-500 uppercase tracking-wide mt-1 font-mono">
                          {todo.category}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 rounded hover:bg-red-500/5 transition-colors shrink-0"
                      title="Remove task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hold standby instructions */}
            <div className="mt-4 pt-3 border-t border-zinc-800/50 bg-[#0d1117]/40 p-3 rounded-lg border border-zinc-850">
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> STANDBY HOLDING INSTRUCTIONS
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed mt-1.5">
                The global worker polling mode is set to <strong>STANDBY</strong>. This suspends all Redis queue BRPOP active checks to ensure zero database spikes. Dispatches are fully controlled and handled on-demand.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
