# Physics & Character Movement Settings

> 언리얼 엔진의 Character Movement Component와 유니티의 Rigidbody/CharacterController를 참고한 물리 설정

## Core Settings

### Physics World Settings
```typescript
interface PhysicsWorldSettings {
  // Gravity Settings (유니티: Physics Settings)
  gravity: Vector3;                 // 기본: { x: 0, y: -9.81, z: 0 }
  timeStep: number;                 // 기본: 1/60 (Physics Time Step)
  velocityIterations: number;       // 기본: 8 (Velocity Solver Iterations)
  positionIterations: number;       // 기본: 3 (Position Solver Iterations)
  
  // Performance Settings
  enableCCD: boolean;               // 연속 충돌 감지 (Continuous Collision Detection)
  sleepThreshold: number;           // 기본: 0.5 (Sleep Threshold)
  defaultSolverIterations: number;  // 기본: 6
}
```

### Character Movement Settings (언리얼: Character Movement Component)
```typescript
interface CharacterMovementSettings {
  // Movement Settings
  maxWalkSpeed: number;             // 기본: 600 (언리얼: Max Walk Speed)
  maxRunSpeed: number;              // 기본: 1200 (Run Speed Multiplier)
  acceleration: number;             // 기본: 2048 (언리얼: Max Acceleration)
  deceleration: number;             // 기본: 2048 (Braking Deceleration)
  groundFriction: number;           // 기본: 8.0 (언리얼: Ground Friction)
  
  // Air Movement
  jumpZVelocity: number;            // 기본: 420 (언리얼: Jump Z Velocity)
  airControl: number;               // 기본: 0.05 (언리얼: Air Control)
  airControlBoostMultiplier: number; // 기본: 2.0
  fallTerminalVelocity: number;     // 기본: 4000 (Terminal Velocity)
  
  // Physics
  mass: number;                     // 기본: 100 (Character Mass)
  linearDamping: number;            // 기본: 0.01 (Linear Damping)
  angularDamping: number;           // 기본: 0.01 (Angular Damping)
}
```

### Vehicle Physics Settings (언리얼: Wheeled Vehicle)
```typescript
interface VehiclePhysicsSettings {
  // Engine Settings
  maxEngineForce: number;           // 기본: 1500 (Engine Force)
  maxBrakingForce: number;          // 기본: 1000 (Brake Force)
  maxSteeringAngle: number;         // 기본: 30 (degrees)
  
  // Chassis Settings
  chassisMass: number;              // 기본: 1200 (Vehicle Mass)
  centerOfMass: Vector3;            // 무게중심 (Center of Mass)
  dragCoefficient: number;          // 기본: 0.3 (Air Resistance)
  downforceCoefficient: number;     // 기본: 0.0 (Downforce)
  
  // Wheel Settings
  wheelFriction: number;            // 기본: 1000 (Friction Slip)
  wheelDamping: number;             // 기본: 1.0 (Wheel Damping)
  suspensionStiffness: number;      // 기본: 5.0 (Suspension Stiffness)
  suspensionCompression: number;    // 기본: 0.83 (Suspension Compression)
  suspensionRelaxation: number;     // 기본: 0.88 (Suspension Relaxation)
}
```

### Flight Physics Settings (비행기/항공기)
```typescript
interface FlightPhysicsSettings {
  // Aerodynamics
  liftCoefficient: number;          // 기본: 0.1 (양력 계수)
  dragCoefficient: number;          // 기본: 0.01 (항력 계수)
  pitchTorque: number;              // 기본: 1000 (피치 토크)
  yawTorque: number;                // 기본: 1000 (요 토크)
  rollTorque: number;               // 기본: 1000 (롤 토크)
  
  // Engine
  thrustForce: number;              // 기본: 1500 (추진력)
  afterburnerMultiplier: number;    // 기본: 1.5 (애프터버너)
  fuelConsumption: number;          // 기본: 1.0 (연료 소모율)
  
  // Control
  controlSensitivity: number;       // 기본: 1.0 (조종 민감도)
  stabilityAssist: boolean;         // 자동 안정화
  maxGForce: number;                // 기본: 9.0 (최대 G포스)
}
```

## Quality Settings

### Physics Quality Settings
```typescript
interface PhysicsQualitySettings {
  // Simulation Quality
  simulationQuality: 'low' | 'medium' | 'high' | 'ultra';
  collisionDetection: 'discrete' | 'continuous' | 'continuousDynamic';
  
  // Performance
  maxCollisionChecks: number;       // 기본: 64 (프레임당 최대 충돌 검사)
  physicsTimeScale: number;         // 기본: 1.0 (물리 시간 스케일)
  enableMultithreading: boolean;    // 멀티스레딩 활성화
  
  // Debug
  showColliders: boolean;           // 콜라이더 표시
  showContactPoints: boolean;       // 접촉점 표시
  showVelocityVectors: boolean;     // 속도 벡터 표시
}
```

## User Controls

### Player Movement Preferences
```typescript
interface PlayerMovementSettings {
  // Input Response
  inputSmoothing: number;           // 기본: 0.1 (입력 부드러움)
  mouseAcceleration: boolean;       // 마우스 가속도
  keyboardRepeatDelay: number;      // 키보드 반복 지연
  
  // Accessibility
  autoRun: boolean;                 // 자동 달리기
  toggleCrouch: boolean;            // 앉기 토글 모드
  holdToSprint: boolean;            // 달리기 홀드 모드
  
  // Comfort
  enableHeadBob: boolean;           // 머리 흔들림
  motionSickness: 'none' | 'reduced' | 'comfort';
  cameraShakeIntensity: number;     // 기본: 1.0 (카메라 흔들림 강도)
}
```

