# 보일러플레이트 아키텍처

## 개요

`src/core/boilerplate`는 여러 도메인에서 공통으로 사용하는 기반 계층입니다. 브리지 패턴, 엔티티 래퍼, 공통 훅, 데코레이터, 간단한 DI를 제공하며, 각 도메인이 같은 방식으로 시스템을 구성할 수 있게 도와줍니다.

이 폴더는 특정 기능 도메인이 아니라 “도메인을 만드는 방식”을 제공하는 인프라 계층에 가깝습니다.

## 관련 경로

- `src/core/boilerplate/bridge/`
- `src/core/boilerplate/entity/`
- `src/core/boilerplate/hooks/`
- `src/core/boilerplate/decorators/`
- `src/core/boilerplate/di/`
- `src/core/boilerplate/types/`

## 주요 구성 요소

### 브리지 계층

대표 파일:

- `AbstractBridge.ts`
- `CoreBridge.ts`
- `BridgeFactory.ts`
- `BridgeRegistry.ts`

#### `AbstractBridge`

모든 브리지의 기반 클래스입니다.

주요 책임:

- 엔진 등록/해제
- 명령 실행
- snapshot 생성
- snapshot 캐시 유지
- 리스너 구독/알림
- 이벤트 핸들러와 미들웨어 체인 지원

즉, 각 도메인 브리지는 이 클래스를 상속해서 `buildEngine`, `executeCommand`, `createSnapshot`만 구현하면 됩니다.

#### `CoreBridge`

여러 도메인 브리지에서 공통으로 쓰는 상위 브리지 구현입니다. `AbstractBridge`를 기반으로 더 구체적인 편의 기능을 제공합니다.

#### `BridgeFactory`

도메인 이름으로 브리지를 생성하거나 가져오는 팩토리입니다.

예:

- `BridgeFactory.getOrCreate('animation')`
- `BridgeFactory.getOrCreate('world')`

즉, 도메인 간 연결 지점을 문자열 도메인 키 기반으로 관리합니다.

#### `BridgeRegistry`

등록 가능한 브리지 메타데이터와 생성 흐름을 유지하는 레지스트리입니다.

### 엔티티 계층

대표 파일:

- `ManagedEntity.ts`
- `AbstractSystem.ts`
- `BaseSystem.ts`
- `SystemRegistry.ts`

#### `ManagedEntity`

브리지와 함께 동작하는 관리형 엔티티 래퍼입니다.

역할:

- 엔티티 초기화
- snapshot 접근
- 명령 실행
- 정리(dispose)

즉, React 쪽에서는 복잡한 브리지 직접 호출 대신 `ManagedEntity` 수준의 추상화를 사용할 수 있습니다.

#### `AbstractSystem`

공통 시스템 기반 클래스입니다. 여러 시스템이 공통 생명주기와 메트릭 구조를 갖도록 도와줍니다.

#### `BaseSystem`

가장 기본적인 시스템 인터페이스 계층입니다.

#### `SystemRegistry`

도메인 시스템을 등록하고 조회하는 저장소입니다.

### 공통 훅 계층

대표 파일:

- `useManagedEntity.ts`
- `useBaseLifecycle.ts`
- `useBaseFrame.ts`
- `useEntity.ts`
- `useEntityLifecycle.ts`
- `useCollisionHandler.ts`

#### `useManagedEntity`

실전에서 가장 핵심적인 공통 훅입니다.

주요 역할:

- `ManagedEntity` 생성
- DI 주입
- 초기화/정리 훅 실행
- `useBaseLifecycle` 연결
- `useBaseFrame` 연결

즉, 브리지 기반 엔티티를 React 컴포넌트 안에서 가장 쉽게 붙이는 진입점입니다.

#### `useBaseLifecycle`

브리지 등록/해제를 컴포넌트 생명주기에 맞춰 연결합니다.

#### `useBaseFrame`

프레임 루프 안에서 브리지 갱신 및 콜백 연결을 담당합니다.

### 데코레이터 계층

대표 파일:

- `system.ts`
- `bridge.ts`
- `monitoring.ts`
- `advanced.ts`
- `decorators/blueprint/*`

주요 목적:

- 도메인 브리지 등록
- 시스템 런타임 제어
- 프로파일링
- 이벤트 로깅
- 명령 검증
- snapshot 캐싱

실제 코드에서 자주 보이는 데코레이터 예:

- `@DomainBridge(...)`
- `@ManageRuntime(...)`
- `@EnableMetrics()`
- `@EnableEventLog()`
- `@ValidateCommand()`
- `@Profile()`

### DI 계층

대표 파일:

- `container.ts`
- `Inject.ts`
- `Autowired.ts`
- `Service.ts`

이 계층은 매우 무거운 프레임워크 수준 DI보다는, 도메인 시스템에 공통 서비스나 의존성을 넣는 용도의 가벼운 컨테이너에 가깝습니다.

예를 들어 `MotionBridge`는 `DIContainer.getInstance().injectProperties(system)` 형태로 시스템 인스턴스에 의존성을 주입합니다.

## 동작 흐름

보일러플레이트 계층의 대표 흐름은 아래와 같습니다.

1. 도메인 시스템이 `AbstractSystem` 계열을 상속합니다.
2. 도메인 브리지가 `AbstractBridge` 또는 `CoreBridge`를 상속합니다.
3. 데코레이터로 도메인 이름과 런타임 동작을 등록합니다.
4. React 훅은 `BridgeFactory`를 통해 브리지를 가져옵니다.
5. `useManagedEntity` 같은 공통 훅이 엔티티 초기화와 생명주기를 연결합니다.
6. 프레임 루프와 snapshot 구독을 통해 UI/store와 시스템이 동기화됩니다.

## 현재 강점

- 여러 도메인이 같은 패턴으로 확장될 수 있습니다.
- 브리지, 시스템, 훅, DI가 공통 구조를 공유합니다.
- 데코레이터 기반으로 도메인 등록과 관찰 로직을 줄일 수 있습니다.
- snapshot 기반 구조라 디버그와 상태 동기화에 유리합니다.

## 현재 한계

- 처음 읽는 사람에게는 추상화 레벨이 높아 진입 장벽이 있습니다.
- 데코레이터와 DI, 브리지 패턴이 동시에 들어가서 복잡도가 올라갑니다.
- 일부 도메인에서는 이 기반 계층 위에 별도 패턴이 더 얹혀 있어 추적 비용이 큽니다.

## 사용 예시 관점

도메인 브리지를 직접 다루는 기본 흐름은 아래처럼 볼 수 있습니다.

```ts
const bridge = BridgeFactory.getOrCreate('animation');
bridge?.execute('character', { type: 'play', animation: 'run' });
```

React 쪽에서는 보통 더 고수준 훅을 통해 사용합니다.

```tsx
const entity = useManagedEntity(bridge, id, ref, {
  onInit: () => {
    // entity init
  },
});
```

## 함께 보면 좋은 파일

- `src/core/boilerplate/bridge/AbstractBridge.ts`
- `src/core/boilerplate/bridge/BridgeFactory.ts`
- `src/core/boilerplate/entity/ManagedEntity.ts`
- `src/core/boilerplate/entity/AbstractSystem.ts`
- `src/core/boilerplate/hooks/useManagedEntity.ts`
- `src/core/boilerplate/hooks/useBaseLifecycle.ts`
- `src/core/boilerplate/hooks/useBaseFrame.ts`
- `src/core/boilerplate/decorators/index.ts`
- `src/core/boilerplate/di/container.ts`
