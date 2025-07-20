# Motions Domain API Reference

## 개요

Motions Domain은 **물리 시뮬레이션, 캐릭터 이동, 차량 제어, 엔티티 상태 관리**를 담당하는 핵심 도메인입니다. Rapier Physics 엔진과 통합되어 실시간 물리 계산을 제공하고, 다양한 운송 수단의 움직임을 시뮬레이션합니다.

**경로**: `src/core/motions/`

## 핵심 Bridge 시스템

### MotionBridge

캐릭터와 차량의 움직임을 관리하는 메인 브릿지입니다.

```typescript
@DomainBridge('motion')
@EnableEventLog()
class MotionBridge extends CoreBridge<MotionEntity, MotionSnapshot, MotionCommand> {
  // 엔티티 생성
  protected buildEngine(id: string, type: MotionType, rigidBody: RapierRigidBody): MotionEntity | null
  
  // 명령 실행
  protected executeCommand(entity: MotionEntity, command: MotionCommand, id: string): void
  
  // 상태 스냅샷
  protected createSnapshot(entity: MotionEntity, id: string): MotionSnapshot | null
  
  // 엔티티 업데이트
  updateEntity(id: string, args: MotionUpdateArgs): void
}
```

### PhysicsBridge

물리 시스템 설정과 전역 물리 파라미터를 관리합니다.

```typescript
@DomainBridge('physics')
@EnableEventLog()
class PhysicsBridge extends CoreBridge<PhysicsBridgeEntity, PhysicsSnapshot, PhysicsCommand> {
  // 물리 시스템 생성
  protected buildEngine(id: string, config: PhysicsConfigType): PhysicsBridgeEntity | null
  
  // 설정 업데이트
  protected executeCommand(entity: PhysicsBridgeEntity, command: PhysicsCommand, id: string): void
  
  // 물리 상태 스냅샷
  protected createSnapshot(entity: PhysicsBridgeEntity): PhysicsSnapshot
  
  // 물리 업데이트
  updateEntity(id: string, args: PhysicsUpdateArgs): void
}
```

## 핵심 시스템

### MotionSystem

개별 엔티티의 움직임을 관리하는 시스템입니다.

```typescript
class MotionSystem {
  constructor(options: { type: MotionType })
  
  // 상태 관리
  getState(): MotionSystemState
  setState(state: Partial<MotionSystemState>): void
  
  // 움직임 제어
  move(direction: THREE.Vector3): void
  jump(): void
  stop(): void
  turn(angle: number): void
  
  // 자동화
  enableAutomation(target: THREE.Vector3): void
  disableAutomation(): void
  
  // 설정
  setConfig(config: MotionConfig): void
  getConfig(): MotionConfig
  
  // 상태 조회
  isGrounded(): boolean
  isMoving(): boolean
  getSpeed(): number
  getVelocity(): THREE.Vector3
  
  // 생명주기
  update(deltaTime: number): void
  dispose(): void
}
```

### PhysicsSystem

전역 물리 계산을 담당하는 시스템입니다.

```typescript
@ManageRuntime({ autoStart: false })
class PhysicsSystem extends AbstractSystem<
  PhysicsSystemState, 
  PhysicsSystemMetrics,
  PhysicsSystemOptions,
  PhysicsUpdateArgs
> {
  constructor(config: PhysicsConfigType, options?: PhysicsSystemOptions)
  
  // 물리 업데이트
  update(args: PhysicsUpdateArgs): void
  
  // 설정 관리
  updateConfig(config: Partial<PhysicsConfigType>): void
  getConfig(): PhysicsConfigType
  
  // 컴포넌트 시스템
  private directionComponent: DirectionComponent
  private impulseComponent: ImpulseComponent  
  private gravityComponent: GravityComponent
  private animationController: AnimationController
  
  // 상태 조회
  getState(): PhysicsSystemState
  getMetrics(): PhysicsSystemMetrics
}
```

### EntityStateManager

