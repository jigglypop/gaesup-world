# 🎥 카메라 시스템 리팩토링 계획서

## 1. 최종 목표

기존에 여러 컴포넌트, 훅, 스토어에 분산되어 있던 카메라 관련 로직을 하나의 **`CameraManager` 클래스**로 통합하고, React 컴포넌트에서는 `ref`를 통해 이 관리 객체를 참조하는 **계층화된 아키텍처**로 전환합니다.

- **관심사 분리(SoC):** React 컴포넌트는 '카메라 렌더링' 책임만 지고, 모든 카메라의 동작(움직임, 상태, 충돌, 블렌딩) 로직은 `CameraManager`가 전담합니다.
- **API 명료화:** 카메라 제어가 필요할 때 `cameraManagerRef.current.changeMode('firstPerson')`과 같이 명확한 API를 호출하는 방식으로 변경합니다.
- **상태 캡슐화:** 전역 스토어(Zustand)에 흩어져 있던 카메라 관련 상태를 `CameraManager` 내부에서 관리하여 복잡도를 낮추고 데이터 흐름을 단순화합니다.

---

## 2. 단계별 실행 계획

### Phase 1: `CameraManager` 핵심 구현

> 카메라의 모든 로직을 담을 '엔진' 클래스와 이를 React에서 사용하기 위한 훅(Hook)을 구현합니다.

#### Task 1-1: `CameraManager` 클래스 생성

- **파일 경로:** `src/core/motions/camera/CameraManager.ts` (신규 생성)
- **핵심 역할:**

  - 카메라의 모든 로직(상태, 제어, 효과, 충돌)을 캡슐화합니다.
  - `update(delta)` 메서드를 통해 프레임별 업데이트를 처리합니다.
  - 외부에서 카메라를 제어할 수 있는 명시적인 메서드를 제공합니다.

- **구현 코드 (초안):**

  ```typescript
  import * as THREE from 'three';
  import { CameraBlendManager } from './blend/CameraBlendManager';
  import { SmartCollisionSystem } from '../systems/SmartCollisionSystem';
  import { CameraEffects } from './effects/CameraEffects';
  import { CameraController, controllerMap } from './control';
  import { CameraOptionType, gaesupWorldContextType } from '../../types';

  export class CameraManager {
    public camera: THREE.PerspectiveCamera;
    private target: THREE.Object3D;
    private scene: THREE.Scene;

    // Sub-systems
    private blendManager = new CameraBlendManager();
    private collisionSystem = new SmartCollisionSystem();
    private effects = new CameraEffects();

    // State
    private currentController: CameraController;
    private cameraOption: CameraOptionType = {}; // Internal state for options

    constructor(camera: THREE.PerspectiveCamera, target: THREE.Object3D, scene: THREE.Scene) {
      this.camera = camera;
      this.target = target;
      this.scene = scene;
      this.currentController = controllerMap.thirdPerson; // Default controller
    }

    public setController(mode: keyof typeof controllerMap): void {
      if (controllerMap[mode]) {
        this.currentController = controllerMap[mode];
      }
    }

    public setOptions(options: Partial<CameraOptionType>): void {
      this.cameraOption = { ...this.cameraOption, ...options };
    }

    public update(delta: number, worldContext: gaesupWorldContextType): void {
      // Logic from useCameraFrame.ts will be moved here
      // 1. Update effects
      this.effects.update(delta, this.camera);

      // 2. Update blending
      const isBlending = this.blendManager.update(delta, this.camera);
      if (isBlending) return; // Skip controls if blending

      // 3. Execute current camera controller logic
      this.currentController({
        worldContext,
        cameraOption: this.cameraOption,
        // ... other necessary props
      });

      // 4. Check for collisions
      const targetPos = this.camera.position.clone();
      const safePos = this.collisionSystem.checkCollision(
        this.camera.position,
        targetPos,
        this.scene,
        [worldContext.activeState?.mesh],
      );
      this.camera.position.copy(safePos);
    }
  }
  ```

#### Task 1-2: `useCameraManager` 훅 생성

- **파일 경로:** `src/core/motions/camera/hooks/useCameraManager.ts` (신규 생성)
- **핵심 역할:**

  - `CameraManager` 인스턴스를 생성하고 React 생명주기에 맞춰 관리합니다.
  - `useUnifiedFrame`을 통해 매 프레임 `manager.update()`를 호출합니다.

