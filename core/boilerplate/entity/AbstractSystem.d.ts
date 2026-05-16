import { BaseState, BaseMetrics, SystemOptions, SystemUpdateArgs } from '../types';
import { BaseSystem, SystemContext } from './BaseSystem';
export declare abstract class AbstractSystem<StateType extends BaseState = BaseState, MetricsType extends BaseMetrics = BaseMetrics, OptionsType extends SystemOptions = SystemOptions, UpdateArgsType extends SystemUpdateArgs = SystemUpdateArgs> implements BaseSystem<StateType, MetricsType> {
    readonly id?: string;
    readonly capabilities: {
        hasAsync: boolean;
        hasMetrics: boolean;
        hasState: boolean;
        hasEvents: boolean;
    };
    protected state: StateType;
    protected metrics: MetricsType;
    protected options: OptionsType;
    private _isDisposed;
    private _updateCount;
    constructor(defaultState: StateType, defaultMetrics: MetricsType, options?: OptionsType);
    private createInitialState;
    private createInitialMetrics;
    init(): Promise<void>;
    start(): Promise<void>;
    pause(): void;
    resume(): void;
    update(context: SystemContext): void;
    protected createDefaultUpdateArgs(context: SystemContext): SystemUpdateArgs;
    protected abstract createUpdateArgs(context: SystemContext): UpdateArgsType;
    protected performUpdateWithArgs(args: UpdateArgsType): void;
    protected beforeUpdate(args: UpdateArgsType): void;
    protected abstract performUpdate(args: UpdateArgsType): void;
    protected afterUpdate(args: UpdateArgsType): void;
    protected updateMetrics(deltaTime: number): void;
    getState(): Readonly<StateType>;
    getMetrics(): Readonly<MetricsType>;
    get isDisposed(): boolean;
    get updateCount(): number;
    reset(): void;
    protected onReset(): void;
    dispose(): void;
    protected onDispose(): void;
}
