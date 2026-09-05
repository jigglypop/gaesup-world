import 'reflect-metadata';
import { Vector3 } from 'three';

import { logger } from '@/core/utils/logger';

import { AutomationSystem } from '../AutomationSystem';

describe('AutomationSystem execution lifetime', () => {
  let system: AutomationSystem;

  beforeEach(() => {
    jest.useFakeTimers();
    system = new AutomationSystem();
  });

  afterEach(() => {
    if (!system.isDisposed) system.dispose();
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test.each(['pause', 'stop', 'reset', 'dispose'] as const)(
    '%s cancels an outstanding movement timeout',
    async (operation) => {
      system.dispose();
      system = new AutomationSystem(true);
      system.updateConfig({ timeoutDuration: 100 });
      system.addAction({ type: 'move', target: new Vector3(100, 0, 0) });
      const failed = jest.fn();
      const completed = jest.fn();
      system.addEventListener('actionError', failed);
      system.addEventListener('actionCompleted', completed);
      const execution = system.start();
      system[operation]();
      await execution;
      await jest.advanceTimersByTimeAsync(1000);
      expect(failed).not.toHaveBeenCalled();
      expect(completed).not.toHaveBeenCalled();
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  test('reset creates fresh nested state, metrics, and owned config defaults', () => {
    const previousState = system.getState();
    const previousMetrics = system.getMetrics();
    const previousConfig = system.getConfig();
    const events: string[] = [];
    system.addEventListener('automationStopped', () => events.push('stopped'));
    system.addEventListener('queueCleared', () => events.push('cleared'));
    system.updateSettings({ throttle: 999, autoStart: true });
    system.addAction({ type: 'key', key: 'test' });
    previousState.executionStats.errors.push('old error');
    previousConfig.visualCues.showPath = false;

    expect(system.getConfig().visualCues.showPath).toBe(true);
    system.reset();

    const nextState = system.getState();
    const nextMetrics = system.getMetrics();
    const nextConfig = system.getConfig();
    expect(nextState).not.toBe(previousState);
    expect(nextState.queue).not.toBe(previousState.queue);
    expect(nextState.queue.actions).not.toBe(previousState.queue.actions);
    expect(nextState.executionStats).not.toBe(previousState.executionStats);
    expect(nextState.executionStats.errors).not.toBe(
      previousState.executionStats.errors,
    );
    expect(nextState.settings).not.toBe(previousState.settings);
    expect(nextMetrics).not.toBe(previousMetrics);
    expect(nextState.queue.actions).toEqual([]);
    expect(nextState.executionStats.errors).toEqual([]);
    expect(nextState.settings.throttle).toBe(100);
    expect(nextState.settings.autoStart).toBe(false);
    expect(nextMetrics.queueLength).toBe(0);
    expect(nextMetrics.errorRate).toBe(0);
    expect(nextConfig).not.toBe(previousConfig);
    expect(nextConfig.visualCues).not.toBe(previousConfig.visualCues);
    expect(nextConfig.visualCues.showPath).toBe(true);
    expect(nextConfig.retryDelay).toBe(1000);
    expect(events).toEqual(['stopped', 'cleared']);
  });

  test.each(['stop', 'reset', 'dispose'] as const)(
    '%s settles an active wait and blocks stale completion',
    async (lifecycle) => {
      const completed = jest.fn();
      system.addEventListener('actionCompleted', completed);
      system.addAction({ type: 'wait', duration: 1000 });
      const startPromise = system.start();

      expect(jest.getTimerCount()).toBe(1);
      if (lifecycle === 'stop') system.stop();
      if (lifecycle === 'reset') system.reset();
      if (lifecycle === 'dispose') system.dispose();

      await startPromise;
      expect(jest.getTimerCount()).toBe(0);
      await jest.advanceTimersByTimeAsync(5000);
      expect(completed).not.toHaveBeenCalled();
      expect(system.getState().executionStats.totalExecuted).toBe(0);
      expect(system.getState().queue.currentIndex).toBe(0);
      expect(jest.getTimerCount()).toBe(0);
      if (lifecycle === 'dispose') expect(system.isDisposed).toBe(true);
      if (lifecycle === 'reset') expect(system.getState().queue.actions).toEqual([]);
      if (lifecycle === 'stop') {
        expect(system.getState().queue.actions).toHaveLength(1);
        expect(system.getState().queue.isRunning).toBe(false);
      }
    },
  );

  test('reset observers cannot auto-start work before queue cleanup', async () => {
    const resetEvents: string[] = [];
    const actionStarted = jest.fn();
    const actionCompleted = jest.fn();
    const previousState = system.getState();
    let stoppedState: ReturnType<AutomationSystem['getState']> | null = null;
    let clearedState: ReturnType<AutomationSystem['getState']> | null = null;
    const attemptReentrantStart = () => {
      system.updateSettings({ autoStart: true, throttle: 999 });
      system.getState().executionStats.totalExecuted = 99;
      system.getState().executionStats.errors.push('observer mutation');
      system.addAction({ type: 'wait', duration: 1000 });
      void system.start();
    };
    system.addEventListener('actionStarted', actionStarted);
    system.addEventListener('actionCompleted', actionCompleted);
    system.addEventListener('automationStopped', () => {
      resetEvents.push('stopped');
      stoppedState = system.getState();
      attemptReentrantStart();
    });
    system.addEventListener('queueCleared', () => {
      resetEvents.push('cleared');
      clearedState = system.getState();
      attemptReentrantStart();
    });
    system.addAction({ type: 'wait', duration: 5000 });
    const startPromise = system.start();

    expect(jest.getTimerCount()).toBe(1);
    system.reset();
    await startPromise;

    expect(resetEvents).toEqual(['stopped', 'cleared']);
    expect(system.getState()).not.toBe(previousState);
    expect(system.getState()).toBe(stoppedState);
    expect(system.getState()).toBe(clearedState);
    expect(system.getState().queue.actions).toEqual([]);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(system.getState().queue.isPaused).toBe(false);
    expect(system.getState().currentAction).toBeNull();
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().executionStats.errors).toEqual([]);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(system.getState().settings.autoStart).toBe(false);
    expect(system.getState().settings.throttle).toBe(100);
    expect(system.getMetrics().queueLength).toBe(0);
    expect(system.getMetrics().errorRate).toBe(0);
    expect(system.getConfig().retryDelay).toBe(1000);
    expect(actionStarted).toHaveBeenCalledTimes(1);
    expect(actionCompleted).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);

    await jest.advanceTimersByTimeAsync(10000);
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(actionCompleted).not.toHaveBeenCalled();
    expect(resetEvents).toEqual(['stopped', 'cleared']);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('duplicate start, pause, and resume keep one wait chain', async () => {
    const started = jest.fn();
    const paused = jest.fn();
    const resumed = jest.fn();
    const stopped = jest.fn();
    const actionStarted = jest.fn();
    const actionCompleted = jest.fn();
    system.addEventListener('automationStarted', started);
    system.addEventListener('automationPaused', paused);
    system.addEventListener('automationResumed', resumed);
    system.addEventListener('automationStopped', stopped);
    system.addEventListener('actionStarted', actionStarted);
    system.addEventListener('actionCompleted', actionCompleted);
    system.addAction({ type: 'wait', duration: 1000 });

    const firstStart = system.start();
    await system.start();
    expect(started).toHaveBeenCalledTimes(1);
    expect(actionStarted).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);

    system.pause();
    system.pause();
    await firstStart;
    expect(paused).toHaveBeenCalledTimes(1);
    expect(system.getState().queue.isRunning).toBe(true);
    expect(system.getState().queue.isPaused).toBe(true);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(system.getState().currentAction).not.toBeNull();
    expect(jest.getTimerCount()).toBe(0);
    await system.start();
    expect(started).toHaveBeenCalledTimes(1);
    expect(system.getState().queue.isPaused).toBe(true);

    system.resume();
    system.resume();
    expect(resumed).toHaveBeenCalledTimes(1);
    expect(actionStarted).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(999);
    expect(actionCompleted).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(actionCompleted).toHaveBeenCalledTimes(1);
    expect(system.getState().executionStats.totalExecuted).toBe(1);
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(jest.getTimerCount()).toBe(1);
    system.stop();
    system.stop();
    expect(stopped).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('start dispatches the first request synchronously', async () => {
    const request = jest.fn();
    system.addEventListener('keyRequested', request);
    system.addAction({ type: 'key', key: 'sync' });

    const startPromise = system.start();

    expect(request).toHaveBeenCalledWith('sync');
    await startPromise;
    system.stop();
  });

  test('pause during post-action delay resumes only the next action', async () => {
    const actionStarted = jest.fn();
    const actionCompleted = jest.fn();
    system.addEventListener('actionStarted', actionStarted);
    system.addEventListener('actionCompleted', actionCompleted);
    system.updateSettings({ throttle: 500 });
    system.addAction({ type: 'key', key: 'first' });
    system.addAction({ type: 'key', key: 'second' });

    await system.start();
    const firstAction = system.getState().currentAction;
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(jest.getTimerCount()).toBe(1);

    system.pause();
    expect(system.getState().currentAction).toBe(firstAction);
    expect(jest.getTimerCount()).toBe(0);
    system.resume();
    system.resume();
    expect(actionStarted).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(0);
    expect(actionCompleted).toHaveBeenCalledTimes(2);
    expect(system.getState().executionStats.totalExecuted).toBe(2);
    expect(system.getState().queue.currentIndex).toBe(2);
    expect(jest.getTimerCount()).toBe(1);

    await jest.advanceTimersByTimeAsync(500);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('pause during retry delay resumes one retry attempt', async () => {
    const beforeCallback = jest.fn(() => {
      throw new Error('retry');
    });
    const actionError = jest.fn();
    system.addEventListener('actionError', actionError);
    system.addAction({ type: 'key', key: 'retry', beforeCallback });

    await system.start();
    expect(beforeCallback).toHaveBeenCalledTimes(1);
    expect(actionError).toHaveBeenCalledTimes(1);
    expect(system.getState().queue.actions[0]?.data).toBeUndefined();
    expect(jest.getTimerCount()).toBe(1);

    system.pause();
    expect(jest.getTimerCount()).toBe(0);
    system.resume();
    system.resume();
    await jest.advanceTimersByTimeAsync(0);
    expect(beforeCallback).toHaveBeenCalledTimes(2);
    expect(actionError).toHaveBeenCalledTimes(2);
    expect(system.getState().queue.actions[0]?.data).toBeUndefined();
    expect(jest.getTimerCount()).toBe(1);
    system.stop();
    expect(jest.getTimerCount()).toBe(0);
  });

  test('afterCallback errors use retry without success mutations', async () => {
    const actionError = jest.fn();
    system.addEventListener('actionError', actionError);
    system.addAction({
      type: 'key',
      key: 'retry-after',
      afterCallback: () => {
        throw new Error('after failed');
      },
    });

    await system.start();

    expect(actionError).toHaveBeenCalledTimes(1);
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().executionStats.averageTime).toBe(0);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(system.getState().queue.actions[0]?.data).toBeUndefined();
    expect(jest.getTimerCount()).toBe(1);
    system.stop();
  });

  test('default maxRetries keeps the legacy total attempt count', async () => {
    const beforeCallback = jest.fn(() => {
      throw new Error('exhaust retries');
    });
    const actionError = jest.fn();
    const automationCompleted = jest.fn();
    system.addEventListener('actionError', actionError);
    system.addEventListener('automationCompleted', automationCompleted);
    system.addAction({ type: 'key', key: 'retry-limit', beforeCallback });

    await system.start();
    await jest.advanceTimersByTimeAsync(999);
    expect(beforeCallback).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    await jest.advanceTimersByTimeAsync(1000);
    await jest.advanceTimersByTimeAsync(1000);

    expect(beforeCallback).toHaveBeenCalledTimes(4);
    expect(actionError).toHaveBeenCalledTimes(4);
    expect(system.getState().executionStats.errors).toHaveLength(4);
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().queue.actions[0]?.data).toBeUndefined();
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(100);
    expect(automationCompleted).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('action lifecycle listeners can stop without stale schedules', async () => {
    const request = jest.fn();
    const completed = jest.fn();
    system.addEventListener('keyRequested', request);
    system.addEventListener('actionCompleted', completed);
    system.addEventListener('actionStarted', () => system.stop());
    system.addAction({ type: 'key', key: 'blocked' });

    await system.start();

    expect(request).not.toHaveBeenCalled();
    expect(completed).not.toHaveBeenCalled();
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('actionCompleted and actionError listeners block later scheduling mutations', async () => {
    system.addEventListener('actionCompleted', () => system.stop());
    system.addAction({ type: 'key', key: 'complete-stop' });
    await system.start();

    expect(system.getState().executionStats.totalExecuted).toBe(1);
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(jest.getTimerCount()).toBe(0);

    system.reset();
    system.addEventListener('actionError', () => system.stop());
    system.addAction({
      type: 'key',
      key: 'error-stop',
      beforeCallback: () => {
        throw new Error('stop retry');
      },
    });
    await system.start();

    expect(system.getState().executionStats.errors).toHaveLength(1);
    expect(system.getState().queue.actions[0]?.data?.['retryCount']).toBeUndefined();
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('stop followed by immediate observer restart isolates the old generation', async () => {
    const actionStarted = jest.fn();
    const actionCompleted = jest.fn();
    let restarted = false;
    system.addEventListener('actionStarted', actionStarted);
    system.addEventListener('actionCompleted', actionCompleted);
    system.addEventListener('automationStopped', () => {
      if (restarted) return;
      restarted = true;
      void system.start();
    });
    system.addAction({ type: 'wait', duration: 1000 });

    const oldStart = system.start();
    system.stop();
    await oldStart;

    expect(actionStarted).toHaveBeenCalledTimes(2);
    expect(system.getState().queue.isRunning).toBe(true);
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(1000);
    expect(actionCompleted).toHaveBeenCalledTimes(1);
    expect(system.getState().executionStats.totalExecuted).toBe(1);
    expect(system.getState().queue.currentIndex).toBe(1);
    await jest.advanceTimersByTimeAsync(100);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('natural stopped observer reset emits stopped once and suppresses stale completion', async () => {
    const events: string[] = [];
    const firstStoppedObserver = jest.fn(() => events.push('stopped'));
    const secondStoppedObserver = jest.fn(() => system.reset());
    const queueCleared = jest.fn(() => events.push('cleared'));
    const automationCompleted = jest.fn();
    system.addEventListener('automationStopped', firstStoppedObserver);
    system.addEventListener('automationStopped', secondStoppedObserver);
    system.addEventListener('queueCleared', queueCleared);
    system.addEventListener('automationCompleted', automationCompleted);
    system.addAction({ type: 'key', key: 'complete-reset', delay: 25 });

    await system.start();
    await jest.advanceTimersByTimeAsync(25);

    expect(firstStoppedObserver).toHaveBeenCalledTimes(1);
    expect(secondStoppedObserver).toHaveBeenCalledTimes(1);
    expect(queueCleared).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['stopped', 'cleared']);
    expect(automationCompleted).not.toHaveBeenCalled();
    expect(system.getState().queue.actions).toEqual([]);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(system.getState().currentAction).toBeNull();
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(jest.getTimerCount()).toBe(0);

    await jest.advanceTimersByTimeAsync(1000);
    expect(automationCompleted).not.toHaveBeenCalled();
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('stopped observer disposal runs every observer once and settles execution', async () => {
    const disposingObserver = jest.fn(() => system.dispose());
    const followingObserver = jest.fn();
    const actionCompleted = jest.fn();
    system.addEventListener('automationStopped', disposingObserver);
    system.addEventListener('automationStopped', followingObserver);
    system.addEventListener('actionCompleted', actionCompleted);
    system.addAction({ type: 'wait', duration: 1000 });
    const startPromise = system.start();

    system.stop();
    await startPromise;

    expect(disposingObserver).toHaveBeenCalledTimes(1);
    expect(followingObserver).toHaveBeenCalledTimes(1);
    expect(system.isDisposed).toBe(true);
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(actionCompleted).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);

    await jest.advanceTimersByTimeAsync(5000);
    expect(actionCompleted).not.toHaveBeenCalled();
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('direct idle reset and dispose each force one stopped event', () => {
    const stopped = jest.fn();
    system.addEventListener('automationStopped', stopped);

    system.reset();
    expect(stopped).toHaveBeenCalledTimes(1);

    system.dispose();
    expect(stopped).toHaveBeenCalledTimes(2);
    expect(system.isDisposed).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('a distinct exhausted run completes while an outer stopped run is dispatching', async () => {
    const events: string[] = [];
    let restarted = false;
    system.addEventListener('automationStarted', () => events.push('started'));
    system.addEventListener('automationStopped', () => {
      events.push('stopped');
      if (restarted) return;
      restarted = true;
      void system.start();
    });
    system.addEventListener('automationCompleted', () => events.push('completed'));
    system.addAction({ type: 'key', key: 'exhausted-restart', delay: 25 });

    await system.start();
    await jest.advanceTimersByTimeAsync(25);

    expect(events).toEqual([
      'started',
      'stopped',
      'started',
      'stopped',
      'completed',
    ]);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('a distinct run stopped from automationStarted emits its own stopped event', async () => {
    const events: string[] = [];
    const automationCompleted = jest.fn();
    const actionCompleted = jest.fn();
    let startCount = 0;
    let restarted = false;
    system.addEventListener('automationStarted', () => {
      startCount++;
      events.push('started');
      if (startCount === 2) system.stop();
    });
    system.addEventListener('automationStopped', () => {
      events.push('stopped');
      if (restarted) return;
      restarted = true;
      void system.start();
    });
    system.addEventListener('automationCompleted', automationCompleted);
    system.addEventListener('actionCompleted', actionCompleted);
    system.addAction({ type: 'wait', duration: 1000 });
    const firstStart = system.start();

    system.stop();
    await firstStart;

    expect(events).toEqual(['started', 'stopped', 'started', 'stopped']);
    expect(actionCompleted).not.toHaveBeenCalled();
    expect(automationCompleted).not.toHaveBeenCalled();
    expect(system.getState().executionStats.totalExecuted).toBe(0);
    expect(system.getState().queue.currentIndex).toBe(0);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('stop preserves queue and index so restart continues from the next action', async () => {
    const requestedKeys: string[] = [];
    system.addEventListener('keyRequested', (data) => {
      if (typeof data === 'string') requestedKeys.push(data);
    });
    system.addAction({ type: 'key', key: 'first' });
    system.addAction({ type: 'key', key: 'second' });

    await system.start();
    system.stop();
    expect(system.getState().queue.actions).toHaveLength(2);
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(system.getState().currentAction).toBeNull();
    expect(jest.getTimerCount()).toBe(0);

    await system.start();
    expect(requestedKeys).toEqual(['first', 'second']);
    expect(system.getState().queue.currentIndex).toBe(2);
    system.stop();
  });

  test('observer failures are isolated and cannot block disposal', async () => {
    const loggerError = jest.spyOn(logger, 'error');
    const actionObserver = jest.fn();
    const stoppedObserver = jest.fn();
    system.addEventListener('actionStarted', () => {
      throw new Error('action observer failed');
    });
    system.addEventListener('actionStarted', actionObserver);
    system.addEventListener('automationStopped', () => {
      throw new Error('stop observer failed');
    });
    system.addEventListener('automationStopped', stoppedObserver);
    system.addAction({ type: 'wait', duration: 1000 });
    const startPromise = system.start();

    system.dispose();
    await startPromise;

    expect(actionObserver).toHaveBeenCalledTimes(1);
    expect(stoppedObserver).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledTimes(2);
    expect(system.isDisposed).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
    await system.start();
    expect(actionObserver).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('natural completion preserves stopped-before-completed event order', async () => {
    const events: string[] = [];
    for (const event of [
      'automationStarted',
      'actionStarted',
      'keyRequested',
      'actionCompleted',
      'automationStopped',
      'automationCompleted',
    ]) {
      system.addEventListener(event, () => events.push(event));
    }
    system.addAction({ type: 'key', key: 'ordered', delay: 25 });

    await system.start();
    expect(events).toEqual([
      'automationStarted',
      'actionStarted',
      'keyRequested',
      'actionCompleted',
    ]);
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(25);
    expect(events).toEqual([
      'automationStarted',
      'actionStarted',
      'keyRequested',
      'actionCompleted',
      'automationStopped',
      'automationCompleted',
    ]);
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([false, true])('each loop gets its own retry budget after success=%s', async (succeedsOnRetry) => {
    let attempts = 0;
    const beforeCallback = jest.fn(() => {
      attempts++;
      if (!succeedsOnRetry || attempts % 2 === 1) throw new Error('retry');
    });
    system.updateConfig({ retryDelay: 10 });
    system.updateSettings({ throttle: 10 });
    system.getState().queue.maxRetries = 1;
    system.getState().queue.loop = true;
    system.addAction({ type: 'key', key: 'loop', beforeCallback });

    await system.start();
    await jest.advanceTimersByTimeAsync(10);
    expect(beforeCallback).toHaveBeenCalledTimes(2);
    expect(system.getState().queue.currentIndex).toBe(1);
    await jest.advanceTimersByTimeAsync(10);
    expect(beforeCallback).toHaveBeenCalledTimes(3);
    expect(system.getState().queue.currentIndex).toBe(0);
    await jest.advanceTimersByTimeAsync(10);
    expect(beforeCallback).toHaveBeenCalledTimes(4);
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(system.getState().executionStats.totalExecuted).toBe(succeedsOnRetry ? 2 : 0);
    system.stop();
    expect(jest.getTimerCount()).toBe(0);
  });

  test('retry bookkeeping does not consume or overwrite caller action data', async () => {
    const data = { retryCount: 99, task: 'payload' };
    const beforeCallback = jest.fn(() => { throw new Error('retry'); });
    system.getState().queue.maxRetries = 1;
    system.addAction({ type: 'custom', data, beforeCallback });
    await system.start();
    await jest.advanceTimersByTimeAsync(1000);
    expect(beforeCallback).toHaveBeenCalledTimes(2);
    expect(system.getState().queue.currentIndex).toBe(1);
    expect(system.getState().queue.actions[0]?.data).toBe(data);
    expect(data).toEqual({ retryCount: 99, task: 'payload' });
    system.stop();
  });

  test('looping schedules one chain without completion events', async () => {
    const actionStarted = jest.fn();
    const actionCompleted = jest.fn();
    const stopped = jest.fn();
    const completed = jest.fn();
    system.addEventListener('actionStarted', actionStarted);
    system.addEventListener('actionCompleted', actionCompleted);
    system.addEventListener('automationStopped', stopped);
    system.addEventListener('automationCompleted', completed);
    system.getState().queue.loop = true;
    system.addAction({ type: 'key', key: 'loop', delay: 25 });

    await system.start();
    await jest.advanceTimersByTimeAsync(25);

    expect(actionStarted).toHaveBeenCalledTimes(2);
    expect(actionCompleted).toHaveBeenCalledTimes(2);
    expect(stopped).not.toHaveBeenCalled();
    expect(completed).not.toHaveBeenCalled();
    expect(system.getState().queue.isRunning).toBe(true);
    expect(jest.getTimerCount()).toBe(1);
    system.stop();
    expect(stopped).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('zero duration and delay keep the legacy fallback timings', async () => {
    const actionCompleted = jest.fn();
    system.addEventListener('actionCompleted', actionCompleted);
    system.addAction({ type: 'wait', duration: 0, delay: 0 });
    const startPromise = system.start();

    await jest.advanceTimersByTimeAsync(999);
    expect(actionCompleted).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    await startPromise;
    expect(actionCompleted).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(99);
    expect(system.getState().queue.isRunning).toBe(true);
    await jest.advanceTimersByTimeAsync(1);
    expect(system.getState().queue.isRunning).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });
});
