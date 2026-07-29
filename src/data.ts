import { Agent, Bead, Convoy, MailItem } from './types';

export const INITIAL_BEADS: Bead[] = [
  // Open (7)
  { id: 'b1', title: 'Remove shouldFail hook in worker.ts', priority: 'high', type: 'bug', status: 'open', createdAt: 'just now', tags: ['Phase 1'] },
  { id: 'b2', title: 'Implement Network Switch tab', priority: 'medium', type: 'feature', status: 'open', createdAt: 'just now', tags: ['Phase 2B'] },
  { id: 'b3', title: 'Add drag-and-drop & resize handles', priority: 'medium', type: 'feature', status: 'open', createdAt: 'just now', tags: ['Phase 7A'] },
  { id: 'b13', title: 'Add focus trapping & a11y', priority: 'medium', type: 'feature', status: 'open', createdAt: 'just now', tags: ['Phase 7B'] },
  { id: 'b14', title: 'Fix PCA reducer file not found', priority: 'high', type: 'bug', status: 'open', createdAt: 'just now', tags: ['Phase 9A'] },
  { id: 'b15', title: 'Atomic Redis EVAL for governance', priority: 'high', type: 'issue', status: 'open', createdAt: 'just now', tags: ['Phase 9B'] },
  { id: 'b16', title: 'Write 7 pending documentation items', priority: 'low', type: 'issue', status: 'open', createdAt: 'just now', tags: ['Phase 10B'] },
  
  // In Progress (2)
  { id: 'b4', title: 'Review co...', priority: 'medium', type: 'merge_request', status: 'in_progress', createdAt: '13 minutes ago', assignee: 'refinery', tags: ['gt:merge-request'] },
  { id: 'b5', title: 'Investigate persistent black screen...', priority: 'high', type: 'bug', status: 'in_progress', createdAt: '1 minute ago', assignee: 'Toast', tags: ['Hotfix'] },
  
  // In Review (1)
  { id: 'b6', title: 'Provision de...', priority: 'medium', type: 'issue', status: 'in_review', createdAt: '25 minutes ago', assignee: 'Maple' },
  
  // Closed (6)
  { id: 'b7', title: 'Review fe...', priority: 'medium', type: 'merge_request', status: 'closed', createdAt: '20 minutes ago', assignee: 'refinery', tags: ['gt:merge-request'] },
  { id: 'b8', title: 'Ingestion se...', priority: 'medium', type: 'issue', status: 'closed', createdAt: '25 minutes ago', assignee: 'Toast' },
  { id: 'b9', title: 'Fix in-...', priority: 'medium', type: 'issue', status: 'closed', createdAt: '35 minutes ago' },
  { id: 'b10', title: 'Wire Mi...', priority: 'medium', type: 'issue', status: 'closed', createdAt: '35 minutes ago' },
  { id: 'b11', title: 'Add in-...', priority: 'medium', type: 'issue', status: 'closed', createdAt: '35 minutes ago' },
  { id: 'b12', title: 'Hard rat...', priority: 'medium', type: 'issue', status: 'closed', createdAt: '35 minutes ago' }
];

