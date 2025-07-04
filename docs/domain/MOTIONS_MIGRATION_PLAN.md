# Motions 도메인 마이그레이션 계획

## 개요
현재 gaesup-world 프로젝트의 motions 도메인을 언리얼 엔진/유니티 스타일의 게임 엔진 아키텍처로 점진적으로 마이그레이션하는 계획서입니다.

## 현재 구조 분석

### 강점
- **레이어 아키텍처**: Core, Bridge, Components로 잘 분리됨
- **Behavior 시스템**: applyGravity, applyImpulse 등 모듈화된 행동
- **State Management**: StateEngine으로 중앙집중식 상태 관리
- **Physics Integration**: Rapier 물리 엔진 통합

### 개선 필요 사항
- Actor-Component 시스템 부재
- 하드코딩된 behavior 로직
- 이벤트 시스템 부재
- 리플렉션/시리얼라이제이션 부재
- Blueprint 스타일 비주얼 스크립팅 불가

## 마이그레이션 전략

### Phase 1: Core Foundation (4주)

#### 1.1 GObject & Actor System 구축
```typescript
// 현재 구조
class PhysicsEngine {
  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void
}

// 목표 구조
class Actor extends GObject {
  components: Map<string, ActorComponent>
  tick(deltaTime: number): void
}

class Character extends Pawn {
  movementComponent: CharacterMovementComponent
  meshComponent: MeshComponent
}
```

**작업 내용:**
1. `src/core/engine/object/GObject.ts` 생성
2. `src/core/engine/actor/Actor.ts` 구현
3. 기존 Entity를 Actor로 래핑
4. Component 시스템 구축

#### 1.2 기존 코드 통합
```typescript
// Bridge 패턴으로 기존 코드 재사용
class LegacyMotionBridge extends ActorComponent {
  private physicsEngine: PhysicsEngine;
  
  tickComponent(deltaTime: number): void {
    // 기존 PhysicsEngine 로직 호출
    const calcProp = this.buildCalcProp();
    const physicsState = this.buildPhysicsState();
    this.physicsEngine.calculate(calcProp, physicsState);
  }
}
```

### Phase 2: Component Migration (3주)

#### 2.1 Movement Component
```typescript
// 현재: behaviors 폴더의 개별 함수들
applyGravity(rigidBody, physicsState)
applyImpulse(rigidBody, physicsState)
updateDirection(physicsState, mode, calcProp)

// 목표: Component 기반
class CharacterMovementComponent extends MovementComponent {
  private gravityScale: number = 1.0;
  private jumpForce: number = 10.0;
  
  updateMovement(deltaTime: number): void {
    this.applyGravity();
    this.applyForces();
    this.updateVelocity();
  }
}
```

#### 2.2 Physics Component
```typescript
class PhysicsComponent extends SceneComponent {
  private rigidBody: RapierRigidBody;
  
  beginPlay(): void {
    // 기존 rigidBodyRef를 Component로 캡슐화
    this.setupPhysicsBody();
  }
}
```

### Phase 3: Event System (2주)

#### 3.1 이벤트 시스템 구축
```typescript
// 현재: 직접 호출
if (collision) {
  handleCollision();
}

// 목표: 이벤트 기반
class CollisionComponent extends SceneComponent {
  onComponentBeginOverlap: MulticastDelegate<(other: Actor) => void>;
  
  handleCollision(other: Actor): void {
    this.onComponentBeginOverlap.broadcast(other);
  }
}
```

#### 3.2 기존 상태 변경을 이벤트로
```typescript
// StateEngine 이벤트화
class StateEngine {
  onStateChanged: EventEmitter<StateChangeEvent>;
  
  updateGameStates(updates: Partial<GameStatesType>): void {
    const oldState = { ...this.refs.gameStates };
    Object.assign(this.refs.gameStates, updates);
    
    this.onStateChanged.emit({
      oldState,
      newState: this.refs.gameStates
    });
  }
}
```

### Phase 4: Blueprint Foundation (4주)

#### 4.1 노드 시스템 기초
```typescript
// Behavior를 Node로 변환
class ApplyGravityNode extends BlueprintNode {
  execute(context: NodeExecutionContext): void {
    const actor = context.getTarget<Actor>();
    const physics = actor.getComponent<PhysicsComponent>("Physics");
    
    if (physics) {
      physics.applyGravity(context.deltaTime);
    }
    
    context.executeOutputPin(0);
  }
}
```

#### 4.2 Visual Scripting Editor
```typescript
// 에디터 컴포넌트
const MotionBlueprintEditor: React.FC = () => {
  return (
    <BlueprintCanvas>
      <NodePalette />
      <GraphEditor />
      <PropertyPanel />
    </BlueprintCanvas>
  );
};
```

### Phase 5: Advanced Features (4주)

