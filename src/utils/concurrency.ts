/**
 * Concurrency utilities for multi-threaded-like execution patterns
 * Enables parallel processing, rate limiting, and batching
 */

/**
 * Execute multiple async operations in parallel with a concurrency limit
 * @param operations Array of async functions to execute
 * @param limit Maximum concurrent operations (default: 5)
 */
export async function parallelWithLimit<T>(
  operations: (() => Promise<T>)[],
  limit: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < operations.length; i++) {
    const promise = Promise.resolve().then(async () => {
      results[i] = await operations[i]();
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex((p) => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Batch process items with async handler
 * Useful for processing large datasets in chunks
 */
export async function batchProcess<T, R>(
  items: T[],
  handler: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await handler(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Execute functions in parallel but wait for all to complete
 * Returns results in same order as input
 */
export function executeParallel<T>(
  operations: (() => Promise<T>)[]
): Promise<T[]> {
  return Promise.all(operations.map((op) => op()));
}

/**
 * Debounce batch updates to reduce API calls
 * Collects updates within time window and sends as batch
 */
export class BatchCollector<T> {
  private batch: T[] = [];
  private timer: NodeJS.Timeout | null = null;
  private waitTime: number;
  private handler: (batch: T[]) => Promise<void>;

  constructor(handler: (batch: T[]) => Promise<void>, waitTime: number = 100) {
    this.handler = handler;
    this.waitTime = waitTime;
  }

  add(item: T): void {
    this.batch.push(item);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => this.flush(), this.waitTime);
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const itemsToProcess = [...this.batch];
    this.batch = [];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    await this.handler(itemsToProcess);
  }

  clear(): void {
    this.batch = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  size(): number {
    return this.batch.length;
  }
}

/**
 * Rate limiter for controlling concurrent operations
 * Prevents overwhelming backend with too many simultaneous requests
 */
export class RateLimiter {
  private running = 0;
  private queue: Array<() => Promise<any>> = [];
  private limit: number;

  constructor(limit: number = 5) {
    this.limit = limit;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.limit) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.running++;

    try {
      return await fn();
    } finally {
      this.running--;
    }
  }

  async executeAll<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(fns.map((fn) => this.execute(fn)));
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getRunningCount(): number {
    return this.running;
  }
}

/**
 * Simple debounce utility for function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Worker pool for distributing work across multiple workers
 * Useful for CPU-intensive tasks
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    data: any;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }> = [];
  private currentWorker = 0;

  constructor(scriptUrl: string, poolSize: number = 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(scriptUrl);
      worker.onmessage = (e) => this.handleWorkerMessage(e, worker);
      worker.onerror = (e) => this.handleWorkerError(e, worker);
      this.workers.push(worker);
    }
  }

  private handleWorkerMessage(
    event: MessageEvent,
    worker: Worker
  ): void {
    const { id, result, error } = event.data;
    const task = this.queue.shift();

    if (task) {
      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }
    }

    this.processQueue(worker);
  }

  private handleWorkerError(event: ErrorEvent, worker: Worker): void {
    const task = this.queue.shift();
    if (task) {
      task.reject(new Error(event.message));
    }
    this.processQueue(worker);
  }

  private processQueue(worker: Worker): void {
    if (this.queue.length > 0) {
      const task = this.queue[0];
      worker.postMessage(task.data);
    }
  }

  async execute(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });

      if (this.queue.length === 1) {
        const worker = this.workers[this.currentWorker];
        this.currentWorker = (this.currentWorker + 1) % this.workers.length;
        this.processQueue(worker);
      }
    });
  }

  terminate(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.queue = [];
  }
}
