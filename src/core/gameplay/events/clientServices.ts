import { GameplayEventEngine as CoreGameplayEventEngine, type GameplayEventEngineOptions } from './engine';
import {
  GameplayEventRegistry,
  createDefaultGameplayEventRegistry as createCoreGameplayEventRegistry,
  getGameplayEventRegistry as getCoreGameplayEventRegistry,
  setDefaultGameplayEventServices,
} from './registry';
import type { GameplayEventServices } from './types';
import { useDialogStore } from '../../dialog/stores/dialogStore';
import { useEventsStore } from '../../events/stores/eventsStore';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useQuestStore } from '../../quests/stores/questStore';
import { notify } from '../../ui/components/Toast/toastStore';

let clientServicesInstalled = false;

export function createClientGameplayEventServices(): GameplayEventServices {
  return {
    hasItem: (itemId, count) => useInventoryStore.getState().has(itemId, count),
    addItem: (itemId, count) => {
      useInventoryStore.getState().add(itemId, count);
    },
    removeItem: (itemId, count) => {
      useInventoryStore.getState().removeById(itemId, count);
    },
    questStatus: (questId) => useQuestStore.getState().statusOf(questId),
    startQuest: (questId) => {
      useQuestStore.getState().start(questId);
    },
    completeQuest: (questId) => {
      useQuestStore.getState().complete(questId);
    },
    notifyQuestFlag: (key, value) => {
      useQuestStore.getState().notifyFlag(key, value);
    },
    isEventActive: (eventId) => useEventsStore.getState().isActive(eventId),
    showDialog: (dialogTreeId, npcId) => {
      useDialogStore.getState().start(dialogTreeId, npcId ? { context: { npcId } } : undefined);
    },
    notify: (kind, text) => {
      notify(kind, text);
    },
  };
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
