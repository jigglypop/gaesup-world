import 'reflect-metadata';
import * as THREE from 'three';

import { CameraSystem } from '../CameraSystem';
import { BaseCameraSystem } from '../../bridge/BaseCameraSystem';
import type { CameraCalcProps, CameraState } from '../types';
import type { CameraSystemConfig } from '../../bridge/types';
import type { ActiveStateType } from '../../../motions/core/types';

const createDefaultSystemConfig = (): CameraSystemConfig => ({
  mode: 'thirdPerson',
  distance: { x: 15, y: 8, z: 15 },
  enableCollision: true,
  smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
  fov: 75,
  zoom: 1,
});

const createMockActiveState = (): ActiveStateType => ({
  euler: new THREE.Euler(),
  position: new THREE.Vector3(0, 1, 0),
  quaternion: new THREE.Quaternion(),
  isGround: true,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(0, 0, 1),
  dir: new THREE.Vector3(0, 0, 1),
  angular: new THREE.Vector3(),
});

const createCalcProps = (): CameraCalcProps => ({
  camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
  scene: new THREE.Scene(),
  deltaTime: 0.016,
  activeState: createMockActiveState(),
  clock: new THREE.Clock(),
});

describe('CameraSystem', () => {
  let system: CameraSystem;

  beforeEach(() => {
    system = new CameraSystem(createDefaultSystemConfig());
  });

  afterEach(() => {
    system.destroy();
  });

  describe('constructor', () => {
    it('기본 컨트롤러가 등록되어야 합니다', () => {
      const props = createCalcProps();
      expect(() => system.calculate(props)).not.toThrow();
    });

    it('기본 카메라 상태 "default"가 존재해야 합니다', () => {
      const state = system.getCameraState('default');
      expect(state).toBeDefined();
      expect(state!.type).toBe('thirdPerson');
      expect(state!.name).toBe('default');
    });

    it('현재 카메라 상태가 "default"여야 합니다', () => {
      const current = system.getCurrentCameraState();
      expect(current).toBeDefined();
      expect(current!.name).toBe('default');
    });
  });

  describe('updateConfig', () => {
    it('내부 state.config을 업데이트해야 합니다', () => {
      system.updateConfig({ mode: 'firstPerson' });
      // CameraSystem.updateConfig은 this.state.config에 반영
      // calculate에서 mode 기반 컨트롤러 선택에 영향
      const props = createCalcProps();
      expect(() => system.calculate(props)).not.toThrow();
    });

    it('BaseCameraSystem.getConfig은 base config를 반환합니다', () => {
      const config = system.getConfig();
      expect(config.enableCollision).toBe(true);
      expect(config.distance).toEqual({ x: 15, y: 8, z: 15 });
    });
  });

  describe('update', () => {
    it('프레임 메트릭이 업데이트되어야 합니다', () => {
      system.update(0.016);
      system.update(0.016);
      const metrics = system.getMetrics();
      expect(metrics.frameCount).toBe(2);
      expect(metrics.averageFrameTime).toBeCloseTo(0.016, 5);
    });

    it('deltaTime에 따라 totalFrameTime이 누적되어야 합니다', () => {
      system.update(0.016);
      system.update(0.032);
      const metrics = system.getMetrics();
      expect(metrics.averageFrameTime).toBeCloseTo(0.024, 5);
    });
  });

  describe('calculate', () => {
    it('유효한 모드로 계산 시 에러가 없어야 합니다', () => {
      const props = createCalcProps();
      expect(() => system.calculate(props)).not.toThrow();
    });

    it('존재하지 않는 모드로 설정하면 계산이 스킵되어야 합니다', () => {
      system.updateConfig({ mode: 'nonexistent' });
      const props = createCalcProps();
      expect(() => system.calculate(props)).not.toThrow();
    });

    it('에러 발생 시 error 이벤트가 emit되어야 합니다', () => {
      const errorHandler = jest.fn();
      system.emitter.on('error', errorHandler);

      system.registerController({
        name: 'broken',
        defaultConfig: {},
        update: () => { throw new Error('test error'); },
      });
      system.updateConfig({ mode: 'broken' });
      system.calculate(createCalcProps());

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Camera calculation failed' }),
      );
    });
  });

  describe('camera states', () => {
    it('addCameraState로 새 상태를 추가할 수 있어야 합니다', () => {
      const newState: CameraState = {
        name: 'cinematic',
        type: 'chase',
        position: new THREE.Vector3(0, 10, 20),
        rotation: new THREE.Euler(),
        fov: 60,
        config: { distance: { x: 20, y: 12, z: 20 } },
        priority: 1,
        tags: ['cinematic'],
      };
      system.addCameraState('cinematic', newState);
      expect(system.getCameraState('cinematic')).toBe(newState);
    });

    it('switchCameraState로 상태를 전환할 수 있어야 합니다', () => {
      const newState: CameraState = {
        name: 'topdown',
        type: 'topDown',
        position: new THREE.Vector3(0, 50, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        fov: 45,
        config: { distance: { x: 0, y: 50, z: 0 } },
        priority: 0,
        tags: [],
      };
      system.addCameraState('topdown', newState);
      system.switchCameraState('topdown');

      const current = system.getCurrentCameraState();
      expect(current!.type).toBe('topDown');
      expect(current!.fov).toBe(45);
    });

    it('존재하지 않는 상태로 전환 시 현재 상태가 유지되어야 합니다', () => {
      const before = system.getCurrentCameraState();
      system.switchCameraState('nonexistent');
      const after = system.getCurrentCameraState();
      expect(after!.name).toBe(before!.name);
    });

    it('상태 전환 시 내부 state.config이 업데이트되어야 합니다', () => {
      const state: CameraState = {
        name: 'iso',
        type: 'isometric',
        position: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        fov: 50,
        config: { distance: { x: 30, y: 20, z: 30 } },
        priority: 0,
        tags: [],
      };
      system.addCameraState('iso', state);
      system.switchCameraState('iso');

      // 전환 후 계산 시 isometric 컨트롤러가 사용되는지 검증
      const mockUpdate = jest.fn();
      system.registerController({
        name: 'isometric',
        defaultConfig: {},
        update: mockUpdate,
      });
      // 기존 등록된 isometric 덮어씀. calculate가 해당 컨트롤러를 선택하는지 검증
      system.calculate(createCalcProps());
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('setCameraTransitions', () => {
    it('트랜지션 배열을 설정할 수 있어야 합니다', () => {
      const transitions = [
        { from: 'default', to: 'cinematic', duration: 1000 },
        { from: 'cinematic', to: 'default', duration: 500 },
      ];
      expect(() => system.setCameraTransitions(transitions)).not.toThrow();
    });
  });

  describe('registerController', () => {
    it('커스텀 컨트롤러를 등록하고 사용할 수 있어야 합니다', () => {
      const mockUpdate = jest.fn();
      system.registerController({
        name: 'custom',
        defaultConfig: {},
        update: mockUpdate,
      });
      system.updateConfig({ mode: 'custom' });
      system.calculate(createCalcProps());
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('event system', () => {
    it('error 이벤트가 카메라 계산 에러 시 발생해야 합니다', () => {
      const errorHandler = jest.fn();
      system.emitter.on('error', errorHandler);

      system.registerController({
        name: 'errorController',
        defaultConfig: {},
        update: () => { throw new Error('calc error'); },
      });
      system.updateConfig({ mode: 'errorController' });
      system.calculate(createCalcProps());

      expect(errorHandler).toHaveBeenCalledTimes(1);
    });

    it('BaseCameraSystem.updateConfig으로 modeChange 이벤트를 발생시킬 수 있어야 합니다', () => {
      const baseSys = system as any;
      const callback = jest.fn();
      system.emitter.on('modeChange', callback);
      // BaseCameraSystem의 updateConfig를 직접 호출
      BaseCameraSystem.prototype.updateConfig.call(baseSys, { mode: 'firstPerson' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'thirdPerson', to: 'firstPerson' }),
      );
    });
  });

  describe('lifecycle', () => {
    it('destroy 후 이벤트 리스너가 정리되어야 합니다', () => {
      const callback = jest.fn();
      system.emitter.on('modeChange', callback);
      system.destroy();
      system.emitter.emit('modeChange', { from: 'a', to: 'b' });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getState / getMetrics', () => {
    it('getState가 현재 상태를 반환해야 합니다', () => {
      const state = system.getState();
      expect(state.config).toBeDefined();
      expect(state.config.mode).toBe('thirdPerson');
    });

    it('getMetrics가 프레임 정보를 반환해야 합니다', () => {
      const metrics = system.getMetrics();
      expect(metrics.frameCount).toBe(0);
      expect(metrics.averageFrameTime).toBe(0);
    });

    it('getConfig가 방어적 복사본을 반환해야 합니다', () => {
      const a = system.getConfig();
      const b = system.getConfig();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });
});
