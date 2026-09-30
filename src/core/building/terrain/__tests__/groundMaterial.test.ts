import * as THREE from 'three';

import { weatherGlUniforms } from '../../../weather/core/glsl';
import { classicWeather, groundMaterial } from '../groundMaterial';

describe('groundMaterial', () => {
  it('keeps materials it cannot redraw: toon, transparent and already node-built', () => {
    const toon = new THREE.MeshToonMaterial();
    const glass = new THREE.MeshStandardMaterial({ transparent: true });
    expect(groundMaterial(toon)).toBe(toon);
    expect(groundMaterial(glass)).toBe(glass);
  });

  it('makes one node variant per source and map, and disposes it with the source', () => {
    const source = new THREE.MeshStandardMaterial({ map: new THREE.Texture() });
    const ground = groundMaterial(source) as THREE.Material & { colorNode?: unknown; isNodeMaterial?: boolean };
    expect(ground).not.toBe(source);
    expect(ground.isNodeMaterial).toBe(true);
    expect(ground.colorNode).toBeTruthy();
    expect(groundMaterial(source)).toBe(ground);
    expect(groundMaterial(ground)).toBe(ground);

    const disposed = jest.fn();
    ground.addEventListener('dispose', disposed);
    source.map = new THREE.Texture();
    const replaced = groundMaterial(source);
    expect(replaced).not.toBe(ground);
    expect(disposed).toHaveBeenCalledTimes(1);

    const gone = jest.fn();
    replaced.addEventListener('dispose', gone);
    source.dispose();
    expect(gone).toHaveBeenCalledTimes(1);
  });

  it('pools rain rings on bare tiles only: grass soaks the rain up', () => {
    const source = new THREE.MeshStandardMaterial();
    const bare = groundMaterial(source) as THREE.Material & { normalNode: unknown; roughnessNode: unknown };
    const grassy = groundMaterial(source, true) as THREE.Material & { normalNode: unknown; roughnessNode: unknown };
    expect(bare.normalNode).toBeTruthy();
    expect(grassy.normalNode).toBeNull();
    expect(bare.roughnessNode).toBeTruthy();
    expect(grassy.roughnessNode).toBeTruthy();
    source.dispose();
  });

  it('patches a classic material once to read the shared weather uniforms', () => {
    const material = new THREE.MeshStandardMaterial();
    expect(classicWeather(material, 0.5)).toBe(material);
    const patch = material.onBeforeCompile;
    classicWeather(material, 0.5);
    expect(material.onBeforeCompile).toBe(patch);
    expect(material.customProgramCacheKey()).toBe('weather:0.5');
    const shader = { uniforms: {}, vertexShader: '', fragmentShader: THREE.ShaderLib.physical.fragmentShader };
    material.onBeforeCompile(shader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);
    expect((shader.uniforms as Record<string, unknown>)['weatherWetness']).toBe(weatherGlUniforms().weatherWetness);
    expect(shader.fragmentShader).toContain('uniform float weatherSnowCover;');
    expect(shader.fragmentShader).toMatch(/#include <normal_fragment_maps>\s+float weatherSoak/);
    expect(shader.fragmentShader).toContain('roughnessFactor = mix(roughnessFactor, 0.3, weatherSoak)');
  });

  it('makes a separate variant for tiles under grass, disposed with the source too', () => {
    const source = new THREE.MeshStandardMaterial();
    const plain = groundMaterial(source), grassy = groundMaterial(source, true);
    expect(grassy).not.toBe(plain);
    expect(groundMaterial(source, true)).toBe(grassy);
    const gone = jest.fn();
    plain.addEventListener('dispose', gone);
    grassy.addEventListener('dispose', gone);
    source.dispose();
    expect(gone).toHaveBeenCalledTimes(2);
  });
});
