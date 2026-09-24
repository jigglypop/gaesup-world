import 'reflect-metadata';

import { useGaesupStore } from '../gaesupStore';

describe('gaesupStore', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetMode();
    useGaesupStore.getState().resetPhysics();
  });

  describe('store initialization', () => {
    it('스토어가 올바르게 생성되어야 합니다', () => {
      const state = useGaesupStore.getState();
      expect(state).toBeDefined();
    });

    it('모든 슬라이스가 존재해야 합니다', () => {
      const state = useGaesupStore.getState();
      expect(state.mode).toBeDefined();
      expect(state.urls).toBeDefined();
      expect(state.physics).toBeDefined();
    });
  });

  describe('mode slice', () => {
    it('기본 모드 타입은 character여야 합니다', () => {
      const state = useGaesupStore.getState();
      expect(state.mode.type).toBe('character');
      expect(state.mode.controller).toBe('keyboard');
      expect(state.mode.control).toBe('thirdPerson');
    });

    it('setMode로 모드 타입을 변경할 수 있어야 합니다', () => {
      useGaesupStore.getState().setMode({ type: 'vehicle' });
      expect(useGaesupStore.getState().mode.type).toBe('vehicle');
    });

    it('setMode로 airplane 모드로 변경할 수 있어야 합니다', () => {
      useGaesupStore.getState().setMode({ type: 'airplane' });
      expect(useGaesupStore.getState().mode.type).toBe('airplane');
    });

    it('setMode 부분 업데이트 시 다른 값은 유지되어야 합니다', () => {
      useGaesupStore.getState().setMode({ type: 'vehicle' });
      const mode = useGaesupStore.getState().mode;
      expect(mode.type).toBe('vehicle');
      expect(mode.controller).toBe('keyboard');
      expect(mode.control).toBe('thirdPerson');
    });

    it('resetMode로 초기 상태로 복원할 수 있어야 합니다', () => {
      useGaesupStore.getState().setMode({ type: 'airplane', controller: 'gamepad' });
      useGaesupStore.getState().resetMode();
      const mode = useGaesupStore.getState().mode;
      expect(mode.type).toBe('character');
      expect(mode.controller).toBe('keyboard');
    });
  });

  describe('physics slice', () => {
    it('기본 physics 설정이 존재해야 합니다', () => {
      const state = useGaesupStore.getState();
      expect(state.physics).toBeDefined();
    });

    it('setPhysics로 물리 설정을 업데이트할 수 있어야 합니다', () => {
      useGaesupStore.getState().setPhysics({ maxSpeed: 20 });
      expect(useGaesupStore.getState().physics.maxSpeed).toBe(20);
    });

    it('부분 업데이트 시 다른 값은 유지되어야 합니다', () => {
      const before = { ...useGaesupStore.getState().physics };
      useGaesupStore.getState().setPhysics({ maxSpeed: 99 });
      const after = useGaesupStore.getState().physics;
      expect(after.maxSpeed).toBe(99);
      expect(after.walkSpeed).toBe(before.walkSpeed);
    });

    it('starts from the physics defaults', () => {
      const mainPhysics = useGaesupStore.getState().physics;

      expect(mainPhysics.angleDelta?.toArray()).toEqual([0.02, 0.02, 0.02]);
      expect(mainPhysics.maxAngle?.toArray()).toEqual([
        Math.PI / 6,
        Math.PI,
        Math.PI / 6,
      ]);
      expect(mainPhysics.walkSpeed).toBe(10);
    });

    it('restores fresh physics defaults on reset', () => {
      const previousMain = useGaesupStore.getState().physics;
      const previousMainAngleDelta = previousMain.angleDelta;
      const previousMainMaxAngle = previousMain.maxAngle;

      previousMain.angleDelta?.set(9, 9, 9);
      previousMain.maxAngle?.set(8, 8, 8);
      useGaesupStore.getState().setPhysics({ walkSpeed: 99 });

      useGaesupStore.getState().resetPhysics();

      const nextMain = useGaesupStore.getState().physics;
      expect(nextMain).not.toBe(previousMain);
      expect(nextMain.angleDelta).not.toBe(previousMainAngleDelta);
      expect(nextMain.maxAngle).not.toBe(previousMainMaxAngle);
      expect(nextMain.angleDelta?.toArray()).toEqual([0.02, 0.02, 0.02]);
      expect(nextMain.maxAngle?.toArray()).toEqual([
        Math.PI / 6,
        Math.PI,
        Math.PI / 6,
      ]);
      expect(nextMain).toHaveProperty('buoyancy', undefined);
      expect(nextMain).toHaveProperty('navigationAgentRadius', undefined);
      expect(nextMain).toHaveProperty('turnSpeed', undefined);
      expect(nextMain).toHaveProperty('wheelOffset', undefined);
      expect(nextMain.walkSpeed).toBe(10);
    });
  });

  describe('urls slice', () => {
    it('기본 urls 설정이 존재해야 합니다', () => {
      const state = useGaesupStore.getState();
      expect(state.urls).toBeDefined();
    });
  });

  describe('subscribeWithSelector', () => {
    it('특정 슬라이스 변경을 구독할 수 있어야 합니다', () => {
      const callback = jest.fn();
      const unsubscribe = useGaesupStore.subscribe(
        (state) => state.mode.type,
        callback,
      );

      useGaesupStore.getState().setMode({ type: 'vehicle' });
      expect(callback).toHaveBeenCalledWith('vehicle', 'character');

      unsubscribe();
    });

    it('구독 해제 후 콜백이 호출되지 않아야 합니다', () => {
      const callback = jest.fn();
      const unsubscribe = useGaesupStore.subscribe(
        (state) => state.mode.type,
        callback,
      );
      unsubscribe();

      useGaesupStore.getState().setMode({ type: 'airplane' });
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