게임 상태와 엔티티 상태를 통합 관리합니다.

```typescript
class EntityStateManager {
  // 상태 관리
  getActiveState(): ActiveStateType
  getGameStates(): GameStatesType
  
  // 상태 업데이트  
  updateActiveState(updates: Partial<ActiveStateType>): void
  updateGameStates(updates: Partial<GameStatesType>): void
  
  // 초기화
  resetActiveState(): void
  resetGameStates(): void
  
  // 이벤트
  addEventListener(event: string, handler: Function): void
  removeEventListener(event: string, handler: Function): void
}
```

## Hook APIs

### useMotion

**메인 Motion 훅** - 엔티티의 움직임을 제어합니다.

```typescript
function useMotion(id: string, options: UseMotionOptions): UseMotionReturn

interface UseMotionOptions {
  motionType: MotionType
  rigidBodyRef: RefObject<RapierRigidBody>
  position?: THREE.Vector3
  autoStart?: boolean
}

interface UseMotionReturn {
  entity: ManagedMotionEntity | null
  move: (movement: THREE.Vector3) => void
  jump: () => void
  stop: () => void
  turn: (direction: number) => void
  reset: () => void
  setConfig: (config: MotionConfig) => void
  enableAutomation: (targetPosition: THREE.Vector3) => void
  disableAutomation: () => void
  isGrounded: boolean
  isMoving: boolean
  speed: number
  position: THREE.Vector3 | null
  velocity: THREE.Vector3 | null
}
```

**사용 예제**:
```typescript
function MovingCharacter() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const motion = useMotion('player-1', {
    motionType: 'character',
    rigidBodyRef,
    position: new THREE.Vector3(0, 5, 0)
  })

  const handleJump = () => motion.jump()
  const handleMove = (direction: THREE.Vector3) => motion.move(direction)
  const handleAutoPilot = () => {
    motion.enableAutomation(new THREE.Vector3(10, 0, 10))
  }

  return (
    <RigidBody ref={rigidBodyRef} colliders={false} type="dynamic">
      <CapsuleCollider args={[0.5, 0.5]} />
      <Box args={[1, 2, 1]}>
        <meshStandardMaterial color={motion.isMoving ? 'orange' : 'blue'} />
      </Box>
    </RigidBody>
  )
}
```

### useStateSystem

전역 엔티티 상태를 관리하는 훅입니다.

```typescript
function useStateSystem(): UseStateSystemResult

interface UseStateSystemResult {
  activeState: ActiveStateType
  gameStates: GameStatesType
  updateActiveState: (updates: Partial<ActiveStateType>) => void
  updateGameStates: (updates: Partial<GameStatesType>) => void
  resetActiveState: () => void
  resetGameStates: () => void
}
```

**사용 예제**:
```typescript
function GameController() {
  const { activeState, gameStates, updateActiveState, updateGameStates } = useStateSystem()
  
  const handleRideVehicle = (vehicleId: string) => {
    updateGameStates({ 
      isRiding: true,
      currentVehicle: vehicleId 
    })
    updateActiveState({
      mode: 'vehicle',
      position: vehiclePosition
    })
  }
  
  return (
    <div>
      <div>Current Mode: {activeState.mode}</div>
      <div>Riding: {gameStates.isRiding ? 'Yes' : 'No'}</div>
      <button onClick={() => handleRideVehicle('vehicle-1')}>
        Ride Vehicle
      </button>
    </div>
  )
}
```

### usePhysicsBridge

물리 시스템과 연동하는 훅입니다.

```typescript
function usePhysicsBridge(props: PhysicsCalculationProps): void

interface PhysicsCalculationProps {
  outerGroupRef: RefObject<THREE.Group>
  innerGroupRef: RefObject<THREE.Group>  
  rigidBodyRef: RefObject<RapierRigidBody>
  colliderRef?: RefObject<Collider>
  groundRay?: RefObject<Ray>
}
```

### useMotionSetup

