import { type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { FlagNodeMaterial } from '../../../rendering/tsl/flag';
import type { PlacedObject } from '../../types';
import { FlagBatch, FlagMesh } from '../mesh/flag';

jest.mock('../../../rendering/tsl/flag', () => {
  const { MeshBasicMaterial } = jest.requireActual<typeof import('three')>('three');
  return { FlagNodeMaterial: jest.fn(() => Object.assign(new MeshBasicMaterial({ name: 'flag-node-test' }), {
    time: 0, windStrength: 1,
  })) };
});
jest.mock('../../../boilerplate/hooks/frameTime', () => ({ getFrameElapsedSeconds: () => 2 }));

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  Object.assign(useThree((state) => state.gl), { isWebGPURenderer: nodes });
  return children;
}

test.each([false, true])('standalone flag chooses its renderer material and animates (nodes: %s)', async (nodes) => {
  const geometry = new THREE.PlaneGeometry(2, 1);
  const renderer = await ReactThreeTestRenderer.create(<RendererMode nodes={nodes}>
    <FlagMesh geometry={geometry} windStrength={0.5} />
  </RendererMode>);
  const mesh = renderer.scene.find((node) => node.instance instanceof THREE.Mesh).instance as THREE.Mesh;
  const material = mesh.material as THREE.Material & { time: number; windStrength: number };
  expect(material.name === 'flag-node-test').toBe(nodes);
  await renderer.advanceFrames(1, 0.1);
  expect(material.time).toBe(10);
  expect(material.windStrength).toBe(0.5);
  const dispose = jest.spyOn(material, 'dispose');
  await renderer.unmount();
  expect(dispose).toHaveBeenCalled();
  geometry.dispose();
});

test('lazy node flags initialize instance transforms and phase after loading', async () => {
  const flags: PlacedObject[] = [
    { id: 'a', type: 'flag', position: { x: 2, y: 0, z: 4 }, config: { flagWidth: 2, flagHeight: 1 } },
    { id: 'b', type: 'flag', position: { x: 10, y: 0, z: 0 }, config: { flagWidth: 2, flagHeight: 1 } },
  ];
  const renderer = await ReactThreeTestRenderer.create(<RendererMode nodes><FlagBatch flags={flags} /></RendererMode>);
  const mesh = renderer.scene.find((node) => node.instance instanceof THREE.InstancedMesh
    && node.instance.geometry instanceof THREE.PlaneGeometry).instance as THREE.InstancedMesh;
  expect(mesh.count).toBe(2);
  const matrix = new THREE.Matrix4();
  mesh.getMatrixAt(0, matrix);
  expect(matrix.elements[12]).toBe(3);
  expect(matrix.elements[14]).toBe(4);
  const phase = mesh.geometry.getAttribute('flagMotion');
  expect(phase.getX(0)).toBeCloseTo(2.9);
  expect(phase.getX(1)).toBeCloseTo(3.3);
  expect(phase.getY(0)).toBe(1);
  expect(FlagNodeMaterial).toHaveBeenCalledWith(expect.any(THREE.Texture), true);
  const material = mesh.material as THREE.Material;
  const dispose = jest.spyOn(material, 'dispose');
  await renderer.unmount();
  expect(dispose).toHaveBeenCalledTimes(1);
});
