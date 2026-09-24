import { AnimationBridge } from '../animation/bridge/AnimationBridge';
import { useAssetStore } from '../assets';
import {
  DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  RUNTIME_SAVE_BINDING_REJECTED_EVENT,
  RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  createRuntimeSaveDiagnostics,
} from './saveDiagnostics';
import type { GaesupRuntime, GaesupRuntimeOptions, RuntimeDomainBinding } from './types';
import { createAudioEngine } from '../audio/core/AudioEngine';
import { AUDIO_STORE_SERVICE, createAudioStore } from '../audio/stores/audioStore';
import { createGrassManager } from '../building/components/mesh/grass/manager';
import { createBuildingCullingStore } from '../building/render/cullingStore';
import { createBuildingRenderStore } from '../building/render/store';
import { BUILDING_STORE_SERVICE, createBuildingStore } from '../building/stores/buildingStore';
import { createBuildingVisibilityStore } from '../building/visibility/store';
import { createCameraCinematicPlayer } from '../camera/cinematic';
import { CATALOG_STORE_SERVICE, createCatalogStore } from '../catalog/stores/catalogStore';
import { CHARACTER_STORE_SERVICE, createCharacterStore } from '../character/stores/characterStore';
import { CRAFTING_STORE_SERVICE, createCraftingStore } from '../crafting/stores/craftingStore';
import { DIALOG_STORE_SERVICE, createDialogStore } from '../dialog/stores/dialogStore';
import { createDialogRuntimeAdapter } from '../dialog/stores/runtimeAdapter';
import { SHOP_STORE_SERVICE, createShopStore } from '../economy/stores/shopStore';
import { WALLET_STORE_SERVICE, createWalletStore } from '../economy/stores/walletStore';
import { EVENTS_STORE_SERVICE, createEventsStore } from '../events/stores/eventsStore';
import { FARMING_STORE_SERVICE, createPlotStore } from '../farming/stores/plotStore';
import { createStoreGameplayEventServices } from '../gameplay/events/clientServices';
import { GameplayEventEngine } from '../gameplay/events/engine';
import { createDefaultGameplayEventRegistry } from '../gameplay/events/registry';
import { WorldGamepadInput } from '../input/WorldGamepadInput';
import { WorldInputActions } from '../input/WorldInputActions';
import { WorldInputBackend } from '../input/WorldInputBackend';
import { createWorldInputScope } from '../input/WorldInputScope';
import { DEFAULT_INTERACTION_INPUT_EXTENSION_ID, type InputBackendExtension } from '../interactions/core/adapter';
import { createInteractablesStore } from '../interactions/stores/interactablesStore';
import { INVENTORY_STORE_SERVICE, createInventoryStore } from '../inventory/stores/inventoryStore';
import { MAIL_STORE_SERVICE, createMailStore } from '../mail/stores/mailStore';
import { MotionBridge } from '../motions/bridge/MotionBridge';
import { PhysicsBridge } from '../motions/bridge/PhysicsBridge';
import { EntityStateManager } from '../motions/core/system/EntityStateManager';
import { RUNTIME_OWNED_MOTIONS_SERVICE_ID, type MotionsRuntime } from '../motions/plugin';
import { createClickNavigationRoute } from '../navigation/ClickNavigationRoute';
import { createNavigationObstacleRegistry } from '../navigation/NavigationObstacleRegistry';
import { NavigationSystem } from '../navigation/NavigationSystem';
import { NetworkBridge } from '../networks/bridge/NetworkBridge';
import { createNPCBrainAdapterRegistry } from '../npc/core/brain';
import { createNPCScheduler } from '../npc/core/NPCScheduler';
import { NPCSimulation } from '../npc/core/NPCSimulation';
import { attachReinforcementAdapter, createReinforcementAdapter } from '../npc/core/reinforcement';
import { NPC_STORE_SERVICE, createNPCStore } from '../npc/stores/npcStore';
import { createPluginLogger, createPluginRegistry, filterPluginsForRuntime } from '../plugins';
import type { ServiceKey } from '../plugins/serviceKey';
import { QUESTS_STORE_SERVICE, createQuestStore } from '../quests/stores/questStore';
import { RELATIONS_STORE_SERVICE, createFriendshipStore } from '../relations/stores/friendshipStore';
import { DuplicateSaveDomainBindingError, SaveSystem, createDefaultSaveSystem } from '../save';
import type { DomainBinding, SaveSystemOptions, SerializedDomainValue } from '../save';
import { createRoomVisibilityStore } from '../scene/stores/roomVisibilityStore';
import { SCENE_STORE_SERVICE, createSceneStore } from '../scene/stores/sceneStore';
import { createGaesupStore, RUNTIME_GAESUP_STORE_SERVICE_ID } from '../stores/gaesupStore';
import { getTimeClock, RUNTIME_TIME_STORE_SERVICE_ID } from '../time/core/timeClock';
import { createTimeStore } from '../time/stores/timeStore';
import { createToolEvents } from '../tools/core/ToolEvents';
import { TOWN_STORE_SERVICE, createTownStore } from '../town/stores/townStore';
import { createUniqueId } from '../utils/id';
import { setErrorSink } from '../utils/reportError';
import { WEATHER_STORE_SERVICE, createWeatherStore } from '../weather/stores/weatherStore';
import { WorldViews } from '../world/core/WorldViews';
import { createWorldObjectStore } from '../world/stores/worldObjectStore';

