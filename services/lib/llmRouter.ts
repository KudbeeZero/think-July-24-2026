import { GoogleGenAI } from '@google/genai';

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'cost-optimized';

export interface LLMRouterOptions {
  priority?: TaskPriority;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  preferredProvider?: 'xai' | 'groq' | 'deepseek' | 'gemini';
  customFallbackSequence?: string[];
}

export interface LLMRouterResult {
  status: 'success' | 'fallback' | 'error';
  response: string;
  mode: string;
  provider: string;
  modelUsed: string;
  latencyMs: number;
  estimatedCostUSD: number;
  priority: TaskPriority;
  extra_data?: any;
}

export interface ProviderStats {
  requests: number;
  successes: number;
  failures: number;
  totalLatencyMs: number;
  estimatedCostUSD: number;
}

class LLMRouterMetricsTracker {
  private stats: Record<string, ProviderStats> = {
    xai: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 },
    groq: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 },
    deepseek: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 },
    gemini: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 },
    proxy: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 },
    simulation: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 },
  };

  private totalRequests = 0;
  private totalSuccesses = 0;
  private totalFailures = 0;

  public recordAttempt(provider: string) {
    if (!this.stats[provider]) {
      this.stats[provider] = { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 };
    }
    this.stats[provider].requests++;
    this.totalRequests++;
  }

  public recordSuccess(provider: string, latencyMs: number, costUSD: number) {
    if (this.stats[provider]) {
      this.stats[provider].successes++;
      this.stats[provider].totalLatencyMs += latencyMs;
      this.stats[provider].estimatedCostUSD += costUSD;
    }
    this.totalSuccesses++;
  }

  public recordFailure(provider: string) {
    if (this.stats[provider]) {
      this.stats[provider].failures++;
    }
    this.totalFailures++;
  }

  public getSummary() {
    return {
      totalRequests: this.totalRequests,
      totalSuccesses: this.totalSuccesses,
      totalFailures: this.totalFailures,
      successRate: this.totalRequests > 0 ? ((this.totalSuccesses / this.totalRequests) * 100).toFixed(2) + '%' : '100%',
      providerBreakdown: { ...this.stats },
    };
  }

  public reset() {
    this.totalRequests = 0;
    this.totalSuccesses = 0;
    this.totalFailures = 0;
    Object.keys(this.stats).forEach(p => {
      this.stats[p] = { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, estimatedCostUSD: 0 };
    });
  }
}

export const llmMetricsTracker = new LLMRouterMetricsTracker();

// Cost per 1k characters estimate (approximate)
const COST_PER_1K_CHARS: Record<string, number> = {
  xai: 0.002,
  groq: 0.0005,
  deepseek: 0.0002,
  gemini: 0.00015,
  proxy: 0.0001,
  simulation: 0.0,
};

function estimateCost(provider: string, inputText: string, outputText: string): number {
  const rate = COST_PER_1K_CHARS[provider] || 0.0001;
  const totalChars = (inputText?.length || 0) + (outputText?.length || 0);
  return Number(((totalChars / 1000) * rate).toFixed(6));
}

/**
 * Multi-tier LLM router supporting fallback sequence (xAI -> Groq -> DeepSeek -> Gemini -> Simulation)
 * with intelligent task priority routing and cost tracking.
 */
