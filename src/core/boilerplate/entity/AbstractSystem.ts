import { BaseState, BaseMetrics, SystemOptions, SystemUpdateArgs } from '../types';
import { BaseSystem, SystemContext } from './BaseSystem';
import { Profile, HandleError } from '../decorators';

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
    private _isDisposed = false;
    private _updateCount = 0;

    constructor(
        defaultState: StateType,
        defaultMetrics: MetricsType,
        options?: OptionsType
    ) {
        this.options = { ...options } as OptionsType;
        this.state = this.createInitialState(defaultState, this.options.initialState);
        this.metrics = this.createInitialMetrics(defaultMetrics, this.options.initialMetrics);
    }
    private createInitialState(
        defaultState: StateType,
        initialState?: Record<string, unknown>
    ): StateType {
        return {
            ...defaultState,
            ...initialState,
            lastUpdate: 0,
        };
    }
    private createInitialMetrics(
        defaultMetrics: MetricsType,
        initialMetrics?: Record<string, unknown>
    ): MetricsType {
        return {
            ...defaultMetrics,
            ...initialMetrics,
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
    
    protected createUpdateArgs(context: SystemContext): UpdateArgsType {
        return {
            ...context,
            deltaTime: context.deltaTime
        } as unknown as UpdateArgsType;
    }
    
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
        this.state = this.createInitialState(this.state, this.options.initialState);
        this.metrics = this.createInitialMetrics(this.metrics, this.options.initialMetrics);
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