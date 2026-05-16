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
export declare function getGlobalStateManager(): EntityStateManager;
export declare function useStateSystem(): UseStateSystemResult;
