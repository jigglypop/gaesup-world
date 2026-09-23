import { GameplayEventEngine as CoreGameplayEventEngine, type GameplayEventEngineOptions } from './engine';
import {
  GameplayEventRegistry,
  createDefaultGameplayEventRegistry as createCoreGameplayEventRegistry,
  getGameplayEventRegistry as getCoreGameplayEventRegistry,
  setDefaultGameplayEventServices,
} from './registry';
import type { GameplayEventServices } from './types';
import { useDialogStore, type DialogStore } from '../../dialog/stores/dialogStore';
import { useEventsStore, type EventsStore } from '../../events/stores/eventsStore';
import { useInventoryStore, type InventoryStore } from '../../inventory/stores/inventoryStore';
import { useQuestStore, type QuestStore } from '../../quests/stores/questStore';
import { notify } from '../../ui/components/Toast/toastStore';

let clientServicesInstalled = false;

export type GameplayEventDependencies = {
  dialogStore: DialogStore;
  eventsStore: EventsStore;
  inventoryStore: InventoryStore;
  questStore: QuestStore;
  emit?: (eventName: string, payload?: Record<string, unknown>) => void;
};

export function createStoreGameplayEventServices({
  dialogStore,
  eventsStore,
  inventoryStore,
  questStore,
  emit,
}: GameplayEventDependencies): GameplayEventServices {
  return {
    hasItem: (itemId, count) => inventoryStore.getState().has(itemId, count),
    addItem: (itemId, count) => {
      inventoryStore.getState().add(itemId, count);
    },
    removeItem: (itemId, count) => {
      inventoryStore.getState().removeById(itemId, count);
    },
    questStatus: (questId) => questStore.getState().statusOf(questId),
    startQuest: (questId) => {
      questStore.getState().start(questId);
    },
    completeQuest: (questId) => {
      questStore.getState().complete(questId);
    },
    notifyQuestFlag: (key, value) => {
      questStore.getState().notifyFlag(key, value);
    },
    isEventActive: (eventId) => eventsStore.getState().isActive(eventId),
    showDialog: (dialogTreeId, npcId) => {
      dialogStore.getState().start(dialogTreeId, npcId ? { context: { npcId } } : undefined);
    },
    notify: (kind, text) => {
      notify(kind, text);
    },
    ...(emit ? { emit } : {}),
  };
}

export function createClientGameplayEventServices(): GameplayEventServices {
  return createStoreGameplayEventServices({
    dialogStore: useDialogStore,
    eventsStore: useEventsStore,
    inventoryStore: useInventoryStore,
    questStore: useQuestStore,
  });
}

export function installClientGameplayEventServices(): void {
  if (clientServicesInstalled) return;
  clientServicesInstalled = true;
  setDefaultGameplayEventServices(createClientGameplayEventServices);
}

export function getGameplayEventRegistry(): GameplayEventRegistry {
  installClientGameplayEventServices();
  return getCoreGameplayEventRegistry();
}

export function createDefaultGameplayEventRegistry(
  services: GameplayEventServices | null = createClientGameplayEventServices(),
): GameplayEventRegistry {
  return createCoreGameplayEventRegistry(services);
}

export class GameplayEventEngine extends CoreGameplayEventEngine {
  constructor(options: GameplayEventEngineOptions = {}) {
    installClientGameplayEventServices();
    super(options);
  }
}
