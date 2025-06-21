# `src/core` 폴더 구조 분석 및 개선 제안 (2024년 업데이트)

이 문서는 `src/core` 폴더 내부의 각 모듈과 컴포넌트의 역할, 현재 상태, 그리고 개선점에 대한 분석을 담고 있습니다.

## 총평

`gaesup-world`의 `src/core`는 3D 인터랙션을 구현하기 위한 강력한 기반을 갖추고 있습니다. 특히 `utils`, `error` 디렉토리와 `Minimap`, `UnifiedFrame`, `벡터 풀링` 같은 일부 컴포넌트/훅에서는 성능 최적화, 견고한 에러 처리, 뛰어난 아키텍처 패턴이 돋보입니다.

**긍정적인 측면:**
- **리소스 관리**: `useGltfAndSize`를 통한 GLTF 캐싱 및 참조 계수 관리가 이미 잘 구현됨
- **성능 최적화**: 벡터 풀링, 메모이제이션 등 고도의 최적화 기법 적용
- **프레임 관리**: `OptimizedFrameManager`를 통한 우선순위 기반 프레임 콜백 시스템
- **에러 처리**: Sentry 연동을 포함한 견고한 ErrorBoundary 시스템

하지만, 몇 가지 핵심적인 부분에서 개선이 필요합니다.

**주요 문제점:**
1. **상태 관리의 복잡성과 일관성 부족**: 13개의 slice로 과도하게 분산된 상태, `useGaesupDispatch`/`useGaesupContext` 같은 불필요한 추상화 계층
2. **React 원칙 위반**: `Camera(props)` 함수 직접 호출, DOM 직접 조작 (`innerHTML` 사용)
3. **심각한 Prop Drilling**: 4계층의 컴포넌트 체인에서 수많은 props 전달
4. **코드 품질 불일치**: 일부 모듈은 매우 우수하나, `useRideable` 같은 모듈은 심각한 안티패턴 존재

**주요 개선 방향:**
- **상태 관리 단순화**: 13개 slice를 도메인별로 통합하고, 불필요한 추상화 제거
- **컴포넌트 구조 리팩토링**: 4계층 구조를 2-3계층으로 단순화
- **React 원칙 준수**: 함수 직접 호출 → 컴포넌트 렌더링, DOM 직접 조작 → React 방식
- **품질 균일화**: 우수한 모듈의 패턴을 다른 모듈에 적용

---

## 1. `component/` - 컴포넌트 모듈

### 현재 구조 분석
**4계층 컴포넌트 체인:** `GaesupController` → `GaesupComponent` → `EntityController` → `PhysicsEntity`

### 세부 컴포넌트 분석

#### **`GaesupWorld`** (점수: 9/10)
- **역할**: 3D 월드의 루트 컴포넌트
- **장점**: 
  - 단순하고 명확한 로직 (35줄)
  - props → zustand 스토어 주입 패턴이 적절
  - `Suspense`를 통한 비동기 로딩 처리
- **개선점**: 3개의 개별 `useEffect`를 하나의 커스텀 훅으로 통합 가능

#### **`GaesupController`** (점수: 5/10)
- **역할**: 제어 가능한 캐릭터/객체를 위한 래퍼 컴포넌트
- **문제점**:
  - 렌더링 함수 내에서 복잡한 `groundRay`, `cameraRay` 객체 직접 생성 (성능 이슈)
  - 47줄의 거대한 props 객체 생성 후 전달
- **개선 제안**: `useMemo`를 사용하거나 `useRaycasting` 커스텀 훅으로 분리

#### **`GaesupComponent`** (점수: 3/10)
- **역할**: props 전달만 하는 얇은 래퍼 (14줄)
- **문제점**: 불필요한 추상화 계층으로 컴포넌트 구조만 복잡하게 만듦
- **개선 제안**: 제거하고 `GaesupController`가 `EntityController` 직접 렌더링

#### **`Clicker`** (점수: 7/10)
- **장점**: `memo` 사용으로 최적화
- **문제점**: 스토어의 `queue` 타입 불안정, 복잡한 경로 렌더링 로직
- **개선 제안**: `queue` 타입을 `THREE.Vector3[]`로 명확히, 로직 단순화

#### **`Gamepad`** (점수: 4/10)
- **문제점**:
  - `GamePad`와 `Gamepad` 혼란스러운 이름
  - `'clicker'` 모드에서만 렌더링되는 제한적 로직
  - `useKeyboard` 훅 중복 호출
