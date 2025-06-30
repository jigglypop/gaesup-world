프로젝트 구조를 전체적으로 분석해드리겠습니다. 먼저 각 디렉토리의 구조와 내용을 파악하겠습니다.
Search files...
Search files...
Search files...
Ran tool
Ran tool

Read file: src/core/index.ts
Read file: docs/guide/LAYER_GUIDE.md
Ran tool
Ran tool
Ran tool

Ran tool
Ran tool
Ran tool
Ran tool
Read file: docs/guide/REFACTOR_GUIDE.md

Ran tool
Ran tool
Ran tool
Ran tool

Read file: src/admin/index.ts
Ran tool
Ran tool
Ran tool
Read file: src/core/editor/README.md

Ran tool
Ran tool
Read file: src/legacy/common/mesh/flag/index.tsx
Ran tool

# Gaesup World 프로젝트 구조 분석 보고서

## 1. 프로젝트 전체 구조 개요

### 현재 구조
- **`src/core`**: 2계층 + 브릿지 구조를 따르는 핵심 로직
- **`src/admin`**: 편집 기능을 위한 관리자 모듈  
- **`src/legacy`**: 다른 프로젝트에서 가져온 레거시 코드
- **`examples`**: 라이브러리 사용 예제

### 아키텍처 특징
- **계층형 아키텍처**: Layer 1(Core) → Layer 2(State Management) → Layer 3(Integration) 
- **브릿지 패턴**: 각 도메인별로 Bridge 클래스를 통해 레거시 코드와 통합
- **모듈화**: 도메인별로 독립적인 모듈 구조

## 2. 각 디렉토리 상세 분석

### 2.1 Core (`src/core`)
#### 구조
```
core/
├── animation/     (애니메이션 엔진 및 브릿지)
├── api/          (공통 API 클라이언트)  
├── building/     (건물/구조물 관련)
├── camera/       (카메라 시스템)
├── debug/        (디버깅 도구)
├── editor/       ⚠️ (에디터 UI - 위치 재검토 필요)
├── error/        (에러 처리)
├── hooks/        (공통 훅)
├── interactions/ (상호작용 시스템)
├── motions/      (물리/모션 시스템)
├── stores/       (Zustand 스토어)
├── ui/           (공통 UI 컴포넌트)
├── utils/        (유틸리티)
└── world/        (월드 관리)
```

#### 문제점
- **`editor` 모듈이 core에 위치**: Editor는 실제로 관리자 기능이므로 `admin`으로 이동 고려

### 2.2 Admin (`src/admin`)
#### 구조
```
admin/
├── api/          (인증 API)
├── components/   (Admin UI 컴포넌트)
├── pages/        (로그인 페이지)
└── store/        (인증/토스트 스토어)
```

#### 특징
- 최소한의 인증 시스템 구현
- Glass morphism UI 디자인
- Toast 알림 시스템 자체 구현

### 2.3 Legacy (`src/legacy`)
#### 구조
```
legacy/
├── api/          (레거시 API들)
├── common/       (공통 컴포넌트)
│   └── mesh/     ⭐ (flag, water, grass 셰이더)
├── components/   (UI 컴포넌트들)
├── containers/   (컨테이너 컴포넌트)
├── constants/    (상수)
├── store/        (Recoil/Jotai 스토어)
└── styles/       (vanilla-extract 스타일)
```

## 3. 주요 발견사항 및 개선 제안

### 3.1 Legacy에서 Core로 이동 필요한 항목들

#### 🎨 3D 셰이더 컴포넌트 (높은 우선순위)
- **`src/legacy/common/mesh/flag`** → `src/core/world/components/Flag`
  - GLSL 셰이더를 사용한 깃발 애니메이션
  - 재사용 가능한 고품질 3D 컴포넌트
  
- **`src/legacy/common/mesh/water`** → `src/core/world/components/Water`
  - 물 효과 렌더링
  
- **`src/legacy/common/mesh/grass`** → `src/core/world/components/Grass`
  - 잔디 셰이더 효과

