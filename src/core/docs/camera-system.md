# Camera System Architecture

## 개요

Gaesup Camera 시스템은 **레이어 기반 아키텍처**를 구현하여 성능 최적화와 코드 분리를 달성했습니다. 이는 다른 도메인들이 따라갈 **선구적 구조**입니다.

## 레이어 아키텍처 원칙

### **1레이어 (Core Layer)** 
```
core/ behavior/ (선택적)
```
- **책임**: ref, useFrame 로직
- **특징**: 순수한 THREE.js 및 성능 집약적 연산
- **금지사항**: ⚠️ **상위 레이어 의존성 절대 금지**
  - React hooks (useState, useEffect, useMemo 등) 사용 금지
  - Zustand store 접근 금지
  - React 컴포넌트 의존성 금지

### **2레이어 (State Management Layer)**
```
controllers/ store/ hooks/
```
- **책임**: React 상태관리, zustand, useEffect 처리
- **특징**: 리렌더링 최적화 및 상태 분리
- **금지사항**: ⚠️ **하위 레이어에서 리렌더링 유발 금지**
  - 1레이어에서 React state 변경 금지
  - useFrame 내부에서 setState 호출 금지

### **3레이어 (Integration Layer)**
```
기타 로직들, React 컴포넌트
```
- **책임**: 사용자 인터페이스 및 통합 로직
- **특징**: 자유로운 React 패턴 사용 가능

## 📁 Camera System 구조

```
camera/
├── core/                    # 1레이어 - 순수 로직
│   ├── CameraEngine.ts      # 메인 엔진 (THREE.js 전용)
│   └── types.ts             # 타입 정의
├── controllers/             # 2레이어 - 상태관리
│   ├── BaseController.ts    # 공통 컨트롤러 로직
│   ├── ThirdPersonController.ts
│   ├── ChaseController.ts
│   ├── FirstPersonController.ts
│   ├── TopDownController.ts
│   ├── IsometricController.ts
│   ├── SideScrollController.ts
│   ├── FixedController.ts
│   └── index.ts
├── hooks/                   # 2레이어 - React 훅
│   └── useCamera.ts         # 카메라 React 통합
├── Camera.tsx               # 3레이어 - React 컴포넌트
└── index.ts                 # 공개 API

external dependencies:
├── stores/                  # 2레이어 - Zustand 스토어
│   └── gaesupStore.ts      # 카메라 상태 (cameraOption, mode 등)
└── utils/                   # 유틸리티
    └── camera.ts           # activeStateUtils, cameraUtils
```

## 🔧 Core Layer (1레이어) 상세

### **CameraEngine.ts**
```typescript
export class CameraEngine {
  private controllers: Map<string, ICameraController> = new Map();
  private state: CameraSystemState;
  
  // 메인 계산 로직 - useFrame에서 호출
  calculate(props: CameraCalcProps): void {
    const controller = this.controllers.get(this.state.config.mode);
    if (!controller) return;
    
    this.state.activeController = controller;
    controller.update(props, this.state);  // Controller에게 위임
  }
  
  // 설정 업데이트 (2레이어에서 호출)
  updateConfig(config: Partial<CameraConfig>): void {
    Object.assign(this.state.config, config);
    
    // cameraOption의 거리 값을 distance로 매핑
    if (config.xDistance !== undefined || config.yDistance !== undefined || config.zDistance !== undefined) {
      this.state.config.distance = {
        x: config.xDistance || this.state.config.distance.x,
        y: config.yDistance || this.state.config.distance.y,
        z: config.zDistance || this.state.config.distance.z,
      };
    }
  }
}
```

**핵심 특징:**
- ✅ 순수한 THREE.js 로직만 포함
- ✅ React 의존성 없음
- ✅ 60fps useFrame에서 안전하게 실행

### **types.ts**
```typescript
// 1레이어 전용 타입들 - React 의존성 없음
export interface CameraSystemState {
  config: CameraConfig;
  activeController?: ICameraController;
}

export interface CameraCalcProps {
  camera: THREE.Camera;
  scene: THREE.Scene;
  deltaTime: number;
  activeState: ActiveStateType;  // 캐릭터 상태
  clock: THREE.Clock;
  excludeObjects?: THREE.Object3D[];
}

export interface ICameraController {
  name: string;
  defaultConfig: Partial<CameraConfig>;
  update(props: CameraCalcProps, state: CameraSystemState): void;
}
```

## ⚙️ Controllers Layer (2레이어) 상세

