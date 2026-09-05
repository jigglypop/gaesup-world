import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { SaveBlob } from '../types';

const blob: SaveBlob = { version: 1, savedAt: 0, domains: { inventory: { count: 50 } } };

describe('LocalStorageAdapter', () => {
  const adapter = new LocalStorageAdapter();

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  test('distinguishes missing slots and supports write, read, list, and remove', async () => {
    expect(await adapter.read('main')).toBeNull();
    localStorage.setItem('unrelated', 'value');
    await adapter.write('main', blob);
    expect(await adapter.read('main')).toEqual(blob);
    expect(await adapter.list()).toEqual(['main']);
    await adapter.remove('main');
    expect(await adapter.read('main')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('value');
  });

  test.each(['', '{invalid'])('rejects damaged stored JSON instead of reporting a missing slot: %p', async (raw) => {
    localStorage.setItem('gaesup:save:main', raw);
    await expect(adapter.read('main')).rejects.toBeInstanceOf(SyntaxError);
    expect(localStorage.getItem('gaesup:save:main')).toBe(raw);
  });

  test('rejects quota errors and preserves the previous save', async () => {
    await adapter.write('main', blob);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });
    await expect(adapter.write('main', { ...blob, domains: {} })).rejects.toThrow('Storage full');
    expect(await adapter.read('main')).toEqual(blob);
  });

  test('propagates storage access and deletion failures', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Access denied'); });
    jest.spyOn(Storage.prototype, 'key').mockImplementation(() => { throw new Error('Access denied'); });
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Access denied'); });
    localStorage.setItem('gaesup:save:main', JSON.stringify(blob));
    await expect(adapter.read('main')).rejects.toThrow('Access denied');
    await expect(adapter.list()).rejects.toThrow('Access denied');
    await expect(adapter.remove('main')).rejects.toThrow('Access denied');
  });
});
