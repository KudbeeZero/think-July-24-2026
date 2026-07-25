import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
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
  
  // Here we would implement the specific worker polling logic against the queue
  // For now, we simulate a standalone worker polling the agentRedisClient
  
  setInterval(async () => {
    try {
      // Simulate polling a queue
      // const job = await agentRedisClient.brPop('agent_queue', 10);
      console.log(`[${agentName}] Polling for tasks...`);
    } catch (e) {
      console.error(`[${agentName}] Error in worker loop`, e);
    }
  }, 5000);
}

async function startServer() {
  await connectRedis();
  engine.start();

  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

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
  app.post("/api/agents/task", (req, res) => {
    const { type, payload } = req.body;
    if (!type) {
      return res.status(400).json({ error: "Task type required" });
    }
    engine.submitTask(type, payload || {});
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
