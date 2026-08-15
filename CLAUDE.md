# gaesup-world

React Three Fiber 기반 웹 3D 월드/캐릭터 컨트롤러 라이브러리. 단일 npm 패키지(모노레포 아님, turbo.json 없음 — turbo 의존성은 흔적일 뿐). 저장소 작업 언어는 **한국어**다(문서·주석·커밋 로그).

## 명령어

| 목적 | 명령 |
|---|---|
| 데모 개발 서버 | `pnpm dev` → **http://127.0.0.1:5174** (5173 아님) |
| 테스트 전체 | `pnpm test -- --runInBand` (runInBand이 기본 관례; memory 테스트는 필수) |
| 테스트 단건 | `pnpm test -- src/__tests__/publicApi.test.ts --runInBand` |
| 타입체크 (src만) | `pnpm exec tsc -p tsconfig.build.json --noEmit` — **`typecheck` 스크립트는 없음** |
| 타입체크 (examples 포함) | `pnpm exec tsc --noEmit` |
| 린트 | **변경한 파일에만** `pnpm exec eslint <files>` 실행. 저장소 전체 `pnpm lint`는 기존 실패 ~3457건으로 항상 빨간불 — 전체 실행으로 성공/실패를 판정하지 말 것 |
| 라이브러리 빌드 | `pnpm build` (esm → cjs → 타입 선언 3패스, `dist/` 출력) |
| 통합 검증 | `pnpm verify` (lint+test+types+publint) / `pnpm verify:full` (+package/demo 소비 테스트) |

깨진 것: `policy:dev` 스크립트는 존재하지 않는 `server/`를 참조 — 실행 불가. tsconfig의 `@components/*`, `@debug/*` alias는 존재하지 않는 디렉터리를 가리킴 — 사용 금지.

## 아키텍처 — 3계층 (ESLint로 강제됨)

1. **Layer 1 — `src/core/<domain>/core/`**: 순수 엔진. **React·Zustand·@react-three/fiber import 금지** (`no-restricted-imports`로 차단, Rapier는 허용). 클래스 기반 System/Component.
2. **Layer 2 — `src/core/<domain>/bridge/`**: `CoreBridge` 상속 + `@DomainBridge('<name>')` 데코레이터. command ↔ snapshot으로 엔진과 React를 중개. 등록은 `src/core/initializeBridges.ts`.
3. **Layer 3 — `hooks/`, `components/`, `stores/`, `ui/`**: React 표면. 프레임 루프는 raw `useFrame` 대신 `useBaseFrame`/`useManagedEntity` 사용.

`eslint-plugin-boundaries` 규칙(기본 disallow): core→core, controllers/hooks/stores→core, components→controllers+hooks+core. 위반하는 import를 새로 만들지 말 것.

공용 커널은 `src/core/boilerplate/`. 브리지는 `CoreBridge<EngineType extends IDisposable, SnapshotType, CommandType>`를 상속해 **정확히 3개 추상 메서드를 구현**한다: `buildEngine(id, ...args)` / `executeCommand(engine, command, id)` / `createSnapshot(engine, id)`. 스냅샷은 `getCachedSnapshot`/`cacheSnapshot`으로 캐시하고 **프레임마다 in-place 갱신**한다 — `createSnapshot` 안에서 `new THREE.Vector3()` 등 프레임당 할당 금지, 임시 객체는 클래스 필드로(참조: `MotionBridge.tempQuaternion`). React 쪽 소비는 `useManagedEntity(bridge, id, ref, options)`가 표준 경로(생성+DI 주입+lifecycle+프레임 구독을 한 번에 처리, `priority`/`throttle`/`skipWhenHidden` 옵션). 데코레이터는 `experimentalDecorators` + 엔트리 최상단 `import 'reflect-metadata'` 전제이며 `emitDecoratorMetadata`는 **false** — design:type 메타데이터에 의존하는 코드를 쓰지 말 것.

도메인 폴더 템플릿: `src/core/<domain>/{core,bridge,hooks,components,stores,types,__tests__}/ + index.ts + plugin.ts`. 상태는 Zustand v5 — 루트 통합 스토어 `src/core/stores/gaesupStore.ts`(슬라이스 조합) + 도메인별 독립 스토어 `src/core/<domain>/stores/<name>Store.ts` ~38개. 도메인 플러그인 20개는 `src/core/<domain>/plugin.ts`에 등록, `examples/pages/runtime.ts`에서 배선.

## 코딩 스타일 (AGENTS.md 강제 규칙 — 위반 시 리뷰 반려 대상)