function isRuntimeDomainBinding(value: unknown): value is RuntimeDomainBinding {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DomainBinding<SerializedDomainValue>>;
  return (
    typeof candidate.key === 'string' &&
    typeof candidate.serialize === 'function' &&
    typeof candidate.hydrate === 'function'
  );
}

export function createGaesupRuntime(options: GaesupRuntimeOptions = {}): GaesupRuntime {
  const worldId = options.worldId ?? createUniqueId();
  if (!worldId.trim()) throw new TypeError('Runtime worldId must not be empty');
  const timeStore = createTimeStore();
  const inventoryStore = createInventoryStore();
  const walletStore = createWalletStore();
  const friendshipStore = createFriendshipStore();
  const weatherStore = createWeatherStore();
  const plotStore = createPlotStore(inventoryStore);
  const shopStore = createShopStore(inventoryStore, walletStore);
  const questStore = createQuestStore({ inventory: inventoryStore, wallet: walletStore, friendship: friendshipStore, time: timeStore });
  const dialogStore = createDialogStore(questStore, createDialogRuntimeAdapter({ inventory: inventoryStore, wallet: walletStore, friendship: friendshipStore, time: timeStore, quests: questStore }));
  const audioEngine = createAudioEngine({ canPlay: () => !save.isRestoring() });
  const audioStore = createAudioStore(audioEngine);
  audioEngine.suspendPlayback();
  const characterStore = createCharacterStore();
  const sceneStore = createSceneStore();
  const roomVisibilityStore = createRoomVisibilityStore();
  sceneStore.getState().suspendTransitions();
  const catalogStore = createCatalogStore();
  const craftingStore = createCraftingStore(inventoryStore, walletStore);
  const mailStore = createMailStore(inventoryStore, walletStore);
  const townStore = createTownStore();
  const eventsStore = createEventsStore();
  const toolEvents = createToolEvents();
  const gameplayEventRegistry = createDefaultGameplayEventRegistry(createStoreGameplayEventServices({ dialogStore, eventsStore, inventoryStore, questStore, emit: (name, payload) => plugins.context.events.emit(name, payload) }));
  const gameplayEvents = new GameplayEventEngine({ registry: gameplayEventRegistry });
  toolEvents.suspend(); gameplayEvents.suspend();
  const inputScope = createWorldInputScope();
  inputScope.suspend();
  const inputAdapter = new WorldInputBackend();
  const inputActions = new WorldInputActions(inputAdapter, inputScope, false);
  const interactablesStore = createInteractablesStore(false);
  const inputExtensionId = options.inputExtensionId ?? DEFAULT_INTERACTION_INPUT_EXTENSION_ID;
  const store = createGaesupStore(inputAdapter);
  const cinematics = createCameraCinematicPlayer({ store, characterStore, sceneStore, dialogStore }, false);
  const buildingStore = createBuildingStore();
  const gamepad = new WorldGamepadInput(inputAdapter, inputScope, () => store.getState().mode?.controller === 'gamepad' && store.getState().interaction?.isActive !== false && !buildingStore.getState().isInEditMode(), options.gamepad === false ? { enabled: false } : options.gamepad, undefined, () => {
    if (store.getState().automation?.queue.isRunning) store.getState().stopAutomation();
    if (clickNavigation.getClickNavigationRoute().length) clickNavigation.clearClickNavigationRoute();
  });
  let unsubscribeGamepadState: (() => void) | undefined;
  let unsubscribeGamepadEditor: (() => void) | undefined;
  const stopGamepad = () => { unsubscribeGamepadState?.(); unsubscribeGamepadState = undefined; unsubscribeGamepadEditor?.(); unsubscribeGamepadEditor = undefined; gamepad.suspend(); };
  const npcBrainAdapters = createNPCBrainAdapterRegistry(); npcBrainAdapters.suspend();
  const npcReinforcement = createReinforcementAdapter({
    active: false,
    isCurrent: ({ instance }) => {
      const current = npcStore.getState().instances.get(instance.id);
      return Boolean(current && current.brain === instance.brain && current.templateId === instance.templateId);
    },
  });
  const npcStore = createNPCStore({ onInvalidateBrain: npcReinforcement.release });
  attachReinforcementAdapter(npcBrainAdapters, npcReinforcement);
  const npcScheduler = createNPCScheduler();
  const buildingRenderStore = createBuildingRenderStore();
  const buildingCullingStore = createBuildingCullingStore();
  const buildingVisibilityStore = createBuildingVisibilityStore();
  const navigationObstacles = createNavigationObstacleRegistry();
  const navigation = new NavigationSystem(options.navigation);
  const clickNavigation = createClickNavigationRoute();
  const stateManager = new EntityStateManager();
  const worldObjectStore = createWorldObjectStore(worldId, false);
  const worldBridge = worldObjectStore.getState().getBridge()!;
  const worldViews = new WorldViews(); worldViews.suspend();
  const grassManager = createGrassManager({
    weather: () => weatherStore.getState().current,
    trample: () => ({ position: stateManager.getActiveState().position,
      isMoving: stateManager.getGameStates().isMoving, isGrounded: stateManager.getActiveState().isGround }),
  });
  grassManager.suspend();
  const clockLoop = getTimeClock(timeStore);
  clockLoop.suspend();
  const npcSimulation = new NPCSimulation(npcStore, clockLoop, { conditions: { questStore, friendshipStore }, adapters: npcBrainAdapters, scoped: true });
  const runtimeLogger = createPluginLogger(options.logger);
  const plugins = createPluginRegistry(options.logger ? { logger: options.logger } : {});
  const pluginRuntime = options.pluginRuntime ?? 'client';
  const save =
    options.saveSystem ??
    (options.saveOptions
      ? new SaveSystem(createRuntimeSaveOptions(options.saveOptions))
      : createDefaultSaveSystem({ namespace: worldId }));
  const saveDiagnostics = createRuntimeSaveDiagnostics(options.saveDiagnostics);
  const optionSaveBindings = [...(options.saveBindings ?? [])];
  const unregisterSaveBindings = new Map<string, () => void>();
  const pluginBindingKeys = new Set<string>();
  const rejectedPluginBindings = new WeakSet<RuntimeDomainBinding>();
  let unsubscribePluginLifecycle: (() => void) | undefined;
  let unregisterSaveDiagnostics: (() => void) | undefined;
  let unregisterRestoreGuard: (() => void) | undefined;
  let ownsSaveDiagnosticsService = false;
  let ownsTimeService = false;
  let ownsWorldStoreService = false;
  let ownsMotionsService = false;
  const ownedDomainServiceIds = new Set<string>();
  let lifecycleState: 'inactive' | 'setting-up' | 'active' | 'disposing' = 'inactive';
  let lifecycleQueue = Promise.resolve();
  let lifecycleRevision = 0;
  const lifecycleListeners = new Set<() => void>();
  let motions: MotionsRuntime | undefined;
  let motionBridge: MotionBridge | undefined;
  let animationBridge: AnimationBridge | undefined;
  let networkBridge: NetworkBridge | undefined;
  let inputExtension: InputBackendExtension | undefined;
  let unsubscribeInputExtensions: (() => void) | undefined;
  const refreshInputBackend = () => {
    const extension = plugins.context.input.get<InputBackendExtension>(inputExtensionId);
    if (inputAdapter.getStats().active && extension === inputExtension) return;
    try {
      const source = extension?.createAdapter();
      inputScope.releaseFocus();
      inputAdapter.activate(source);
      inputExtension = extension;
    } catch (error) {
      inputAdapter.suspend(); inputExtension = undefined;
      throw error;
    }
  };
  const getMotions = () => motions ??= { physicsBridge: new PhysicsBridge(), inputAdapter, events: plugins.context.events,
    extensionIds: { physics: 'gaesup.runtime.physics', input: inputExtensionId } };
  const publishLifecycle = () => {
    lifecycleRevision++;
    for (const listener of lifecycleListeners) {
      try { listener(); } catch (error) { runtimeLogger.warn('Runtime lifecycle subscriber failed', { error }); }
    }
  };

  for (const plugin of filterPluginsForRuntime(options.plugins ?? [], pluginRuntime)) {
    plugins.register(plugin);
  }

  const registerSaveBinding = (binding: RuntimeDomainBinding): void => {
    if (unregisterSaveBindings.has(binding.key)) return;
    const unregister = save.register({
      key: binding.key,
      serialize: () => binding.serialize() ?? null,
      hydrate: binding.hydrate,
      ...(binding.prepareHydrate ? { prepareHydrate: (data: Parameters<RuntimeDomainBinding['hydrate']>[0]) => binding.prepareHydrate!(data) } : {}),
    });
    unregisterSaveBindings.set(binding.key, unregister);
  };

  const registerPluginSaveBindings = (): void => {
    for (const entry of plugins.context.save.list()) {
      if (isRuntimeDomainBinding(entry.value)) {
        registerSaveBinding(entry.value);
        pluginBindingKeys.add(entry.value.key);
      }
    }
  };

  const syncPluginSaveBindings = (): void => {
    const current = new Set<string>();
    for (const entry of plugins.context.save.list()) {
      if (!isRuntimeDomainBinding(entry.value)) continue;
      current.add(entry.value.key);
      if (pluginBindingKeys.has(entry.value.key) || rejectedPluginBindings.has(entry.value)) continue;
      try {
        if (unregisterSaveBindings.has(entry.value.key)) throw new DuplicateSaveDomainBindingError(entry.value.key);
        registerSaveBinding(entry.value);
        pluginBindingKeys.add(entry.value.key);
      } catch (error) {
        rejectedPluginBindings.add(entry.value);
        const rejection = { key: entry.value.key, pluginId: entry.pluginId, error };
        runtimeLogger.warn(`Save binding "${entry.value.key}" was rejected after runtime setup.`, rejection);
        plugins.context.events.emit(RUNTIME_SAVE_BINDING_REJECTED_EVENT, rejection);
      }
    }
    for (const key of pluginBindingKeys) {
      if (current.has(key)) continue;
      pluginBindingKeys.delete(key);
      unregisterSaveBindings.get(key)?.();
      unregisterSaveBindings.delete(key);
    }
  };

  const loadAssets = async () => {
    const source = options.assets?.source;
    if (!source) return;
    await useAssetStore.getState().loadAssets(source);
  };

  const activateSaveDiagnostics = (): void => {
    plugins.context.services.register(
      DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
      saveDiagnostics,
      'gaesup.runtime',
    );
    ownsSaveDiagnosticsService = true;
    unregisterSaveDiagnostics = save.subscribeDiagnostics((diagnostic) => {
      const record = saveDiagnostics.report(diagnostic);
      runtimeLogger.warn(record.message, record);
      plugins.context.events.emit(RUNTIME_SAVE_DIAGNOSTIC_EVENT, record);
    });
  };

  const deactivateGeneration = async (disposeSetupFailures: boolean): Promise<CleanupResult> => {
    save.cancelPendingLoads();
    const releaseRestoreGuard = unregisterRestoreGuard;
    unregisterRestoreGuard = undefined;
    stopGamepad();
    cinematics.suspend();
    inputActions.suspend(); interactablesStore.getState().suspend();
    unsubscribeInputExtensions?.(); unsubscribeInputExtensions = undefined;
    inputAdapter.suspend(); inputExtension = undefined;
    npcSimulation.suspend(); npcBrainAdapters.suspend(); npcReinforcement.suspend();
    worldViews.suspend();
    grassManager.suspend();
    clockLoop.suspend(); toolEvents.suspend(); gameplayEvents.suspend(); inputScope.suspend();
    sceneStore.getState().suspendTransitions(); roomVisibilityStore.getState().reset();
    audioEngine.suspendPlayback(); audioStore.getState().stopBgm();
    let firstError: unknown;
    let hasError = false;
    const captureError = (error: unknown): void => {
      if (hasError) return;
      hasError = true;
      firstError = error;
    };
    const attempt = async (cleanup: () => void | Promise<void>): Promise<void> => {
      try {
        await cleanup();
      } catch (error) {
        captureError(error);
      }
    };
    if (releaseRestoreGuard) await attempt(releaseRestoreGuard);
    await attempt(() => audioEngine.dispose());
    await attempt(() => worldObjectStore.getState().deactivateWorldBridge());
    clickNavigation.nextClickNavigationRequest();
    await attempt(() => clickNavigation.clearClickNavigationRoute());
    const setupFailedPluginIds = disposeSetupFailures
      ? new Set(
          plugins
            .list()
            .filter((record) => record.status === 'failed')
            .map((record) => record.manifest.id),
        )
      : new Set<string>();

    await attempt(() => plugins.disposeAll());
    for (const record of [...plugins.list()].reverse()) {
      if (record.status === 'ready' || setupFailedPluginIds.has(record.manifest.id)) {
        await attempt(() => plugins.dispose(record.manifest.id));
      }
    }

    unsubscribePluginLifecycle?.();
    unsubscribePluginLifecycle = undefined;
    pluginBindingKeys.clear();
    await attempt(() => navigation.dispose());
    await attempt(() => dialogStore.getState().close());
    await attempt(() => buildingRenderStore.getState().reset());
    await attempt(() => buildingCullingStore.getState().reset());
    await attempt(() => buildingVisibilityStore.getState().reset());
    await attempt(() => store.disposeInteractions());
    const oldMotions = motions; const oldMotionBridge = motionBridge;
    motions = undefined; motionBridge = undefined;
    if (oldMotions) await attempt(() => oldMotions.physicsBridge.dispose());
    if (oldMotionBridge) await attempt(() => oldMotionBridge.dispose());
    const oldAnimationBridge = animationBridge; animationBridge = undefined;
    if (oldAnimationBridge) await attempt(() => oldAnimationBridge.dispose());
    const oldNetworkBridge = networkBridge; networkBridge = undefined;
    if (oldNetworkBridge) await attempt(() => oldNetworkBridge.dispose());

    const unregisterDiagnostics = unregisterSaveDiagnostics;
    unregisterSaveDiagnostics = undefined;
    if (unregisterDiagnostics) await attempt(unregisterDiagnostics);

    const unregisterBindings = [...unregisterSaveBindings.values()];
    unregisterSaveBindings.clear();
    for (const unregister of unregisterBindings) {
      await attempt(unregister);
    }

    if (ownsSaveDiagnosticsService) {
      ownsSaveDiagnosticsService = false;
      await attempt(() => {
        plugins.context.services.remove(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID);
      });
    }
    if (ownsTimeService) {
      ownsTimeService = false;
      await attempt(() => { plugins.context.services.remove(RUNTIME_TIME_STORE_SERVICE_ID); });
    }
    if (ownsWorldStoreService) {
      ownsWorldStoreService = false;
      await attempt(() => { plugins.context.services.remove(RUNTIME_GAESUP_STORE_SERVICE_ID); });
    }
    if (ownsMotionsService) {
      ownsMotionsService = false;
      await attempt(() => { plugins.context.services.remove(RUNTIME_OWNED_MOTIONS_SERVICE_ID); });
    }
    for (const id of ownedDomainServiceIds) {
      await attempt(() => { plugins.context.services.remove(id); });
    }
    ownedDomainServiceIds.clear();

    return hasError ? { failed: true, error: firstError } : { failed: false };
  };

  const registerOwnedService = <TService>(key: ServiceKey<TService>, service: TService): void => {
    plugins.context.services.register(key, service, 'gaesup.runtime');
    ownedDomainServiceIds.add(key);
  };

  let releaseErrorSink: (() => void) | undefined;

  const setup = async (): Promise<void> => {
    if (lifecycleState === 'active') return;
    lifecycleState = 'setting-up';
    try {
      if (options.onError && !releaseErrorSink) releaseErrorSink = setErrorSink(options.onError);
      store.activateInteractions();
      worldObjectStore.getState().activateWorldBridge();
      plugins.context.services.register(RUNTIME_TIME_STORE_SERVICE_ID, timeStore, 'gaesup.runtime');
      ownsTimeService = true;
      plugins.context.services.register(RUNTIME_GAESUP_STORE_SERVICE_ID, store, 'gaesup.runtime');
      ownsWorldStoreService = true;
      plugins.context.services.register(RUNTIME_OWNED_MOTIONS_SERVICE_ID, { create: getMotions, inputExtensionId }, 'gaesup.runtime');
      ownsMotionsService = true;
      registerOwnedService(BUILDING_STORE_SERVICE, buildingStore);
      registerOwnedService(NPC_STORE_SERVICE, npcStore);
      for (const [id, service] of Object.entries({ 'gaesup.runtime.npc-brain-adapters': npcBrainAdapters, 'gaesup.runtime.npc-reinforcement': npcReinforcement, 'gaesup.runtime.interactables-store': interactablesStore, 'gaesup.runtime.input-actions': inputActions, 'gaesup.runtime.gamepad': gamepad, 'gaesup.runtime.cinematics': cinematics })) {
        plugins.context.services.register(id, service, 'gaesup.runtime'); ownedDomainServiceIds.add(id);
      }
      registerOwnedService(AUDIO_STORE_SERVICE, audioStore);
      registerOwnedService(CHARACTER_STORE_SERVICE, characterStore);
      registerOwnedService(SCENE_STORE_SERVICE, sceneStore);
      registerOwnedService(INVENTORY_STORE_SERVICE, inventoryStore);
      registerOwnedService(WALLET_STORE_SERVICE, walletStore);
      registerOwnedService(SHOP_STORE_SERVICE, shopStore);
      registerOwnedService(RELATIONS_STORE_SERVICE, friendshipStore);
      registerOwnedService(WEATHER_STORE_SERVICE, weatherStore);
      registerOwnedService(FARMING_STORE_SERVICE, plotStore);
      registerOwnedService(QUESTS_STORE_SERVICE, questStore);
      registerOwnedService(DIALOG_STORE_SERVICE, dialogStore);
      registerOwnedService(CATALOG_STORE_SERVICE, catalogStore);
      registerOwnedService(CRAFTING_STORE_SERVICE, craftingStore);
      registerOwnedService(MAIL_STORE_SERVICE, mailStore);
      registerOwnedService(TOWN_STORE_SERVICE, townStore);
      registerOwnedService(EVENTS_STORE_SERVICE, eventsStore);
      for (const [id, service] of Object.entries({ 'gaesup.runtime.world-object-store': worldObjectStore, 'gaesup.runtime.world-bridge': worldBridge, 'gaesup.runtime.world-views': worldViews, 'gaesup.runtime.input-scope': inputScope, 'gaesup.runtime.tool-events': toolEvents, 'gaesup.runtime.gameplay-event-registry': gameplayEventRegistry, 'gaesup.runtime.gameplay-events': gameplayEvents })) {
        plugins.context.services.register(id, service, 'gaesup.runtime');
        ownedDomainServiceIds.add(id);
      }
      activateSaveDiagnostics();
      plugins.context.services.register('gaesup.runtime.save-system', save, 'gaesup.runtime');
      ownedDomainServiceIds.add('gaesup.runtime.save-system');
      for (const binding of optionSaveBindings) {
        registerSaveBinding(binding);
      }
      if (options.assets?.loadOnCreate) {
        await loadAssets();
      }
      await plugins.setupAll();
      registerPluginSaveBindings();
      unsubscribePluginLifecycle = plugins.onLifecycle(syncPluginSaveBindings);
      const gameplaySaveKey = 'gameplay-events';
      unregisterSaveBindings.set(gameplaySaveKey, save.register({
        key: gameplaySaveKey, serialize: () => gameplayEvents.serialize(),
        hydrate: data => gameplayEvents.hydrate(data), prepareHydrate: data => gameplayEvents.prepareHydrate(data),
      }));
      unregisterRestoreGuard = save.registerRestoreGuard(() => {
        const revision = lifecycleRevision;
        const active = lifecycleState === 'active';
        const resume = () => {
          if (!active || lifecycleState !== 'active' || lifecycleRevision !== revision) return;
          cinematics.resume(); sceneStore.getState().resumeTransitions(); gameplayEvents.resume(); npcSimulation.resume();
        };
        try { npcSimulation.suspend(); cinematics.suspend(); sceneStore.getState().suspendTransitions(); audioEngine.cancelSfx(); gameplayEvents.suspend(); }
        catch (error) { resume(); throw error; }
        return resume;
      });
      refreshInputBackend();
      unsubscribeInputExtensions = plugins.context.input.subscribe?.(id => {
        if (id === null || id === inputExtensionId) refreshInputBackend();
      });
      lifecycleState = 'active';
      toolEvents.resume(); gameplayEvents.resume(); sceneStore.getState().resumeTransitions();
      audioEngine.resumePlayback(); inputScope.resume();
      grassManager.resume();
      worldViews.resume();
      npcBrainAdapters.resume(); npcReinforcement.resume();
      npcSimulation.resume();
      interactablesStore.getState().resume(); inputActions.resume(); cinematics.resume();
      unsubscribeGamepadState = store.subscribe(() => gamepad.refresh());
      unsubscribeGamepadEditor = buildingStore.subscribe(() => gamepad.refresh());
      gamepad.resume();
      clockLoop.resume();
      publishLifecycle();
    } catch (error) {
      await deactivateGeneration(true);
      releaseErrorSink?.(); releaseErrorSink = undefined;
      lifecycleState = 'inactive';
      throw error;
    }
  };

  const dispose = async (): Promise<void> => {
    releaseErrorSink?.(); releaseErrorSink = undefined;
    stopGamepad();
    cinematics.suspend();
    inputActions.suspend(); interactablesStore.getState().suspend();
    unsubscribeInputExtensions?.(); unsubscribeInputExtensions = undefined;
    inputAdapter.suspend();
    npcSimulation.suspend(); npcBrainAdapters.suspend(); npcReinforcement.suspend();
    worldViews.suspend(); worldBridge.suspend();
    grassManager.suspend();
    clockLoop.suspend(); toolEvents.suspend(); gameplayEvents.suspend(); inputScope.suspend();
    sceneStore.getState().suspendTransitions(); roomVisibilityStore.getState().reset();
    audioEngine.suspendPlayback(); audioStore.getState().stopBgm();
    if (lifecycleState === 'inactive') {
      const cleanup = await deactivateGeneration(false);
      if (cleanup.failed) throw cleanup.error;
      return;
    }
    lifecycleState = 'disposing';
    publishLifecycle();
    const cleanup = await deactivateGeneration(false);
    lifecycleState = 'inactive';
    if (cleanup.failed) throw cleanup.error;
  };

  const enqueueLifecycle = (operation: () => Promise<void>): Promise<void> => {
    const task = lifecycleQueue.then(operation);
    lifecycleQueue = task.catch(() => undefined);
    return task;
  };

  return {
    worldId, store, timeStore, clockLoop, inputScope, inputActions, gamepad, interactablesStore, cinematics, navigation, clickNavigation, stateManager, inputAdapter, grassManager, worldBridge, worldObjectStore, worldViews,
    inventoryStore, walletStore, shopStore, friendshipStore, weatherStore, plotStore, questStore, dialogStore,
    audioEngine, audioStore, characterStore, sceneStore, roomVisibilityStore,
    catalogStore, craftingStore, mailStore, townStore, eventsStore,
    toolEvents, gameplayEventRegistry, gameplayEvents,
    buildingStore, npcStore, npcScheduler, npcSimulation, npcBrainAdapters, npcReinforcement, buildingRenderStore, buildingCullingStore, buildingVisibilityStore, navigationObstacles,
    get motions() { return getMotions(); },
    get motionBridge() { return motionBridge ??= new MotionBridge(); },
    get animationBridge() { return animationBridge ??= new AnimationBridge(); },
    get networkBridge() { return networkBridge ??= NetworkBridge.forClock(clockLoop.clock); },
    isActive: () => lifecycleState === 'active',
    getLifecycleRevision: () => lifecycleRevision,
    subscribeLifecycle: listener => { lifecycleListeners.add(listener); return () => { lifecycleListeners.delete(listener); }; },
    pluginRuntime,
    plugins,
    save,
    saveDiagnostics,
    loadAssets,
    getService: (id) => plugins.context.services.get(id),
    requireService: (id) => plugins.context.services.require(id),
    setup: () => enqueueLifecycle(setup),
    dispose: () => { save.cancelPendingLoads(); return enqueueLifecycle(dispose); },
  };
}

type CleanupResult =
  | { failed: false }
  | {
      failed: true;
      error: unknown;
    };

function createRuntimeSaveOptions(options: SaveSystemOptions): SaveSystemOptions {
  return {
    ...options,
  };
}

export { shouldSetupPluginForRuntime } from '../plugins';