#### 5.1 Gameplay Ability System
```typescript
class JumpAbility extends GameplayAbility {
  canActivateAbility(): boolean {
    const movement = this.getOwner().getComponent<MovementComponent>();
    return movement?.isGrounded ?? false;
  }
  
  activateAbility(): void {
    const movement = this.getOwner().getComponent<MovementComponent>();
    movement?.jump();
    
    // 쿨다운 적용
    this.applyCooldown();
  }
}
```

#### 5.2 Animation Integration
```typescript
class MotionAnimInstance extends AnimInstance {
  updateAnimation(deltaTime: number): void {
    const movement = this.getOwner().getComponent<MovementComponent>();
    
    // 상태에 따른 애니메이션 전환
    if (movement?.isJumping) {
      this.stateMachine.forceState("Jump");
    } else if (movement?.velocity.length() > 0.1) {
      this.stateMachine.forceState("Walk");
    } else {
      this.stateMachine.forceState("Idle");
    }
  }
}
```

## 구현 우선순위

### 즉시 구현 (Phase 1-2)
1. GObject/Actor 시스템
2. Component 아키텍처
3. 기존 코드 Bridge 패턴
4. Movement/Physics Component

### 중기 구현 (Phase 3-4)
1. Event System
2. Blueprint 기초
3. 노드 편집기 UI
4. 시리얼라이제이션

### 장기 구현 (Phase 5+)
1. Gameplay Ability System
2. 고급 Animation 시스템
3. Networking/Replication
4. 최적화 (ECS, Job System)

## 기존 코드 보존 전략

### 1. Adapter Pattern
```typescript
// 기존 코드를 Component로 래핑
class LegacyPhysicsAdapter extends ActorComponent {
  private engine: PhysicsEngine;
  private bridge: MotionBridge;
  
  tickComponent(deltaTime: number): void {
    // 기존 로직 호출
    this.engine.calculate(this.calcProp, this.physicsState);
  }
}
```

### 2. Facade Pattern
```typescript
// 새로운 인터페이스로 기존 기능 노출
class MotionSystemFacade {
  jump(): void {
    // 기존 impulse 시스템 사용
    this.impulseController.applyJumpImpulse();
  }
  
  move(direction: Vector3): void {
    // 기존 direction 시스템 사용
    this.directionController.updateDirection(direction);
  }
}
```

### 3. Progressive Enhancement
```typescript
// 점진적 기능 추가
class EnhancedCharacter extends Character {
  constructor() {
    super();
    
    // 기존 기능 유지
    this.addComponent(LegacyMotionBridge, "LegacyMotion");
    
    // 새 기능 추가
    if (FEATURES.abilitySystem) {
      this.addComponent(AbilitySystemComponent, "Abilities");
    }
  }
}
```

## 테스트 전략

### 1. 기능 동등성 테스트
```typescript
describe("Motion Migration", () => {
  it("기존 동작과 새 시스템 동작이 동일해야 함", () => {
    const legacyResult = runLegacyPhysics(testCase);
    const newResult = runNewActorSystem(testCase);
    
    expect(newResult.position).toBeCloseTo(legacyResult.position);
    expect(newResult.velocity).toBeCloseTo(legacyResult.velocity);
  });
});
```

### 2. 성능 비교
```typescript
class PerformanceMonitor {
  compareSystems(): void {
    const legacyTime = measureTime(() => runLegacySystem());
    const newTime = measureTime(() => runNewSystem());
    
    expect(newTime).toBeLessThanOrEqual(legacyTime * 1.1);
  }
}
```

## 위험 요소 및 대응

### 1. 성능 저하
- **위험**: Actor/Component 오버헤드
- **대응**: 프로파일링, 최적화, 필요시 ECS 도입

### 2. 기존 기능 손상
- **위험**: 마이그레이션 중 버그
- **대응**: 점진적 마이그레이션, 충분한 테스트

### 3. 개발 복잡도 증가
- **위험**: 과도한 추상화
- **대응**: 단계별 구현, 문서화

## 예상 결과

### 단기 (2개월)
- Actor-Component 시스템 완성
- 기존 기능 100% 호환
- 이벤트 기반 아키텍처

### 중기 (4개월)
- Blueprint 시스템 기초
- 비주얼 스크립팅 가능
- 확장 가능한 능력 시스템

### 장기 (6개월)
- 완전한 게임 엔진 기능
- 에디터 통합
- 플러그인 생태계

## 결론

이 마이그레이션 계획은 기존 motions 도메인의 기능을 유지하면서 점진적으로 언리얼/유니티 스타일의 강력한 게임 엔진 아키텍처로 전환하는 것을 목표로 합니다. 각 단계는 독립적으로 구현 가능하며, 프로젝트의 요구사항에 따라 우선순위를 조정할 수 있습니다. 