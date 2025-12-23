import { useRef, useCallback, useEffect, useSyncExternalStore } from 'react';

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

export function getGlobalStateManager(): EntityStateManager {
    if (!globalStateManager) {
        globalStateManager = new EntityStateManager();
    }
    return globalStateManager;
}

// Subscribe 함수
const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
};

// Notify 함수
const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

export function useStateSystem(): UseStateSystemResult {
    const stateManagerRef = useRef<EntityStateManager | null>(null);
    
    if (!stateManagerRef.current) {
        stateManagerRef.current = getGlobalStateManager();
    }

    // useSyncExternalStore를 사용하여 외부 상태 구독
    const activeState = useSyncExternalStore(
        subscribe,
        () => stateManagerRef.current!.getActiveState(),
        () => stateManagerRef.current!.getActiveState()
    );

    const gameStates = useSyncExternalStore(
        subscribe,
        () => stateManagerRef.current!.getGameStates(),
        () => stateManagerRef.current!.getGameStates()
    );

    const updateActiveState = useCallback((updates: Partial<ActiveStateType>) => {
        stateManagerRef.current?.updateActiveState(updates);
        notifyListeners();
    }, []);

    const updateGameStates = useCallback((updates: Partial<GameStatesType>) => {
        stateManagerRef.current?.updateGameStates(updates);
        notifyListeners();
    }, []);

    const resetActiveState = useCallback(() => {
        stateManagerRef.current?.resetActiveState();
        notifyListeners();
    }, []);

    const resetGameStates = useCallback(() => {
        stateManagerRef.current?.resetGameStates();
        notifyListeners();
    }, []);

    useEffect(() => {
        return () => {
            stateManagerRef.current = null;
        };
    }, []);

    return {
        activeState,
        gameStates,
        updateActiveState,
        updateGameStates,
        resetActiveState,
        resetGameStates,
    };
} 