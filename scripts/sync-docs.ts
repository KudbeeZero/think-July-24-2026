import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_BEADS, INITIAL_AGENTS, INITIAL_CONVOYS } from '../src/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function syncDocs() {
  const timestamp = new Date().toISOString();

  // Categorize Beads
  const openBeads = INITIAL_BEADS.filter((b) => b.status === 'open');
  const inProgressBeads = INITIAL_BEADS.filter((b) => b.status === 'in_progress');
  const inReviewBeads = INITIAL_BEADS.filter((b) => b.status === 'in_review');
  const closedBeads = INITIAL_BEADS.filter((b) => b.status === 'closed');

  // Categorize Agents
  const activeAgents = INITIAL_AGENTS.filter((a) => a.status === 'working');
  const idleAgents = INITIAL_AGENTS.filter((a) => a.status === 'idle');

  // Format Auto-Synced Section for AGENTS.md
  const agentsBeadsSection = `<!-- AUTO-SYNC-START -->
## Current Active Roster & Work Items (Auto-Synced)
*Last Synced: ${timestamp}*

### 🤖 Agent Status (${INITIAL_AGENTS.length} Total)
${INITIAL_AGENTS.map(
  (a) =>
    `- **${a.name}** (\`${a.role}\`) - Status: **${a.status.toUpperCase()}**${
      a.currentAction ? ` — *${a.currentAction}*` : ''
    }${a.hooked ? ` [Hooked: \`${a.hooked}\`]` : ''}`
).join('\n')}

### 📿 Active & Open Beads Breakdown (${INITIAL_BEADS.length} Total)
- **Open (${openBeads.length}):** ${openBeads.map((b) => `\`${b.id}\` ${b.title} [${b.priority}]`).join(', ')}
- **In Progress (${inProgressBeads.length}):** ${inProgressBeads
    .map((b) => `\`${b.id}\` ${b.title} (Assigned: ${b.assignee || 'Unassigned'})`)
    .join(', ')}
- **In Review (${inReviewBeads.length}):** ${inReviewBeads
    .map((b) => `\`${b.id}\` ${b.title} (Assigned: ${b.assignee || 'Unassigned'})`)
    .join(', ')}
- **Closed (${closedBeads.length}):** ${closedBeads.map((b) => `\`${b.id}\``).join(', ')}

### 🚚 Active Convoys
${INITIAL_CONVOYS.map(
  (c) =>
    `- **${c.title}** (\`${c.branch}\`) [${c.completedTasks}/${c.totalTasks} Tasks Completed]\n` +
    c.tasks.map((t) => `  - [${t.status === 'completed' ? 'x' : ' '}] ${t.title}${t.assignee ? ` (@${t.assignee})` : ''}`).join('\n')
).join('\n')}
<!-- AUTO-SYNC-END -->`;

  // Update AGENTS.md
  const agentsMdPath = path.join(rootDir, 'AGENTS.md');
  if (fs.existsSync(agentsMdPath)) {
    let content = fs.readFileSync(agentsMdPath, 'utf-8');
    if (content.includes('<!-- AUTO-SYNC-START -->') && content.includes('<!-- AUTO-SYNC-END -->')) {
      content = content.replace(/<!-- AUTO-SYNC-START -->[\s\S]*?<!-- AUTO-SYNC-END -->/, agentsBeadsSection);
    } else {
      content += `\n\n---\n\n${agentsBeadsSection}\n`;
    }
    fs.writeFileSync(agentsMdPath, content, 'utf-8');
    console.log('✅ AGENTS.md updated successfully.');
  }

  // Build full OUTING_PLAN.md content
  const outingPlanContent = `# Kilo Convoy & Bead Outing Plan

> **Auto-Generated Documentation**: This outing plan is programmatically synced with \`INITIAL_BEADS\`, \`INITIAL_AGENTS\`, and \`INITIAL_CONVOYS\` in \`src/data.ts\`.

**Last Sync Timestamp**: \`${timestamp}\`

---

## 🎯 Active Convoys & Task Missions

${INITIAL_CONVOYS.map(
  (convoy) => `### 🚚 ${convoy.title}
- **Branch**: \`${convoy.branch}\`
- **Status**: \`${convoy.status}\`
- **Progress**: ${convoy.completedTasks} / ${convoy.totalTasks} tasks completed

#### Convoy Tasks Checklist:
${convoy.tasks
  .map(
    (task) =>
      `- [${task.status === 'completed' ? 'x' : ' '}] **${task.title}** — Status: \`${task.status}\`${
        task.assignee ? ` | Assignee: **@${task.assignee}**` : ''
      }`
  )
  .join('\n')}
`
).join('\n')}

---

## 🤖 Active Agent Network

### Working Agents (${activeAgents.length})
${
  activeAgents.length > 0
    ? activeAgents
        .map(
          (agent) =>
            `- **${agent.name}** (\`${agent.role}\`)\n  - Hooked Commit: \`${agent.hooked || 'N/A'}\`\n  - Last Active: ${agent.lastActive}\n  - Current Focus: ${
              agent.currentAction || 'Processing task queue...'
            }`
        )
        .join('\n')
    : '_No agents currently working._'
}

### Idle / Standby Agents (${idleAgents.length})
${
  idleAgents.length > 0
    ? idleAgents
        .map((agent) => `- **${agent.name}** (\`${agent.role}\`) — Last Active: ${agent.lastActive}`)
        .join('\n')
    : '_No idle agents._'
}

---

## 📿 Beads Backlog & Outing Status

### 🔴 High Priority / Open Beads (${openBeads.length})
${openBeads
  .map(
    (bead) =>
      `| \`${bead.id}\` | **${bead.title}** | Priority: \`${bead.priority}\` | Type: \`${bead.type}\` | Tags: ${bead.tags?.map((t) => `\`${t}\``).join(', ') || 'None'} |`
  )
  .join('\n')}

### 🟡 In Progress Beads (${inProgressBeads.length})
${inProgressBeads
  .map(
    (bead) =>
      `- \`${bead.id}\` **${bead.title}** — Priority: \`${bead.priority}\` | Assignee: **@${
        bead.assignee || 'Unassigned'
      }** | Created: ${bead.createdAt}`
  )
  .join('\n')}

### 🔵 In Review Beads (${inReviewBeads.length})
${inReviewBeads
  .map(
    (bead) =>
      `- \`${bead.id}\` **${bead.title}** — Priority: \`${bead.priority}\` | Assignee: **@${
        bead.assignee || 'Unassigned'
      }**`
  )
  .join('\n')}

### 🟢 Closed / Resolved Beads (${closedBeads.length})
${closedBeads.map((bead) => `- \`${bead.id}\` ~~${bead.title}~~`).join('\n')}

---
*Generated automatically via \`npm run sync:docs\`*.
`;

  const outingPlanPath = path.join(rootDir, 'OUTING_PLAN.md');
  fs.writeFileSync(outingPlanPath, outingPlanContent, 'utf-8');
  console.log('✅ OUTING_PLAN.md generated/updated successfully.');
}

// Execute if run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('sync-docs.ts')) {
  syncDocs();
}
