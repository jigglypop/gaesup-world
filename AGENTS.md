# AGENTS.md

이 저장소는 `gaesup-world` 라이브러리와 이를 소비하는 Vite 예제를 함께 관리한다. 작업할 때는 라이브러리 코드만 고치고 끝내지 말고, 현재 제공되는 기능이 `examples/`에서 실제로 사용할 수 있는지까지 확인한다.

## 가장 중요한 원칙

`examples/`는 데모가 아니라 공개 API의 사용처이자 통합 검증 지점이다.
- 예제는 code sandbox 등의 코드에서도 돌아갈 수 있는 게 기준

- 새 기능, 새 컴포넌트, 새 훅, 새 플러그인, 새 store, 새 editor 패널을 추가하면 예제에서 접근 가능한 경로를 반드시 만든다.
- 예제는 `src/...` 내부 경로를 직접 import하지 않는다. 항상 `gaesup-world` 또는 `gaesup-world/<subpath>` 공개 엔트리로 import한다.
- 라이브러리에서 "현재 기능"이라고 부를 수 있는 것은 예제 화면에서 최소 한 번은 사용 가능해야 한다. UI 기능이면 화면/패널/토글/라우트로 노출하고, 런타임 기능이면 `examples/pages/runtime.ts` 또는 관련 seed/setup 코드에서 연결한다.
- 공개 API를 추가했으면 `src/index.ts` 또는 적절한 subpath 엔트리, `package.json` exports, `vite.config.ts` alias/build entry, `tsconfig.json` paths, `scripts/copy-cjs-types.cjs`, 관련 테스트를 함께 확인한다.
- 예제가 깨지는 변경은 라이브러리 변경이 완료된 것이 아니다.

## 프로젝트 구조

- `src/`: 배포되는 라이브러리 소스.
- `src/index.ts`: 루트 공개 API. 많은 예제 기능은 여기서 import된다.
- `src/<subpath>.ts`: `gaesup-world/runtime`, `gaesup-world/editor`, `gaesup-world/building`, `gaesup-world/gameplay` 같은 package subpath 엔트리.
- `src/core/`: 도메인별 실제 구현. `building`, `camera`, `motions`, `interactions`, `inventory`, `quests`, `weather`, `town`, `audio`, `npc`, `scene`, `plugins`, `runtime`, `save` 등이 있다.
- `src/blueprints/`: blueprint 런타임, editor, registry, factory.
- `examples/`: 라이브러리를 사용자처럼 소비하는 Vite 앱. 공개 API 검증의 기준이다.
- `examples/pages/World.tsx`: 기본 월드와 주요 HUD/시스템을 조립하는 핵심 예제.
- `examples/pages/runtime.ts`: 예제 런타임 플러그인 등록, seed 등록, starter state 적용 위치.
- `examples/App.tsx`: 예제 라우팅. 새 독립 화면이 필요하면 여기에도 연결한다.
- `public/`: 개발 중 제공되는 정적 asset.
- `demo-dist/`: Vite demo build 산출물. 보통 직접 수정하지 않는다.
- `dist/`: 라이브러리 build 산출물. 보통 직접 수정하지 않는다.
- `server/`: policy/dev server 관련 Python/Node 코드.
- `docs/`: 도메인/API/config/guide 문서.

## 공개 엔트리와 예제 연결

현재 package export map은 다음 계열을 관리한다.

- `gaesup-world`: 주 공개 API. 예제에서 가장 먼저 사용할 경로.
- `gaesup-world/admin`: 관리자 UI.
- `gaesup-world/blueprints`, `gaesup-world/blueprints/editor`: blueprint API와 editor UI.
- `gaesup-world/runtime`: runtime/save/world 중심 API.
- `gaesup-world/editor`: editor shell, panels, content 관련 API.
- `gaesup-world/building`: building 전용 API와 드라이버.
- `gaesup-world/gameplay`: gameplay event engine/blueprint API.
- `gaesup-world/navigation`, `gaesup-world/network`, `gaesup-world/assets`, `gaesup-world/plugins`, `gaesup-world/server-contracts`, `gaesup-world/postprocessing`.

subpath를 추가하거나 바꾸면 다음 파일들을 같은 변경 단위로 본다.

- `package.json`의 `exports`
- `vite.config.ts`의 alias와 library build entry
- `tsconfig.json`의 paths
- `scripts/copy-cjs-types.cjs`
- `src/__tests__/packageExports.test.ts`

