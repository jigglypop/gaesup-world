import { SaveSystem, useTimeStore, useInventoryStore, useCraftingStore, useQuestStore, usePlotStore, getCropRegistry, SEED_CROPS, getItemRegistry, getRecipeRegistry, getQuestRegistry, type SaveBlob } from 'gaesup-world';
import { PICKUPS } from '../world/data';
import { SEED_RECIPES, SEED_QUESTS, WORLD_ITEMS } from '../../components/seedContent';

import { createWorldRuntime, getWorldGameplayBlueprints, getWorldGameplayEngine, loadWorldRuntime } from '../runtime';

describe('examples world runtime', () => {
  test('world content registers crops and supports planting, growth and harvest', () => {
    const registry = getCropRegistry();
    const previousCrops = registry.all();
    const inventory = useInventoryStore.getState().serialize();
    const farming = usePlotStore.getState().serialize();
    registry.clear();
    try {
      createWorldRuntime();
      for (const crop of SEED_CROPS) {
        expect(registry.get(crop.id)).toBeDefined();
        expect(getItemRegistry().require(crop.seedItemId).toolKind).toBe('seed');
        expect(getItemRegistry().require(crop.yieldItemId).name).toMatch(/[가-힣]/);
      }
      const crop = registry.bySeedItemId('seed-turnip')!;
      useInventoryStore.getState().clear();
      useInventoryStore.getState().add('seed-turnip', 1);
      usePlotStore.setState({ plots: {} });
      usePlotStore.getState().registerPlot({ id: 'example-farm', position: [0, 0, 0] });
      expect(usePlotStore.getState().till('example-farm')).toBe(true);
      expect(usePlotStore.getState().plant('example-farm', crop.id, 0)).toBe(true);
      expect(useInventoryStore.getState().countOf('seed-turnip')).toBe(0);
      const growMinutes = crop.stages.reduce((sum, stage) => sum + stage.durationMinutes, 0);
      for (let minute = 60; minute <= growMinutes; minute += 60) {
        usePlotStore.getState().water('example-farm', minute);
        usePlotStore.getState().tick(minute);
      }
      expect(usePlotStore.getState().plots['example-farm']?.state).toBe('mature');
      expect(usePlotStore.getState().harvest('example-farm')).toBe(true);
      expect(useInventoryStore.getState().countOf('turnip')).toBe(crop.yieldCount);
    } finally {
      registry.clear();
      registry.registerAll(previousCrops);
      useInventoryStore.getState().hydrate(inventory);
      usePlotStore.getState().hydrate(farming);
    }
  });

  test('the introductory wood quest remains ready to complete after delivery and reload', () => {
    createWorldRuntime();
    const inventory = useInventoryStore.getState().serialize();
    const quests = useQuestStore.getState().serialize();
    try {
      useInventoryStore.getState().clear();
      useQuestStore.setState({ state: {} });
      useQuestStore.getState().start('q.intro.gather-wood');
      useInventoryStore.getState().add('wood', 5);
      expect(useQuestStore.getState().notifyDeliver('mei', 'wood', 5)).toBe(true);
      expect(useInventoryStore.getState().countOf('wood')).toBe(0);
      const saved = useQuestStore.getState().serialize();
      useQuestStore.setState({ state: {} });
      useQuestStore.getState().hydrate(saved);
      expect(useQuestStore.getState().isAllObjectivesComplete('q.intro.gather-wood')).toBe(true);
    } finally {
      useInventoryStore.getState().hydrate(inventory);
      useQuestStore.getState().hydrate(quests);
    }
  });
  test('the basic chair recipe consumes wood and awards the named furniture', () => {
    createWorldRuntime();
    const initial = useInventoryStore.getState().serialize();
    try {
      useInventoryStore.getState().clear();
      useInventoryStore.getState().add('wood', 4);
      expect(useCraftingStore.getState().craft('r.workbench.basic')).toEqual({ ok: true });
      expect(useInventoryStore.getState().countOf('wood')).toBe(0);
      expect(useInventoryStore.getState().countOf('chair-basic')).toBe(1);
      expect(useInventoryStore.getState().countOf('flower-pink')).toBe(0);
      expect(getItemRegistry().require('chair-basic')).toMatchObject({ name: '소박한 의자', category: 'furniture' });
    } finally {
      useInventoryStore.getState().hydrate(initial);
    }
  });
  test('registers definitions for starter inventory, pickups, recipes and quest items', () => {
    createWorldRuntime();
    const requiredIds = new Set([
      'axe', 'shovel', 'water-can', 'seed-turnip',
      ...PICKUPS.map((pickup) => pickup.itemId),
      ...SEED_RECIPES.flatMap((recipe) => [recipe.output.itemId, ...recipe.ingredients.map((item) => item.itemId)]),
      ...SEED_QUESTS.flatMap((quest) => quest.objectives.flatMap((objective) => 'itemId' in objective ? [objective.itemId] : [])),
    ]);
    for (const id of requiredIds) expect(getItemRegistry().get(id)).toBeDefined();
    for (const item of WORLD_ITEMS) expect(item.name).toMatch(/[가-힣]/);
    for (const recipe of SEED_RECIPES) expect(getRecipeRegistry().get(recipe.id)).toBeDefined();
    for (const quest of SEED_QUESTS) expect(getQuestRegistry().get(quest.id)).toBeDefined();
    const existing = getItemRegistry().require('axe');
    createWorldRuntime();
    expect(getItemRegistry().require('axe')).toBe(existing);
  });
  test.each([true, false])('cancels pending hydration and starter state, then retries on reentry (saved: %s)', async (saved) => {
    const initialTime = useTimeStore.getState().serialize();
    const blob: SaveBlob = { version: 1, savedAt: 0, domains: { time: { ...initialTime, totalMinutes: 2000 } } };
    let completeRead!: (value: SaveBlob | null) => void;
    let markReadStarted!: () => void;
    const readStarted = new Promise<void>((resolve) => { markReadStarted = resolve; });
    const pendingRead = new Promise<SaveBlob | null>((resolve) => { completeRead = resolve; });
    const read = jest.fn(async () => saved ? blob : null).mockImplementationOnce(() => {
      markReadStarted();
      return pendingRead;
    });
    const saveSystem = new SaveSystem({ adapter: {
      read, write: async () => undefined, list: async () => [], remove: async () => undefined,
    } });
    const runtime = createWorldRuntime({ saveSystem });
    const controller = new AbortController();
    const dispatch = jest.spyOn(getWorldGameplayEngine(), 'dispatch');
    try {
      const loading = loadWorldRuntime(runtime, controller.signal);
      await readStarted;
      controller.abort();
      useTimeStore.getState().setTotalMinutes(3000);
      completeRead(saved ? blob : null);
      expect(await loading).toBe(false);
      expect(useTimeStore.getState().totalMinutes).toBe(3000);
      expect(dispatch).not.toHaveBeenCalled();
      await runtime.dispose();
      expect(await loadWorldRuntime(runtime)).toBe(saved);
      expect(read).toHaveBeenCalledTimes(2);
      expect(useTimeStore.getState().totalMinutes).toBe(saved ? 2000 : 18 * 60);
    } finally {
      completeRead(null);
      await runtime.dispose();
      dispatch.mockRestore();
      useTimeStore.getState().hydrate(initialTime);
    }
  });

  test.each([true, false])('preserves progress across reentry (saved: %s)', async (saved) => {
    const initialTime = useTimeStore.getState().serialize();
    const savedMinutes = 12 * 24 * 60;
    const blob: SaveBlob = {
      version: 1,
      savedAt: 0,
      domains: { time: { ...initialTime, totalMinutes: savedMinutes } },
    };
    const read = jest.fn(async () => saved ? blob : null);
    const saveSystem = new SaveSystem({
      adapter: {
        read,
        write: async () => undefined,
        list: async () => [],
        remove: async () => undefined,
      },
    });
    const runtime = createWorldRuntime({ saveSystem });

    try {
      expect(await loadWorldRuntime(runtime)).toBe(saved);
      expect(useTimeStore.getState().totalMinutes).toBe(saved ? savedMinutes : 18 * 60);
      const progressedMinutes = 15 * 24 * 60;
      useTimeStore.getState().setTotalMinutes(progressedMinutes);
      await runtime.dispose();
      await loadWorldRuntime(runtime);
      expect(useTimeStore.getState().totalMinutes).toBe(progressedMinutes);
      expect(read).toHaveBeenCalledTimes(1);
    } finally {
      await runtime.dispose();
      useTimeStore.getState().hydrate(initialTime);
    }
  });

  test('공개 API로 예제 런타임 플러그인 스택을 설정한다', async () => {
    const runtime = createWorldRuntime();

    try {
      await runtime.setup();
      const blob = runtime.save.createBlob('world-runtime-test');

      expect(Object.keys(blob.domains)).toEqual(
        expect.arrayContaining([
          'building',
          'camera',
          'npc',
          'scene',
          'character',
          'time',
          'weather',
          'audio',
          'inventory',
          'relations',
          'quests',
          'mail',
          'catalog',
          'crafting',
          'farming',
          'events',
          'town',
          'i18n',
          'scene-document',
        ]),
      );
      expect(getWorldGameplayBlueprints().length).toBeGreaterThan(0);
    } finally {
      await runtime.dispose();
    }
  });
});
