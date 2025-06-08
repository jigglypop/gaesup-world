'use client';
import { ReactNode, createContext, useContext, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { gameStore, gameActions } from '../store';

export const ValtioGaesupContext = createContext(null);

interface ValtioGaesupProviderProps {
  children: ReactNode;
  initialState?: any;
}

export function ValtioGaesupProvider({ children, initialState = {} }: ValtioGaesupProviderProps) {
  useEffect(() => {
    if (Object.keys(initialState).length > 0) {
      Object.entries(initialState).forEach(([key, value]) => {
        if (key === 'activeState') {
          gameActions.updatePhysics(value as any);
        } else if (key === 'mode') {
          Object.assign(gameStore.ui.mode, value);
        } else if (key === 'urls') {
          gameActions.updateUrls(value as any);
        } else if (key === 'states') {
          gameActions.updateGameStates(value as any);
        } else if (key === 'control') {
          gameActions.updateKeyboard(value as any);
        } else if (key === 'clicker') {
          gameActions.updatePointer(value as any);
        } else if (key === 'block') {
          gameActions.updateBlocks(value as any);
        } else if (key === 'clickerOption') {
          gameActions.updateClickerOption(value as any);
        } else if (key === 'animationState') {
          Object.assign(gameStore.ui.animation, value);
        } else if (key === 'sizes') {
          gameActions.updateSizes(value as any);
        } else if (key === 'rideable') {
          Object.assign(gameStore.resources.rideable, value);
        } else if (['airplane', 'vehicle', 'character'].includes(key)) {
          Object.assign(gameStore.config[key as keyof typeof gameStore.config], value);
        } else if (key === 'controllerOptions') {
          Object.assign(gameStore.config.controllerOptions, value);
        }
      });
    }
  }, [initialState]);

  return <ValtioGaesupContext.Provider value={null}>{children}</ValtioGaesupContext.Provider>;
}

export function useValtioGaesup() {
  const context = useContext(ValtioGaesupContext);
  const snapshot = useSnapshot(gameStore);

  return {
    context: snapshot,
    actions: gameActions,
    store: gameStore,
  };
}

export function useValtioGaesupContext() {
  return useSnapshot(gameStore);
}

export function useValtioGaesupActions() {
  return gameActions;
}

export const createValtioStateUpdater = <T extends keyof typeof gameStore>(stateKey: T) => {
  return (updates: Partial<(typeof gameStore)[T]>) => {
    Object.assign(gameStore[stateKey], updates);
  };
};
