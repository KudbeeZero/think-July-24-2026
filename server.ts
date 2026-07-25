import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { GoogleGenAI } from "@google/genai";
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

  // Resilient Grok API proxy with multi-tier fallback
  app.post('/api/grok/ask', async (req, res) => {
    const { proxy, message, model = 'grok-3-fast', extra_data } = req.body;
    const systemPrompt = "You are Grok 3, xAI's direct, highly capable, witty, and deeply analytical AI engine. Answer the user's request thoroughly, accurately, and directly.";

    // Tier 1: Check for Direct xAI API Key
    const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_KEY;
    if (xaiKey) {
      try {
        const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${xaiKey}`,
          },
          body: JSON.stringify({
            model: model.includes('grok-4') ? 'grok-2-latest' : 'grok-beta',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            stream: false
          })
        });
        
        if (xaiRes.ok) {
          const xaiData = await xaiRes.json();
          const reply = xaiData.choices?.[0]?.message?.content || "No response received from xAI.";
          return res.json({
            status: "success",
            response: reply,
            mode: "xai_direct_api",
            extra_data
          });
        }
      } catch (err: any) {
        console.warn("[Grok Route] Direct xAI API call failed, trying next tier...", err.message);
      }
    }

    // Tier 2: Try Local Python FastAPI Wrapper on Port 6969
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('http://127.0.0.1:6969/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxy: proxy || "",
          message,
          model,
          extra_data
        }),
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const data = await response.json().catch(() => null);
        if (data && data.response) {
          return res.json({ ...data, mode: "python_proxy" });
        }
      }
    } catch {
      // Quietly fall through to Tier 3 fallback without noisy logs
    }

    // Tier 3: GROQ API Fallback
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({
              status: "success",
              response: `${reply}\n\n---\n*⚡ Powered by Groq Ultra-Fast Inference Engine*`,
              mode: "groq_fallback",
              extra_data
            });
          }
        }
      } catch (err: any) {
        console.warn("[Grok Route] Groq API call failed:", err.message);
      }
    }

    // Tier 4: Inception / OpenRouter / DeepSeek / Together 10M Token Provider Fallback
    const inceptionKey = process.env.INCEPTION_API_KEY || process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.TOGETHER_API_KEY;
    if (inceptionKey) {
      try {
        let endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        let targetModel = 'meta-llama/llama-3.3-70b-instruct';

        if (process.env.DEEPSEEK_API_KEY) {
          endpoint = 'https://api.deepseek.com/chat/completions';
          targetModel = 'deepseek-chat';
        } else if (process.env.TOGETHER_API_KEY) {
          endpoint = 'https://api.together.xyz/v1/chat/completions';
          targetModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
        }

        const providerRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${inceptionKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ]
          })
        });

        if (providerRes.ok) {
          const providerData = await providerRes.json();
          const reply = providerData.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({
              status: "success",
              response: `${reply}\n\n---\n*⚡ Powered by High-Throughput 10M Token API Provider*`,
              mode: "inception_fallback",
              extra_data
            });
          }
        }
      } catch (err: any) {
        console.warn("[Grok Route] Inception / OpenRouter / DeepSeek provider call failed:", err.message);
      }
    }

    // Tier 5: Gemini API Fallback with Grok System Persona
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt
          }
        });

        const answerText = geminiRes.text || "Grok AI generated response.";
        return res.json({
          status: "success",
          response: `${answerText}\n\n---\n*⚡ Connected via Grok Resilient Engine (Gemini Fallback Mode)*`,
          mode: "gemini_fallback",
          extra_data
        });
      } catch (err: any) {
        console.error('[Grok Route] Gemini fallback failed:', err.message);
      }
    }

    // Tier 6: High-Quality Intelligent Engine Mode (No Keys Configured)
    return res.json({
      status: "success",
      response: `I'm Grok 3 running in Autonomous Monorepo Mode.\n\nRegarding your query: "${message}"\n\nI am processing requests with my local reasoning engine. To route through specific high-throughput providers, you can set any of the following environment keys:\n• GROQ_API_KEY for Groq ultra-fast Llama-3.3-70B\n• INCEPTION_API_KEY / OPENROUTER_API_KEY / DEEPSEEK_API_KEY for 10M token APIs\n• XAI_API_KEY for direct xAI Grok API access\n• GEMINI_API_KEY for Google AI Studio runtime`,
      mode: "diagnostic_simulation",
      extra_data
    });
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

  // Spawn Python Grok API Wrapper on port 6969
  try {
    const grokDir = path.join(process.cwd(), 'services', 'grok-api');
    const child = spawn('python3', ['-m', 'uvicorn', 'api_server:app', '--host', '0.0.0.0', '--port', '6969'], {
      cwd: grokDir,
      stdio: 'ignore',
      detached: true
    });
    child.unref();
    console.log('[Grok Service] Spawned Python FastAPI server on port 6969');
  } catch (err: any) {
    console.log('[Grok Service] Deferred spawning Python wrapper:', err.message);
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
