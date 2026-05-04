import {
  CircularPluginDependencyError,
  createPluginRegistry,
  DuplicateExtensionError,
  DuplicatePluginError,
  InMemoryEventBus,
  InMemoryExtensionRegistry,
  MissingExtensionError,
  MissingPluginDependencyError,
  PluginManifestValidationError,
  PluginVersionMismatchError,
} from '../index';
import type { GaesupPlugin } from '../index';

const plugin = (
  id: string,
  setup: GaesupPlugin['setup'] = () => undefined,
  overrides: Partial<GaesupPlugin> = {},
): GaesupPlugin => ({
  id,
  name: id,
  version: '1.0.0',
  setup,
  ...overrides,
});

describe('PluginRegistry', () => {
  it('registers plugins and exposes manifests', () => {
    const registry = createPluginRegistry();
    registry.register(plugin('grid'));

    expect(registry.has('grid')).toBe(true);
    expect(registry.status('grid')).toBe('registered');
    expect(registry.get('grid')?.manifest).toEqual({
      id: 'grid',
      name: 'grid',
      version: '1.0.0',
      runtime: 'client',
      capabilities: [],
      dependencies: undefined,
      optionalDependencies: undefined,
    });
  });

  it('rejects duplicate plugin ids', () => {
    const registry = createPluginRegistry();
    registry.register(plugin('grid'));

    expect(() => registry.register(plugin('grid'))).toThrow(DuplicatePluginError);
  });

  it('sets up dependencies before dependents', async () => {
    const calls: string[] = [];
    const registry = createPluginRegistry();
    registry.register(plugin('building', () => { calls.push('building'); }, { dependencies: ['grid'] }));
    registry.register(plugin('grid', () => { calls.push('grid'); }));

    await registry.setup('building');

    expect(calls).toEqual(['grid', 'building']);
    expect(registry.status('grid')).toBe('ready');
    expect(registry.status('building')).toBe('ready');
  });

  it('validates dependency version ranges before setup', async () => {
    const calls: string[] = [];
    const registry = createPluginRegistry();
    registry.register(plugin('building', () => { calls.push('building'); }, {
      dependencies: [{ id: 'grid', version: '^1.0.0' }],
    }));
    registry.register(plugin('grid', () => { calls.push('grid'); }, { version: '1.2.0' }));

    await registry.setup('building');

    expect(calls).toEqual(['grid', 'building']);
    expect(registry.get('building')?.manifest.dependencies).toEqual({ grid: '^1.0.0' });
  });

  it('rejects dependency version mismatches before plugin setup', async () => {
    const registry = createPluginRegistry();
    registry.register(plugin('building', () => undefined, {
      dependencies: [{ id: 'grid', version: '^1.0.0' }],
    }));
    registry.register(plugin('grid', () => undefined, { version: '2.0.0' }));

    await expect(registry.setup('building')).rejects.toThrow(PluginVersionMismatchError);
    expect(registry.status('building')).toBe('registered');
  });

  it('validates plugin manifests before setup', async () => {
    const registry = createPluginRegistry();
    registry.register(plugin('bad-version', () => undefined, { version: 'latest' }));

    await expect(registry.setup('bad-version')).rejects.toThrow(PluginManifestValidationError);
    expect(registry.status('bad-version')).toBe('registered');
  });

  it('sets up optional dependencies first when they exist', async () => {
    const calls: string[] = [];
    const registry = createPluginRegistry();
    registry.register(plugin('cozy', () => { calls.push('cozy'); }, { optionalDependencies: ['toon'] }));
    registry.register(plugin('toon', () => { calls.push('toon'); }));

    await registry.setup('cozy');

    expect(calls).toEqual(['toon', 'cozy']);
  });

  it('ignores missing optional dependencies', async () => {
    const calls: string[] = [];
    const registry = createPluginRegistry();
    registry.register(plugin('cozy', () => { calls.push('cozy'); }, { optionalDependencies: ['toon'] }));

    await registry.setup('cozy');

    expect(calls).toEqual(['cozy']);
  });

  it('rejects missing required dependencies', async () => {
    const registry = createPluginRegistry();
    registry.register(plugin('building', () => undefined, { dependencies: ['grid'] }));

    await expect(registry.setup('building')).rejects.toThrow(MissingPluginDependencyError);
    expect(registry.status('building')).toBe('registered');
  });

  it('detects circular dependencies', async () => {
    const registry = createPluginRegistry();
    registry.register(plugin('a', () => undefined, { dependencies: ['b'] }));
    registry.register(plugin('b', () => undefined, { dependencies: ['a'] }));

    await expect(registry.setup('a')).rejects.toThrow(CircularPluginDependencyError);
  });

  it('marks failed plugins and stores their error', async () => {
    const registry = createPluginRegistry();
    const error = new Error('boom');
    registry.register(plugin('bad', () => { throw error; }));

    await expect(registry.setup('bad')).rejects.toThrow('boom');

    expect(registry.status('bad')).toBe('failed');
    expect(registry.get('bad')?.error).toBe(error);
  });

  it('disposes plugins in reverse setup order', async () => {
    const calls: string[] = [];
    const registry = createPluginRegistry();
    registry.register(plugin('grid', () => { calls.push('setup:grid'); }, {
      dispose: () => { calls.push('dispose:grid'); },
    }));
    registry.register(plugin('building', () => { calls.push('setup:building'); }, {
      dependencies: ['grid'],
      dispose: () => { calls.push('dispose:building'); },
    }));

    await registry.setup('building');
    await registry.disposeAll();

    expect(calls).toEqual([
      'setup:grid',
      'setup:building',
      'dispose:building',
      'dispose:grid',
    ]);
    expect(registry.status('grid')).toBe('disposed');
    expect(registry.status('building')).toBe('disposed');
  });

  it('lets plugins register extensions through context registries', async () => {
    const registry = createPluginRegistry();
    registry.register(plugin('grid', (ctx) => {
      ctx.grid.register('square', { cellSize: 4 }, 'grid');
    }));

    await registry.setup('grid');

    expect(registry.context.grid.require<{ cellSize: number }>('square')).toEqual({ cellSize: 4 });
    expect(registry.context.grid.list()).toEqual([
      { id: 'square', value: { cellSize: 4 }, pluginId: 'grid' },
    ]);
  });

  it('exposes generic services systems and component registries for framework plugins', async () => {
    const registry = createPluginRegistry();
    const service = { get: () => 'ok' };
    const system = { update: () => undefined };
    const component = { renderKind: 'headless' };

    registry.register(plugin('framework', (ctx) => {
      ctx.services.register('save-service', service, 'framework');
      ctx.systems.register('turn-system', system, 'framework');
      ctx.components.register('inventory-panel', component, 'framework');
    }));

    await registry.setup('framework');

    expect(registry.context.services.require('save-service')).toBe(service);
    expect(registry.context.systems.require('turn-system')).toBe(system);
    expect(registry.context.components.require('inventory-panel')).toBe(component);
  });

  it('removes extensions owned by a plugin after dispose even without manual cleanup', async () => {
    const registry = createPluginRegistry();
    registry.register(plugin('framework', (ctx) => {
      ctx.grid.register('square', { cellSize: 4 }, 'framework');
      ctx.services.register('clock', { now: () => 1 }, 'framework');
      ctx.systems.register('weather', { update: () => undefined }, 'framework');
      ctx.components.register('hud', { renderKind: 'react' }, 'framework');
    }));

    await registry.setup('framework');
    await registry.dispose('framework');

    expect(registry.context.grid.has('square')).toBe(false);
    expect(registry.context.services.has('clock')).toBe(false);
    expect(registry.context.systems.has('weather')).toBe(false);
    expect(registry.context.components.has('hud')).toBe(false);
  });

  it('shares one event bus across plugins', async () => {
    const payloads: string[] = [];
    const registry = createPluginRegistry();
    registry.register(plugin('listener', (ctx) => {
      ctx.events.on<string>('ready', (payload) => payloads.push(payload));
    }));
    registry.register(plugin('emitter', (ctx) => {
      ctx.events.emit('ready', 'ok');
    }, { dependencies: ['listener'] }));

    await registry.setup('emitter');

    expect(payloads).toEqual(['ok']);
  });

  it('reports configured capability conflicts and missing capabilities', async () => {
    const warn = jest.fn();
    const registry = createPluginRegistry({
      logger: { warn },
      exclusiveCapabilities: ['renderer'],
      capabilityConflicts: { server: ['client-only'] },
      requiredCapabilities: ['save'],
    });
    registry.register(plugin('webgl', () => undefined, { capabilities: ['renderer', 'client-only'] }));
    registry.register(plugin('webgpu', () => undefined, { capabilities: ['renderer'] }));
    registry.register(plugin('authority', () => undefined, { capabilities: ['server'] }));

    await registry.setupAll();

    expect(registry.getDiagnostics()).toEqual([
      expect.objectContaining({
        kind: 'missing-capability',
        capabilities: ['save'],
      }),
      expect.objectContaining({
        kind: 'capability-conflict',
        pluginIds: ['webgl', 'webgpu'],
        capabilities: ['renderer'],
      }),
      expect.objectContaining({
        kind: 'capability-conflict',
        pluginIds: ['authority', 'webgl'],
        capabilities: ['server', 'client-only'],
      }),
    ]);
    expect(warn).toHaveBeenCalledTimes(3);
  });
});

