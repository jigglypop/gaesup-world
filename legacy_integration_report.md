# (Final) Legacy to Core 통합 최종 전략 보고서 v3.0

이 문서는 `legacy` 코드베이스의 모든 자산을 전수 분석하여, `core` 아키텍처로의 통합을 위한 최종적이고 구체적인 실행 계획을 제시합니다.

---

## 1️⃣ Core 자체를 업그레이드할만한 로직 (Core Enhancement)

**평가**: `core`의 기능적 한계를 넘어서는 고급 기능 및 최적화 로직. `core`의 성능, 기능성, 개발 편의성을 직접적으로 향상시킵니다.

- **1.1. 고급 셰이더 기반 머티리얼 및 이펙트**

  - **대상**: `common/mesh/flag`, `common/mesh/grass`, `common/mesh/water`
  - **작업 이유**: GLSL 셰이더를 사용하는 동적인 깃발, 잔디, 물 효과는 `core`에 시각적 생동감을 더하는 고가치 자산입니다. 이를 표준 컴포넌트화하여 `core`에 통합하면, 개발자들이 복잡한 셰이더 코드 없이도 고품질의 동적 환경을 쉽게 구축할 수 있습니다.
  - **통합 방안**: `core/components/effects` 디렉토리를 신설하고, 각 효과를 `FlagEffect`, `GrassEffect`, `WaterEffect`와 같은 React 컴포넌트로 캡슐화합니다.

- **1.2. API 빌더 패턴 도입**

  - **대상**: `api/boilerplate/builder.ts` (`APIBuilder`)
  - **작업 이유**: `APIBuilder`는 API 요청을 메서드 체이닝 방식으로 선언적으로 구성할 수 있게 해주는 매우 유용한 유틸리티입니다. 이는 `core` 내부 및 향후 구축될 `admin` 페이지의 네트워킹 코드 가독성과 유지보수성을 크게 향상시킬 수 있습니다.
  - **통합 방안**: `core/utils/api` 디렉토리에 `APIBuilder.ts`를 이전하고, `core`의 모든 `fetch` 기반 API 요청을 점진적으로 이 빌더를 사용하도록 리팩토링합니다.

- **1.3. 영속성 캐시 시스템 도입**
  - **대상**: `utils/cache.ts`
  - **작업 이유**: `core`의 인메모리 캐시와 `legacy`의 `localStorage` 기반 영속성 캐시를 결합하여 **L1-L2 캐시 아키텍처**를 구축, 네트워크 의존성을 줄이고 애플리케이션의 응답성을 극대화합니다.
  - **통합 방안**: `core/utils/`에 `persistentCache.ts`로 통합하고, `useGaesupGltf` 등에서 선택적으로 사용합니다.

---

## 2️⃣ Core에 병합할 로직 (Core Integration)

**평가**: `core`의 기본 기능과 직접적으로 연관되어, `core`의 생태계를 풍부하게 만드는 기능들.

- **2.1. 동적 NPC 및 상호작용 시스템**

  - **대상**: `common/npc`, `store/npc`, `components/npcs`
  - **작업 이유**: `core`의 `PassiveCharacter`에 대화, 퀘스트 부여 등의 상호작용 기능을 부여하여 살아있는 월드를 만듭니다.
  - **통합 방안**: `core/components/passive/Npc.tsx` 컴포넌트를 신설, `PassiveCharacter`를 기반으로 말풍선(`spriteTag`), 상호작용 로직을 추가합니다. `useTypingEffect` 훅은 `core/hooks/ui`로 이동합니다.

- **2.2. 월드 구성 요소 표준화**

  - **대상**: `common/ground`, `api/tile.ts`, `api/wall.ts`
  - **작업 이유**: '바닥', '벽'과 같은 월드의 기본 구조를 명시적으로 정의하고, 서버로부터 동적으로 월드 데이터를 로드하는 메커니즘을 `core`에 내장합니다.
  - **통합 방안**: `Ground` 컴포넌트는 `core/components/world/Ground.tsx`로 표준화합니다. `tile/wall` API는 `core/api/worldLoader.ts`로 통합하여 월드 데이터 로딩을 담당하게 합니다.

- **2.3. 고급 상호작용 (포털, 점프 포인트)**

  - **대상**: `components/portal`, `store/portal`, `store/jumpPoint`
  - **작업 이유**: 단순한 위치 이동을 넘어, 씬 전환이나 특정 이벤트와 연동되는 복합적인 월드 이동 기능을 `core`에 추가합니다.
  - **통합 방안**: `core`의 `useTeleport` 훅을 확장하여, `portal`의 목적지 정보 및 `jumpPoint`의 상태와 연동되도록 기능을 강화합니다.