## Default Configuration

```typescript
export const DEFAULT_PHYSICS_WORLD: PhysicsWorldSettings = {
  gravity: { x: 0, y: -9.81, z: 0 },
  timeStep: 1/60,
  velocityIterations: 8,
  positionIterations: 3,
  enableCCD: true,
  sleepThreshold: 0.5,
  defaultSolverIterations: 6,
};

export const DEFAULT_CHARACTER_MOVEMENT: CharacterMovementSettings = {
  maxWalkSpeed: 600,
  maxRunSpeed: 1200,
  acceleration: 2048,
  deceleration: 2048,
  groundFriction: 8.0,
  jumpZVelocity: 420,
  airControl: 0.05,
  airControlBoostMultiplier: 2.0,
  fallTerminalVelocity: 4000,
  mass: 100,
  linearDamping: 0.01,
  angularDamping: 0.01,
};

export const DEFAULT_VEHICLE_PHYSICS: VehiclePhysicsSettings = {
  maxEngineForce: 1500,
  maxBrakingForce: 1000,
  maxSteeringAngle: 30,
  chassisMass: 1200,
  centerOfMass: { x: 0, y: -0.5, z: 0 },
  dragCoefficient: 0.3,
  downforceCoefficient: 0.0,
  wheelFriction: 1000,
  wheelDamping: 1.0,
  suspensionStiffness: 5.0,
  suspensionCompression: 0.83,
  suspensionRelaxation: 0.88,
};
```

## Settings Overview

### Character Movement Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| maxWalkSpeed | 600 | 100 - 2000 | 최대 걷기 속도 |
| maxRunSpeed | 1200 | 500 - 3000 | 최대 달리기 속도 |
| acceleration | 2048 | 500 - 5000 | 가속도 |
| deceleration | 2048 | 500 - 5000 | 감속도 |
| groundFriction | 8.0 | 0.1 - 20.0 | 지면 마찰력 |
| jumpZVelocity | 420 | 100 - 1000 | 점프 속도 |
| airControl | 0.05 | 0.0 - 1.0 | 공중 제어력 |
| mass | 100 | 10 - 500 | 캐릭터 질량 |

### Vehicle Physics Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| maxEngineForce | 1500 | 500 - 5000 | 최대 엔진 출력 |
| maxBrakingForce | 1000 | 200 - 3000 | 최대 제동력 |
| maxSteeringAngle | 30 | 10 - 60 | 최대 조향각 (degrees) |
| chassisMass | 1200 | 500 - 3000 | 차체 질량 |
| wheelFriction | 1000 | 100 - 2000 | 타이어 마찰력 |
| suspensionStiffness | 5.0 | 1.0 - 20.0 | 서스펜션 강성 |

### Flight Physics Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| liftCoefficient | 0.1 | 0.01 - 1.0 | 양력 계수 |
| dragCoefficient | 0.01 | 0.001 - 0.1 | 항력 계수 |
| thrustForce | 1500 | 500 - 5000 | 추진력 |
| pitchTorque | 1000 | 100 - 5000 | 피치 토크 |
| yawTorque | 1000 | 100 - 5000 | 요 토크 |
| rollTorque | 1000 | 100 - 5000 | 롤 토크 |
| maxGForce | 9.0 | 3.0 - 20.0 | 최대 G포스 |

### Physics Quality Settings
| 품질 레벨 | 시뮬레이션 정확도 | 충돌 감지 | 권장 환경 |
|----------|------------------|-----------|-----------|
| low | 기본 | discrete | 저사양 디바이스 |
| medium | 향상됨 | continuous | 일반 PC |
| high | 고정밀 | continuousDynamic | 고사양 PC |
| ultra | 최고 정밀도 | continuousDynamic | 최고사양 PC |

### Physics Presets Comparison
| 프리셋 | 중력 | 점프력 | 마찰력 | 공중제어 | 사용 용도 |
|--------|------|--------|--------|----------|-----------|
| realistic | -9.81 | 420 | 8.0 | 0.05 | 현실적 물리 |
| arcade | -5.0 | 600 | 12.0 | 0.3 | 아케이드 게임 |
| lowGravity | -3.0 | 300 | 4.0 | 0.8 | 우주/달 환경 |

## Usage Example

```typescript
// 물리 설정 변경
const { updatePhysicsSettings } = usePhysicsStore();

updatePhysicsSettings({
  maxWalkSpeed: 800,            // 더 빠른 이동
  jumpZVelocity: 500,           // 더 높은 점프
  airControl: 0.1,              // 더 나은 공중 제어
  simulationQuality: 'high'     // 고품질 시뮬레이션
});
```

## Physics Presets

```typescript
// 미리 정의된 물리 프리셋
export const PHYSICS_PRESETS = {
  realistic: {
    gravity: { x: 0, y: -9.81, z: 0 },
    jumpZVelocity: 420,
    groundFriction: 8.0,
    airControl: 0.05,
  },
  
  arcade: {
    gravity: { x: 0, y: -5.0, z: 0 },
    jumpZVelocity: 600,
    groundFriction: 12.0,
    airControl: 0.3,
  },
  
  lowGravity: {
    gravity: { x: 0, y: -3.0, z: 0 },
    jumpZVelocity: 300,
    groundFriction: 4.0,
    airControl: 0.8,
  }
};
``` 