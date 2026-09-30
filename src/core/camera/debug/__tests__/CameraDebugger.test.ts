/** @jest-environment jsdom */
import * as THREE from 'three';

import { CameraDebugger } from '../CameraDebugger';

type DebuggerInternals = { disposables: Set<() => void>; debugLines: THREE.Line[] };

const internals = (debug: CameraDebugger) => debug as unknown as DebuggerInternals;

describe('CameraDebugger 수명 관리', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('enable을 반복해도 타이머와 리스너를 한 번만 등록하고 disable에서 모두 해제한다', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval');
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const debug = new CameraDebugger();

    debug.enable();
    debug.enable();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(internals(debug).disposables.size).toBe(2);

    debug.disable();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(internals(debug).disposables.size).toBe(0);

    debug.enable();

    expect(setIntervalSpy).toHaveBeenCalledTimes(2);
    debug.dispose();
  });

  it('프레임마다 갱신해도 해제 콜백이 쌓이지 않고 디버그 선은 하나만 유지한다', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const debug = new CameraDebugger(scene);
    debug.enable();
    const registered = internals(debug).disposables.size;

    for (let frame = 0; frame < 30; frame++) {
      camera.position.set(frame, 0, 0);
      debug.update(camera, 0.016, 'test');
    }

    expect(internals(debug).disposables.size).toBe(registered);
    expect(internals(debug).debugLines).toHaveLength(1);
    expect(scene.children).toHaveLength(1);
    debug.dispose();
  });
});
