import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { FrameSchedulerHost } from '../../../../runtime/frame';
import { FireBatch, type FireBatchEntry } from '../fire';
import { SakuraBatch, type SakuraTreeEntry } from '../sakura';

jest.mock('three/webgpu', () => jest.requireActual('three'));

const FAR_X = 500;

function WebGLMode({ children }: { children: ReactNode }) {
  Object.assign(useThree((state) => state.gl), { isWebGPURenderer: false });
  return <><FrameSchedulerHost />{children}</>;
}

function culledInstancedMeshes(root: THREE.Object3D): THREE.InstancedMesh[] {
  const meshes: THREE.InstancedMesh[] = [];
  root.traverse((object) => {
    if (object instanceof THREE.InstancedMesh && object.frustumCulled && object.count > 0) meshes.push(object);
  });
  return meshes;
}

function primeBounds(meshes: THREE.InstancedMesh[]): void {
  for (const mesh of meshes) if (mesh.boundingSphere === null) mesh.computeBoundingSphere();
}

function expectBoundsNear(meshes: THREE.InstancedMesh[], x: number): void {
  expect(meshes.length).toBeGreaterThan(0);
  for (const mesh of meshes) {
    const sphere = mesh.boundingSphere;
    expect(sphere).not.toBeNull();
    expect(Math.abs(sphere!.center.x - x)).toBeLessThanOrEqual(sphere!.radius);
  }
}

const fireAt = (x: number): FireBatchEntry[] => [{
  position: [x, 0, 0],
  rotation: 0,
  intensity: 1.5,
  width: 1,
  height: 1.4,
  color: '#ff9955',
}];

const treeAt = (x: number): SakuraTreeEntry[] => [{ position: [x, 0, 0], size: 1, treeKind: 'sakura' }];

test('fire batch bounds follow instances when the fire count is unchanged', async () => {
  const view = await ReactThreeTestRenderer.create(<WebGLMode><FireBatch fires={fireAt(0)} /></WebGLMode>);
  try {
    const root = view.scene.instance as THREE.Object3D;
    primeBounds(culledInstancedMeshes(root));
    await view.update(<WebGLMode><FireBatch fires={fireAt(FAR_X)} /></WebGLMode>);
    expectBoundsNear(culledInstancedMeshes(root), FAR_X);
  } finally {
    await view.unmount();
  }
});

test('sakura batch bounds follow instances when the tree count is unchanged', async () => {
  const view = await ReactThreeTestRenderer.create(<WebGLMode><SakuraBatch trees={treeAt(0)} /></WebGLMode>);
  try {
    const root = view.scene.instance as THREE.Object3D;
    primeBounds(culledInstancedMeshes(root));
    await view.update(<WebGLMode><SakuraBatch trees={treeAt(FAR_X)} /></WebGLMode>);
    expectBoundsNear(culledInstancedMeshes(root), FAR_X);
  } finally {
    await view.unmount();
  }
});
