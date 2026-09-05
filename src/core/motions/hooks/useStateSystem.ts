import { useCallback, useSyncExternalStore } from 'react';

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
const listeners = new Set<() => void>();
let revision = 0;
const getRevision = () => revision;

export function getGlobalStateManager(): EntityStateManager {
    if (!globalStateManager) {
        globalStateManager = new EntityStateManager();
    }
    return globalStateManager;
}

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
};

const notifyListeners = () => {
    revision += 1;
    listeners.forEach(listener => listener());
};

export function useStateSystem(): UseStateSystemResult {
    const stateManager = getGlobalStateManager();
    useSyncExternalStore(subscribe, getRevision, getRevision);

    const updateActiveState = useCallback((updates: Partial<ActiveStateType>) => {
        stateManager.updateActiveState(updates);
        notifyListeners();
    }, [stateManager]);

    const updateGameStates = useCallback((updates: Partial<GameStatesType>) => {
        stateManager.updateGameStates(updates);
        notifyListeners();
    }, [stateManager]);

    const resetActiveState = useCallback(() => {
        stateManager.resetActiveState();
        notifyListeners();
    }, [stateManager]);

    const resetGameStates = useCallback(() => {
        stateManager.resetGameStates();
        notifyListeners();
    }, [stateManager]);

    return {
        activeState: stateManager.getActiveState(),
        gameStates: stateManager.getGameStates(),
        updateActiveState,
        updateGameStates,
        resetActiveState,
        resetGameStates,
    };
}