### **BaseController.ts** - 공통 로직
```typescript
export abstract class BaseController implements ICameraController {
  abstract name: string;
  abstract defaultConfig: Partial<CameraConfig>;
  
  abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
  
  calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    return activeStateUtils.getPosition(props.activeState);
  }
  
  update(props: CameraCalcProps, state: CameraSystemState): void {
    const { camera, deltaTime, activeState } = props;
    if (!activeState) return;
    
    // 1. 설정 적용
    Object.assign(state.config, this.defaultConfig);
    
    // 2. 타겟 위치 계산
    const targetPosition = this.calculateTargetPosition(props, state);
    const lookAtTarget = this.calculateLookAt(props, state);
    
    // 3. 기존 검증된 로직 사용
    cameraUtils.preventCameraJitter(camera, targetPosition, lookAtTarget, 8.0, deltaTime);
    
    // 4. FOV 업데이트
    if (state.config.fov && camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(camera, state.config.fov, state.config.smoothing?.fov);
    }
  }
}
```

### **개별 컨트롤러들**

#### **ThirdPersonController** - 3인칭 시점
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  const offset = activeStateUtils.calculateCameraOffset(position, {
    xDistance: state.config.distance.x,     // 기본: 15
    yDistance: state.config.distance.y,     // 기본: 8
    zDistance: state.config.distance.z,     // 기본: 15
    mode: 'thirdPerson',
  });
  return position.clone().add(offset);
}
```

#### **ChaseController** - 추적 카메라
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  const euler = activeStateUtils.getEuler(props.activeState);  // 캐릭터 회전 반영
  const offset = activeStateUtils.calculateCameraOffset(position, {
    xDistance: state.config.distance.x,     // 기본: 10
    yDistance: state.config.distance.y,     // 기본: 5
    zDistance: state.config.distance.z,     // 기본: 10
    euler,                                   // 캐릭터 방향에 따라 오프셋 회전
    mode: 'chase',
  });
  return position.clone().add(offset);
}
```

#### **FirstPersonController** - 1인칭 시점
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  const headOffset = new THREE.Vector3(0, 1.7, 0);  // 머리 높이
  return position.clone().add(headOffset);
}

calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  const euler = activeStateUtils.getEuler(props.activeState);
  const lookDirection = new THREE.Vector3(0, 0, -1);
  if (euler) {
    lookDirection.applyEuler(euler);  // 캐릭터가 보는 방향
  }
  return position.clone().add(lookDirection);
}
```

#### **TopDownController** - 탑다운 시점
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  return new THREE.Vector3(
    position.x,
    position.y + state.config.distance.y,   // 기본: 20m 위
    position.z
  );
}
```

#### **IsometricController** - 등각 투영
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  const angle = Math.PI / 4;  // 45도
  const distance = Math.sqrt(state.config.distance.x ** 2 + state.config.distance.z ** 2);
  return new THREE.Vector3(
    position.x + Math.cos(angle) * distance,
    position.y + state.config.distance.y,
    position.z + Math.sin(angle) * distance
  );
}
```

#### **SideScrollController** - 횡스크롤
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  const position = activeStateUtils.getPosition(props.activeState);
  return new THREE.Vector3(
    position.x + state.config.distance.x,   // X 오프셋
    position.y + state.config.distance.y,   // Y 오프셋  
    state.config.distance.z                 // Z 고정값
  );
}
```

#### **FixedController** - 고정 카메라
```typescript
calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  return state.config.fixedPosition || new THREE.Vector3(0, 10, 10);
}

calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
  return state.config.fixedLookAt || new THREE.Vector3(0, 0, 0);
}
```

## 🎣 Hooks Layer (2레이어) 상세

### **useCamera.ts** - React 통합
```typescript
export function useCamera() {
  const engineRef = useRef<CameraEngine>();
  
  // Zustand 스토어에서 상태 구독
  const block = useGaesupStore((state) => state.block);
  const activeState = useGaesupStore((state) => state.activeState);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const mode = useGaesupStore((state) => state.mode);
  
  // 엔진 초기화 (한 번만)
  useEffect(() => {
    engineRef.current = new CameraEngine();
    
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.updateConfig({
          mode: mode?.control || 'thirdPerson',
          ...cameraOption,
        });
      }
    }, 100);
  }, []);
  
  // 설정 변경 시 엔진 업데이트
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfig({
        mode: mode?.control || 'thirdPerson',
        ...cameraOption,
      });
    }
  }, [cameraOption, mode]);
  
  // 메인 프레임 루프 - 1레이어 호출
  useFrame((state, delta) => {
    if (!engineRef.current || block.camera) return;
    
    const calcProps: CameraCalcProps = {
      camera: state.camera,
      scene: state.scene,
      deltaTime: delta,
      activeState,
      clock: state.clock,
      excludeObjects: [],
    };
    
    engineRef.current.calculate(calcProps);  // 1레이어로 전달
  });
  
  return {
    engine: engineRef.current,
  };
}
```