## 기능 추가 체크리스트

1. 구현 위치를 먼저 도메인에 맞춘다. 예: building은 `src/core/building`, gameplay event는 `src/core/gameplay`, runtime 플러그인은 `src/core/<domain>/plugin.ts`.
2. 외부 사용자가 써야 하는 심볼은 공개 엔트리에서 export한다. 루트가 너무 넓어질 때만 subpath를 쓴다.
3. 예제에서 공개 import로 사용한다. 내부 구현 경로를 우회하지 않는다.
4. 기능이 runtime plugin이면 `examples/pages/runtime.ts`에 plugin 등록, seed 등록, hydrate/serialize 연결이 필요한지 확인한다.
5. 기능이 UI면 `examples/pages/World.tsx`, editor shell panel, HUD, 라우트 중 하나에 실제로 접근 가능한 UI를 둔다.
6. 저장 상태가 있으면 `SaveSystem`/runtime diagnostics 흐름과 충돌하지 않는 key를 사용하고 hydrate/serialize 테스트를 둔다.
7. package public API나 export map 변경은 `src/__tests__/publicApi.test.ts` 또는 `src/__tests__/packageExports.test.ts`를 갱신한다.
8. 위험도에 맞게 도메인 테스트를 추가하고, 최소한 관련 Jest 테스트와 demo build/type build를 실행한다.

## 개발 명령

