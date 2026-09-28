# 저장소 지도

엔진을 고치는 사람(다음 AI 세션 포함)이 "무엇이 어디 있고, 무엇에 쓰이며, 무엇에 연결되는가"를 찾는 지도다. 폴더와 설정 파일의 역할, `src/core` 모듈별 크기, 패키지 진입점과 소스의 대응, `public/` 자산, 예제, 스크립트, CI를 정리한다. 모듈이 서로 어떻게 맞물리는지는 [architecture.md](architecture.md), 각 검증 관문의 자세한 동작은 [verification.md](verification.md)에 있다.

기준: 2026-09-27, `main` `2fcfcece`(DEL-2 직후, 작업 트리 깨끗함). 줄 수는 `.ts`/`.tsx` 파일에서 `__tests__/` 디렉터리와 `*.test.ts(x)` 파일을 뺀 뒤 `wc -l`(줄바꿈 수)로 센 값이다. 품질 래칫은 줄을 다르게 센다([verification.md](verification.md)의 check:quality).

## 최상위 구성

| 경로 | 역할 |
|---|---|
| `src/` | 라이브러리 소스. 패키지 진입 파일(`src/*.ts`), 엔진 모듈(`src/core/*`), 선택 진입점 `src/avatar`·`src/blueprints`, 패키지 계약 테스트 `src/__tests__` |
| `examples/` | Vite 예제 앱. `index.html` → `examples/main.tsx` → lazy `examples/minihome/Minihome.tsx`. 공개 API만 쓴다 |
| `scripts/` | 검증 관문, 빌드 후처리, 릴리스, 자산 파이프라인, 측정 보조 스크립트 |
| `test/` | jest `accept` 프로젝트(헤드리스 수용 시나리오), jest mock, 테스트 공용 하네스 |
| `public/` | 예제·패키지가 쓰는 glTF 모델과 WASM. 예제 앱의 정적 루트다. 라이브러리 빌드는 여기서 `wasm/gaesup_core.wasm`만 `dist/`로 내보낸다 |
| `integrations/unity/` | Unity 에디터 브리지 C# 2개. npm 패키지에 포함된다 |
| `docs/` | 사용자용(`guide/`)·개발자용(`dev/`) 문서와 색인 [../README.md](../README.md) |
| `.github/` | CI 워크플로(`release.yml`, `minihome-pages.yml`)와 공용 setup 액션 |
| `PRD.md` | 지금 할 일과 순서(slice 표). 끝난 slice는 지우고 커밋 제목의 ID로 기록한다 |
| `CLAUDE.md` | 에이전트 작업 규칙. `scripts/check-harness.mjs`가 존재를 검사한다 |
| `README.md`, `README.ko.md` | npm 패키지 README(영/한) |
| `CHANGELOG.md` | semantic-release가 쓰는 변경 기록 |
| `package.json` | 패키지 메타데이터, `exports`(진입점 목록의 원본), `files`, npm 스크립트, 의존성 |
| `pnpm-lock.yaml` | pnpm 9.15.1 잠금 파일(`packageManager` 필드) |
| `quality-baseline.json` | 품질 래칫 기준선 7개 지표 |
| `vite.config.ts` | 예제 앱 dev/build와 라이브러리 ESM/CJS 빌드(모드로 분기) |
| `jest.config.js`, `jest.memory.config.js`, `jest.setup.js` | jest 4개 프로젝트, 메모리 테스트 설정, 공용 setup |
| `tsconfig.json`, `tsconfig.test.json`, `tsconfig.build.json` | 앱·테스트·선언 빌드 타입 설정. `paths`가 유일한 alias 목록 |
| `eslint.config.js` | lint 규칙(raw `useFrame` 금지, Layer 1 프레임워크 import 금지 등) |
| `index.html` | 예제 앱 HTML. 제목 "개숲 미니홈피", `#root`·`#modal-root`, 파비콘 `/gaesupworld.ico` |
| `.releaserc.json` | semantic-release 설정(브랜치 `main`, angular preset, `scripts/release/metadata.mjs` 포함) |
| `.prettierrc`, `.npmignore`, `.gitignore` | 포맷(`printWidth` 100, 작은따옴표, `endOfLine: auto`), npm 제외 목록(`files`가 우선), git 제외 목록 |

추적하지 않는 로컬 폴더: `node_modules/`, `dist/`(라이브러리 빌드 산출물), `demo-dist/`(예제 빌드 산출물), `.artifacts/`(측정·수용·릴리스 산출물), `.asset-work/`(자산 파이프라인 작업 폴더), `.claude/`(에이전트 설정·worktree), `coverage/`, `.jest-cache/`, `.tmp/`. jest·eslint·Vite 감시는 `.claude/`를 무시한다.

## 설정 파일

### package.json

