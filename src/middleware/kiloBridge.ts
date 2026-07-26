import { Request, Response, NextFunction } from 'express';
import { checkAndIncrementBudget } from '../server/budgetGate.ts';
import fs from 'fs';
import path from 'path';

export interface ProviderCost {
  promptCostPerM: number;      // Cost per 1,000,000 prompt tokens
  completionCostPerM: number;  // Cost per 1,000,000 completion tokens
  reasoningCostPerM?: number;  // Cost per 1,000,000 reasoning tokens (if applicable)
}

export interface TokenTransaction {
  id: string;
  timestamp: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  costUsd: number;
}

export const PROVIDER_COSTS: Record<string, ProviderCost> = {
  'grok-3-fast': { promptCostPerM: 2.00, completionCostPerM: 10.00 },
  'grok-2-latest': { promptCostPerM: 2.00, completionCostPerM: 10.00 },
  'grok-beta': { promptCostPerM: 2.00, completionCostPerM: 10.00 },
  'llama-3.3-70b-versatile': { promptCostPerM: 0.59, completionCostPerM: 0.79 },
  'deepseek-reasoner': { promptCostPerM: 0.55, completionCostPerM: 2.19, reasoningCostPerM: 2.19 },
  'deepseek-chat': { promptCostPerM: 0.14, completionCostPerM: 0.28 },
  'gemini-2.5-flash': { promptCostPerM: 0.075, completionCostPerM: 0.30 },
  'default': { promptCostPerM: 0.50, completionCostPerM: 1.50 }
};

const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'kilo_token_cache.json');
let tokenTransactionsInMemory: TokenTransaction[] = [];

// Initialize local token storage
function loadLocalTokenCache(): TokenTransaction[] {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[kiloBridge] Error reading token cache file:', err);
  }
  return [];
}

function saveLocalTokenCache(tx: TokenTransaction) {
  try {
    tokenTransactionsInMemory.unshift(tx);
    // Keep max 500 recent transactions
    if (tokenTransactionsInMemory.length > 500) {
      tokenTransactionsInMemory = tokenTransactionsInMemory.slice(0, 500);
    }

    const dataDir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(tokenTransactionsInMemory, null, 2));
  } catch (err) {
    console.error('[kiloBridge] Error persisting token cache:', err);
  }
}

// Load initial transactions
tokenTransactionsInMemory = loadLocalTokenCache();

/**
 * Calculates the total cost of a request based on provider and tokens.
 */
export function calculateTokenCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
  reasoningTokens: number = 0
): number {
  const normalizedModel = Object.keys(PROVIDER_COSTS).find(key => model.toLowerCase().includes(key)) || 'default';
  const pricing = PROVIDER_COSTS[normalizedModel];
  
  const promptCost = (promptTokens * pricing.promptCostPerM) / 1000000;
  const completionCost = (completionTokens * pricing.completionCostPerM) / 1000000;
  
  const reasoningCostPerM = pricing.reasoningCostPerM !== undefined ? pricing.reasoningCostPerM : pricing.completionCostPerM;
  const reasoningCost = (reasoningTokens * reasoningCostPerM) / 1000000;

  return promptCost + completionCost + reasoningCost;
}

export function getCachedTokenTransactions(): TokenTransaction[] {
  return tokenTransactionsInMemory;
}

/**
 * Express middleware to handle token cost tracking and budget-gate compliance for LLM API requests.
 */
export async function kiloBridgeMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only process POST requests with request bodies that could contain model requests
  if (req.method !== 'POST') {
    return next();
  }

  const model = req.body.model || 'default';
  const message = req.body.message || req.body.prompt || '';
  
  // Estimate baseline cost to prevent massive overrun
  const estimatedPromptTokens = Math.max(1, Math.ceil(message.length / 4));
  const estimatedCompletionTokens = 500; // conservative fallback estimate

  // Check the current budget limit from budgetGate
  const maxBudgetUSD = parseFloat(process.env.MONTHLY_BUDGET_USD || '50.00');
  const preCheck = await checkAndIncrementBudget(0, maxBudgetUSD);
  
  if (!preCheck.allowed) {
    return res.status(402).json({
      error: 'Budget Exceeded',
      message: `Monthly LLM budget ceiling exceeded ($${preCheck.currentSpendUSD.toFixed(4)} / $${preCheck.maxBudgetUSD.toFixed(2)})`
    });
  }

  // Intercept the json response function to analyze the completed payload
  const originalJson = res.json;
  res.json = function (body: any) {
    if (body && typeof body === 'object') {
      let promptTokens = estimatedPromptTokens;
      let completionTokens = estimatedCompletionTokens;
      let reasoningTokens = 0;

      // Extract real token usage if provided
      if (body.usage) {
        promptTokens = body.usage.prompt_tokens || promptTokens;
        completionTokens = body.usage.completion_tokens || completionTokens;
        reasoningTokens = body.usage.reasoning_tokens || 0;
      } else if (body.response) {
        // Fallback: estimate based on actual response length
        completionTokens = Math.max(1, Math.ceil(body.response.length / 4));
      }

      const finalCost = calculateTokenCost(model, promptTokens, completionTokens, reasoningTokens);

      // Save to local persistent cache
      const tx: TokenTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        model,
        promptTokens,
        completionTokens,
        reasoningTokens,
        costUsd: finalCost
      };
      saveLocalTokenCache(tx);

      // Charge the budget
      checkAndIncrementBudget(finalCost, maxBudgetUSD)
        .then((budgetResult) => {
          console.log(`[kiloBridge] Model: ${model} | Cost: $${finalCost.toFixed(6)} | Monthly Spend: $${budgetResult.currentSpendUSD.toFixed(4)}`);
          
          // Inject tracking meta back into response for client consumption
          body.token_tracking = {
            model,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            reasoning_tokens: reasoningTokens,
            estimated: !body.usage,
            cost_usd: finalCost,
            current_monthly_spend_usd: budgetResult.currentSpendUSD,
            cached_tx_id: tx.id
          };
        })
        .catch((err) => {
          console.error('[kiloBridge] Error charging budget gate:', err);
        });
    }

    return originalJson.call(this, body);
  };

  next();
}
