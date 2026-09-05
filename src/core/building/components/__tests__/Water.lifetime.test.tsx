import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { Water } from 'three-stdlib';

import Ocean from '../mesh/water';

test('reflection resources follow the replaced water object without disposing shared normals', async () => {
  const renderer = await ReactThreeTestRenderer.create(<Ocean toon={false} size={8} />);
  const first = renderer.scene.find((node) => node.instance instanceof Water).instance as Water;
  const mirror = first.material.uniforms['mirrorSampler']!.value as THREE.Texture;
  const target = mirror.renderTarget!;
  expect(target).toBeInstanceOf(THREE.WebGLRenderTarget);
  const targetDispose = jest.spyOn(target, 'dispose');
  const materialDispose = jest.spyOn(first.material, 'dispose');
  const normals = first.material.uniforms['normalSampler']!.value as THREE.Texture;
  const normalsDispose = jest.spyOn(normals, 'dispose');
  await renderer.update(<Ocean toon={false} size={32} />);
  const second = renderer.scene.find((node) => node.instance instanceof Water).instance as Water;
  expect(second).not.toBe(first);
  expect(targetDispose).toHaveBeenCalledTimes(1);
  expect(materialDispose).toHaveBeenCalledTimes(1);
  expect(normalsDispose).not.toHaveBeenCalled();
  const secondTarget = (second.material.uniforms['mirrorSampler']!.value as THREE.Texture).renderTarget!;
  const secondTargetDispose = jest.spyOn(secondTarget, 'dispose');
  const secondMaterialDispose = jest.spyOn(second.material, 'dispose');
  await renderer.unmount();
  expect(secondTargetDispose).toHaveBeenCalledTimes(1);
  expect(secondMaterialDispose).toHaveBeenCalledTimes(1);
  expect(normalsDispose).not.toHaveBeenCalled();
  normalsDispose.mockRestore();
});

test('toon geometry changes retain the live shader until the surface is removed', async () => {
  const renderer = await ReactThreeTestRenderer.create(<Ocean toon size={8} />);
  const findSurface = () => renderer.scene.find((node) =>
    node.instance instanceof THREE.Mesh && node.instance.material instanceof THREE.ShaderMaterial,
  ).instance as THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  const first = findSurface();
  const material = first.material;
  const dispose = jest.spyOn(material, 'dispose');
  await renderer.update(<Ocean toon size={32} />);
  expect(findSurface().material).toBe(material);
  expect(dispose).not.toHaveBeenCalled();
  await renderer.unmount();
  expect(dispose).toHaveBeenCalled();
});
