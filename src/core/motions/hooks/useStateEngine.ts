import { useRef, useCallback, useEffect, useState } from 'react';
import { StateEngine } from '../core/StateEngine';
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

export function useStateEngine(): UseStateEngineResult {
  const stateEngineRef = useRef<StateEngine | null>(null);
  const [, forceUpdate] = useState({});
  
  if (!stateEngineRef.current) {
    stateEngineRef.current = StateEngine.getInstance();
  }
  
  const activeState = stateEngineRef.current.getActiveStateRef();
  const gameStates = stateEngineRef.current.getGameStatesRef();
  
  const updateActiveState = useCallback((updates: Partial<ActiveStateType>) => {
    stateEngineRef.current?.updateActiveState(updates);
    forceUpdate({});
  }, []);
  
  const updateGameStates = useCallback((updates: Partial<GameStatesType>) => {
    stateEngineRef.current?.updateGameStates(updates);
    forceUpdate({});
  }, []);
  
  const resetActiveState = useCallback(() => {
    stateEngineRef.current?.resetActiveState();
    forceUpdate({});
  }, []);
  
  const resetGameStates = useCallback(() => {
    stateEngineRef.current?.resetGameStates();
    forceUpdate({});
  }, []);
  
  useEffect(() => {
    return () => {
      stateEngineRef.current = null;
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