이 저장소는 pnpm 기준이다.

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm test -- --runInBand
corepack pnpm exec publint
```

자주 쓰는 좁은 검증:

```bash
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm build:types
```

`corepack pnpm dev`는 Vite 예제를 `127.0.0.1:5174`로 띄운다. 예제 빌드는 `demo-dist/`로 나간다. 라이브러리 빌드는 `dist/`로 나간다.

## 코딩 규칙

- TypeScript strict 설정이 강하다. `any`로 우회하지 말고 도메인 타입을 명확히 만든다.
- React 19, React Three Fiber, Three.js, Rapier, Zustand 기반이다. 기존 store/hook/component 패턴을 우선 따른다.
- `reflect-metadata`와 `core/initializeBridges`가 필요한 공개 엔트리 패턴을 유지한다.
- CSS, GLSL, WASM, GLB asset은 side effect/build 설정과 연동된다. import 경로나 산출물 포함 여부를 같이 확인한다.
- 도메인 내부 구현을 예제에서 직접 가져다 쓰지 않는다. 필요하면 공개 API로 승격한다.
- generated output인 `dist/`와 `demo-dist/`는 명시적으로 필요한 경우가 아니면 직접 편집하지 않는다.
- 기존 git 변경이 많을 수 있다. 작업과 무관한 변경은 되돌리지 않는다.

## 테스트 기준

- 공개 API 변경: `publicApi.test.ts`, `packageExports.test.ts`, `build:types`를 우선 확인한다.
- store/registry/plugin 변경: 해당 도메인의 `__tests__`를 추가 또는 갱신한다.
- editor/HUD/world 조립 변경: 예제 페이지가 공개 API import만 쓰는지 확인하고 가능하면 Vite dev/demo build까지 확인한다.
- save/runtime 변경: hydrate/serialize, duplicate key, diagnostics, load-on-mount 흐름을 확인한다.

## 예제 유지 규칙

- `examples/pages/World.tsx`는 핵심 showcase다. 기능이 사용자 눈에 보여야 하면 여기에 HUD, controller, effect, driver, panel, prompt 형태로 연결하는 것을 먼저 고려한다.
- `examples/pages/runtime.ts`는 플러그인 등록과 seed 데이터의 중심이다. 새 도메인 plugin은 여기서 실제 runtime에 들어가야 한다.
- `examples/App.tsx`는 접근성의 마지막 관문이다. 새 페이지를 만들면 route와 navigation도 확인한다.
- `examples/plugins/cozy-life-package`는 외부 패키지처럼 plugin을 구성하는 예제다. plugin API를 바꾸면 이 패키지도 같이 본다.
- 예제에서 기능을 숨겨야 한다면 기본 화면, editor 화면, admin 화면, network 화면 중 어디서 사용할 수 있는지 AGENTS 원칙에 맞게 남긴다.

## 작업 완료 전 확인

작업을 마치기 전에 다음 질문에 답할 수 있어야 한다.

- 이 기능은 공개 API로 import 가능한가?
- 이 기능은 `examples/`에서 실제로 접근 가능한가?
- 예제가 private `src/` 경로에 의존하지 않는가?
- export map/type declaration/CJS declaration 복사가 맞는가?
- 관련 테스트 또는 빌드를 실행했는가?


프로젝트 개발 규칙

절대원칙
- 절대 허락없이 명령으로 시도하는 행동 우회 금지

1. 일반 원칙
- 주석 금지 : 코드 자체로 설명이 가능하도록 작성하며, 원칙적으로 주석은 함수 선언부에만 작성하고 절대 이외 코드 내에 주석은 작성하지 않습니다.
- 빈줄 금지 : 코드에 의미없는 빈줄을 추가하지 않습니다.
- any 사용 금지 : 타입에 any를 사용하지 않습니다
- 타입을 로직에 섞지 않음 : 타입은 type를 사용하며 export type 을 분리해서 types.ts에 저장합니다
- 이모지 금지: 커밋 메시지, 코드, 문서 등 프로젝트의 어떤 산출물에도 이모지를 사용하지 않습니다.
- export 전부 확인 : 코드 위치를 옮길 시 export오류가 매우 빈번하므로 철저 확인
- 코드 포맷팅: 모든 코드는 프로젝트에 설정된 Prettier 규칙을 따릅니다. 의미 없는 공백이나 빈 줄을 추가하지 않습니다.
- 언어: 모든 코드(변수, 함수, 클래스명 등)는 영문으로 작성합니다.
- interface 사용 금지: 모든 타입은 type으로 정의합니다
- any는 절대 사용하지 않습니다.
- npm dev, pnpm dev 기다리지 말것 : 이미 dev 서버 틀고 시작함

2. DRY (Don't Repeat Yourself)
- 중복 코드 제거
- 공통 로직은 함수나 모듈로 추출
- 상수는 한 곳에서 관리

KISS (Keep It Simple, Stupid)
- 과도한 추상화 지양
- 단순하고 직관적인 해결책 선호
- 필요 이상으로 복잡하게 만들지 않기


1. 아키텍처 및 파일 구조
- 해당 계층 레이어는 src/core의 하위에 있는 도메인들의 하위 레이어를 말합니다. (src/core라고 해서 core 1계층만 있다는 의미가 절대 아님)
- 기존 로직 보호: 새로운 코드를 추가하거나 수정할 때, 기존의 핵심 기능이 절대 손상되지 않도록 주의합니다.
- 로직(`index.tsx`), 스타일(`styles.css`), 타입(`types.ts`)은 반드시 파일을 분리하여 관리합니다. 
- 여러 관심사의 로직이 한 파일에 섞이지 않도록 합니다.
- 코드 중복 금지: 중복된 코드는 절대 허용하지 않습니다.
- 파일 생성 최소화: 가능한 한 기존 파일을 수정하는 것을 우선으로 하며, 불필요한 신규 파일 생성은 지양합니다.
- 계층형 아키텍처 준수: 프로젝트는 명확한 계층형 구조를 따릅니다.
    - Layer 1 (Core Engine & Behaviors): `ref`, `useFrame`을 사용한 순수 3D 로직, 물리 계산 등 핵심 로직만 포함합니다. React의 상태 관리(useState, useEffect, useMemo, Zustand 등)와 관련된 코드를 절대 포함해서는 안 됩니다.
    - Layer 2 (Controllers, Hooks, Stores): React의 상태 관리 로직을 담당합니다. 하위 레이어(Layer 1)의 불필요한 재렌더링을 유발해서는 안 됩니다.
    - 상위 레이어 로직 혼합 금지: React 상태 관리와 같은 상위 레이어의 코드가 하위 레이어(Core)에 절대 포함되어서는 안 됩니다.

1. 핵심 원칙
- 관심사 분리: 컴포넌트 로직(index.tsx), 스타일(styles.css), 타입(types.ts)을 반드시 별도 파일로 분리
- CSS 변수만 사용: src/core/editor/styles/theme.css의 CSS 변수만 사용, 하드코딩 절대 금지
- 독립적 패널: 패널 컴포넌트는 자체 isOpen 상태나 토글 버튼을 가지면 안됨
- 일관된 스타일링: Glassmorphism 효과를 포함한 전역 스타일 준수

1. 파일 구조
모든 컴포넌트는 다음 구조를 따름:
/src/core/editor/components/ComponentName/
├── index.tsx (React 컴포넌트 로직)
├── styles.css (CSS 스타일)
└── types.ts (TypeScript 타입, 필요시)

(예시 2) 통합 파일 구조를
/src/core/motions/entities/refs/PhysicsEntity.tsx
같이 여러 tsx 파일이 혼재된 경우 types는 동일 폴더의 types.ts 파일을 모을 것
마찬가지로 styles.css 파일도 동일 폴더의 styles.css 파일을 모을 것
/src/core/motions/components/movement/
├── index.tsx (React 컴포넌트 로직)
├── DirectionComponent.tsx (방향 컴포넌트)
├── ImpulseComponent.tsx (충격 컴포넌트)
├── GravityComponent.tsx (중력 컴포넌트)
├── AnimationController.tsx (애니메이션 컴포넌트)
├── styles.css (CSS 스타일)
└── types.ts (TypeScript 타입, 필요시)

5. CSS 규칙
- 클래스 네이밍: [컴포넌트]-[엘리먼트]--[상태] 형식 사용
- 패널 배경은 반드시 var(--editor-bg-1) 사용
- 상호작용 요소는 var(--editor-surface-1), var(--editor-surface-hover), var(--editor-surface-active) 사용
- 텍스트는 var(--editor-text-main), var(--editor-text-muted), var(--editor-text-faint) 사용
- 테두리는 var(--editor-border-color) 사용

6. 레이어 아키텍처
Layer 1: core (순수 로직, THREE.js)
Layer 2: controllers, hooks, stores (상태 관리)
Layer 3: components (React 컴포넌트)

Import 방향: Layer 3 → Layer 2 → Layer 1만 가능
이 때 components에서 layer 1에서 직접 ref를 사용하는 것은 허용
Layer 1에서 Layer 2로 import 절대 금지

7. Store 사용법
- store에는 전역 config성 정보 저장, interaction 정보가 핵심
- Store 구독 시 필요한 부분만 선택적 구독
- 전체 store 구독 금지

8. 네이밍 규칙
- Props 이벤트: on으로 시작 (onClick, onSelect)
- 내부 핸들러: handle로 시작 (handleClick, handleSelect)
- 타입명: ComponentNameProps, ComponentNameState 형식
- 상수: UPPER_SNAKE_CASE 사용

9. 에러 처리
- Layer 1에서는 에러 throw
- Layer 2에서는 에러 catch 및 상태 관리
- 에러 메시지 형식: [모듈명 Error]: 설명

10. 성능 규칙
- 복잡한 계산은 useMemo 사용
- 콜백은 useCallback 사용
- Layer 1 객체는 useRef로 관리
- Magic Number 사용 금지, 상수로 정의

11. 파일 크기 제한
- 컴포넌트 파일: 최대 200줄
- 엔진/코어 파일: 최대 500줄
- 유틸리티 파일: 최대 150줄

12. Bridge 패턴
레거시 코드 연결 시 DomainBridge 클래스 사용
convertLegacyData, convertToLegacyData 메서드 구현

13. 비동기 처리
- 명확한 동사 사용: fetch, load, save
- AsyncState<T> 타입으로 loading, error 상태 관리

14. 금지사항
- console.log 사용 금지 (Logger 유틸리티 사용)
- CSS 하드코딩 값 사용 금지
- 패널에서 자체 토글 상태 관리
- Layer 역방향 import
- Magic Number 사용
- 전체 store 구독
- 클라이언트에 민감한 정보 하드코딩 금지


15. 테스트 규칙
- react-test-renderer 사용
- 한글로 테스트 내용 작성
- 타입 체크 확실히 하기
- 파일명: ComponentName.test.ts(x) 형식
- 테스트 커버리지: Core 레이어 100% 목표


16. 타입 규칙
- 타입 파일 생성 시 파일명 끝에 .ts 확장자 붙이기
- tsx, 등 다른 파일에 절대 타입을 넣지 않는다
- export type 를 쓰고, interface 는 쓰지 않는다

18. 의존성 관리
- 새 패키지 추가 시 팀 리뷰 필수
- peerDependencies 정확히 명시
- 불필요한 의존성 제거
- 보안 취약점 정기 점검 (npm audit)
- 메이저 버전 업데이트 시 충분한 테스트

23. 성능 최적화 추가 규칙
- 렌더링 최적화: React.memo, useMemo 적극 활용
- 이미지/3D 모델: 지연 로딩 구현
- 번들 크기: 코드 스플리팅 적용
- Web Worker 활용 검토
- 메모리 누수 방지: cleanup 함수 필수
프로젝트 개발 규칙

절대원칙
- 절대 허락없이 명령으로 시도하는 행동 우회 금지
- 로직 망가트리지 않기 : 로직 변경 요구 없이 로직을 망가트리지 마세요
- 테스트 통과 : 리팩토링 후 테스트에 통과가 반드시 되어야 합니다.
- 파일별 단위테스트 : 파일 작성 후 해당 도메인의 하위 __tests__에 테스트를 반드시 함수 커버리지를 높게 작성하세요
- 테스트 코드 함수명은 한글로 작성 : 함수명은 한글로 어떤 테스트인지 확실히 표현
- 테스트는 수치 계산이 잘못되지 않는 한 자체 테스트를 우회하지 않음.  테스트 수치는 반드시 컨펌을 받고 승인이 나면 고칠 것
- 이모지 금지
- 명령한 방법 이외 다른 방법 임의 선택 엄격 금지 : 반드시 필요하면 컨펌 기다릴 것

1. 일반 원칙
- 주석 금지 : 주석은 작성하지 않음
- 빈줄 금지 : 코드에 의미없는 빈줄을 추가하지 않음
- 이모지 금지: 커밋 메시지, 코드, 문서 등 프로젝트의 어떤 산출물에도 이모지를 사용 금지
- 코드 포맷팅: 모든 코드는 프로젝트에 설정된 Prettier 규칙을 따름.
- 언어: 모든 코드(변수, 함수, 클래스명 등)는 영문으로 작성
- 타입 파일 분리 : types.ts 파일로 분리시킴. interface는 클래스에, types는 그 외 혹은 상황에 따라
- any는 절대 사용하지 않음

1. 아키텍처 및 파일 구조
- 기존 로직 보호: 새로운 코드를 추가하거나 수정할 때, 기존의 핵심 기능이 절대 손상되지 않도록 주의합니다.
- 로직(`index.tsx`), 스타일(`styles.css`), 타입(`types.ts`)은 반드시 파일을 분리하여 관리합니다. 
- 여러 관심사의 로직이 한 파일에 섞이지 않도록 합니다.
- 코드 중복 금지: 중복된 코드는 절대 허용하지 않습니다.
- 파일 생성 최소화: 가능한 한 기존 파일을 수정하는 것을 우선으로 하며, 불필요한 신규 파일 생성은 지양합니다.
- 계층형 아키텍처 준수: 프로젝트는 명확한 계층형 구조를 따릅니다.
    - Layer 1 (Core Engine & Behaviors): `ref`, `useFrame`을 사용한 순수 3D 로직, 물리 계산 등 핵심 로직만 포함합니다. React의 상태 관리(useState, useEffect, useMemo, Zustand 등)와 관련된 코드를 절대 포함해서는 안 됩니다.
    - Layer 2 (Controllers, Hooks, Stores): React의 상태 관리 로직을 담당합니다. 하위 레이어(Layer 1)의 불필요한 재렌더링을 유발해서는 안 됩니다.
    - 상위 레이어 로직 혼합 금지: React 상태 관리와 같은 상위 레이어의 코드가 하위 레이어(Core)에 절대 포함되어서는 안 됩니다.

1. 핵심 원칙
- 관심사 분리: 컴포넌트 로직(index.tsx), 스타일(styles.css), 타입(types.ts)을 반드시 별도 파일로 분리
- CSS 변수만 사용: src/core/editor/styles/theme.css의 CSS 변수만 사용, 하드코딩 절대 금지
- 독립적 패널: 패널 컴포넌트는 자체 isOpen 상태나 토글 버튼을 가지면 안됨
- 일관된 스타일링: Glassmorphism 효과를 포함한 전역 스타일 준수

1. 파일 구조
모든 컴포넌트는 다음 구조를 따름:
/src/core/editor/components/ComponentName/
├── index.tsx (React 컴포넌트 로직)
├── styles.css (CSS 스타일)
└── types.ts (TypeScript 타입, 필요시)

(예시 2) 통합 파일 구조를
/src/core/motions/entities/refs/PhysicsEntity.tsx
같이 여러 tsx 파일이 혼재된 경우 types는 동일 폴더의 types.ts 파일을 모을 것
마찬가지로 styles.css 파일도 동일 폴더의 styles.css 파일을 모을 것
/src/core/motions/components/movement/
├── index.tsx (React 컴포넌트 로직)
├── DirectionComponent.tsx (방향 컴포넌트)
├── ImpulseComponent.tsx (충격 컴포넌트)
├── GravityComponent.tsx (중력 컴포넌트)
├── AnimationController.tsx (애니메이션 컴포넌트)
├── styles.css (CSS 스타일)
└── types.ts (TypeScript 타입, 필요시)

5. CSS 규칙
- 클래스 네이밍: [컴포넌트]-[엘리먼트]--[상태] 형식 사용
- 패널 배경은 반드시 var(--editor-bg-1) 사용
- 상호작용 요소는 var(--editor-surface-1), var(--editor-surface-hover), var(--editor-surface-active) 사용
- 텍스트는 var(--editor-text-main), var(--editor-text-muted), var(--editor-text-faint) 사용
- 테두리는 var(--editor-border-color) 사용

6. 레이어 아키텍처
Layer 1: core (순수 로직, THREE.js)
Layer 2: controllers, hooks, stores (상태 관리)
Layer 3: components (React 컴포넌트)

Import 방향: Layer 3 → Layer 2 → Layer 1만 가능
이 때 components에서 layer 1에서 직접 ref를 사용하는 것은 허용
Layer 1에서 Layer 2로 import 절대 금지

7. Store 사용법
- store에는 전역 config성 정보 저장, interaction 정보가 핵심
- Store 구독 시 필요한 부분만 선택적 구독
- 전체 store 구독 금지

8. 네이밍 규칙
- Props 이벤트: on으로 시작 (onClick, onSelect)
- 내부 핸들러: handle로 시작 (handleClick, handleSelect)
- 타입명: ComponentNameProps, ComponentNameState 형식
- 상수: UPPER_SNAKE_CASE 사용

9. 에러 처리
- Layer 1에서는 에러 throw
- Layer 2에서는 에러 catch 및 상태 관리
- 에러 메시지 형식: [모듈명 Error]: 설명

10. 성능 규칙
- 복잡한 계산은 useMemo 사용
- 콜백은 useCallback 사용
- Layer 1 객체는 useRef로 관리
- Magic Number 사용 금지, 상수로 정의

11. 파일 크기 제한
- 컴포넌트 파일: 최대 200줄
- 엔진/코어 파일: 최대 500줄
- 유틸리티 파일: 최대 150줄

12. Bridge 패턴
레거시 코드 연결 시 DomainBridge 클래스 사용
convertLegacyData, convertToLegacyData 메서드 구현

13. 비동기 처리
- 명확한 동사 사용: fetch, load, save
- AsyncState<T> 타입으로 loading, error 상태 관리

14. 금지사항
- console.log 사용 금지 (Logger 유틸리티 사용)
- CSS 하드코딩 값 사용 금지
- 패널에서 자체 토글 상태 관리
- Layer 역방향 import
- Magic Number 사용
- 전체 store 구독
- 클라이언트에 민감한 정보 하드코딩 금지


15. 테스트 규칙
- react-test-renderer 사용
- 한글로 테스트 내용 작성
- 타입 체크 확실히 하기
- 파일명: ComponentName.test.ts(x) 형식
- 테스트 커버리지: Core 레이어 100% 목표


16. 타입 규칙
- 타입 파일 생성 시 파일명 끝에 .ts 확장자 붙이기
- tsx, 등 다른 파일에 절대 타입을 넣지 않는다
- export type 를 쓰고, interface 는 쓰지 않는다

18. 의존성 관리
- 새 패키지 추가 시 팀 리뷰 필수
- peerDependencies 정확히 명시
- 불필요한 의존성 제거
- 보안 취약점 정기 점검 (npm audit)
- 메이저 버전 업데이트 시 충분한 테스트

23. 성능 최적화 추가 규칙
- 렌더링 최적화: React.memo, useMemo 적극 활용
- 이미지/3D 모델: 지연 로딩 구현
- 번들 크기: 코드 스플리팅 적용
- Web Worker 활용 검토
- 메모리 누수 방지: cleanup 함수 필수
