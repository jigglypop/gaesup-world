import type { GameplayActionHandler, GameplayConditionHandler, GameplayEventAction, GameplayEventCondition } from './types';
export declare class GameplayEventRegistry {
    private readonly conditions;
    private readonly actions;
    registerCondition<TCondition extends GameplayEventCondition>(type: TCondition['type'], handler: GameplayConditionHandler<TCondition>): void;
    registerAction<TAction extends GameplayEventAction>(type: TAction['type'], handler: GameplayActionHandler<TAction>): void;
    getCondition(type: string): GameplayConditionHandler | undefined;
    getAction(type: string): GameplayActionHandler | undefined;
}
export declare function createDefaultGameplayEventRegistry(): GameplayEventRegistry;
export declare function getGameplayEventRegistry(): GameplayEventRegistry;
