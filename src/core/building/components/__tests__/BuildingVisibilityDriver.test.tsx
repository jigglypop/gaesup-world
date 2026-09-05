import { render, act } from '@testing-library/react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { useBuildingStore } from '../../stores/buildingStore';
import { useBuildingVisibilityStore } from '../../visibility/store';
import { BuildingVisibilityDriver } from '../BuildingVisibilityDriver';
import { GrassDriver } from '../mesh/grass/GrassDriver';
import { getGrassManager } from '../mesh/grass/manager';

jest.mock('@react-three/fiber', () => ({ useFrame: jest.fn() }));
jest.mock('../mesh/grass/manager', () => ({
  getGrassManager: () => ({ size: () => 1, tick: mockGrassTick }),
}));
const mockGrassTick = jest.fn();

test.each([THREE.WebGLCoordinateSystem, THREE.WebGPUCoordinateSystem])('grass uses current world camera and near plane for coordinate system %i', (coordinateSystem) => {
  const camera = new THREE.PerspectiveCamera(90, 1, 10, 100);
  camera.coordinateSystem = coordinateSystem;
  camera.updateProjectionMatrix();
  const parent = new THREE.Group();
  parent.add(camera);
  parent.position.x = 25;
  const view = render(<GrassDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    frame({ camera } as Parameters<typeof frame>[0], 0.13);
    const sample = jest.mocked(getGrassManager().tick).mock.calls.at(-1)![0];
    expect(sample.cameraPosition.toArray()).toEqual([25, 0, 0]);
    expect(sample.frustum.intersectsSphere(new THREE.Sphere(new THREE.Vector3(25, 0, -7), 1))).toBe(false);
    expect(sample.frustum.intersectsSphere(new THREE.Sphere(new THREE.Vector3(25, 0, -20), 1))).toBe(true);
  } finally {
    view.unmount();
  }
});

test.each([
  { coordinateSystem: THREE.WebGLCoordinateSystem, near: 10, far: 100, distances: [7, 20], size: 1, visible: '20' },
  { coordinateSystem: THREE.WebGPUCoordinateSystem, near: 10, far: 100, distances: [7, 20], size: 1, visible: '20' },
  { coordinateSystem: THREE.WebGLCoordinateSystem, near: 0.1, far: 1000, distances: [145, 170], size: 20, visible: '145' },
  { coordinateSystem: THREE.WebGPUCoordinateSystem, near: 0.1, far: 1000, distances: [145, 170], size: 20, visible: '145' },
])('building respects near and distance bounds: $coordinateSystem / $near / $size', ({ coordinateSystem, near, far, distances, size, visible }) => {
  const previousBuilding = useBuildingStore.getState();
  const previousRender = useBuildingRenderStateStore.getState();
  const camera = new THREE.PerspectiveCamera(90, 1, near, far);
  camera.coordinateSystem = coordinateSystem;
  camera.position.y = 1;
  camera.updateProjectionMatrix();
  useBuildingStore.setState({
    wallGroups: new Map(), blocks: [], objects: [],
    tileGroups: new Map(distances.map((distance) => [String(distance), {
      id: String(distance), name: 'floor', floorMeshId: 'floor',
      tiles: [{ id: String(distance), tileGroupId: String(distance), position: { x: 0, y: 0, z: -distance }, size }],
    }])),
  });
  useBuildingRenderStateStore.setState({ snapshot: { ...previousRender.snapshot, ids: distances.map(String) } });
  const view = render(<BuildingVisibilityDriver />);
  try {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    act(() => frame({ camera } as Parameters<typeof frame>[0], 0.13));
    expect([...useBuildingVisibilityStore.getState().visibleTileGroupIds]).toEqual([visible]);
  } finally {
    view.unmount();
    useBuildingStore.setState(previousBuilding);
    useBuildingRenderStateStore.setState(previousRender);
  }
});

test('refreshes visibility after projection changes and reuses an unchanged camera result', () => {
  const previousBuilding = useBuildingStore.getState();
  const previousRender = useBuildingRenderStateStore.getState();
  const previousCulling = useBuildingGpuCullingStore.getState();
  const intersects = jest.spyOn(THREE.Frustum.prototype, 'intersectsSphere');
  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);
  camera.position.y = 1;
  useBuildingStore.setState({
    wallGroups: new Map(), blocks: [], objects: [],
    tileGroups: new Map([['floor', {
      id: 'floor', name: 'floor', floorMeshId: 'floor',
      tiles: [{ id: 'tile', tileGroupId: 'floor', position: { x: 5, y: 0, z: -10 }, size: 1 }],
    }]]),
  });
  useBuildingRenderStateStore.setState({ snapshot: { ...previousRender.snapshot, ids: ['floor'] } });
  const view = render(<BuildingVisibilityDriver />);
  const tick = () => act(() => {
    const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
    frame({ camera } as Parameters<typeof frame>[0], 0.13);
  });
  try {
    for (let frame = 0; frame < 120; frame++) tick();
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds.has('floor')).toBe(false);
    expect(intersects).toHaveBeenCalledTimes(1);
    const staleCamera = {
      viewProjection: new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).toArray(),
      position: camera.position.toArray(),
      coordinateSystem: camera.coordinateSystem,
      reversedDepth: camera.reversedDepth,
    };
    camera.fov = 90;
    camera.updateProjectionMatrix();
    tick();
    const visible = useBuildingVisibilityStore.getState().visibleTileGroupIds;
    expect(visible.has('floor')).toBe(true);
    expect(intersects).toHaveBeenCalledTimes(2);
    for (let frame = 0; frame < 120; frame++) tick();
    expect(intersects).toHaveBeenCalledTimes(2);
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds).toBe(visible);
    act(() => useBuildingGpuCullingStore.setState({
      active: true, version: previousRender.snapshot.version, visibleTileGroupIds: new Set(),
      camera: staleCamera,
    }));
    tick();
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds.has('floor')).toBe(true);
    act(() => useBuildingGpuCullingStore.setState({ camera: null }));
    tick();
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds.has('floor')).toBe(true);
    act(() => useBuildingGpuCullingStore.setState({ camera: {
      ...staleCamera,
      viewProjection: new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).toArray(),
    } }));
    tick();
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds.has('floor')).toBe(false);
    act(() => useBuildingGpuCullingStore.setState({ visibleTileGroupIds: new Set(['floor']) }));
    tick();
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds.has('floor')).toBe(true);
    camera.position.y = 100;
    tick();
    expect(useBuildingVisibilityStore.getState().visibleTileGroupIds.has('floor')).toBe(false);
  } finally {
    view.unmount();
    intersects.mockRestore();
    useBuildingStore.setState(previousBuilding);
    useBuildingRenderStateStore.setState(previousRender);
    useBuildingGpuCullingStore.setState(previousCulling);
  }
});
