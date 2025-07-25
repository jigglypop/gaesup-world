# Export Automation System

## 개요

어노테이션 기반의 export 자동화 시스템으로 다음 문제들을 해결합니다:

- 매번 새 파일 추가 시 `index.ts`에서 수동 export 관리
- 관리 포인트 증가로 인한 유지보수 어려움
- 의존성 제어 역전(DI) 미적용
- export 순서와 우선순위 관리 어려움

## 핵심 데코레이터

### @Injectable
클래스를 DI 컨테이너에 자동 등록하고 export합니다.

```typescript
@Injectable({ scope: 'singleton' })
export class UserService {
  getUsers() {
    return []
  }
}
```

### @Service
도메인별 서비스로 등록하고 자동 시작 옵션을 제공합니다.

```typescript
@Service('motions', { autoStart: true })
export class MotionService {
  start() {
    console.log('Motion service started')
  }
}
```

### @Bridge
브릿지 클래스를 자동 등록하고 DI 컨테이너에 추가합니다.

```typescript
@Bridge('camera')
export class CameraBridge {
  updateCameraConfig(config: CameraConfig) {
    // 카메라 설정 업데이트
  }
}
```

### @Component
React 컴포넌트나 일반 클래스를 export하고 선택적으로 DI에 등록합니다.

```typescript
@Component({ priority: 100, lazy: false })
export class CameraController {
  constructor() {
    // 컴포넌트 초기화
  }
}
```

### @Export
기본 export 데코레이터로 세밀한 제어가 가능합니다.

```typescript
@Export({ 
  type: 'class', 
  priority: 1000,
  dependencies: ['MotionService'] 
})
export class PhysicsEngine {
  // 물리 엔진 구현
}
```

## 빌드 스크립트 사용법

### 일회성 생성
```bash
node scripts/generate-exports.js
```

### 파일 변경 감시
```bash
node scripts/generate-exports.js --watch
```

### 상세 로그 출력
```bash
node scripts/generate-exports.js --verbose
```

## 생성되는 index.ts 예시

스크립트가 자동으로 생성하는 `index.ts` 파일의 예시:

```typescript
// This file is auto-generated by scripts/generate-exports.js
// Do not edit manually - changes will be overwritten

export { MotionService } from './MotionService'
export { CameraBridge } from './CameraBridge'
export { CameraController } from './CameraController'
export { PhysicsEngine } from './PhysicsEngine'
export { UserService } from './UserService'
```

## 우선순위 시스템

Export 순서는 우선순위에 따라 결정됩니다:

1. **1000**: `@Injectable`, `@Service`, `@Bridge` (핵심 서비스)
2. **100**: `@Component` (컴포넌트)
3. **50**: functions, constants (유틸리티)
4. **10**: interfaces, types (타입 정의)
5. **0**: 기본 클래스

## 실제 사용 예시

### 1. Motion Domain 리팩토링

**Before (수동 관리):**
```typescript
// src/core/motions/index.ts
export { MotionSystem } from './core/MotionSystem'
export { PhysicsEngine } from './core/PhysicsEngine'
export { MotionBridge } from './bridge/MotionBridge'
export { MotionController } from './controller/MotionController'
```

**After (자동 생성):**
```typescript
// src/core/motions/core/MotionSystem.ts
@Service('motions', { autoStart: true })
export class MotionSystem {
  // 모션 시스템 구현
}

// src/core/motions/core/PhysicsEngine.ts
@Injectable({ scope: 'singleton' })
export class PhysicsEngine {
  // 물리 엔진 구현
}

// src/core/motions/bridge/MotionBridge.ts
@Bridge('motions')
export class MotionBridge {
  // 브릿지 구현
}

// src/core/motions/controller/MotionController.ts
@Component({ priority: 100 })
export class MotionController {
  // 컨트롤러 구현
}
```

### 2. 의존성 주입 자동화

```typescript
@Service('camera')
export class CameraService {
  constructor(
    private motionService: MotionService // 자동 주입
  ) {}
}

// DI 컨테이너에서 자동으로 의존성 해결
const cameraService = DIContainer.getInstance().resolve(CameraService)
```

## 이점

### 1. 관리 포인트 최소화
- 새 클래스 추가 시 데코레이터만 추가
- `index.ts` 수동 편집 불필요
- 실수로 인한 export 누락 방지

### 2. 의존성 제어 역전
- 자동 DI 컨테이너 등록
- 의존성 자동 해결
- 싱글톤/트랜지언트 스코프 관리

### 3. 명확한 우선순위
- 핵심 서비스 우선 export
- 타입 정의는 마지막 export
- 의존성 순서 자동 정렬

### 4. 일관된 패턴
- 모든 도메인에서 동일한 패턴 적용
- 새 개발자 온보딩 용이
- 코드 리뷰 효율성 증대

## 마이그레이션 가이드

### 단계 1: 기존 수동 export 백업
```bash
find src -name "index.ts" -exec cp {} {}.backup \;
```

### 단계 2: 데코레이터 추가
각 클래스에 적절한 데코레이터를 추가합니다.

### 단계 3: 자동 생성 실행
```bash
node scripts/generate-exports.js
```

### 단계 4: 결과 검증
- 기존 import가 정상 작동하는지 확인
- 타입 체크 통과 확인
- 빌드 성공 확인

### 단계 5: 백업 파일 제거
```bash
find src -name "*.backup" -delete
```

이 시스템을 통해 export 관리의 복잡성을 대폭 줄이고, 의존성 주입을 통한 깔끔한 아키텍처를 구축할 수 있습니다. 