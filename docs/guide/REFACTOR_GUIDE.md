# Legacy Code Refactoring Guide

## 1. 개요

이 문서는 `src/legacy` 디렉토리에 있는 레거시 코드를 새로운 모듈식 아키텍처(`core`, `admin`, `ui`)로 점진적으로 마이그레이션하기 위한 가이드입니다. 리팩토링의 목표는 코드 재사용성을 높이고, 모듈 간의 의존성을 낮추며, 유지보수성을 향상시키는 것입니다.

## 2. 리팩토링 원칙

-   **점진적 마이그레이션**: 한 번에 모든 코드를 옮기기보다 기능 단위로 점진적으로 진행합니다.
-   **의존성 규칙 준수**: 하위 레이어(예: `core`)는 상위 레이어(예: `admin`, `examples`)를 의존해서는 안 됩니다.
-   **Zustand 상태 관리**: Recoil/Jotai로 작성된 레거시 스토어는 `gaesupStore`를 사용하는 Zustand 슬라이스로 마이그레이션합니다.
-   **스타일 가이드 준수**: 모든 UI 컴포넌트는 `docs/guide/STYLE_GUIDE.md`를 따라야 합니다.

## 3. `legacy` 코드 분류 및 이전 계획

`legacy` 디렉토리의 코드는 다음과 같이 네 가지 범주로 분류하여 처리합니다.

### 카테고리 1: `core` 모듈로 이전

-   **대상**: 재사용 가능하고, 특정 도메인(e.g., admin)에 종속되지 않는 핵심 로직.
-   **세부 계획**:
    -   **API 호출**: `src/legacy/api`의 범용 API들은 `@core/api` 또는 각 도메인(e.g., `@core/world/api`)으로 이동합니다.
    -   **3D 에셋 및 재질**: `src/legacy/common/mesh/`의 GLSL, `Grass`, `Water`, **`Flag` (흔들리는 깃발)** 등 커스텀 셰이더를 사용하는 3D 컴포넌트는 `@core/world/components` 또는 `@core/motions/components` 하위 모듈로 통합됩니다.
    -   **상태 관리**: Recoil/Jotai 스토어는 `@core/stores/gaesupStore`의 Zustand 슬라이스로 전환합니다.
        -   `zoom`, `rotation` → `@core/camera/stores`
        -   `mesh`, `tile`, `wall` → `@core/world/stores`
        -   `npc`, `threeObject` → `@core/interactions/stores`
    -   **유틸리티**: `src/legacy/utils`의 범용 함수들은 `@core/utils`로 이동합니다.

### 카테고리 2: `admin` 모듈로 이전

-   **대상**: 관리자 페이지, 에디터 등 어드민 기능에만 사용되는 컴포넌트 및 로직.
-   **세부 계획**:
    -   **API 호출**: `src/legacy/api/auth.ts`는 `@admin/api`로 이동합니다.
    -   **UI 컴포넌트**: `src/legacy/components`의 모달, 프리뷰, 버튼 등은 `@admin/components` 및 `@admin/containers`로 재구성됩니다.
    -   **레이아웃**: `leftSlider`, `rightSlider` 등은 `@admin/components/layout`으로 재구성합니다.
    -   **상태 관리**: `src/legacy/store/auth`는 `@admin/store/authStore`로 마이그레이션합니다.

### 카테고리 3: `ui` 모듈로 이전

-   **대상**: 특정 도메인에 종속되지 않는 범용 UI 컴포넌트.
-   **세부 계획**:
    -   **범용 컴포넌트**: `src/legacy/common`의 `Input`, `Button`, `Slider` 등은 `@core/ui/components`로 이동합니다.
    -   `Loading`, `Toast` 컴포넌트 역시 `@core/ui/components`로 이동합니다.

### 카테고리 4: 삭제 대상

-   **대상**: 더 이상 사용되지 않거나, 중복되거나, 새로운 아키텍처와 맞지 않는 코드.
-   **세부 계획**:
    -   `legacy` 내의 `App.tsx`, `main.tsx`와 같은 진입점 파일들을 삭제합니다.
    -   `examples` 앱으로 기능이 대체된 레거시 컨테이너(`board`, `main`)를 삭제합니다.
    -   불필요한 상태 관리 로직(`check`, `save`)을 제거합니다.

## 4. 진행 상태

마이그레이션이 진행됨에 따라 이 문서를 지속적으로 업데이트하여 팀원들과 진행 상황을 공유합니다. 