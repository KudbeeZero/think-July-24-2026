import { Agent, Bead, Convoy } from './types';

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
  { id: 'a1', name: 'refinery', role: 'refinery', status: 'working', hooked: '3935330d...', lastActive: 'less than a minute ago', icon: 'shield' },
  { id: 'a2', name: 'Toast', role: 'polecat', status: 'working', hooked: '27ce33d3...', lastActive: 'less than a minute ago', currentAction: 'Analyzing production hooks and persistent black screen issue...', icon: 'robot' },
  { id: 'a3', name: 'Maple', role: 'polecat', status: 'idle', lastActive: '12 minutes ago', icon: 'robot' }
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