Motion 시스템 초기화를 담당하는 훅입니다.

```typescript
function useMotionSetup(
  entityId: string,
  rigidBodyRef: RefObject<RapierRigidBody>,
  modeType: ModeType,
  isActive: boolean
): {
  executeMotionCommand: (command: MotionCommand) => void
  getMotionSnapshot: () => MotionSnapshot | null
}
```

## 타입 정의

### MotionCommand

Motion 시스템에 전송되는 명령입니다.

```typescript
interface MotionCommand {
  type: 'move' | 'jump' | 'stop' | 'turn' | 'reset' | 'setConfig' | 'enableAutomation' | 'disableAutomation'
  data?: {
    direction?: THREE.Vector3
    angle?: number
    config?: MotionConfig
    target?: THREE.Vector3
  }
}
```

### MotionSnapshot

Motion 엔티티의 현재 상태 스냅샷입니다.

```typescript
interface MotionSnapshot {
  position: THREE.Vector3
  velocity: THREE.Vector3
  isGrounded: boolean
  isMoving: boolean
  speed: number
  mode: MotionType
  config: MotionConfig
  automation: {
    enabled: boolean
    target: THREE.Vector3 | null
    progress: number
  }
  metrics: {
    frameTime: number
    updateCount: number
    lastUpdate: number
  }
}
```

### ActiveStateType

현재 활성 엔티티의 상태입니다.

```typescript
interface ActiveStateType {
  mode: 'character' | 'vehicle' | 'airplane'
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3
  isGrounded: boolean
  isMoving: boolean
  health: number
  energy: number
  lastUpdate: number
}
```

### GameStatesType

게임의 전반적인 상태입니다.

```typescript
interface GameStatesType {
  isRiding: boolean
  currentVehicle: string | null
  isPaused: boolean
  gameTime: number
  score: number
  level: number
  objectives: GameObjective[]
}

interface GameObjective {
  id: string
  type: string
  description: string
  completed: boolean
  progress: number
}
```

### PhysicsConfigType

물리 시스템 설정입니다.

```typescript
interface PhysicsConfigType {
  // 캐릭터 관련
  walkSpeed: number
  runSpeed: number
  jumpSpeed: number
  jumpGravityScale: number
  normalGravityScale: number
  airDamping: number
  stopDamping: number
  
  // 차량 관련
  maxSpeed: number
  accelRatio: number
  brakeRatio: number
  
  // 비행기 관련
  gravityScale: number
  angleDelta: THREE.Vector3
  maxAngle: THREE.Vector3
  
  // 공통
  linearDamping: number
}
```

## 물리 컴포넌트 시스템

### DirectionComponent

방향과 회전을 관리하는 컴포넌트입니다.

```typescript
class DirectionComponent {
  constructor(config: PhysicsConfigType)
  
  // 방향 계산
  calculateDirection(input: DirectionInput): THREE.Vector3
  updateRotation(rigidBody: RapierRigidBody, direction: THREE.Vector3): void
  
  // 설정
  updateConfig(config: Partial<PhysicsConfigType>): void
}

interface DirectionInput {
  forward: boolean
  backward: boolean
  leftward: boolean
  rightward: boolean
  cameraDirection?: THREE.Vector3
}
```

### ImpulseComponent

점프와 충격을 처리하는 컴포넌트입니다.

```typescript
class ImpulseComponent {
  constructor(config: PhysicsConfigType)
  
  // 충격 적용
  applyJumpImpulse(rigidBody: RapierRigidBody): void
  applyMovementImpulse(rigidBody: RapierRigidBody, direction: THREE.Vector3): void
  
  // 상태 확인
  canJump(isGrounded: boolean): boolean
  
  // 설정 업데이트
  updateConfig(config: Partial<PhysicsConfigType>): void
}
```

### GravityComponent

중력과 공중 제어를 관리하는 컴포넌트입니다.

