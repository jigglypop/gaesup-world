import * as THREE from 'three';

import { createGaesupRuntime, shouldSetupPluginForRuntime } from '../createGaesupRuntime';
import {
  DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  type RuntimeSaveDiagnostic,
  type RuntimeSaveDiagnosticsService,
} from '../saveDiagnostics';
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
import {
  createNPCPlugin,
  hydrateNPCState,
  serializeNPCState,
} from '../../npc/plugin';
import { useNPCStore } from '../../npc/stores/npcStore';
import { createQuestsPlugin } from '../../quests/plugin';
import { useQuestStore } from '../../quests/stores/questStore';
import { createRelationsPlugin } from '../../relations/plugin';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';
import { SaveSystem } from '../../save';
import { createScenePlugin } from '../../scene/plugin';
import { useSceneStore } from '../../scene/stores/sceneStore';
import type { SaveAdapter, SaveBlob } from '../../save';
import { useGaesupStore } from '../../stores/gaesupStore';
import { createTimePlugin } from '../../time/plugin';
import { useTimeStore } from '../../time/stores/timeStore';
import { createTownPlugin } from '../../town/plugin';
import { useTownStore } from '../../town/stores/townStore';
import { createWeatherPlugin } from '../../weather/plugin';
import { useWeatherStore } from '../../weather/stores/weatherStore';
import type { GaesupPlugin } from '../../plugins';

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

const createSavePlugin = (serialize: () => object, hydrate: (data: unknown) => void): GaesupPlugin => ({
  id: 'test.save-plugin',
  name: 'Test Save Plugin',
  version: '1.0.0',
  setup(ctx) {
    ctx.save.register('plugin-domain', {
      key: 'plugin-domain',
      serialize,
      hydrate,
    }, 'test.save-plugin');
  },
});

