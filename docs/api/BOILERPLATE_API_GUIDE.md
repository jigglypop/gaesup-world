# 보일러플레이트 API 가이드

## 1. 소개

본 보일러플레이트는 `react-three-fiber` 환경에서 모듈화되고, 테스트 가능하며, 각 기능이 분리된(decoupled) 견고한 애플리케이션을 구축하기 위한 기반을 제공합니다.

핵심 아키텍처 원칙은 다음과 같습니다.

- **의존성 주입 (Dependency Injection)**: 클래스 간의 의존성을 외부에서 주입하여 결합도를 낮추고 유연성을 높입니다.
- **브릿지 패턴 (Bridge Pattern)**: 핵심 로직(Core)과 뷰(React) 레이어를 분리하여 독립적으로 개발하고 테스트할 수 있도록 합니다.
- **엔티티 기반 아키텍처**: `ManagedEntity`를 통해 3D 객체의 동작과 생명주기를 관리합니다.

---

## 2. 의존성 주입 (DI) 시스템

`DIContainer`는 서비스의 생성과 생명주기를 관리하는 싱글톤 컨테이너입니다. `@Service`, `@Inject`, `@Autowired` 데코레이터를 사용하여 클래스와 의존성을 자동으로 관리할 수 있습니다.

### `@Service(options?: ServiceOptions)`

클래스를 DI 컨테이너가 관리하는 서비스로 등록합니다.

- **`options`**:
  - `token: Token<unknown>`: 의존성 주입 시 사용할 커스텀 토큰(문자열 또는 심볼)을 지정합니다. 지정하지 않으면 클래스 자신이 토큰이 됩니다.
  - `singleton: boolean`: 싱글톤 여부를 결정합니다. (기본값: `true`)

**예시:**
```typescript
// 기본 서비스로 등록 (싱글톤)
@Service()
export class MyAwesomeService { /* ... */ }

// 커스텀 토큰과 팩토리 패턴(싱글톤 아님)으로 등록
@Service({ token: 'MyCustomToken', singleton: false })
export class MyFactoryService { /* ... */ }
```

### `@Inject(token: Token<unknown>)`

생성자 매개변수에 의존성을 주입할 때 사용합니다. 타입만으로 의존성을 특정할 수 없거나, 커스텀 토큰으로 등록된 서비스를 주입할 때 반드시 필요합니다.

**예시:**
```typescript
@Service()
export class ConsumerService {
  constructor(@Inject('MyCustomToken') private service: MyFactoryService) {}
}
```

### `@Autowired()`

클래스의 속성(property)에 의존성을 자동으로 주입합니다. 속성의 타입을 기반으로 DI 컨테이너에서 적절한 서비스를 찾아 주입합니다. DI 컨테이너가 직접 생성하지 않는 객체(예: `ManagedEntity`)에 의존성을 주입할 때 매우 유용합니다.

**예시:**
```typescript
export class MyEntity {
  @Autowired()
  private myService!: MyAwesomeService;
}
```

### 수동 의존성 주입

`DIContainer.getInstance().injectProperties(instance)`를 호출하여, DI 컨테이너 외부에서 생성된 인스턴스에 `@Autowired`로 명시된 의존성을 수동으로 주입할 수 있습니다.

---

## 3. 브릿지 (Bridge) 패턴

브릿지는 애니메이션, 카메라, 상호작용 등 특정 "도메인"의 핵심 로직과 React 컴포넌트 레이어를 분리하는 통신 채널 역할을 합니다.

### `@DomainBridge(domain: string)`

브릿지 구현 클래스에 사용하는 데코레이터입니다. `domain` 문자열을 고유 키로 사용하여 브릿지를 시스템에 등록하며, 해당 브릿지 클래스를 DI 컨테이너에 서비스로 자동 등록합니다.

**예시:**
```typescript
@DomainBridge('animation')
export class AnimationBridge extends AbstractBridge<AnimationEngine, AnimationState, AnimationCommand> {
  // 브릿지 로직 구현
}
```

### `AbstractBridge<Engine, Snapshot, Command>`

모든 브릿지가 상속받아야 하는 추상 클래스입니다. 도메인 로직을 관리하는 `Engine` 인스턴스들의 생명주기를 관리하고, 외부와 통신하는 표준화된 인터페이스를 제공합니다.

- **주요 메서드**:
  - `register(id, engine)`: 특정 ID를 가진 엔진 인스턴스를 브릿지에 등록합니다.
  - `unregister(id)`: 엔진 인스턴스를 등록 해제하고 소멸시킵니다.
  - `execute(id, command)`: 특정 엔진에 명령(command)을 전송합니다.
  - `snapshot(id)`: 특정 엔진의 현재 상태(snapshot)를 조회합니다.
  - `subscribe(listener)`: 상태 변경을 구독하여 실시간으로 업데이트를 받습니다.

### `BridgeFactory`

`BridgeFactory.get(domain)` 또는 `BridgeFactory.create(domain)`를 통해 도메인 이름을 사용하여 해당 브릿지의 싱글톤 인스턴스를 가져올 수 있습니다.

---

## 4. 엔티티 (Entity)

### `ManagedEntity<Engine, Snapshot, Command>`

`ManagedEntity`는 핵심 로직을 담고 있는 '엔진'(`THREE.Object3D` 등)을 감싸는 래퍼 클래스입니다. 커맨드 큐, 상태 캐싱, 생명주기 관리를 담당하며 React 훅 내부에서 사용되도록 설계되었습니다.

- `@Autowired`를 통해 `Bridge`와 같은 정적인 의존성을 주입받습니다.
- `id`, `engine`과 같은 동적인 의존성은 생성자를 통해 전달받습니다.
- `initialize()` 메서드를 통해 의존성 주입 후 초기화 로직을 수행합니다.

---

## 5. React 훅 (Hooks)

### `useManagedEntity(bridge, id, ref, options)`

`ManagedEntity`를 React 컴포넌트에서 사용하기 위한 핵심 훅입니다.

- `bridge`, `id`, 3D 객체의 `ref`, 그리고 추가 `options`를 인자로 받습니다.
- `ManagedEntity` 인스턴스의 생성, 의존성 주입(`injectProperties`), 초기화(`initialize`), 그리고 컴포넌트 언마운트 시 소멸(`dispose`)까지의 **전체 생명주기를 자동으로 관리**합니다.

**사용 예시:**
```tsx
import { useRef } from 'react';
import { useManagedEntity, BridgeFactory } from 'src/core/boilerplate';
import { AnimationBridge } from 'src/core/animation';
import * as THREE from 'three';

const MyAnimatedObject = ({ id }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const animationBridge = BridgeFactory.get<AnimationBridge>('animation');
  const entity = useManagedEntity(animationBridge, id, meshRef, {});

  // entity를 사용하여 커맨드 실행 등...
  // entity?.execute({ type: 'play', animation: 'walk' });

  return <mesh ref={meshRef} />;
}
```

---

## 6. 기타 유용한 데코레이터

`src/core/boilerplate/decorators/` 에서 제공하는 추가 데코레이터들입니다.

- `@Command(name: string)`: 브릿지 내에서 커맨드 패턴을 구현할 때 메서드에 사용합니다.
- `@Log()`: 메서드 호출과 반환 값을 `console.log`로 출력하여 디버깅을 돕습니다.
- `@Performance()`: 메서드의 실행 시간을 측정하여 `console.log`로 출력합니다.
- `@EnableEventLog()`: 브릿지 클래스에 사용하여 등록, 실행, 해제 등 주요 이벤트를 자동으로 로깅합니다. 