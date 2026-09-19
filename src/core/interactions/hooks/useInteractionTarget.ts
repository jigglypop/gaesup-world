import { useEffect } from 'react';

import { useFrame } from '@react-three/fiber';

import { getFrameElapsedSeconds } from '../../boilerplate/hooks/frameTime';
import { useWorldInputActions } from '../../input/useWorldInputActions';
import { usePlayerPosition } from '../../motions/hooks/usePlayerPosition';
import { useInteractablesStore, useInteractablesStoreApi, type CurrentTarget } from '../stores/interactablesStore';

export type CurrentInteraction = CurrentTarget;

export function useCurrentInteraction(): CurrentInteraction {
  return useInteractablesStore(state => state.current);
}

export function useInteractionKey(enabled = true): void {
  const actions = useWorldInputActions();
  const store = useInteractablesStoreApi();
  useEffect(() => {
    if (!enabled) return;
    return actions.register('interaction.activate', {
      key: () => store.getState().current?.key,
      execute: () => store.getState().activateCurrent(),
    });
  }, [actions, store, enabled]);
}

export type InteractionTrackerProps = { throttleMs?: number };

export function InteractionTracker({ throttleMs = 80 }: InteractionTrackerProps = {}): null {
  const { position } = usePlayerPosition({ reactive: false });
  const store = useInteractablesStoreApi();
  useFrame(state => { store.getState().track(position, getFrameElapsedSeconds(state) * 1000, throttleMs); });
  return null;
}