| 항목 | 값 |
|---|---|
| 이름·버전 | `gaesup-world` `1.1.0`, `"type": "module"`, MIT |
| Node | `engines.node`: `^20.19.0 \|\| >=22.12.0`(`src/__tests__/packageExports.test.ts`가 고정) |
| dependencies | `@xyflow/react`, `immer`, `simplex-noise`, `zustand` |
| peerDependencies | `@react-three/drei` 9·10, `@react-three/fiber` 8·9, `@react-three/postprocessing` 2·3, `@react-three/rapier` 1·2, `react`/`react-dom` 18·19, `three` 0.168·0.178·0.185·0.186, `three-stdlib` 2.36+. 모두 필수(optional 없음) |
| 개발 도구 | `three` 0.186.0, `@react-three/fiber` 9.7, Vite 8, Jest 30. TypeScript는 두 벌이다: `@typescript/native`(= `typescript` 7.0.2)가 `tsc` 명령을 제공해 `typecheck`·`build:types`·설치형 소비자 검증이 쓰고, `typescript` 이름(= `@typescript/typescript6` 6.0.2, CLI는 `tsc6`)은 ts-jest·typescript-eslint·`copy-cjs-types.cjs`·소비자 검증의 엄격 선언 검사가 API로 쓴다 |
| `sideEffects` | `**/*.css`, `**/*.glsl` |
| `files` | `dist/*.js`·`*.cjs`·`*.d.ts`·`*.d.cts`·`*.css`, `dist/**/*.d.ts`·`*.d.cts`, `dist/wasm/*.wasm`, `public/gltf/*.glb`, `public/gltf/avatars/**/*`, `public/gltf/props/**/*`, `public/gltf/nature/**/*`, README 2개, `integrations/unity/**/*`, `LICENSE.txt` |
| `prepare` | `npm run build`. 설치만 해도 빌드가 돈다. CI는 `--ignore-scripts`로 설치한다 |
| `gaesupRelease` | 릴리스 버전과 원본 커밋. `scripts/release/metadata.mjs`가 릴리스 때 쓴다 |

