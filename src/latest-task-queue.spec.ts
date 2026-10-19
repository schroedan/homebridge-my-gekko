import { LatestTaskQueue } from './latest-task-queue';

describe('Latest Task Queue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  it('should provide delay', () => {
    expect(new LatestTaskQueue().delay).toBe(0);
    expect(new LatestTaskQueue(500).delay).toBe(500);
  });
  it('should run a task after the delay', async () => {
    const queue = new LatestTaskQueue(500);
    const task = jest.fn().mockResolvedValue(undefined);

    const result = queue.enqueue(task);

    jest.advanceTimersByTime(499);

    expect(task).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    await expect(result).resolves.toBe(true);
    expect(task).toHaveBeenCalled();
  });
  it('should only run the latest of tasks added within the delay', async () => {
    const queue = new LatestTaskQueue(500);
    const first = jest.fn().mockResolvedValue(undefined);
    const second = jest.fn().mockResolvedValue(undefined);

    const firstResult = queue.enqueue(first);

    jest.advanceTimersByTime(400);

    const secondResult = queue.enqueue(second);

    // the delay restarts with every added task
    jest.advanceTimersByTime(400);

    expect(second).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    await expect(firstResult).resolves.toBe(false);
    await expect(secondResult).resolves.toBe(true);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });
  it('should run tasks one after another', async () => {
    const queue = new LatestTaskQueue();
    const calls: string[] = [];
    let release: () => void = () => undefined;

    const first = queue.enqueue(
      () =>
        new Promise<void>((resolve) => {
          calls.push('first started');
          release = () => {
            calls.push('first finished');
            resolve();
          };
        }),
    );

    jest.runAllTimers();

    const second = queue.enqueue(async () => {
      calls.push('second started');
    });

    jest.runAllTimers();
    await Promise.resolve();

    expect(calls).toEqual(['first started']);

    release();

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(calls).toEqual([
      'first started',
      'first finished',
      'second started',
    ]);
  });
  it('should wait for the delay of a task added while another one is running', async () => {
    const queue = new LatestTaskQueue(500);
    const second = jest.fn().mockResolvedValue(undefined);
    let release: () => void = () => undefined;

    const first = queue.enqueue(
      () => new Promise<void>((resolve) => (release = resolve)),
    );

    jest.advanceTimersByTime(500);

    const secondResult = queue.enqueue(second);

    release();
    await expect(first).resolves.toBe(true);

    expect(second).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    await expect(secondResult).resolves.toBe(true);
    expect(second).toHaveBeenCalled();
  });
  it('should reject failed tasks and continue with the next task', async () => {
    const queue = new LatestTaskQueue();
    const next = jest.fn().mockResolvedValue(undefined);

    const failed = queue.enqueue(() => Promise.reject(new Error('__reason__')));

    jest.runAllTimers();

    await expect(failed).rejects.toThrow('__reason__');

    const succeeded = queue.enqueue(next);

    jest.runAllTimers();

    await expect(succeeded).resolves.toBe(true);
    expect(next).toHaveBeenCalled();
  });
  it('should indicate waiting and running tasks as pending', async () => {
    const queue = new LatestTaskQueue(500);
    let release: () => void = () => undefined;

    expect(queue.pending).toBe(false);

    const result = queue.enqueue(
      () => new Promise<void>((resolve) => (release = resolve)),
    );

    expect(queue.pending).toBe(true);

    jest.advanceTimersByTime(500);

    expect(queue.pending).toBe(true);

    release();
    await result;

    expect(queue.pending).toBe(false);
  });
  it('should provide the time the last task started in seconds', async () => {
    const queue = new LatestTaskQueue();

    jest.spyOn(Date, 'now').mockReturnValue(12345);

    expect(queue.timestamp).toBe(0);

    const result = queue.enqueue(() => Promise.resolve());

    jest.runAllTimers();
    await result;

    expect(queue.timestamp).toBe(12);
  });
  it('should skip the waiting task on clear', async () => {
    const queue = new LatestTaskQueue(500);
    const task = jest.fn().mockResolvedValue(undefined);

    const result = queue.enqueue(task);

    expect(queue.clear()).toBe(queue);

    jest.runAllTimers();

    await expect(result).resolves.toBe(false);
    expect(task).not.toHaveBeenCalled();
    expect(queue.pending).toBe(false);
  });
  it('should clear without waiting task', () => {
    const queue = new LatestTaskQueue();

    expect(queue.clear()).toBe(queue);
  });
});
