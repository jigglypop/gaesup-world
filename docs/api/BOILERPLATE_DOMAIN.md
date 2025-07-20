# Boilerplate Domain - 기반 아키텍처 시스템

## 개요

Boilerplate Domain은 Gaesup World의 **모든 도메인이 공통으로 사용하는 재사용 가능한 아키텍처 패턴**을 제공합니다. 이 도메인은 특정 기능에 대한 지식이 전혀 없으며, 순수하게 구조적인 패턴만을 정의합니다.

**위치**: `src/core/boilerplate/`

## 핵심 목표

1. **도메인 독립성**: 특정 도메인(모션, 애니메이션 등)에 대한 지식 없음
2. **재사용성**: 어떤 도메인이든 이 "틀"을 사용하여 구현 가능
3. **최소한의 코드**: 개발자가 반복 작성할 코드 최소화
4. **성능 최적화**: 프레임 루프와 React 렌더링 분리

## 아키텍처 구조

```
src/core/boilerplate/
├── bridge/              # 브릿지 패턴 구현
│   ├── AbstractBridge.ts      # 추상 브릿지 클래스
│   ├── CoreBridge.ts          # 확장된 브릿지 클래스
│   ├── BridgeFactory.ts       # 브릿지 팩토리
│   └── BridgeRegistry.ts      # 브릿지 등록 시스템
├── entity/              # 엔티티 관리
│   ├── ManagedEntity.ts       # 관리 엔티티 클래스
│   ├── AbstractSystem.ts     # 추상 시스템 클래스
│   └── BaseSystem.ts         # 기본 시스템 클래스
├── hooks/               # 기반 훅들
│   ├── useManagedEntity.ts    # 팩토리 훅
│   ├── useBaseLifecycle.ts   # 생명주기 훅
│   ├── useBaseFrame.ts       # 프레임 훅
│   └── useEntity.ts          # 통합 엔티티 훅
├── decorators/          # 데코레이터 시스템
│   ├── index.ts              # 메인 데코레이터들
│   ├── advanced.ts           # 고급 데코레이터들
│   ├── bridge.ts             # 브릿지 데코레이터들
│   ├── monitoring.ts         # 모니터링 데코레이터들
│   └── system.ts             # 시스템 데코레이터들
├── di/                  # 의존성 주입
│   ├── container.ts          # DI 컨테이너
│   ├── Autowired.ts          # 자동 주입 데코레이터
│   └── ServiceLocator.ts     # 서비스 로케이터
└── types/               # 타입 정의
    ├── index.ts              # 기본 타입들
    └── reflect-metadata.d.ts # 메타데이터 타입
```

## 핵심 구성요소

### 1. AbstractBridge - 추상 브릿지 클래스

**파일**: `src/core/boilerplate/bridge/AbstractBridge.ts`

모든 도메인 브릿지의 기반이 되는 추상 클래스입니다.

```typescript
export abstract class AbstractBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> {
  protected engines: Map<string, EngineType>;
  protected snapshots: Map<string, Readonly<SnapshotType>>;
  private eventListeners: Set<(snapshot: SnapshotType, id: string) => void>;
  private eventHandlers: Map<BridgeEventType, Set<Function>>;
  private middlewares: BridgeMiddleware<EngineType, SnapshotType, CommandType>[];

  // 공통 기능
  register(id: string, ...args: unknown[]): void
  unregister(id: string): void
  execute(id: string, command: CommandType): void
  snapshot(id: string): Readonly<SnapshotType> | null
  subscribe(listener: Function): () => void
  notifyListeners(id: string): void

  // 각 도메인에서 구현해야 할 추상 메서드
  protected abstract buildEngine(id: string, ...args: unknown[]): EngineType | null;
  protected abstract executeCommand(engine: EngineType, command: CommandType, id: string): void;
  protected abstract createSnapshot(engine: EngineType, id: string): SnapshotType | null;
}
```

**주요 기능**:
- **엔티티 등록/해제**: `register()`, `unregister()`
- **명령 실행**: `execute()`
- **상태 스냅샷**: `snapshot()`, `getCachedSnapshot()`
- **이벤트 시스템**: `subscribe()`, `notifyListeners()`
- **미들웨어 지원**: `use()`, 체인 방식 처리
- **이벤트 핸들링**: `on()`, `emit()`

### 2. CoreBridge - 확장된 브릿지 클래스

**파일**: `src/core/boilerplate/bridge/CoreBridge.ts`

`AbstractBridge`를 확장하여 메트릭스와 이벤트 로깅 기능을 추가합니다.

