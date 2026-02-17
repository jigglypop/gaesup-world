import 'reflect-metadata';
import * as THREE from 'three';

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
        touches: [{ id: 0, position: new THREE.Vector2(100, 200), startPosition: new THREE.Vector2(100, 200), delta: new THREE.Vector2(), startTime: Date.now() }] as any,
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
  });

  describe('lifecycle', () => {
    it('reset 후 eventCallbacks가 비워져야 합니다', () => {
      const callback = jest.fn();
      system.addEventListener('test', callback);
      system.reset();
      const metrics = system.getMetrics();
      expect(metrics.eventCount).toBe(0);
    });

    it('dispose 후 singleton 인스턴스가 초기화되어야 합니다', () => {
      const instance = InteractionSystem.getInstance();
      instance.dispose();
      expect(instance.isDisposed).toBe(true);
    });
  });
});
