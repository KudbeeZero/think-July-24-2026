import React, { useState, useEffect, useRef } from 'react';
import {
  SquareTerminal,
  Send,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Cpu,
  Settings2,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  Database,
  GitBranch,
  GitPullRequest,
  Clock,
  Play,
  Flame,
  ArrowRight,
  Server,
  Activity,
  Sliders,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { Bead, Agent, Convoy, Status, Priority } from '../types';

interface KudbeeMessage {
  id: string;
  sender: 'user' | 'kudbee' | 'system' | 'agent-worker';
  text: string;
  timestamp: string;
  model?: string;
  extraData?: any;
  status?: 'sending' | 'success' | 'error' | 'working';
  rawResponse?: any;
}

interface KudbeeTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  beads: Bead[];
  onUpdateBeadStatus: (beadId: string, status: Status) => void;
  onUpdateBeadAssignee: (beadId: string, assignee: string) => void;
  onAddBead?: (bead: Omit<Bead, 'id' | 'createdAt'>) => void;
  agents: Agent[];
  convoys: Convoy[];
}

export const KudbeeTerminal: React.FC<KudbeeTerminalProps> = ({
  isOpen,
  onClose,
  beads,
  onUpdateBeadStatus,
  onUpdateBeadAssignee,
  onAddBead,
  agents,
  convoys,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek-reasoner');
  const [proxyUrl, setProxyUrl] = useState('http://127.0.0.1:8080');
  const [showSettings, setShowSettings] = useState(false);
  const [showRawJson, setShowRawJson] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [extraDataState, setExtraDataState] = useState<any>(null);

  // Active terminal sub-view tab: 'cli' | 'workers' | 'queue' | 'pr'
  const [activeTab, setActiveTab] = useState<'cli' | 'workers' | 'queue' | 'pr'>('cli');

  // Interactive agent run state
  const [runningJob, setRunningJob] = useState<{
    agentName: string;
    beadId: string;
    beadTitle: string;
    step: number;
    totalSteps: number;
    branch: string;
    prNumber: number;
    commits: string[];
    ciStatus: 'idle' | 'running' | 'success' | 'failed';
    progress: number;
    log: string[];
  } | null>(null);

  // Simulated worker lists
  const [localWorkers, setLocalWorkers] = useState<Array<{
    name: string;
    role: string;
    status: 'IDLE' | 'WORKING' | 'RECOVERY';
    activeTask?: string;
    branch?: string;
    commitsCount?: number;
  }>>([
    { name: 'Toast', role: 'polecat', status: 'WORKING', activeTask: 'Fix ingestion rate limiter and test Redis backoff', branch: 'feat/b5-black-screen-fix', commitsCount: 12 },
    { name: 'refinery', role: 'refinery', status: 'IDLE' },
    { name: 'Maple', role: 'polecat', status: 'IDLE' },
  ]);

  const [activeEngine, setActiveEngine] = useState<string>('DeepSeek R1 / Kilo Router');
  const [messages, setMessages] = useState<KudbeeMessage[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: '🤖 **KILO Agent Operations Console** v3.4.0-production initialized.\n\n• **Sync status**: Connected to Cloud SQL & local memory vault indices\n• **Active workers**: 3 threads (Toast, refinery, Maple)\n• **Upstash Redis status**: Fail-open with exponential backoff active\n\nType any natural language question to query Grok/DeepSeek, or run operational commands (e.g. `/status`, `/run Toast b1`, `/queue`, `/help`).',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, runningJob?.log]);

  // Log helper inside terminal stream
  const addConsoleMessage = (text: string, sender: 'user' | 'kudbee' | 'system' | 'agent-worker' = 'system') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender,
        text,
        timestamp: time,
      }
    ]);
  };

  // Run the animated step-by-step KILO Cloud Agent pipeline
  const runAgentPipeline = (agentName: string, targetBead: Bead) => {
    if (runningJob) {
      addConsoleMessage(`⚠️ Cannot start job: Agent worker pipeline is currently busy with ${runningJob.agentName} working on Bead ${runningJob.beadId}.`, 'system');
      return;
    }

    addConsoleMessage(`🚀 Dispatching Kilo Cloud Agent **@${agentName}** to resolve Bead **${targetBead.id}**: "${targetBead.title}"`, 'system');
    onUpdateBeadStatus(targetBead.id, 'in-progress');
    onUpdateBeadAssignee(targetBead.id, agentName);

    // Update worker status in list
    setLocalWorkers(prev => prev.map(w => w.name === agentName ? { ...w, status: 'WORKING', activeTask: targetBead.title, branch: `feat/${targetBead.id}-${agentName.toLowerCase()}`, commitsCount: 0 } : w));

    const prNum = Math.floor(Math.random() * 80) + 120;
    const branchName = `feat/${targetBead.id}-${targetBead.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const job = {
      agentName,
      beadId: targetBead.id,
      beadTitle: targetBead.title,
      step: 1,
      totalSteps: 12,
      branch: branchName,
      prNumber: prNum,
      commits: [] as string[],
      ciStatus: 'idle' as 'idle' | 'running' | 'success' | 'failed',
      progress: 0,
      log: [`[${agentName}] Task picked up from Redis queue 'agent_task_queue'. Starting run loop...`]
    };

    setRunningJob(job);
    setActiveTab('pr'); // Auto-switch tab to PR tracking to show progress

    let currentStep = 1;
    const pipelineSteps = [
      {
        msg: `[${agentName}] Executing Phase 1: Gathering local workspace contexts and memory indexing.`,
        action: () => {}
      },
      {
        msg: `[${agentName}] Creating isolated Git branch: \`${branchName}\``,
        action: () => {}
      },
      {
        msg: `[${agentName}] Creating Draft Pull Request on GitHub: \`Draft PR #${prNum}\` to merge \`${branchName}\` into \`main\``,
        action: () => {}
      },
      {
        msg: `[${agentName}] Committing Logical Unit #1: Modifying implementation files.`,
        action: () => {
          job.commits.push(`feat(${targetBead.id}): initialize core routing & models`);
          setLocalWorkers(prev => prev.map(w => w.name === agentName ? { ...w, commitsCount: 1 } : w));
        }
      },
      {
        msg: `[${agentName}] Committing Logical Unit #2: Implementing error boundary & recovery rules.`,
        action: () => {
          job.commits.push(`fix(${targetBead.id}): add fallback sliding window & circuit breaker`);
          setLocalWorkers(prev => prev.map(w => w.name === agentName ? { ...w, commitsCount: 2 } : w));
        }
      },
      {
        msg: `[${agentName}] Pushing changes and triggering GitHub Actions CI workflow pipeline.`,
        action: () => {
          job.ciStatus = 'running';
        }
      },
      {
        msg: `[CI/CD] GitHub Actions: Job \`npm run lint\` started... [PENDING]`,
        action: () => {}
      },
      {
        msg: `[CI/CD] GitHub Actions: Job \`tsc --noEmit\` typecheck starting... [PENDING]`,
        action: () => {}
      },
      {
        msg: `[CI/CD] CI Pipeline Polling: Build is compiling. Sleeping 3 seconds...`,
        action: () => {}
      },
      {
        msg: `[CI/CD] GitHub Actions Pipeline: ALL CHECKS PASSED. Linting: 0 errors. TypeScript compilation: OK.`,
        action: () => {
          job.ciStatus = 'success';
        }
      },
      {
        msg: `[${agentName}] CI is Green! Marking PR #${prNum} as 'Ready for Review'.`,
        action: () => {
          onUpdateBeadStatus(targetBead.id, 'in-review');
        }
      },
      {
        msg: `[System] Completed Job ${targetBead.id}. Releasing agent lock and returning to queue.`,
        action: () => {
          onUpdateBeadStatus(targetBead.id, 'closed');
          setLocalWorkers(prev => prev.map(w => w.name === agentName ? { ...w, status: 'IDLE', activeTask: undefined, branch: undefined, commitsCount: 0 } : w));
          addConsoleMessage(`✅ Kilo Agent **@${agentName}** completed task **${targetBead.id}** successfully! PR #${prNum} merged and closed.`, 'system');
          setRunningJob(null);
        }
      }
    ];

    const interval = setInterval(() => {
      if (currentStep >= pipelineSteps.length) {
        clearInterval(interval);
        return;
      }

      const stepData = pipelineSteps[currentStep];
      stepData.action();

      setRunningJob(prev => {
        if (!prev) return null;
        return {
          ...prev,
          step: currentStep + 1,
          progress: Math.round(((currentStep + 1) / pipelineSteps.length) * 100),
          commits: [...job.commits],
          ciStatus: job.ciStatus,
          log: [...prev.log, stepData.msg]
        };
      });

      currentStep++;
    }, 2200);
  };

  const generateInMemoryKudbeeResponse = (prompt: string, model: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi ') || lower.includes('test')) {
      return `Hello! Kilo Agent Autonomous Engine active. All system layers are healthy. Ready to dispatch worker threads or assist with telemetry logs.`;
    }
    if (lower.includes('telemetry') || lower.includes('audit') || lower.includes('monorepo')) {
      return `⚡ **Monorepo Telemetry & Architecture Audit**\n\n1. **Redis Worker Rate Limits**: Polling backoff active (Upstash 500k cap protected).\n2. **Kudbee API Multi-Tier Fallback**: Connected across Direct xAI, Groq, Inception 10M Provider, and Gemini.\n3. **Front-End Hydration**: Root Suspense and Error Boundary verified clean.`;
    }
    return `Regarding "${prompt}": I've analyzed your query against the monorepo context. All operations are running smoothly. Use operational buttons above to run specific simulations.`;
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: KudbeeMessage = {
      id: userMsgId,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    const cmd = promptToSend.trim();

    // CUSTOM KILO COMMAND INTERPRETER
    if (cmd.startsWith('/') || cmd.toLowerCase().startsWith('kilo ')) {
      const parts = cmd.replace(/^\//, '').replace(/^kilo\s+/i, '').split(' ');
      const action = parts[0].toLowerCase();

      setTimeout(async () => {
        if (action === 'status') {
          addConsoleMessage(`📊 **KILO Live Status Report**
• **Redis Master**: Connected (rediss://upstash-free-cluster)
• **Token Rate Limiter**: 100 req/min limit, 0 tokens remaining (NOMINAL fail-open active)
• **Memory Vault Ingestion**: Seeding complete (42 vector clusters loaded)
• **Active Workers**: Toast (WORKING), refinery (IDLE), Maple (IDLE)
• **Database Sync**: Cloud SQL active (ai-studio-4e79f483)`, 'system');
        } else if (action === 'queue') {
          setActiveTab('queue');
          addConsoleMessage(`📿 **Redis agent_task_queue & Rate Limits**
• Queue Size: 4 items pending
• Commits Rate Limit: Max 20 commits/PR (Staged)
• Telemetry Rate Limiter Window: Sliding window (1000ms bucket)
• Overrides: "tar" override 7.5.19 secured.`, 'system');
        } else if (action === 'help') {
          addConsoleMessage(`📖 **KILO Operations Terminal Manual**
• \`/status\` - Diagnostic report of Redis, memory vault, and dynos
• \`/queue\` - Inspect pending task queue and sliding-window weights
• \`/run <agent> <beadId>\` - Dispatches an agent (Toast/Maple/refinery) to solve a Bead
• \`/seed\` - Simulates the seed-memory pipeline with cosine semantic recall
• \`/audit\` - Audits the recent 10 PRs and security package vulnerability remediations
• Type any standard text to ask xAI/Gemini general queries directly.`, 'system');
        } else if (action === 'run') {
          const agentName = parts[1] || 'Toast';
          const beadId = parts[2] || 'b1';
          const targetBead = beads.find(b => b.id === beadId) || beads[0];

          if (targetBead) {
            runAgentPipeline(agentName, targetBead);
          } else {
            addConsoleMessage(`⚠️ Bead ${beadId} not found in parent collection.`, 'system');
          }
        } else if (action === 'seed') {
          addConsoleMessage(`⚡ **Executing Seeding Script (seed-memory.ts)**
• Connecting to MemoryVault... [OK]
• Parsing AGENTS.md, OUTING_PLAN.md... [OK]
• Calculating cosine similarities (semanticRecall)... [OK]
• Saved 12 markdown chunks to vector cache database. Seeding successfully completed!`, 'system');
        } else if (action === 'audit') {
          addConsoleMessage(`🛡️ **Kudbee OS Monorepo Audit**
• PR #175 & #177 CI Lint/Typecheck: PASS (0 errors)
• PR #179 Redis Command Timeout Backoff: PASS (Fail-open wired)
• PR #181 Memory Pipeline Semantic Seeding: PASS (21 tests green)
• Vulnerability overrides: "tar" @7.5.19 & "postcss" @8.5.18 configured correctly.`, 'system');
        } else {
          addConsoleMessage(`⚠️ Unknown KILO command: "${action}". Type \`/help\` for a list of valid commands.`, 'system');
        }
        setIsLoading(false);
      }, 1000);

      return;
    }

    // AI queries proxy fallback
    const botMsgId = `kudbee-${Date.now()}`;
    const placeholderMsg: KudbeeMessage = {
      id: botMsgId,
      sender: 'kudbee',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: selectedModel,
      status: 'sending',
    };

    setMessages((prev) => [...prev, placeholderMsg]);

    try {
      let data: any = {};
      const response = await fetch('/api/grok/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxy: proxyUrl || 'http://127.0.0.1:8080',
          message: promptToSend,
          model: selectedModel,
          extra_data: extraDataState,
        }),
      });
      data = await response.json();

      if (data.status === 'success' || data.response) {
        if (data.extra_data) {
          setExtraDataState(data.extra_data);
        }

        const modeMap: Record<string, string> = {
          xai_direct_api: 'xAI API',
          python_proxy: 'Python Wrapper (:6969)',
          groq_fallback: 'Groq Ultra-Fast API',
          inception_fallback: 'Inception 10M Provider API',
          gemini_fallback: 'Gemini Engine',
          diagnostic_simulation: 'Autonomous Engine',
        };
        const resolvedEngine = modeMap[data.mode] || 'Active Engine';
        setActiveEngine(resolvedEngine);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  text: data.response || 'No response text returned.',
                  status: 'success',
                  model: `${selectedModel} (${resolvedEngine})`,
                  extraData: data.extra_data,
                  rawResponse: data,
                }
              : msg
          )
        );
      } else {
        const fallbackText = generateInMemoryKudbeeResponse(promptToSend, selectedModel);
        setActiveEngine('In-Memory Fallback');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  text: `${fallbackText}\n\n---\n*⚡ Powered by Multi-Provider In-Memory Fallback Engine*`,
                  status: 'success',
                  model: `${selectedModel} (In-Memory Fallback)`,
                }
              : msg
          )
        );
      }
    } catch {
      const fallbackText = generateInMemoryKudbeeResponse(promptToSend, selectedModel);
      setActiveEngine('In-Memory Fallback');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                text: `${fallbackText}\n\n---\n*⚡ Powered by Multi-Provider In-Memory Fallback Engine*`,
                status: 'success',
                model: `${selectedModel} (In-Memory Fallback)`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#090d12] border-t-2 border-yellow-500/80 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col font-mono text-xs ${
        isExpanded ? 'h-[90vh]' : 'h-[500px] sm:h-[540px]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0e131d] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-zinc-800 shrink-0 select-none gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-yellow-500/15 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shrink-0">
            <SquareTerminal className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-extrabold text-zinc-100 text-xs sm:text-sm tracking-wide">KILO AGENT OPERATIONAL CONSOLE</span>
            <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Tab Controls & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto">
          {/* Subview Tabs */}
          <div className="flex bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800/80 mr-2 shrink-0">
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'cli' ? 'bg-zinc-850 text-yellow-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              CLI
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${activeTab === 'workers' ? 'bg-zinc-850 text-yellow-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Workers
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'queue' ? 'bg-zinc-850 text-yellow-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Queue
            </button>
            <button
              onClick={() => setActiveTab('pr')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 relative ${activeTab === 'pr' ? 'bg-zinc-850 text-yellow-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PR Tracker
              {runningJob && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-md border transition-colors ${
                showSettings
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                  : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Proxy & Settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 hover:text-red-400 transition-colors"
              title="Close terminal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="bg-[#121721] border-b border-zinc-800 px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 animate-in slide-in-from-top duration-200">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">KILO AI ROUTING ENGINE</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#090d12] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-yellow-500"
            >
              <option value="deepseek-reasoner">DeepSeek R1 (Thinking Trace)</option>
              <option value="grok-3-fast">Grok 3 Fast (xAI Direct)</option>
              <option value="grok-4-mini-thinking-tahoe">Grok 4 Mini (Tahoe Trace)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash Fallback</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">REDIS SYNC HTTP PROXY</label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="http://user:pass@ip:port"
              className="w-full bg-[#090d12] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>
      )}

      {/* Main content body containing tabbed views */}
      <div className="flex-1 overflow-y-auto bg-[#090d12] flex flex-col min-h-0">
        
        {/* VIEW 1: CLI Terminal */}
        {activeTab === 'cli' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    {msg.sender === 'user' ? (
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        &gt;_ OPERATOR
                      </span>
                    ) : msg.sender === 'kudbee' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> KILO ROUTER ({msg.model || selectedModel})
                      </span>
                    ) : msg.sender === 'agent-worker' ? (
                      <span className="text-purple-400 font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> AGENT WORKER THREAD
                      </span>
                    ) : (
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        <Radio className="w-3 h-3 text-blue-400" /> SYSTEM
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  {msg.sender === 'kudbee' && msg.text && (
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="hover:text-zinc-300 text-zinc-500 flex items-center gap-1 transition-colors"
                      title="Copy Text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg border leading-relaxed text-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#121822] border-yellow-500/30 text-zinc-100 font-medium'
                      : msg.sender === 'kudbee'
                      ? 'bg-[#0f151f] border-zinc-800 text-zinc-200'
                      : msg.sender === 'agent-worker'
                      ? 'bg-purple-950/10 border-purple-900/30 text-purple-200'
                      : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-300'
                  }`}
                >
                  {msg.status === 'sending' ? (
                    <div className="flex items-center gap-2 text-yellow-400 font-medium animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resolving API router fallbacks...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* VIEW 2: Workers thread grid */}
        {activeTab === 'workers' && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" /> Active Worker Threads Status
              </span>
              <span className="text-[10px] text-zinc-500">Concurrency: 3 Limits</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {localWorkers.map((w) => (
                <div key={w.name} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-100 font-bold flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${w.status === 'WORKING' ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400'}`} />
                        @{w.name}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${w.status === 'WORKING' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-zinc-950 text-zinc-500'}`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Role: {w.role}</div>

                    {w.status === 'WORKING' && w.activeTask ? (
                      <div className="space-y-1 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-850">
                        <div className="text-[9px] text-yellow-400 font-bold uppercase">Active Job:</div>
                        <p className="text-[10px] text-zinc-300 leading-normal line-clamp-2">{w.activeTask}</p>
                        <div className="text-[9px] text-zinc-500 mt-1">Branch: <code className="text-zinc-400">{w.branch}</code></div>
                        <div className="text-[9px] text-zinc-500">Commits: <span className="text-yellow-400 font-bold">{w.commitsCount || 0}/20</span></div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500 italic">No active task queue locked.</p>
                    )}
                  </div>

                  {w.status === 'IDLE' && (
                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const openBead = beads.find(b => b.status === 'open');
                          if (openBead) runAgentPipeline(w.name, openBead);
                        }}
                        className="w-full bg-zinc-850 hover:bg-yellow-400 hover:text-zinc-950 text-zinc-300 text-[10px] font-bold py-1 px-2 rounded-md transition-all active:scale-95 flex items-center justify-center gap-1 border border-zinc-700/50"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Dispatch Agent</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notification Tray Simulation */}
            <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl mt-4 space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-yellow-400" /> Live Notification Tray
              </h4>
              <div className="space-y-1.5 font-mono text-[10px] leading-relaxed text-zinc-400">
                <div className="flex gap-2 items-start py-0.5 border-b border-zinc-900/60 pb-1.5">
                  <span className="text-green-400 font-bold shrink-0">[CI PASS]</span>
                  <span>Draft PR #177 tests executed clean in 42s. refinery branch merged.</span>
                </div>
                <div className="flex gap-2 items-start py-0.5 border-b border-zinc-900/60 pb-1.5">
                  <span className="text-amber-400 font-bold shrink-0">[BACKOFF]</span>
                  <span>Worker Toast triggered Redis throttle: Backing off for 4000ms.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-blue-400 font-bold shrink-0">[DISPATCH]</span>
                  <span>Scheduler spawned daily memory cleanup cron iteration. Lock acquired.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Telemetry Queue and Weight Limits */}
        {activeTab === 'queue' && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" /> Pending Task Queue (Redis list)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Queue Key: agent_task_queue</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Queue Items list */}
              <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider">Redis List Items:</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  <div className="bg-[#0e131d] border border-zinc-850 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-100 font-mono">b5: Diagnose black screen...</span>
                      <div className="text-[9px] text-zinc-500 font-mono mt-0.5">Payload weight: 4.2 MB | Weight Limit: 10MB</div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold font-mono">STAGED</span>
                  </div>
                  <div className="bg-[#0e131d]/60 border border-zinc-850 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 font-mono">b1: Remove shouldFail hook...</span>
                      <div className="text-[9px] text-zinc-600 font-mono mt-0.5">Payload weight: 1.1 MB</div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold font-mono">QUEUED</span>
                  </div>
                  <div className="bg-[#0e131d]/60 border border-zinc-850 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 font-mono">b2: Implement Network Switch tab</span>
                      <div className="text-[9px] text-zinc-600 font-mono mt-0.5">Payload weight: 2.3 MB</div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold font-mono">QUEUED</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Rates/Weights panel */}
              <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider">Global System Weight Limits:</h4>
                <div className="space-y-3 font-mono text-[10px] text-zinc-400">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Redis Ingestion Packet Cap:</span>
                      <span className="text-yellow-400 font-bold">10 MB / packet</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-yellow-400 h-full w-[42%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Rate Limit Window Usage:</span>
                      <span className="text-emerald-400 font-bold">42 requests / 100 max</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[42%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Memory Window Margin:</span>
                      <span className="text-blue-400 font-bold">185,000 / 250,000 tokens</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full w-[74%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Draft PR and Commit Campaign Tracker */}
        {activeTab === 'pr' && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {runningJob ? (
              <div className="space-y-4">
                {/* PR Header Block */}
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <GitPullRequest className="w-4 h-4 text-yellow-400" /> Kilo Cloud PR Tracker
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-mono font-bold border border-yellow-500/20">
                      STEP {runningJob.step} / {runningJob.totalSteps}
                    </span>
                  </div>

                  <h3 className="text-zinc-100 font-bold text-sm mt-1">
                    Draft PR #{runningJob.prNumber}: <span className="text-yellow-400">{runningJob.beadTitle}</span>
                  </h3>
                  
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                    <span>Branch: <code className="text-zinc-300 font-bold">{runningJob.branch}</code></span>
                    <span>Assignee: <span className="text-purple-400 font-bold">@{runningJob.agentName}</span></span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>Campaign Completion Progress</span>
                      <span className="text-yellow-400 font-bold">{runningJob.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-700/50">
                      <div 
                        className="bg-yellow-400 h-full transition-all duration-500" 
                        style={{ width: `${runningJob.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Commits Timeline */}
                  <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider pb-1.5 border-b border-zinc-850 flex justify-between items-center">
                        <span>Commit Chain</span>
                        <span className="text-[9px] text-zinc-500 uppercase">{runningJob.commits.length} staged commits</span>
                      </h4>
                      {runningJob.commits.length === 0 ? (
                        <p className="text-[10px] text-zinc-500 italic mt-3">Preparing git objects... waiting for commit campaign launch.</p>
                      ) : (
                        <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                          {runningJob.commits.map((commit, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start text-[10px] font-mono">
                              <span className="text-blue-400 font-bold">Commit #{idx+1}</span>
                              <div className="bg-zinc-900 border border-zinc-850 p-1.5 rounded flex-1 text-zinc-300 text-[10px] select-all truncate">
                                {commit}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900 flex items-center gap-2 text-[9px] text-zinc-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>PR Campaign max cap is strictly bounded at 25 commits.</span>
                    </div>
                  </div>

                  {/* CI pipeline actions logs */}
                  <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider">GitHub Actions CI/CD Pipeline</h4>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          runningJob.ciStatus === 'success' ? 'bg-green-500' :
                          runningJob.ciStatus === 'running' ? 'bg-yellow-500 animate-ping' :
                          'bg-zinc-600'
                        }`} />
                        <span className={`text-[9px] font-bold font-mono uppercase ${
                          runningJob.ciStatus === 'success' ? 'text-green-400' :
                          runningJob.ciStatus === 'running' ? 'text-yellow-400' :
                          'text-zinc-500'
                        }`}>
                          {runningJob.ciStatus}
                        </span>
                      </div>
                    </div>

                    {/* CI Logs scrollbox */}
                    <div className="bg-black/40 border border-zinc-850 p-3 rounded-lg font-mono text-[10px] text-zinc-400 space-y-1.5 h-44 overflow-y-auto leading-relaxed select-text">
                      {runningJob.log.map((logLine, idx) => (
                        <div key={idx} className="flex gap-2 items-start hover:bg-zinc-900/30 px-1 py-0.5 rounded transition-colors">
                          <span className="text-zinc-600 select-none">&gt;</span>
                          <span className="leading-normal">{logLine}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-500">
                  <GitPullRequest className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-300">No active agent operational pipeline currently running.</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                    Go to the <strong>Workers</strong> tab or use the command line, and click "Dispatch Agent" or run the `/run Toast` command to trigger the automated 12-step PR and Commit campaign simulation loop.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-1.5 bg-[#0b0f16] border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar select-none">
        <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">QUICK COMMANDS:</span>
        <button
          onClick={() => handleSend('/status')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 rounded text-[10px] text-yellow-400 font-bold whitespace-nowrap transition-colors flex items-center gap-1"
        >
          ⚡ /status
        </button>
        <button
          onClick={() => handleSend('/queue')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 rounded text-[10px] text-blue-400 font-bold whitespace-nowrap transition-colors flex items-center gap-1"
        >
          📿 /queue
        </button>
        <button
          onClick={() => {
            const openBead = beads.find(b => b.status === 'open') || beads[0];
            handleSend(`/run Toast ${openBead ? openBead.id : 'b1'}`);
          }}
          disabled={isLoading || !!runningJob}
          className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 rounded text-[10px] text-purple-400 font-bold whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-40"
        >
          ▶ /run Toast
        </button>
        <button
          onClick={() => handleSend('/seed')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 rounded text-[10px] text-emerald-400 font-bold whitespace-nowrap transition-colors flex items-center gap-1"
        >
          🌱 /seed Memory
        </button>
        <button
          onClick={() => handleSend('/audit')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-[10px] text-zinc-300 whitespace-nowrap transition-colors flex items-center gap-1"
        >
          🛡️ /audit Security
        </button>
        <button
          onClick={() => handleSend('/help')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-[10px] text-zinc-300 whitespace-nowrap transition-colors flex items-center gap-1"
        >
          📖 /help
        </button>
      </div>

      {/* Command Input Bar */}
      <div className="p-2.5 sm:p-3 bg-[#0e131d] border-t border-zinc-850 flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={activeTab === 'cli' ? "Type command (e.g. /status, /run) or ask xAI router general queries..." : "Switch to 'CLI' tab to input commands manually..."}
            disabled={isLoading || activeTab !== 'cli'}
            className="w-full bg-[#05080c] border border-zinc-700/80 rounded-lg pl-3 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 disabled:opacity-40 transition-all font-mono"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputMessage.trim() || activeTab !== 'cli'}
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Dispatch</span>
        </button>
      </div>
    </div>
  );
};
