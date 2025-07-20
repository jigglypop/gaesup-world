# Boilerplate Domain API Reference

## 개요

Boilerplate Domain은 모든 도메인의 기반이 되는 재사용 가능한 아키텍처 패턴을 제공합니다. 이 API 가이드는 새로운 도메인을 구현하거나 기존 도메인을 확장할 때 필요한 모든 API를 다룹니다.

**경로**: `src/core/boilerplate/`

## 핵심 API

### AbstractBridge

모든 도메인 브릿지의 기반 클래스입니다.

```typescript
abstract class AbstractBridge<EngineType, SnapshotType, CommandType> {
  // 엔티티 관리
  register(id: string, ...args: unknown[]): void
  unregister(id: string): void
  getEngine(id: string): EngineType | undefined
  
  // 명령 실행
  execute(id: string, command: CommandType): void
  
  // 스냅샷 관리
  snapshot(id: string): Readonly<SnapshotType> | null
  getCachedSnapshot(id: string): Readonly<SnapshotType> | undefined
  getAllSnapshots(): Map<string, Readonly<SnapshotType>>
  
  // 구독/이벤트
  subscribe(listener: (snapshot: SnapshotType, id: string) => void): () => void
  notifyListeners(id: string): void
  
  // 이벤트 시스템
  on(type: BridgeEventType, handler: Function): () => void
  emit(event: BridgeEvent): void
  
  // 미들웨어
  use(middleware: BridgeMiddleware): void
  
  // 추상 메서드 (구현 필요)
  protected abstract buildEngine(id: string, ...args: unknown[]): EngineType | null
  protected abstract executeCommand(engine: EngineType, command: CommandType, id: string): void
  protected abstract createSnapshot(engine: EngineType, id: string): SnapshotType | null
}
```

### CoreBridge

AbstractBridge를 확장한 실제 구현 기반 클래스입니다.

```typescript
abstract class CoreBridge<EngineType, SnapshotType, CommandType> 
  extends AbstractBridge<EngineType, SnapshotType, CommandType> {
  
  constructor() // 자동으로 메트릭스와 이벤트 로깅 설정
}
```

### BridgeFactory

브릿지 인스턴스의 중앙 관리 팩토리입니다.

```typescript
class BridgeFactory {
  // 브릿지 생성/조회
  static create<T extends BridgeInstance>(domain: string): T | null
  static get<T extends BridgeInstance>(domain: string): T | null
  static has(domain: string): boolean
  
  // 등록된 도메인 관리
  static listDomains(): string[]
  static listActiveInstances(): string[]
  static getInstanceCount(): number
  
  // 초기화 및 정리
  static initialize(): void
  static dispose(): void
}
```

### BridgeRegistry

브릿지 클래스의 등록과 조회를 담당합니다.

```typescript
class BridgeRegistry {
  static register(domain: string, constructor: ServiceTarget): void
  static get(domain: string): ServiceTarget | undefined
  static list(): string[]
  static has(domain: string): boolean
  static clear(): void
}
```

## Hook APIs

### useManagedEntity

메인 팩토리 훅으로 모든 복잡성을 캡슐화합니다.

```typescript
function useManagedEntity<EngineType, SnapshotType, CommandType>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  ref: RefObject<EngineType>,
  options?: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>
): ManagedEntity<EngineType, SnapshotType, CommandType> | null

interface UseManagedEntityOptions<EngineType, SnapshotType, CommandType> {
  onInit?: (entity: ManagedEntity<EngineType, SnapshotType, CommandType>) => void
  onDispose?: () => void
  frameCallback?: () => void
  onRegister?: (engine: EngineType) => (() => void) | void
  onUnregister?: (engine: EngineType) => void
  dependencies?: React.DependencyList
  enabled?: boolean
  priority?: number
  throttle?: number
  skipWhenHidden?: boolean
}
```

### useBaseLifecycle

브릿지 등록/해제 생명주기를 관리합니다.