- **개선 제안**: 전체적인 네이밍과 로직 재검토 필요

#### **`Minimap`** (점수: 10/10) ⭐
- **장점**:
  - UI/로직/데이터의 완벽한 관심사 분리
  - 명확한 API와 뛰어난 확장성
  - `useMinimap` 훅을 통한 로직 추상화
- **참고 사항**: 다른 컴포넌트 구현 시 참고할 모범 사례

#### **`Rideable`** (점수: 3/10)
- **문제점**:
  - UI 안내와 실제 이벤트 핸들러 불일치 (F키 vs onClick)
  - 존재하지 않는 파일 import 시도
- **개선 제안**: 키보드 이벤트로 변경, import 경로 정리

#### **`Teleport`** (점수: 10/10) ⭐
- **장점**: `useTeleport` 훅을 사용하는 단순하고 명확한 구조

### 전체 개선 제안
1. **컴포넌트 계층 단순화**: 4계층 → 2-3계층으로 축소
2. **성능 최적화**: 렌더링 함수 내 객체 생성 → `useMemo` 활용
3. **패턴 통일**: `Minimap`, `Teleport`의 우수한 패턴을 다른 컴포넌트에 적용

---

## 2. `constants/` - 상수 관리

- **점수**: 9/10
- **장점**: 명확한 네이밍, 중앙 집중식 관리
- **개선 제안**: 규모 확장 시 도메인별 파일 분리 (`input.ts`, `ui.ts` 등)

---

## 3. `debug/` - 디버깅 도구

### **`CameraDebugger`** (점수: 10/10) ⭐
- **장점**: 메모리 관리와 API가 잘 설계된 순수 TS 클래스

### **`PerfMonitor`** (점수: 4/10)
- **기능**: FPS, 메모리, WebGL 정보 등 종합 성능 모니터링
- **문제점**: React 렌더링 대신 `innerHTML` 직접 조작 (378줄)
- **개선 제안**: 
  - `ReactDOM.createPortal` 사용으로 변경
  - DOM 쿼리 대신 Rapier world 인스턴스에서 직접 정보 수집

---

## 4. `error/` - 에러 처리

- **점수**: 10/10 ⭐
- **장점**:
  - 표준 React Error Boundary 완벽 구현
  - Sentry 연동을 통한 프로덕션 레벨 에러 리포팅
  - `GaesupError` 커스텀 타입으로 체계적 에러 관리
- **개선 제안**: 없음 (모범 사례)

---

## 5. `hooks/` - 커스텀 훅

### **`useKeyboard`** (점수: 7/10)
- **장점**: 
  - 전역 키보드 상태 관리
  - `visibilitychange` 이벤트 처리
  - `pushKey` 함수로 다른 컴포넌트 지원
- **문제점**: `clicker` 관련 로직이 직접 포함되어 단일 책임 원칙 위배
- **개선 제안**: clicker 로직을 별도 훅으로 분리

### **`useMinimap`** (점수: 8/10)
- **장점**: 복잡한 캔버스 로직을 훌륭하게 추상화
- **문제점**: 모든 그리기 로직이 `updateCanvas` 하나의 거대한 함수에 집중
- **개선 제안**: `drawBackground`, `drawMarkers`, `drawPlayer` 등으로 함수 분리

### **`useRideable`** (점수: 2/10) ⚠️
- **심각한 문제점**:
  - `innerHTML`로 UI 직접 생성 (React 원칙 위반)
  - `zustand`, `context`, `dispatch` 혼용하는 혼란스러운 상태 관리
  - 상태 객체 직접 변경 (불변성 위반)
  - 314줄의 복잡하고 비일관적인 코드
- **개선 제안**: 전면적인 리팩토링 필요
  - 상태 관리를 zustand로 통일
  - DOM 직접 조작 제거
  - React 컴포넌트로 UI 렌더링

### **`useUnifiedFrame`** (점수: 10/10) ⭐
- **장점**:
  - `OptimizedFrameManager`를 통한 우선순위 기반 콜백 관리
  - 개별 콜백 에러 처리 및 재진입 방지
  - 최대 구독 수 제한 등 견고한 설계
- **참고 사항**: 게임 루프 관리의 모범 사례

---

## 6. `motions/` - 물리/모션 시스템

