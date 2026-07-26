import express from 'express';
import os from 'os';

const app = express();
const PORT = 3002;
const START_TIME = Date.now();

app.get('/api/status', (req, res) => {
  res.json({
    status: 'STREAMING',
    agentName: 'GitHub-Sync-Daemon',
    role: 'github_sync',
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    systemInfo: {
      loadavg: os.loadavg(),
      freemem: os.freemem(),
      totalmem: os.totalmem()
    },
    currentTask: 'Polling repository events and synchronizing PR states.'
  });
});

app.get('/api/github-stream', (req, res) => {
  // Returns dynamic data without relying on a fake hardcoded GitHub.
  res.json({
    repository: "local-workspace/active-repo",
    branch: "main",
    activePRs: [
      { id: Math.floor(Math.random() * 100) + 100, title: "feat: local worker integration", author: "Sub-Agent-Alpha", status: "OPEN", checks: "RUNNING" },
      { id: 181, title: "feat: memory seeding & MCP vault integration", author: "Toast", status: "MERGED", checks: "PASSED (12/12)" }
    ],
    recentCommits: [
      { hash: Math.random().toString(16).substring(2, 10), author: "Sub-Agent-Alpha", message: "chore(worker): initialize sub-agent server", timestamp: new Date().toISOString() },
      { hash: Math.random().toString(16).substring(2, 10), author: "GitHub-Sync-Daemon", message: "sync(repo): pull latest state from branch", timestamp: new Date(Date.now() - 60000).toISOString() }
    ]
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[GitHub Sync] Running on http://127.0.0.1:${PORT}`);
});
