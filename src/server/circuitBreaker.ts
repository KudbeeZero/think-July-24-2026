import { CircuitBreaker } from '../types';

class ProviderCircuitBreaker implements CircuitBreaker {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  failureCount: number = 0;
  threshold: number = 5;
  lastFailureTime: number = 0;
  resetTimeoutMs: number = 30000; // 30 seconds reset

  constructor(name: string) {
    this.name = name;
  }

  async forceOpen(): Promise<void> {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
    console.warn(`[CircuitBreaker:${this.name}] FORCED OPEN via Chaos Monkey trigger.`);
  }

  async forceReset(): Promise<void> {
    this.state = 'CLOSED';
    this.failureCount = 0;
    console.log(`[CircuitBreaker:${this.name}] FORCED RESET to CLOSED state.`);
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker:${this.name}] Threshold exceeded! Circuit tripped to OPEN state.`);
    }
  }

  canExecute(): boolean {
    if (this.state === 'CLOSED') return true;

    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    // HALF_OPEN allows single test request
    return true;
  }
}

export const groqBreaker = new ProviderCircuitBreaker('Groq');
export const deepseekBreaker = new ProviderCircuitBreaker('DeepSeek');