- **2.4. 모바일 이동 컨트롤러**
  - **대상**: `containers/moving`
  - **작업 이유**: 모바일 환경을 위한 가상 조이스틱과 같은 터치 기반 이동 인터페이스를 제공합니다.
  - **통합 방안**: `core/component/gamepad`의 일부로 통합하거나, 별도의 `core/component/joystick` 컴포넌트로 분리하여 제공합니다.

---

## 3️⃣ Admin 페이지에 병합할 로직 (Admin Page Migration)

**평가**: 런타임 환경과 명확히 분리되어야 할 월드 에디팅 및 콘텐츠 관리 기능. 별도의 `admin` SPA로 구축합니다.

- **3.1. 월드 에디터 UI/상태**

  - **대상**: `containers/leftSlider`, `containers/rightSlider`, `containers/updateRoom`, `store/gltfList`, `store/update`, `store/tile`, `store/wall` 등 에디팅 관련 모든 UI와 상태.
  - **작업 이유**: 런타임 번들 크기를 최소화하고, 런타임과 에디터의 관심사를 완벽히 분리하기 위함입니다.
  - **통합 방안**: 프로젝트 루트에 `admin/` 디렉토리를 생성하고, 관련된 모든 React 컴포넌트, 컨테이너, Jotai 스토어를 이곳으로 이전합니다.

- **3.2. 인증 및 데이터 관리 API**

  - **대상**: `api/auth.ts`, `api/save.ts`, `api/threeObject.ts`, `api/images.ts`
  - **작업 이유**: 월드 데이터 생성/수정/삭제(CUD) 및 이미지 업로드와 같은 민감한 API를 관리자 전용 페이지로 격리하여 보안을 강화합니다.
  - **통합 방안**: 해당 API 모듈을 `admin/api` 디렉토리로 이전하고, Admin 페이지 전체에 인증 미들웨어를 적용합니다.

- **3.3. 에디터용 UI 라이브러리**
  - **대상**: `common/input`, `common/sliderWrapper`, `common/smallColorPicker`, `components/toast`, `components/modals/*`
  - **작업 이유**: 에디터 UI를 구성하는 범용 컴포넌트들로, `admin` 페이지의 UI 개발 생산성을 높입니다.
  - **통합 방안**: `admin/components/common` 디렉토리로 이전하여 관리합니다.

---

## 4️⃣ 전혀 필요없는 로직 (Deprecation & Removal)

**평가**: `core`에 의해 완벽히 대체되었거나, 아키텍처의 일관성을 해치거나, 너무 단순하여 재작성이 더 효율적인 코드. 과감히 제거하여 기술 부채를 청산합니다.

- **4.1. 기능적 완전 중복**

  - **대상**: `components/player`, `components/minimap`, `store/zoom`, `store/rotation`
  - **작업 이유**: `core`의 `GaesupController`, `MiniMap` 컴포넌트, `CameraStateMachine`이 이들의 역할을 월등히 잘 수행합니다.
  - **제거 방안**: 즉시 삭제하고, 관련 참조를 모두 `core`의 모듈로 교체합니다.

- **4.2. 구식/비일관적 스타일링**

  - **대상**: `styles` 디렉토리 전체 (Vanilla-Extract)
  - **작업 이유**: 프로젝트의 스타일링 전략을 단일화하고(예: PostCSS), 레거시 시스템의 복잡성을 제거합니다.
  - **제거 방안**: `admin` 페이지로 컴포넌트를 이전할 때, 기존 스타일 파일을 참조하여 새로운 스타일 시스템으로 재구현하고 원본은 삭제합니다. 디자인 시스템(`palette`, `keyframes`)은 참고용으로 보존할 가치가 있습니다.

- **4.3. 역할이 불분명하거나 너무 단순한 모듈**

  - **대상**: `common/cancel`, `common/focus`, `store/check`, `store/speechBallon`
  - **작업 이유**: 현대적인 UI 라이브러리나 `core`의 상태 관리로 쉽게 대체 가능하며, 유지보수할 가치가 낮습니다.
  - **제거 방안**: 해당 기능을 사용하는 부분을 최신 방식으로 리팩토링하면서 점진적으로 제거합니다.

- **4.4. 중복 타입 정의**
  - **대상**: `types/shade.d.ts`, `vite-env.d.ts`
  - **작업 이유**: 타입의 유일한 정보 소스(Single Source of Truth)는 `core/types` 여야 합니다.
  - **제거 방안**: 필요한 타입이 있다면 `core/types`로 통합하고, 나머지 파일은 삭제합니다.
