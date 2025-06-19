import { StateCreator } from 'zustand';
import { GameStatesSlice } from './types';

const createDefaultGameStates = () => ({
  rideableId: '',
  isMoving: false,
  isNotMoving: true,
  isOnTheGround: true,
  isOnMoving: false,
  isRotated: false,
  isRunning: false,
  isJumping: false,
  enableRiding: false,
  isRiderOn: false,
  isLanding: false,
  isFalling: false,
  isRiding: false,
  canRide: false,
  nearbyRideable: null,
  shouldEnterRideable: false,
  shouldExitRideable: false,
});

export const createGameStatesSlice: StateCreator<GameStatesSlice, [], [], GameStatesSlice> = (
  set,
) => ({
  states: createDefaultGameStates(),
  setStates: (update) =>
    set((state) => ({
      states: { ...state.states, ...update },
    })),
});