export async function routeLLMRequest(
  message: string,
  model: string = 'grok-3-fast',
  systemPrompt: string = '',
  proxy: string = '',
  extra_data: any = null,
  options?: LLMRouterOptions
): Promise<LLMRouterResult> {
  const priority: TaskPriority = options?.priority || 'normal';
  const timeoutMs = options?.timeoutMs || (priority === 'critical' || priority === 'high' ? 8000 : 4000);
  const startTime = Date.now();

  // Determine provider execution order based on priority / options
  let providerSequence: string[] = ['xai', 'proxy', 'groq', 'deepseek', 'gemini', 'simulation'];

  if (options?.customFallbackSequence && options.customFallbackSequence.length > 0) {
    providerSequence = [...options.customFallbackSequence, 'simulation'];
  } else if (priority === 'cost-optimized' || priority === 'low') {
    // Prioritize cheaper/faster tiers
    providerSequence = ['groq', 'gemini', 'deepseek', 'xai', 'proxy', 'simulation'];
  } else if (options?.preferredProvider) {
    const pref = options.preferredProvider;
    providerSequence = [pref, ...providerSequence.filter(p => p !== pref)];
  }

  for (const provider of providerSequence) {
    llmMetricsTracker.recordAttempt(provider);
    const tierStartTime = Date.now();

    try {
      // -------------------------------------------------------------
      // Tier: xAI (Grok)
      // -------------------------------------------------------------
      if (provider === 'xai') {
        const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_KEY;
        if (xaiKey) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const modelName = model.includes('grok-4') ? 'grok-2-latest' : 'grok-beta';
          const res = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${xaiKey}`,
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: message }
              ],
              temperature: options?.temperature ?? 0.7,
              max_tokens: options?.maxTokens ?? 1024,
            }),
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            const responseText = data.choices?.[0]?.message?.content || '';
            const latencyMs = Date.now() - tierStartTime;
            const cost = estimateCost('xai', message + systemPrompt, responseText);

            llmMetricsTracker.recordSuccess('xai', latencyMs, cost);
            return {
              status: 'success',
              response: responseText,
              mode: 'xai_direct_api',
              provider: 'xAI (Grok)',
              modelUsed: modelName,
              latencyMs,
              estimatedCostUSD: cost,
              priority,
              extra_data
            };
          }
        }
      }

      // -------------------------------------------------------------
      // Tier: Python Proxy
      // -------------------------------------------------------------
      if (provider === 'proxy') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), Math.min(timeoutMs, 3000));
        const res = await fetch('http://127.0.0.1:6969/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proxy, message, model, extra_data }),
          signal: controller.signal
        }).catch(() => null);
        clearTimeout(timeoutId);

        if (res && res.ok) {
          const data = await res.json();
          const latencyMs = Date.now() - tierStartTime;
          const responseText = data.response || JSON.stringify(data);
          const cost = estimateCost('proxy', message, responseText);

          llmMetricsTracker.recordSuccess('proxy', latencyMs, cost);
          return {
            ...data,
            status: 'success',
            response: responseText,
            mode: 'python_proxy',
            provider: 'Python Proxy',
            modelUsed: model,
            latencyMs,
            estimatedCostUSD: cost,
            priority,
            extra_data
          };
        }
      }

      // -------------------------------------------------------------
      // Tier: Groq
      // -------------------------------------------------------------
      if (provider === 'groq') {
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: message }
              ],
              temperature: options?.temperature ?? 0.7,
              max_tokens: options?.maxTokens ?? 1024,
            }),
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            const responseText = data.choices?.[0]?.message?.content || '';
            const latencyMs = Date.now() - tierStartTime;
            const cost = estimateCost('groq', message + systemPrompt, responseText);

            llmMetricsTracker.recordSuccess('groq', latencyMs, cost);
            return {
              status: 'success',
              response: responseText,
              mode: 'groq_fallback',
              provider: 'Groq',
              modelUsed: 'llama-3.3-70b-versatile',
              latencyMs,
              estimatedCostUSD: cost,
              priority,
              extra_data
            };
          }
        }
      }

      // -------------------------------------------------------------
      // Tier: DeepSeek
      // -------------------------------------------------------------
      if (provider === 'deepseek') {
        const dsKey = process.env.DEEPSEEK_API_KEY;
        if (dsKey) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${dsKey}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: message }
              ],
              temperature: options?.temperature ?? 0.7,
              max_tokens: options?.maxTokens ?? 1024,
            }),
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            const responseText = data.choices?.[0]?.message?.content || '';
            const latencyMs = Date.now() - tierStartTime;
            const cost = estimateCost('deepseek', message + systemPrompt, responseText);

            llmMetricsTracker.recordSuccess('deepseek', latencyMs, cost);
            return {
              status: 'success',
              response: responseText,
              mode: 'deepseek_fallback',
              provider: 'DeepSeek',
              modelUsed: 'deepseek-chat',
              latencyMs,
              estimatedCostUSD: cost,
              priority,
              extra_data
            };
          }
        }
      }

      // -------------------------------------------------------------
      // Tier: Gemini
      // -------------------------------------------------------------
      if (provider === 'gemini') {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          let responseText = '';
          try {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: (systemPrompt ? `${systemPrompt}\n\n` : '') + message,
            });
            responseText = response.text || '';
          } catch (sdkErr) {
            // REST Fallback if SDK invocation fails
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: (systemPrompt ? systemPrompt + '\n' : '') + message }] }]
              }),
              signal: controller.signal
            });
            if (res.ok) {
              const data = await res.json();
              responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }
          }
          clearTimeout(timer);

          if (responseText) {
            const latencyMs = Date.now() - tierStartTime;
            const cost = estimateCost('gemini', message + systemPrompt, responseText);

            llmMetricsTracker.recordSuccess('gemini', latencyMs, cost);
            return {
              status: 'success',
              response: responseText,
              mode: 'gemini_fallback',
              provider: 'Google Gemini',
              modelUsed: 'gemini-2.5-flash',
              latencyMs,
              estimatedCostUSD: cost,
              priority,
              extra_data
            };
          }
        }
      }

      // -------------------------------------------------------------
      // Tier: Local Simulation Fallback
      // -------------------------------------------------------------
      if (provider === 'simulation') {
        const latencyMs = Date.now() - tierStartTime;
        const simResponse = `[KILO Multi-Tier Router] Simulation Fallback: Request processed for query "${message.slice(0, 50)}...". All active upstream providers were unavailable or unconfigured.`;
        
        llmMetricsTracker.recordSuccess('simulation', latencyMs, 0);
        return {
          status: 'success',
          response: simResponse,
          mode: 'simulation',
          provider: 'Local Simulation',
          modelUsed: 'kilo-sim-v1',
          latencyMs,
          estimatedCostUSD: 0,
          priority,
          extra_data
        };
      }

      llmMetricsTracker.recordFailure(provider);
    } catch (err) {
      console.warn(`LLM Router tier [${provider}] error:`, err);
      llmMetricsTracker.recordFailure(provider);
    }
  }

  // Absolute fallback if everything fails
  const totalLatencyMs = Date.now() - startTime;
  return {
    status: 'fallback',
    response: 'All LLM routing tiers failed or timed out.',
    mode: 'emergency_fallback',
    provider: 'None',
    modelUsed: 'none',
    latencyMs: totalLatencyMs,
    estimatedCostUSD: 0,
    priority,
    extra_data
  };
}

export function getLLMRouterStats() {
  return llmMetricsTracker.getSummary();
}

export function resetLLMRouterStats() {
  llmMetricsTracker.reset();
}
