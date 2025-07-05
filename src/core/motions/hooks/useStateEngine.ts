import { useRef, useCallback, useEffect, useState } from 'react';
import { EntityStateManager } from '../core/engine/EntityStateManager';
import { ActiveStateType } from '../core/types';
import { GameStatesType } from '../../world/components/Rideable/types';

export interface UseStateEngineResult {
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

export function useStateEngine(): UseStateEngineResult {
    const stateManagerRef = useRef<EntityStateManager | null>(null);
    const [, forceUpdate] = useState({});
    if (!stateManagerRef.current) {
        stateManagerRef.current = getGlobalStateManager();
    }

    const activeState = stateManagerRef.current.getActiveState();
    const gameStates = stateManagerRef.current.getGameStates();

    const updateActiveState = useCallback((updates: Partial<ActiveStateType>) => {
        stateManagerRef.current?.updateActiveState(updates);
        forceUpdate({});
    }, []);

    const updateGameStates = useCallback((updates: Partial<GameStatesType>) => {
        stateManagerRef.current?.updateGameStates(updates);
        forceUpdate({});
    }, []);

    const resetActiveState = useCallback(() => {
        stateManagerRef.current?.resetActiveState();
        forceUpdate({});
    }, []);

    const resetGameStates = useCallback(() => {
        stateManagerRef.current?.resetGameStates();
        forceUpdate({});
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