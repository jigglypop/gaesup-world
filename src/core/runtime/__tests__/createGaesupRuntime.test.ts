import * as THREE from 'three';
import { createSceneDocument, createSceneDocumentController, createSceneDocumentSaveBinding } from '../../scene-object';

import { createAudioPlugin } from '../../audio/plugin';
import { useAudioStore } from '../../audio/stores/audioStore';
import { createBuildingPlugin } from '../../building/plugin';
import { useBuildingStore } from '../../building/stores/buildingStore';
import { createCameraPlugin } from '../../camera';
import { createCatalogPlugin } from '../../catalog/plugin';
import { useCatalogStore } from '../../catalog/stores/catalogStore';
import { createCharacterPlugin } from '../../character/plugin';
import { useCharacterStore } from '../../character/stores/characterStore';
import { createCraftingPlugin } from '../../crafting/plugin';
import { useCraftingStore } from '../../crafting/stores/craftingStore';
import { createEconomyPlugin } from '../../economy/plugin';
import { useShopStore } from '../../economy/stores/shopStore';
import { useWalletStore } from '../../economy/stores/walletStore';
import { createEventsPlugin } from '../../events/plugin';
import { useEventsStore } from '../../events/stores/eventsStore';
import { createFarmingPlugin } from '../../farming/plugin';
import { usePlotStore } from '../../farming/stores/plotStore';
import { createI18nPlugin } from '../../i18n/plugin';
import { useI18nStore } from '../../i18n/stores/i18nStore';
import { createInventoryPlugin } from '../../inventory/plugin';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { createMailPlugin } from '../../mail/plugin';
import { useMailStore } from '../../mail/stores/mailStore';
import { createMotionsPlugin, type MotionsRuntimeService } from '../../motions';
import { PhysicsBridge } from '../../motions/bridge/PhysicsBridge';
import { createNPCPlugin, hydrateNPCState, serializeNPCState } from '../../npc/plugin';
import { useNPCStore } from '../../npc/stores/npcStore';
import type { GaesupPlugin } from '../../plugins';
import { createQuestsPlugin } from '../../quests/plugin';
import { useQuestStore } from '../../quests/stores/questStore';
import { createRelationsPlugin } from '../../relations/plugin';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';
import { SaveSystem } from '../../save';
import type { SaveAdapter, SaveBlob } from '../../save';
import { createScenePlugin } from '../../scene/plugin';
import { useSceneStore } from '../../scene/stores/sceneStore';
import { useGaesupStore } from '../../stores/gaesupStore';
import { createTimePlugin } from '../../time/plugin';
import { useTimeStore } from '../../time/stores/timeStore';
import { createTownPlugin } from '../../town/plugin';
import { useTownStore } from '../../town/stores/townStore';
import { createWeatherPlugin } from '../../weather/plugin';
import { useWeatherStore } from '../../weather/stores/weatherStore';
import { createGaesupRuntime, shouldSetupPluginForRuntime } from '../createGaesupRuntime';
import {
  DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
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
  it('rejects malformed scene state before applying mail', async () => {
    const mail = useMailStore.getState();
    const scene = useSceneStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createMailPlugin(), createScenePlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        mail: { version: 1, messages: [] }, scene: { version: 1, current: 12 },
      } })).toThrow('Save hydration failed');
      expect(useMailStore.getState()).toBe(mail);
      expect(useSceneStore.getState()).toBe(scene);
    } finally { await runtime.dispose(); }
  });

  it('rejects corrupt character appearance before replacing saved mail', async () => {
    const mail = useMailStore.getState();
    const character = useCharacterStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createMailPlugin(), createCharacterPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        mail: { version: 1, messages: [{ id: 'new', from: '', subject: '', body: '', sentDay: 0 }] },
        character: { version: 3, activeCharacterId: 'custom', characters: { custom: { appearance: { hair: 'unknown' } } } },
      } })).toThrow('Save hydration failed');
      expect(useMailStore.getState()).toBe(mail);
      expect(useCharacterStore.getState()).toBe(character);
    } finally { await runtime.dispose(); }
  });

  it.each([
    { version: 2 }, { editMode: 'yes' }, { instances: {} },
    { animations: [{ id: 'same' }, { id: 'same' }] },
    { instances: [{ id: 'npc', templateId: 'custom', name: '주민', position: [0, NaN, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }] },
  ])('rejects malformed NPC snapshots before applying wallet: %j', async (npc) => {
    const wallet = useWalletStore.getState();
    const before = useNPCStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createEconomyPlugin(), createNPCPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        wallet: { ...wallet.serialize(), bells: wallet.bells + 10 }, npc,
      } })).toThrow('Save hydration failed');
      expect(useWalletStore.getState()).toBe(wallet);
      expect(useNPCStore.getState()).toBe(before);
    } finally { await runtime.dispose(); }
  });

  it('prepares owned NPC maps while preserving legacy arrays and omitted collections', async () => {
    const before = useNPCStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save, plugins: [createNPCPlugin()] });
    await runtime.setup();
    try {
      const data: Parameters<typeof hydrateNPCState>[0] = [{ id: 'custom', templateId: 'unregistered', name: '주민',
        position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1], metadata: { dialogue: ['안녕하세요'] } }];
      const binding = [...save.getBindings()].find((entry) => entry.key === 'npc')!;
      const apply = binding.prepareHydrate!(data);
      expect(useNPCStore.getState()).toBe(before);
      data[0]!.position[0] = 99;
      data[0]!.metadata!.dialogue![0] = '변경';
      apply();
      expect(useNPCStore.getState().instances.get('custom')).toMatchObject({
        position: [1, 2, 3], metadata: { dialogue: ['안녕하세요'] },
      });
      expect(useNPCStore.getState().templates).toBe(before.templates);
      hydrateNPCState({ instances: [] });
      expect(useNPCStore.getState().instances.size).toBe(0);
      expect(useNPCStore.getState().templates).toBe(before.templates);
    } finally {
      useNPCStore.setState(before);
      await runtime.dispose();
    }
  });

  it.each(['farming', 'town'])('rejects corrupt %s before changing other world domains', async (invalid) => {
    const farming = usePlotStore.getState();
    const town = useTownStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createFarmingPlugin(), createTownPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        farming: { version: 1, plots: [{ id: 'p', position: [0, 0, 0], state: 'empty', stageIndex: invalid === 'farming' ? -1 : 0 }] },
        town: { version: 1, houses: [{ id: 'h', position: [0, 0, 0], size: [4, invalid === 'town' ? 0 : 4], state: 'empty' }], residents: [] },
      } })).toThrow('Save hydration failed');
      expect(usePlotStore.getState()).toBe(farming);
      expect(useTownStore.getState()).toBe(town);
    } finally { await runtime.dispose(); }
  });

  it('rejects corrupt quest progress before replacing the mailbox', async () => {
    const mail = useMailStore.getState();
    const quests = useQuestStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createMailPlugin(), createQuestsPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        mail: { version: 1, messages: [{ id: 'new', from: '', subject: '', body: '', sentDay: 0 }] },
        quests: { version: 1, state: { custom: { questId: 'custom', status: 'active', progress: { goal: -1 } } } },
      } })).toThrow('Save hydration failed');
      expect(useMailStore.getState()).toBe(mail);
      expect(useQuestStore.getState()).toBe(quests);
    } finally { await runtime.dispose(); }
  });

  it('rejects corrupt mail before applying a valid wallet snapshot', async () => {
    const wallet = useWalletStore.getState();
    const mail = useMailStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createEconomyPlugin(), createMailPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        wallet: { ...wallet.serialize(), bells: wallet.bells + 10 },
        mail: { version: 1, messages: [{ id: 'gift', from: '', subject: '', body: '', sentDay: 0,
          attachments: [{ itemId: 'apple', count: -1 }] }] },
      } })).toThrow('Save hydration failed');
      expect(useWalletStore.getState()).toBe(wallet);
      expect(useMailStore.getState()).toBe(mail);
    } finally { await runtime.dispose(); }
  });

  it.each([NaN, -1, 0.5])('rejects corrupt gift history before applying events: %s', async (count) => {
    const events = useEventsStore.getState();
    const relations = useFriendshipStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createEventsPlugin(), createRelationsPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        events: { version: 1, active: ['custom-event'], startedAt: { 'custom-event': 10 } },
        relations: { version: 1, entries: { npc: { npcId: 'npc', score: 1, todayGained: 1, lastGiftDay: 0, giftHistory: { apple: count } } } },
      } })).toThrow('Save hydration failed');
      expect(useEventsStore.getState()).toBe(events);
      expect(useFriendshipStore.getState()).toBe(relations);
    } finally { await runtime.dispose(); }
  });

  it('owns prepared gift histories and clears tags from replaced events', () => {
    const events = useEventsStore.getState();
    const relations = useFriendshipStore.getState();
    try {
      useEventsStore.setState({ tags: new Set(['old-event-tag']) });
      const data = { version: 1, entries: { npc: { npcId: 'npc', score: 1, todayGained: 1, lastGiftDay: 0, giftHistory: { apple: 2 } } } };
      const apply = relations.prepareHydrate(data);
      data.entries.npc.giftHistory.apple = 99;
      expect(useFriendshipStore.getState()).toBe(relations);
      apply();
      expect(useFriendshipStore.getState().entries['npc']!.giftHistory['apple']).toBe(2);
      useEventsStore.getState().hydrate({ version: 1, active: [], startedAt: {} });
      expect(useEventsStore.getState().hasTag('old-event-tag')).toBe(false);
      const before = useEventsStore.getState();
      expect(() => before.prepareHydrate({ version: 1, active: ['event'], startedAt: { event: NaN } })).toThrow(TypeError);
      expect(useEventsStore.getState()).toBe(before);
    } finally {
      useEventsStore.setState(events);
      useFriendshipStore.setState(relations);
    }
  });

  it.each(['invalid-locale', 'invalid-volume'])('rejects %s without applying audio settings', async (invalid) => {
    const originalAudio = useAudioStore.getState();
    const apply = jest.fn();
    useAudioStore.setState({ apply });
    const before = useAudioStore.getState();
    const language = useI18nStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createAudioPlugin(), createI18nPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        audio: { ...before.serialize(), masterVolume: invalid === 'invalid-volume' ? NaN : 0.1 },
        i18n: { version: 1, locale: invalid === 'invalid-locale' ? 'unsupported' : 'ko' },
      } })).toThrow('Save hydration failed');
      expect(useAudioStore.getState()).toBe(before);
      expect(useI18nStore.getState()).toBe(language);
      expect(apply).not.toHaveBeenCalled();
    } finally {
      await runtime.dispose();
      useAudioStore.setState(originalAudio);
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
    const time = useTimeStore.getState();
    const weather = useWeatherStore.getState();
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createTimePlugin(), createWeatherPlugin()], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: {
        time: { ...time.serialize(), totalMinutes: 2880 },
        weather: { version: 1, current: { day: 2, kind: 'rain', intensity }, history: [] },
      } })).toThrow('Save hydration failed');
      expect(useTimeStore.getState()).toBe(time);
      expect(useWeatherStore.getState()).toBe(weather);
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

  it.each([
    { crafting: { version: 2, unlocked: [] } },
    { crafting: { version: 1, unlocked: [null] } },
    { catalog: { version: 1, entries: [] } },
    { catalog: { version: 1, entries: { apple: { itemId: 'apple', firstSeenDay: 0, totalCollected: -1 } } } },
  ])('rejects corrupt collection records before applying other domains: %j', async (domains) => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const hydrate = jest.fn();
    const crafting = useCraftingStore.getState();
    const catalog = useCatalogStore.getState();
    const runtime = createGaesupRuntime({ saveSystem: save,
      plugins: [createCraftingPlugin(), createCatalogPlugin()],
      saveBindings: [{ key: 'earlier', serialize: () => null, hydrate }], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains })).toThrow('Save hydration failed');
      expect(hydrate).not.toHaveBeenCalled();
      expect(useCraftingStore.getState()).toBe(crafting);
      expect(useCatalogStore.getState()).toBe(catalog);
    } finally { await runtime.dispose(); }
  });

  it('prepares owned collection records while preserving custom IDs', () => {
    const crafting = useCraftingStore.getState();
    const catalog = useCatalogStore.getState();
    try {
      const recipe = { version: 1, unlocked: ['custom-recipe'] };
      const collection = { version: 1, entries: { custom: { itemId: 'custom', firstSeenDay: 3, totalCollected: 2 } } };
      const applyCrafting = crafting.prepareHydrate(recipe);
      const applyCatalog = catalog.prepareHydrate(collection);
      recipe.unlocked.push('later');
      collection.entries.custom.totalCollected = 99;
      expect(useCraftingStore.getState()).toBe(crafting);
      expect(useCatalogStore.getState()).toBe(catalog);
      applyCrafting();
      applyCatalog();
      expect([...useCraftingStore.getState().unlocked]).toEqual(['custom-recipe']);
      expect(useCatalogStore.getState().get('custom')?.totalCollected).toBe(2);
    } finally {
      useCraftingStore.setState(crafting);
      useCatalogStore.setState(catalog);
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
    ).toEqual(['option-domain', 'retry-domain']);
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
    ).toEqual(['option-domain', 'plugin-domain']);

    await runtime.dispose();

    expect(Array.from(save.getBindings())).toEqual([]);
    expect(runtime.plugins.context.save.has('plugin-domain')).toBe(false);
  });

  it('round-trips camera state contributed by the camera plugin', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createCameraPlugin()],
    });

    await runtime.setup();

    useGaesupStore.getState().setMode({ type: 'vehicle', control: 'isometric' });
    useGaesupStore.getState().setCameraOption({
      fov: 48,
      zoom: 1.4,
      position: new THREE.Vector3(2, 4, 6),
      target: new THREE.Vector3(8, 10, 12),
    });

    await runtime.save.save('camera-slot');

    useGaesupStore.getState().setMode({ type: 'character', control: 'firstPerson' });
    useGaesupStore.getState().setCameraOption({
      fov: 90,
      zoom: 2,
      position: new THREE.Vector3(20, 40, 60),
      target: new THREE.Vector3(80, 100, 120),
    });

    await runtime.save.load('camera-slot');

    const state = useGaesupStore.getState();
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
    const originalBuilding = useBuildingStore.getState().serialize();
    const originalNPC = serializeNPCState();

    await runtime.setup();

    useBuildingStore.getState().hydrate({
      version: 1,
      meshes: [],
      wallGroups: [],
      tileGroups: [],
      blocks: [
        {
          id: 'block-runtime-roundtrip',
          position: { x: 2, y: 0, z: 4 },
          cell: { x: 2, z: 4 },
        },
      ],
      objects: [],
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
    });
    useGaesupStore.getState().setMode({ type: 'character', control: 'thirdPerson' });
    useGaesupStore.getState().setCameraOption({
      fov: 55,
      zoom: 1.25,
      position: new THREE.Vector3(3, 5, 7),
      target: new THREE.Vector3(1, 0, 2),
    });
    hydrateNPCState([
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

    useBuildingStore.getState().hydrate({
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
    useGaesupStore.getState().setMode({ type: 'vehicle', control: 'isometric' });
    useGaesupStore.getState().setCameraOption({
      fov: 90,
      zoom: 2,
      position: new THREE.Vector3(20, 40, 60),
      target: new THREE.Vector3(80, 100, 120),
    });
    hydrateNPCState([]);

    await runtime.save.load('world-slot');

    expect(useBuildingStore.getState().blocks).toEqual([
      expect.objectContaining({
        id: 'block-runtime-roundtrip',
        cell: { x: 2, z: 4 },
      }),
    ]);
    expect(useGaesupStore.getState().cameraOption).toEqual(
      expect.objectContaining({
        fov: 55,
        zoom: 1.25,
        position: expect.objectContaining({ x: 3, y: 5, z: 7 }),
        target: expect.objectContaining({ x: 1, y: 0, z: 2 }),
      }),
    );
    expect(useNPCStore.getState().instances.get('npc-runtime-roundtrip')).toEqual(
      expect.objectContaining({
        name: 'Runtime NPC',
        brain: { mode: 'scripted' },
      }),
    );

    useBuildingStore.getState().hydrate(originalBuilding);
    hydrateNPCState(originalNPC);
    await runtime.dispose();
  });

  it('round-trips time, weather, and audio domains through runtime save bindings', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [createTimePlugin(), createWeatherPlugin(), createAudioPlugin()],
    });
    const originalTime = useTimeStore.getState().serialize();
    const originalWeather = useWeatherStore.getState().serialize();
    const originalAudio = useAudioStore.getState().serialize();

    await runtime.setup();

    useTimeStore.getState().setMode('scaled');
    useTimeStore.getState().setScale(2.5);
    useTimeStore.getState().setTotalMinutes(1450);
    useWeatherStore.getState().setWeather('rain', 0.8, 3);
    useAudioStore.setState({
      masterMuted: true,
      bgmMuted: false,
      sfxMuted: true,
      masterVolume: 0.3,
      bgmVolume: 0.2,
      sfxVolume: 0.1,
    });

    await runtime.save.save('world-utility-slot');

    useTimeStore.getState().setScale(1);
    useTimeStore.getState().setTotalMinutes(480);
    useWeatherStore.getState().setWeather('sunny', 0.4, 9);
    useAudioStore.setState({
      masterMuted: false,
      bgmMuted: true,
      sfxMuted: false,
      masterVolume: 1,
      bgmVolume: 1,
      sfxVolume: 1,
    });

    await runtime.save.load('world-utility-slot');

    expect(useTimeStore.getState().serialize()).toEqual(
      expect.objectContaining({
        totalMinutes: 1450,
        mode: 'scaled',
        scale: 2.5,
      }),
    );
    expect(useWeatherStore.getState().serialize()).toEqual(
      expect.objectContaining({
        current: { day: 3, kind: 'rain', intensity: 0.8 },
      }),
    );
    expect(useAudioStore.getState().serialize()).toEqual(
      expect.objectContaining({
        masterMuted: true,
        bgmMuted: false,
        sfxMuted: true,
        masterVolume: 0.3,
        bgmVolume: 0.2,
        sfxVolume: 0.1,
      }),
    );

    useTimeStore.getState().hydrate(originalTime);
    useWeatherStore.getState().hydrate(originalWeather);
    useAudioStore.getState().hydrate(originalAudio);
    await runtime.dispose();
  });

  it('round-trips player progress domains contributed by store plugins', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [
        createScenePlugin(),
        createCharacterPlugin(),
        createInventoryPlugin(),
        createEconomyPlugin(),
        createRelationsPlugin(),
        createQuestsPlugin(),
        createMailPlugin(),
        createCatalogPlugin(),
        createCraftingPlugin(),
        createFarmingPlugin(),
        createEventsPlugin(),
        createTownPlugin(),
        createI18nPlugin(),
      ],
    });
    const originalInventory = useInventoryStore.getState().serialize();
    const originalWallet = useWalletStore.getState().serialize();
    const originalShop = useShopStore.getState().serialize();
    const originalRelations = useFriendshipStore.getState().serialize();
    const originalQuests = useQuestStore.getState().serialize();
    const originalMail = useMailStore.getState().serialize();
    const originalCatalog = useCatalogStore.getState().serialize();
    const originalCrafting = useCraftingStore.getState().serialize();
    const originalFarming = usePlotStore.getState().serialize();
    const originalEvents = useEventsStore.getState().serialize();
    const originalTown = useTownStore.getState().serialize();
    const originalI18n = useI18nStore.getState().serialize();
    const originalScene = useSceneStore.getState().serialize();
    const originalCharacter = useCharacterStore.getState().serialize();

    await runtime.setup();

    try {
      expect(
        Array.from(save.getBindings())
          .map((binding) => binding.key)
          .sort(),
      ).toEqual([
        'catalog',
        'character',
        'crafting',
        'events',
        'farming',
        'i18n',
        'inventory',
        'mail',
        'quests',
        'relations',
        'scene',
        'shop',
        'town',
        'wallet',
      ]);

      useSceneStore
        .getState()
        .registerScene({ id: 'test-house', name: 'Test House', interior: true });
      useSceneStore.getState().hydrate({ version: 1, current: 'test-house' });
      useCharacterStore.getState().setName('Runtime Player');
      useInventoryStore.getState().hydrate({
        version: 1,
        slots: [{ itemId: 'apple', count: 2 }, null],
        hotbar: [0],
        equippedHotbar: 0,
      });
      useWalletStore
        .getState()
        .hydrate({ version: 1, bells: 4321, lifetimeEarned: 5000, lifetimeSpent: 679 });
      useShopStore.getState().hydrate({
        version: 1,
        lastRolledDay: 12,
        dailyStock: [{ itemId: 'apple', price: 90, stock: 3 }],
      });
      useFriendshipStore.getState().hydrate({
        version: 1,
        entries: {
          npc_a: {
            npcId: 'npc_a',
            score: 42,
            todayGained: 4,
            lastGiftDay: 3,
            giftHistory: { apple: 1 },
          },
        },
      });
      useQuestStore.getState().hydrate({
        version: 1,
        state: {
          quest_a: {
            questId: 'quest_a',
            status: 'active',
            progress: { objective_a: 1 },
            startedAt: 100,
          },
        },
      });
      useMailStore.getState().hydrate({
        version: 1,
        messages: [
          {
            id: 'mail_a',
            from: 'tester',
            subject: 'Saved mail',
            body: 'hello',
            sentDay: 3,
            read: false,
            claimed: true,
          },
        ],
      });
      useCatalogStore.getState().hydrate({
        version: 1,
        entries: { apple: { itemId: 'apple', firstSeenDay: 2, totalCollected: 9 } },
      });
      useCraftingStore.getState().hydrate({ version: 1, unlocked: ['recipe_a'] });
      usePlotStore.getState().hydrate({
        version: 1,
        plots: [
          {
            id: 'plot_a',
            position: [1, 0, 2],
            state: 'mature',
            cropId: 'turnip',
            stageIndex: 2,
            plantedAt: 40,
            lastWateredAt: 80,
          },
        ],
      });
      useEventsStore.getState().hydrate({
        version: 1,
        active: ['event_a'],
        startedAt: { event_a: 1440 },
      });
      useTownStore.getState().hydrate({
        version: 1,
        houses: [
          {
            id: 'house_a',
            position: [0, 0, 0],
            size: [4, 4],
            state: 'occupied',
            residentId: 'resident_a',
          },
        ],
        residents: [{ id: 'resident_a', name: 'Resident A', movedInDay: 2 }],
      });
      useI18nStore.getState().hydrate({ version: 1, locale: 'en' });

      await runtime.save.save('progress-slot');

      useSceneStore.getState().hydrate({ version: 1, current: 'outdoor' });
      useCharacterStore.getState().resetAppearance();
      useInventoryStore
        .getState()
        .hydrate({ version: 1, slots: [], hotbar: [], equippedHotbar: 0 });
      useWalletStore
        .getState()
        .hydrate({ version: 1, bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
      useShopStore.getState().hydrate({ version: 1, lastRolledDay: -1, dailyStock: [] });
      useFriendshipStore.getState().hydrate({ version: 1, entries: {} });
      useQuestStore.getState().hydrate({ version: 1, state: {} });
      useMailStore.getState().hydrate({ version: 1, messages: [] });
      useCatalogStore.getState().hydrate({ version: 1, entries: {} });
      useCraftingStore.getState().hydrate({ version: 1, unlocked: [] });
      usePlotStore.getState().hydrate({ version: 1, plots: [] });
      useEventsStore.getState().hydrate({ version: 1, active: [], startedAt: {} });
      useTownStore.getState().hydrate({ version: 1, houses: [], residents: [] });
      useI18nStore.getState().hydrate({ version: 1, locale: 'ko' });

      await runtime.save.load('progress-slot');

      expect(useSceneStore.getState().current).toBe('test-house');
      expect(useCharacterStore.getState().appearance.name).toBe('Runtime Player');
      expect(useInventoryStore.getState().slots[0]).toEqual({ itemId: 'apple', count: 2 });
      expect(useWalletStore.getState().bells).toBe(4321);
      expect(useShopStore.getState().dailyStock).toEqual([
        { itemId: 'apple', price: 90, stock: 3 },
      ]);
      expect(useFriendshipStore.getState().entries['npc_a']?.score).toBe(42);
      expect(useQuestStore.getState().state['quest_a']?.progress).toEqual({ objective_a: 1 });
      expect(useMailStore.getState().messages[0]?.id).toBe('mail_a');
      expect(useCatalogStore.getState().entries['apple']?.totalCollected).toBe(9);
      expect(useCraftingStore.getState().unlocked.has('recipe_a')).toBe(true);
      expect(usePlotStore.getState().plots['plot_a']?.state).toBe('mature');
      expect(useEventsStore.getState().active).toEqual(['event_a']);
      expect(useTownStore.getState().residents['resident_a']?.name).toBe('Resident A');
      expect(useI18nStore.getState().locale).toBe('en');
    } finally {
      useInventoryStore.getState().hydrate(originalInventory);
      useWalletStore.getState().hydrate(originalWallet);
      useShopStore.getState().hydrate(originalShop);
      useFriendshipStore.getState().hydrate(originalRelations);
      useQuestStore.getState().hydrate(originalQuests);
      useMailStore.getState().hydrate(originalMail);
      useCatalogStore.getState().hydrate(originalCatalog);
      useCraftingStore.getState().hydrate(originalCrafting);
      usePlotStore.getState().hydrate(originalFarming);
      useEventsStore.getState().hydrate(originalEvents);
      useTownStore.getState().hydrate(originalTown);
      useI18nStore.getState().hydrate(originalI18n);
      useSceneStore.getState().hydrate(originalScene);
      useCharacterStore.getState().hydrate(originalCharacter);
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
    const markerPlugin = (id: string, runtime: GaesupPlugin['runtime']): GaesupPlugin => ({
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
