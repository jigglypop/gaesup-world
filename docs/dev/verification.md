# 검증

엔진을 고친 뒤 통과시켜야 하는 관문 전체다. `verify`·`verify:full`이 도는 순서와 각 단계가 실제로 검사하는 것, 품질 래칫, export snapshot, 공개 API를 바꿀 때의 순서, CI, 흔한 실패와 대처를 다룬다. 엔진 코드를 고치는 모든 사람(다음 AI 세션 포함)을 위한 문서다. 스크립트 파일의 위치는 [repository.md](repository.md), 작업 흐름은 [workflow.md](workflow.md)에 있다.

기준: 2026-09-27, `main` `2fcfcece`. 명령은 저장소 루트에서 `pnpm`(없으면 `corepack pnpm`)으로 돈다.

## 명령 요약

```text
verify      = pnpm run test:harness && pnpm run typecheck && pnpm run lint
              && pnpm run check:layer1 && pnpm run check:entries && pnpm run check:quality
              && pnpm run test:asset-tools && pnpm exec jest --runInBand
              && pnpm run build && pnpm exec publint
verify:full = pnpm run verify && pnpm run test:memory:ci && pnpm run test:package:built && pnpm run test:demo
```

- slice마다 `pnpm run verify:full`을 통과시킨다([../../PRD.md](../../PRD.md)). 전체는 약 20분 걸리므로 백그라운드로 돌리고, 도는 동안 `src`를 바꾸지 않는다([workflow.md](workflow.md)).
- `build` → `publint` → `test:package:built`는 같은 `dist`를 순서대로 쓴다. `build`가 `rimraf dist/`로 시작하므로 다른 빌드와 병렬로 돌리면 뒤 단계가 사라진 파일을 본다.
- `pnpm install`은 `prepare`(= `npm run build`)를 부른다. 설치만 하려면 `--ignore-scripts`를 붙인다(CI도 그렇게 한다).

## 단계별 검사

