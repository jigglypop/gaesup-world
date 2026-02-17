import 'reflect-metadata';

import { AutomationSystem } from '../AutomationSystem';

describe('AutomationSystem', () => {
  let system: AutomationSystem;

  beforeEach(() => {
    jest.useFakeTimers();
    system = new AutomationSystem();
  });

  afterEach(() => {
    if (!system.isDisposed) system.dispose();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('초기 상태가 올바르게 설정되어야 합니다', () => {
      const state = system.getState();
      expect(state.isActive).toBe(false);
      expect(state.queue.actions).toHaveLength(0);
      expect(state.queue.isRunning).toBe(false);
      expect(state.queue.isPaused).toBe(false);
      expect(state.currentAction).toBeNull();
    });

    it('초기 메트릭이 올바르게 설정되어야 합니다', () => {
      const metrics = system.getMetrics();
      expect(metrics.queueLength).toBe(0);
      expect(metrics.errorRate).toBe(0);
    });

    it('기본 설정이 올바르게 생성되어야 합니다', () => {
      const config = system.getConfig();
      expect(config.maxConcurrentActions).toBe(1);
      expect(config.defaultDelay).toBe(100);
      expect(config.retryDelay).toBe(1000);
      expect(config.timeoutDuration).toBe(5000);
    });
  });

  describe('addAction', () => {
    it('액션을 큐에 추가하고 ID를 반환해야 합니다', () => {
      const id = system.addAction({ type: 'move', target: { x: 10, y: 0, z: 10 } });
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^action_/);
      expect(system.getState().queue.actions).toHaveLength(1);
    });

    it('추가된 액션에 id와 timestamp가 설정되어야 합니다', () => {
      system.addAction({ type: 'click', target: { x: 0, y: 0, z: 0 } });
      const action = system.getState().queue.actions[0];
      expect(action).toBeDefined();
      expect(action!.id).toBeDefined();
      expect(action!.timestamp).toBeDefined();
    });

    it('여러 액션을 순서대로 추가할 수 있어야 합니다', () => {
      system.addAction({ type: 'move', target: { x: 1, y: 0, z: 0 } });
      system.addAction({ type: 'wait', duration: 500 });
      system.addAction({ type: 'click', target: { x: 2, y: 0, z: 0 } });
      expect(system.getState().queue.actions).toHaveLength(3);
    });

    it('actionAdded 이벤트가 발생해야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('actionAdded', callback);
      system.addAction({ type: 'move', target: { x: 0, y: 0, z: 0 } });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('메트릭의 queueLength가 업데이트되어야 합니다', () => {
      system.addAction({ type: 'move', target: { x: 0, y: 0, z: 0 } });
      system.addAction({ type: 'wait', duration: 100 });
      expect(system.getMetrics().queueLength).toBe(2);
    });
  });

  describe('removeAction', () => {
    it('ID로 액션을 제거하고 true를 반환해야 합니다', () => {
      const id = system.addAction({ type: 'move', target: { x: 0, y: 0, z: 0 } });
      const result = system.removeAction(id);
      expect(result).toBe(true);
      expect(system.getState().queue.actions).toHaveLength(0);
    });

    it('존재하지 않는 ID면 false를 반환해야 합니다', () => {
      const result = system.removeAction('nonexistent');
      expect(result).toBe(false);
    });

    it('actionRemoved 이벤트가 발생해야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('actionRemoved', callback);
      const id = system.addAction({ type: 'move', target: { x: 0, y: 0, z: 0 } });
      system.removeAction(id);
      expect(callback).toHaveBeenCalledWith(id);
    });
  });

  describe('clearQueue', () => {
    it('큐를 비우고 인덱스를 초기화해야 합니다', () => {
      system.addAction({ type: 'move', target: { x: 0, y: 0, z: 0 } });
      system.addAction({ type: 'wait', duration: 100 });
      system.clearQueue();
      expect(system.getState().queue.actions).toHaveLength(0);
      expect(system.getState().queue.currentIndex).toBe(0);
    });

    it('queueCleared 이벤트가 발생해야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('queueCleared', callback);
      system.clearQueue();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('start / stop / pause / resume', () => {
    it('빈 큐에서 start하면 아무 일도 일어나지 않아야 합니다', async () => {
      await system.start();
      expect(system.getState().queue.isRunning).toBe(false);
    });

    it('start 후 isRunning이 true가 되어야 합니다', async () => {
      system.addAction({ type: 'key', key: 'forward' });
      await system.start();
      expect(system.getState().queue.isRunning).toBe(true);
    });

    it('stop 후 isRunning이 false가 되어야 합니다', async () => {
      system.addAction({ type: 'key', key: 'forward' });
      await system.start();
      system.stop();
      expect(system.getState().queue.isRunning).toBe(false);
      expect(system.getState().currentAction).toBeNull();
    });

    it('pause/resume 사이클이 올바르게 동작해야 합니다', async () => {
      system.addAction({ type: 'key', key: 'forward' });
      system.addAction({ type: 'key', key: 'backward' });
      await system.start();
      system.pause();
      expect(system.getState().queue.isPaused).toBe(true);
      system.resume();
      expect(system.getState().queue.isPaused).toBe(false);
    });

    it('실행 중이 아닐 때 resume해도 아무 일도 일어나지 않아야 합니다', () => {
      system.resume();
      expect(system.getState().queue.isRunning).toBe(false);
    });

    it('automationStarted/Stopped 이벤트가 발생해야 합니다', async () => {
      const startCb = jest.fn();
      const stopCb = jest.fn();
      system.addEventListener('automationStarted', startCb);
      system.addEventListener('automationStopped', stopCb);

      system.addAction({ type: 'key', key: 'test' });
      await system.start();
      system.stop();

      expect(startCb).toHaveBeenCalledTimes(1);
      expect(stopCb).toHaveBeenCalledTimes(1);
    });
  });

  describe('action execution', () => {
    it('move 액션이 moveRequested 이벤트를 발생시켜야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('moveRequested', callback);
      const target = { x: 10, y: 0, z: 10 };
      system.addAction({ type: 'move', target });
      await system.start();
      expect(callback).toHaveBeenCalledWith(target);
    });

    it('click 액션이 clickRequested 이벤트를 발생시켜야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('clickRequested', callback);
      const target = { x: 5, y: 0, z: 5 };
      system.addAction({ type: 'click', target });
      await system.start();
      expect(callback).toHaveBeenCalledWith(target);
    });

    it('key 액션이 keyRequested 이벤트를 발생시켜야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('keyRequested', callback);
      system.addAction({ type: 'key', key: 'forward' });
      await system.start();
      expect(callback).toHaveBeenCalledWith('forward');
    });

    it('custom 액션이 customActionRequested 이벤트를 발생시켜야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('customActionRequested', callback);
      const data = { someData: 'test' };
      system.addAction({ type: 'custom', data });
      await system.start();
      expect(callback).toHaveBeenCalledWith(data);
    });

    it('beforeCallback/afterCallback이 호출되어야 합니다', async () => {
      const before = jest.fn();
      const after = jest.fn();
      system.addAction({
        type: 'key',
        key: 'test',
        beforeCallback: before,
        afterCallback: after,
      });
      await system.start();
      expect(before).toHaveBeenCalledTimes(1);
      expect(after).toHaveBeenCalledTimes(1);
    });

    it('실행 완료 후 executionStats가 업데이트되어야 합니다', async () => {
      system.addAction({ type: 'key', key: 'forward' });
      await system.start();
      expect(system.getState().executionStats.totalExecuted).toBeGreaterThan(0);
    });
  });

  describe('sequential execution', () => {
    it('다음 액션은 delay 후에 실행되어야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('actionStarted', callback);
      system.addAction({ type: 'key', key: 'a' });
      system.addAction({ type: 'key', key: 'b' });
      await system.start();

      expect(callback).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(200);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('모든 액션 완료 후 automationCompleted 이벤트가 발생해야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('automationCompleted', callback);
      system.addAction({ type: 'key', key: 'a' });
      await system.start();

      jest.advanceTimersByTime(200);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('settings', () => {
    it('updateSettings로 설정을 변경할 수 있어야 합니다', () => {
      system.updateSettings({ throttle: 200, showVisualCues: false });
      const state = system.getState();
      expect(state.settings.throttle).toBe(200);
      expect(state.settings.showVisualCues).toBe(false);
    });
  });

  describe('event system', () => {
    it('addEventListener/removeEventListener가 올바르게 동작해야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('test', callback);
      system.removeEventListener('test', callback);
      system.addAction({ type: 'key', key: 'test' });
    });

    it('존재하지 않는 이벤트에서 리스너 제거 시 에러가 없어야 합니다', () => {
      expect(() => system.removeEventListener('nonexistent', jest.fn())).not.toThrow();
    });
  });

  describe('lifecycle', () => {
    it('reset이 큐를 비우고 실행을 멈춰야 합니다', async () => {
      system.addAction({ type: 'key', key: 'test' });
      await system.start();
      system.reset();
      expect(system.getState().queue.actions).toHaveLength(0);
      expect(system.getState().queue.isRunning).toBe(false);
    });

    it('dispose가 실행을 멈추고 이벤트를 정리해야 합니다', async () => {
      const callback = jest.fn();
      system.addEventListener('test', callback);
      system.addAction({ type: 'key', key: 'test' });
      await system.start();
      system.dispose();
      expect(system.isDisposed).toBe(true);
    });
  });
});
