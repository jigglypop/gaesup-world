import { BaseState, BaseMetrics, SystemOptions, SystemUpdateArgs, RuntimeRecord } from '../types';
import { BaseSystem, SystemContext } from './BaseSystem';
import { Profile, HandleError } from '../decorators';

type SystemInitializer<ValueType> =
    | ValueType
    | ((overrides?: RuntimeRecord) => ValueType);

export abstract class AbstractSystem<
    StateType extends BaseState = BaseState,
    MetricsType extends BaseMetrics = BaseMetrics,
    OptionsType extends SystemOptions = SystemOptions,
    UpdateArgsType extends SystemUpdateArgs = SystemUpdateArgs
> implements BaseSystem<StateType, MetricsType> {
    readonly id?: string;
    readonly capabilities = {
        hasAsync: true,
        hasMetrics: true,
        hasState: true,
        hasEvents: false
    };
    protected state: StateType;
    protected metrics: MetricsType;
    protected options: OptionsType;
    private readonly stateInitializer: SystemInitializer<StateType>;
    private readonly metricsInitializer: SystemInitializer<MetricsType>;
    private _isDisposed = false;
    private _updateCount = 0;

    constructor(
        defaultState: SystemInitializer<StateType>,
        defaultMetrics: SystemInitializer<MetricsType>,
        options?: OptionsType
    ) {
        this.options = { ...options } as OptionsType;
        this.stateInitializer = defaultState;
        this.metricsInitializer = defaultMetrics;
        this.state = this.createInitialState(defaultState, this.options.initialState);
        this.metrics = this.createInitialMetrics(defaultMetrics, this.options.initialMetrics);
    }
    private createInitialState(
        initializer: SystemInitializer<StateType>,
        initialState?: RuntimeRecord
    ): StateType {
        const state = typeof initializer === 'function'
            ? initializer(initialState)
            : { ...initializer, ...initialState };
        return {
            ...state,
            lastUpdate: 0,
        };
    }
    private createInitialMetrics(
        initializer: SystemInitializer<MetricsType>,
        initialMetrics?: RuntimeRecord
    ): MetricsType {
        const metrics = typeof initializer === 'function'
            ? initializer(initialMetrics)
            : { ...initializer, ...initialMetrics };
        return {
            ...metrics,
            frameTime: 0,
        };
    }
    
    @HandleError()
    async init(): Promise<void> {
        // 서브클래스에서 필요시 오버라이드
    }
    
    @HandleError()
    async start(): Promise<void> {
        // 서브클래스에서 필요시 오버라이드
    }
    
    pause(): void {
        // 서브클래스에서 필요시 오버라이드
    }
    
    resume(): void {
        // 서브클래스에서 필요시 오버라이드
    }
    
    @Profile()
    update(context: SystemContext): void {
        const args = this.createUpdateArgs(context);
        this.performUpdateWithArgs(args);
    }
    
    protected createDefaultUpdateArgs(context: SystemContext): SystemUpdateArgs {
        return context;
    }
    protected abstract createUpdateArgs(context: SystemContext): UpdateArgsType;
    
    @Profile()
    protected performUpdateWithArgs(args: UpdateArgsType): void {
        if (this._isDisposed) {
            throw new Error(`Cannot update disposed system`);
        }
        const startTime = performance.now();
        this._updateCount++;
        this.state.lastUpdate = Date.now();
        this.beforeUpdate(args);
        this.performUpdate(args);
        const endTime = performance.now();
        this.metrics.frameTime = endTime - startTime;
        this.updateMetrics(args.deltaTime);
        this.afterUpdate(args);
    }
    protected beforeUpdate(args: UpdateArgsType): void {
        void args;
    }
    protected abstract performUpdate(args: UpdateArgsType): void;
    protected afterUpdate(args: UpdateArgsType): void {
        void args;
    }
    protected updateMetrics(deltaTime: number): void {
        void deltaTime;
    }
    public getState(): Readonly<StateType> {
        return this.state;
    }
    public getMetrics(): Readonly<MetricsType> {
        return this.metrics;
    }
    public get isDisposed(): boolean {
        return this._isDisposed;
    }
    public get updateCount(): number {
        return this._updateCount;
    }
    
    @HandleError()
    public reset(): void {
        const stateSource = typeof this.stateInitializer === 'function'
            ? this.stateInitializer
            : this.state;
        const metricsSource = typeof this.metricsInitializer === 'function'
            ? this.metricsInitializer
            : this.metrics;
        const nextState = this.createInitialState(stateSource, this.options.initialState);
        const nextMetrics = this.createInitialMetrics(metricsSource, this.options.initialMetrics);

        this.state = nextState;
        this.metrics = nextMetrics;
        this._updateCount = 0;
        this.onReset();
    }
    protected onReset(): void {}
    
    @HandleError()
    public dispose(): void {
        if (this._isDisposed) return;
        this.onDispose();
        this._isDisposed = true;
    }
    protected onDispose(): void {}
} 
