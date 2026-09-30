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

test('another fire or tree fills a free instance slot: the batch meshes, and so their pipelines, stay', async () => {
  const meshes = (root: THREE.Object3D) => {
    const found: THREE.InstancedMesh[] = [];
    // The WebGL flame billboards bake per-instance values into their geometry and rebuild it with the fires.
    root.traverse((object) => { if (object instanceof THREE.InstancedMesh && !(object.material instanceof THREE.ShaderMaterial)) found.push(object); });
    return found;
  };
  const scene = (count: number) => (
    <WebGLMode>
      <FireBatch fires={Array.from({ length: count }, (_, i) => fireAt(i * 4)[0]!)} />
      <SakuraBatch trees={Array.from({ length: count }, (_, i) => treeAt(i * 4)[0]!)} />
    </WebGLMode>
  );
  const view = await ReactThreeTestRenderer.create(scene(12));
  try {
    const before = meshes(view.scene.instance as THREE.Object3D);
    await view.update(scene(13));
    const after = meshes(view.scene.instance as THREE.Object3D);
    expect(before.length).toBeGreaterThan(0);
    expect(after.map((mesh) => mesh.uuid)).toEqual(before.map((mesh) => mesh.uuid));
  } finally {
    await view.unmount();
  }
});

test('an edit elsewhere in the building regroups the trees into a new array, but the same trees keep their meshes', async () => {
  const setMatrixAt = jest.spyOn(THREE.InstancedMesh.prototype, 'setMatrixAt');
  const trees = () => Array.from({ length: 6 }, (_, i) => treeAt(i * 4)[0]!);
  const view = await ReactThreeTestRenderer.create(<WebGLMode><SakuraBatch trees={trees()} /></WebGLMode>);
  try {
    setMatrixAt.mockClear();
    await view.update(<WebGLMode><SakuraBatch trees={trees()} /></WebGLMode>);
    expect(setMatrixAt).not.toHaveBeenCalled();
  } finally {
    setMatrixAt.mockRestore();
    await view.unmount();
  }
});
