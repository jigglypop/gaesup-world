# Motion 도메인 리팩토링 계획

## 1. 현재 구조 분석

### 이미 구현된 강점
1. **Component 기반 구조**
   - MotionController, MotionDebugPanel 등 UI 컴포넌트
   - EntityWrapper로 엔티티 래핑
   - Teleport, RidingAnimation 등 기능별 분리

2. **레이어 아키텍처**
   ```
   src/core/motions/
   ├── core/        # 물리 엔진, 상태 관리
   ├── bridge/      # 레거시 연동
   ├── components/  # React 컴포넌트
   ├── hooks/       # 커스텀 훅
   └── behaviors/   # 물리 동작
   ```

3. **상태 관리 시스템**
   - StateEngine (싱글톤 패턴)
   - Zustand store 통합
   - Bridge 패턴으로 레거시 연동

4. **물리 시스템 통합**
   - Rapier 물리 엔진 통합 완료
   - PhysicsEngine 클래스로 캡슐화
   - behaviors 폴더에 모듈화된 동작

## 2. 즉시 가능한 리팩토링 (Phase 1)

### 2.1 Actor-Component 래퍼 구현
```typescript
// src/core/engine/actor/Actor.ts
export class Actor {
  protected components: Map<string, ActorComponent> = new Map();
  protected transform: Transform;
  
  constructor(public readonly id: string) {
    this.transform = new Transform();
  }
  
  addComponent<T extends ActorComponent>(
    ComponentClass: new (owner: Actor) => T,
    name: string
  ): T {
    const component = new ComponentClass(this);
    this.components.set(name, component);
    return component;
  }
  
  tick(deltaTime: number): void {
    this.components.forEach(component => {
      if (component.isActive) {
        component.tick(deltaTime);
      }
    });
  }
}

// 기존 Entity를 Actor로 래핑
export class MotionActor extends Actor {
  private legacyBridge: LegacyMotionBridge;
  
  constructor(id: string, physicsRef: RefObject<RapierRigidBody>) {
    super(id);
    
    // 기존 시스템 연결
    this.legacyBridge = this.addComponent(
      LegacyMotionBridge,
      "LegacyMotion"
    );
    this.legacyBridge.setPhysicsRef(physicsRef);
  }
}
```

### 2.2 기존 behaviors를 Component로 변환
```typescript
// src/core/motions/components/physics/GravityComponent.ts
import { GravityController } from '../../behaviors/applyGravity';

export class GravityComponent extends ActorComponent {
  private controller = new GravityController();
  private gravityScale = 1.0;
  
  tick(deltaTime: number): void {
    const physics = this.owner.getComponent<PhysicsComponent>("Physics");
    if (physics) {
      this.controller.applyGravity(
        physics.rigidBody,
        physics.physicsState
      );
    }
  }
  
  setGravityScale(scale: number): void {
    this.gravityScale = scale;
  }
}

// src/core/motions/components/physics/MovementComponent.ts
import { DirectionController } from '../../behaviors/updateDirection';
import { ImpulseController } from '../../behaviors/applyImpulse';

export class MovementComponent extends ActorComponent {
  private directionController = new DirectionController();
  private impulseController = new ImpulseController();
  
  private moveSpeed = 10.0;
  private jumpForce = 10.0;
  
  move(direction: Vector3): void {
    // 기존 updateDirection 로직 활용
    this.directionController.updateDirection(
      this.physicsState,
      'normal',
      this.calcProp
    );
  }
  
  jump(): void {
    // 기존 applyImpulse 로직 활용
    this.impulseController.applyJumpImpulse(
      this.rigidBodyRef,
      this.physicsState
    );
  }
}
```

### 2.3 StateEngine을 이벤트 기반으로 확장
```typescript
// src/core/motions/core/StateEngine.ts 확장
import { EventEmitter } from 'events';

export class StateEngine {
  private events = new EventEmitter();
  
  updateGameStates(updates: Partial<GameStatesType>): void {
    const prevState = { ...this.refs.gameStates };
    Object.assign(this.refs.gameStates, updates);
    
    // 이벤트 발생
    Object.keys(updates).forEach(key => {
      if (prevState[key] !== updates[key]) {
        this.events.emit(`state:${key}`, {
          prev: prevState[key],
          current: updates[key]
        });
      }
    });
  }
  
  on(event: string, listener: (...args: any[]) => void): void {
    this.events.on(event, listener);
  }
}
```

