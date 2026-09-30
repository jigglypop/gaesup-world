import { InMemoryExtensionRegistry } from '../ExtensionRegistry';

test('the concrete registry accepts arbitrary string ids like the ExtensionRegistry interface', () => {
  const registry = new InMemoryExtensionRegistry<number>('numbers');
  const dynamicId: string = ['score', 'total'].join('.');

  expect(registry.get(dynamicId)).toBeUndefined();
  registry.register(dynamicId, 7, 'test-plugin');

  const value: number | undefined = registry.get(dynamicId);
  const required: number = registry.require(dynamicId);
  expect(value).toBe(7);
  expect(required).toBe(7);
  expect(() => registry.require('missing')).toThrow();
});