### **`PhysicsEntity`** (점수: 6/10)
- **장점**:
  - GLTF, 물리, 애니메이션의 통합적 관리
  - `SkeletonUtils`를 통한 모델 복제
  - 상세한 메모리 관리 (dispose 로직)

- **React 원칙 위반 문제**:
  ```typescript
  // ❌ 문제: 함수를 직접 호출 (PhysicsEntity.tsx:118)
  Camera(cameraProps);
  
  // ✅ 해결책: 컴포넌트로 렌더링
  <Camera {...cameraProps} />
  ```

- **개선 제안**:
  - `Camera` 함수 → React 컴포넌트로 변환
  - Prop drilling 해결을 위한 zustand 스토어 직접 사용

### **`usePhysicsLoop`** (점수: 8/10)
- **정정 사항**: 보고서 초기 분석과 달리 조건부 훅 호출 문제 없음
- **장점**: 152줄의 체계적인 물리 계산 로직
- **개선점**: 캐릭터 정지 시 물리 연산 최적화 여지

### **카메라 시스템** (점수: 7/10)
- **기능**: 복잡한 블렌딩 및 충돌 감지 처리
- **문제점**: 매 프레임 무조건 실행되는 연산들
- **개선 제안**: 카메라 업데이트 스로틀링 적용

---

## 7. `stores/` - 상태 관리

### **현재 상태**
- **13개 slice**: `activeState`, `animation`, `block`, `camera`, `cameraOption`, `clickerOption`, `gameStates`, `input`, `minimap`, `mode`, `rideable`, `sizes`, `urls`
- **점수**: 5/10

### **주요 문제점**
1. **과도한 분산**: 관련 상태들이 여러 slice에 분산
   - 캐릭터 관련: `animation`, `gameStates`, `activeState`
   - 카메라 관련: `camera`, `cameraOption`

2. **불필요한 추상화**:
   ```typescript
   // ❌ 문제: Context가 아닌데 Context라고 명명
   const { states } = useGaesupContext();
   
   // ❌ 문제: zustand 위에 불필요한 dispatch 패턴
   const dispatch = useGaesupDispatch();
   
   // ✅ 해결책: 직접 사용
   const states = useGaesupStore(s => s.states);
   ```

### **개선 제안**
1. **도메인별 통합**:
   - `CharacterSlice`: `activeState` + `animation` + `gameStates`
   - `CameraSlice`: `camera` + `cameraOption`
   - `UISlice`: `minimap` + `clickerOption`

2. **추상화 제거**: `useGaesupDispatch`, `useGaesupContext` 훅 제거

---

## 8. `types/` - 타입 정의

- **점수**: 6/10
- **문제점**: 도메인별 타입이 중앙 집중화되어 있음
- **개선 제안**: 타입을 해당 도메인으로 이전
  - `ActiveState`, `GameStates` → `stores/types.ts`
  - `ControllerRefs` → `motions/types.ts`

---

## 9. `utils/` - 유틸리티

### **벡터 풀링** (점수: 10/10) ⭐
```typescript
// 객체 풀링으로 GC 부하 감소
const vectorPool: THREE.Vector3[] = [];
function getPooledVector(): THREE.Vector3 {
  return vectorPool.pop() || new THREE.Vector3();
}
```

### **GLTF 리소스 관리** (점수: 10/10) ⭐
```typescript
// 참조 계수 기반 캐싱 시스템
const gltfCache = new Map<string, { gltf: GLTF; refCount: number; size: THREE.Vector3 }>();
```

- **특장점**: 메모리 최적화에 대한 깊은 이해를 보여주는 고품질 구현

---

## 우선순위별 개선 계획

### **Phase 1: 긴급 (1-2주)**
1. **`useRideable` 전면 리팩토링**
   - DOM 직접 조작 → React 컴포넌트
   - 상태 관리 통일
   
2. **React 원칙 위반 수정**
   - `Camera(props)` → `<Camera {...props} />`
   - `PerfMonitor` innerHTML → Portal

### **Phase 2: 중요 (3-4주)**
1. **컴포넌트 구조 단순화**
   - `GaesupComponent` 제거
   - 4계층 → 2-3계층 구조

2. **상태 관리 개선**
   - 13개 slice → 6-7개로 통합
   - 불필요한 추상화 훅 제거

