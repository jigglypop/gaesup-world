import * as THREE from 'three';

import { groundMaterial } from '../groundMaterial';

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
});
