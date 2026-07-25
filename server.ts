import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { AgentEngine } from "./src/server/engine";
import { connectRedis, mainRedisClient, agentRedisClient } from "./src/server/redis";
import { db } from "./src/db/main";
import { agentDb } from "./src/db/agent";

dotenv.config();

const engine = new AgentEngine();

async function startAgentWorker(agentName: string) {
  await connectRedis();
  console.log(`[Worker] Started isolated agent environment for: ${agentName}`);
  console.log(`[Worker] Using Groq Key: ${process.env.GROQ_API_KEY ? 'Set' : 'Unset'}`);
  console.log(`[Worker] Using Inception Key: ${process.env.INCEPTION_API_KEY ? 'Set' : 'Unset'}`);
  
  let backoffMs = 2000;
  
  while (true) {
    try {
      if (!agentRedisClient.isOpen) {
         await new Promise(resolve => setTimeout(resolve, 5000));
         continue;
      }

      const job = await agentRedisClient.brPop('agent_task_queue', 5);
      
      if (job) {
        backoffMs = 2000;
        const task = JSON.parse(job.element);
        console.log(`[${agentName}] Picked up task:`, task.type);
        
        if (task.type === 'inception_query') {
           const apiKey = process.env.INCEPTION_API_KEY;
           
           await mainRedisClient.publish('telemetry_stream', JSON.stringify({
             source: agentName,
             event: `Initializing Inception API Protocol... (Key: ${apiKey ? 'Valid' : 'Missing'})`
           }));
           
           await new Promise(resolve => setTimeout(resolve, 2000));
           
           const resultEvent = apiKey 
             ? `Processed payload via Inception API: "${task.payload}"`
             : `Failed: Inception API key is missing. Could not process "${task.payload}"`;
           
           await mainRedisClient.publish('telemetry_stream', JSON.stringify({
             source: agentName,
             event: resultEvent
           }));
        } else {
           await mainRedisClient.publish('telemetry_stream', JSON.stringify({
             source: agentName,
             event: `Completed generic task: ${task.type}`
           }));
        }
      }
    } catch (e: any) {
      console.error(`[${agentName}] Error in worker loop:`, e.message);
      if (e.message.includes('max requests limit exceeded')) {
        console.warn(`[${agentName}] Rate limit hit. Backing off for ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        backoffMs = Math.min(backoffMs * 2, 30000);
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

async function startServer() {
  await connectRedis();
  engine.start();
  
  // Start the Grok API Python Server
  console.log('Starting Grok API Server...');
  const grokServer = spawn('python3', ['services/grok-api/api_server.py'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  grokServer.on('error', (err) => {
    console.error('Failed to start Grok API server:', err);
  });

  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // Grok API proxy
  app.post('/api/grok/ask', async (req, res) => {
    try {
      const response = await fetch('http://localhost:6969/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e: any) {
      res.status(500).json({ error: 'Grok API is unreachable or failed: ' + e.message });
    }
  });

  // === Advanced Upgrade 1: API Telemetry Routes ===
  app.get("/api/telemetry/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Client connected clients for SSE
  let clients: any[] = [];

  // Listen to engine logs and broadcast to all connected SSE clients
  engine.on('log', (logEntry) => {
    const data = JSON.stringify(logEntry);
    clients.forEach(client => {
      client.res.write(`data: ${data}\n\n`);
    });
  });

  // Subscribe to Redis pub/sub for cross-worker telemetry
  if (mainRedisClient.isOpen) {
    const subClient = mainRedisClient.duplicate();
    subClient.connect().then(() => {
      subClient.subscribe('telemetry_stream', (message) => {
        try {
          const logEntry = JSON.parse(message);
          const data = JSON.stringify(logEntry);
          clients.forEach(client => {
             client.res.write(`data: ${data}\n\n`);
          });
        } catch (e) {
          console.error('Failed to parse telemetry stream message', e);
        }
      });
    }).catch(console.error);
  }

  // Server-Sent Events endpoint for real-time telemetry
  app.get("/api/telemetry/stream", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    // Send an initial connected message
    res.write(`data: ${JSON.stringify({ source: 'System', event: 'Connected to Kilo Agent Engine Telemetry' })}\n\n`);

    req.on('close', () => {
      clients = clients.filter(client => client.id !== clientId);
    });
  });

  // Endpoint to submit a task to the agents
  app.post("/api/agents/task", async (req, res) => {
    const { type, payload } = req.body;
    if (!type) {
      return res.status(400).json({ error: "Task type required" });
    }
    
    if (type === 'inception_query' || type === 'external_worker') {
      if (mainRedisClient.isOpen) {
        await mainRedisClient.lPush('agent_task_queue', JSON.stringify({ type, payload }));
        engine.emit('log', { source: 'System', event: `Queued distributed task: ${type}` });
      } else {
        return res.status(503).json({ error: "Redis disconnected, cannot queue worker task" });
      }
    } else {
      engine.submitTask(type, payload || {});
    }
    
    res.json({ success: true, message: `Task ${type} submitted` });
  });

  // Mock telemetry endpoint for UI (legacy)
  app.post("/api/telemetry/ingest", (req, res) => {
    const { event, source } = req.body;
    engine.emit('log', { source: source || 'UI', event });
    res.json({ success: true });
  });

  // === Advanced Upgrade 2: Vite Middleware for Development ===
  if (process.env.NODE_ENV !== "production") {
    // Development mode: Use Vite's middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0" as any, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

const args = process.argv.slice(2);
const agentArg = args.find(arg => arg.startsWith('--agent='));

if (agentArg) {
  const agentName = agentArg.split('=')[1];
  startAgentWorker(agentName).catch(err => {
    console.error(`Failed to start agent ${agentName}:`, err);
  });
} else {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
