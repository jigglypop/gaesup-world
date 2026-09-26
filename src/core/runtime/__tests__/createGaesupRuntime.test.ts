/** @jest-environment jsdom */
import * as THREE from 'three';


import { createAudioPlugin } from '../../audio/plugin';
import { useAudioStore } from '../../audio/stores/audioStore';
import { createBuildingPlugin } from '../../building/plugin';
import { createCameraPlugin } from '../../camera';
import { createCharacterPlugin } from '../../character/plugin';
import { createI18nPlugin } from '../../i18n/plugin';
import { useI18nStore } from '../../i18n/stores/i18nStore';
import { createMotionsPlugin, type MotionsRuntimeService } from '../../motions';
import { PhysicsBridge } from '../../motions/bridge/PhysicsBridge';
import { createNPCPlugin, hydrateNPCState, serializeNPCState } from '../../npc/plugin';
import type { GaesupPlugin } from '../../plugins';
import { SaveSystem } from '../../save';
import type { SaveAdapter, SaveBlob } from '../../save';
import { createScenePlugin } from '../../scene/plugin';
import { createSceneDocument, createSceneDocumentController, createSceneDocumentSaveBinding } from '../../scene-object';
import { useGaesupStore } from '../../stores/gaesupStore';
import { createTimePlugin } from '../../time/plugin';
import { useTimeStore } from '../../time/stores/timeStore';
import { createWeatherPlugin } from '../../weather/plugin';
import { useWeatherStore } from '../../weather/stores/weatherStore';
import { createGaesupRuntime, shouldSetupPluginForRuntime } from '../createGaesupRuntime';
import {
  DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  RUNTIME_SAVE_BINDING_REJECTED_EVENT,
  RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  type RuntimeSaveDiagnostic,
  type RuntimeSaveDiagnosticsService,
} from '../saveDiagnostics';

class MemoryAdapter implements SaveAdapter {
  private readonly map = new Map<string, SaveBlob>();

  async read(slot: string) {
    return this.map.get(slot) ?? null;
  }

  async write(slot: string, blob: SaveBlob) {
    this.map.set(slot, JSON.parse(JSON.stringify(blob)) as SaveBlob);
  }

  async list() {
    return Array.from(this.map.keys());
  }

  async remove(slot: string) {
    this.map.delete(slot);
  }
}

const createSavePlugin = (
  serialize: () => object,
  hydrate: (data: unknown) => void,
): GaesupPlugin => ({
  id: 'test.save-plugin',
  name: 'Test Save Plugin',
  version: '1.0.0',
  setup(ctx) {
    ctx.save.register(
      'plugin-domain',
      {
        key: 'plugin-domain',
        serialize,
        hydrate,
      },
      'test.save-plugin',
    );
  },
});

