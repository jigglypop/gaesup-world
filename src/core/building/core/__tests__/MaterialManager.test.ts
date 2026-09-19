import { MeshStandardMaterial, MeshToonMaterial } from 'three';

import { setDefaultToonMode } from '../../../rendering/toon';
import { MaterialManager } from '../MaterialManager';

describe('MaterialManager ID updates and cache ownership', () => {
  let manager: MaterialManager;
  beforeEach(() => { setDefaultToonMode(false); manager = new MaterialManager(); });
  afterEach(() => { manager.dispose(); setDefaultToonMode(false); });

  it('updates the requested ID without changing another ID or rebuilding uniform-only materials', () => {
    const a = manager.getMaterial({ id: 'a', color: '#ff0000' }) as MeshStandardMaterial;
    const b = manager.getMaterial({ id: 'b', color: '#ff0000' }) as MeshStandardMaterial;
    const version = a.version;
    manager.updateMaterial('a', { color: '#00ff00', roughness: 0.2, opacity: 0.4 });
    expect(a.color.getHexString()).toBe('00ff00');
    expect(a.roughness).toBe(0.2);
    expect(a.opacity).toBe(0.4);
    expect(a.version).toBe(version);
    expect(b.color.getHexString()).toBe('ff0000');
    expect(manager.getMaterial({ id: 'a', color: '#00ff00', roughness: 0.2, opacity: 0.4 })).toBe(a);
    const oldConfiguration = manager.getMaterial({ id: 'a', color: '#ff0000' }) as MeshStandardMaterial;
    expect(oldConfiguration).not.toBe(a);
    expect(oldConfiguration.color.getHexString()).toBe('ff0000');
  });

  it('applies nested parameters and invalidates pipeline flags only when they change', () => {
    const a = manager.getMaterial({ id: 'a' }) as MeshStandardMaterial;
    manager.updateMaterial('a', { materialParams: { color: '#0000ff', transparent: true } });
    expect(a.color.getHexString()).toBe('0000ff');
    expect(a.transparent).toBe(true);
    const version = a.version;
    manager.updateMaterial('a', { transparent: true });
    expect(a.version).toBe(version);
  });

  it('keeps ownership of colliding cache entries until final disposal', () => {
    const a = manager.getMaterial({ id: 'a', color: '#ff0000' });
    const b = manager.getMaterial({ id: 'a', color: '#00ff00' });
    const disposeA = jest.spyOn(a, 'dispose'); const disposeB = jest.spyOn(b, 'dispose');
    manager.updateMaterial('a', { color: '#0000ff' });
    manager.dispose(); manager.dispose();
    expect(disposeA).toHaveBeenCalledTimes(1);
    expect(disposeB).toHaveBeenCalledTimes(1);
  });

  it('does not return a standard material after toon mode changes', () => {
    const standard = manager.getMaterial({ id: 'a' });
    setDefaultToonMode(true);
    const toon = manager.getMaterial({ id: 'a' });
    expect(toon).toBeInstanceOf(MeshToonMaterial);
    expect(toon).not.toBe(standard);
    manager.updateMaterial('a', { color: '#00ff00' });
    expect((toon as MeshToonMaterial).color.getHexString()).toBe('00ff00');
  });
});