- **주석 금지**(함수 선언부 제외), 의미 없는 빈 줄 금지, **이모지 금지**(코드·커밋·문서 전부).
- **`interface` 금지** — `export type`만 사용. 타입은 같은 폴더 `types.ts`로 분리, tsx 파일에 타입 정의 금지.
- **`console.log` 금지** — `logger` 유틸(`src/core/utils/logger`) 사용. 에러 메시지 형식 `[모듈명 Error]: 설명`. Layer 1은 throw, Layer 2가 catch.
- Magic number 금지(UPPER_SNAKE_CASE 상수로). Props 이벤트는 `on*`, 내부 핸들러는 `handle*`, 타입명은 `<Name>Props`/`<Name>State`.
- 파일 크기 상한: 컴포넌트 200줄 / 엔진·코어 500줄 / 유틸 150줄. 컴포넌트는 `<Name>/{index.tsx, styles.css, types.ts}` 분리.
- 스토어는 선택자 구독만(`useStore((s) => s.x)`) — 전체 스토어 구독 금지.
- 에디터 UI CSS는 `src/core/editor/styles/theme.css`의 CSS 변수만 사용(색/치수 하드코딩 금지), 클래스 네이밍 `[컴포넌트]-[엘리먼트]--[상태]`.
- 테스트는 코드 옆 `__tests__/`에, **테스트명은 한글로** 작성. 테스트 기대 수치를 통과 목적으로 임의 수정하는 것 금지 — 수치 변경은 사용자 컨펌 필요.
- 지시받은 방법 외의 우회 수단을 임의 선택하지 말 것 — 막히면 컨펌을 기다린다.

## 공개 API 계약 (가장 중요한 불변식)

- **`examples/`는 데모가 아니라 공개 API의 사용처이자 통합 체크포인트다.** 새 기능은 반드시 `examples/`에서 도달 가능해야 하고, examples는 `gaesup-world[/subpath]`로만 import한다 (`src/...` 직접 import 금지).
- 공개 API를 바꾸면 `src/index.ts`(수작업 관리, ~800줄)와 가드 테스트 `src/__tests__/publicApi.test.ts`, `packageExports.test.ts`를 함께 갱신하고 해당 테스트를 실행해 확인한다.
- subpath export(14개)를 추가/변경하면 **6개 파일을 반드시 동시 수정**: `package.json` exports, `vite.config.ts`, `tsconfig.json` paths, `jest.config.js` moduleNameMapper, `scripts/copy-cjs-types.cjs`, `src/__tests__/packageExports.test.ts`. 상세 절차는 `add-subpath-export` 스킬 참조.
- 세부 규칙 전문은 `AGENTS.md`(한국어) — API 작업 전 반드시 읽을 것. 에이전트 작업 라운드 기록은 `HARNESS.md`(append-only 로그, 기존 섹션 수정 금지·추가만).

## 변경 후 최소 검증 루프

1. 변경 도메인의 테스트: `pnpm test -- src/core/<domain> --runInBand`
2. 공개 API를 건드렸으면: `pnpm test -- src/__tests__/publicApi.test.ts src/__tests__/packageExports.test.ts --runInBand`
3. 타입: `pnpm exec tsc -p tsconfig.build.json --noEmit`
4. 변경 파일만 lint: `pnpm exec eslint <changed files>`

"빌드가 될 것"이라고 추정하지 말고 위 루프를 실제로 돌려라. 실패 출력은 그대로 보고한다.

## 건드리지 말 것 / 함정

- **`demo-dist/`(83MB, git에 커밋된 생성물)·`dist/`·`node_modules/`·`public/gltf/`(66MB GLB)**: 편집·검색(glob/grep) 금지. 컨텍스트만 낭비한다.
- `src/core/boilerplate/decorators/bridge.ts`와 `system.ts`의 한글 주석은 인코딩이 깨져 있음(mojibake). 주변 코드를 고치더라도 깨진 주석을 "복원"하려 들지 말고 그대로 둘 것.
- 루트의 `info.tsx`(고아 파일), `index.ts`(`export * from './src'` 레거시), `debug.log`, `*.png`는 무시.
- `@types/*` alias는 npm `@types` 스코프를 가리는 self-alias(`src/core/types/`) — 혼동 주의.
- TS는 최대 엄격 모드(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` 등) — 인덱스 접근은 undefined 가드 필수.
- `any` 금지(`src/blueprints/**`만 예외). Prettier: printWidth 100, singleQuote.
- 저장소가 OneDrive 동기화 폴더 안에 있음 — 대량 파일 I/O가 느릴 수 있고, 사이드 워크트리 `../gaesup-world-head-check`가 존재할 수 있다.
- git 작업 트리에 미커밋 삭제(demo-dist, .tmp 스크린샷 등)가 남아 있을 수 있음 — 묻지 않고 복원하거나 커밋하지 말 것.

## 심화 문서 (필요할 때만 로드)

- 전체 개요: `docs/GAESUP_WORLD_OVERVIEW.md` · 테스트: `docs/guide/TEST_GUIDE.md` · 도메인: `docs/domain/{MOTIONS,CAMERA,BLUEPRINT}.md` · API: `docs/api/*.md`