describe('createGaesupRuntime', () => {
  it('rejects malformed scene state before applying weather', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createWeatherPlugin(), createScenePlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    const weather = runtime.weatherStore.getState();
    const scene = runtime.sceneStore.getState();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        weather: { version: 1, current: { day: 2, kind: 'rain', intensity: 0.5 }, history: [] }, scene: { version: 1, current: 12 },
      } })).toThrow('Save hydration failed');
      expect(runtime.weatherStore.getState()).toBe(weather);
      expect(runtime.sceneStore.getState()).toBe(scene);
    } finally { await runtime.dispose(); }
  });

  it('rejects corrupt character appearance before changing the clock', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createTimePlugin(), createCharacterPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    const time = runtime.timeStore.getState();
    const character = runtime.characterStore.getState();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        time: { ...time.serialize(), totalMinutes: 2880 },
        character: { version: 3, activeCharacterId: 'custom', characters: { custom: { appearance: { hair: 'unknown' } } } },
      } })).toThrow('Save hydration failed');
      expect(runtime.timeStore.getState()).toBe(time);
      expect(runtime.characterStore.getState()).toBe(character);
    } finally { await runtime.dispose(); }
  });

  it.each([
    { version: 2 }, { instances: {} },
    { animations: [{ id: 'same' }, { id: 'same' }] },
    { instances: [{ id: 'npc', templateId: 'custom', name: '주민', position: [0, NaN, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }] },
  ])('rejects malformed NPC snapshots before applying weather: %j', async (npc) => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createWeatherPlugin(), createNPCPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    const weather = runtime.weatherStore.getState();
    const before = runtime.npcStore.getState();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        weather: { version: 1, current: { day: 2, kind: 'rain', intensity: 0.5 }, history: [] }, npc,
      } })).toThrow('Save hydration failed');
      expect(runtime.weatherStore.getState()).toBe(weather);
      expect(runtime.npcStore.getState()).toBe(before);
    } finally { await runtime.dispose(); }
  });

  it('prepares owned NPC maps while preserving legacy arrays and omitted collections', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save, plugins: [createNPCPlugin()] });
    const before = runtime.npcStore.getState();
    await runtime.setup();
    try {
      const data: Parameters<typeof hydrateNPCState>[0] = [{ id: 'custom', templateId: 'unregistered', name: '주민',
        position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1], metadata: { dialogue: ['안녕하세요'] } }];
      const binding = [...save.getBindings()].find((entry) => entry.key === 'npc')!;
      const apply = binding.prepareHydrate!(data);
      expect(runtime.npcStore.getState()).toBe(before);
      data[0]!.position[0] = 99;
      data[0]!.metadata!.dialogue![0] = '변경';
      apply();
      expect(runtime.npcStore.getState().instances.get('custom')).toMatchObject({
        position: [1, 2, 3], metadata: { dialogue: ['안녕하세요'] },
      });
      expect(runtime.npcStore.getState().templates).toBe(before.templates);
      hydrateNPCState({ instances: [] }, runtime.npcStore);
      expect(runtime.npcStore.getState().instances.size).toBe(0);
      expect(runtime.npcStore.getState().templates).toBe(before.templates);
    } finally {
      runtime.npcStore.setState(before);
      await runtime.dispose();
    }
  });

  it.each(['invalid-locale', 'invalid-volume'])('rejects %s without applying audio settings', async (invalid) => {
    const language = useI18nStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createAudioPlugin(), createI18nPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    const apply = jest.fn();
    runtime.audioStore.setState({ apply });
    const before = runtime.audioStore.getState();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        audio: { ...before.serialize(), masterVolume: invalid === 'invalid-volume' ? NaN : 0.1 },
        i18n: { version: 1, locale: invalid === 'invalid-locale' ? 'unsupported' : 'ko' },
      } })).toThrow('Save hydration failed');
      expect(runtime.audioStore.getState()).toBe(before);
      expect(useI18nStore.getState()).toBe(language);
      expect(apply).not.toHaveBeenCalled();
    } finally {
      await runtime.dispose();
    }
  });

  it('defers audio engine application and retains translation bundles', () => {
    const audio = useAudioStore.getState();
    const language = useI18nStore.getState();
    const apply = jest.fn();
    useAudioStore.setState({ apply });
    try {
      const data = { ...audio.serialize(), masterVolume: 0.2 };
      const applyAudio = useAudioStore.getState().prepareHydrate(data);
      const applyLanguage = language.prepareHydrate({ version: 1, locale: 'ko' });
      data.masterVolume = 0.9;
      expect(apply).not.toHaveBeenCalled();
      applyAudio();
      applyLanguage();
      expect(apply).toHaveBeenCalledTimes(1);
      expect(useAudioStore.getState().masterVolume).toBe(0.2);
      expect(useI18nStore.getState().bundle).toBe(language.bundle);
    } finally {
      useAudioStore.setState(audio);
      useI18nStore.setState(language);
    }
  });

  it.each([NaN, -1, 2])('rejects corrupt weather before changing the clock: %s', async (intensity) => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createTimePlugin(), createWeatherPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    const time = runtime.timeStore.getState();
    const weather = runtime.weatherStore.getState();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        time: { ...time.serialize(), totalMinutes: 2880 },
        weather: { version: 1, current: { day: 2, kind: 'rain', intensity }, history: [] },
      } })).toThrow('Save hydration failed');
      expect(runtime.timeStore.getState()).toBe(time);
      expect(runtime.weatherStore.getState()).toBe(weather);
    } finally { await runtime.dispose(); }
  });

  it('prepares time without day events and owns weather history', () => {
    const time = useTimeStore.getState();
    const weather = useWeatherStore.getState();
    const listener = jest.fn();
    const unsubscribe = time.addListener(listener);
    try {
      expect(() => time.prepareHydrate({ ...time.serialize(), scale: 0 })).toThrow(TypeError);
      const applyTime = time.prepareHydrate({ ...time.serialize(), totalMinutes: 2880 });
      const entry = { day: 2, kind: 'rain' as const, intensity: 0.5 };
      const applyWeather = weather.prepareHydrate({ version: 1, current: entry, history: [entry] });
      entry.intensity = 1;
      expect(useTimeStore.getState()).toBe(time);
      expect(useWeatherStore.getState()).toBe(weather);
      applyTime();
      applyWeather();
      expect(useTimeStore.getState().time.hour).toBe(0);
      expect(useWeatherStore.getState().history[0]!.intensity).toBe(0.5);
      expect(listener).not.toHaveBeenCalled();
    } finally {
      unsubscribe();
      useTimeStore.setState(time);
      useWeatherStore.setState(weather);
    }
  });

  it('preserves plugin preparation before applying any runtime save domain', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const controller = createSceneDocumentController(createSceneDocument({ id: 'current' }));
    const binding = createSceneDocumentSaveBinding(controller);
    const hydrate = jest.fn();
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [{ key: 'earlier', serialize: () => null, hydrate }],
      logger: { warn: () => undefined },
      plugins: [{
        id: 'test.prepared-scene', name: 'Prepared scene', version: '1.0.0',
        setup(context) { context.save.register(binding.key, binding, 'test.prepared-scene'); },
      }],
    });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        'scene-document': { version: 1, id: '', objects: [] },
      } })).toThrow('Save hydration failed');
      expect(hydrate).not.toHaveBeenCalled();
      expect(controller.getSnapshot().id).toBe('current');
      save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        'scene-document': createSceneDocument({ id: 'loaded' }),
      } });
      expect(hydrate).toHaveBeenCalledTimes(1);
      expect(controller.getSnapshot().id).toBe('loaded');
    } finally {
      await runtime.dispose();
    }
  });

  beforeEach(() => {
    useGaesupStore.getState().resetMode();
    useGaesupStore.getState().setCameraOption({
      fov: 75,
      zoom: 1,
      position: new THREE.Vector3(-15, 8, -15),
      target: new THREE.Vector3(0, 0, 0),
    });
  });

  it('keeps external diagnostics and option save bindings inactive until setup', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const subscribeDiagnostics = jest.spyOn(save, 'subscribeDiagnostics');
    const register = jest.spyOn(save, 'register');
    const warnings: unknown[] = [];
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'option-domain',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        },
      ],
      logger: {
        warn: (_message, diagnostic) => warnings.push(diagnostic),
      },
    });

    expect(subscribeDiagnostics).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
    expect(save.has('option-domain')).toBe(false);
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBeUndefined();

    save.register({
      key: 'external-broken-domain',
      serialize: () => {
        throw new Error('external failure');
      },
      hydrate: () => undefined,
    });
    await expect(save.save('before-setup')).rejects.toThrow('Save serialization failed');
    expect(warnings).toEqual([]);

    await runtime.setup();
    expect(subscribeDiagnostics).toHaveBeenCalledTimes(1);
    expect(save.has('option-domain')).toBe(true);
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBe(
      runtime.saveDiagnostics,
    );

    await expect(save.save('after-setup')).rejects.toThrow('Save serialization failed');
    expect(warnings).toHaveLength(1);
    await runtime.dispose();
    await expect(save.save('after-dispose')).rejects.toThrow('Save serialization failed');
    expect(warnings).toHaveLength(1);

    subscribeDiagnostics.mockRestore();
    register.mockRestore();
  });

  it('serializes repeated concurrent setup calls and keeps the active generation idempotent', async () => {
    let setupCount = 0;
    let disposeCount = 0;
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
      plugins: [
        {
          id: 'lifecycle.idempotent',
          name: 'Lifecycle Idempotent',
          version: '1.0.0',
          setup: () => {
            setupCount++;
          },
          dispose: () => {
            disposeCount++;
          },
        },
      ],
    });

    await Promise.all([runtime.setup(), runtime.setup(), runtime.setup()]);
    await runtime.setup();
    expect(setupCount).toBe(1);

    await Promise.all([runtime.dispose(), runtime.dispose(), runtime.dispose()]);
    expect(disposeCount).toBe(1);
  });

  it('orders setup, dispose, and setup without overlapping a deferred generation', async () => {
    let releaseFirstSetup: (() => void) | undefined;
    const firstSetupGate = new Promise<void>((resolve) => {
      releaseFirstSetup = resolve;
    });
    const calls: string[] = [];
    let setupCount = 0;
    let setupActive = false;
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
      plugins: [
        {
          id: 'lifecycle.ordered',
          name: 'Lifecycle Ordered',
          version: '1.0.0',
          setup: async () => {
            setupCount++;
            setupActive = true;
            calls.push(`setup-${setupCount}:start`);
            if (setupCount === 1) await firstSetupGate;
            calls.push(`setup-${setupCount}:end`);
            setupActive = false;
          },
          dispose: () => {
            expect(setupActive).toBe(false);
            calls.push('dispose');
          },
        },
      ],
    });

    const firstSetup = runtime.setup();
    const dispose = runtime.dispose();
    const secondSetup = runtime.setup();
    await Promise.resolve();
    expect(calls).toEqual(['setup-1:start']);

    releaseFirstSetup?.();
    await Promise.all([firstSetup, dispose, secondSetup]);

    expect(calls).toEqual([
      'setup-1:start',
      'setup-1:end',
      'dispose',
      'setup-2:start',
      'setup-2:end',
    ]);
    await runtime.dispose();
  });

  it('treats dispose before setup as a no-op and supports a later fresh generation', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const subscribeDiagnostics = jest.spyOn(save, 'subscribeDiagnostics');
    const setup = jest.fn();
    const dispose = jest.fn();
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [
        {
          id: 'lifecycle.deferred',
          name: 'Lifecycle Deferred',
          version: '1.0.0',
          setup,
          dispose,
        },
      ],
    });

    await runtime.dispose();
    expect(subscribeDiagnostics).not.toHaveBeenCalled();
    expect(setup).not.toHaveBeenCalled();
    expect(dispose).not.toHaveBeenCalled();

    await runtime.setup();
    await runtime.dispose();
    await runtime.setup();
    expect(setup).toHaveBeenCalledTimes(2);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(subscribeDiagnostics).toHaveBeenCalledTimes(2);
    await runtime.dispose();
    subscribeDiagnostics.mockRestore();
  });

  it('rolls back a failed setup generation and permits a clean retry', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const setupError = new Error('first setup failed');
    let successfulSetupCount = 0;
    let successfulDisposeCount = 0;
    let setupCount = 0;
    let disposeCount = 0;
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'option-domain',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        },
      ],
      plugins: [
        {
          id: 'lifecycle.retry-successful',
          name: 'Lifecycle Retry Successful',
          version: '1.0.0',
          setup: () => {
            successfulSetupCount++;
          },
          dispose: () => {
            successfulDisposeCount++;
          },
        },
        {
          id: 'lifecycle.retry',
          name: 'Lifecycle Retry',
          version: '1.0.0',
          setup: (context) => {
            setupCount++;
            context.save.register(
              'retry-domain',
              {
                key: 'retry-domain',
                serialize: () => ({ ok: true }),
                hydrate: () => undefined,
              },
              'lifecycle.retry',
            );
            if (setupCount === 1) throw setupError;
          },
          dispose: () => {
            disposeCount++;
          },
        },
      ],
    });

    await expect(runtime.setup()).rejects.toBe(setupError);
    expect(Array.from(save.getBindings())).toEqual([]);
    expect(runtime.plugins.context.save.has('retry-domain')).toBe(false);
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBeUndefined();
    expect(disposeCount).toBe(1);
    expect(successfulSetupCount).toBe(1);
    expect(successfulDisposeCount).toBe(1);

    await runtime.setup();
    expect(setupCount).toBe(2);
    expect(successfulSetupCount).toBe(2);
    expect(
      Array.from(save.getBindings())
        .map((binding) => binding.key)
        .sort(),
    ).toEqual(['gameplay-events', 'option-domain', 'retry-domain']);
    await runtime.dispose();
    expect(successfulDisposeCount).toBe(2);
  });

  it('does not unregister an external binding when setup registration fails', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const externalBinding = {
      key: 'shared-domain',
      serialize: () => ({ owner: 'external' }),
      hydrate: () => undefined,
    };
    save.register(externalBinding);
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'shared-domain',
          serialize: () => ({ owner: 'runtime' }),
          hydrate: () => undefined,
        },
      ],
    });

    await expect(runtime.setup()).rejects.toThrow(
      'Save domain "shared-domain" is already registered.',
    );

    expect(save.has('shared-domain')).toBe(true);
    expect(save.createBlob('ownership-slot').domains['shared-domain']).toEqual({
      owner: 'external',
    });
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBeUndefined();
    await runtime.dispose();
    expect(save.has('shared-domain')).toBe(true);
  });

  it('preserves the setup error when rollback disposal also fails', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const setupError = new Error('setup error');
    const rollbackError = new Error('rollback error');
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'option-domain',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        },
      ],
      plugins: [
        {
          id: 'lifecycle.rollback-failure',
          name: 'Lifecycle Rollback Failure',
          version: '1.0.0',
          setup: () => {
            throw setupError;
          },
          dispose: () => {
            throw rollbackError;
          },
        },
      ],
    });

    await expect(runtime.setup()).rejects.toBe(setupError);
    expect(Array.from(save.getBindings())).toEqual([]);
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBeUndefined();
    await expect(runtime.dispose()).resolves.toBeUndefined();
  });

  it('finishes external cleanup and preserves the first error when plugin disposal fails', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const originalRegister = save.register.bind(save);
    const lateCleanupError = new Error('late cleanup failed');
    const register = jest.spyOn(save, 'register').mockImplementation((binding) => {
      const unregister = originalRegister(binding);
      return () => {
        unregister();
        if (binding.key === 'option-domain') throw lateCleanupError;
      };
    });
    const warnings: unknown[] = [];
    const disposeError = new Error('plugin dispose failed');
    const survivorDispose = jest.fn();
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'option-domain',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        },
      ],
      plugins: [
        {
          id: 'lifecycle.dispose-survivor',
          name: 'Lifecycle Dispose Survivor',
          version: '1.0.0',
          setup: () => undefined,
          dispose: survivorDispose,
        },
        {
          id: 'lifecycle.dispose-failure',
          name: 'Lifecycle Dispose Failure',
          version: '1.0.0',
          setup: (context) => {
            context.save.register(
              'plugin-domain',
              {
                key: 'plugin-domain',
                serialize: () => ({ ok: true }),
                hydrate: () => undefined,
              },
              'lifecycle.dispose-failure',
            );
          },
          dispose: () => {
            throw disposeError;
          },
        },
      ],
      logger: {
        warn: (_message, diagnostic) => warnings.push(diagnostic),
      },
    });

    await runtime.setup();
    await expect(runtime.dispose()).rejects.toBe(disposeError);

    expect(Array.from(save.getBindings())).toEqual([]);
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBeUndefined();
    expect(survivorDispose).toHaveBeenCalledTimes(1);
    save.register({
      key: 'after-dispose-failure',
      serialize: () => {
        throw new Error('after dispose');
      },
      hydrate: () => undefined,
    });
    await expect(save.save('after-dispose-failure')).rejects.toThrow('Save serialization failed');
    expect(warnings).toEqual([]);
    await expect(runtime.dispose()).resolves.toBeUndefined();
    register.mockRestore();
  });

  it('registers save bindings contributed by plugins during setup', async () => {
    const adapter = new MemoryAdapter();
    const save = new SaveSystem({ adapter });
    let value = 7;
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [
        createSavePlugin(
          () => ({ value }),
          (data) => {
            if (data && typeof data === 'object' && 'value' in data) {
              value = Number((data as { value: unknown }).value);
            }
          },
        ),
      ],
    });

    await runtime.setup();
    await runtime.save.save('slot');

    value = 0;
    await runtime.save.load('slot');

    expect(value).toBe(7);
    expect(Array.from(runtime.save.getBindings()).map((binding) => binding.key)).toEqual([
      'plugin-domain',
      'gameplay-events',
    ]);
  });

  it('unregisters option and plugin save bindings on dispose', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [
        {
          key: 'option-domain',
          serialize: () => ({ ok: true }),
          hydrate: () => undefined,
        },
      ],
      plugins: [
        createSavePlugin(
          () => ({ ok: true }),
          () => undefined,
        ),
      ],
    });

    await runtime.setup();
    expect(
      Array.from(save.getBindings())
        .map((binding) => binding.key)
        .sort(),
    ).toEqual(['gameplay-events', 'option-domain', 'plugin-domain']);

    await runtime.dispose();

    expect(Array.from(save.getBindings())).toEqual([]);
    expect(runtime.plugins.context.save.has('plugin-domain')).toBe(false);
  });

  const RUNTIME_GAMEPLAY_SAVE_KEY = 'gameplay-events';
  const pluginBindings = (save: SaveSystem) =>
    Array.from(save.getBindings()).filter((binding) => binding.key !== RUNTIME_GAMEPLAY_SAVE_KEY);

  it('connects and releases save bindings of plugins used after setup', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save });
    await runtime.setup();

    await runtime.plugins.use(createSavePlugin(() => ({ ok: true }), () => undefined));
    expect(pluginBindings(save).map((binding) => binding.key)).toEqual(['plugin-domain']);

    await runtime.plugins.dispose('test.save-plugin');
    expect(pluginBindings(save)).toEqual([]);
    await runtime.dispose();
  });

  it('rejects a conflicting late plugin save binding with a runtime event', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveBindings: [{ key: 'plugin-domain', serialize: () => ({ owner: 'option' }), hydrate: () => undefined }],
    });
    await runtime.setup();
    const rejected = jest.fn();
    runtime.plugins.context.events.on(RUNTIME_SAVE_BINDING_REJECTED_EVENT, rejected);

    await runtime.plugins.use(createSavePlugin(() => ({ owner: 'plugin' }), () => undefined));

    expect(runtime.plugins.status('test.save-plugin')).toBe('ready');
    expect(rejected).toHaveBeenCalledWith(expect.objectContaining({ key: 'plugin-domain', pluginId: 'test.save-plugin' }));
    expect(pluginBindings(save).map((binding) => binding.serialize())).toEqual([{ owner: 'option' }]);
    await runtime.dispose();
  });

  it('round-trips camera state contributed by the camera plugin', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createCameraPlugin()],
    });

    await runtime.setup();

    runtime.store.getState().setMode({ type: 'vehicle', control: 'isometric' });
    runtime.store.getState().setCameraOption({
      fov: 48,
      zoom: 1.4,
      position: new THREE.Vector3(2, 4, 6),
      target: new THREE.Vector3(8, 10, 12),
    });

    await runtime.save.save('camera-slot');

    runtime.store.getState().setMode({ type: 'character', control: 'firstPerson' });
    runtime.store.getState().setCameraOption({
      fov: 90,
      zoom: 2,
      position: new THREE.Vector3(20, 40, 60),
      target: new THREE.Vector3(80, 100, 120),
    });

    await runtime.save.load('camera-slot');

    const state = runtime.store.getState();
    expect(state.mode).toEqual({
      type: 'vehicle',
      controller: 'keyboard',
      control: 'isometric',
    });
    expect(state.cameraOption).toEqual(
      expect.objectContaining({
        fov: 48,
        zoom: 1.4,
        position: expect.objectContaining({ x: 2, y: 4, z: 6 }),
        target: expect.objectContaining({ x: 8, y: 10, z: 12 }),
      }),
    );

    await runtime.dispose();
  });

  it('round-trips building, camera, and npc domains through runtime save bindings', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createBuildingPlugin(), createCameraPlugin(), createNPCPlugin()],
    });
    const hydrateNPC = (data: Parameters<typeof hydrateNPCState>[0]) => hydrateNPCState(data, runtime.npcStore);
    const originalBuilding = runtime.buildingStore.getState().serialize();
    const originalNPC = serializeNPCState(runtime.npcStore);

    await runtime.setup();

    runtime.buildingStore.getState().hydrate({
      version: 1,
      meshes: [],
      wallGroups: [],
      tileGroups: [],
      blocks: [
        {
          id: 'block-runtime-roundtrip',
          position: { x: 2, y: 0, z: 4 },
          cell: { x: 2, z: 4, level: 0 },
        },
      ],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
    });
    runtime.store.getState().setMode({ type: 'character', control: 'thirdPerson' });
    runtime.store.getState().setCameraOption({
      fov: 55,
      zoom: 1.25,
      position: new THREE.Vector3(3, 5, 7),
      target: new THREE.Vector3(1, 0, 2),
    });
    hydrateNPC([
      {
        id: 'npc-runtime-roundtrip',
        templateId: 'ally',
        name: 'Runtime NPC',
        position: [1, 0, 1],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        brain: { mode: 'scripted' },
        behavior: { mode: 'idle', speed: 2.2 },
      },
    ]);

    await runtime.save.save('world-slot');

    runtime.buildingStore.getState().hydrate({
      version: 1,
      meshes: [],
      wallGroups: [],
      tileGroups: [],
      blocks: [],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
    });
    runtime.store.getState().setMode({ type: 'vehicle', control: 'isometric' });
    runtime.store.getState().setCameraOption({
      fov: 90,
      zoom: 2,
      position: new THREE.Vector3(20, 40, 60),
      target: new THREE.Vector3(80, 100, 120),
    });
    hydrateNPC([]);

    await runtime.save.load('world-slot');

    expect(runtime.buildingStore.getState().blocks).toEqual([
      expect.objectContaining({
        id: 'block-runtime-roundtrip',
        cell: { x: 2, z: 4, level: 0 },
      }),
    ]);
    expect(runtime.store.getState().cameraOption).toEqual(
      expect.objectContaining({
        fov: 55,
        zoom: 1.25,
        position: expect.objectContaining({ x: 3, y: 5, z: 7 }),
        target: expect.objectContaining({ x: 1, y: 0, z: 2 }),
      }),
    );
    expect(runtime.npcStore.getState().instances.get('npc-runtime-roundtrip')).toEqual(
      expect.objectContaining({
        name: 'Runtime NPC',
        brain: { mode: 'scripted' },
      }),
    );

    runtime.buildingStore.getState().hydrate(originalBuilding);
    hydrateNPC(originalNPC);
    await runtime.dispose();
  });

  it('round-trips time, weather, and audio domains through runtime save bindings', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createTimePlugin(), createWeatherPlugin(), createAudioPlugin()],
    });
    const originalTime = useTimeStore.getState().serialize();
    const originalWeather = runtime.weatherStore.getState().serialize();
    const originalAudio = runtime.audioStore.getState().serialize();

    await runtime.setup();

    runtime.timeStore.getState().setMode('scaled');
    runtime.timeStore.getState().setScale(2.5);
    runtime.timeStore.getState().setTotalMinutes(1450);
    runtime.weatherStore.getState().setWeather('rain', 0.8, 3);
    runtime.audioStore.setState({
      masterMuted: true,
      bgmMuted: false,
      sfxMuted: true,
      masterVolume: 0.3,
      bgmVolume: 0.2,
      sfxVolume: 0.1,
    });

    await runtime.save.save('world-utility-slot');

    runtime.timeStore.getState().setScale(1);
    runtime.timeStore.getState().setTotalMinutes(480);
    runtime.weatherStore.getState().setWeather('sunny', 0.4, 9);
    runtime.audioStore.setState({
      masterMuted: false,
      bgmMuted: true,
      sfxMuted: false,
      masterVolume: 1,
      bgmVolume: 1,
      sfxVolume: 1,
    });

    await runtime.save.load('world-utility-slot');

    expect(runtime.timeStore.getState().serialize()).toEqual(
      expect.objectContaining({
        totalMinutes: 1450,
        mode: 'scaled',
        scale: 2.5,
      }),
    );
    expect(runtime.weatherStore.getState().serialize()).toEqual(
      expect.objectContaining({
        current: { day: 3, kind: 'rain', intensity: 0.8 },
      }),
    );
    expect(runtime.audioStore.getState().serialize()).toEqual(
      expect.objectContaining({
        masterMuted: true,
        bgmMuted: false,
        sfxMuted: true,
        masterVolume: 0.3,
        bgmVolume: 0.2,
        sfxVolume: 0.1,
      }),
    );

    expect(useTimeStore.getState().serialize()).toEqual(originalTime);
    runtime.weatherStore.getState().hydrate(originalWeather);
    runtime.audioStore.getState().hydrate(originalAudio);
    await runtime.dispose();
  });

  it('round-trips scene, character and i18n domains contributed by store plugins', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createScenePlugin(), createCharacterPlugin(), createI18nPlugin()],
    });
    const originalI18n = useI18nStore.getState().serialize();
    const originalScene = runtime.sceneStore.getState().serialize();
    const originalCharacter = runtime.characterStore.getState().serialize();

    await runtime.setup();

    try {
      expect(
        Array.from(save.getBindings())
          .map((binding) => binding.key)
          .sort(),
      ).toEqual(['character', 'gameplay-events', 'i18n', 'scene']);

      runtime.sceneStore
        .getState()
        .registerScene({ id: 'test-house', name: 'Test House', interior: true });
      runtime.sceneStore.getState().hydrate({ version: 1, current: 'test-house' });
      runtime.characterStore.getState().setName('Runtime Player');
      useI18nStore.getState().hydrate({ version: 1, locale: 'en' });

      await runtime.save.save('progress-slot');

      runtime.sceneStore.getState().hydrate({ version: 1, current: 'outdoor' });
      runtime.characterStore.getState().resetAppearance();
      useI18nStore.getState().hydrate({ version: 1, locale: 'ko' });

      await runtime.save.load('progress-slot');

      expect(runtime.sceneStore.getState().current).toBe('test-house');
      expect(runtime.characterStore.getState().appearance.name).toBe('Runtime Player');
      expect(useI18nStore.getState().locale).toBe('en');
    } finally {
      useI18nStore.getState().hydrate(originalI18n);
      runtime.sceneStore.getState().hydrate(originalScene);
      runtime.characterStore.getState().hydrate(originalCharacter);
      await runtime.dispose();
    }
  });

  it('routes SaveSystem diagnostics to the runtime logger when it owns the save system', async () => {
    const warnings: unknown[] = [];
    const runtime = createGaesupRuntime({
      saveOptions: {
        adapter: new MemoryAdapter(),
      },
      logger: {
        warn: (_message, meta) => {
          warnings.push(meta);
        },
      },
    });

    runtime.save.register({
      key: 'broken-domain',
      serialize: () => {
        throw new Error('serialize failed');
      },
      hydrate: () => undefined,
    });

    await runtime.setup();
    await expect(runtime.save.save('diagnostic-slot')).rejects.toThrow('Save serialization failed');

    expect(warnings).toEqual([
      expect.objectContaining({
        phase: 'serialize',
        key: 'broken-domain',
        slot: 'diagnostic-slot',
      }),
    ]);
    await runtime.dispose();
  });

  it('collects and exposes SaveSystem diagnostics from an injected save system', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const warnings: Array<{ message: string; meta: unknown }> = [];
    const runtime = createGaesupRuntime({
      saveSystem: save,
      saveDiagnostics: { maxEntries: 1 },
      logger: {
        warn: (message, meta) => {
          warnings.push({ message, meta });
        },
      },
    });
    const emitted: RuntimeSaveDiagnostic[] = [];
    runtime.plugins.context.events.on<RuntimeSaveDiagnostic>(
      RUNTIME_SAVE_DIAGNOSTIC_EVENT,
      (diagnostic) => emitted.push(diagnostic),
    );

    runtime.save.register({
      key: 'provided-broken-domain',
      serialize: () => {
        throw new Error('provided serialize failed');
      },
      hydrate: () => undefined,
    });

    await runtime.setup();
    await expect(runtime.save.save('provided-diagnostic-slot')).rejects.toThrow('Save serialization failed');

    const service = runtime.requireService<RuntimeSaveDiagnosticsService>(
      DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
    );
    expect(service).toBe(runtime.saveDiagnostics);
    expect(runtime.saveDiagnostics.getDiagnostics()).toEqual([
      expect.objectContaining({
        phase: 'serialize',
        key: 'provided-broken-domain',
        slot: 'provided-diagnostic-slot',
        errorMessage: 'provided serialize failed',
      }),
    ]);
    expect(runtime.saveDiagnostics.getLatest()?.message).toContain(
      'Save domain "provided-broken-domain" failed during serialize',
    );
    expect(warnings[0]?.message).toContain('Save domain "provided-broken-domain" failed');
    expect(emitted).toHaveLength(1);

    await runtime.dispose();
    expect(runtime.getService(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID)).toBeUndefined();

    await expect(runtime.save.save('provided-diagnostic-slot')).rejects.toThrow('Save serialization failed');
    expect(warnings).toHaveLength(1);
  });

  it('exposes plugin services through runtime helpers', async () => {
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
      plugins: [createMotionsPlugin()],
    });

    await runtime.setup();

    const optionalService = runtime.getService<MotionsRuntimeService>('motions.runtime');
    const requiredService = runtime.requireService<MotionsRuntimeService>('motions.runtime');

    expect(optionalService).toBe(requiredService);
    expect(requiredService.create().physicsBridge).toBeInstanceOf(PhysicsBridge);
    expect(runtime.getService('missing.service')).toBeUndefined();
    expect(() => runtime.requireService('missing.service')).toThrow(
      'Extension "missing.service" is not registered.',
    );

    await runtime.dispose();
  });

  it('filters plugin setup by runtime target', async () => {
    const calls: string[] = [];
    const markerPlugin = (id: string, runtime: NonNullable<GaesupPlugin['runtime']>): GaesupPlugin => ({
      id,
      name: id,
      version: '1.0.0',
      runtime,
      setup: () => {
        calls.push(id);
      },
    });
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
      pluginRuntime: 'server',
      plugins: [
        markerPlugin('client-only', 'client'),
        markerPlugin('server-only', 'server'),
        markerPlugin('shared', 'both'),
        markerPlugin('editor-only', 'editor'),
      ],
    });

    await runtime.setup();

    expect(runtime.pluginRuntime).toBe('server');
    expect(runtime.plugins.has('client-only')).toBe(false);
    expect(runtime.plugins.has('editor-only')).toBe(false);
    expect(runtime.plugins.has('server-only')).toBe(true);
    expect(runtime.plugins.has('shared')).toBe(true);
    expect(calls).toEqual(['server-only', 'shared']);

    await runtime.dispose();
  });

  it('treats plugins without a runtime as client plugins', () => {
    expect(shouldSetupPluginForRuntime(undefined, 'client')).toBe(true);
    expect(shouldSetupPluginForRuntime(undefined, 'server')).toBe(false);
    expect(shouldSetupPluginForRuntime('both', 'server')).toBe(true);
    expect(shouldSetupPluginForRuntime('editor', 'client')).toBe(false);
  });
});
