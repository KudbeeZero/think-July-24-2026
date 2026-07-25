import { TelemetryLog } from '../types';

type TelemetryBatchCallback = (batch: TelemetryLog[]) => void;

export class TelemetryBatcher {
  private queue: TelemetryLog[] = [];
  private callback: TelemetryBatchCallback | null = null;
  private timer: number | null = null;
  private batchIntervalMs: number = 200; // Batch updates every 200ms
  private maxBatchSize: number = 50;

  constructor(callback?: TelemetryBatchCallback, intervalMs = 200) {
    if (callback) this.callback = callback;
    this.batchIntervalMs = intervalMs;
  }

  public setCallback(cb: TelemetryBatchCallback) {
    this.callback = cb;
  }

  public push(log: TelemetryLog) {
    this.queue.push(log);
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = window.setTimeout(() => this.flush(), this.batchIntervalMs);
    }
  }

  public flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length > 0 && this.callback) {
      const itemsToFlush = [...this.queue];
      this.queue = [];
      this.callback(itemsToFlush);
    }
  }

  public destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
  }
}