```typescript
export abstract class CoreBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> extends AbstractBridge<EngineType, SnapshotType, CommandType> {
  constructor() {
    super();
    this.processMetrics();
    this.processEventLog();
  }

  private processMetrics(): void {
    // @EnableMetrics 데코레이터 처리
  }

  private processEventLog(): void {
    // @EnableEventLog 데코레이터 처리
  }
}
```

### 3. ManagedEntity - 관리 엔티티 클래스

**파일**: `src/core/boilerplate/entity/ManagedEntity.ts`

개별 엔티티의 생명주기와 브릿지 통신을 관리하는 클래스입니다.

```typescript
export class ManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
> {
  private id: string;
  private engine: EngineType;
  private bridge: AbstractBridge<EngineType, SnapshotType, CommandType>;
  private isInitialized: boolean = false;

  constructor(
    id: string,
    engine: EngineType,
    options: ManagedEntityOptions = {}
  ) {
    this.id = id;
    this.engine = engine;
    this.bridge = options.bridge;
  }

  // 생명주기 메서드
  initialize(): void
  dispose(): void

  // 브릿지 통신
  execute(command: CommandType): void
  getSnapshot(): SnapshotType | null

  // 상태 확인
  isActive(): boolean
  getId(): string
}
```

### 4. useManagedEntity - 팩토리 훅

**파일**: `src/core/boilerplate/hooks/useManagedEntity.ts`

모든 복잡한 로직을 캡슐화한 **메인 팩토리 훅**입니다.

```typescript
export function useManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  ref: RefObject<EngineType>,
  options: UseManagedEntityOptions = {}
): ManagedEntity<EngineType, SnapshotType, CommandType> | null {
  
  // 1. ManagedEntity 인스턴스 생성
  const [entity, setEntity] = useState<ManagedEntity | null>(null);
  
  // 2. 의존성 주입
  useEffect(() => {
    if (!bridge || !ref.current || !enabled) return;
    
    const managedEntity = new ManagedEntity(id, ref.current, entityOptions);
    DIContainer.getInstance().injectProperties(managedEntity);
    managedEntity.initialize();
    
    setEntity(managedEntity);
    
    return () => {
      managedEntity.dispose();
      setEntity(null);
    };
  }, [bridge, id, ref, enabled]);

  // 3. 자동으로 생명주기와 프레임 루프 연결
  useBaseLifecycle(bridge, id, ref.current, lifecycleOptions);
  useBaseFrame(bridge, id, frameCallback, frameOptions);
  
  return entity;
}
```

### 5. useBaseLifecycle - 생명주기 훅

**파일**: `src/core/boilerplate/hooks/useBaseLifecycle.ts`

컴포넌트 마운트/언마운트 시 브릿지 등록/해제를 자동화합니다.

```typescript
export function useBaseLifecycle<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  engine: EngineType | null,
  options: UseBaseLifecycleOptions<EngineType> = {}
) {
  const { onRegister, onUnregister, dependencies = [], enabled = true } = options;

  useEffect(() => {
    if (!bridge || !engine || !enabled) return;
    
    // 브릿지에 엔티티 등록
    bridge.register(id, engine);
    
    // 커스텀 등록 콜백
    if (onRegister) {
      const cleanup = onRegister(engine);
      if (typeof cleanup === 'function') {
        cleanupRef.current = cleanup;
      }
    }

    return () => {
      // 정리 작업
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (onUnregister) {
        onUnregister(engine);
      }
      bridge.unregister(id);
    };
  }, [bridge, id, engine, enabled, ...dependencies]);
}
```

### 6. useBaseFrame - 프레임 훅

**파일**: `src/core/boilerplate/hooks/useBaseFrame.ts`

매 프레임마다 브릿지 상태를 업데이트합니다.

```typescript
export function useBaseFrame<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  callback?: () => void,
  options: UseBaseFrameOptions = {}
) {
  const { 
    priority = 0, 
    enabled = true, 
    throttle = 0,
    skipWhenHidden = true 
  } = options;

  const frameHandler = useCallback((state: RootState, delta: number) => {
    if (!enabled || !bridge) return;
    if (skipWhenHidden && document.hidden) return;
    
    // 스로틀링 처리
    if (throttle > 0) {
      const now = performance.now();
      if (now - lastUpdateTime.current < throttle) return;
      lastUpdateTime.current = now;
    }
    
    // 브릿지 상태 업데이트 알림
    bridge.notifyListeners(id);
    
    if (callback) {
      callback();
    }
  }, [bridge, id, callback, enabled, throttle, skipWhenHidden]);

  useFrame(frameHandler, priority);
}
```

## 브릿지 시스템

### BridgeFactory - 브릿지 팩토리

**파일**: `src/core/boilerplate/bridge/BridgeFactory.ts`

모든 브릿지 인스턴스를 중앙에서 관리합니다.