export const INITIAL_AGENTS: Agent[] = [

  { 
    id: 'a3', 
    name: 'Ising', 
    role: 'QPU Calibrator', 
    status: 'idle', 
    hooked: '19ab84f2...', 
    lastActive: 'standing by', 
    lastSleepTime: '1 min ago',
    currentAction: 'Agentic calibration workflow initialized.', 
    icon: 'cpu',
    model: 'NVIDIA Ising Calibration 1.5 (NVFP4)',
    reasoningTokensSpent: 42100,
    promptTokensSpent: 94000,
    completionTokensSpent: 12000,
    totalTasksCompleted: 9,
    temperature: 0.1,
    skills: ['Vision Language Diagnostics', 'Agentic Tuning', 'QPU Calibration'],
    plugins: ['NVFP4 Quantization Engine', 'DGX Spark Allocator'],
    tags: ['VLM', 'Diagnostics', 'QPU'],
    redisDbIndex: 3,
    inStandbyRoom: true,
    agentsMdSynced: true,
    latency: 8,
    healthScore: 100
  },  { 
    id: 'a1', 
    name: 'refinery', 
    role: 'refinery', 
    status: 'idle', 
    hooked: '3935330d...', 
    lastActive: 'standing by', 
    lastSleepTime: '10 mins ago',
    icon: 'shield',
    model: 'deepseek-reasoner',
    reasoningTokensSpent: 48920,
    promptTokensSpent: 128400,
    completionTokensSpent: 32100,
    totalTasksCompleted: 18,
    temperature: 0.2,
    skills: ['Drizzle Schema Migration', 'PCA Reducer Compiler', 'Relational Database Sync'],
    plugins: ['Drizzle DDL Engine', 'Cloud SQL Executor'],
    tags: ['Verified-Trace', 'Postgres-Sync', 'Think-Tokens'],
    redisDbIndex: 1,
    inStandbyRoom: true,
    agentsMdSynced: true,
    latency: 12,
    healthScore: 98
  },
  { 
    id: 'a2', 
    name: 'Toast', 
    role: 'polecat', 
    status: 'idle', 
    hooked: '27ce33d3...', 
    lastActive: 'standing by', 
    lastSleepTime: '2 mins ago',
    currentAction: 'Agent standing by in idle state.', 
    icon: 'robot',
    model: 'grok-3-fast',
    reasoningTokensSpent: 62410,
    promptTokensSpent: 184500,
    completionTokensSpent: 45200,
    totalTasksCompleted: 24,
    temperature: 0.3,
    skills: ['Fail-Open Rate Limiter', 'Middleware Guard Routing', 'Upstash Redis Fallback'],
    plugins: ['Redis Exponential Backoff', 'Upstash Resiliency Shield'],
    tags: ['Resilient-Pipe', 'Fail-Open', 'Rate-Limiter'],
    redisDbIndex: 2,
    inStandbyRoom: true,
    agentsMdSynced: true,
    latency: 15,
    healthScore: 96
  }
];

export const INITIAL_CONVOYS: Convoy[] = [
  {
    id: 'c1',
    title: 'Phase 11: Blockers & Persistent UI Hotfixes',
    branch: 'convoy/phase-11-blockers-and-ui-hotfixes/1cd295...',
    status: 'active',
    completedTasks: 0,
    totalTasks: 5,
    tasks: [
      { id: 't1', title: 'Diagnose black screen...', status: 'active', assignee: 'Toast' },
      { id: 't2', title: 'Remove shouldFail hook...', status: 'pending' },
      { id: 't3', title: 'Implement Network Sw...', status: 'pending' },
      { id: 't4', title: 'Fix PCA reducer...', status: 'pending' },
      { id: 't5', title: 'Redis EVAL governance...', status: 'pending' }
    ]
  }
];

