import { BaseState, BaseMetrics, SystemOptions, SystemUpdateArgs, IDisposable } from '../types';

export abstract class AbstractSystem<
    StateType extends BaseState = BaseState,
    MetricsType extends BaseMetrics = BaseMetrics,
    OptionsType extends SystemOptions = SystemOptions,
    UpdateArgsType extends SystemUpdateArgs = SystemUpdateArgs
> implements IDisposable {
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
    public update(args: UpdateArgsType): void {
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
    protected beforeUpdate(args: UpdateArgsType): void {}
    protected abstract performUpdate(args: UpdateArgsType): void;
    protected afterUpdate(args: UpdateArgsType): void {}
    protected updateMetrics(deltaTime: number): void {}
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
    public reset(): void {
        this.state = this.createInitialState(this.state, this.options.initialState);
        this.metrics = this.createInitialMetrics(this.metrics, this.options.initialMetrics);
        this._updateCount = 0;
        this.onReset();
    }
    protected onReset(): void {}
    public dispose(): void {
        if (this._isDisposed) return;
        this.onDispose();
        this._isDisposed = true;
    }
    protected onDispose(): void {}
} 