```typescript
export class BridgeFactory {
  private static instances = new Map<string, BridgeInstance>();

  static create<T extends BridgeInstance>(domain: string): T | null {
    const existing = BridgeFactory.instances.get(domain);
    if (existing) {
      return existing as T;
    }

    const BridgeClass = BridgeRegistry.get(domain);
    if (!BridgeClass) {
      logger.error(`No bridge registered for domain: ${domain}`);
      return null;
    }

    try {
      const instance = DIContainer.getInstance().resolve(BridgeClass) as T;
      BridgeFactory.instances.set(domain, instance);
      return instance;
    } catch (error) {
      logger.error(`Failed to create bridge for domain: ${domain}`, error);
      return null;
    }
  }

  static get<T extends BridgeInstance>(domain: string): T | null
  static has(domain: string): boolean
  static listDomains(): string[]
  static getInstanceCount(): number
}
```

### BridgeRegistry - 브릿지 등록 시스템

**파일**: `src/core/boilerplate/bridge/BridgeRegistry.ts`

브릿지 클래스들의 등록과 조회를 담당합니다.

```typescript
export class BridgeRegistry {
  private static registry = new Map<string, ServiceTarget>();

  static register(domain: string, constructor: ServiceTarget): void {
    this.registry.set(domain, constructor);
  }

  static get(domain: string): ServiceTarget | undefined {
    return this.registry.get(domain);
  }

  static list(): string[] {
    return Array.from(this.registry.keys());
  }
}
```

## 데코레이터 시스템

### 주요 데코레이터들

**파일**: `src/core/boilerplate/decorators/index.ts`

```typescript
// 도메인 브릿지 등록
@DomainBridge('motion')
export class MotionBridge extends CoreBridge { }

// 메트릭스 활성화
@EnableMetrics()
export class MotionBridge { }

// 이벤트 로깅 활성화
@EnableEventLog()
export class MotionBridge { }

// 명령 검증
@ValidateCommand()
protected executeCommand() { }

// 스냅샷 로깅
@LogSnapshot()
protected createSnapshot() { }

// 스냅샷 캐싱
@CacheSnapshot(16) // 60fps 캐싱
protected createSnapshot() { }

// 성능 프로파일링
@Profile()
public someMethod() { }

// 에러 처리
@HandleError()
public someMethod() { }
```

### 모니터링 데코레이터들

**파일**: `src/core/boilerplate/decorators/monitoring.ts`

```typescript
// 성능 프로파일링
export function Profile() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      console.log(`${propertyKey} took ${end - start} milliseconds`);
      return result;
    };
  };
}

// 에러 처리
export function HandleError() { }

// 호출 추적
export function TrackCalls() { }

// 스냅샷 로깅
export function LogSnapshot() { }
```

## 의존성 주입 (DI) 시스템

### DIContainer

**파일**: `src/core/boilerplate/di/container.ts`

```typescript
export class DIContainer {
  private static instance: DIContainer;
  private services = new Map<ServiceToken, ServiceProvider>();
  private instances = new Map<ServiceToken, unknown>();

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  registerService<T>(token: ServiceToken, provider: ServiceProvider<T>): void {
    this.services.set(token, provider);
  }

  resolve<T>(token: ServiceToken): T {
    // 싱글톤 인스턴스 확인
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    // 새 인스턴스 생성
    const provider = this.services.get(token);
    if (!provider) {
      throw new Error(`Service not registered: ${token.toString()}`);
    }

    const instance = this.createInstance(provider);
    this.instances.set(token, instance);
    return instance as T;
  }

  injectProperties(target: object): void {
    // @Autowired 데코레이터로 표시된 프로퍼티들 자동 주입
  }
}
```

### Autowired 데코레이터

**파일**: `src/core/boilerplate/di/Autowired.ts`

```typescript
export function Autowired(token?: ServiceToken) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('autowired', token || propertyKey, target, propertyKey);
  };
}
```

## 타입 시스템

### 핵심 타입들

**파일**: `src/core/boilerplate/types/index.ts`

