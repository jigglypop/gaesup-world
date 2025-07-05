import { BaseState, BaseMetrics, SystemOptions, SystemUpdateArgs, IDisposable } from './types';

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

    /**
     * 초기 상태를 생성합니다.
     */
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

    /**
     * 초기 메트릭을 생성합니다.
     */
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

    /**
     * 시스템을 업데이트합니다.
     */
    public update(args: UpdateArgsType): void {
        if (this._isDisposed) {
            throw new Error(`Cannot update disposed system`);
        }

        const startTime = performance.now();
        this._updateCount++;
        this.state.lastUpdate = Date.now();

        // 업데이트 전 처리
        this.beforeUpdate(args);
        
        // 핵심 업데이트 로직
        this.performUpdate(args);
        
        // 메트릭 업데이트
        const endTime = performance.now();
        this.metrics.frameTime = endTime - startTime;
        this.updateMetrics(args.deltaTime);
        
        // 업데이트 후 처리
        this.afterUpdate(args);
    }

    /**
     * 업데이트 전 처리. 하위 클래스에서 오버라이드 가능.
     */
    protected beforeUpdate(args: UpdateArgsType): void {}

    /**
     * 실제 업데이트 로직. 하위 클래스에서 구현해야 합니다.
     */
    protected abstract performUpdate(args: UpdateArgsType): void;

    /**
     * 업데이트 후 처리. 하위 클래스에서 오버라이드 가능.
     */
    protected afterUpdate(args: UpdateArgsType): void {}

    /**
     * 메트릭을 업데이트합니다. 하위 클래스에서 오버라이드 가능.
     */
    protected updateMetrics(deltaTime: number): void {}

    /**
     * 현재 상태를 반환합니다.
     */
    public getState(): Readonly<StateType> {
        return this.state;
    }

    /**
     * 현재 메트릭을 반환합니다.
     */
    public getMetrics(): Readonly<MetricsType> {
        return this.metrics;
    }

    /**
     * 시스템이 폐기되었는지 확인합니다.
     */
    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**
     * 총 업데이트 횟수를 반환합니다.
     */
    public get updateCount(): number {
        return this._updateCount;
    }

    /**
     * 시스템을 초기 상태로 리셋합니다.
     */
    public reset(): void {
        this.state = this.createInitialState(this.state, this.options.initialState);
        this.metrics = this.createInitialMetrics(this.metrics, this.options.initialMetrics);
        this._updateCount = 0;
        this.onReset();
    }

    /**
     * 리셋 시 추가적인 동작. 하위 클래스에서 구현 가능.
     */
    protected onReset(): void {}

    /**
     * 시스템을 폐기합니다.
     */
    public dispose(): void {
        if (this._isDisposed) return;
        
        this.onDispose();
        this._isDisposed = true;
    }

    /**
     * 폐기 시 추가적인 동작. 하위 클래스에서 구현 가능.
     */
    protected onDispose(): void {}

    /**
     * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
     */
    protected copyVector3<T extends { set: (x: number, y: number, z: number) => void }>(
        target: T, 
        source: { x: number; y: number; z: number }
    ): void {
        target.set(source.x, source.y, source.z);
    }

    /**
     * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
     */
    protected updateStateIfChanged<K extends keyof StateType>(
        key: K,
        newValue: StateType[K],
        callback?: () => void
    ): boolean {
        if (this.state[key] !== newValue) {
            this.state[key] = newValue;
            callback?.();
            return true;
        }
        return false;
    }

    /**
     * 여러 상태를 한번에 업데이트
     */
    protected updateMultipleStates(updates: Partial<StateType>): void {
        Object.assign(this.state, updates);
    }

    /**
     * 메트릭 증가
     */
    protected incrementMetric<K extends keyof MetricsType>(
        key: K,
        amount: number = 1
    ): void {
        if (typeof this.metrics[key] === 'number') {
            const metrics = this.metrics as Record<string, unknown>;
            metrics[key as string] = (metrics[key as string] as number) + amount;
        }
    }

    /**
     * 상태 검증
     */
    protected validateState(): boolean {
        return true;
    }

    /**
     * 디버그 정보 출력
     */
    public debug(): void {
        console.log(`[${this.constructor.name}] State:`, this.state);
        console.log(`[${this.constructor.name}] Metrics:`, this.metrics);
        console.log(`[${this.constructor.name}] Update Count:`, this._updateCount);
    }
}