```typescript
class GravityComponent {
  constructor(config: PhysicsConfigType)
  
  // 중력 적용
  applyGravity(rigidBody: RapierRigidBody, isGrounded: boolean): void
  updateGravityScale(rigidBody: RapierRigidBody, scale: number): void
  
  // 공중 제어
  applyAirControl(rigidBody: RapierRigidBody, input: DirectionInput): void
  
  // 설정 업데이트  
  updateConfig(config: Partial<PhysicsConfigType>): void
}
```

## 명령 시스템 사용법

### 기본 움직임 명령

```typescript
// 이동
const moveCommand: MotionCommand = {
  type: 'move',
  data: { direction: new THREE.Vector3(1, 0, 0) }
}

// 점프
const jumpCommand: MotionCommand = {
  type: 'jump'
}

// 회전
const turnCommand: MotionCommand = {
  type: 'turn', 
  data: { angle: Math.PI / 4 }
}

// 정지
const stopCommand: MotionCommand = {
  type: 'stop'
}
```

### 설정 변경 명령

```typescript
const configCommand: MotionCommand = {
  type: 'setConfig',
  data: {
    config: {
      walkSpeed: 8,
      runSpeed: 15,
      jumpSpeed: 12
    }
  }
}
```

### 자동화 명령

```typescript
// 자동화 활성화
const enableAutoCommand: MotionCommand = {
  type: 'enableAutomation',
  data: { target: new THREE.Vector3(10, 0, 10) }
}

// 자동화 비활성화
const disableAutoCommand: MotionCommand = {
  type: 'disableAutomation'
}
```

## 고급 사용법

### 커스텀 Motion 시스템 생성

```typescript
function useCustomMotion(id: string, customConfig: CustomMotionConfig) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const bridge = useMemo(() => BridgeFactory.get<MotionBridge>('motion'), [])
  
  const entity = useManagedEntity(bridge, id, rigidBodyRef, {
    onInit: (entity) => {
      // 커스텀 초기화 로직
      entity.execute({
        type: 'setConfig',
        data: { config: customConfig }
      })
    },
    frameCallback: () => {
      // 매 프레임 커스텀 로직
      const snapshot = entity.getSnapshot()
      if (snapshot && snapshot.position.y < -10) {
        // 추락 시 리스폰
        entity.execute({ type: 'reset' })
      }
    }
  })

  const customMove = useCallback((direction: THREE.Vector3, multiplier: number = 1) => {
    const scaledDirection = direction.multiplyScalar(multiplier)
    entity?.execute({
      type: 'move',
      data: { direction: scaledDirection }
    })
  }, [entity])

  return { entity, customMove }
}
```

### 다중 엔티티 관리

```typescript
function useSwarm(entityConfigs: EntityConfig[]) {
  const entities = entityConfigs.map((config, index) => 
    useMotion(`swarm-${index}`, {
      motionType: 'character',
      rigidBodyRef: config.rigidBodyRef,
      position: config.initialPosition
    })
  )

  const moveSwarm = useCallback((direction: THREE.Vector3) => {
    entities.forEach((entity, index) => {
      // 각 엔티티마다 약간씩 다른 방향으로 이동
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        0,
        (Math.random() - 0.5) * 0.2
      )
      const finalDirection = direction.clone().add(offset)
      entity.move(finalDirection)
    })
  }, [entities])

  const formationMove = useCallback((center: THREE.Vector3, formation: 'line' | 'circle') => {
    entities.forEach((entity, index) => {
      let target: THREE.Vector3
      
      if (formation === 'line') {
        target = center.clone().add(new THREE.Vector3(index * 2, 0, 0))
      } else { // circle
        const angle = (index / entities.length) * Math.PI * 2
        target = center.clone().add(new THREE.Vector3(
          Math.cos(angle) * 3,
          0,
          Math.sin(angle) * 3
        ))
      }
      
      entity.enableAutomation(target)
    })
  }, [entities])

  return { entities, moveSwarm, formationMove }
}
```

### 물리 상태 모니터링