```typescript
// 기본 인터페이스들
export interface IDisposable {
  dispose(): void;
}

export interface BridgeEvent<EngineType, SnapshotType, CommandType> {
  type: BridgeEventType;
  id: string;
  timestamp: number;
  data?: {
    engine?: EngineType;
    snapshot?: SnapshotType;
    command?: CommandType;
  };
}

export type BridgeEventType = 'register' | 'unregister' | 'execute' | 'snapshot';

export type BridgeMiddleware<EngineType, SnapshotType, CommandType> = (
  event: BridgeEvent<EngineType, SnapshotType, CommandType>,
  next: () => void
) => void;

// 훅 옵션들
export interface UseManagedEntityOptions<EngineType, SnapshotType, CommandType> {
  onInit?: (entity: ManagedEntity<EngineType, SnapshotType, CommandType>) => void;
  onDispose?: () => void;
  frameCallback?: () => void;
  onRegister?: (engine: EngineType) => (() => void) | void;
  onUnregister?: (engine: EngineType) => void;
  dependencies?: React.DependencyList;
  enabled?: boolean;
  priority?: number;
  throttle?: number;
  skipWhenHidden?: boolean;
}

export interface UseBaseFrameOptions {
  priority?: number;
  enabled?: boolean;
  throttle?: number;
  skipWhenHidden?: boolean;
}

export interface UseBaseLifecycleOptions<EngineType> {
  onRegister?: (engine: EngineType) => (() => void) | void;
  onUnregister?: (engine: EngineType) => void;
  dependencies?: React.DependencyList;
  enabled?: boolean;
}
```

## 사용 패턴

### 1. 새로운 도메인 브릿지 생성

```typescript
// 1. 브릿지 클래스 정의
@DomainBridge('myDomain')
@EnableMetrics()
export class MyDomainBridge extends CoreBridge<
  MyEngineType,
  MySnapshotType,
  MyCommandType
> {
  protected buildEngine(id: string, config: MyConfig): MyEngineType | null {
    return new MyEngine(config);
  }

  @ValidateCommand()
  protected executeCommand(engine: MyEngineType, command: MyCommandType): void {
    switch (command.type) {
      case 'myAction':
        engine.performAction(command.data);
        break;
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16)
  protected createSnapshot(engine: MyEngineType): MySnapshotType {
    return {
      state: engine.getState(),
      metrics: engine.getMetrics()
    };
  }
}
```

### 2. 도메인 훅 생성

```typescript
export function useMyDomain(id: string, config: MyConfig) {
  const ref = useRef<MyEngineType>(null);
  const bridge = useMemo(() => BridgeFactory.get<MyDomainBridge>('myDomain'), []);
  
  const entity = useManagedEntity(bridge, id, ref, {
    onInit: (entity) => {
      console.log('Entity initialized:', entity.getId());
    },
    frameCallback: () => {
      // 매 프레임 커스텀 로직
    }
  });

  const performAction = useCallback((data: ActionData) => {
    entity?.execute({ type: 'myAction', data });
  }, [entity]);

  return {
    entity,
    performAction,
    snapshot: entity?.getSnapshot()
  };
}
```

### 3. 컴포넌트에서 사용

```typescript
function MyComponent() {
  const myDomain = useMyDomain('entity-1', { setting: 'value' });
  
  return (
    <div>
      <button onClick={() => myDomain.performAction({ value: 42 })}>
        Perform Action
      </button>
      <div>State: {JSON.stringify(myDomain.snapshot)}</div>
    </div>
  );
}
```

## 초기화 과정

**파일**: `src/core/initializeBridges.ts`

```typescript
// 모든 브릿지 import (데코레이터 실행 보장)
import './motions/bridge/MotionBridge';
import './motions/bridge/PhysicsBridge';
import './world/bridge/WorldBridge';
import './animation/bridge/AnimationBridge';

// 등록된 모든 도메인 브릿지 생성
const domains = BridgeFactory.listDomains();
domains.forEach(domain => {
  if (!BridgeFactory.has(domain)) {
    const bridge = BridgeFactory.create(domain);
    if (bridge) {
      logger.log(`${domain} bridge created successfully`);
    }
  }
});
```

## 성능 최적화

1. **지연 생성**: 브릿지는 필요할 때만 생성
2. **싱글톤 패턴**: 도메인당 하나의 브릿지 인스턴스
3. **스냅샷 캐싱**: `@CacheSnapshot` 데코레이터로 중복 계산 방지
4. **스로틀링**: `useBaseFrame`에서 프레임 제한 지원
5. **미들웨어 체인**: 효율적인 이벤트 처리

## 확장 가이드

### 새로운 데코레이터 추가

```typescript
// src/core/boilerplate/decorators/custom.ts
export function MyCustomDecorator(options: MyOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 커스텀 로직 구현
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      // 전처리
      const result = originalMethod.apply(this, args);
      // 후처리
      return result;
    };
  };
}
```

### 새로운 시스템 클래스 추가

```typescript
export abstract class MyAbstractSystem<
  StateType,
  MetricsType,
  OptionsType = {},
  UpdateArgsType = {}
> extends AbstractSystem<StateType, MetricsType, OptionsType, UpdateArgsType> {
  // 커스텀 공통 로직
}
```

이 Boilerplate Domain은 전체 프로젝트의 견고한 기반을 제공하며, 새로운 도메인 추가 시 최소한의 코드로 강력한 기능을 구현할 수 있게 해줍니다. 