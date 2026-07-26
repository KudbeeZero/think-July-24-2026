import express from 'express';
import os from 'os';

const app = express();
const PORT = 3001;
const START_TIME = Date.now();

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ACTIVE',
    agentName: 'Sub-Agent-Alpha',
    role: 'local_coder',
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    systemInfo: {
      loadavg: os.loadavg(),
      freemem: os.freemem(),
      totalmem: os.totalmem()
    },
    currentTask: 'Compiling local syntax trees and optimizing AST operations.'
  });
});

app.get('/api/think-tokens', (req, res) => {
  // Generate some dynamic tokens based on the current time
  res.json([
    {
      id: `TOKEN-${Date.now()}`,
      beadId: "b-local-1",
      provider: "local-worker-alpha-process",
      timestamp: new Date().toISOString(),
      tokensCount: Math.floor(Math.random() * 500) + 100,
      status: 'stable',
      conflictHistory: ["Resolved local module resolution", "Optimized GC sweeps"],
      trainingLevel: 95,
      resolvedConflicts: 1,
      logicCheck: "Local code AST validation passed.",
      challengeFactor: "low"
    },
    {
      id: `TOKEN-${Date.now() - 10000}`,
      beadId: "b-local-2",
      provider: "local-worker-alpha-process",
      timestamp: new Date(Date.now() - 10000).toISOString(),
      tokensCount: Math.floor(Math.random() * 2000) + 500,
      status: 'challenged',
      conflictHistory: ["Memory spike detected during bundle", "Applied tree-shaking"],
      trainingLevel: 82,
      resolvedConflicts: 1,
      logicCheck: "Bundle size reduced by 14%.",
      challengeFactor: "medium"
    }
  ]);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Worker Agent] Running on http://127.0.0.1:${PORT}`);
});