describe('InMemoryExtensionRegistry', () => {
  it('stores, requires, removes, and clears extensions', () => {
    const registry = new InMemoryExtensionRegistry<number>();
    registry.register('one', 1);
    registry.register('two', 2, 'math');
    registry.register('three', 3, 'math');

    expect(registry.has('one')).toBe(true);
    expect(registry.get('two')).toBe(2);
    expect(registry.require('one')).toBe(1);
    expect(registry.list()).toEqual([
      { id: 'one', value: 1 },
      { id: 'two', value: 2, pluginId: 'math' },
      { id: 'three', value: 3, pluginId: 'math' },
    ]);

    expect(registry.remove('one')).toBe(true);
    expect(registry.has('one')).toBe(false);
    expect(registry.removeByPlugin('math')).toBe(2);
    expect(registry.list()).toEqual([]);

    registry.clear();
    expect(registry.list()).toEqual([]);
  });

  it('rejects duplicates and missing required extensions', () => {
    const registry = new InMemoryExtensionRegistry<number>();
    registry.register('one', 1);

    expect(() => registry.register('one', 2)).toThrow(DuplicateExtensionError);
    expect(() => registry.require('missing')).toThrow(MissingExtensionError);
  });

  it('includes registry and plugin ids in duplicate extension errors', () => {
    const registry = new InMemoryExtensionRegistry<number>('systems');
    registry.register('clock', 1, 'time');

    expect(() => registry.register('clock', 2, 'other')).toThrow(
      'systems Extension "clock" is already registered by plugin "time". Plugin "other" cannot register it.',
    );
  });
});

describe('InMemoryEventBus', () => {
  it('supports on, once, off, emit, and clear', () => {
    const bus = new InMemoryEventBus();
    const calls: string[] = [];
    const handler = (payload: string) => calls.push(`on:${payload}`);

    const unsubscribe = bus.on('event', handler);
    bus.once<string>('event', (payload) => calls.push(`once:${payload}`));

    bus.emit('event', 'a');
    bus.emit('event', 'b');
    unsubscribe();
    bus.emit('event', 'c');

    expect(calls).toEqual(['on:a', 'once:a', 'on:b']);

    bus.on('event', handler);
    bus.clear('event');
    bus.emit('event', 'd');
    expect(calls).toEqual(['on:a', 'once:a', 'on:b']);

    bus.on('event', handler);
    bus.clear();
    bus.emit('event', 'e');
    expect(calls).toEqual(['on:a', 'once:a', 'on:b']);
  });
});
