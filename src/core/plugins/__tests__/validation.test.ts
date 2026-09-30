import {
  assertValidGaesupPlugin,
  defineGaesupPlugin,
  validateGaesupPlugin,
} from '..';

describe('plugin validation utilities', () => {
  it('validates runtime, dependencies, and save namespaces for a plugin', async () => {
    const plugin = defineGaesupPlugin({
      id: 'sample.valid-save',
      name: 'Valid Save Plugin',
      version: '1.0.0',
      runtime: 'client',
      setup(ctx) {
        ctx.save.register('sample.valid-save', {
          key: 'sample.valid-save',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        }, 'sample.valid-save');
      },
    });

    const result = await validateGaesupPlugin(plugin, {
      allowedSaveNamespaces: ['sample.valid-save'],
      expectedRuntime: 'client',
      requiredSaveNamespaces: ['sample.valid-save'],
    });

    expect(result.ok).toBe(true);
    expect(result.manifest?.id).toBe('sample.valid-save');
    expect(result.saveNamespaces).toEqual(['sample.valid-save']);
  });

  it('reports dependency and save namespace validation failures without throwing', async () => {
    const plugin = defineGaesupPlugin({
      id: 'sample.invalid',
      name: 'Invalid Plugin',
      version: '1.0.0',
      dependencies: [{ id: 'sample.missing', version: '^1.0.0' }],
      setup(ctx) {
        ctx.save.register('sample.unexpected', {
          key: 'sample.unexpected',
          serialize: () => null,
          hydrate: () => undefined,
        }, 'sample.invalid');
      },
    });

    const result = await validateGaesupPlugin(plugin, {
      allowedSaveNamespaces: ['sample.expected'],
      requiredSaveNamespaces: ['sample.expected'],
    });

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'dependency')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'save-namespace')).toBe(true);
  });

  it('asserts templates are valid for the runtime they expect', async () => {
    const client = defineGaesupPlugin({ id: '@test/client', name: 'Client', version: '0.1.0', runtime: 'client', setup: () => undefined });
    const shared = defineGaesupPlugin({ id: '@test/shared', name: 'Shared', version: '0.1.0', runtime: 'both', setup: () => undefined });
    await expect(assertValidGaesupPlugin(client, { expectedRuntime: 'client' })).resolves.toMatchObject({ ok: true });
    await expect(assertValidGaesupPlugin(shared, { expectedRuntime: ['both', 'server'] })).resolves.toMatchObject({ ok: true });
    await expect(assertValidGaesupPlugin(client, { expectedRuntime: 'server' })).rejects.toThrow();
  });
});
