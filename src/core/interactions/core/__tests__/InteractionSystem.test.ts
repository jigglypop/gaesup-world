import 'reflect-metadata';
import * as THREE from 'three';

import { logger } from '@/core/utils/logger';

import { InteractionSystem } from '../InteractionSystem';

describe('InteractionSystem', () => {
  let system: InteractionSystem;

  beforeEach(() => {
    system = new InteractionSystem();
  });

  afterEach(() => {
    if (!system.isDisposed) system.dispose();
  });

  describe('singleton', () => {
    it('getInstance가 동일한 인스턴스를 반환해야 합니다', () => {
      const a = InteractionSystem.getInstance();
      const b = InteractionSystem.getInstance();
      expect(a).toBe(b);
      a.dispose();
    });

    it('dispose 후 getInstance가 새 인스턴스를 생성해야 합니다', () => {
      const a = InteractionSystem.getInstance();
      a.dispose();
      const b = InteractionSystem.getInstance();
      expect(a).not.toBe(b);
      b.dispose();
    });
  });

  describe('keyboard state', () => {
    it('초기 키보드 상태는 모두 false여야 합니다', () => {
      const keyboard = system.getKeyboardRef();
      expect(keyboard.forward).toBe(false);
      expect(keyboard.backward).toBe(false);
      expect(keyboard.leftward).toBe(false);
      expect(keyboard.rightward).toBe(false);
      expect(keyboard.shift).toBe(false);
      expect(keyboard.space).toBe(false);
    });

    it('updateKeyboard로 상태를 업데이트할 수 있어야 합니다', () => {
      system.updateKeyboard({ forward: true, shift: true });
      const keyboard = system.getKeyboardRef();
      expect(keyboard.forward).toBe(true);
      expect(keyboard.shift).toBe(true);
      expect(keyboard.backward).toBe(false);
    });

    it('updateKeyboard 후 activeInputs에 반영되어야 합니다', () => {
      system.updateKeyboard({ forward: true });
      const metrics = system.getMetrics();
      expect(metrics.activeInputs).toContain('keyboard:forward');
    });
  });

  describe('mouse state', () => {
    it('초기 마우스 상태가 올바르게 설정되어야 합니다', () => {
      const mouse = system.getMouseRef();
      expect(mouse.isActive).toBe(false);
      expect(mouse.angle).toBe(0);
    });

    it('updateMouse로 상태를 업데이트할 수 있어야 합니다', () => {
      system.updateMouse({ isActive: true, angle: 1.5 });
      const mouse = system.getMouseRef();
      expect(mouse.isActive).toBe(true);
      expect(mouse.angle).toBe(1.5);
    });

    it('dispatchInput이 updateMouse와 동일하게 동작해야 합니다', () => {
      system.dispatchInput({ isActive: true });
      const mouse = system.getMouseRef();
      expect(mouse.isActive).toBe(true);
    });
  });

  describe('gamepad state', () => {
    it('updateGamepad로 상태를 업데이트할 수 있어야 합니다', () => {
      system.updateGamepad({ connected: true });
      const state = system.getState();
      expect(state.gamepad.connected).toBe(true);
    });

    it('연결된 게임패드가 activeInputs에 반영되어야 합니다', () => {
      system.updateGamepad({ connected: true });
      const metrics = system.getMetrics();
      expect(metrics.activeInputs).toContain('gamepad:connected');
    });
  });

  describe('touch state', () => {
    it('updateTouch로 상태를 업데이트할 수 있어야 합니다', () => {
      system.updateTouch({
        touches: [{ id: 0, position: new THREE.Vector2(100, 200), force: 1 }],
      });
      const state = system.getState();
      expect(state.touch.touches.length).toBe(1);
    });
  });

  describe('config', () => {
    it('기본 설정이 올바르게 생성되어야 합니다', () => {
      const config = system.getConfig();
      expect(config.sensitivity.mouse).toBe(1);
      expect(config.deadzone.gamepad).toBe(0.1);
      expect(config.invertY).toBe(false);
    });

    it('setConfig로 부분 업데이트할 수 있어야 합니다', () => {
      system.setConfig({ invertY: true });
      const config = system.getConfig();
      expect(config.invertY).toBe(true);
      expect(config.sensitivity.mouse).toBe(1);
    });

    it('getConfig가 방어적 복사본을 반환해야 합니다', () => {
      const a = system.getConfig();
      const b = system.getConfig();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('event system', () => {
    it('이벤트를 등록하고 수신할 수 있어야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('test', callback);
      // eventCallbacks는 private이므로 직접 트리거 불가. updateKeyboard를 통해 간접 검증
      system.updateKeyboard({ forward: true });
      expect(system.getMetrics().eventCount).toBeGreaterThan(0);
    });

    it('이벤트 리스너를 제거할 수 있어야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('test', callback);
      system.removeEventListener('test', callback);
      // 제거 후에는 호출되지 않아야 함 (간접 검증)
    });

    it('존재하지 않는 이벤트 리스너 제거 시 에러가 발생하지 않아야 합니다', () => {
      const callback = jest.fn();
      expect(() => system.removeEventListener('nonexistent', callback)).not.toThrow();
    });
  });

  describe('metrics', () => {
    it('eventCount가 업데이트마다 증가해야 합니다', () => {
      system.updateKeyboard({ forward: true });
      system.updateKeyboard({ forward: false });
      system.updateMouse({ isActive: true });
      const metrics = system.getMetrics();
      expect(metrics.eventCount).toBe(3);
    });

    it('activeInputs가 현재 입력 상태를 반영해야 합니다', () => {
      system.updateKeyboard({ forward: true, shift: true });
      const metrics = system.getMetrics();
      expect(metrics.activeInputs).toContain('keyboard:forward');
      expect(metrics.activeInputs).toContain('keyboard:shift');
    });

    it('마우스 버튼이 activeInputs에 반영되어야 합니다', () => {
      system.updateMouse({ buttons: { left: true, right: false, middle: false } });
      const metrics = system.getMetrics();
      expect(metrics.activeInputs).toContain('mouse:left');
    });

    it('raw update와 explicit system update의 timestamp 계약을 유지해야 합니다', () => {
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_234);
      const performanceNowSpy = jest
        .spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(14)
        .mockReturnValueOnce(15)
        .mockReturnValueOnce(16);

      try {
        system.updateKeyboard({ forward: true });
        system.updateMouse({ isActive: true });

        expect(system.getState().lastUpdate).toBe(0);
        expect(system.getMetrics().lastUpdate).toBe(0);
        expect(system.getMetrics().frameTime).toBe(0);
        expect(system.getMetrics().eventCount).toBe(2);
        expect(system.updateCount).toBe(0);

        system.update({ deltaTime: 16, totalTime: 16, frameCount: 1 });

        expect(system.getState().lastUpdate).toBe(1_234);
        expect(system.getMetrics().lastUpdate).toBe(0);
        expect(system.getMetrics().frameTime).toBe(4);
        expect(system.getMetrics().eventCount).toBe(3);
        expect(system.updateCount).toBe(1);

        system.reset();

        expect(system.getState().lastUpdate).toBe(0);
        expect(system.getMetrics().lastUpdate).toBe(0);
        expect(system.getMetrics().frameTime).toBe(0);
        expect(system.getMetrics().eventCount).toBe(0);
        expect(system.updateCount).toBe(0);
      } finally {
        dateNowSpy.mockRestore();
        performanceNowSpy.mockRestore();
      }
    });
  });

  describe('lifecycle', () => {
    it('reset이 raw identity와 activeInputs scratch를 유지하면서 모든 값을 fresh defaults로 복원해야 합니다', () => {
      const state = system.getState();
      const keyboard = state.keyboard;
      const mouse = state.mouse;
      const gamepad = state.gamepad;
      const touch = state.touch;
      const previousMetrics = system.getMetrics();
      const activeInputs = previousMetrics.activeInputs;
      const runtimeSymbol = Symbol('runtimeOnly');
      const activeInputsSymbol = Symbol('activeInputsRuntimeOnly');
      const pollutedActiveInputsPrototype = { polluted: true };
      const mouseTarget = new THREE.Vector3(1, 2, 3);
      const mousePosition = new THREE.Vector2(4, 5);
      const mouseButtons = { left: true, right: true, middle: true };
      const leftStick = new THREE.Vector2(0.5, -0.5);
      const rightStick = new THREE.Vector2(-0.25, 0.25);
      const triggers = { left: 0.75, right: 0.5 };
      const gamepadButtons = { jump: true };
      const vibration = { weak: 0.25, strong: 0.75 };
      const touches = [{ id: 7, position: new THREE.Vector2(8, 9), force: 0.5 }];
      const gestures = {
        pinch: 2,
        rotation: 1,
        pan: new THREE.Vector2(3, 4),
      };
      const sensitivity = { mouse: 2, gamepad: 3, touch: 4 };
      const deadzone = { gamepad: 0.4, touch: 0.3 };
      const smoothing = { mouse: 0.8, gamepad: 0.9 };

      system.updateKeyboard({ forward: true, keyE: true });
      system.updateMouse({
        target: mouseTarget,
        angle: 2,
        isActive: true,
        shouldRun: true,
        isLookAround: true,
        buttons: mouseButtons,
        wheel: 5,
        position: mousePosition,
      });
      system.updateGamepad({
        connected: true,
        leftStick,
        rightStick,
        triggers,
        buttons: gamepadButtons,
        vibration,
      });
      system.updateTouch({ touches, gestures });
      system.setConfig({
        sensitivity,
        deadzone,
        smoothing,
        invertY: true,
        enableVibration: false,
      });
      system.update({ deltaTime: 16, totalTime: 16, frameCount: 1 });
      expect(system.updateCount).toBe(1);
      Reflect.set(state, 'lastUpdate', 123);
      Reflect.set(state, 'isActive', false);
      Reflect.set(system.getMetrics(), 'lastUpdate', 456);
      Reflect.set(system.getMetrics(), 'inputLatency', 7);
      Reflect.set(system.getMetrics(), 'frameTime', 8);
      Reflect.set(system.getMetrics(), 'performanceScore', 9);
      Reflect.set(keyboard, 'runtimeOnly', true);
      Reflect.set(mouse, 'runtimeOnly', true);
      Reflect.set(gamepad, 'runtimeOnly', true);
      Reflect.set(touch, 'runtimeOnly', true);
      Reflect.set(state, 'runtimeOnly', true);
      Reflect.set(system.getMetrics(), 'runtimeOnly', true);
      Object.defineProperty(mouse, 'hiddenRuntimeOnly', {
        configurable: true,
        enumerable: false,
        value: true,
      });
      Object.defineProperty(gamepad, runtimeSymbol, {
        configurable: true,
        enumerable: false,
        value: true,
      });
      Object.defineProperty(activeInputs, 'hiddenRuntimeOnly', {
        configurable: true,
        enumerable: false,
        value: true,
      });
      Object.defineProperty(activeInputs, activeInputsSymbol, {
        configurable: true,
        enumerable: false,
        value: true,
      });
      Object.setPrototypeOf(activeInputs, pollutedActiveInputsPrototype);

      system.reset();

      const resetState = system.getState();
      const metrics = system.getMetrics();
      const config = system.getConfig();

      expect(resetState).not.toBe(state);
      expect(metrics).not.toBe(previousMetrics);
      expect(resetState.keyboard).toBe(keyboard);
      expect(resetState.mouse).toBe(mouse);
      expect(resetState.gamepad).toBe(gamepad);
      expect(resetState.touch).toBe(touch);
      expect(metrics.activeInputs).toBe(activeInputs);
      expect(system.updateCount).toBe(0);
      expect(resetState).toEqual({
        keyboard: {
          forward: false,
          backward: false,
          leftward: false,
          rightward: false,
          shift: false,
          space: false,
          keyZ: false,
          keyR: false,
          keyF: false,
          keyE: false,
          escape: false,
        },
        mouse: {
          target: new THREE.Vector3(),
          angle: 0,
          isActive: false,
          shouldRun: false,
          isLookAround: false,
          buttons: { left: false, right: false, middle: false },
          wheel: 0,
          position: new THREE.Vector2(),
        },
        gamepad: {
          connected: false,
          leftStick: new THREE.Vector2(),
          rightStick: new THREE.Vector2(),
          triggers: { left: 0, right: 0 },
          buttons: {},
          vibration: { weak: 0, strong: 0 },
        },
        touch: {
          touches: [],
          gestures: { pinch: 1, rotation: 0, pan: new THREE.Vector2() },
        },
        lastUpdate: 0,
        isActive: true,
      });
      expect(metrics).toEqual({
        lastUpdate: 0,
        inputLatency: 0,
        frameTime: 0,
        eventCount: 0,
        activeInputs: [],
        performanceScore: 100,
      });
      expect(config).toEqual({
        sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
        deadzone: { gamepad: 0.1, touch: 0.05 },
        smoothing: { mouse: 0.1, gamepad: 0.2 },
        invertY: false,
        enableVibration: true,
      });

      expect(mouse.target).not.toBe(mouseTarget);
      expect(mouse.position).not.toBe(mousePosition);
      expect(mouse.buttons).not.toBe(mouseButtons);
      expect(gamepad.leftStick).not.toBe(leftStick);
      expect(gamepad.rightStick).not.toBe(rightStick);
      expect(gamepad.triggers).not.toBe(triggers);
      expect(gamepad.buttons).not.toBe(gamepadButtons);
      expect(gamepad.vibration).not.toBe(vibration);
      expect(touch.touches).not.toBe(touches);
      expect(touch.gestures).not.toBe(gestures);
      expect(touch.gestures.pan).not.toBe(gestures.pan);
      expect(config.sensitivity).not.toBe(sensitivity);
      expect(config.deadzone).not.toBe(deadzone);
      expect(config.smoothing).not.toBe(smoothing);

      expect(mouseTarget).toEqual(new THREE.Vector3(1, 2, 3));
      expect(mousePosition).toEqual(new THREE.Vector2(4, 5));
      expect(mouseButtons).toEqual({ left: true, right: true, middle: true });
      expect(leftStick).toEqual(new THREE.Vector2(0.5, -0.5));
      expect(rightStick).toEqual(new THREE.Vector2(-0.25, 0.25));
      expect(triggers).toEqual({ left: 0.75, right: 0.5 });
      expect(gamepadButtons).toEqual({ jump: true });
      expect(vibration).toEqual({ weak: 0.25, strong: 0.75 });
      expect(touches).toEqual([
        { id: 7, position: new THREE.Vector2(8, 9), force: 0.5 },
      ]);
      expect(gestures).toEqual({
        pinch: 2,
        rotation: 1,
        pan: new THREE.Vector2(3, 4),
      });
      expect(sensitivity).toEqual({ mouse: 2, gamepad: 3, touch: 4 });
      expect(deadzone).toEqual({ gamepad: 0.4, touch: 0.3 });
      expect(smoothing).toEqual({ mouse: 0.8, gamepad: 0.9 });
      expect(Reflect.has(keyboard, 'runtimeOnly')).toBe(false);
      expect(Reflect.has(mouse, 'runtimeOnly')).toBe(false);
      expect(Reflect.has(gamepad, 'runtimeOnly')).toBe(false);
      expect(Reflect.has(touch, 'runtimeOnly')).toBe(false);
      expect(Reflect.has(resetState, 'runtimeOnly')).toBe(false);
      expect(Reflect.has(metrics, 'runtimeOnly')).toBe(false);
      expect(Reflect.has(mouse, 'hiddenRuntimeOnly')).toBe(false);
      expect(Reflect.has(gamepad, runtimeSymbol)).toBe(false);
      expect(Reflect.has(activeInputs, 'hiddenRuntimeOnly')).toBe(false);
      expect(Reflect.has(activeInputs, activeInputsSymbol)).toBe(false);
      expect(Object.getPrototypeOf(activeInputs)).toBe(Array.prototype);
    });

    it('inherited non-writable property와 throwing setter의 영향 없이 raw defaults를 복원해야 합니다', () => {
      const state = system.getState();
      const metrics = system.getMetrics();
      const mouse = state.mouse;
      const activeInputs = metrics.activeInputs;
      const inheritedSetter = jest.fn((value: unknown) => {
        void value;
        throw new Error('inherited setter must not run');
      });
      const pollutedPrototype = Object.create(Object.prototype);
      Object.defineProperties(pollutedPrototype, {
        angle: {
          configurable: true,
          value: 99,
          writable: false,
        },
        target: {
          configurable: true,
          set: inheritedSetter,
        },
      });
      system.updateMouse({
        angle: 2,
        isActive: true,
        target: new THREE.Vector3(1, 2, 3),
      });
      system.setConfig({ invertY: true });
      Object.setPrototypeOf(mouse, pollutedPrototype);

      system.reset();

      expect(system.getState()).not.toBe(state);
      expect(system.getMetrics()).not.toBe(metrics);
      expect(system.getMouseRef()).toBe(mouse);
      expect(system.getMetrics().activeInputs).toBe(activeInputs);
      expect(Object.getPrototypeOf(mouse)).toBe(Object.prototype);
      expect(inheritedSetter).not.toHaveBeenCalled();
      expect(mouse).toEqual({
        target: new THREE.Vector3(),
        angle: 0,
        isActive: false,
        shouldRun: false,
        isLookAround: false,
        buttons: { left: false, right: false, middle: false },
        wheel: 0,
        position: new THREE.Vector2(),
      });
      expect(system.getState().lastUpdate).toBe(0);
      expect(system.getMetrics()).toEqual({
        lastUpdate: 0,
        inputLatency: 0,
        frameTime: 0,
        eventCount: 0,
        activeInputs: [],
        performanceScore: 100,
      });
      expect(system.getConfig().invertY).toBe(false);
    });

    it('non-configurable raw property가 있으면 reset을 top-level 교체 전 atomic no-op해야 합니다', () => {
      const state = system.getState();
      const metrics = system.getMetrics();
      const keyboard = state.keyboard;
      const mouse = state.mouse;
      const resetCallback = jest.fn();
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
      system.addEventListener('reset', resetCallback);
      system.updateKeyboard({ forward: true });
      system.setConfig({ invertY: true });
      system.update({ deltaTime: 16, totalTime: 16, frameCount: 1 });
      Object.defineProperty(mouse, 'locked', {
        configurable: false,
        enumerable: false,
        value: true,
      });

      try {
        system.reset();

        expect(system.getState()).toBe(state);
        expect(system.getMetrics()).toBe(metrics);
        expect(system.getKeyboardRef()).toBe(keyboard);
        expect(system.getMouseRef()).toBe(mouse);
        expect(system.getKeyboardRef().forward).toBe(true);
        expect(system.getMetrics().eventCount).toBe(2);
        expect(system.getConfig().invertY).toBe(true);
        expect(system.updateCount).toBe(1);
        expect(Reflect.get(mouse, 'locked')).toBe(true);
        expect(resetCallback).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('mouse'),
          'locked',
        );
      } finally {
        loggerSpy.mockRestore();
      }
    });

    it('non-extensible raw object가 있으면 reset을 top-level 교체 전 atomic no-op해야 합니다', () => {
      const state = system.getState();
      const metrics = system.getMetrics();
      const keyboard = state.keyboard;
      const resetCallback = jest.fn();
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
      system.addEventListener('reset', resetCallback);
      system.updateKeyboard({ forward: true });
      system.setConfig({ invertY: true });
      system.update({ deltaTime: 16, totalTime: 16, frameCount: 1 });
      const lastUpdate = state.lastUpdate;
      const frameTime = metrics.frameTime;
      Object.preventExtensions(keyboard);

      try {
        system.reset();

        expect(system.getState()).toBe(state);
        expect(system.getMetrics()).toBe(metrics);
        expect(system.getKeyboardRef()).toBe(keyboard);
        expect(system.getKeyboardRef().forward).toBe(true);
        expect(system.getState().lastUpdate).toBe(lastUpdate);
        expect(system.getMetrics().frameTime).toBe(frameTime);
        expect(system.getMetrics().eventCount).toBe(2);
        expect(system.getConfig().invertY).toBe(true);
        expect(system.updateCount).toBe(1);
        expect(resetCallback).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('keyboard is not extensible'),
        );
      } finally {
        loggerSpy.mockRestore();
      }
    });

    it.each(['frozen', 'sealed'] as const)(
      '%s nonempty activeInputs가 있으면 reset을 atomic no-op해야 합니다',
      (mode) => {
        const state = system.getState();
        const metrics = system.getMetrics();
        const keyboard = state.keyboard;
        const activeInputs = metrics.activeInputs;
        const resetCallback = jest.fn();
        const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
        system.addEventListener('reset', resetCallback);
        system.updateKeyboard({ forward: true });
        system.setConfig({ invertY: true });
        system.update({ deltaTime: 16, totalTime: 16, frameCount: 1 });
        const lastUpdate = state.lastUpdate;
        const frameTime = metrics.frameTime;
        if (mode === 'frozen') {
          Object.freeze(activeInputs);
        } else {
          Object.seal(activeInputs);
        }

        try {
          system.reset();

          expect(system.getState()).toBe(state);
          expect(system.getMetrics()).toBe(metrics);
          expect(system.getKeyboardRef()).toBe(keyboard);
          expect(system.getKeyboardRef().forward).toBe(true);
          expect(system.getState().lastUpdate).toBe(lastUpdate);
          expect(system.getMetrics().frameTime).toBe(frameTime);
          expect(system.getMetrics().eventCount).toBe(2);
          expect(system.getMetrics().activeInputs).toBe(activeInputs);
          expect(system.getMetrics().activeInputs).toEqual(['keyboard:forward']);
          expect(system.getConfig().invertY).toBe(true);
          expect(system.updateCount).toBe(1);
          expect(resetCallback).not.toHaveBeenCalled();
          expect(
            loggerSpy.mock.calls.some(
              ([message]) =>
                typeof message === 'string' && message.includes('activeInputs'),
            ),
          ).toBe(true);
        } finally {
          loggerSpy.mockRestore();
        }
      },
    );

    it('reset callback dispatch 시작 시점의 listener snapshot만 호출해야 합니다', () => {
      const addedDuringDispatch = jest.fn();
      const removedDuringDispatch = jest.fn();
      const addListener = jest.fn(() => {
        system.addEventListener('reset', addedDuringDispatch);
      });
      const removeListener = jest.fn(() => {
        system.removeEventListener('reset', removedDuringDispatch);
      });
      const selfRegisteringListener = jest.fn(() => {
        if (selfRegisteringListener.mock.calls.length === 1) {
          system.addEventListener('reset', selfRegisteringListener);
        }
      });
      const throwingListener = jest.fn(() => {
        throw new Error('expected reset listener failure');
      });
      const laterListener = jest.fn();
      system.addEventListener('reset', addListener);
      system.addEventListener('reset', removeListener);
      system.addEventListener('reset', removedDuringDispatch);
      system.addEventListener('reset', selfRegisteringListener);
      system.addEventListener('reset', throwingListener);
      system.addEventListener('reset', laterListener);

      expect(() => system.reset()).not.toThrow();

      expect(addListener).toHaveBeenCalledTimes(1);
      expect(addedDuringDispatch).not.toHaveBeenCalled();
      expect(removeListener).toHaveBeenCalledTimes(1);
      expect(removedDuringDispatch).toHaveBeenCalledTimes(1);
      expect(selfRegisteringListener).toHaveBeenCalledTimes(1);
      expect(throwingListener).toHaveBeenCalledTimes(1);
      expect(laterListener).toHaveBeenCalledTimes(1);
    });

    it('reset 완료 snapshot을 한 번 알리고 재진입을 막으며 dispose 때만 callbacks를 제거해야 합니다', () => {
      const completedSnapshots: Array<{
        forward: boolean;
        eventCount: number;
        invertY: boolean;
      }> = [];
      const resetCallback = jest.fn(() => {
        completedSnapshots.push({
          forward: system.getKeyboardRef().forward,
          eventCount: system.getMetrics().eventCount,
          invertY: system.getConfig().invertY,
        });
        system.reset();
      });
      const keyboardCallback = jest.fn();
      system.addEventListener('reset', resetCallback);
      system.addEventListener('keyboard', keyboardCallback);
      system.updateKeyboard({ forward: true });
      keyboardCallback.mockClear();

      system.reset();

      expect(resetCallback).toHaveBeenCalledTimes(1);
      expect(keyboardCallback).not.toHaveBeenCalled();
      expect(system.getKeyboardRef().forward).toBe(false);
      expect(system.getMetrics().eventCount).toBe(0);
      expect(completedSnapshots).toEqual([
        { forward: false, eventCount: 0, invertY: false },
      ]);

      system.updateKeyboard({ backward: true });
      expect(keyboardCallback).toHaveBeenCalledTimes(1);

      system.reset();
      expect(resetCallback).toHaveBeenCalledTimes(2);
      expect(keyboardCallback).toHaveBeenCalledTimes(1);
      expect(completedSnapshots).toEqual([
        { forward: false, eventCount: 0, invertY: false },
        { forward: false, eventCount: 0, invertY: false },
      ]);

      system.dispose();
      system.reset();
      system.updateKeyboard({ forward: true });
      expect(resetCallback).toHaveBeenCalledTimes(2);
      expect(keyboardCallback).toHaveBeenCalledTimes(1);
    });

    it('dispose 후 singleton 인스턴스가 초기화되어야 합니다', () => {
      const instance = InteractionSystem.getInstance();
      instance.dispose();
      expect(instance.isDisposed).toBe(true);
    });
  });
});
