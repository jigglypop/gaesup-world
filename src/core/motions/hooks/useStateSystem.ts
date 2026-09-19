import { useCallback, useSyncExternalStore } from 'react';

import { useGaesupRuntime } from '../../runtime/context';
import { GameStatesType } from '../../world/components/Rideable/types';
import { EntityStateManager } from '../core/system/EntityStateManager';
import { ActiveStateType } from '../core/types';

export interface UseStateSystemResult {
    activeState: ActiveStateType;
    gameStates: GameStatesType;
    updateActiveState: (updates: Partial<ActiveStateType>) => void;
    updateGameStates: (updates: Partial<GameStatesType>) => void;
    resetActiveState: () => void;
    resetGameStates: () => void;
}

let globalStateManager: EntityStateManager | null = null;
export function getGlobalStateManager(): EntityStateManager {
    if (!globalStateManager) {
        globalStateManager = new EntityStateManager();
    }
    return globalStateManager;
}

type StateChannel = { subscribe: (listener: () => void) => () => void; getRevision: () => number; notify: () => void };
const channels = new WeakMap<EntityStateManager, StateChannel>();
function getChannel(manager: EntityStateManager): StateChannel {
  let channel = channels.get(manager);
  if (!channel) {
    const listeners = new Set<() => void>(); let revision = 0;
    channel = { subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
      getRevision: () => revision, notify: () => { revision++; listeners.forEach(listener => listener()); } };
    channels.set(manager, channel);
  }
  return channel;
}

export function useStateSystem(): UseStateSystemResult {
    const stateManager = useGaesupRuntime()?.stateManager ?? getGlobalStateManager();
    const channel = getChannel(stateManager);
    useSyncExternalStore(channel.subscribe, channel.getRevision, channel.getRevision);

    const updateActiveState = useCallback((updates: Partial<ActiveStateType>) => {
        stateManager.updateActiveState(updates);
        channel.notify();
    }, [stateManager, channel]);

    const updateGameStates = useCallback((updates: Partial<GameStatesType>) => {
        stateManager.updateGameStates(updates);
        channel.notify();
    }, [stateManager, channel]);

    const resetActiveState = useCallback(() => {
        stateManager.resetActiveState();
        channel.notify();
    }, [stateManager, channel]);

    const resetGameStates = useCallback(() => {
        stateManager.resetGameStates();
        channel.notify();
    }, [stateManager, channel]);

    return {
        activeState: stateManager.getActiveState(),
        gameStates: stateManager.getGameStates(),
        updateActiveState,
        updateGameStates,
        resetActiveState,
        resetGameStates,
    };
}