```typescript
function useBaseLifecycle<EngineType, SnapshotType, CommandType>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  engine: EngineType | null,
  options?: UseBaseLifecycleOptions<EngineType>
): void

interface UseBaseLifecycleOptions<EngineType> {
  onRegister?: (engine: EngineType) => (() => void) | void
  onUnregister?: (engine: EngineType) => void
  dependencies?: React.DependencyList
  enabled?: boolean
}
```

### useBaseFrame

프레임 루프 업데이트를 담당합니다.

```typescript
function useBaseFrame<EngineType, SnapshotType, CommandType>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  callback?: () => void,
  options?: UseBaseFrameOptions
): void

interface UseBaseFrameOptions {
  priority?: number
  enabled?: boolean
  throttle?: number
  skipWhenHidden?: boolean
}
```

### useBatchManagedEntities

여러 엔티티를 일괄 관리합니다.

```typescript
function useBatchManagedEntities<EngineType, SnapshotType, CommandType>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  entries: Array<{ id: string; ref: RefObject<EngineType> }>,
  options?: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>
): Array<ManagedEntity<EngineType, SnapshotType, CommandType> | null>
```

## Entity Management

### ManagedEntity

개별 엔티티의 생명주기와 상태를 관리합니다.

```typescript
class ManagedEntity<EngineType, SnapshotType, CommandType> {
  constructor(id: string, engine: EngineType, options?: ManagedEntityOptions)
  
  // 생명주기
  initialize(): void
  dispose(): void
  
  // 상태 관리
  execute(command: CommandType): void
  getSnapshot(): SnapshotType | null
  
  // 정보 조회
  getId(): string
  isActive(): boolean
  getEngine(): EngineType
}
```

### AbstractSystem

시스템 클래스의 기반을 제공합니다.

```typescript
abstract class AbstractSystem<StateType, MetricsType, OptionsType = {}, UpdateArgsType = {}> {
  constructor(
    initialState: StateType,
    initialMetrics: MetricsType,
    options?: OptionsType
  )
  
  // 상태 관리
  getState(): StateType
  setState(state: Partial<StateType>): void
  
  // 메트릭스
  getMetrics(): MetricsType
  updateMetrics(metrics: Partial<MetricsType>): void
  
  // 생명주기
  abstract update(args: UpdateArgsType): void
  dispose(): void
  
  // 이벤트
  addEventListener(event: string, handler: Function): void
  removeEventListener(event: string, handler: Function): void
  emit(event: string, data?: unknown): void
}
```

## Decorator APIs

### Bridge Decorators

```typescript
// 도메인 브릿지 등록
@DomainBridge(domain: string)

// 메트릭스 활성화
@EnableMetrics()

// 이벤트 로깅 활성화
@EnableEventLog()

// 디버그 로깅
@DebugLog()

// 성능 로깅
@PerformanceLog()
```

### Method Decorators

```typescript
// 명령 검증
@ValidateCommand()

// 스냅샷 로깅
@LogSnapshot()

// 스냅샷 캐싱
@CacheSnapshot(framesToCache: number)

// 성능 프로파일링
@Profile()

// 에러 처리
@HandleError()

// 호출 추적
@TrackCalls()

// 엔진 요구사항 확인
@RequireEngineById()
```

### System Decorators

```typescript
// 시스템 등록
@RegisterSystem(name: string)

// 런타임 관리
@ManageRuntime(options: { autoStart?: boolean })
```

## DI Container APIs

### DIContainer

의존성 주입 컨테이너입니다.

```typescript
class DIContainer {
  static getInstance(): DIContainer
  
  // 서비스 등록
  registerService<T>(token: ServiceToken, provider: ServiceProvider<T>): void
  registerSingleton<T>(token: ServiceToken, instance: T): void
  
  // 의존성 해결
  resolve<T>(token: ServiceToken): T
  resolveAll<T>(token: ServiceToken): T[]
  
  // 프로퍼티 주입
  injectProperties(target: object): void
  
  // 컨테이너 관리
  clear(): void
  has(token: ServiceToken): boolean
}
```

### Autowired Decorator