#### 🔧 유틸리티 컴포넌트
- **`src/legacy/common/input`** → `src/core/ui/components/Input`
- **`src/legacy/common/sliderWrapper`** → `src/core/ui/components/Slider`
- **`src/legacy/common/progress`** → `src/core/ui/components/Progress`
- **`src/legacy/common/pointer`** → `src/core/ui/components/Pointer`

#### 🏗️ 건물/구조물 관련
- **`src/legacy/components/tileParents`** → `src/core/building/components`
- **`src/legacy/components/wallParents`** → `src/core/building/components`

### 3.2 위치가 부적절한 항목들

#### Core에서 Admin으로 이동 필요
- **`src/core/editor/*`** → `src/admin/editor/*`
  - Editor는 관리자 기능이므로 admin 모듈이 적절
  - 일반 사용자는 editor를 사용하지 않음

#### 중복 구현된 컴포넌트
- **Toast 시스템**: 
  - `src/admin/store/toastStore.ts` (Zustand)
  - `src/legacy/store/toast` (Jotai)
  - → 하나로 통합 필요 (admin의 Zustand 버전 권장)

- **인증 시스템**:
  - `src/admin/api/auth.ts`
  - `src/legacy/api/auth.ts`
  - → admin 버전으로 통합

### 3.3 Legacy에서 삭제 가능한 항목들

#### 중복/불필요한 파일
- `src/legacy/main.tsx` - examples로 대체됨
- `src/legacy/styles.css` - 새 스타일 시스템 사용
- `src/legacy/vite-env.d.ts` - 루트에 이미 존재

#### 더 이상 사용되지 않는 스토어
- `src/legacy/store/save` - 새로운 저장 시스템으로 대체
- `src/legacy/store/check` - admin의 checkStore로 대체

### 3.4 아키텍처 개선 제안

#### 1. 모듈 경계 명확화
```
src/
├── core/      (순수 로직, 3D 엔진, 공통 기능)
├── admin/     (관리자 기능, 에디터, 인증)
├── ui/        (재사용 가능한 UI 컴포넌트)
└── legacy/    (점진적 제거)
```

#### 2. 브릿지 패턴 확대 적용
- Legacy 코드 통합 시 각 도메인별 Bridge 클래스 생성
- 예: `MeshBridge`, `UIBridge` 등

#### 3. 상태 관리 통합
- Recoil/Jotai → Zustand로 완전 마이그레이션
- `gaesupStore`를 중심으로 한 슬라이스 구조

## 4. 우선순위별 액션 아이템

### 즉시 실행 (High Priority)
1. **3D 셰이더 컴포넌트 이동**
   - Flag, Water, Grass를 core/world로 이동
   - 브릿지 클래스를 통해 레거시 호환성 유지

2. **Editor 모듈 재배치**
   - core/editor → admin/editor로 이동
   - import 경로 업데이트

3. **Toast 시스템 통합**
   - admin의 toastStore를 표준으로 채택
   - legacy toast 제거

### 중기 실행 (Medium Priority)
1. **UI 컴포넌트 마이그레이션**
   - legacy/common의 재사용 가능한 UI를 core/ui로 이동
   - 스타일 시스템 통합 (CSS Variables 사용)

2. **API 레이어 정리**
   - 중복 API 제거
   - 도메인별 API 구조 확립

### 장기 실행 (Low Priority)
1. **Legacy 완전 제거**
   - 모든 유용한 코드 마이그레이션 완료
   - legacy 디렉토리 삭제

2. **테스트 커버리지**
   - 마이그레이션된 컴포넌트에 대한 테스트 작성
   - 통합 테스트 추가

## 5. 결론

현재 프로젝트는 명확한 아키텍처 방향성을 가지고 있으나, legacy 코드의 통합과 일부 모듈의 재배치가 필요합니다. 특히 3D 셰이더 컴포넌트들은 즉시 core로 이동하여 활용해야 하며, editor 모듈은 admin으로 재배치하여 모듈 경계를 명확히 해야 합니다.

계층형 아키텍처와 브릿지 패턴을 일관되게 적용하면서 점진적으로 legacy를 제거하면, 유지보수가 용이하고 확장 가능한 구조를 달성할 수 있을 것입니다.