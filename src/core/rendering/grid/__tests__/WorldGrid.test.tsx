import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { WorldGrid } from '../WorldGrid';

jest.mock('../../legacyDrei', () => ({
  Grid: () => <group name="legacy-grid" />,
}));

function RendererMode({ webgpu, children }: { webgpu: boolean; children: ReactNode }) {
  Object.assign(useThree((state) => state.gl), { isWebGPURenderer: webgpu });
  return children;
}

test('keeps the compatibility grid on WebGL', async () => {
  const view = await ReactThreeTestRenderer.create(
    <RendererMode webgpu={false}><WorldGrid /></RendererMode>,
  );
  expect(view.scene.findByProps({ name: 'legacy-grid' })).toBeDefined();
  expect(view.scene.findAllByType('Mesh')).toHaveLength(0);
  await view.unmount();
});

test('creates and owns a finite TSL grid surface for the WebGPU facade', async () => {
  const view = await ReactThreeTestRenderer.create(
    <RendererMode webgpu>
      <WorldGrid infiniteGrid fadeDistance={25} followCamera={false} />
    </RendererMode>,
  );
  const mesh = view.scene.findByType('Mesh').instance as THREE.Mesh;
  const geometry = mesh.geometry as THREE.PlaneGeometry;
  expect(geometry.parameters.width).toBe(100);
  expect(geometry.parameters.height).toBe(100);
  expect(mesh.frustumCulled).toBe(false);
  expect((mesh.material as THREE.Material & { positionNode?: unknown }).positionNode).toBeNull();

  const disposeGeometry = jest.spyOn(mesh.geometry, 'dispose');
  const disposeMaterial = jest.spyOn(mesh.material, 'dispose');
  await view.unmount();
  expect(disposeGeometry).toHaveBeenCalledTimes(1);
  expect(disposeMaterial).toHaveBeenCalledTimes(1);
});

test('enables camera-relative positioning only when followCamera is requested', async () => {
  const view = await ReactThreeTestRenderer.create(
    <RendererMode webgpu><WorldGrid followCamera /></RendererMode>,
  );
  const mesh = view.scene.findByType('Mesh').instance as THREE.Mesh;
  expect((mesh.material as THREE.Material & { positionNode?: unknown }).positionNode).toBeDefined();
  await view.unmount();
});