```typescript
// 자동 의존성 주입
@Autowired(token?: ServiceToken)
```

## Type Definitions

### 핵심 타입들

```typescript
// 기본 인터페이스
interface IDisposable {
  dispose(): void
}

// 브릿지 이벤트
interface BridgeEvent<EngineType, SnapshotType, CommandType> {
  type: BridgeEventType
  id: string
  timestamp: number
  data?: {
    engine?: EngineType
    snapshot?: SnapshotType
    command?: CommandType
  }
}

type BridgeEventType = 'register' | 'unregister' | 'execute' | 'snapshot'

// 미들웨어
type BridgeMiddleware<EngineType, SnapshotType, CommandType> = (
  event: BridgeEvent<EngineType, SnapshotType, CommandType>,
  next: () => void
) => void

// 서비스 토큰
type ServiceToken = string | symbol | Function

// 서비스 제공자
type ServiceProvider<T = unknown> = () => T

// 생성자 타입
type Constructor<T = {}> = new (...args: any[]) => T
```

## 사용 예제

### 1. 새로운 도메인 브릿지 생성

```typescript
// 1. 타입 정의
interface MyEngineType extends IDisposable {
  performAction(data: any): void
  getState(): MyStateType
}

interface MySnapshotType {
  state: MyStateType
  metrics: MyMetricsType
}

interface MyCommandType {
  type: 'action' | 'reset'
  data?: any
}

// 2. 브릿지 구현
@DomainBridge('myDomain')
@EnableMetrics()
export class MyDomainBridge extends CoreBridge<
  MyEngineType,
  MySnapshotType,
  MyCommandType
> {
  protected buildEngine(id: string, config: MyConfig): MyEngineType | null {
    return new MyEngine(config)
  }

  @ValidateCommand()
  protected executeCommand(
    engine: MyEngineType, 
    command: MyCommandType, 
    id: string
  ): void {
    switch (command.type) {
      case 'action':
        engine.performAction(command.data)
        break
      case 'reset':
        engine.reset()
        break
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16)
  protected createSnapshot(engine: MyEngineType, id: string): MySnapshotType {
    return {
      state: engine.getState(),
      metrics: engine.getMetrics()
    }
  }
}
```

### 2. 도메인 훅 생성

```typescript
export function useMyDomain(id: string, config: MyConfig) {
  const ref = useRef<MyEngineType>(null)
  const bridge = useMemo(() => BridgeFactory.get<MyDomainBridge>('myDomain'), [])
  
  const entity = useManagedEntity(bridge, id, ref, {
    onInit: (entity) => {
      console.log('Entity initialized:', entity.getId())
    },
    frameCallback: () => {
      // 매 프레임 커스텀 로직
    },
    throttle: 16 // 60fps 제한
  })

  const performAction = useCallback((data: any) => {
    entity?.execute({ type: 'action', data })
  }, [entity])

  const reset = useCallback(() => {
    entity?.execute({ type: 'reset' })
  }, [entity])

  return {
    entity,
    performAction,
    reset,
    snapshot: entity?.getSnapshot(),
    isActive: entity?.isActive() ?? false
  }
}
```

### 3. 컴포넌트 사용

```typescript
function MyComponent() {
  const myDomain = useMyDomain('entity-1', { setting: 'value' })
  
  if (!myDomain.entity) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <button onClick={() => myDomain.performAction({ value: 42 })}>
        Perform Action
      </button>
      <button onClick={myDomain.reset}>
        Reset
      </button>
      <div>
        Status: {myDomain.isActive ? 'Active' : 'Inactive'}
      </div>
      <div>
        State: {JSON.stringify(myDomain.snapshot)}
      </div>
    </div>
  )
}
```

### 4. 시스템 클래스 구현

