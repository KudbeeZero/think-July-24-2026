export type Priority = 'low' | 'medium' | 'high';
export type BeadType = 'issue' | 'feature' | 'bug' | 'merge_request';
export type Status = 'open' | 'in_progress' | 'in_review' | 'closed';

export interface Bead {
  id: string;
  title: string;
  priority: Priority;
  type: BeadType;
  status: Status;
  createdAt: string;
  assignee?: string;
  tags?: string[];
  reasoningTokens?: number;
  description?: string;
  rootCause?: string;
  specificFixes?: Array<{
    step: number;
    title: string;
    details: string;
    code?: string;
  }>;
  verificationSteps?: string[];
  relatedBeads?: Array<{
    id: string;
    title: string;
    status: string;
    type: string;
  }>;
  eventTimeline?: Array<{
    event: string;
    time: string;
  }>;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working';
  hooked?: string;
  lastActive: string;
  currentAction?: string;
  icon?: 'robot' | 'shield';
  model?: string;
  reasoningTokensSpent?: number;
  promptTokensSpent?: number;
  completionTokensSpent?: number;
  totalTasksCompleted?: number;
  temperature?: number;
  skills?: string[];
  plugins?: string[];
  tags?: string[];
}

export interface ConvoyTask {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  assignee?: string;
  reasoningTrace?: string;
}

export interface Convoy {
  id: string;
  title: string;
  branch: string;
  status: 'staged' | 'active' | 'completed';
  tasks: ConvoyTask[];
  completedTasks: number;
  totalTasks: number;
  reasoningBudget?: number;
}

export interface TelemetryLog {
  msg?: string;
  event?: string;
  source?: string;
  time?: string;
  timestamp?: string;
  type?: 'system' | 'agent' | 'success' | 'error' | 'reasoning';
  reasoningTokens?: number;
  reasoningContent?: string;
}

export interface ReasoningMetrics {
  totalReasoningTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  tokensPerSec: number;
  activeModel: string;
  budgetTokens: number;
  avgLatencyMs: number;
}

export interface AgentTaskResult {
  id: string;
  agentName: string;
  taskType: string;
  prompt: string;
  response: string;
  reasoningTrace?: string;
  tokensUsed: number;
  latencyMs: number;
  timestamp: string;
  status: 'success' | 'failed' | 'running';
}

export interface FirewallConfig {
  blockPromptInjection: boolean;
  rateLimitByIp: boolean;
}

export interface CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  forceOpen(): Promise<void>; // Direct Redis manipulation
  forceReset(): Promise<void>;
}

export interface BatcherState {
  queueLength: number;
  flushing: boolean;
  batchPending: boolean;
}

export type SSEEventType =
  | 'governance'
  | 'telemetry'
  | 'hermes_suggestion'
  | 'triage'
  | 'slow_brain'
  | 'hermes';

export type RoutingNode =
  | 'INGRESS'
  | 'HERMES'
  | 'GATEWAY'
  | 'SENTINEL'
  | 'CRUCIBLE'
  | 'REDIS'
  | 'LLM';

export interface AuditVaultAnchor {
  id: string;
  hash: string;
  payload: Record<string, any>;
  timestamp: number;
  signature: string;
}

export interface AuditVaultPayload {
  anchors: AuditVaultAnchor[];
  exportHeader: {
    'X-Audit-Hash': string;
    version: '1.0.0';
  };
}

export interface Ed25519VerifyHook {
  verify: (publicKey: Uint8Array, signature: Uint8Array, message: Uint8Array) => Promise<boolean>;
  isVerified: boolean;
  status: 'IDLE' | 'VERIFYING' | 'PROVEN' | 'FAILED';
}

export interface HealthDeepStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  redisSlow: {
    connected: boolean;
    tier: 'Slow DB (Governance & Reasoning)';
    latencyMs: number;
  };
  redisFast: {
    connected: boolean;
    tier: 'Fast DB (Telemetry & SSE)';
    latencyMs: number;
  };
  prunerLock: {
    locked: boolean;
    key: string;
    ttlSeconds: number;
  };
  circuitBreakers: {
    groqBreaker: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    deepseekBreaker: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  };
}

export interface MailItem {
  id: string;
  from: string;
  role: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  content?: string; // Long-form markdown content
  diff?: string;    // Code diffs
  severity?: 'info' | 'warning' | 'critical' | 'escalation';
}

export interface NavHistoryItem {
  nav: string;
  selectedBeadId?: string;
  selectedAgentId?: string;
  selectedConvoyId?: string;
}