describe('createGaesupRuntime', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetMode();
    useGaesupStore.getState().setCameraOption({
      fov: 75,
      zoom: 1,
      position: new THREE.Vector3(-15, 8, -15),
      target: new THREE.Vector3(0, 0, 0),
    });
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
    expect(Array.from(runtime.save.getBindings()).map((binding) => binding.key)).toEqual(['plugin-domain']);
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
    expect(Array.from(save.getBindings()).map((binding) => binding.key).sort()).toEqual([
      'option-domain',
      'plugin-domain',
    ]);

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
    expect(state.cameraOption).toEqual(expect.objectContaining({
      fov: 48,
      zoom: 1.4,
      position: expect.objectContaining({ x: 2, y: 4, z: 6 }),
      target: expect.objectContaining({ x: 8, y: 10, z: 12 }),
    }));

    await runtime.dispose();
  });

  it('round-trips building, camera, and npc domains through runtime save bindings', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [
        createBuildingPlugin(),
        createCameraPlugin(),
        createNPCPlugin(),
      ],
    });
    const originalBuilding = useBuildingStore.getState().serialize();
    const originalNPC = serializeNPCState();

    await runtime.setup();

    useBuildingStore.getState().hydrate({
      version: 1,
      meshes: [],
      wallGroups: [],
      tileGroups: [],
      blocks: [{
        id: 'block-runtime-roundtrip',
        position: { x: 2, y: 0, z: 4 },
        cell: { x: 2, z: 4 },
      }],
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
    hydrateNPCState([{
      id: 'npc-runtime-roundtrip',
      templateId: 'ally',
      name: 'Runtime NPC',
      position: [1, 0, 1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      brain: { mode: 'scripted' },
      behavior: { mode: 'idle', speed: 2.2 },
    }]);

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
    expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
      fov: 55,
      zoom: 1.25,
      position: expect.objectContaining({ x: 3, y: 5, z: 7 }),
      target: expect.objectContaining({ x: 1, y: 0, z: 2 }),
    }));
    expect(useNPCStore.getState().instances.get('npc-runtime-roundtrip')).toEqual(expect.objectContaining({
      name: 'Runtime NPC',
      brain: { mode: 'scripted' },
    }));

    useBuildingStore.getState().hydrate(originalBuilding);
    hydrateNPCState(originalNPC);
    await runtime.dispose();
  });

  it('round-trips time, weather, and audio domains through runtime save bindings', async () => {
    const save = new SaveSystem({ adapter: new MemoryAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem: save,
      plugins: [
        createTimePlugin(),
        createWeatherPlugin(),
        createAudioPlugin(),
      ],
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

    expect(useTimeStore.getState().serialize()).toEqual(expect.objectContaining({
      totalMinutes: 1450,
      mode: 'scaled',
      scale: 2.5,
    }));
    expect(useWeatherStore.getState().serialize()).toEqual(expect.objectContaining({
      current: { day: 3, kind: 'rain', intensity: 0.8 },
    }));
    expect(useAudioStore.getState().serialize()).toEqual(expect.objectContaining({
      masterMuted: true,
      bgmMuted: false,
      sfxMuted: true,
      masterVolume: 0.3,
      bgmVolume: 0.2,
      sfxVolume: 0.1,
    }));

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
      expect(Array.from(save.getBindings()).map((binding) => binding.key).sort()).toEqual([
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

      useSceneStore.getState().registerScene({ id: 'test-house', name: 'Test House', interior: true });
      useSceneStore.getState().hydrate({ version: 1, current: 'test-house' });
      useCharacterStore.getState().setName('Runtime Player');
      useInventoryStore.getState().hydrate({
        version: 1,
        slots: [{ itemId: 'apple', count: 2 }, null],
        hotbar: [0],
        equippedHotbar: 0,
      });
      useWalletStore.getState().hydrate({ version: 1, bells: 4321, lifetimeEarned: 5000, lifetimeSpent: 679 });
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
        messages: [{
          id: 'mail_a',
          from: 'tester',
          subject: 'Saved mail',
          body: 'hello',
          sentDay: 3,
          read: false,
          claimed: true,
        }],
      });
      useCatalogStore.getState().hydrate({
        version: 1,
        entries: { apple: { itemId: 'apple', firstSeenDay: 2, totalCollected: 9 } },
      });
      useCraftingStore.getState().hydrate({ version: 1, unlocked: ['recipe_a'] });
      usePlotStore.getState().hydrate({
        version: 1,
        plots: [{
          id: 'plot_a',
          position: [1, 0, 2],
          state: 'mature',
          cropId: 'turnip',
          stageIndex: 2,
          plantedAt: 40,
          lastWateredAt: 80,
        }],
      });
      useEventsStore.getState().hydrate({
        version: 1,
        active: ['event_a'],
        startedAt: { event_a: 1440 },
      });
      useTownStore.getState().hydrate({
        version: 1,
        houses: [{
          id: 'house_a',
          position: [0, 0, 0],
          size: [4, 4],
          state: 'occupied',
          residentId: 'resident_a',
        }],
        residents: [{ id: 'resident_a', name: 'Resident A', movedInDay: 2 }],
      });
      useI18nStore.getState().hydrate({ version: 1, locale: 'en' });

      await runtime.save.save('progress-slot');

      useSceneStore.getState().hydrate({ version: 1, current: 'outdoor' });
      useCharacterStore.getState().resetAppearance();
      useInventoryStore.getState().hydrate({ version: 1, slots: [], hotbar: [], equippedHotbar: 0 });
      useWalletStore.getState().hydrate({ version: 1, bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
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
      expect(useShopStore.getState().dailyStock).toEqual([{ itemId: 'apple', price: 90, stock: 3 }]);
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

    await runtime.save.save('diagnostic-slot');

    expect(warnings).toEqual([
      expect.objectContaining({
        phase: 'serialize',
        key: 'broken-domain',
        slot: 'diagnostic-slot',
      }),
    ]);
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

    await runtime.save.save('provided-diagnostic-slot');

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

    await runtime.save.save('provided-diagnostic-slot');
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
    expect(() => runtime.requireService('missing.service')).toThrow('Extension "missing.service" is not registered.');

    await runtime.dispose();
  });

  it('filters plugin setup by runtime target', async () => {
    const calls: string[] = [];
    const markerPlugin = (
      id: string,
      runtime: GaesupPlugin['runtime'],
    ): GaesupPlugin => ({
      id,
      name: id,
      version: '1.0.0',
      runtime,
      setup: () => { calls.push(id); },
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
