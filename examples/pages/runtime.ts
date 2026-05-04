import {
  createGaesupRuntime,
  getNPCScheduler,
  getSaveSystem,
  registerSeedCrops,
  registerSeedEvents,
  registerSeedItems,
  useAudioStore,
  useCatalogStore,
  useCharacterStore,
  useCraftingStore,
  useEventsStore,
  useFriendshipStore,
  useI18nStore,
  useInventoryStore,
  useMailStore,
  usePlotStore,
  useQuestStore,
  useSceneStore,
  useTimeStore,
  useTownStore,
  useWeatherStore,
  type GaesupRuntime,
  type RuntimeDomainBinding,
} from '../../src';
import {
  GameplayEventEngine,
  SEED_GAMEPLAY_EVENTS,
  type GameplayEventBlueprint,
  type GameplayTriggerEvent,
} from '../../src/core/gameplay';
import { registerSeedDialogs } from '../components/dialog/seedDialogs';
import { registerSeedI18n } from '../components/i18n/seedI18n';
import { registerSeedContent } from '../components/seedContent';
import { NPC_SCHEDULES } from './world/data';

const DEFAULT_WORLD_TIME_MINUTES = 18 * 60;

let seedsRegistered = false;
let gameplayEngine: GameplayEventEngine | null = null;
const gameplayBlueprints: GameplayEventBlueprint[] = [...SEED_GAMEPLAY_EVENTS];

function registerWorldSeeds(): void {
  if (seedsRegistered) return;
  seedsRegistered = true;

  registerSeedItems();
  registerSeedDialogs();
  registerSeedContent();
  registerSeedCrops();
  registerSeedEvents();
  registerSeedI18n();

  const scheduler = getNPCScheduler();
  NPC_SCHEDULES.forEach((schedule) => scheduler.register(schedule));
}

const createStoreBinding = (
  key: string,
  store: { getState: () => { serialize: () => RuntimeDomainBinding['serialize'] extends () => infer T ? T : never; hydrate: (data: never) => void } },
): RuntimeDomainBinding => ({
  key,
  serialize: () => store.getState().serialize(),
  hydrate: (data) => store.getState().hydrate(data as never),
});

export function createWorldRuntime(): GaesupRuntime {
  registerWorldSeeds();

  return createGaesupRuntime({
    saveSystem: getSaveSystem(),
    saveBindings: [
      createStoreBinding('time', useTimeStore),
      createStoreBinding('inventory', useInventoryStore),
      createStoreBinding('relations', useFriendshipStore),
      createStoreBinding('quests', useQuestStore),
      createStoreBinding('mail', useMailStore),
      createStoreBinding('catalog', useCatalogStore),
      createStoreBinding('crafting', useCraftingStore),
      createStoreBinding('farming', usePlotStore),
      createStoreBinding('weather', useWeatherStore),
      createStoreBinding('events', useEventsStore),
      createStoreBinding('town', useTownStore),
      createStoreBinding('audio', useAudioStore),
      createStoreBinding('character', useCharacterStore),
      createStoreBinding('i18n', useI18nStore),
      createStoreBinding('scene', useSceneStore),
    ],
  });
}

export function getWorldGameplayEngine(): GameplayEventEngine {
  if (!gameplayEngine) {
    gameplayEngine = new GameplayEventEngine({ blueprints: gameplayBlueprints });
  }
  return gameplayEngine;
}

export function getWorldGameplayBlueprints(): GameplayEventBlueprint[] {
  return [...gameplayBlueprints];
}

export function registerWorldGameplayEventBlueprint(blueprint: GameplayEventBlueprint): void {
  const index = gameplayBlueprints.findIndex((item) => item.id === blueprint.id);
  if (index === -1) {
    gameplayBlueprints.push(blueprint);
  } else {
    gameplayBlueprints[index] = blueprint;
  }
  getWorldGameplayEngine().setBlueprints(gameplayBlueprints);
}

export function deleteWorldGameplayEventBlueprint(id: string): void {
  const index = gameplayBlueprints.findIndex((item) => item.id === id);
  if (index === -1) return;
  gameplayBlueprints.splice(index, 1);
  getWorldGameplayEngine().setBlueprints(gameplayBlueprints);
}

export async function dispatchWorldGameplayEvent(trigger: GameplayTriggerEvent): Promise<void> {
  await getWorldGameplayEngine().dispatch(trigger);
}

export async function loadWorldRuntime(runtime: GaesupRuntime): Promise<boolean> {
  await runtime.setup();
  const loaded = await runtime.save.load();
  applyStarterState();
  await dispatchWorldGameplayEvent({ type: 'manual', key: 'world.ready' });
  return loaded;
}

function applyStarterState(): void {
  useTimeStore.getState().setTotalMinutes(DEFAULT_WORLD_TIME_MINUTES);
  useWeatherStore.setState((state) => ({
    ...state,
    current: null,
  }));

  const inv = useInventoryStore.getState();
  if (!inv.has('axe')) inv.add('axe', 1);
  if (!inv.has('shovel')) inv.add('shovel', 1);
  if (!inv.has('water-can')) inv.add('water-can', 1);
  if (!inv.has('seed-turnip')) inv.add('seed-turnip', 5);

  const timeState = useTimeStore.getState();
  const today = Math.floor(timeState.totalMinutes / (60 * 24));
  useEventsStore.getState().refresh(timeState.time);

  const town = useTownStore.getState();
  if (Object.keys(town.residents).length === 0) {
    town.registerResident({ id: 'r-mei', name: '메이', bodyColor: '#ffe4c8', hatColor: '#5a8acf' });
    town.registerResident({ id: 'r-tommy', name: '토미', bodyColor: '#f5d199', hatColor: '#a85a5a' });
    town.registerResident({ id: 'r-ryu', name: '류', bodyColor: '#ffd0b8', hatColor: '#3a8a3a' });
  }

  const futureDay = today + 3;
  const houseList = Object.values(town.houses);
  if (houseList[0] && houseList[0].state === 'empty') town.moveIn(houseList[0].id, 'r-mei', today);
  if (houseList[1] && houseList[1].state === 'empty') town.reserveHouse(houseList[1].id, 'r-tommy', futureDay);
  if (houseList[2] && houseList[2].state === 'empty') town.reserveHouse(houseList[2].id, 'r-ryu', futureDay + 2);

  if (useMailStore.getState().messages.length === 0) {
    useMailStore.getState().send({
      from: '운영팀',
      subject: '환영합니다',
      body: '도끼 [F], 인벤토리 [I], 퀘스트 [J], 우편 [M], 도감 [K], 제작 [C].\n\n농장에서 [삽]으로 땅을 갈고 [씨앗]을 핫바에 장착해 [삽]을 사용해 심으세요. [물뿌리개]로 매일 물을 주세요.\n\n첫 시작용 자금을 보내드려요.',
      sentDay: today,
      attachments: [{ bells: 500 }],
    });
  }
}