npm 스크립트 전체와 검증 체인은 [verification.md](verification.md)에 있다. 이 문서의 [scripts/](#scripts) 표는 각 스크립트 파일이 어느 npm 스크립트·CI 단계에 연결되는지 보여 준다.

### tsconfig

| 파일 | 범위 | 용도 |
|---|---|---|
| `tsconfig.json` | `src`, `examples`, `vite.config.ts`, jest 설정 2개(테스트 파일 제외) | 앱 타입 검사. `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals` 등. `noEmit` |
| `tsconfig.test.json` | `src`, `examples`, `test`(테스트 포함) | 테스트 타입 검사. `@testing-library/jest-dom` 타입 추가 |
| `tsconfig.build.json` | `src`(`src/__tests__`, 테스트, `*.old.ts(x)`, `src/legacy` 제외) | `build:types`가 `dist/`에 선언만 낸다. `typecheck`에서는 `--noEmit`으로 돈다 |

`tsconfig.json`의 `paths`가 저장소의 유일한 alias 목록이다. Vite는 `resolve.tsconfigPaths`로, jest는 `jest.config.js`가 `paths`를 읽어 `moduleNameMapper`로, `scripts/lib/importGraph.cjs`는 와일드카드 alias만 읽어 쓴다. `src/__tests__/packageExports.test.ts`가 이 일치를 검사한다.

| alias | 대상 |
|---|---|
| `@/*` | `./src/*` |
| `@core/*` | `./src/core/*` |
| `@hooks/*` | `./src/core/hooks/*` |
| `@stores/*` | `./src/core/stores/*` |
| `@utils/*` | `./src/core/utils/*` |
| `@motions/*` | `./src/core/motions/*` |
| `gaesup-world`, `gaesup-world/<subpath>` | 각 패키지 진입 소스(아래 [패키지 진입점](#패키지-진입점) 표) |
| `gaesup-world/style.css` | `./src/core/editor/styles/theme.css` |

라이브러리 모듈은 런타임에 `gaesup-world/...` 진입점을 import하지 않는다(`src/__tests__/architectureBoundaries.test.ts`). `gaesup-world/*` alias는 예제·테스트·타입 검사용이다.

### vite.config.ts

모드에 따라 두 설정을 돌려준다.

| 모드 | 동작 |
|---|---|
| `esm`, `cjs`(`build:esm`, `build:cjs`) | 라이브러리 빌드. 엔트리는 `scripts/lib/packageEntries.cjs`의 `PACKAGE_ENTRIES`, 출력은 `dist/<엔트리 이름>.js`(ESM)·`.cjs`(CJS), CSS는 `dist/index.css`. react·three·`@react-three/*`·`three-stdlib`·`@xyflow/react`·immer·simplex-noise·zustand는 external. `emptyOutDir: false`(비우기는 `clean`이 한다). `process.env.VITE_ENABLE_BRIDGE_LOGS`를 치환한다 |
| 그 외(dev, 예제 build) | 예제 앱. dev 서버 `127.0.0.1:5174`(`open: true`), `react`·`react-dom`·`three` dedupe, 빌드 출력 `demo-dist/`(sourcemap, `strictExecutionOrder`). 감시에서 `.claude`·`dist`·`demo-dist`·`.tmp`·`.artifacts`·`.jest-cache`·`coverage`를 뺀다 |

`GAESUP_PACKAGE_ROOT` 환경 변수가 있으면 예제 빌드가 `gaesup-world/*`를 소스 대신 그 경로에 설치된 패키지로 묶는다(`scripts/release/build-demo.mjs`가 쓴다). 라이브러리 빌드는 `public/`을 복사하지 않고(`copyPublicDir: false`) `emitCoreWasm` 플러그인으로 `dist/wasm/gaesup_core.wasm`만 내보낸다.

### jest

| 프로젝트 | 환경 | 대상 |
|---|---|---|
| `node` | node | `**/*.test.ts`(`src/__tests__/`, `test/accept/` 제외). DOM이 필요한 `.test.ts`는 파일 머리에 `/** @jest-environment jsdom */` |
| `dom` | jsdom | `**/*.test.tsx` |
| `package` | node | `src/__tests__/**/*.test.ts`(패키지·export·공개 API 계약) |
| `accept` | node | `test/accept/**/*.test.ts`(수용 시나리오, 정의는 `test/accept/budgets.json`) |

- 공용 설정(`base`): ts-jest, `.glsl|.vert|.frag|.wasm|.glb` → `test/mocks/assetModule.ts`, CSS → `identity-obj-proxy`, `@react-three/postprocessing` → `test/mocks/reactThreePostprocessing.tsx`, 그다음 tsconfig `paths` alias. `setupFiles`에 `jest-canvas-mock`, `setupFilesAfterEnv`에 `jest.setup.js`.
- `jest.setup.js`: `@testing-library/jest-dom`, `TextEncoder`/`TextDecoder`, `IS_REACT_ACT_ENVIRONMENT`, `logger.disable()`, `ResizeObserver`·canvas `getContext` polyfill, 매 테스트 뒤 `jest.restoreAllMocks()`.
- `jest.memory.config.js`: `base` + node 환경, `src/core/boilerplate/__tests__/*.test.ts`만. `test:memory*` 스크립트가 쓴다.
- 테스트 파일 수: node 252, dom 135, package 9, accept 6.

### eslint.config.js

- `typescript-eslint` recommended + React·react-hooks·import 플러그인. `import/order`(그룹 사이 빈 줄, 알파벳순).
- `src/**`: `@react-three/fiber`의 `useFrame` import 금지. 예외는 `src/core/runtime/frame/react/**`, `src/core/rendering/GpuBatchBridge.tsx`, `src/core/rendering/postprocess/WorldPostProcessing.tsx`.
- `src/core/**/core/**`(Layer 1): `react`, `zustand`, `@react-three/fiber` import 금지.
- `src/blueprints/**`: `no-explicit-any` 끔. 테스트 파일: jest 전역, import 제한 해제.
- 무시: `dist`, `demo-dist`, `public`, `node_modules`, `coverage`, `.tmp`, `.artifacts`, `.claude`.

## src

### 패키지 진입점

진입점 목록의 원본은 `package.json` `exports`다. `scripts/lib/packageEntries.cjs`가 각 JS subpath에서 `specifier`(`gaesup-world/<subpath>`), 빌드 이름(`import.default`의 파일 이름), 소스(`import.types`의 `./dist/` → `src/`, `.d.ts` → `.ts`)를 만들고, Vite 라이브러리 엔트리·export snapshot·수용 시나리오 S-H14가 이것을 쓴다. 타입은 `dist/` 아래에 `src` 구조를 그대로 따라 `.d.ts`와 `.d.cts` 쌍으로 나온다(`scripts/copy-cjs-types.cjs`).

| subpath | 소스 | ESM / CJS 산출물 | 내용 | 런타임 export 수 |
|---|---|---|---|---:|
| `.` | `src/index.ts` | `dist/index.js` / `.cjs` | `core/editor` 전체 + `src/core/index.ts` 전체 + 타입 `NPCInstanceData` | 952 |
| `./avatar` | `src/avatar.ts` | `dist/avatar.*` | 모듈형 아바타(`AvatarRuntime`, `Avatar`, `createAvatarStore`, 매니페스트, 스켈레톤) | 18 |
| `./blueprints` | `src/blueprints/index.ts` | `dist/blueprints.*` | 캐릭터·탈것 청사진, `BlueprintFactory`, `BlueprintSpawner`, hook | 19 |
| `./blueprints/editor` | `src/blueprints/editor.ts` | `dist/blueprints-editor.*` | `BlueprintEditor`, `BlueprintPreview`, `BlueprintPanel` | 3 |
| `./runtime` | `src/runtime.ts` | `dist/runtime.*` | `core/runtime` + `core/world` + `core/save` | 73 |
| `./editor` | `src/editor.ts` | `dist/editor.*` | `core/editor` + `core/building` + `core/content` | 220 |
| `./building` | `src/building.ts` | `dist/building.*` | `core/building` | 142 |
| `./gameplay` | `src/gameplay.ts` | `dist/gameplay.*` | `core/gameplay` | 18 |
| `./navigation` | `src/navigation.ts` | `dist/navigation.*` | `core/navigation` | 11 |
| `./assets` | `src/assets.ts` | `dist/assets.*` | `core/assets` + `core/assets/production` | 25 |
| `./network` | `src/network.ts` | `dist/network.*` | `core/networks` | 27 |
| `./plugins` | `src/plugins.ts` | `dist/plugins.*` | `core/plugins` | 22 |
| `./server-contracts` | `src/server-contracts.ts` | `dist/server-contracts.*` | `core/content` + `core/gameplay/server` + `core/networks/adapter` + `core/platform`. 런타임에 React·Zustand·R3F를 끌어오면 안 된다(`check:entries`) | 41 |
| `./postprocessing` | `src/postprocessing.ts` | `dist/postprocessing.*` | `ColorGrade`, `LutOverlay`, cube LUT 함수 4개, `ToonOutlines`, `Outlined`, `WorldPostProcessing` | 9 |
| `./style.css` | `src/core/editor/styles/theme.css`(tsconfig alias) | `dist/index.css` | 에디터·UI 스타일 | — |

런타임 export 수는 `src/__tests__/__snapshots__/exportSnapshot.test.ts.snap`의 항목 수다(타입 전용 export 제외). 루트는 `src/index.ts`가 `core/editor`를 통째로 재수출하므로 에디터를 포함한다(PRD LIB-1에서 분리 예정).

진입점을 추가할 때는 `package.json` `exports`(import `.d.ts`/`.js`, require `.d.cts`/`.cjs` 네 칸), `tsconfig.json` `paths`의 `gaesup-world/<subpath>` 항목, export snapshot을 함께 바꾼다. Vite 엔트리와 jest alias는 자동으로 따라온다. 자세한 순서는 [verification.md](verification.md).

### src 아래 다른 폴더

| 경로 | 줄 | 내용 |
|---|---:|---|
| `src/*.ts` | 81 | 진입 파일 12개와 `vite-env.d.ts`(`water` JSX 요소, `VITE_SERVER_URL`·`VITE_RL_POLICY_ENDPOINT`·`VITE_ENABLE_BRIDGE_LOGS` 환경 변수, `*.glsl` 모듈 선언) |
| `src/core/` | 90,406 | 엔진 모듈 44개 + 루트 배럴 `src/core/index.ts`(209줄). 아래 표 |
| `src/blueprints/` | 3,332 | 청사진 시스템: `characters/`(warrior, mage), `vehicles/`(kart), `core/`(`BlueprintEntity`, `BlueprintLoader`, `ComponentRegistry`, 컴포넌트), `factory/`(`BlueprintFactory`, `BlueprintConverter`, 물리), `hooks/`, `components/`(`BlueprintEditor`, `BlueprintPreview`, `BlueprintSpawner`, 패널), `registry.ts` |
| `src/avatar/` | 1,098 | 모듈형 아바타: `core/`(타입, 매니페스트 검증, `rig.json`), `runtime/`(`AvatarRuntime`, 조립, 애니메이션 바인딩, 스켈레톤), `store.ts`(`createAvatarStore`, `createAvatarPlugin`), `react.tsx`(`Avatar`, `AvatarProvider`) |
| `src/__tests__/` | (테스트) | jest `package` 프로젝트 9개 파일과 export snapshot. 내용은 [verification.md](verification.md) |

`src` 전체 비테스트 `.ts`/`.tsx`는 94,917줄이다. 그 밖에 CSS 36개(7,321줄), GLSL 6개(318줄, 불·깃발·잔디, GPU-1에서 삭제 예정), Rust 크레이트 2개(`src/core/wasm/src/*.rs` 7개 1,082줄, `src/core/building/components/mesh/grass/wasm/src/lib.rs` 113줄)가 있다.

### src/core 모듈

모듈마다 `index.ts`가 공개 표면이다. 모듈 안의 `core/` 폴더는 Layer 1(React·Zustand·R3F 금지), `bridge/`는 Layer 2, `components`·`controllers`·`hooks`·`stores`는 Layer 3이다([architecture.md](architecture.md)). 상태·결함·핫스팟은 [module-status.md](module-status.md)에 있다.

| 모듈 | 비테스트 줄 | 파일 | 테스트 파일 | 역할 |
|---|---:|---:|---:|---|
| `animation` | 2,640 | 28 | 13 | Unity식 애니메이터 상태 머신 `AnimatorRuntime`, `AnimationBridge`, 공유 애니메이션 hook, 애니메이션 디버그 UI |
| `assets` | 1,427 | 15 | 7 | 자산 카탈로그 store `useAssetStore`(전역), 자산 소스 API, `GLTFAssetCache`, Meshopt glTF 로더, 생산 파이프라인 계약(`production/`) |
| `audio` | 720 | 8 | 2 | WebAudio `AudioEngine`, 오디오 store·플러그인, `Footsteps`, `AudioControls` |
| `boilerplate` | 760 | 14 | 9 | `AbstractBridge`·`CoreBridge`·`BridgeFactory`, `AbstractSystem`·`BaseSystem`, `useEntity` 등 엔티티 hook |
| `building` | 17,603 | 110 | 63 | 건축 월드(타일·벽·블록·오브젝트) 데이터 모델·store·편집 입력, 메시 렌더링(잔디·물·불·깃발·벚꽃·눈 등), GPU 배치·컬링 드라이버, 카탈로그, 플러그인 |
| `camera` | 4,503 | 49 | 21 | `CameraSystem`, 카메라 모드·컨트롤러·충돌, 시네마틱·클로즈업, 카메라 패널·디버그 UI, 플러그인 |
| `character` | 3,661 | 32 | 11 | 캐릭터 도메인 store·플러그인, 장비·소켓 부착, 캐릭터 메뉴·크리에이터 UI |
| `content` | 334 | 4 | 1 | 콘텐츠 번들 매니페스트·로더·검증, 세이브에서 번들 export |
| `dialog` | 356 | 6 | 2 | 대화 트리 `DialogRunner`(`custom` 조건·효과 확장점), 대화 registry·store, `DialogBox` |
| `editor` | 12,283 | 93 | 28 | 에디터 셸(`Editor`, `EditorLayout`, `createEditorShell`)과 패널(건축·NPC·카메라·애니메이션·게임플레이·성능·프로젝트 자산 등), 선택·단축키·플레이 모드 |
| `effects` | 415 | 3 | 1 | `Footprints`, `TeleportDropEffect` |
| `error` | 102 | 2 | 1 | `GaesupErrorBoundary` |
| `gameplay` | 778 | 11 | 4 | 트리거→조건→액션 규칙 엔진 `GameplayEventEngine`, registry, 클라이언트 서비스. `server.ts`는 서버 계약 진입점용 |
| `grid` | 210 | 4 | 1 | 격자 좌표 어댑터 `SquareGridAdapter`, `FreePlacementAdapter` |
| `hooks` | 916 | 12 | 2 | `useGaesupController`, `useKeyboard`, `useClicker`, `useRideable`, `useTeleport`, `useGenericRefs`, deprecated `useAnimationPlayer` |
| `i18n` | 184 | 5 | 1 | 언어 store `useI18nStore`(전역), `t`, 플러그인 |
| `input` | 1,756 | 21 | 7 | `WorldInputBackend`·`WorldInputScope`·`WorldInputActions`, 게임패드, 터치 컨트롤, `WorldInputSurface` |
| `interactions` | 3,424 | 32 | 15 | 상호작용 대상 store, `InteractionSystem`·`AutomationSystem`·`InteractionBridge`, 클릭 이동(`Clicker`, `GroundClicker`), `ControllerWrapper`(= `GaesupController`) |
| `kernel` | 49 | 2 | 1 | `EngineStats`(엔진 카운터) |
| `motions` | 5,605 | 68 | 33 | `PhysicsEntity`, `PhysicsSystem`·`MotionSystem`, `PhysicsBridge`·`MotionBridge`, `EntityController`, 텔레포트, motions 플러그인 |
| `navigation` | 1,061 | 7 | 3 | 격자 길찾기 `NavigationSystem`(WASM 가중 A*, JS fallback), 장애물 registry, 클릭 이동 경로, NPC 경로 어댑터 |
| `networks` | 4,504 | 29 | 17 | 멀티플레이 WebSocket 클라이언트 `PlayerNetworkManager`, `useMultiplayer`, 원격 플레이어 UI, 방문 스냅샷(`visit/`), 서버 권한 계약·어댑터(`adapter/`) |
| `npc` | 3,440 | 28 | 10 | NPC store(템플릿·인스턴스·두뇌 청사진), 고정 틱 `NPCSimulation`, 두뇌·강화학습 어댑터, 지각, 일과표, `NPCSystem`·`NPCInstance`, 플러그인 |
| `perf` | 520 | 8 | 8 | 기기 감지·품질 tier(`QualityProfileProvider`), `PerformanceCollector`, `IdleFrameRate`, 렌더러 통계, `usePerfStore`(전역) |
| `placement` | 322 | 4 | 1 | 배치 규칙 엔진 `PlacementEngine` |
| `platform` | 299 | 3 | 2 | 월드·플레이어 스냅샷(`WORLD_SNAPSHOT_DOMAINS`), 서버 플러그인 호스트 |
| `plugins` | 1,297 | 11 | 5 | `PluginRegistry`, 플러그인 컨텍스트(이벤트 버스, 확장 registry 13개), `ServiceKey`, 검증, `createStoreDomainPlugin` |
| `prefab` | 839 | 7 | 3 | 프리팹 정의·인스턴스화·오버라이드·직렬화 |
| `project-settings` | 547 | 5 | 2 | 프로젝트 설정(물리·렌더링·입력·빌드·에디터)과 프로젝트 파일 |
| `rendering` | 3,025 | 30 | 14 | `createRenderer`·`rendererKind`, TSL 재질(`tsl/`), `CompileGate`, `GpuBatchBridge`, `CascadedSun`·`DynamicSky`·`DynamicFog`, 후처리, 툰·외곽선, WebGL 그림자 깊이 재질 |
| `runtime` | 1,489 | 17 | 21 | 합성 루트 `createGaesupRuntime`, `GaesupRuntimeProvider`, 프레임 스케줄러(`frame/`), 세이브 진단 |
| `save` | 871 | 11 | 12 | `SaveSystem`(도메인 바인딩, 트랜잭션 복원), IndexedDB·localStorage·namespace 어댑터, 자동 저장 hook |
| `scene` | 759 | 12 | 2 | 장면 전환 store, `SceneFader`, `SceneRoot`, 방 가시성 store, 플러그인 |
| `scene-object` | 3,430 | 24 | 13 | 에디터 저작 모델 `SceneDocument`: 명령, 계층, 컴포넌트, 쿼리·태그·레이어, Unity 교환, 세이브 바인딩 |
| `scripting` | 946 | 10 | 3 | 스크립트 컴포넌트 런타임 `ScriptRuntime`, registry, React host |
| `simulation` | 344 | 4 | 4 | `FixedStepClock`, `AnimationClockLoop`, 물리 보간 `PhysicsPresentation`, `WorldPhysicsContext` |
| `stores` | 540 | 25 | 3 | 월드 store `createGaesupStore`(mode·urls·sizes·rideable·performance·physics 슬라이스 + 카메라·애니메이션·상호작용·월드 슬라이스), `lazyStore`, `lazyScopedStore` |
| `time` | 443 | 8 | 2 | 게임 시계·날짜 계산, time store, `getTimeClock`, 플러그인 |
| `types` | 47 | 1 | 0 | 공용 타입 `common.ts` |
| `ui` | 2,015 | 21 | 5 | 토스트, 말풍선, 미니맵, 세이브 진단 토스터, `MinimapSystem`, `UIBridge`, `useUIConfigStore`(전역) |
| `utils` | 1,007 | 16 | 5 | `logger`, `reportError`, id, clone, guards, env, 벡터·수학·메모이제이션·오브젝트 풀 |
| `wasm` | 245 | 1 | 1 | Rust 코어 WASM 로더 `loadCoreWasm`. Rust 소스 `src/*.rs`(잔디 데이터, 행렬, 벡터, 입자, 가중 A*, 공간 격자)와 `build.sh` |
| `weather` | 454 | 11 | 3 | 날씨 store·플러그인, `WeatherEffect`(TSL `NodeWeather`), `WeatherHUD` |
| `world` | 4,027 | 43 | 12 | `GaesupWorld`(= `WorldConfigProvider`), `GaesupWorldContent`, `WorldPhysics`, `WorldBridge`·`WorldSystem`·`SpatialGrid`, 탈것 `Rideable`, 영속화 `SaveLoadManager` |
| 합계 | 90,197 | 855 | 374 | 루트 배럴 `src/core/index.ts`(209줄)와 `src/core/__tests__`의 테스트 1개는 별도 |

루트 배럴은 대부분 모듈을 `export *`하지만 `boilerplate`, `kernel`, `simulation`, `types`는 싣지 않고(`FixedStepClock`·`AnimationClockLoop`는 `runtime`이 재수출), `navigation`·`rendering`·`platform`·`wasm`은 고른 이름만 싣는다.

## examples

| 파일 | 줄 | 내용 |
|---|---:|---|
| `examples/main.tsx` | 14 | `createRoot`로 `#root`에 그린다. `lazy(() => import('./minihome/Minihome'))`를 `Suspense`로 감싸, three.js가 첫 UI 청크에 들어가지 않는다 |
| `examples/minihome/Minihome.tsx` | 60 | `GaesupWorld`(`urls.characterUrl` = `gltf/trainer_green.glb`, 3인칭 카메라) → `Canvas`(`gl={createRenderer}`, `shadows="percentage"`) → `GaesupWorldContent quality="auto"` → `CascadedSun`, `WorldPhysics` 안에 `GaesupController`·`BuildingController`·배회 NPC 2명(`trainer_red.glb`). 마운트 때 `useBuildingStore.getState().hydrate(createVillage())` |
| `examples/minihome/village.ts` | 67 | 결정적 마을 데이터 `createVillage()`: 4m 셀 12×12 타일, 연못(물+모래 둔치), 돌길, 문·창문이 있는 오두막 벽 4개, 참나무 2·벚꽃 2·모닥불·깃발 |

- 실행: `corepack pnpm install` 뒤 `corepack pnpm dev` → `http://127.0.0.1:5174/`.
- 규칙: 공개 진입점과 그 export만 import한다(`src/__tests__/examplePackageConsumption.test.ts`). 예제 라우트는 lazy 청크여야 하고 에디터·후처리를 미리 싣지 않는다(`test:demo`).
- 예제는 런타임을 만들지 않고 정적 store API(`useNPCStore.getState()`, `useBuildingStore.getState()`)를 쓰므로 legacy 전역 store로 돈다([architecture.md](architecture.md)의 store 범위, PRD LIB-1).
- 옛 자체 엔진 minihome(3,492줄)과 그 빌드·릴리스 스크립트는 `8e21fc39`(P0)에서 지웠다.

## public

| 경로 | 내용 | 쓰는 곳 | npm 포함 |
|---|---|---|---|
| `gltf/trainer_green.glb`, `gltf/trainer_red.glb` | 캐릭터 모델 | 예제, NPC 기본 템플릿(`src/core/npc/stores/npcDefaults.ts`), warrior 청사진 | 포함 |
| `gltf/props/*.glb`(11개) + `LICENSE.txt` | 침대·의자·작업대·문·울타리·조명·우체통·노점·수납장·탁자·창문 | 건축 오브젝트 카탈로그 `src/core/building/catalog/objects.ts`, 시드 자산 `src/core/assets/data/seedAssets.ts` | 포함 |
| `gltf/avatars/manual-v1/` | 부위 17개 × LOD0·LOD1 = GLB 34개, `catalog.json`, `evidence.json` | `scripts/build-avatar-fixtures.mjs`가 만드는 시험용 형상, `src/avatar/__tests__/avatar.test.ts` | 포함 |
| `wasm/gaesup_core.wasm` | Rust 코어(`src/core/wasm`, `build.sh`로 빌드) | `src/core/wasm/loader.ts`(잔디, 눈, 내비게이션) | `dist/wasm/`로 포함 |
| `gaesupworld.ico` | 파비콘 | `index.html` | 미포함 |

## scripts

| 파일 | 용도 | 연결 |
|---|---|---|
| `check-harness.mjs` | `CLAUDE.md` 존재, `verify`·`verify:full` 체인의 필수 관문, CI가 각 관문을 도는지, tsconfig 엄격 플래그, 검증 스크립트 존재 | `test:harness` → `verify`, CI checks |
| `check-entry-isolation.cjs` | 런타임 import 그래프로 Layer 1 파일과 서버 진입점의 프레임워크 도달을 검사 | `check:layer1`, `check:entries` → `verify`, CI checks |
| `check-quality-ratchet.cjs` | 품질 지표 7개를 `quality-baseline.json`과 비교, `--update`로 갱신 | `check:quality` → `verify`, CI checks |
| `copy-cjs-types.cjs` | 선언 후처리: 소스 `.d.ts` 복사, alias를 상대 경로 `.js`로, `.d.cts` 쌍 생성, 선언 그래프 검증 | `build:types` → `build` |
| `verify-package-consumer.cjs` | `npm pack` → 임시 소비자 프로젝트 설치 → 타입·ESM/CJS·물리·Vite 빌드 검증 | `test:package:built`, `test:package` → `verify:full`, CI package, `release/consumer.mjs` |
| `verify-demo-surface-chunk.cjs` | 예제 운영 빌드의 manifest로 lazy 라우트와 초기 청크 표면 검사 | `test:demo` → `verify:full`, CI demo |
| `browser-smoke.cjs` | Vite dev 서버 + headless Chromium으로 기본 라우트 캔버스가 그려지고 페이지 오류가 없는지 | `test:browser`(수동, 검증·CI에 없음) |
| `build-demo.mjs` | 예제를 `--base=${GAESUP_BASE_URL ?? '/gaesup-world/'}`로 빌드, `404.html`·`.nojekyll`·`version.json`(버전·커밋·dirty) 추가 | `build:demo`, `predeploy`, `minihome-pages.yml`, `release/build-demo.mjs` |
| `build-avatar-fixtures.mjs` | `src/avatar/core/rig.json`으로 `public/gltf/avatars/manual-v1` GLB·카탈로그 생성 | `avatar:fixtures`(수동) |
| `lib/packageEntries.cjs`(+`.d.cts`) | `package.json` `exports`에서 진입점 목록 파생 | `vite.config.ts`, export snapshot 테스트, `test/accept/support/moduleScope.ts` |
| `lib/importGraph.cjs`(+`.d.cts`) | 소스의 런타임 import 그래프(타입 전용 import 제외, tsconfig alias 해석) | `check-entry-isolation.cjs`, 수용 시나리오 S-H14 |
| `lib/devServer.cjs` | 빈 포트에 Vite dev/preview 띄우기, `GAESUP_PROBE_URL`, WebGPU Chrome 실행, 페이지 오류 수집 | `browser-smoke.cjs`, 측정([measurement.md](measurement.md)) |
| `performance/inventory.mjs` | `src/core` 모듈 정적 인벤토리(frame·구독·직렬화·GPU·할당 표지 수) → `.artifacts/performance/inventory/<시각>/` | `audit:core`, CI checks(산출물 업로드) |
| `performance/source-identity.mjs` | 소스·설정·잠금 파일의 내용 해시와 환경 정보 | `inventory.mjs` |
| `assets/cli.mjs` | 생산 자산 CLI: `doctor`, `generate`, `resume`, `build`, `validate`, `approve`, `publish`, 인물용 `optimize --preset figure`(`--matte`, `--dilate`, `--budget`, `--texel-density`, `--add-clip 이름 --from 기증.glb#클립`), `inspect [파일·폴더…]`(PASS/FAIL, `--render`로 Blender 검토 시트, `--json`), `generate-character <id>`(`--views`로 참고 그림, Tripo 생성, `--dry-run`, `--publish`). 키는 환경 변수나 git 무시된 `.env`의 `TRIPO_API_KEY`·`OPENAI_API_KEY` | `assets:production` |
| `assets/import-kaykit.mjs` | KayKit CC0 참조 자산을 받아 `public/gltf/kaykit`에 정리 | `assets:references` |
| `assets/build.mjs`, `meshy.mjs`, `publish.mjs`, `contract.mjs`, `export.py`, `test-fixtures.mjs` | Blender 빌드·검증, Meshy 호출, 게시, 라이브러리 계약(`src/core/assets/production/index.ts`를 트랜스파일해 그대로 실행), headless Blender 스크립트, 테스트 GLB | CLI 내부 |
| `assets/figure.mjs`, `inspect.mjs`, `tripo.mjs`, `render-figure.py` | 인물 preset(dedup·prune·resample·meshopt, rest-pose 스텁 제거, `--matte`면 MR 맵 제거, 삼각형 예산 simplify, 클립 이름 정규화, 법선 맵 절반 크기 무손실 WebP, UV 섬 dilation, 다른 리그의 idle 이식), 인물 검사(`inspectFigure`), Tripo 캐릭터 생성(재개 가능한 후보), Blender 검토 시트 | CLI 내부 |
| `assets/*.test.mjs`(3개) | 자산 도구 테스트(`node --test`) | `test:asset-tools` → `verify`, CI jest |
| `release/run.mjs` | semantic-release 실행, 릴리스 manifest(`.artifacts/release/manifest.json`) | CI release |
| `release/registry.mjs` | npm 레지스트리에 버전이 보일 때까지 기다리고 tarball 무결성 확인 | CI release |
| `release/consumer.mjs` | 레지스트리 tarball로 `verify-package-consumer.cjs` 실행(무결성 고정, receipt) | CI release |
| `release/build-demo.mjs` | 검증된 설치 패키지로 예제 빌드(`GAESUP_PACKAGE_ROOT`) | CI release |
| `release/live.mjs`, `release/browser.mjs` | 배포된 사이트의 `version.json` 신원 확인, SwiftShader WebGL2(WebGPU 없음)로 캔버스·오류 확인 | CI deploy |
| `release/metadata.mjs`, `release/baseline.json` | semantic-release prepare 플러그인(`gaesupRelease` 기록), 첫 자동 릴리스 기준(v1.0.31) | `.releaserc.json`, `run.mjs` |

`scripts/assets/README.md`의 브라우저 패널(`/assets`, `/asset-review`)은 지운 옛 minihome 라우트를 전제로 한다. 지금 예제에는 라우트가 없고, `assets/server.mjs`가 허용하는 origin(`127.0.0.1:5188`)도 지금 dev 서버 포트(5174)와 다르다.

## test

| 경로 | 내용 |
|---|---|
| `test/accept/budgets.json` | 수용 시나리오 16개의 유일한 정의(제목, 예산, 상태). 지금 `green` 4개(S-H10, S-H11, S-H13, S-H14), `pending` 12개 |
| `test/accept/budget.ts`, `scenario.ts`, `budget.test.ts` | 예산 판정과 `acceptScenario` 등록. 결과는 `.artifacts/accept/headless/<ID>.json` |
| `test/accept/{catalog,imports,network,npc,save}.test.ts` | 시나리오 측정. `imports.test.ts`(S-H14)는 공개 진입점이 import 시 실행하는 최상위 부수효과를 센다 |
| `test/accept/support/moduleScope.ts` | S-H14용 모듈 최상위 효과 분석 |
| `test/mocks/assetModule.ts`, `reactThreePostprocessing.tsx` | jest `moduleNameMapper` 대상 |
| `test/support/multiplayerWire.ts` | 가짜 소켓으로 실제 `useMultiplayer`를 돌리는 하네스(네트워크 테스트, S-H13) |

## integrations/unity

- `Editor/GaesupSceneBridge.cs`(136줄): Unity 메뉴 `Tools/Gaesup World/Import Scene JSON`, `Export Selected Children as Scene JSON`. 형식은 `gaesup-unity-scene` v1.
- `Runtime/GaesupSceneObject.cs`(13줄): 객체 id, 컴포넌트 JSON, 태그, 레이어를 보존하는 `MonoBehaviour`.
- TypeScript 쪽 짝은 `exportUnityScene`·`importUnityScene`(`src/core/scene-object/unity.ts`).

## .github

| 파일 | 내용 |
|---|---|
| `workflows/release.yml` | push(`main`, `ci/**`), PR(`main`, `master`), 수동 실행. 병렬 job `checks`·`jest`·`package`·`demo`가 `verify:full`을 나눠 돌고, `main` push에서만 `release`(npm 게시·레지스트리·소비자·예제 빌드)와 `deploy`(GitHub Pages, 라이브 확인)가 이어진다. 자세한 단계는 [verification.md](verification.md) |
| `workflows/minihome-pages.yml` | 수동 실행 전용. `typecheck` → `build:demo`(소스 빌드) → Pages 배포 |
| `actions/setup/action.yml` | Node 24, corepack pnpm, pnpm store 캐시, `pnpm install --frozen-lockfile --ignore-scripts` |

## 지운 것 (기록)

아래는 지금 트리에 없다. 되살리거나 문서에 존재하는 것처럼 쓰지 않는다.

| 커밋 | 지운 것 |
|---|---|
| `8e21fc39`(P0) | 옛 자체 엔진 minihome 예제와 그 빌드·릴리스 스크립트, `src/next`, `src/admin`, 소비자 없는 병렬 구현 |
| `16cd9d45`(DEL-1) | 생활 게임 도메인: inventory, items, economy, quests, mail, crafting, events, catalog, town, relations, farming, tools, `TreeObject`·`FishSpot`·`BugSpot` |
| `2fcfcece`(DEL-2) | NPC 네트워크 층(`NetworkBridge`, `NetworkSystem`, `NPCNetworkManager`, `ConnectionPool`, `MessageQueue`, 관련 hook 5개와 패널, `runtime.networkBridge`), `core/ops`(RBAC), 샘플 플러그인(`plugins/samples.ts`), 플러그인 컨텍스트의 `catalog`·`quests` registry, `WorldContainer` 별칭, `usePhysics`, `BuildingBridge`, `useGaesupContext`, `useCursorState` |

## 관련 문서

- 개발: [architecture.md](architecture.md) · [verification.md](verification.md) · [module-status.md](module-status.md) · [workflow.md](workflow.md) · [principles.md](principles.md) · [measurement.md](measurement.md) · [decisions.md](decisions.md) · [trends-2026.md](trends-2026.md)
- 사용: [../guide/getting-started.md](../guide/getting-started.md) · [../guide/api-map.md](../guide/api-map.md)
- 색인: [../README.md](../README.md) · 계획: [../../PRD.md](../../PRD.md) · 규칙: [../../CLAUDE.md](../../CLAUDE.md)
