import { GameplayEventEngine as CoreGameplayEventEngine, type GameplayEventEngineOptions } from './engine';
import {
  GameplayEventRegistry,
  createDefaultGameplayEventRegistry as createCoreGameplayEventRegistry,
  getGameplayEventRegistry as getCoreGameplayEventRegistry,
  setDefaultGameplayEventServices,
} from './registry';
import type { GameplayEventServices } from './types';
import { useDialogStore, type DialogStore } from '../../dialog/stores/dialogStore';
import { notify } from '../../ui/components/Toast/toastStore';

let clientServicesInstalled = false;

export type GameplayEventDependencies = {
  dialogStore: DialogStore;
  emit?: (eventName: string, payload?: Record<string, unknown>) => void;
};

export function createStoreGameplayEventServices({ dialogStore, emit }: GameplayEventDependencies): GameplayEventServices {
  return {
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
  return createStoreGameplayEventServices({ dialogStore: useDialogStore });
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