- **구현 코드 (초안):**

  ```typescript
  import { useRef } from 'react';
  import { useThree } from '@react-three/fiber';
  import { useUnifiedFrame } from '@hooks/useUnifiedFrame';
  import { useGaesupContext } from '@stores/gaesupStore';
  import { CameraManager } from '../CameraManager';
  import * as THREE from 'three';

  export const useCameraManager = (targetRef: React.RefObject<THREE.Object3D>) => {
    const { camera, scene } = useThree();
    const worldContext = useGaesupContext();
    const managerRef = useRef<CameraManager>();

    if (!managerRef.current && targetRef.current) {
      managerRef.current = new CameraManager(
        camera as THREE.PerspectiveCamera,
        targetRef.current,
        scene,
      );
    }

    useUnifiedFrame(
      'cameraManager',
      (state, delta) => {
        if (worldContext) {
          managerRef.current?.update(delta, worldContext);
        }
      },
      1,
    ); // Priority 1, after physics

    return managerRef;
  };
  ```

---

### Phase 2: 기존 로직 통합 및 리팩토링

> 새로운 `CameraManager`에 기존 카메라 로직을 모두 이전하고, 불필요해진 파일들을 제거합니다.

#### Task 2-1: `PhysicsEntity.tsx` 리팩토링

- **변경 내용:**

  1.  기존 `Camera(cameraProps)` 직접 호출 코드를 **제거**합니다.
  2.  `useCameraManager` 훅을 호출하여 카메라 시스템을 활성화합니다.

- **변경 후 코드 예시 (`PhysicsEntity.tsx`):**

  ```typescript
  // ... imports
  import { useCameraManager } from '../camera/hooks/useCameraManager';

  export const PhysicsEntity = forwardRef<RapierRigidBody, PhysicsEntityProps>(
    (props, rigidBodyRef) => {
      // ...
      const { size } = useGltfAndSize({ url: props.url || '' });
      // ...

      // Activate and manage camera system via the new hook
      useCameraManager(props.innerGroupRef as React.RefObject<THREE.Object3D>);

      // The direct call to `Camera(cameraProps)` is completely REMOVED.

      // ...
      return (
        // ... JSX
      );
    },
  );
  ```

#### Task 2-2: 기존 카메라 관련 파일 로직 이전 및 제거

- **작업 내용:**

  - **`useCameraFrame.ts`:** 내부의 모든 로직 (`frameCallback` 등)을 `CameraManager.update` 메서드로 이전합니다.
  - **`useCameraEvents.ts`:** `cameraOption` 상태 관리 로직을 `CameraManager` 내부 상태로 이전합니다.
  - **`camera/index.tsx`:** `Camera` 컴포넌트의 역할을 `useCameraManager`가 대체하므로 제거합니다.

- **제거 대상 파일 목록:**
  1.  `src/core/motions/camera/hooks/useCameraFrame.ts`
  2.  `src/core/motions/camera/hooks/useCameraEvents.ts`
  3.  `src/core/motions/camera/index.tsx`

---

### Phase 3: 상태 관리 및 타입 정리

> 카메라 시스템이 자체적으로 상태를 관리하게 되었으므로, 전역 스토어에서 관련 상태를 제거하여 아키텍처를 완성합니다.

#### Task 3-1: Zustand 스토어 정리

- **작업 내용:** `CameraManager`로 책임이 이전된 상태들을 전역 스토어에서 제거합니다.
- **제거 대상 상태 (예시):**
  - `cameraOption`
  - `cameraStates`
  - `currentCameraStateName`
  - `setCameraOption` 함수
- **대상 파일:** `src/core/stores/slices/cameraSlice.ts` (또는 관련 슬라이스 파일)

#### Task 3-2: 타입 정의 업데이트

- **작업 내용:** 제거된 스토어 상태와 관련된 타입(`GaesupState` 등)을 업데이트하여 타입 시스템의 일관성을 유지합니다.
- **대상 파일:** `src/core/types/core.ts`, `src/core/stores/types.ts` 등

---

## 3. 기대 효과

- **단일 책임 원칙(SRP):** 컴포넌트와 카메라 로직의 책임이 명확하게 분리됩니다.
- **응집도 향상:** 카메라와 관련된 모든 코드가 `src/core/motions/camera/` 디렉토리 내에 모여있게 됩니다.
- **유지보수성 향상:** 카메라 관련 수정이 필요할 때 `CameraManager`만 보면 되므로 디버깅 및 기능 추가가 용이해집니다.
- **성능 투명성:** 카메라의 프레임별 연산이 `update` 메서드 한 곳에 모여있어 성능 분석 및 최적화가 쉬워집니다.
