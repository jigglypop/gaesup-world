# 🚀 Core 폴더 리팩토링 계획서

## 📋 개요

**목표**: `src/core` 구조 유지하면서 Zustand(선언적) / ref(명령적) 로직의 일관성 확보  
**현재 문제**: 두 패러다임이 혼재되어 있어 코드 예측성과 유지보수성 저하  
**예상 기간**: 4-6주  

---

## 🎯 리팩토링 원칙

### 1. 패러다임 분리 규칙
- **`stores/`**: 순수 Zustand 상태 관리만
- **`component/` + `hooks/`**: 선언적 패러다임 (Zustand 기반)
- **`internal/`**: 명령적 패러다임 (ref, Three.js 직접 조작)
- **`camera/`, `motions/`**: 기능별 내부 분리
- **`utils/`, `types/`, `constants/`**: 패러다임 중립

### 2. 기존 로직 보호
- 모든 기본 동작은 절대 망가뜨리지 않음
- 단계별 점진적 리팩토링
- 각 단계마다 테스트 및 검증

---

## 📅 Phase별 작업 계획

## **Phase 1: 분석 및 준비** (1주)

### 🔍 **1.1 현재 상태 분석**
- [ ] 각 폴더별 Zustand/ref 사용 패턴 매핑
- [ ] 중복 코드 식별 (특히 camera 관련)
- [ ] 의존성 관계 도식화
- [ ] 리팩토링 리스크 평가

### 📊 **1.2 코드 메트릭 수집**
- [ ] 파일별 복잡도 측정
- [ ] ref.current 사용 빈도 조사
- [ ] useGaesupStore 사용 패턴 분석
- [ ] 컴포넌트 리렌더링 패턴 분석

### 📝 **1.3 리팩토링 가이드라인 작성**
- [ ] 코딩 컨벤션 정의
- [ ] 패러다임별 네이밍 규칙
- [ ] 폴더 구조 세부 규칙
- [ ] 테스트 전략 수립

---

## **Phase 2: 중복 제거 및 구조 정리** (1-2주)

### 🎯 **2.1 Camera 로직 통합** (우선순위: 높음)
```
AS-IS:
├── camera/CameraManager.ts (새 구조)
└── component/camera/CameraController.ts (기존 구조)

TO-BE:
├── camera/
│   ├── declarative/     # Zustand 기반
│   │   ├── useCameraState.ts
│   │   └── CameraComponent.tsx
│   ├── imperative/      # ref 기반
│   │   ├── CameraManager.ts
│   │   └── controllers/
│   └── bridge/          # 연결 계층
│       └── CameraBridge.ts
```

**작업 내용:**
- [ ] 중복된 컨트롤러 맵 통합
- [ ] 타입 정의 통일
- [ ] 기존 컴포넌트와의 호환성 유지
- [ ] 점진적 마이그레이션 경로 구축

### 🔧 **2.2 Internal 폴더 정리**
- [ ] `internal/stores/` → ref 기반 상태만
- [ ] `internal/hooks/` → 명령적 훅들만
- [ ] `internal/systems/` → Three.js 직접 조작
- [ ] 외부 노출 API 최소화

---

## **Phase 3: 각 폴더별 일관성 확보** (2-3주)

### 📦 **3.1 Stores 폴더 (100% Zustand)**
```typescript
stores/
├── slices/              # 기능별 상태 슬라이스
├── types.ts            # Store 타입 정의
├── middleware/         # Zustand 미들웨어
└── selectors/          # 최적화된 셀렉터들
```

**작업 내용:**
- [ ] 모든 ref 로직 제거
- [ ] 순수 함수형 상태 업데이트
- [ ] 셀렉터 최적화
- [ ] 미들웨어 정리

### 🎨 **3.2 Component 폴더 (100% 선언적)**
```typescript
component/[feature]/
├── index.tsx           # 메인 컴포넌트 (선언적)
├── hooks.ts           # 컴포넌트 전용 훅
├── types.ts           # 컴포넌트 타입
└── styles.css         # 스타일
```

**작업 내용:**
- [ ] 모든 ref 로직을 internal로 이동
- [ ] Zustand 상태만 구독
- [ ] 순수 함수형 컴포넌트
- [ ] Props 인터페이스 정리

### 🪝 **3.3 Hooks 폴더 (100% 선언적)**
- [ ] Zustand 기반 커스텀 훅들만
- [ ] ref 로직은 internal/hooks로 이동
- [ ] 상태 변경은 actions 통해서만
- [ ] 사이드 이펙트 최소화