export const INITIAL_MAIL_ITEMS: MailItem[] = [
  {
    id: 'm1',
    from: 'Mayor',
    role: 'Orchestrator',
    subject: 'Phase 11 Convoy Staged & Ready for Dispatch',
    preview: 'Staged convoy "System Memory Sync, Redis Deprecation & Bugfixes" with 7 beads in review-then-land mode.',
    time: '10 mins ago',
    unread: true,
    severity: 'info',
    content: `Greetings Agents,

Phase 11 is now fully staged in **review-then-land mode** across all target container runtimes.

The primary target of this dispatch is immediate system memory synchronization, full validation of the Drizzle Postgres database schema, and complete deprecation of the older Redis rate limiting clusters to optimize system budgets.

### Key Mandates:
1. All workers must stand by in an idle state to capture direct execution signals.
2. Ensure live metrics are pushed directly to the dashboard's fast Redis queue.
3. Validate memory persistence via the local seeding script.

Stand tall, agents. The Mayor is watching.`,
    diff: `+++ package.json (Dependency Hardening Remediations)
@@ -42,3 +42,7 @@
   "overrides": {
+    "tar": "7.5.19",
+    "postcss": "^8.5.18"
   },
   "dependencies": {
+    "react-router-dom": "^8.3.0"`
  },
  {
    id: 'm2',
    from: 'Toast',
    role: 'Polecat Worker',
    subject: 'Investigation: Persistent Black Screen Root Cause Identified',
    preview: 'Found services/agents/worker.ts:343 shouldFail production hook still forcing failure state on root startup.',
    time: '25 mins ago',
    unread: true,
    severity: 'critical',
    content: `Mayor,

My telemetry probes have successfully run static analysis across the Heroku development containers and isolated the root cause for the persistent black screen issue reported by the operators.

A stubborn testing hook at \`services/agents/worker.ts:343\` called \`shouldFail\` was left set to \`true\` in production runtime configurations. This forces the container to immediately crash with an unhandled exception before the frontend UI bundle can mount.

### Diagnostic Breakdown:
- **Location**: \`services/agents/worker.ts\` around lines 341-345
- **Symptoms**: SILENT console crashes during WebSocket handshakes, leading to a perpetual loading state.
- **Recommended Remediation**: Remove this entire checking block entirely so the dev environment can boot smoothly.`,
    diff: `+++ services/agents/worker.ts (Forced startup crash hook deletion)
@@ -340,6 +340,2 @@
- if (process.env.NODE_ENV === "production" && shouldFail) {
-   throw new Error("Forced worker startup failure due to shouldFail hook");
- }`
  },
  {
    id: 'm3',
    from: 'refinery',
    role: 'Verification Agent',
    subject: 'Security Remediation Patch Verification Summary',
    preview: 'Remediation patch generated for tar 7.5.19 and postcss 8.5.18. Awaiting lockfile regeneration upon npm install.',
    time: '1 hour ago',
    unread: false,
    severity: 'warning',
    content: `Attention All Operators,

I have executed a fully automated security and package vulnerability audit on the current lockfiles.

Two package vulnerabilities have been successfully remediated by enforcing strict dependency overrides on the root workspace:
- **tar** (upgraded to \`7.5.19\` to patch prototype pollution vectors)
- **postcss** (upgraded to \`8.5.18\` to remediate regular expression denial of service risks)

### Verification status:
- Overrides configured: **PASSED**
- Build check: **PENDING** lockfile regeneration upon the next execution of \`npm install\`.`,
    diff: `+++ package.json
@@ -52,4 +52,4 @@
   "overrides": {
-    "tar": "6.1.11",
-    "postcss": "^8.4.21"
+    "tar": "7.5.19",
+    "postcss": "^8.5.18"
   }`
  },
  {
    id: 'm4',
    from: 'Ising',
    role: 'QPU Calibrator',
    subject: 'Diagnostic Report: Agentic Calibration of Quantum Processing Unit',
    preview: 'Ising Calibration 1.5 (NVFP4-quantized) completed agentic tuning on unfamiliar diagnostic results without prior training.',
    time: '2 hours ago',
    unread: false,
    severity: 'info',
    content: `Mayor,

My VLM core (NVIDIA Ising Calibration 1.5) has successfully analyzed unfamiliar diagnostic outputs from the central Quantum Processing Unit (QPU). 

Operating as an agentic calibration workflow deployed locally on a single GPU using the NVFP4-quantized release, I determined the required tuning adjustments dynamically without prior training examples. The QPU is now operating at optimal thermal constraints and error rates have been minimized.

I am comparable in performance to leading closed models like Fable 5 and GPT 5.6 Sol, but fully open-source and integrated natively into your system topology.

Awaiting next calibration target.`,
    diff: `+++ qpu_calibration.log (NVFP4 Output)
@@ -10,3 +10,3 @@
- ERR_RATE: 0.045
- THERMAL: CRITICAL
+ ERR_RATE: 0.001
+ THERMAL: NOMINAL
+ CALIBRATION: ISING_1.5_AGENTIC`
  }
];


