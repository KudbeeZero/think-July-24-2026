import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // === Advanced Upgrade 1: API Telemetry Routes ===
  app.get("/api/telemetry/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock telemetry endpoint for UI
  app.post("/api/telemetry/ingest", (req, res) => {
    // In production, this would validate payload and push to Redis/Postgres
    const { event, source } = req.body;
    console.log(`[Telemetry] ${source}: ${event}`);
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

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
