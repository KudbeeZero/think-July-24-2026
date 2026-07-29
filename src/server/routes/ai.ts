import { Router } from "express";
import { globalModelRateLimiter } from "../modelConfig.ts";
import { kiloBridgeMiddleware } from "../../middleware/kiloBridge.ts";
import { groqBreaker, deepseekBreaker } from "../circuitBreaker.ts";
import { GoogleGenAI } from "@google/genai";
import { checkAndIncrementBudget } from "../budgetGate.ts";

export const aiRouter = Router();

aiRouter.post('/ask', kiloBridgeMiddleware, async (req, res) => {
  const { model = 'deepseek-reasoner', message, extra_data } = req.body;
  
  // 1. Enforce Model Specific Rate Limits
  const withinLimit = await globalModelRateLimiter.checkRequestLimit(model);
  if (!withinLimit) {
    return res.status(429).json({
      error: `Rate limit exceeded for model: ${model}. Please try again later.`,
      status: 429
    });
  }

  // 2. Budget Gate Check
  const budgetOk = await checkAndIncrementBudget(0.01);
  if (!budgetOk) {
    return res.status(402).json({
      error: "AI Budget exhausted. Please wait for the daily reset or upgrade.",
      status: 402
    });
  }

  try {
    if (model.includes('deepseek')) {
      if (deepseekBreaker.state === 'OPEN') {
         throw new Error("DeepSeek circuit breaker is OPEN.");
      }
      // DeepSeek simulation or actual API call here
      const result = `[DeepSeek Response for: ${message}] - Processed under strict rate limits.`;
      deepseekBreaker.recordSuccess();
      return res.json({ result, model, tokensUsed: 150 });
    } else if (model.includes('grok')) {
      // Logic for Grok
      const result = `[Grok Response for: ${message}] - Analytical engine.`;
      return res.json({ result, model, tokensUsed: 120 });
    } else if (model.includes('gemini')) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ result: "[Gemini Flash Lite] Simulated response (No GEMINI_API_KEY configured).", model, tokensUsed: 50 });
      }
      const ai = new GoogleGenAI({ apiKey });
      const geminiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction: "You are an ultra-fast, highly efficient AI assistant powered by Gemini 2.5 Flash (lowest latency/intelligent model tier)."
        }
      });
      const result = geminiRes.text || "Gemini Flash response generated.";
      return res.json({ result, model: 'gemini-2.5-flash', tokensUsed: 80 });
    } else {
      return res.status(400).json({ error: "Unsupported model" });
    }
  } catch (err: any) {
    if (model.includes('deepseek')) deepseekBreaker.recordFailure();
    return res.status(500).json({ error: err.message });
  }
});
