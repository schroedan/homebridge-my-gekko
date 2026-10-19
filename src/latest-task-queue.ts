type PendingTask = {
  task: () => Promise<void>;
  ready: boolean;
  resolve: (executed: boolean) => void;
  reject: (reason: unknown) => void;
};

/**
 * Runs one task at a time. A task becomes ready once no other task has been
 * added for the given delay. While a task is running, only the latest of the
 * tasks added in the meantime is kept and run afterwards, the others are
 * skipped.
 */
export class LatestTaskQueue {
  private _running = false;
  private _pending?: PendingTask;
  private _timeout?: NodeJS.Timeout;
  private _timestamp = 0;

  /**
   * Whether a task is waiting or running.
   */
  get pending(): boolean {
    return this._running || this._pending !== undefined;
  }

  /**
   * The time, in seconds, the last task started.
   */
  get timestamp(): number {
    return Math.floor(this._timestamp / 1000);
  }

  constructor(readonly delay: number = 0) {}

  protected async drain(): Promise<void> {
    this._running = true;

    while (this._pending?.ready) {
      const { task, resolve, reject } = this._pending;

      this._pending = undefined;
      this._timestamp = Date.now();

      try {
        await task();
        resolve(true);
      } catch (reason) {
        reject(reason);
      }
    }

    this._running = false;
  }

  /**
   * Resolves with `true` once the task has run, or with `false` if it was
   * skipped in favour of a later task. Rejects if the task fails.
   */
  enqueue(task: () => Promise<void>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.clear();

      const pending: PendingTask = { task, ready: false, resolve, reject };

      this._pending = pending;
      this._timeout = setTimeout(() => {
        pending.ready = true;

        if (!this._running) {
          void this.drain();
        }
      }, this.delay);

      this._timeout.unref();
    });
  }

  /**
   * Skips the waiting task, if any.
   */
  clear(): this {
    if (this._timeout !== undefined) {
      clearTimeout(this._timeout);
    }

    this._pending?.resolve(false);
    this._pending = undefined;

    return this;
  }
}
