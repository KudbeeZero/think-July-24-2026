import { EventEmitter } from 'events';

export type AgentRole = 'orchestrator' | 'worker' | 'verifier';

export interface Task {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedTo?: string;
}

export class AgentEngine extends EventEmitter {
  private tasks: Task[] = [];
  private agents: Map<string, { role: AgentRole; status: 'idle' | 'busy' }> = new Map();
  private isRunning = false;

  constructor() {
    super();
    this.registerAgent('Mayor', 'orchestrator');
    this.registerAgent('Toast', 'worker');
    this.registerAgent('Refinery', 'verifier');
  }

  registerAgent(name: string, role: AgentRole) {
    this.agents.set(name, { role, status: 'idle' });
    this.emit('log', { source: 'System', event: `Agent \${name} (\${role}) registered and online.` });
  }

  submitTask(type: string, payload: any) {
    const task: Task = {
      id: Math.random().toString(36).substring(7),
      type,
      payload,
      status: 'pending'
    };
    this.tasks.push(task);
    this.emit('log', { source: 'User', event: `Submitted task: \${type}` });
    this.emit('task_update', task);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.emit('log', { source: 'System', event: 'Agent Engine started. Monitoring queue...' });
    this.loop();
  }

  stop() {
    this.isRunning = false;
    this.emit('log', { source: 'System', event: 'Agent Engine stopped.' });
  }

  private async loop() {
    while (this.isRunning) {
      this.processQueue();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Tick every 2 seconds
    }
  }

  private processQueue() {
    // Mayor assigns tasks
    const pendingTasks = this.tasks.filter(t => t.status === 'pending');
    for (const task of pendingTasks) {
      if (task.type === 'orchestrate' || task.type.startsWith('mission')) {
         this.assignTask(task, 'Mayor');
      } else if (task.type === 'verify' || task.type === 'lint') {
         this.assignTask(task, 'Refinery');
      } else {
         this.assignTask(task, 'Toast');
      }
    }
  }

  private async assignTask(task: Task, preferredAgent: string) {
    const agent = this.agents.get(preferredAgent);
    if (agent && agent.status === 'idle') {
      agent.status = 'busy';
      task.status = 'running';
      task.assignedTo = preferredAgent;
      this.emit('task_update', task);
      this.emit('log', { source: preferredAgent, event: `Started working on task: \${task.type} (\${task.id})` });

      // Simulate work execution
      await this.executeScript(preferredAgent, task);

      agent.status = 'idle';
      task.status = 'completed';
      this.emit('task_update', task);
      this.emit('log', { source: preferredAgent, event: `Completed task: \${task.type} (\${task.id})` });
    }
  }

  private async executeScript(agentName: string, task: Task) {
    // Simulate real script execution time and internal logs
    return new Promise<void>(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        this.emit('log', { source: agentName, event: `[\${task.id}] Executing script... \${progress}% complete` });
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  getQueueState() {
    return this.tasks;
  }
}
