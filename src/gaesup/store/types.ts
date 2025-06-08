import { gameStore } from './gameStore';

export type GameStore = typeof gameStore;
export type GameSnapshot = ReturnType<typeof import('valtio').snapshot<GameStore>>;

export type PhysicsState = typeof gameStore.physics.activeState;
export type GameStates = typeof gameStore.gameStates;
export type InputState = typeof gameStore.input;
export type UIState = typeof gameStore.ui;
export type ResourcesState = typeof gameStore.resources;
export type ConfigState = typeof gameStore.config;