```typescript
@RegisterSystem('mySystem')
@ManageRuntime({ autoStart: false })
export class MySystem extends AbstractSystem<
  MyStateType,
  MyMetricsType,
  MyOptionsType,
  MyUpdateArgsType
> {
  @Autowired('logger')
  private logger!: Logger

  constructor(options: MyOptionsType) {
    super(
      initialState,
      initialMetrics,
      options
    )
  }

  @Profile()
  update(args: MyUpdateArgsType): void {
    // 시스템 업데이트 로직
    this.setState({
      lastUpdate: Date.now()
    })

    this.updateMetrics({
      updateCount: this.getMetrics().updateCount + 1
    })

    this.emit('updated', args)
  }

  @HandleError()
  performComplexOperation(): void {
    // 복잡한 작업
  }
}
```

## 고급 사용법

### 커스텀 데코레이터 생성

```typescript
export function ValidateInput(validator: (input: any) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = function (...args: unknown[]) {
      const input = args[0]
      if (!validator(input)) {
        throw new Error(`Invalid input for ${propertyKey}`)
      }
      return originalMethod.apply(this, args)
    }
  }
}

// 사용
class MyBridge extends CoreBridge {
  @ValidateInput((cmd) => cmd && typeof cmd.type === 'string')
  protected executeCommand(engine: any, command: any): void {
    // 검증된 명령 처리
  }
}
```

### 미들웨어 구현

```typescript
const loggingMiddleware: BridgeMiddleware<any, any, any> = (event, next) => {
  console.log(`[${event.type}] ${event.id} at ${new Date(event.timestamp).toISOString()}`)
  next()
}

const performanceMiddleware: BridgeMiddleware<any, any, any> = (event, next) => {
  const start = performance.now()
  next()
  const end = performance.now()
  console.log(`Event ${event.type} took ${end - start}ms`)
}

// 브릿지에 미들웨어 추가
bridge.use(loggingMiddleware)
bridge.use(performanceMiddleware)
```

### 배치 처리

```typescript
function useMultipleEntities(configs: EntityConfig[]) {
  const refs = configs.map(() => useRef(null))
  const bridge = useMemo(() => BridgeFactory.get('myDomain'), [])
  
  const entities = useBatchManagedEntities(
    bridge,
    configs.map((config, index) => ({
      id: config.id,
      ref: refs[index]
    })),
    {
      frameCallback: () => {
        // 모든 엔티티에 대한 일괄 처리
      }
    }
  )

  return entities
}
```

## 성능 최적화

### 1. 스냅샷 캐싱

```typescript
@CacheSnapshot(60) // 1초간 캐시 (60fps 기준)
protected createSnapshot(engine: MyEngineType): MySnapshotType {
  // 비용이 큰 계산
  return expensiveCalculation(engine)
}
```

### 2. 프레임 스로틀링

```typescript
const entity = useManagedEntity(bridge, id, ref, {
  throttle: 33, // 30fps로 제한
  skipWhenHidden: true // 숨겨진 상태에서 스킵
})
```

### 3. 조건부 활성화

```typescript
const entity = useManagedEntity(bridge, id, ref, {
  enabled: isVisible && isActive,
  dependencies: [isVisible, isActive]
})
```

## 에러 처리

### 1. 브릿지 레벨 에러 처리

```typescript
@HandleError()
export class MyBridge extends CoreBridge {
  @HandleError()
  protected executeCommand(engine: any, command: any): void {
    // 에러가 발생해도 자동으로 처리됨
    riskyOperation()
  }
}
```

### 2. 훅 레벨 에러 처리

```typescript
function useMyDomain(id: string) {
  const [error, setError] = useState<Error | null>(null)
  
  const entity = useManagedEntity(bridge, id, ref, {
    onInit: (entity) => {
      setError(null)
    },
    onDispose: () => {
      setError(null)
    }
  })

  const safeExecute = useCallback((command: any) => {
    try {
      entity?.execute(command)
      setError(null)
    } catch (err) {
      setError(err as Error)
    }
  }, [entity])

  return { entity, error, execute: safeExecute }
}
```

이 API 가이드는 Boilerplate Domain의 모든 기능을 체계적으로 설명하며, 새로운 도메인 구현 시 참고할 수 있는 완전한 레퍼런스를 제공합니다. 