```typescript
function usePhysicsMonitor() {
  const [physicsMetrics, setPhysicsMetrics] = useState<PhysicsSystemMetrics>()
  
  useEffect(() => {
    const bridge = BridgeFactory.get<PhysicsBridge>('physics')
    if (!bridge) return

    const interval = setInterval(() => {
      const snapshot = bridge.snapshot('global')
      if (snapshot) {
        setPhysicsMetrics(snapshot.metrics)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return physicsMetrics
}

function PhysicsDebugPanel() {
  const metrics = usePhysicsMonitor()
  
  return (
    <div style={{ position: 'fixed', bottom: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: 10 }}>
      <h3>Physics Debug</h3>
      {metrics && (
        <div>
          <div>Frame Time: {metrics.frameTime.toFixed(2)}ms</div>
          <div>Update Count: {metrics.updateCount}</div>
          <div>Active Entities: {metrics.activeEntityCount}</div>
          <div>Collision Checks: {metrics.collisionChecks}</div>
        </div>
      )}
    </div>
  )
}
```

### 자동화 시퀀스 생성

```typescript
function useAutomatedSequence() {
  const { updateActiveState } = useStateSystem()
  
  const createPatrolSequence = useCallback((waypoints: THREE.Vector3[], entityId: string) => {
    const bridge = BridgeFactory.get<MotionBridge>('motion')
    if (!bridge) return

    waypoints.forEach((point, index) => {
      setTimeout(() => {
        bridge.execute(entityId, {
          type: 'enableAutomation',
          data: { target: point }
        })
      }, index * 5000) // 5초마다 다음 지점으로
    })
  }, [])

  const createCombatSequence = useCallback((targetPosition: THREE.Vector3, entityId: string) => {
    const bridge = BridgeFactory.get<MotionBridge>('motion')
    if (!bridge) return

    // 1. 목표 지점으로 이동
    bridge.execute(entityId, {
      type: 'enableAutomation',
      data: { target: targetPosition }
    })

    // 2. 2초 후 점프
    setTimeout(() => {
      bridge.execute(entityId, { type: 'jump' })
    }, 2000)

    // 3. 3초 후 회전
    setTimeout(() => {
      bridge.execute(entityId, {
        type: 'turn',
        data: { angle: Math.PI }
      })
    }, 3000)
  }, [])

  return { createPatrolSequence, createCombatSequence }
}
```

## 성능 최적화

### 1. 물리 계산 최적화

```typescript
// 낮은 우선순위로 물리 업데이트
const entity = useManagedEntity(bridge, id, ref, {
  priority: -1, // 렌더링 후 실행
  throttle: 16, // 60fps 제한
  skipWhenHidden: true
})
```

### 2. 조건부 물리 활성화

```typescript
function useConditionalPhysics(isVisible: boolean, isImportant: boolean) {
  const entity = useManagedEntity(bridge, id, ref, {
    enabled: isVisible || isImportant,
    dependencies: [isVisible, isImportant]
  })

  return entity
}
```

### 3. 배치 업데이트

```typescript
function useBatchedMotionUpdates(entities: MotionEntity[]) {
  const updateQueue = useRef<Map<string, MotionCommand>>(new Map())
  
  const queueUpdate = useCallback((entityId: string, command: MotionCommand) => {
    updateQueue.current.set(entityId, command)
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const bridge = BridgeFactory.get<MotionBridge>('motion')
      if (!bridge) return

      updateQueue.current.forEach((command, entityId) => {
        bridge.execute(entityId, command)
      })
      updateQueue.current.clear()
    }, 16) // 60fps 배치 처리

    return () => clearInterval(interval)
  }, [])

  return { queueUpdate }
}
```

이 API 가이드는 Motions Domain의 모든 기능을 포괄적으로 다루며, 물리 시뮬레이션부터 복잡한 자동화 시퀀스까지 모든 움직임 관련 기능을 효과적으로 활용할 수 있는 완전한 레퍼런스를 제공합니다. 