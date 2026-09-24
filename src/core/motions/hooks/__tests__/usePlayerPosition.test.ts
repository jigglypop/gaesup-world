import { renderHook } from '@testing-library/react';
import * as THREE from 'three';

import { frameScheduler } from '@core/runtime/frame';

import type { MotionBridge } from '../../bridge/MotionBridge';
import { usePlayerPosition } from '../usePlayerPosition';
import { useWorldMotionBridge } from '../useWorldMotionBridge';

jest.mock('../useWorldMotionBridge', () => ({ useWorldMotionBridge: jest.fn() }));

function createBridge() {
  const value = {
    position: new THREE.Vector3(1, 2, 3),
    velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    isMoving: true,
    isGrounded: true,
    speed: 1,
  };
  const snapshot = jest.fn(() => value);
  const bridge = { snapshot, subscribe: () => () => undefined, getPlayerEntityId: () => 'player' } as unknown as MotionBridge;
  jest.mocked(useWorldMotionBridge).mockReturnValue(bridge);
  return snapshot;
}

afterEach(() => frameScheduler.clear());

test('같은 프레임의 여러 consumer는 bridge snapshot을 한 번만 읽고 같은 값을 받는다', () => {
  const snapshot = createBridge();
  const views = [0, 1, 2].map(() => renderHook(() => usePlayerPosition({ reactive: false })));
  frameScheduler.tick(1 / 60, 16);
  expect(snapshot).toHaveBeenCalledTimes(1);
  for (const view of views) expect(view.result.current.position.toArray()).toEqual([1, 2, 3]);
  frameScheduler.tick(1 / 60, 32);
  expect(snapshot).toHaveBeenCalledTimes(2);
  for (const view of views) view.unmount();
});

test('물리 후 단계만 반복해 tick해도 매번 새 프레임으로 다시 읽는다', () => {
  const snapshot = createBridge();
  const view = renderHook(() => usePlayerPosition({ reactive: false }));
  frameScheduler.tickAfterPhysics(1 / 60, 16);
  frameScheduler.tickAfterPhysics(1 / 60, 16);
  expect(snapshot).toHaveBeenCalledTimes(2);
  view.unmount();
});