**핵심 특징:**
- ✅ React 상태와 1레이어 분리
- ✅ useFrame에서 순수 계산 로직만 호출
- ✅ 리렌더링 최적화

## 데이터 흐름

```
[Zustand Store] 
    ↓ (상태 변경)
[useCamera Hook] 
    ↓ (useEffect로 설정 업데이트)
[CameraEngine.updateConfig()]
    ↓ (useFrame에서 매 프레임)
[CameraEngine.calculate()]
    ↓ (Controller 선택)
[Controller.update()]
    ↓ (위치 계산)
[preventCameraJitter()]
    ↓ (THREE.js 적용)
[Camera Position & Rotation]
```

## 사용 방법

### **기본 사용**
```typescript
// React 컴포넌트에서
function Scene() {
  return (
    <Canvas>
      <Camera />  {/* 자동으로 카메라 제어 */}
      {/* 다른 3D 요소들 */}
    </Canvas>
  );
}
```

### **모드 변경**
```typescript
// Zustand 스토어를 통해
const setMode = useGaesupStore((state) => state.setMode);
setMode({ control: 'chase' });  // 추적 카메라로 변경
```

### **설정 변경**
```typescript
// 카메라 옵션 조정
const setCameraOption = useGaesupStore((state) => state.setCameraOption);
setCameraOption({
  xDistance: 20,  // 거리 조정
  yDistance: 12,
  zDistance: 20,
  fov: 60,        // 시야각 조정
});
```

## 성능 최적화

### **1. 레이어 분리 효과**
- **1레이어**: useFrame에서 60fps 실행 - React 리렌더링 영향 없음
- **2레이어**: 상태 변경 시만 실행 - 필요할 때만 업데이트
- **3레이어**: UI 변경 시만 실행 - 사용자 인터랙션에만 반응

### **2. 메모리 최적화**
- `useRef`로 엔진 인스턴스 유지
- Controller 인스턴스 재사용
- THREE.js 객체 풀링 (activeStateUtils 내부)

### **3. 연산 최적화**
- `preventCameraJitter`: 검증된 프레임 독립적 보간
- Vector3 클론 최소화
- 불필요한 계산 스킵

## 주의사항 및 금지사항

### **1레이어에서 절대 금지:**
```typescript
// ❌ 금지 - React hooks 사용
const [state, setState] = useState();
useEffect(() => {}, []);

// ❌ 금지 - Zustand 스토어 직접 접근
const store = useGaesupStore();

// ❌ 금지 - React 컴포넌트 의존성
import SomeComponent from './SomeComponent';
```

### **2레이어에서 주의사항:**
```typescript
// ❌ 금지 - useFrame 내부에서 상태 변경
useFrame(() => {
  setState(newValue);  // 리렌더링 폭탄!
});

// ✅ 권장 - 상태는 이벤트에서만 변경
useEffect(() => {
  // 상태 변경 로직
}, [dependency]);
```

## 확장 계획

이 레이어 구조는 다른 도메인으로 확장될 예정:

### **Physics System**
```
physics/
├── core/           # 1레이어 - Rapier 엔진 로직
├── controllers/    # 2레이어 - 물리 상태 관리
├── hooks/          # 2레이어 - usePhysics
└── store/          # 2레이어 - 물리 설정 스토어
```

### **Animation System**
```
animation/
├── core/           # 1레이어 - THREE.js AnimationMixer
├── controllers/    # 2레이어 - 애니메이션 제어
├── hooks/          # 2레이어 - useAnimation
└── store/          # 2레이어 - 애니메이션 상태
```

## 레이어 준수 체크리스트

각 도메인 구현 시 다음을 확인:

### **1레이어 체크리스트**
- [ ] React hooks 사용 없음
- [ ] Zustand store 직접 접근 없음
- [ ] 순수 함수/클래스만 포함
- [ ] useFrame에서 안전하게 실행 가능
- [ ] THREE.js/Rapier 등 성능 중심 라이브러리만 사용

### **2레이어 체크리스트**
- [ ] 1레이어에서 상태 변경 유발 없음
- [ ] useFrame 내부에서 setState 없음
- [ ] React 최적화 패턴 적용
- [ ] 적절한 의존성 배열 설정

### **3레이어 체크리스트**
- [ ] 자유로운 React 패턴 사용
- [ ] 사용자 인터페이스 담당
- [ ] 하위 레이어 올바른 호출

