# Camera Domain Config Classification

## Store Config (유저 설정값)

초기 설정 또는 유저가 설정 페이지에서 변경하는 값들입니다.

```typescript
type CameraConfig = {
  defaultController: string
  smoothing: number
  distance: number
  height: number
  angle: number
  bobbing: boolean
  bobbingIntensity: number
  rotation: number
  collisionChecks: boolean
  anticipation: number
  lag: number
  leadDistance: number
  updateFrequency: number
  enableLOD: boolean
  fovPreference: number
  mouseLookSensitivity: number
  invertY: boolean
  autoSwitchDistance: number
}
```

**언제 변경되는가:**
- 유저가 Camera Settings에서 조정
- 게임 시작 시 초기 설정
- 게임 모드 변경 시 (1인칭/3인칭)
- 접근성 설정 변경 시

**데이터 플로우:**
```
Camera Settings UI → Store → Bridge → Core CameraSystem (1회성 전달)
```

## Constants (절대 불변값)

카메라 시스템에서 절대 변하지 않는 상수들입니다.

```typescript
export const CAMERA_CONSTANTS = {
  MIN_DISTANCE: 1.0,
  MAX_DISTANCE: 100.0,
  MIN_HEIGHT: -10.0,
  MAX_HEIGHT: 50.0,
  MIN_FOV: 10,
  MAX_FOV: 120,
  MIN_SMOOTHING: 0.01,
  MAX_SMOOTHING: 1.0,
  COLLISION_PADDING: 0.5,
  RAYCAST_LAYERS: 1,
  FRUSTUM_CULL_MARGIN: 1.0,
  LOD_DISTANCE_NEAR: 10,
  LOD_DISTANCE_FAR: 100,
  MATRIX_EPSILON: 0.0001
} as const
```

**특징:**
- 카메라 하드웨어 제약
- Three.js 엔진 한계값
- 성능 최적화 임계값

## Realtime State (매 프레임 변화)

Core Layer에서 관리하며 Store에 절대 저장하면 안 되는 값들입니다.

```typescript
type CameraState = {
  currentController: string
  position: THREE.Vector3
  lookAt: THREE.Vector3
  up: THREE.Vector3
  worldMatrix: THREE.Matrix4
  projectionMatrix: THREE.Matrix4
  viewMatrix: THREE.Matrix4
  frustum: THREE.Frustum
  isTransitioning: boolean
  transitionProgress: number
  lastUpdateTime: number
  culledObjects: Set<string>
  visibleObjects: Set<string>
  renderDistance: number
  screenBounds: {
    left: number
    right: number
    top: number
    bottom: number
  }
}

type CameraMetrics = {
  frameTime: number
  cullingTime: number
  matrixCalculationTime: number
  visibleObjectCount: number
  culledObjectCount: number
  frustumTestCount: number
}
```

**특징:**
- 매 프레임(60fps) 업데이트
- Three.js Camera에서 직접 계산
- 매트릭스 연산 결과
- React 상태 관리 절대 금지

## 잘못된 분류 예시

```typescript
// ❌ 잘못된 분류 - 이런 값들이 Store에 있으면 안됨
type WrongConfig = {
  currentPosition: THREE.Vector3      // 매 프레임 변화 → Realtime State
  isTransitioning: boolean            // 실시간 상태 → Realtime State  
  visibleObjects: string[]            // 컬링 결과 → Realtime State
  VIEWPORT_WIDTH: number              // 절대 불변 → Constants
}
```

## 올바른 구현 패턴

### Config 변경 시 (1회성)
```typescript
// Settings에서 camera distance 변경
const updateCameraDistance = (distance: number) => {
  cameraStore.setConfig({ distance })
}

// Hook에서 감지하여 Core로 전달
useEffect(() => {
  cameraSystem.updateConfig(cameraStore.config)
}, [cameraStore.config.distance])

// Core에서 적용
class CameraSystem {
  updateConfig(config: CameraConfig) {
    this.distance = config.distance
    this.smoothing = config.smoothing
    this.activeController = this.controllers.get(config.defaultController)
  }
}
```

### 실시간 카메라 계산 (매 프레임)
```typescript
// Core Layer - Store 접근 없이 기존 설정값 사용
class CameraSystem {
  update(deltaTime: number, targetPosition: THREE.Vector3) {
    const controller = this.activeController
    
    const targetCameraPosition = controller.calculatePosition(
      targetPosition,
      this.distance,
      this.height,
      this.angle
    )
    
    this.position.lerp(targetCameraPosition, this.smoothing * deltaTime)
    this.lookAt.copy(targetPosition)
    
    this.camera.position.copy(this.position)
    this.camera.lookAt(this.lookAt)
    this.camera.updateMatrixWorld()
    
    this.updateFrustum()
    this.performCulling()
  }
  
  private updateFrustum() {
    this.frustum.setFromProjectionMatrix(
      this.camera.projectionMatrix.clone().multiply(this.camera.matrixWorldInverse)
    )
  }
}
```

### 카메라 전환 (상태 기반)
```typescript
// Core Layer - 부드러운 카메라 전환
class CameraTransitionManager {
  startTransition(fromController: string, toController: string) {
    this.isTransitioning = true
    this.transitionProgress = 0
    this.fromPosition = this.camera.position.clone()
    this.toController = this.controllers.get(toController)
  }
  
  updateTransition(deltaTime: number) {
    if (!this.isTransitioning) return
    
    this.transitionProgress += deltaTime / this.transitionDuration
    
    if (this.transitionProgress >= 1) {
      this.completeTransition()
    } else {
      this.interpolateTransition()
    }
  }
}
```

### 카메라 컬링 시스템 (성능 최적화)
```typescript
// Core Layer - 절두체 컬링
class CameraFrustumCuller {
  performCulling(objects: THREE.Object3D[]) {
    this.visibleObjects.clear()
    this.culledObjects.clear()
    
    objects.forEach(object => {
      object.updateMatrixWorld()
      const boundingSphere = object.geometry?.boundingSphere
      
      if (boundingSphere && this.frustum.intersectsSphere(boundingSphere)) {
        this.visibleObjects.add(object.uuid)
        object.visible = true
      } else {
        this.culledObjects.add(object.uuid)
        object.visible = false
      }
    })
  }
  
  applyLOD(object: THREE.Object3D, distance: number) {
    if (distance > CAMERA_CONSTANTS.LOD_DISTANCE_FAR) {
      object.material = this.lowQualityMaterial
    } else if (distance > CAMERA_CONSTANTS.LOD_DISTANCE_NEAR) {
      object.material = this.mediumQualityMaterial
    } else {
      object.material = this.highQualityMaterial
    }
  }
}
```

이 분류를 통해 카메라 성능 최적화와 부드러운 사용자 경험을 보장합니다. 