| # | 명령 | 실행 | 검사 |
|---:|---|---|---|
| 1 | `test:harness` | `node scripts/check-harness.mjs` | `CLAUDE.md`가 있다. `verify`가 `test:harness`·`typecheck`·`lint`·`check:layer1`·`check:entries`·`check:quality`·`test:asset-tools`·`build`를, `verify:full`이 `verify`·`test:memory:ci`·`test:package:built`·`test:demo`를 부른다. 두 체인의 모든 `pnpm run X`·`pnpm exec X` 단계(`verify` 제외)가 `.github/workflows/release.yml`에 같은 형태로 있다. `tsconfig.json`의 `strict`·`noUncheckedIndexedAccess`·`exactOptionalPropertyTypes`가 `true`다. `scripts/verify-package-consumer.cjs`, `scripts/verify-demo-surface-chunk.cjs`가 있다 |
| 2 | `typecheck` | `tsc -p tsconfig.json && tsc -p tsconfig.test.json && tsc -p tsconfig.build.json --noEmit` | 앱(`src`·`examples`·설정), 테스트(`src`·`examples`·`test`), 선언 빌드 범위(`src`만) 세 가지를 검사. `tsc`는 `@typescript/native`(TypeScript 7.0.2)다. ts-jest와 eslint는 `typescript`(6.0.2) API를 쓴다 |
| 3 | `lint` | `eslint . --report-unused-disable-directives --max-warnings 0` | 경고 하나도 실패. 쓰이지 않는 `eslint-disable` 주석도 보고. raw `useFrame` import 금지, Layer 1 프레임워크 import 금지, `import/order`([repository.md](repository.md)의 eslint) |
| 4 | `check:layer1` | `node scripts/check-entry-isolation.cjs --layer1 --max-violations=0` | `src/core/**/core/**`의 비테스트 `.ts` 파일마다 런타임 import 그래프(타입 전용 import 제외, 상대 경로와 tsconfig alias 해석)를 넓이 우선으로 따라가, `react`·`react/*`·`react-dom`·`zustand`·`@react-three/*`(`@react-three/rapier` 제외)에 닿으면 위반. 위반 파일마다 `파일: 모듈 <- 경로 체인`을 출력하고 하나라도 있으면 실패 |
| 5 | `check:entries` | `node scripts/check-entry-isolation.cjs src/server-contracts.ts` | 서버 계약 진입점에서 같은 그래프를 따라가 위 프레임워크 모듈(rapier 포함)에 닿으면 실패. 체인을 10개까지 출력 |
| 6 | `check:quality` | `node scripts/check-quality-ratchet.cjs` | 품질 지표 7개가 `quality-baseline.json`과 같아야 한다. 늘어도, 줄어도 실패([품질 래칫](#품질-래칫)) |
| 7 | `test:asset-tools` | `node --test scripts/assets/*.test.mjs` | 자산 파이프라인 build·Meshy·서버 테스트 3개 |
| 8 | jest | `pnpm exec jest --runInBand` | jest 4개 프로젝트 전부를 한 프로세스에서 차례로([jest](#jest)) |
| 9 | `build` | `npm run clean && npm run build:esm && npm run build:cjs && npm run build:types` | `dist/` 비우기 → Vite ESM → Vite CJS → `tsc -p tsconfig.build.json`으로 선언 → `scripts/copy-cjs-types.cjs`(소스 `.d.ts` 복사, alias를 상대 `.js` 경로로, `.d.cts` 쌍 생성, CSS side-effect import 제거, 선언 그래프 해석 검사) |
| 10 | publint | `pnpm exec publint` | 빌드된 패키지의 `package.json`(`exports`, 타입, `files`)을 lint |
| 11 | `test:memory:ci` | `jest --config jest.memory.config.js --runInBand --logHeapUsage` | `src/core/boilerplate/__tests__/*.test.ts` 4개를 힙 사용량 기록과 함께 다시 돈다. 임계값 판정은 없다 |
| 12 | `test:package:built` | `node scripts/verify-package-consumer.cjs` | 설치형 소비자 검증([설치형 소비자 검증](#설치형-소비자-검증)) |
| 13 | `test:demo` | `node scripts/verify-demo-surface-chunk.cjs` | 예제 운영 빌드의 청크 표면([예제 청크 검사](#예제-청크-검사)) |

개발 중에는 필요한 단계만 돌린다: `pnpm exec jest <경로>`, `pnpm exec jest --selectProjects package`, `pnpm run typecheck`, `pnpm check:quality`.

## 품질 래칫

`scripts/check-quality-ratchet.cjs`는 `src/` 아래 `.ts`·`.tsx`(`.d.ts` 포함)에서 경로에 `__tests__`·`.test.`·`.spec.`이 없는 파일을 센다.

| 지표 | 세는 것 | 기준선 |
|---|---|---:|
| `interfaceDeclarations` | 줄 머리의 `interface` 선언(`export`·`declare` 포함) | 411 |
| `consoleCalls` | `console.log`·`.warn`·`.error`·`.info`·`.debug` 호출. `src/core/utils/logger.ts`는 제외 | 21 |
| `anyUsages` | `: any`, `as any`, `<any>`, `any[]` | 0 |
| `rawUseFrame` | `useFrame(` 호출. `src/core/runtime/frame/react/`는 제외 | 2 |
| `oversizedComponents` | 200줄을 넘는 `.tsx` 파일 수 | 39 |
| `oversizedModules` | 500줄을 넘는 `.ts` 파일 수 | 10 |
| `decorators` | 줄 머리에서 `@` 뒤에 대문자 이름과 `(`가 오는 데코레이터. WGSL `@group(0)` 같은 소문자는 제외 | 0 |

- 줄 수는 `source.split('\n').length`(= `wc -l` + 1)다. 그래서 `.tsx`는 `wc -l` 200줄, `.ts`는 500줄부터 초과로 잡힌다(예: `wc -l` 500줄인 `src/core/plugins/PluginRegistry.ts`도 센다).
- 나빠지면 `quality ratchet failed (increased)`로 실패한다. 파일을 기준 아래로 맞추려고 줄을 합치거나 억지로 쪼개지 않는다. 중복을 걷어내거나 책임 단위로 나눈다. `console`은 `logger`로, raw `useFrame`은 `useEngineFrame`·`useSharedFrame`으로, `any`는 실제 타입으로 바꾼다.
- 좋아져도 `quality improved; run "pnpm check:quality --update" to lock it in`으로 실패한다. `pnpm check:quality --update`로 기준선을 다시 쓰고 `quality-baseline.json`을 같은 커밋에 넣는다. 개선은 반드시 고정해야 다음 사람이 되돌리지 못한다.

## jest

| 프로젝트 | 대상 | 파일 수 |
|---|---|---:|
| `node` | `**/*.test.ts`(`src/__tests__/`, `test/accept/` 제외), node 환경 | 252 |
| `dom` | `**/*.test.tsx`, jsdom | 135 |
| `package` | `src/__tests__/**/*.test.ts` | 9 |
| `accept` | `test/accept/**/*.test.ts` | 6 |

`package` 프로젝트는 패키지 표면과 구조 규칙을 지킨다.

| 파일 | 지키는 것 |
|---|---|
| `exportSnapshot.test.ts` | 진입점별 런타임 export 이름 목록([export snapshot](#export-snapshot)) |
| `publicApi.test.ts` | 루트의 핵심 런타임 이름과 타입 이름, 배럴 구조 |
| `publicApiContracts.test.ts` | 공개 진입점만으로 도는 동작 계약: 장면 생성·직렬화, 명령·revision, 계층·월드 좌표, 태그·레이어·쿼리, 저장 바인딩·스냅샷 복원, Unity 왕복, 두 월드·플러그인·도메인 격리, 30·60·144Hz 고정 틱, 가구 회피 경로 |
| `packageExports.test.ts` | Node 범위, 필수 peer, `exports`의 import·require 타입과 파일, `.d.cts` 짝, `files` 포함, tsconfig `paths`가 진입점과 일치, Vite·jest alias가 tsconfig에서 온다, Vite 엔트리가 `exports`에서 온다 |
| `packageFiles.test.ts` | `files`의 소스 패턴마다 실제 파일이 있다. `README.md`, `README.ko.md`, `docs/**/*.md`의 상대 링크가 모두 실제 파일을 가리킨다 |
| `architectureBoundaries.test.ts` | Layer 1·2의 위로 향하는 edge 12개와 Layer 1 → rapier edge 9개를 정확히 고정, Layer 1의 React·Zustand·R3F 직접 import 0, 라이브러리가 `gaesup-world/...`를 런타임 import하지 않음 |
| `examplePackageConsumption.test.ts` | `examples/`가 공개 진입점과 그 export만 import |
| `serverContractsIsolation.test.ts` | `server-contracts`가 React·Zustand·R3F를 런타임에 끌어오지 않음 |
| `sourceRules.test.ts` | 문자열 id는 `createUniqueId`(`Date.now()` 금지), plain-object guard는 `utils/guards`에 하나, 렌더러·WebGPU 환경 검사는 `rendering/webgpu.ts`에만 |

- 문서도 검증 대상이다. `docs/` 아래 마크다운에 없는 파일로 가는 상대 링크가 있으면 `packageFiles.test.ts`가 실패한다.
- `accept` 프로젝트: 시나리오 정의·예산·상태는 `test/accept/budgets.json` 한 곳에 있다. `green`은 예산 안에 들어야 하고, `known-red`는 예산을 넘어야 하며(들어오면 실패하고 `green`으로 바꾸라고 한다), `pending`은 측정만 한다. 지금 16개 중 `green` 4개(S-H10, S-H11, S-H13, S-H14), `pending` 12개다. `pending`을 합격 근거로 세지 않는다. 결과는 `.artifacts/accept/headless/`에 남는다. 이 프로젝트만 돌리려면 `pnpm test:accept`.
- `jest.setup.js`가 `logger.disable()`로 로그를 끄고 매 테스트 뒤 mock을 되돌린다. DOM이 필요한 `.test.ts`는 파일 머리에 `/** @jest-environment jsdom */`를 둔다.

## export snapshot

`src/__tests__/exportSnapshot.test.ts`는 `scripts/lib/packageEntries.cjs`의 진입점 14개를 tsconfig alias(= 소스)로 import해, `default`를 뺀 런타임 export 이름을 정렬해 `src/__tests__/__snapshots__/exportSnapshot.test.ts.snap`과 비교한다. 타입 전용 export는 런타임 이름이 아니라서 여기 없다. 타입은 `publicApi.test.ts`와 설치형 소비자 검증이 지킨다. 지금 항목 수는 루트 946, `./editor` 220, `./building` 142, `./runtime` 73, `./server-contracts` 40, `./network` 27, `./assets` 23, `./plugins` 22, `./blueprints` 19, `./avatar` 18, `./gameplay` 17, `./navigation` 11, `./postprocessing` 9, `./blueprints/editor` 3이다.

갱신과 감사:

```sh
pnpm exec jest src/__tests__/exportSnapshot.test.ts -u        # = npx jest src/__tests__/exportSnapshot.test.ts -u
git diff --stat src/__tests__/__snapshots__/exportSnapshot.test.ts.snap
git diff -U0 src/__tests__/__snapshots__/exportSnapshot.test.ts.snap | grep '^[-+]  "'
```

- `-`로 시작하는 줄은 사라진 공개 이름이다. 하나하나가 승인된 삭제인지 확인한다(공개 API 삭제는 승인 후, [principles.md](principles.md)). 의도하지 않은 삭제는 대개 배럴에서 `export *` 한 줄이 빠지거나 이름이 겹쳐 가려진 경우다.
- `+`로 시작하는 줄은 새 공개 표면이다. 내부 helper가 `export *`로 새어 나온 것은 아닌지 본다.
- 진입점을 지우면 그 snapshot 항목이 obsolete가 된다. jest는 테스트가 모두 통과해도 obsolete snapshot이 있으면 실패 코드로 끝난다(Jest 30 `snapshot.failure`). `-u`로 지운다.
- CI에서는 jest가 새 snapshot을 쓰지 않고 실패한다(`CI` 환경에서 `ci` 옵션이 켜진다). 진입점을 추가하면 로컬에서 만든 snapshot을 커밋한다.

## publicApi.test.ts 작성법

- 런타임 값: 파일 위쪽의 `const root = jest.requireActual('gaesup-world') as Record<string, unknown>`에 대해 `expect(root).toHaveProperty(name)`로 검사한다. 호출까지 하려면 `jest.requireActual('gaesup-world') as typeof import('gaesup-world')`로 타입을 붙인다.
- 타입: 파일 머리의 `import type { ... } from 'gaesup-world'` 블록에 이름을 넣고, 같은 이름을 export된 튜플 타입 `RootTypeExports`에 추가한다. 이름이 사라지면 `typecheck`(`tsconfig.test.json`)와 ts-jest 컴파일에서 실패한다.
- 배럴 구조가 계약이면 `src/index.ts`·`src/core/index.ts` 소스 문자열을 읽어 검사한다(예: `export * from './core/editor'`).
- 동작 계약은 `publicApiContracts.test.ts`에 공개 진입점만 import해서 쓴다.

## 설치형 소비자 검증

`scripts/verify-package-consumer.cjs`(1,811줄)가 배포될 tarball을 실제 소비자처럼 설치해 검사한다.

1. `package.json` `exports`의 모든 대상이 `dist/`에 있다. 없으면 `Package export targets are missing from dist/`.
2. `copy-cjs-types.cjs`를 한 번 더 돌려도 선언 파일 해시가 그대로다(선언 후처리 멱등).
3. `dist/core/rendering/webgpu.d.ts`·`.d.cts`가 `@react-three/fiber`를 참조하지 않는다(R3F 버전 중립).
4. `npm pack --ignore-scripts`: 모든 export 대상이 들어가고, `src/`·`examples/`·`demo-dist/`·`server/`·`scripts/`·`.tmp/`·`docs/` 파일은 들어가지 않는다.
5. OS 임시 폴더에 소비자 프로젝트를 만든다. 의존성은 tarball, 필수 peer 전부, 저장소에 설치된 것과 같은 `react`·`react-dom` 버전. `npm install --ignore-scripts` 뒤 peer가 모두 설치됐는지 확인한다.
6. `@typescript/native`(TypeScript 7.0.2)의 `tsc`로 네 설정을 검사한다: ESM `consumer.tsx`(NodeNext, `strict`, `exactOptionalPropertyTypes`), CJS `consumer.cts`(모든 진입점 `import = require`), `exactOptionalPropertyTypes: false` 변형, Bundler 해석 호환(`GltfAndSizeResult`와 `three-stdlib` GLTF).
7. 저장소의 `typescript`(6.0.2) API로 `skipLibCheck: false`, `exactOptionalPropertyTypes` 켜고 끈 두 경우에 패키지 선언 파일 안의 오류가 0인지 본다.
8. `node runtime-smoke.mjs`·`runtime-smoke.cjs`: 모든 진입점 import·require, 진입점별 필수 이름 존재, 장면 컴포넌트 데이터의 정규 JSON 복사·거부, `SceneDocument` 명령, `WorldSystem` raycast·충돌, 카메라 충돌 반경·벽 관통 방지.
9. `node grounding-smoke.cjs`: ESM·CJS 각각 런타임 `setup()`, 헤드리스 NPC 60틱 이동과 자세 저장, 게임플레이 이벤트 1회 정책의 저장·복원, Rapier에서 박스·삼각 메시 지형 위 착지·점프·순간이동 후 접지 해제, `dispose()`.
10. 소비자 `vite build`로 `browser-app.tsx`(스타일 `gaesup-world/style.css` 포함)를 묶는다.

이름이 하드코딩된 곳(공개 API를 바꾸면 같은 커밋에서 고친다):

| 위치(`writeConsumerProject` 안) | 내용 |
|---|---|
| `namedRuntimeModules` | 진입점별로 런타임에 있어야 하는 이름. 루트 20개(`GaesupWorld`, `ActionEquipmentPanel`, `LegacyGrid`, `createGaesupRuntime`, `createBuildingPlugin`, 장면 문서 함수들, `createRenderer`, `isWebGPUAvailable`, 카메라·텔레포트 함수 등)와 각 subpath 1~3개 |
| `consumer.tsx`, `browser-app.tsx` | 값·타입 import 목록과 사용 코드(`createGaesupRuntime({ plugins: [...] })`, 청사진, 에디터 셸, 게임플레이 엔진, 시네마틱, 장비 등) |
| `cjsRootTypeProbe`, `createAutomationTypeProbe`, `createRawInputTypeProbe`, `createInteractionAggregateTypeProbe` | `AutomationAction`·`MouseState`·`InteractionConfig` 등 타입의 정확한 모양. 필드를 바꾸면 여기도 바꾼다 |
| `grounding-smoke.cjs` | `runtime.npcStore`·`npcSimulation`·`clockLoop`·`gameplayEvents`·`save`, `serializeNPCState`, `EntityStateManager`, `PhysicsSystem` 생성자 모양 |
| `createSpatialRuntimeProbe` | `WorldSystem`, `cameraUtils.improvedCollisionCheck`, `ThirdPersonController` |

환경 변수: `GAESUP_PACKAGE_ARCHIVE`(새로 pack하지 않고 이 tarball 사용), `GAESUP_EXPECTED_INTEGRITY`(tarball sha512 고정), `GAESUP_CONSUMER_RECEIPT`(성공 시 임시 폴더를 남기고 receipt JSON 기록). 릴리스 job의 `scripts/release/consumer.mjs`가 셋을 모두 쓴다.

## 예제 청크 검사

`scripts/verify-demo-surface-chunk.cjs`는 예제 앱을 운영 모드로 임시 폴더에 `vite build --manifest`로 빌드하고 sourcemap의 소스 목록으로 판단한다.

1. 진입 청크와 그 정적 import 폐포(초기 청크)에 `/three/` 경로 소스가 있으면 `Engine code leaked into the initial UI import graph.`
2. `examples/minihome/Minihome.tsx`를 담은 청크가 있고 초기 청크가 아니어야 한다. 아니면 `Expected an independently lazy route`.
3. 그 라우트 청크의 정적 import 폐포에 `/src/core/editor/`, `/src/core/rendering/postprocess/`, `/postprocessing/` 소스가 있으면 `The world route eagerly loads editor/postprocessing modules`.

초기 청크 수와 JS 바이트를 출력하고 임시 폴더를 지운다. 예제 라우트 이름을 바꾸면 스크립트의 `ROUTE` 상수도 바꾼다.

## 공개 API를 바꿀 때 순서

1. 삭제는 먼저 사용자 승인을 받는다.
2. 소스와 배럴을 고친다(`src/core/<모듈>/index.ts`, `src/core/index.ts`, `src/*.ts`). 진입점 자체를 더하거나 빼면 `package.json` `exports`(네 칸)와 `tsconfig.json` `paths`를 함께 고친다.
3. 사용처를 고친다: `examples/`, 테스트, `docs/`(특히 [../guide/api-map.md](../guide/api-map.md)).
4. `pnpm run typecheck`, `pnpm run lint`.
5. export snapshot을 `-u`로 갱신하고 diff로 사라진 이름·생긴 이름을 감사한다.
6. `src/__tests__/publicApi.test.ts`의 런타임 이름 목록과 `RootTypeExports`를 고친다.
7. `scripts/verify-package-consumer.cjs`의 하드코딩 이름과 타입 probe를 고친다.
8. `pnpm run build` → `pnpm exec publint` → `pnpm run test:package:built`를 차례로 돈다.
9. `pnpm run verify:full`을 통과시키고, snapshot·publicApi 테스트·소비자 스크립트·문서를 한 커밋에 넣는다.

## CI

`.github/workflows/release.yml`은 `main`·`ci/**` push, `main`·`master` 대상 PR, 수동 실행에서 돈다. 동시 실행 그룹은 `release-<ref>`이며 진행 중인 실행을 취소하지 않는다. `verify:full`을 병렬 job으로 나눠 돌리므로 `test:harness`가 체인의 모든 관문이 여기 있는지 검사한다. `release`를 뺀 job은 `.github/actions/setup`(Node 24, corepack pnpm, pnpm store 캐시, `pnpm install --frozen-lockfile --ignore-scripts`)으로 시작하고, `release`는 전체 git 이력을 받은 뒤 Node 24와 npm 11.11.1을 직접 설치해 같은 방식으로 설치한다.

| job | 제한 | 단계 |
|---|---:|---|
| `checks` | 15분 | `test:harness`, `typecheck`, `lint`, `check:layer1`, `check:entries`, `check:quality`, `audit:core`(검증 체인 밖, 소스 인벤토리를 `source-inventory` 산출물로 올림) |
| `jest` | 20분 | `.jest-cache` 캐시, `pnpm exec jest --cacheDirectory=.jest-cache`(`--runInBand` 없이 병렬), `test:memory:ci`, `test:asset-tools` |
| `package` | 20분 | `build`, `publint`, `test:package:built` |
| `demo` | 15분 | `test:demo` |
| `release` | 30분 | 위 네 job 뒤, PR이 아닌 `main`에서만. `build` → `scripts/release/run.mjs`(semantic-release, 릴리스가 있으면 `.artifacts/release/manifest.json`) → 릴리스가 나왔으면 `registry.mjs`(npm에 버전이 보일 때까지 최대 90회 대기, tarball sha512 확인) → `consumer.mjs`(그 tarball로 소비자 검증) → `build-demo.mjs`(검증된 설치 패키지로 예제 빌드) → manifest와 Pages 산출물 업로드 |
| `deploy` | 15분 | 릴리스가 나왔을 때. GitHub Pages 배포 → `scripts/release/live.mjs`(사이트 `version.json`의 버전·릴리스 커밋·무결성·`packageSource: npm`, 루트 HTML) → Playwright Chromium 설치 → `scripts/release/browser.mjs`(WebGPU를 지운 SwiftShader WebGL2로 캔버스가 그려지고 페이지 오류가 없는지, 스크린샷) → `live-evidence` 산출물(항상) |

- 로컬 `verify`와 다른 점: CI jest는 병렬이고 캐시를 쓴다. `audit:core`는 CI에만 있다. 릴리스·배포 검사는 로컬 체인에 없다.
- `run.mjs`는 작업 트리가 깨끗해야 하고, `v*` 태그가 하나도 없으면 `scripts/release/baseline.json`의 v1.0.31 기준 태그를 사람이 먼저 만들라며 멈춘다. semantic-release 설정은 `.releaserc.json`.
- `.github/workflows/minihome-pages.yml`: 수동 실행 전용. `typecheck` → `build:demo`(소스 빌드) → Pages 배포. 릴리스 검증을 거치지 않는다.

## 검증 체인 밖 도구

| 명령 | 내용 |
|---|---|
| `pnpm test:browser` | `scripts/browser-smoke.cjs`. Vite dev 서버와 headless Chromium으로 기본 라우트 캔버스(200×200 이상)가 그려지고 페이지 오류가 없는지. 검증·CI에 없다 |
| `pnpm audit:core` | `src/core` 정적 인벤토리. CI checks에서만 돈다 |
| `pnpm test:package` | `build` + `test:package:built` |
| `pnpm test:accept`, `test:coverage`, `test:watch`, `test:memory`, `test:memory:verbose` | jest 부분 실행·보조 |
| 측정 | 프레임·번들·운영 라우트 측정은 스크립트 없이 [measurement.md](measurement.md)의 방법으로 |

## 흔한 실패와 대처

| 증상 | 원인 | 대처 |
|---|---|---|
| `quality improved; run "pnpm check:quality --update" ...` | 지표가 기준선보다 줄었다 | `pnpm check:quality --update`, `quality-baseline.json`을 같은 커밋에 |
| `quality ratchet failed (increased)` | 지표가 늘었다 | 원인 코드를 고친다. 줄 합치기·억지 분할로 맞추지 않는다 |
| 테스트는 모두 통과했는데 jest가 실패 코드, snapshot `obsolete` 보고 | 지운 진입점·테스트의 snapshot이 남았다 | `pnpm exec jest src/__tests__/exportSnapshot.test.ts -u` |
| export snapshot 불일치 | 공개 이름이 바뀌었다 | 의도했으면 `-u` 뒤 diff 감사, 아니면 배럴을 되돌린다 |
| CI에서 `New snapshot was not written` | 새 진입점의 snapshot을 커밋하지 않았다 | 로컬에서 만들어 커밋 |
| `verify must invoke X`, `CI must run X` | 체인이나 `release.yml`에서 관문이 빠졌다 | `package.json` 체인과 `release.yml`에 같은 형태(`pnpm run X`)로 넣는다 |
| `layer1: N files, M reach React/Zustand/R3F indirectly` | Layer 1 파일이 다른 파일을 거쳐 프레임워크에 닿는다 | 출력된 체인의 edge를 끊는다. React 의존을 Layer 3로 옮기거나 타입 전용 import로 바꾼다 |
| `src/server-contracts.ts: ... N framework imports` | 서버 진입점이 React·Zustand·R3F에 닿는다 | 출력 체인에서 React 쪽 import를 서버 경로 밖으로 뺀다 |
| `architectureBoundaries` 기준선 차이 | 위로 향하는 edge가 생겼거나 없어졌다 | 새 edge는 없애고, 없앤 edge는 테스트 기준선 배열에서도 지운다 |
| `Package export targets are missing from dist/`, publint의 파일 없음 | `dist`가 없거나 다른 빌드가 지우는 중이다 | `build` → `publint` → `test:package:built`를 순서대로 다시, 병렬 실행 금지 |
| `<진입점> is missing runtime export <이름>` | 공개 이름을 지웠거나 옮겼다 | 의도한 변경이면 `verify-package-consumer.cjs` 목록을 고친다 |
| 소비자 `tsc` 오류, `Strict declaration verification failed ...` | 공개 타입이 바뀌었거나 선언이 엄격 설정에서 깨진다 | 타입 probe를 갱신하거나 선언을 고친다 |
| `Declaration finalizer changed the declaration graph on its second run.` | `copy-cjs-types.cjs`가 멱등이 아니다 | 선언 재작성 규칙을 고친다 |
| `Renderer declaration must not depend on version-specific R3F exports` | `rendering/webgpu.ts`가 R3F 타입을 import했다 | 그 파일에서 R3F 타입 의존을 뺀다 |
| `npm pack included development-only files.` | `files` 패턴이 넓다 | `package.json` `files`를 좁힌다 |
| `Engine code leaked into the initial UI import graph.` | `examples/main.tsx` 쪽 정적 import가 three를 끌어왔다 | 엔진 import를 lazy 라우트 안으로 |
| `The world route eagerly loads editor/postprocessing modules` | 월드 경로가 에디터·후처리를 정적 import한다 | `lazy()`나 별도 진입점으로 뺀다 |
| `relative markdown links` 실패 | `docs/`·README에 없는 파일로 가는 상대 링크 | 링크를 고치거나 대상 문서를 만든다 |
| `sourceRules` 실패 | id에 `Date.now()`, plain-object guard 중복, 렌더러 검사가 `rendering/webgpu.ts` 밖 | `createUniqueId`, `utils/guards`의 guard, `webgpu.ts` 함수를 쓴다 |
| Windows에서 여러 줄 치환·문자열 비교가 안 맞음 | `core.autocrlf=true`라 작업 트리 대부분이 CRLF(인덱스는 LF), `.gitattributes`가 없고 줄바꿈이 섞인 파일도 14개 있다 | 스크립트 치환은 `\r\n`을 `\n`으로 바꿔 처리한 뒤 원래 줄바꿈으로 쓴다. 커밋되는 내용은 LF다 |

## 관련 문서

- 개발: [workflow.md](workflow.md) · [principles.md](principles.md) · [repository.md](repository.md) · [architecture.md](architecture.md) · [module-status.md](module-status.md) · [measurement.md](measurement.md) · [decisions.md](decisions.md) · [trends-2026.md](trends-2026.md)
- 사용: [../guide/api-map.md](../guide/api-map.md) · [../guide/getting-started.md](../guide/getting-started.md)
- 계획: [../../PRD.md](../../PRD.md) · 규칙: [../../CLAUDE.md](../../CLAUDE.md)
