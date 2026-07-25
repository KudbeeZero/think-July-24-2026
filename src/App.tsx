import React, { useState } from 'react';
import { PanelLeft, GitBranch, Settings, Plus, Play, X, Trash2, Hexagon, SquareTerminal, Activity, Crown, Bug, Layout, ChevronDown, ChevronRight, Menu, ArrowLeft, LayoutGrid, Bot, GitMerge, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { INITIAL_BEADS, INITIAL_AGENTS, INITIAL_CONVOYS } from './data';
import { Bead, Agent, Convoy, ConvoyTask } from './types';

function Sidebar() {
  return (
    <div className="w-64 bg-[#0d1117] border-r border-zinc-800/60 flex flex-col h-full shrink-0">
      <div className="p-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 cursor-pointer text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        All towns
      </div>
      
      <div className="px-4 py-2 flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 font-bold">
          <Crown className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-zinc-200 text-sm">Kudbeeville</div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Live
          </div>
        </div>
      </div>

      <div className="px-4 mb-2 text-[10px] font-bold text-zinc-500 tracking-wider">NAVIGATION</div>
      <nav className="flex flex-col gap-0.5 px-2 mb-6">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md">
          <LayoutGrid className="w-4 h-4" /> Overview
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-200 bg-zinc-800/60 rounded-md">
          <Hexagon className="w-4 h-4" /> Beads
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md">
          <Bot className="w-4 h-4" /> Agents
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md">
          <GitMerge className="w-4 h-4" /> Merge Queue
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md">
          <Mail className="w-4 h-4" /> Mail
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md">
          <Activity className="w-4 h-4" /> Observability
        </a>
      </nav>

      <div className="px-4 mb-2 text-[10px] font-bold text-zinc-500 tracking-wider">RIGS</div>
      <nav className="flex flex-col gap-0.5 px-2">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md font-medium">
          <div className="w-5 h-5 rounded bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">k</div>
          Kudbee-fuel-gage
        </a>
      </nav>

      <div className="mt-auto p-4">
        <a href="#" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-200">
          <Settings className="w-4 h-4" /> Settings
        </a>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-[#0d1117] h-16 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-zinc-100 font-semibold text-base flex items-center gap-3">
          <div className="w-4 h-4 rounded-sm border border-zinc-600 flex items-center justify-center bg-zinc-800">
             <div className="w-2 h-2 rounded-sm border border-zinc-400" />
          </div>
          Kudbee-fuel-gage
          <span className="flex items-center gap-1.5 text-xs font-normal text-zinc-400">
            <GitBranch className="w-3.5 h-3.5" />
            main
          </span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-zinc-400 hover:text-zinc-200 p-2 transition-colors">
          <Settings className="w-4.5 h-4.5" />
        </button>
        <button className="flex items-center gap-1.5 bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-medium px-4 py-1.5 rounded text-sm transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New Bead
        </button>
      </div>
    </header>
  );
}

function Summary() {
  const stats = [
    { label: 'OPEN', value: '7', color: 'text-blue-400' },
    { label: 'IN PROGRESS', value: '2', color: 'text-yellow-400' },
    { label: 'IN REVIEW', value: '1', color: 'text-purple-400' },
    { label: 'CLOSED', value: '6', color: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-4 px-6 py-6 border-b border-zinc-800/60 shrink-0">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1">
          <span className={`text-[10px] font-bold tracking-wider ${stat.color}`}>
            {stat.label}
          </span>
          <span className="text-2xl font-semibold text-zinc-100">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}

function ConvoySection({ convoys }: { convoys: Convoy[] }) {
  const [expanded, setExpanded] = useState(true);
  
  if (convoys.length === 0) return null;
  const convoy = convoys[0];

  return (
    <div className="px-4 py-4 border-b border-zinc-800/60">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider mb-4 hover:text-zinc-300 uppercase"
      >
        <Hexagon className="w-3.5 h-3.5" />
        CONVOYS ({convoys.length})
        {expanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
      </button>

      {expanded && (
        <div className="bg-[#161b22] border border-zinc-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded text-purple-400 bg-purple-400/10 border border-purple-400/30">
                CONVOY
              </span>
              <h3 className="text-sm text-zinc-200 font-medium truncate max-w-lg">
                {convoy.title}
              </h3>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 truncate max-w-[200px]">
                <GitBranch className="w-3 h-3" />
                {convoy.branch}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500 font-medium">
                {convoy.completedTasks}/{convoy.totalTasks}
              </span>
              <button className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative pt-2 pb-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 min-w-max">
              <div className="text-[10px] text-zinc-600 font-medium absolute top-0 left-1/3 -translate-x-1/2">
                wave 2
              </div>
              
              {convoy.tasks.map((task, idx) => (
                <React.Fragment key={task.id}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs whitespace-nowrap
                    ${task.status === 'completed' 
                      ? 'border-green-500/30 text-green-400 bg-green-500/10'
                      : task.status === 'active' 
                      ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' 
                      : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    }`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : task.status === 'active' ? (
                      <div className="w-2 h-2 rounded-full border border-yellow-500"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                    {task.title}
                    {task.assignee && (
                      <span className="text-yellow-600/70 ml-1 font-medium">{task.assignee}</span>
                    )}
                  </div>
                  {idx < convoy.tasks.length - 1 && (
                    <div className="w-6 h-px bg-zinc-800 shrink-0 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-zinc-800"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BeadCard({ bead }: { bead: Bead }) {
  return (
    <div className="bg-[#161b22] border border-zinc-800/80 rounded-lg p-3 hover:border-zinc-700 transition-colors group cursor-pointer flex flex-col gap-2 relative">
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-sm text-zinc-200 font-medium leading-tight line-clamp-2">
          {bead.title}
        </h4>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-blue-400 text-xs font-medium tracking-wide">
            {bead.priority}
          </span>
          <button className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-1">
        <span className="px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-[10px] font-medium">
          {bead.type}
        </span>
      </div>

      <div className="text-[10px] text-zinc-500">
        {bead.createdAt}
      </div>

      {bead.assignee && (
        <div className="text-xs text-zinc-500 mt-1">
          assigned <span className="text-zinc-300 font-medium">{bead.assignee}</span>
        </div>
      )}
      
      {bead.tags && bead.tags.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {bead.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 text-zinc-400 w-fit">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon === 'shield' ? Shield : Bot;
  return (
    <div className="bg-[#161b22] border border-zinc-800/80 rounded-lg p-4 relative group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full border border-zinc-700/50 flex items-center justify-center text-zinc-400 bg-[#0d1117]">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm text-zinc-200 font-medium">{agent.name}</h4>
              <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'working' ? 'bg-green-500' : 'bg-zinc-600'}`} />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
              <span className="font-medium text-zinc-400">{agent.role}</span>
              <span className={agent.status === 'working' ? 'text-zinc-400' : 'text-zinc-600'}>{agent.status}</span>
            </div>
          </div>
        </div>
        <button className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {agent.hooked && (
        <div className="text-[11px] text-zinc-500 mt-3 truncate">
          Hooked: <span className="text-zinc-400 font-mono">{agent.hooked}</span>
        </div>
      )}
      <div className="text-[10px] text-zinc-600 mt-1">
        Active {agent.lastActive}
      </div>
      {agent.currentAction && (
        <div className="text-[11px] text-zinc-400 mt-3 italic border-t border-zinc-800/80 pt-2 line-clamp-2 leading-relaxed">
          {agent.currentAction}
        </div>
      )}
    </div>
  );
}

function BeadBoard({ beads }: { beads: Bead[] }) {
  const columns = [
    { id: 'open', label: 'Open', color: 'text-blue-400', count: 7 },
    { id: 'in_progress', label: 'In Progress', color: 'text-yellow-400', count: 2 },
    { id: 'in_review', label: 'In Review', color: 'text-purple-400', count: 1 },
    { id: 'closed', label: 'Closed', color: 'text-green-400', count: 6 },
  ];

  return (
    <div className="flex-1 overflow-x-auto p-4 flex gap-4 min-w-0">
      {columns.map(col => {
        const columnBeads = beads.filter((b) => b.status === col.id);

        return (
          <div key={col.id} className="flex-1 flex flex-col gap-3 min-w-[200px] max-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
                col.id === 'in_progress' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                col.id === 'open' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                col.id === 'in_review' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                'border-green-500/30 text-green-400 bg-green-500/10'
              }`}>
                {col.label}
              </span>
              <span className="text-xs text-zinc-500 font-medium">{col.count}</span>
            </div>
            
            {columnBeads.length === 0 ? (
              <div className="text-xs text-zinc-600 text-center py-4 border border-dashed border-zinc-800/50 rounded-lg">No beads</div>
            ) : (
              <div className="flex flex-col gap-3">
                {columnBeads.map(bead => (
                  <BeadCard key={bead.id} bead={bead} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TerminalPanel() {
  return (
    <div className="w-[320px] bg-[#0d1117] border-l border-zinc-800/80 flex flex-col z-50 font-mono text-[11px] h-full shrink-0">
      {/* Tabs */}
      <div className="flex items-center bg-[#0a0d12] border-b border-zinc-800/80 shrink-0 text-xs">
        <button className="flex items-center gap-2 px-3 py-3 text-zinc-500 hover:text-zinc-300 border-r border-zinc-800/80">
          {'>_'}
        </button>
        <button className="flex items-center gap-2 px-3 py-3 text-zinc-500 hover:text-zinc-300 border-r border-zinc-800/80">
          <Activity className="w-3.5 h-3.5" />
        </button>
        <button className="flex items-center gap-2 px-3 py-3 text-yellow-500 bg-zinc-900/50 border-t-2 border-t-yellow-500 border-r border-zinc-800/80">
          <Crown className="w-3.5 h-3.5" />
        </button>
        <div className="ml-auto flex items-center">
          <button className="p-3 text-zinc-500 hover:text-zinc-300 border-l border-zinc-800/80">
            {'>_'}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-zinc-300 leading-relaxed">
        <div className="flex items-start gap-2">
          <div className="text-zinc-600 shrink-0">⚙</div>
          <div className="text-green-500 flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Connected
          </div>
        </div>

        <div className="space-y-4 pt-2 font-mono text-[11px] leading-relaxed">
          <p>
            <strong className="text-emerald-400">Agent Debugging Session Initialized</strong>
            <br />
            Generating complete markdown prompt for Kilo Cloud Agent: Phase 11 Blockers & Memory Sync...
          </p>
          
          <div className="bg-[#0a0d12] border border-zinc-700/50 rounded-md p-3 relative group mt-4">
            <div className="absolute top-2 right-2 text-[9px] text-zinc-500 font-sans uppercase tracking-wider font-bold">Copy below</div>
            <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-[10px] leading-relaxed select-all">
# 🎯 MISSION: System Memory Sync & Autonomous Rate Limiter Refactor

**Context:** 
We just completed a massive 20-commit hardening sprint, worker loop resilience, memory seeding pipeline, and a black screen hotfix. However, the black screen persists due to a lingering `shouldFail` hook, and previous security remediations were blocked by sandbox network constraints. 

Your mission is to audit our recent history, update our memory files, remove reliance on external rate-limit variables, and package everything into a clean Draft PR.

## 🛠️ Phase 1: Context Gathering & Memory Update
1. **Audit the last 10 PRs** merged into the `main` branch. 
2. **Update the Memory Layer:** Thoroughly update `AGENTS.md`, `OUTING_PLAN.md`, and any other relevant `.md` documentation files to reflect the current architectural state. Ensure the "Top 7 Blockers" are updated based on recent completions.

## 🛠️ Phase 2: Autonomous Redis & Rate Limit Deprecation
We are **completely deprecating** the use of the `REDIS_RATE_LIMIT_URL` environment variable.
1. Strip all dependencies on this specific environment variable across the ingestion server and worker codebases.
2. **Implement Fallback/Autonomy:** You must either:
   - Implement a strict in-memory sliding window fallback for rate limiting.
   - **OR (Preferred):** Utilize your agentic capabilities to autonomously provision a temporary, independent Redis database (72-hour lifecycle) dedicated solely to rate limiting for this worker cluster. Wire the application to use this newly provisioned resource.

## 🛠️ Phase 3: Critical Bug Fixes & Security Remediation
1. **Fix the Black Screen:** Remove the `shouldFail` production hook in `services/agents/worker.ts` (around lines 341-345) to stop the forced frontend failure state.
2. **Apply Pending Security Patches:**
   - Add `"tar": "7.5.19"` and `"postcss": "^8.5.18"` to the root `package.json` overrides.
   - Upgrade `react-router-dom` to `^8.3.0` in `apps/web/package.json`.
3. **Regenerate Lockfiles:** Run `npm install` to properly fetch from the registry and regenerate valid integrity hashes in `package-lock.json`.

## 🚀 Execution Strategy
- **Create a Draft PR** immediately upon starting.
- **Commit frequently** after each logical step.
- Wait for CI checks to pass. If CI fails, sleep and retry or fix the breaking changes.
            </pre>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#4773ff]"></div>
            <span className="text-zinc-300">Code</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">DeepSeek: DeepSeek V4 Pro (lowest price)</span>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 bg-[#0a0d12] border-t border-zinc-800/80">
        <div className="flex bg-[#161b22] border border-zinc-700/50 p-2 text-xs rounded mb-2 h-24 font-mono">
          <div className="text-zinc-600 mr-2">▋</div>
          <div className="flex-1 text-zinc-400 relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#4773ff]">Code</span>
              <span className="text-zinc-300">DeepSeek: DeepSeek V4 Pro (lowest price)</span>
            </div>
            <div className="absolute right-0 top-0 text-zinc-600 text-right leading-tight">
              Kilo<br/>Gatew<br/>ay
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-zinc-500 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-1.5 bg-zinc-600"></div>
              <div className="w-1.5 h-1.5 bg-zinc-600"></div>
              <div className="w-1.5 h-1.5 bg-zinc-600"></div>
              <div className="w-1.5 h-1.5 bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 bg-zinc-800"></div>
            </div>
            <span>62.0K (5%) · $0.07</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">ctrl+p</span>
            <span>commands</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const beads = INITIAL_BEADS;
  const agents = INITIAL_AGENTS;
  const convoys = INITIAL_CONVOYS;

  return (
    <div className="h-screen w-full bg-[#0d1117] text-zinc-200 font-sans flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        <Summary />
        
        <div className="flex-1 overflow-y-auto pb-8">
          <ConvoySection convoys={convoys} />
          
          <div className="flex mt-4 px-2 gap-4">
            {/* Main Board Area */}
            <div className="flex-[3] flex flex-col min-w-0">
              <div className="flex items-center gap-2 px-4 mb-2">
                <Hexagon className="w-3.5 h-3.5 text-zinc-500" />
                <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                  BEAD BOARD
                </h2>
                <span className="text-[10px] text-zinc-600 font-medium ml-auto pr-4">{beads.length}</span>
              </div>
              <BeadBoard beads={beads} />
            </div>

            {/* Agents Sidebar */}
            <div className="flex-1 flex flex-col min-w-[280px] max-w-[320px] border-l border-zinc-800/60 px-4">
              <div className="flex items-center gap-2 mb-4 mt-1">
                <Crown className="w-3.5 h-3.5 text-zinc-500" />
                <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                  AGENTS
                </h2>
                <span className="text-[10px] text-zinc-600 font-medium ml-auto">{agents.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <TerminalPanel />
    </div>
  );
}
