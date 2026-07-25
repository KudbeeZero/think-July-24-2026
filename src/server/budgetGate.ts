import { getSlowRedisClient } from './redis';

const BUDGET_GATE_LUA = `
local current_spend = tonumber(redis.call('GET', KEYS[1]) or 0)
local increment = tonumber(ARGV[1])
local max_budget = tonumber(ARGV[2])

if current_spend + increment > max_budget then
    return 0
end

redis.call('INCRBYFLOAT', KEYS[1], ARGV[1])
return 1
`;

export class BudgetExceededError extends Error {
  statusCode: number;
  constructor(message: string = 'Monthly LLM budget ceiling exceeded') {
    super(message);
    this.name = 'BudgetExceededError';
    this.statusCode = 402;
  }
}

// In-memory fallback spend counter
let inMemoryCurrentSpend = 0.000;

export async function checkAndIncrementBudget(
  spendIncrementUSD: number = 0.0001,
  maxBudgetUSD: number = parseFloat(process.env.MONTHLY_BUDGET_USD || '50.00')
): Promise<{ allowed: boolean; currentSpendUSD: number; maxBudgetUSD: number }> {
  const slowRedis = getSlowRedisClient();
  const key = `kudbee:governance:monthly_spend:${new Date().toISOString().substring(0, 7)}`;

  if (slowRedis.isOpen) {
    try {
      const result = await slowRedis.eval(BUDGET_GATE_LUA, {
        keys: [key],
        arguments: [spendIncrementUSD.toString(), maxBudgetUSD.toString()]
      } as any);

      const currentSpend = parseFloat((await (slowRedis as any).get(key)) || '0');

      if (Number(result) === 0) {
        return { allowed: false, currentSpendUSD: currentSpend, maxBudgetUSD };
      }

      return { allowed: true, currentSpendUSD: currentSpend, maxBudgetUSD };
    } catch (err) {
      console.warn('[BudgetGate] Redis Lua execution failed, falling back to in-memory gate:', err);
    }
  }

  // In-memory fallback
  if (inMemoryCurrentSpend + spendIncrementUSD > maxBudgetUSD) {
    return { allowed: false, currentSpendUSD: inMemoryCurrentSpend, maxBudgetUSD };
  }

  inMemoryCurrentSpend += spendIncrementUSD;
  return { allowed: true, currentSpendUSD: inMemoryCurrentSpend, maxBudgetUSD };
}

export async function getCurrentSpend(): Promise<{ currentSpendUSD: number; maxBudgetUSD: number }> {
  const slowRedis = getSlowRedisClient();
  const key = `kudbee:governance:monthly_spend:${new Date().toISOString().substring(0, 7)}`;
  const maxBudgetUSD = parseFloat(process.env.MONTHLY_BUDGET_USD || '50.00');

  if (slowRedis.isOpen) {
    try {
      const val = await (slowRedis as any).get(key);
      return { currentSpendUSD: parseFloat(val || '0'), maxBudgetUSD };
    } catch {
      // Fallback
    }
  }

  return { currentSpendUSD: inMemoryCurrentSpend, maxBudgetUSD };
}