### ⚙️ **3.4 Internal 폴더 (100% 명령적)**
```typescript
internal/
├── systems/           # Three.js 시스템들
├── stores/           # ref 기반 상태
├── hooks/            # 명령적 훅들
└── bridges/          # 외부 연결점
```

**작업 내용:**
- [ ] Three.js 직접 조작 로직 집중
- [ ] ref 기반 상태 관리
- [ ] 성능 크리티컬 로직
- [ ] 외부 API 최소화

### 📹 **3.5 Camera 폴더 분리**
- [ ] `declarative/`: 상태 기반 카메라 컨트롤
- [ ] `imperative/`: Three.js 카메라 직접 조작
- [ ] `bridge/`: 두 시스템 연결
- [ ] 기존 API 호환성 유지

### 🏃 **3.6 Motions 폴더 정리**
- [ ] 물리 계산: imperative 영역
- [ ] 상태 동기화: bridge 패턴
- [ ] 애니메이션 상태: Zustand 관리
- [ ] 성능 최적화

---

## **Phase 4: 연결 및 브릿지 구축** (1주)

### 🌉 **4.1 Bridge 패턴 구현**
```typescript
// 예시: CameraBridge
class CameraBridge {
  // Zustand 상태 → Three.js 객체 동기화
  syncStateToObject(state: CameraState, camera: THREE.Camera): void
  
  // Three.js 객체 → Zustand 상태 동기화
  syncObjectToState(camera: THREE.Camera): CameraState
}
```

### 🔄 **4.2 상태 동기화 시스템**
- [ ] 단방향 데이터 플로우 확립
- [ ] 성능 최적화 (throttling, debouncing)
- [ ] 에러 핸들링 강화
- [ ] 메모리 누수 방지

### 📡 **4.3 이벤트 시스템 정리**
- [ ] Custom event 정리
- [ ] 타입 안전한 이벤트 시스템
- [ ] 구독/해제 생명주기 관리

---

## **Phase 5: 최적화 및 정리** (1주)

### ⚡ **5.1 성능 최적화**
- [ ] 불필요한 리렌더링 제거
- [ ] 메모이제이션 적용
- [ ] Bundle 크기 최적화
- [ ] Tree shaking 개선

### 🧹 **5.2 코드 정리**
- [ ] 사용하지 않는 코드 제거
- [ ] Import 정리
- [ ] 타입 정의 최적화
- [ ] 주석 및 문서화

### 🧪 **5.3 테스트 및 검증**
- [ ] 기능 테스트 수행
- [ ] 성능 벤치마크
- [ ] 메모리 누수 검사
- [ ] 사용자 시나리오 테스트

---

## 📊 예상 리소스 및 리스크

### 👥 **필요 리소스**
- 개발자: 1-2명
- 시간: 4-6주
- 테스트: 각 Phase마다 1-2일

### ⚠️ **주요 리스크**
1. **기존 기능 손상**: 단계별 테스트로 완화
2. **복잡한 의존성**: 점진적 마이그레이션으로 해결
3. **성능 저하**: 벤치마크 기반 최적화
4. **개발 속도 저하**: 명확한 가이드라인으로 완화

### 🎯 **성공 지표**
- [ ] 모든 기존 기능 정상 동작
- [ ] 코드 복잡도 20% 감소
- [ ] 테스트 커버리지 80% 이상
- [ ] 개발자 만족도 향상

---

## 📋 체크리스트

### Phase 1 완료 조건
- [ ] 현재 상태 분석 보고서 작성
- [ ] 리팩토링 가이드라인 완성
- [ ] 리스크 평가 완료

### Phase 2 완료 조건
- [ ] Camera 중복 코드 제거
- [ ] Internal 폴더 구조 정리
- [ ] 기존 기능 정상 동작 확인

### Phase 3 완료 조건
- [ ] 각 폴더별 일관성 100% 달성
- [ ] 모든 컴포넌트 정상 동작
- [ ] 성능 저하 없음

### Phase 4 완료 조건
- [ ] Bridge 패턴 구현 완료
- [ ] 상태 동기화 시스템 안정화
- [ ] 전체 시스템 통합 테스트 통과

### Phase 5 완료 조건
- [ ] 성능 최적화 완료
- [ ] 코드 정리 완료
- [ ] 최종 검증 통과

---

*이 계획서는 프로젝트 진행 상황에 따라 조정될 수 있습니다.* 