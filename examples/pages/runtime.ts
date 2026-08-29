import {
  createAudioPlugin,
  createBuildingPlugin,
  createCameraPlugin,
  createCatalogPlugin,
  createCharacterPlugin,
  createCraftingPlugin,
  createEventsPlugin,
  createFarmingPlugin,
  createGaesupRuntime,
  createI18nPlugin,
  createInventoryPlugin,
  createMailPlugin,
  createMotionsPlugin,
  createNPCPlugin,
  createQuestsPlugin,
  createRelationsPlugin,
  createScenePlugin,
  createTimePlugin,
  createTownPlugin,
  createWeatherPlugin,
  getNPCScheduler,
  getSaveSystem,
  notify,
  useEventsStore,
  useInventoryStore,
  useMailStore,
  useTimeStore,
  useTownStore,
  useWeatherStore,
  type GaesupRuntime,
} from 'gaesup-world';
import {
  GameplayEventEngine,
  getGameplayEventRegistry,
  SEED_GAMEPLAY_EVENTS,
  type GameplayEventAction,
  type GameplayEventBlueprint,
  type GameplayEventCondition,
  type GameplayTriggerEvent,
} from 'gaesup-world/gameplay';
import type { CommandAuthorityResult, PlatformServerPluginHost } from 'gaesup-world/server-contracts';

import { createExampleCozyLifePackagePlugin } from '../plugins/cozy-life-package';
import { createExampleServerHost, runExampleServerHostPing } from '../plugins/server-host-sample';
import { NPC_SCHEDULES } from './world/data';

const DEFAULT_WORLD_TIME_MINUTES = 18 * 60;

let seedsRegistered = false;
let gameplayEngine: GameplayEventEngine | null = null;
let gameplayCustomHandlersRegistered = false;
let serverHost: PlatformServerPluginHost | null = null;
let serverHostReady = false;
let serverHostDemoResult: CommandAuthorityResult | null = null;
export const WORLD_CUSTOM_GAMEPLAY_KEY = 'world.demo';

const WORLD_CUSTOM_GAMEPLAY_BLUEPRINT: GameplayEventBlueprint = {
  id: 'example-custom-gameplay-event',
  name: '커스텀 이벤트 예시',
  description: '커스텀 조건/액션 레지스트리 등록 데모',
  trigger: { type: 'custom', key: WORLD_CUSTOM_GAMEPLAY_KEY },
  conditions: [{ type: 'custom', key: WORLD_CUSTOM_GAMEPLAY_KEY }],
  actions: [{ type: 'custom', key: WORLD_CUSTOM_GAMEPLAY_KEY }],
  policy: { run: 'repeat' },
};

const gameplayBlueprints: GameplayEventBlueprint[] = [
  ...SEED_GAMEPLAY_EVENTS,
  WORLD_CUSTOM_GAMEPLAY_BLUEPRINT,
];

function registerWorldGameplayCustomHandlers(): void {
  if (gameplayCustomHandlersRegistered) return;
  gameplayCustomHandlersRegistered = true;
  const registry = getGameplayEventRegistry();
  registry.registerCondition<Extract<GameplayEventCondition, { type: 'custom' }>>(
    'custom',
    (condition, context) => condition.key === (context.trigger.key ?? WORLD_CUSTOM_GAMEPLAY_KEY),
  );
  registry.registerAction<Extract<GameplayEventAction, { type: 'custom' }>>(
    'custom',
    (action) => {
      notify('info', `커스텀 이벤트 실행: ${action.key}`);
    },
  );
}

function registerWorldSeeds(): void {
  if (seedsRegistered) return;
  seedsRegistered = true;

  const scheduler = getNPCScheduler();
  NPC_SCHEDULES.forEach((schedule) => scheduler.register(schedule));
}

export function createWorldRuntime(): GaesupRuntime {
  registerWorldSeeds();

  return createGaesupRuntime({
    saveSystem: getSaveSystem(),
    plugins: [
      createBuildingPlugin(),
      createCameraPlugin(),
      createMotionsPlugin(),
      createNPCPlugin(),
      createScenePlugin(),
      createCharacterPlugin(),
      createTimePlugin(),
      createWeatherPlugin(),
      createAudioPlugin(),
      createInventoryPlugin(),
      createRelationsPlugin(),
      createQuestsPlugin(),
      createMailPlugin(),
      createCatalogPlugin(),
      createExampleCozyLifePackagePlugin(),
      createCraftingPlugin(),
      createFarmingPlugin(),
      createEventsPlugin(),
      createTownPlugin(),
      createI18nPlugin(),
    ],
  });
}

export function getWorldGameplayEngine(): GameplayEventEngine {
  if (!gameplayEngine) {
    registerWorldGameplayCustomHandlers();
    gameplayEngine = new GameplayEventEngine({ blueprints: gameplayBlueprints });
  }
  return gameplayEngine;
}

export function getWorldServerHost(): PlatformServerPluginHost {
  if (!serverHost) {
    serverHost = createExampleServerHost();
  }
  return serverHost;
}

export async function runWorldServerHostDemo(actorId = 'example-player'): Promise<CommandAuthorityResult> {
  const host = getWorldServerHost();
  if (!serverHostReady) {
    serverHostReady = true;
    await host.setup();
  }
  serverHostDemoResult = await runExampleServerHostPing(host, actorId);
  return serverHostDemoResult;
}

export function getWorldServerHostDemoResult(): CommandAuthorityResult | null {
  return serverHostDemoResult;
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
  await runWorldServerHostDemo();
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
