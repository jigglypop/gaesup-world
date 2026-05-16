import { GameStatesType } from '@core/world/components/Rideable/types';
import { EntityStateRefs } from './types';
import { ActiveStateType } from '../types';
export declare class EntityStateManager {
    private refs;
    constructor();
    getActiveState(): ActiveStateType;
    getGameStates(): GameStatesType;
    getState(): EntityStateRefs;
    updateActiveState(updates: Partial<ActiveStateType>): void;
    updateGameStates(updates: Partial<GameStatesType>): void;
    resetActiveState(): void;
    resetGameStates(): void;
    reset(): void;
    dispose(): void;
}
