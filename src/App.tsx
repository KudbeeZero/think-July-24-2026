import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  PanelLeft,
  GitBranch,
  Settings,
  Plus,
  Play,
  X,
  Trash2,
  Hexagon,
  SquareTerminal,
  Activity,
  Crown,
  Bug,
  Layout,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowLeft,
  LayoutGrid,
  Bot,
  GitMerge,
  Mail,
  Shield,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Terminal as TerminalIcon,
  Filter,
} from 'lucide-react';
import { INITIAL_BEADS, INITIAL_AGENTS, INITIAL_CONVOYS } from './data';
import { Bead, Agent, Convoy, Status, Priority } from './types';
import { NewBeadModal } from './components/NewBeadModal';
import { BeadDetailModal } from './components/BeadDetailModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { ObservabilityView } from './components/ObservabilityView';
import { MergeQueueView } from './components/MergeQueueView';
import { MailView } from './components/MailView';
import { SettingsView } from './components/SettingsView';
import { AgentsView } from './components/AgentsView';
import { NewRigModal } from './components/NewRigModal';

export default function App() {
  const [beads, setBeads] = useState<Bead[]>(INITIAL_BEADS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [convoys, setConvoys] = useState<Convoy[]>(INITIAL_CONVOYS);

  // Nav view state
  const [activeNav, setActiveNav] = useLocalStorage<string>('activeNav', 'overview');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals & Drawers state
  const [isNewBeadOpen, setIsNewBeadOpen] = useState(false);
  const [isNewRigOpen, setIsNewRigOpen] = useState(false);
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Mobile layout state
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage<boolean>('isSidebarOpen', false);
  const [showTerminalMobile, setShowTerminalMobile] = useState(false);

  // Terminal Copy Feedback
  const [promptCopied, setPromptCopied] = useState(false);

  // Live Telemetry Feed
  const [liveFeed, setLiveFeed] = useState<Array<{msg: string, time: string, type: string}>>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Advanced Upgrade 4: Fallback HTTP long-polling/SSE for WebSocket telemetry
    eventSourceRef.current = new EventSource('/api/telemetry/stream');
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const type = data.source === 'System' ? 'success' : (data.source === 'User' ? 'user' : 'agent');
        
        setLiveFeed(prev => {
          const newEntry = {
            msg: `[${data.source}] ${data.event}`,
            time: 'just now',
            type
          };
          return [newEntry, ...prev].slice(0, 50); // Keep last 50 events
        });
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const KILO_PROMPT_TEXT = `# 🎯 MISSION: System Memory Sync & Autonomous Rate Limiter Refactor

**Context:** 
We just completed a massive 20-commit hardening sprint, worker loop resilience, memory seeding pipeline, and a black screen hotfix. However, the black screen persists due to a lingering \`shouldFail\` hook, and previous security remediations were blocked by sandbox network constraints. 

Your mission is to audit our recent history, update our memory files, remove reliance on external rate-limit variables, and package everything into a clean Draft PR.

## 🛠️ Phase 1: Context Gathering & Memory Update
1. **Audit the last 10 PRs** merged into the \`main\` branch. 
2. **Update the Memory Layer:** Thoroughly update \`AGENTS.md\`, \`OUTING_PLAN.md\`, and any other relevant \`.md\` documentation files to reflect the current architectural state. Ensure the "Top 7 Blockers" are updated based on recent completions.

## 🛠️ Phase 2: Autonomous Redis & Rate Limit Deprecation
We are **completely deprecating** the use of the \`REDIS_RATE_LIMIT_URL\` environment variable.
1. Strip all dependencies on this specific environment variable across the ingestion server and worker codebases.
2. **Implement Fallback/Autonomy:** You must either:
   - Implement a strict in-memory sliding window fallback for rate limiting.
   - **OR (Preferred):** Utilize your agentic capabilities to autonomously provision a temporary, independent Redis database (72-hour lifecycle) dedicated solely to rate limiting for this worker cluster. Wire the application to use this newly provisioned resource.

## 🛠️ Phase 3: Critical Bug Fixes & Security Remediation
1. **Fix the Black Screen:** Remove the \`shouldFail\` production hook in \`services/agents/worker.ts\` (around lines 341-345) to stop the forced frontend failure state.
2. **Apply Pending Security Patches:**
   - Add \`"tar": "7.5.19"\` and \`"postcss": "^8.5.18"\` to the root \`package.json\` overrides.
   - Upgrade \`react-router-dom\` to \`^8.3.0\` in \`apps/web/package.json\`.
3. **Regenerate Lockfiles:** Run \`npm install\` to properly fetch from the registry and regenerate valid integrity hashes in \`package-lock.json\`.

## 🚀 Execution Strategy
- **Create a Draft PR** immediately upon starting.
- **Commit frequently** after each logical step.
- Wait for CI checks to pass. If CI fails, sleep and retry or fix the breaking changes.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(KILO_PROMPT_TEXT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  // Handlers for Beads
  const handleAddBead = async (newBeadData: Omit<Bead, 'id' | 'createdAt'>) => {
    const newBead: Bead = {
      ...newBeadData,
      id: `b${Date.now()}`,
      createdAt: 'just now',
    };
    setBeads([newBead, ...beads]);

    // Send task to the backend agent engine
    try {
      await fetch('/api/agents/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newBeadData.title, payload: newBeadData })
      });
    } catch (e) {
      console.error('Failed to submit task to agent engine:', e);
    }
  };

  const handleUpdateBeadStatus = (beadId: string, newStatus: Status) => {
    setBeads(beads.map((b) => (b.id === beadId ? { ...b, status: newStatus } : b)));
    if (selectedBead && selectedBead.id === beadId) {
      setSelectedBead({ ...selectedBead, status: newStatus });
    }
  };

  const handleUpdateBeadAssignee = (beadId: string, assignee: string) => {
    setBeads(beads.map((b) => (b.id === beadId ? { ...b, assignee } : b)));
    if (selectedBead && selectedBead.id === beadId) {
      setSelectedBead({ ...selectedBead, assignee });
    }
  };

  const handleDeleteBead = (beadId: string) => {
    setBeads(beads.filter((b) => b.id !== beadId));
    if (selectedBead && selectedBead.id === beadId) {
      setSelectedBead(null);
    }
  };

  // Handlers for Agents
  const handleToggleAgentStatus = (agentId: string) => {
    setAgents(
      agents.map((a) =>
        a.id === agentId
          ? {
              ...a,
              status: a.status === 'working' ? 'idle' : 'working',
              lastActive: 'just now',
            }
          : a
      )
    );
  };

  // Handler for Rigs / Convoys
  const handleAddConvoy = (newConvoy: Convoy) => {
    setConvoys([newConvoy, ...convoys]);
  };

  // Filtered Beads
  const filteredBeads = beads.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.assignee && b.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = priorityFilter === 'all' || b.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const openCount = beads.filter((b) => b.status === 'open').length;
  const inProgressCount = beads.filter((b) => b.status === 'in_progress').length;
  const inReviewCount = beads.filter((b) => b.status === 'in_review').length;
  const closedCount = beads.filter((b) => b.status === 'closed').length;

  return (
    <div className="h-[100dvh] w-full bg-[#0d1117] text-zinc-200 font-sans flex overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-64 bg-[#0d1117] border-r border-zinc-800/60 flex flex-col h-full shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex items-center justify-between text-zinc-400 hover:text-zinc-200 cursor-pointer text-sm font-medium">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> All towns
          </div>
          <button className="lg:hidden p-1 text-zinc-500" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 font-bold">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-zinc-200 text-sm">Kudbeeville</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Live
            </div>
          </div>
        </div>

        <div className="px-4 mb-2 text-[10px] font-bold text-zinc-500 tracking-wider">NAVIGATION</div>
        <nav className="flex flex-col gap-0.5 px-2 mb-6">
          <button
            onClick={() => {
              setActiveNav('overview');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'overview'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-yellow-500" /> Overview
          </button>

          <button
            onClick={() => {
              setActiveNav('beads');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'beads'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Hexagon className="w-4 h-4 text-blue-400" /> Beads
            </span>
            <span className="text-xs font-mono text-zinc-500">{beads.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('agents');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'agents'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-green-400" /> Agents
            </span>
            <span className="text-xs font-mono text-zinc-500">{agents.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('merge_queue');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'merge_queue'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <GitMerge className="w-4 h-4 text-purple-400" /> Merge Queue
          </button>

          <button
            onClick={() => {
              setActiveNav('mail');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'mail'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Mail className="w-4 h-4 text-amber-400" /> Mail
          </button>

          <button
            onClick={() => {
              setActiveNav('observability');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'observability'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Activity className="w-4 h-4 text-red-400" /> Observability
          </button>
        </nav>

        <div className="px-4 mb-2 flex items-center justify-between text-[10px] font-bold text-zinc-500 tracking-wider">
          <span>RIGS & CONVOYS</span>
          <button
            onClick={() => setIsNewRigOpen(true)}
            className="hover:text-yellow-400 text-xs transition-colors"
            title="New Rig"
          >
            + New
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 mb-6">
          {convoys.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveNav('overview');
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md font-medium text-left truncate"
            >
              <div className="w-5 h-5 rounded bg-zinc-700/80 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                k
              </div>
              <span className="truncate">{c.title}</span>
            </button>
          ))}
        </nav>

        {/* System Topology Map */}
        <div className="px-4 mb-2 text-[10px] font-bold text-zinc-500 tracking-wider">SYSTEM TOPOLOGY</div>
        <div className="px-4 mb-4 flex justify-center">
          <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full text-zinc-700" style={{ zIndex: 0 }}>
              <line x1="50%" y1="75%" x2="20%" y2="40%" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50%" y1="75%" x2="35%" y2="30%" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50%" y1="75%" x2="50%" y2="25%" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50%" y1="75%" x2="65%" y2="30%" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50%" y1="75%" x2="80%" y2="40%" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            
            {/* Mayor Node */}
            <div className="absolute bottom-[10%] w-16 h-16 rounded-full bg-[#e5ff55] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(229,255,85,0.3)] z-10 border-4 border-[#0d1117]">
              <span className="text-[9px] font-bold text-zinc-950">MAYOR</span>
            </div>
            
            {/* Worker Nodes */}
            <div className="absolute top-[32%] left-[10%] w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10">
              <span className="text-[7px] text-zinc-400 font-medium">Toast</span>
            </div>
            <div className="absolute top-[22%] left-[28%] w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10">
              <span className="text-[7px] text-zinc-400 font-medium">Maple</span>
            </div>
            <div className="absolute top-[17%] left-[50%] -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-800 border-2 border-yellow-500/50 flex flex-col items-center justify-center z-10 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <span className="text-[7px] text-zinc-200 font-medium">refinery</span>
            </div>
            <div className="absolute top-[22%] right-[28%] w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10">
              <span className="text-[7px] text-zinc-400 font-medium">Shadow</span>
            </div>
            <div className="absolute top-[32%] right-[10%] w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center z-10">
              <span className="text-[7px] text-zinc-400 font-medium">Clover</span>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800/60">
          <button
            onClick={() => {
              setActiveNav('settings');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 text-sm w-full transition-colors text-left ${
              activeNav === 'settings' ? 'text-yellow-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/60 bg-[#0d1117]/80 backdrop-blur-md h-14 sm:h-16 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-transform"
            >
              <Menu className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>

            <h1 className="text-zinc-100 font-semibold text-[13px] sm:text-base flex items-center gap-2 sm:gap-3 truncate">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm border border-zinc-600 flex items-center justify-center bg-zinc-800 shrink-0">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm border border-zinc-400" />
              </div>
              <span className="truncate">Kudbee-fuel-gage</span>
              <span className="hidden md:flex items-center gap-1.5 text-xs font-normal text-zinc-400">
                <GitBranch className="w-3.5 h-3.5" />
                main
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowTerminalMobile(!showTerminalMobile)}
              className="xl:hidden p-2 text-zinc-400 hover:text-yellow-400 active:scale-95 transition-all bg-zinc-800/50 rounded-lg border border-zinc-700/50"
              title="Toggle Terminal Panel"
            >
              <TerminalIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <button
              onClick={() => setIsNewBeadOpen(true)}
              className="flex items-center gap-1.5 bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-semibold px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Bead</span>
            </button>
          </div>
        </header>

        {/* View Switcher Output */}
        {activeNav === 'observability' ? (
          <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <ObservabilityView liveFeed={liveFeed} />
          </div>
        ) : activeNav === 'merge_queue' ? (
          <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <MergeQueueView />
          </div>
        ) : activeNav === 'mail' ? (
          <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <MailView />
          </div>
        ) : activeNav === 'settings' ? (
          <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <SettingsView />
          </div>
        ) : activeNav === 'agents' ? (
          <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <AgentsView
              agents={agents}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              onToggleStatus={handleToggleAgentStatus}
            />
          </div>
        ) : (
          /* Overview & Beads Dashboard */
          <div className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
            {/* Stats Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 px-6 py-4 border-b border-zinc-800/60 shrink-0 bg-[#0f141c]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-wider text-blue-400">OPEN</span>
                <span className="text-xl font-semibold text-zinc-100">{openCount}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-wider text-yellow-400">IN PROGRESS</span>
                <span className="text-xl font-semibold text-zinc-100">{inProgressCount}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-wider text-purple-400">IN REVIEW</span>
                <span className="text-xl font-semibold text-zinc-100">{inReviewCount}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-wider text-green-400">CLOSED</span>
                <span className="text-xl font-semibold text-zinc-100">{closedCount}</span>
              </div>
            </div>

            {/* Top Dashboard Row: Chart and Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-zinc-800/60 bg-[#0d1117]">
              {/* Activity Chart */}
              <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-zinc-800/60">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-semibold text-zinc-400 tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    ACTIVITY — 24H
                  </h3>
                  <span className="text-xs font-mono text-zinc-500">200 events</span>
                </div>
                <div className="h-32 w-full flex items-end gap-1 px-1">
                  {[2, 3, 2, 4, 3, 5, 4, 6, 8, 12, 18, 25, 40, 60, 90, 150, 100, 60, 30, 20, 15, 10, 5, 2].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div 
                        className="w-full bg-yellow-500/20 group-hover:bg-yellow-400/80 transition-colors border-t border-yellow-500 rounded-t-sm"
                        style={{ height: `${(val / 150) * 100}%`, minHeight: '4px' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-2 uppercase tracking-wider border-t border-zinc-800/50 pt-2">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>24:00</span>
                </div>
              </div>

              {/* Live Feed Log */}
              <div className="lg:col-span-1 flex flex-col max-h-56">
                <div className="p-4 border-b border-zinc-800/60 sticky top-0 bg-[#0d1117] z-10 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-400 tracking-wider">LIVE FEED</h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 custom-scrollbar">
                  {(liveFeed.length > 0 ? liveFeed : [
                    { msg: 'Bead created: Run npm install, update lockfile', time: 'less than a minute ago', type: 'system' },
                    { msg: 'Bead created: Apply security deps (tar, postcss)', time: 'less than a minute ago', type: 'system' },
                    { msg: 'Bead created: Fix black screen by removing shouldFail', time: '1 min ago', type: 'system' },
                    { msg: 'Bead created: Implement robust in-memory sliding window', time: '2 mins ago', type: 'system' },
                    { msg: 'Bead created: Remove all REDIS_RATE_LIMIT_URL', time: '3 mins ago', type: 'system' },
                    { msg: 'Bead created: Update memory files with PR history', time: '5 mins ago', type: 'system' },
                    { msg: 'Agent Toast hooked bead Phase 11 Sync', time: '10 mins ago', type: 'agent' },
                    { msg: 'Review merged by refinery', time: '1 hour ago', type: 'success' },
                  ]).map((f, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-zinc-800/30 cursor-pointer flex items-center justify-between gap-3 group">
                      <div className="flex items-start gap-2 overflow-hidden">
                        {f.type === 'agent' ? (
                          <Bot className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        ) : f.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-zinc-300 truncate font-medium group-hover:text-yellow-400 transition-colors">{f.msg}</span>
                          <span className="text-[10px] text-zinc-500">{f.time}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Convoys Section */}
            {convoys.length > 0 && (
              <div className="px-4 py-4 border-b border-zinc-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                    <Hexagon className="w-3.5 h-3.5 text-purple-400" />
                    ACTIVE CONVOYS ({convoys.length})
                  </div>
                  <button
                    onClick={() => setIsNewRigOpen(true)}
                    className="text-xs text-yellow-400 hover:underline font-medium"
                  >
                    + Deploy Convoy
                  </button>
                </div>

                <div className="space-y-3">
                  {convoys.map((convoy) => (
                    <div
                      key={convoy.id}
                      className="bg-[#161b22] border border-zinc-800/80 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded text-purple-400 bg-purple-400/10 border border-purple-400/30">
                            CONVOY
                          </span>
                          <h3 className="text-xs sm:text-sm text-zinc-200 font-semibold truncate max-w-sm sm:max-w-md">
                            {convoy.title}
                          </h3>
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">
                          {convoy.completedTasks}/{convoy.totalTasks} tasks
                        </span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {convoy.tasks.map((task, idx) => (
                          <React.Fragment key={task.id}>
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                task.status === 'completed'
                                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                  : task.status === 'active'
                                  ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                                  : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                              }`}
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              ) : task.status === 'active' ? (
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                              {task.title}
                              {task.assignee && (
                                <span className="text-yellow-600/80 ml-1 font-medium">
                                  [{task.assignee}]
                                </span>
                              )}
                            </div>
                            {idx < convoy.tasks.length - 1 && (
                              <span className="text-zinc-600 font-mono text-xs">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Bar & Search */}
            <div className="px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-800/40 bg-[#0d1117]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter beads by title, assignee, or tag..."
                  className="w-full bg-[#161b22] border border-zinc-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-[#161b22] border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High / Blockers</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Main Board & Agents Area */}
            <div className="flex mt-2 px-2 gap-4">
              {/* Kanban Columns */}
              <div className="flex-[3] flex flex-col min-w-0">
                <div className="flex items-center justify-between px-4 py-2">
                  <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
                    <Hexagon className="w-3.5 h-3.5 text-yellow-500" /> BEAD BOARD
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Showing {filteredBeads.length} of {beads.length}
                  </span>
                </div>

                {/* Columns Grid */}
                <div className="flex-1 overflow-x-auto p-4 flex gap-4 min-w-0 snap-x snap-mandatory scroll-px-4 pb-12 sm:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

                    return (
                      <div
                        key={colStatus}
                        className="flex-1 flex flex-col gap-3 min-w-[280px] sm:min-w-[260px] max-w-[320px] sm:max-w-[260px] snap-center shrink-0"
                      >
                        <div className="flex items-center justify-between px-1">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
                              colStatus === 'in_progress'
                                ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                : colStatus === 'open'
                                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                : colStatus === 'in_review'
                                ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                                : 'border-green-500/30 text-green-400 bg-green-500/10'
                            }`}
                          >
                            {label}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">{colBeads.length}</span>
                        </div>

                        {colBeads.length === 0 ? (
                          <div className="text-xs text-zinc-600 text-center py-6 border border-dashed border-zinc-800/80 rounded-lg">
                            No beads
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {colBeads.map((bead) => (
                              <div
                                key={bead.id}
                                onClick={() => setSelectedBead(bead)}
                                className="bg-[#161b22] border border-zinc-800/80 rounded-lg p-3 hover:border-zinc-700 transition-colors group cursor-pointer flex flex-col gap-2 relative shadow-sm"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-xs sm:text-sm text-zinc-200 font-medium leading-snug line-clamp-2">
                                    {bead.title}
                                  </h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBead(bead.id);
                                    }}
                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                    title="Delete Bead"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

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
                                    {bead.priority}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full border border-zinc-700/80 bg-zinc-800/50 text-zinc-400 text-[10px] font-mono">
                                    {bead.type}
                                  </span>
                                </div>

                                {bead.assignee && (
                                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                                    <span>assigned</span>
                                    <span className="text-yellow-400/90 font-semibold">{bead.assignee}</span>
                                  </div>
                                )}

                                {bead.tags && bead.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {bead.tags.map((t) => (
                                      <span
                                        key={t}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Agents Sidebar Panel */}
              <div className="hidden lg:flex flex-col min-w-[280px] max-w-[320px] border-l border-zinc-800/60 px-4">
                <div className="flex items-center justify-between mb-4 mt-2">
                  <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-yellow-500" /> FLEET AGENTS
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">{agents.length}</span>
                </div>

                <div className="flex flex-col gap-3">
                  {agents.map((agent) => {
                    const isWorking = agent.status === 'working';
                    const Icon = agent.icon === 'shield' ? Shield : Bot;

                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        className="bg-[#161b22] border border-zinc-800/80 rounded-lg p-3 hover:border-zinc-700 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full border border-zinc-700/60 flex items-center justify-center text-yellow-400 bg-[#0d1117]">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-zinc-200">{agent.name}</h4>
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isWorking ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'
                                  }`}
                                />
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono">{agent.role}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500">{agent.lastActive}</span>
                        </div>

                        {agent.currentAction && (
                          <p className="text-[11px] text-zinc-400 italic mt-2 font-mono line-clamp-2 bg-[#0d1117]/60 p-2 rounded border border-zinc-800/50">
                            {agent.currentAction}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Terminal Panel */}
      <div
        className={`fixed xl:static inset-y-0 right-0 z-50 w-full sm:w-[400px] xl:w-[340px] bg-[#0d1117] border-l border-zinc-800/80 flex flex-col font-mono text-[11px] h-full shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl xl:shadow-none ${
          showTerminalMobile ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between bg-[#0a0d12] border-b border-zinc-800/80 px-3 sm:px-4 py-3 sm:py-2 shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-xs font-semibold text-yellow-500">
            <SquareTerminal className="w-4 h-4 sm:w-4 sm:h-4 text-yellow-500" />
            <span>Kilo Agent Dispatch Console</span>
          </div>
          <button
            onClick={() => setShowTerminalMobile(false)}
            className="xl:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-300 active:scale-95 transition-transform bg-zinc-900 rounded-lg border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Content Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-zinc-300 leading-relaxed">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-green-400 font-semibold text-[11px]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Mayor Dispatch Operational</span>
            </div>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161b22] hover:bg-zinc-800 border border-zinc-700/60 rounded text-[10px] text-yellow-400 font-semibold transition-colors"
            >
              {promptCopied ? (
                <>
                  <Check className="w-3 h-3 text-green-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Kilo Prompt
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 font-mono text-[10px] leading-relaxed">
            <p className="text-zinc-400">
              <strong className="text-emerald-400">System Status: Front-End Prototype Mode</strong>
              <br />
              Notice: The dashboard is currently running on local mock data for UI/UX rapid prototyping. It is not yet connected to the live Postgres/Redis backend.
            </p>

            <div className="bg-[#0a0d12] border border-zinc-700/60 rounded-md p-3 relative group">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans uppercase font-bold mb-1.5">
                <span>Proposed 15-Commit Roadmap (5 New Upgrades)</span>
                <span className="text-yellow-500">Next Steps</span>
              </div>
              <ul className="text-zinc-300 font-mono text-[10px] leading-relaxed space-y-1 select-all list-none pl-0">
                <li><span className="text-blue-400">feat(api):</span> scaffold Express server with Vite middleware for full-stack architecture</li>
                <li><span className="text-blue-400">feat(telemetry):</span> implement WebSocket listener for real-time agent observability stream</li>
                <li><span className="text-blue-400">feat(db):</span> wire up single-container Postgres schema for ingestion server syncing</li>
                <li><span className="text-blue-400">feat(topology):</span> build interactive SVG node graph for System Topology visualization</li>
                <li><span className="text-blue-400">feat(ui):</span> implement real-time Activity Feed for agent lifecycle events</li>
                <li><span className="text-purple-400">refactor(state):</span> migrate mock data to React Context API to prepare for live backend</li>
                <li><span className="text-blue-400">feat(memory):</span> create Memory Vault UI to inspect semantic recall and vector embeddings</li>
                <li><span className="text-blue-400">feat(auth):</span> add secure environment variable masking and operator authentication</li>
                <li><span className="text-yellow-400">perf(terminal):</span> implement virtualized list for high-throughput log streaming</li>
                <li><span className="text-green-400">style(layout):</span> enhance responsive grid for fluid mobile-to-desktop scaling</li>
                {/* Advanced Upgrades */}
                <li className="pt-2 border-t border-zinc-800/50 mt-2"><span className="text-green-400">build(heroku):</span> <span className="text-zinc-200">complete Express+Vite production build pipeline (server.ts)</span></li>
                <li><span className="text-purple-400">feat(state):</span> <span className="text-zinc-200">implement robust `useLocalStorage` for resilient session caching</span></li>
                <li><span className="text-blue-400">feat(db):</span> <span className="text-zinc-200">provision single-container Drizzle/Postgres ORM setup</span></li>
                <li><span className="text-blue-400">feat(realtime):</span> <span className="text-zinc-200">add fallback HTTP long-polling for WebSocket telemetry</span></li>
                <li><span className="text-green-400">feat(mobile):</span> <span className="text-zinc-200">optimize mobile bottom nav safe-area constraints for PWA support</span></li>
              </ul>
            </div>

            <div className="bg-[#0a0d12] border border-zinc-700/60 rounded-md p-3 relative group mt-4">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans uppercase font-bold mb-1.5">
                <span>Staged Convoy Mission Prompt</span>
                <span className="text-yellow-500">Phase 11 Sync</span>
              </div>
              <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-[10px] leading-relaxed max-h-64 overflow-y-auto select-all">
                {KILO_PROMPT_TEXT}
              </pre>
            </div>
          </div>
        </div>

        {/* Console Input Footer */}
        <div className="p-3 bg-[#0a0d12] border-t border-zinc-800/80 shrink-0">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono">
            <span>Model: DeepSeek V4 Pro</span>
            <span className="text-green-400 font-semibold">CI Green</span>
          </div>
        </div>
      </div>

      {/* Modals & Detail Drawers */}
      <NewBeadModal
        isOpen={isNewBeadOpen}
        onClose={() => setIsNewBeadOpen(false)}
        onAddBead={handleAddBead}
      />

      <NewRigModal
        isOpen={isNewRigOpen}
        onClose={() => setIsNewRigOpen(false)}
        onAddConvoy={handleAddConvoy}
      />

      <BeadDetailModal
        bead={selectedBead}
        onClose={() => setSelectedBead(null)}
        onUpdateStatus={handleUpdateBeadStatus}
        onUpdateAssignee={handleUpdateBeadAssignee}
        onDeleteBead={handleDeleteBead}
      />

      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onToggleStatus={handleToggleAgentStatus}
      />
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-[calc(68px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[#0d1117]/95 backdrop-blur-lg border-t border-zinc-800/80 z-40 flex items-center justify-around px-2">
        <button 
          onClick={() => { setActiveNav('overview'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-colors ${activeNav === 'overview' ? 'text-yellow-400' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-wide">Overview</span>
        </button>
        <button 
          onClick={() => { setActiveNav('beads'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-colors relative ${activeNav === 'beads' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <Hexagon className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-wide">Beads</span>
          <span className="absolute top-1 right-2 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <button 
          onClick={() => { setActiveNav('agents'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-colors ${activeNav === 'agents' ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-wide">Agents</span>
        </button>
        <button 
          onClick={() => { setActiveNav('mail'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-colors relative ${activeNav === 'mail' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-wide">Mail</span>
          <span className="absolute top-1 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        </button>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="flex flex-col items-center justify-center w-16 h-full gap-1.5 text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-wide">More</span>
        </button>
      </div>
    </div>
  );
}
