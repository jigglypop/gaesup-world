import { render, act } from '@testing-library/react';
import * as THREE from 'three';

import { frameScheduler } from '../../../runtime/frame';
import { buildBuildingRenderSnapshot } from '../../render/core';
import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingVisibilityStore } from '../../visibility/store';
import { BuildingVisibilityDriver } from '../BuildingVisibilityDriver';
import { GrassDriver } from '../mesh/grass/GrassDriver';
import { getGrassManager } from '../mesh/grass/manager';

type MockFrameState = { camera: THREE.Camera | null };

const mockFrameState: MockFrameState = { camera: null };

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: { get: () => MockFrameState }) => unknown) => selector({ get: () => mockFrameState }),
}));
jest.mock('../mesh/grass/manager', () => ({
  getGrassManager: () => ({ size: () => 1, isEnabled: () => true, tick: mockGrassTick }),
}));
const mockGrassTick = jest.fn();

function frame(state: { camera: THREE.Camera }, delta: number): void {
  mockFrameState.camera = state.camera;
  frameScheduler.tick(delta, 0);
}

afterEach(() => {
  frameScheduler.clear();
  mockFrameState.camera = null;
});

test.each([THREE.WebGLCoordinateSystem, THREE.WebGPUCoordinateSystem])('grass uses current world camera and near plane for coordinate system %i', (coordinateSystem) => {
  const camera = new THREE.PerspectiveCamera(90, 1, 10, 100);
  camera.coordinateSystem = coordinateSystem;
  camera.updateProjectionMatrix();
  const parent = new THREE.Group();
  parent.add(camera);
  parent.position.x = 25;
  const view = render(<GrassDriver />);
  try {
    frame({ camera }, 0.13);
    const sample = jest.mocked(getGrassManager().tick).mock.calls.at(-1)![0];
    expect(sample.cameraPosition.toArray()).toEqual([25, 0, 0]);
    expect(sample.frustum.intersectsSphere(new THREE.Sphere(new THREE.Vector3(25, 0, -7), 1))).toBe(false);
    expect(sample.frustum.intersectsSphere(new THREE.Sphere(new THREE.Vector3(25, 0, -20), 1))).toBe(true);
  } finally {
    view.unmount();
  }
});

function tileGroup(id: string, z: number) {
  return { id, name: id, floorMeshId: 'floor', tiles: [{ id, tileGroupId: id, position: { x: 0, y: 0, z }, size: 1 }] };
}

test('mounts groups by draw distance with hysteresis and ignores view direction', () => {
  const previousRender = useBuildingRenderStateStore.getState();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  useBuildingRenderStateStore.setState({
    snapshot: buildBuildingRenderSnapshot({
      wallGroups: [], objects: [], version: 1,
      tileGroups: [tileGroup('near', -100), tileGroup('edge', -145), tileGroup('behind', 50)],
    }),
  });
  const view = render(<BuildingVisibilityDriver />);
  const resident = () => useBuildingVisibilityStore.getState().visibleTileGroupIds;
  try {
    act(() => frame({ camera }, 0.13));
    expect([...resident()].sort()).toEqual(['behind', 'near']);

    const before = resident();
    camera.rotation.y = Math.PI;
    act(() => frame({ camera }, 0.13));
    expect(resident()).toBe(before);

    camera.position.z = -5;
    act(() => frame({ camera }, 0.13));
    expect(resident().has('edge')).toBe(true);
    camera.position.z = 0;
    act(() => frame({ camera }, 0.13));
    expect(resident().has('edge')).toBe(true);
    camera.position.z = 25;
    act(() => frame({ camera }, 0.13));
    expect(resident().has('edge')).toBe(false);
  } finally {
    view.unmount();
    useBuildingRenderStateStore.setState(previousRender);
  }
});
