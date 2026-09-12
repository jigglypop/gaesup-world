import {
  createAudioPlugin,
  createBuildingPlugin,
  createCameraPlugin,
  createCharacterPlugin,
  createGaesupRuntime,
  createI18nPlugin,
  createMotionsPlugin,
  createNPCPlugin,
  createScenePlugin,
  createTimePlugin,
  createWeatherPlugin,
  IndexedDBAdapter,
  LocalStorageAdapter,
  SaveSystem,
  notify,
  useAssetStore,
  useBuildingStore,
  useTimeStore,
  useWeatherStore,
  type GaesupRuntime,
} from 'gaesup-world';
import {
  GameplayEventEngine,
  getGameplayEventRegistry,
  type GameplayEventAction,
  type GameplayEventBlueprint,
  type GameplayEventCondition,
  type GameplayTriggerEvent,
} from 'gaesup-world/gameplay';
import type {
  CommandAuthorityResult,
  PlatformServerPluginHost,
} from 'gaesup-world/server-contracts';

import { createExampleServerHost, runExampleServerHostPing } from '../plugins/server-host-sample';
import { WORLD_REFERENCE_ASSETS } from './world/assets';
import {
  createWorldSceneDocumentPlugin,
  getWorldSceneDocumentSession,
  type WorldSceneDocumentSession,
} from './world/sceneDocument';

const DEFAULT_WORLD_TIME_MINUTES = 18 * 60;

let worldSaveSystem: SaveSystem | null = null;
let gameplayEngine: GameplayEventEngine | null = null;
let gameplayCustomHandlersRegistered = false;
let serverHost: PlatformServerPluginHost | null = null;
let serverHostReady = false;
let serverHostDemoResult: CommandAuthorityResult | null = null;
const WORLD_INITIAL_LOAD_TASKS = new WeakMap<SaveSystem, Promise<boolean>>();
export const WORLD_CUSTOM_GAMEPLAY_KEY = 'world.demo';

export type CreateWorldRuntimeOptions = {
  saveSystem?: SaveSystem;
  sceneDocumentSession?: WorldSceneDocumentSession;
};

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
  registry.registerAction<Extract<GameplayEventAction, { type: 'custom' }>>('custom', (action) => {
    notify('info', `커스텀 이벤트 실행: ${action.key}`);
  });
}

function getWorldSaveSystem(): SaveSystem {
  if (worldSaveSystem) return worldSaveSystem;
  const adapter = typeof indexedDB === 'undefined' ? new LocalStorageAdapter() : new IndexedDBAdapter();
  worldSaveSystem = new SaveSystem({
    defaultSlot: 'social-world-v1',
    adapter: {
      // Carry over the old room/character once, without overwriting its economy save.
      read: async (slot) => (await adapter.read(slot)) ?? (slot === 'social-world-v1' ? adapter.read('main') : null),
      write: (slot, blob) => adapter.write(slot, blob),
      list: () => adapter.list(),
      remove: (slot) => adapter.remove(slot),
    },
  });
  return worldSaveSystem;
}

export function createWorldRuntime(options: CreateWorldRuntimeOptions = {}): GaesupRuntime {
  for (const asset of WORLD_REFERENCE_ASSETS) {
    if (!useAssetStore.getState().records[asset.id]) useAssetStore.getState().registerAssets([asset]);
  }
  const sceneDocumentSession = options.sceneDocumentSession ?? getWorldSceneDocumentSession();

  return createGaesupRuntime({
    saveSystem: options.saveSystem ?? getWorldSaveSystem(),
    plugins: [
      createWorldSceneDocumentPlugin(sceneDocumentSession),
      createBuildingPlugin(),
      createCameraPlugin(),
      createMotionsPlugin(),
      createNPCPlugin(),
      createScenePlugin(),
      createCharacterPlugin(),
      createTimePlugin(),
      createWeatherPlugin(),
      createAudioPlugin(),
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

export async function runWorldServerHostDemo(
  actorId = 'example-player',
): Promise<CommandAuthorityResult> {
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

export async function loadWorldRuntime(runtime: GaesupRuntime, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) return false;
  await runtime.setup();
  if (signal?.aborted) return false;
  const loaded = await loadInitialWorldSave(runtime.save, signal);
  if (signal?.aborted) return false;
  return loaded;
}

function loadInitialWorldSave(saveSystem: SaveSystem, signal?: AbortSignal): Promise<boolean> {
  const existing = WORLD_INITIAL_LOAD_TASKS.get(saveSystem);
  if (existing) return existing;

  const tracked = saveSystem.load(undefined, signal).then((loaded) => {
    if (signal?.aborted) {
      if (WORLD_INITIAL_LOAD_TASKS.get(saveSystem) === tracked) WORLD_INITIAL_LOAD_TASKS.delete(saveSystem);
      return false;
    }
    if (!loaded) applyStarterState();
    return loaded;
  }).catch((error: unknown) => {
    if (WORLD_INITIAL_LOAD_TASKS.get(saveSystem) === tracked) {
      WORLD_INITIAL_LOAD_TASKS.delete(saveSystem);
    }
    throw error;
  });
  WORLD_INITIAL_LOAD_TASKS.set(saveSystem, tracked);
  return tracked;
}

function applyStarterState(): void {
  initializeWorldGarden();
  useTimeStore.getState().setTotalMinutes(DEFAULT_WORLD_TIME_MINUTES);
  useWeatherStore.setState((state) => ({
    ...state,
    current: null,
  }));

}

function initializeWorldGarden(): void {
  const building = useBuildingStore.getState();
  building.initializeDefaults();
  const initialized = useBuildingStore.getState();
  // Fresh worlds only. Saved layouts are loaded before this branch and never reset.
  const tiles = [...initialized.tileGroups.values()].flatMap((group) => group.tiles);
  if (tiles.some((tile) => !tile.id.startsWith('demo-')) || initialized.objects.some((object) => !object.id.startsWith('demo-'))) return;
  for (const group of initialized.tileGroups.values()) {
    for (const tile of group.tiles) initialized.removeTile(group.id, tile.id);
  }
  for (const object of initialized.objects) initialized.removeObject(object.id);
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if (Math.abs(x) === 2 && Math.abs(z) === 2) continue;
      initialized.addTile('sand-floor', {
        id: `garden-${x + 2}-${z + 2}`, tileGroupId: 'sand-floor',
        position: { x: x * 2, y: 0, z: z * 2 }, size: 1, shape: 'box',
      });
    }
  }
}
