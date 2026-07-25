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
}

export interface ConvoyTask {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  assignee?: string;
}

export interface Convoy {
  id: string;
  title: string;
  branch: string;
  status: 'staged' | 'active' | 'completed';
  tasks: ConvoyTask[];
  completedTasks: number;
  totalTasks: number;
}
