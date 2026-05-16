import { type GameplayEventRegistry } from './registry';
import type { GameplayEventBlueprint, GameplayEventExecution, GameplayEventRuntimeState, GameplayTriggerEvent } from './types';
export type GameplayEventEngineOptions = {
    blueprints?: GameplayEventBlueprint[];
    registry?: GameplayEventRegistry;
    state?: GameplayEventRuntimeState;
};
export declare class GameplayEventEngine {
    private blueprints;
    private readonly registry;
    readonly state: GameplayEventRuntimeState;
    constructor(options?: GameplayEventEngineOptions);
    setBlueprints(blueprints: GameplayEventBlueprint[]): void;
    getBlueprints(): GameplayEventBlueprint[];
    dispatch(trigger: GameplayTriggerEvent): Promise<GameplayEventExecution[]>;
    private executeBlueprint;
}