### **Phase 3: 개선 (5-8주)**
1. **성능 최적화**
   - 카메라 업데이트 스로틀링
   - 렌더링 함수 내 객체 생성 최적화

2. **코드 품질 통일**
   - 우수한 패턴(`Minimap`, `utils`)을 다른 모듈에 적용
   - 타입 정의 도메인별 이전

### **Phase 4: 완성 (지속적)**
1. **문서화 및 테스트**
2. **성능 모니터링 및 최적화**
3. **새로운 기능 추가 시 확립된 패턴 적용**

---

## 코드 품질 매트릭스

| 모듈 | 아키텍처 | React 준수 | 성능 | 유지보수성 | 전체 점수 |
|------|----------|------------|------|------------|----------|
| `useUnifiedFrame` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **10/10** |
| `utils/vector` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **10/10** |
| `utils/gltf` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **10/10** |
| `ErrorBoundary` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **10/10** |
| `Minimap` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **10/10** |
| `useMinimap` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | **8/10** |
| `usePhysicsLoop` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | **8/10** |
| `PhysicsEntity` | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | **6/10** |
| `GaesupController` | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | **5/10** |
| `stores` | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | **5/10** |
| `PerfMonitor` | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ | **4/10** |
| `Gamepad` | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | **4/10** |
| `GaesupComponent` | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | **3/10** |
| `useRideable` | ⭐ | ⭐ | ⭐⭐ | ⭐ | **2/10** |

## 실제 코드 분석에서 발견된 주요 사실들

### ✅ **보고서보다 우수한 부분들**
1. **리소스 관리 시스템**: 이미 참조 계수 기반 GLTF 캐싱 구현
2. **벡터 풀링**: 고도의 메모리 최적화 기법 적용
3. **usePhysicsLoop**: 조건부 훅 호출 문제 없음 (보고서 오류 정정)

### ❌ **보고서보다 심각한 부분들**
1. **Slice 과다 분산**: 11개 → 실제 13개로 더 심각
2. **useRideable 품질**: 314줄의 안티패턴 집합체
3. **탈것 시스템**: 보고서에서 누락된 복잡한 기능 존재

### 🔄 **정정된 분석**
- **Camera 함수 호출**: 실제로 `Camera(props)` 형태로 호출됨 (React 위반 확인)
- **컴포넌트 계층**: 정확히 4계층 구조 (`GaesupComponent`는 단순 14줄 래퍼)
- **상태 관리**: `useGaesupDispatch`/`useGaesupContext` 실제 존재 확인

## 최종 권장사항

### **즉시 실행 (Critical)**
```typescript
// 1. useRideable 완전 리팩토링
export function useRideable() {
  // ❌ 현재: innerHTML 직접 조작
  // ✅ 개선: React 컴포넌트 사용
}

// 2. Camera 함수를 컴포넌트로 변환
// ❌ 현재: Camera(cameraProps);
// ✅ 개선: <Camera {...cameraProps} />
```

### **단계적 개선 (High Priority)**
1. **컴포넌트 구조 간소화**: `GaesupComponent` 제거
2. **상태 관리 통합**: 13개 slice → 6-7개 도메인별 통합
3. **추상화 제거**: `useGaesupDispatch`, `useGaesupContext` 삭제

### **지속적 개선 (Medium Priority)**
1. **성능 최적화**: 카메라 시스템 스로틀링
2. **패턴 통일**: 우수한 모듈의 패턴 확산
3. **타입 시스템**: 도메인별 타입 정리

## 결론

`src/core`는 **양극화된 코드 품질**을 보여줍니다. 

**월드클래스 모듈들**:
- `useUnifiedFrame`: 게임 루프 관리의 모범 사례
- `utils/`: 메모리 최적화의 예술작품
- `ErrorBoundary`: 프로덕션 레벨 에러 처리

**긴급 개선 필요 모듈들**:
- `useRideable`: React 원칙 완전 무시
- `stores/`: 과도한 분산과 불필요한 추상화
- `컴포넌트 계층`: 4계층의 무의미한 래퍼들

**핵심 전략**: 우수한 모듈의 패턴을 전체에 적용하여 코드 품질을 균일화하고, 심각한 문제 모듈들을 우선적으로 리팩토링하는 것입니다. 이를 통해 `src/core`는 견고하고 확장성 있는 3D 애플리케이션의 핵심 라이브러리로 발전할 수 있을 것입니다.
