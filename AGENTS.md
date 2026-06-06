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