### 2.4 기존 hooks를 Actor 시스템과 연결
```typescript
// src/core/motions/hooks/useActor.ts
export function useActor(actorId: string) {
  const actorRef = useRef<MotionActor>();
  const physicsRef = usePhysics();
  
  useEffect(() => {
    if (physicsRef.current) {
      actorRef.current = new MotionActor(actorId, physicsRef);
      
      // 기존 컴포넌트 추가
      actorRef.current.addComponent(MovementComponent, "Movement");
      actorRef.current.addComponent(GravityComponent, "Gravity");
    }
    
    return () => {
      actorRef.current?.destroy();
    };
  }, [actorId]);
  
  return actorRef;
}
```

### 2.5 점진적 마이그레이션 전략
```typescript
// src/core/motions/bridge/LegacyMotionBridge.ts
export class LegacyMotionBridge extends ActorComponent {
  private physicsEngine: PhysicsEngine;
  private physicsRef?: RefObject<RapierRigidBody>;
  
  constructor(owner: Actor) {
    super(owner);
    this.physicsEngine = new PhysicsEngine();
  }
  
  tick(deltaTime: number): void {
    if (!this.physicsRef?.current) return;
    
    // 기존 PhysicsEngine.calculate 호출
    const calcProp = this.buildCalcProp();
    const physicsState = this.buildPhysicsState();
    
    this.physicsEngine.calculate(calcProp, physicsState);
  }
  
  private buildCalcProp(): PhysicsCalcProps {
    // 기존 calcProp 구성 로직
    return {
      rigidBodyRef: this.physicsRef!,
      // ... 나머지 속성들
    };
  }
}
```

## 3. 단계별 리팩토링 계획

### Phase 1: Actor 래퍼 구현 (1주)
- [x] 기본 Actor/Component 클래스 구현
- [ ] MotionActor로 기존 엔티티 래핑
- [ ] LegacyMotionBridge로 기존 로직 보존
- [ ] 기존 테스트 케이스 통과 확인

### Phase 2: Component 분리 (2주)
- [ ] GravityComponent 구현
- [ ] MovementComponent 구현
- [ ] PhysicsComponent 구현
- [ ] 기존 behaviors 재사용

### Phase 3: 이벤트 시스템 (1주)
- [ ] StateEngine 이벤트 추가
- [ ] Component 간 통신 구현
- [ ] 충돌 이벤트 시스템

### Phase 4: UI 통합 (1주)
- [ ] 기존 React 컴포넌트 유지
- [ ] Actor 시스템과 연결
- [ ] Debug 패널 업데이트

## 4. 기존 코드 보존 전략

### 4.1 Adapter Pattern
```typescript
// 기존 함수를 메서드로 래핑
class GravityAdapter {
  static toComponent(
    applyGravityFn: Function
  ): typeof ActorComponent {
    return class extends ActorComponent {
      tick(deltaTime: number): void {
        const physics = this.getPhysics();
        applyGravityFn(physics.rigidBody, physics.state);
      }
    };
  }
}
```

### 4.2 Progressive Enhancement
```typescript
// 기능 플래그로 점진적 전환
const FEATURE_FLAGS = {
  useActorSystem: false,
  useEventSystem: false,
  useNewPhysics: false
};

export function useMotion() {
  if (FEATURE_FLAGS.useActorSystem) {
    return useActorMotion();
  } else {
    return useLegacyMotion();
  }
}
```

### 4.3 호환성 레이어
```typescript
// 기존 API 유지
export class MotionAPI {
  static jump(entity: Entity | Actor): void {
    if (entity instanceof Actor) {
      entity.getComponent<MovementComponent>("Movement")?.jump();
    } else {
      // 레거시 방식
      legacyJump(entity);
    }
  }
}
```

## 5. 리팩토링 원칙

1. **기존 기능 보존**
   - 모든 기존 API 유지
   - 점진적 마이그레이션
   - 롤백 가능한 구조

2. **테스트 주도**
   - 기존 테스트 통과 필수
   - 새 기능은 새 테스트
   - 성능 벤치마크

3. **문서화**
   - 변경사항 즉시 문서화
   - 마이그레이션 가이드 제공
   - API 호환성 명시

## 6. 예상 결과

### 즉시 효과
- 더 명확한 코드 구조
- 기능별 책임 분리
- 유지보수성 향상

### 장기 효과
- Blueprint 시스템 도입 기반
- 플러그인 시스템 가능
- 에디터 통합 준비

## 7. 리스크 관리

### 성능
- 프로파일링으로 성능 모니터링
- 필요시 최적화 적용
- 핫패스 최소 변경

### 호환성
- 기존 API 래퍼 제공
- 점진적 deprecation
- 명확한 마이그레이션 경로

### 복잡도
- 단계별 구현
- 각 단계 독립적 완성
- 롤백 계획 수립 