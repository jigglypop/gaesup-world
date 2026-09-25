# PRD-60 패키지·계층·툴링

| 항목 | 값 |
|---|---|
| 우선순위 | P1(PKG-02는 2.0) |
| 마일스톤 | 병행 트랙, PKG-02는 M7 |
| 선행 | 10 PRD COR-01(kernel), COR-12(boilerplate 제거) |

## 1. 목표

- 서브패스가 실제 번들 경계가 된다. 순수 데이터 API는 React·three 없이 import된다.
- 계층 규칙을 코드 전체에 적용하고 CI에서 강제한다.
- 코드 건강 지표는 줄어들기만 한다(ratchet).

비목표: 빌드 도구 교체(vite 8/rolldown 유지), 테스트 러너 교체(jest 유지), 공개 심볼 이름 변경(2.0 제외).

## 2. 현재 상태

| 영역 | 문제 | 근거 |
|---|---|---|
| 엔트리 | 루트가 editor를 re-export하고 scene-object가 editor 청크에 공동배치. `network` 폐포에 WorldContainer·postprocessing. `runtime` 폐포 432파일 49도메인 | `src/index.ts:6`, 00 문서 4.4 |
| 부수효과 | `sideEffects`는 CSS/GLSL만 선언하는데 엔트리가 `reflect-metadata`, `initializeBridges()` 최상위 실행, decorator import 시 등록, `enableMapSet()`, `registerDefaultReinforcementAdapter` | `package.json:172-175`, `src/index.ts:1-4` |
| 의존성 | `@xyflow/react`가 editor 전용인데 `dependencies`(zustand 4·5 공존), `three-stdlib` 5기능만 사용(모두 `three/addons`에 있음), `@react-three/postprocessing`이 정적 import로 사실상 필수 | `package.json:255` |
| 자산 | 샘플 GLB 8.36MB 배포(59%), `exports`에 `./gltf/*`·`./wasm/*` 없음, 라이브러리 빌드가 publicDir를 dist로 복사(36MB) | |
| CJS | ESM 전용 three 서브패스 require(D-21), d.cts 1,026개, `copy-cjs-types.cjs` 404줄 | |
| 데모 | 기본 경로 minihome이 루트 barrel 네임스페이스를 받아 rapier·editor·postprocessing을 정적 로드(5.4MB raw). 성능 식별 plugin이 파일 1,616개 해시를 번들에 박고 시작마다 23.7MB 동기 해시 | `examples/minihome/apiChecks.ts:10`, `scripts/performance/vite-plugin.mjs:10` |
| 계층 | ESLint Layer 1 규칙이 정확한 이름만 막음, Layer 1 검사 대상이 코드의 11%, 엔진 → 게임플레이 import 18곳, 타입 수준 도메인 SCC 42, `export *` 401개 | `eslint.config.js:170-180` |
| 코드 건강 | 800줄 초과 8, 500줄 초과 26, 미사용 export 270, `plugin.ts` 복제 13, 정의 registry 싱글턴 6, pub/sub 3종, 같은 이름 export 53, `console.*` 26 | |
| 툴링 | 전체 jest 병렬 약 81초(목표 60), `transformIgnorePatterns`로 three 원본까지 변환, 컴파일러 둘(TS 7 CLI, TS 6 ts-jest·eslint·IDE), `exhaustive-deps` 꺼짐(켜면 54건), `no-floating-promises` 없음, 메모리 jest 설정이 삭제된 파일을 가리킴 | `jest.config.js:34-36`, `package.json:290,319` |

## 3. 작업

### PKG-01 엔트리와 번들

| Slice | 내용 | 완료 기준 |
|---|---|---|
| PKG-01a | 소비자 번들 측정 스크립트와 엔트리별 정적 폐포 ratchet(파일 수, 줄 수, 도메인 목록), `publicDir: false` + wasm 명시 복사, vite 설정 잔재 정리 | 00 문서 4.4 표를 스크립트로 재현, 폐포 증가 시 실패 |
| PKG-01b | minihome의 루트 네임스페이스 import 제거(쓰는 이름만, 진단 기능은 동적 import), 데모 폐포 검사에 minihome 추가, 성능 식별 plugin의 해시 manifest를 Lab 전용으로 | S-B01: 기본 경로 첫 로드에 rapier·editor·postprocessing 청크 0 |
| PKG-01c | React-free `gaesup-world/scene` 서브패스(SceneDocument, command, migration), 격리 검사 | `createSceneDocument` 계열 import < 20KB gz, 외부 패키지 import 0 |
| PKG-01d | 루트 editor re-export `@deprecated`, 청크 전략(`preserveModules` 또는 도메인 `advancedChunks`, 측정 후 선택) | 루트 폐포 감소, export snapshot 불변 |
| PKG-01e | `network`(프로토콜) / `network/react` 분리 | `network` 폐포에 React·R3F·three 0 |
| PKG-01f | `@xyflow/react` optional peer, CSS를 `style.css`/`editor.css`로 분리, `WorldPostProcessing` lazy와 `@react-three/postprocessing` optional peer | xyflow 미설치 프로젝트에서 runtime 동작 |
| PKG-01g | 레지스트리 등록을 runtime 생성 시 lazy로(COR-09, COR-12 이후), `sideEffects` 실제와 일치 | S-H14, webpack·rollup 소비자에서 등록 결과 동일 |

### PKG-02 2.0 정리(M7)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| PKG-02a | CJS 빌드와 d.cts 제거, exports ESM 단일(D-21) | `require('gaesup-world')` require(esm) 통과, `test:package:built` 통과 |
| PKG-02b | `three-stdlib` → `three/addons`, peer 범위를 CI 매트릭스로 검증한 범위로 | 최소·최신 매트릭스 통과 |
| PKG-02c | `./wasm/*` export, 샘플 GLB 별도 패키지 분리, 공개 타입의 전역 augmentation·`vite-env.d.ts` 제거 | `npm pack` 해제 크기 50% 이상 감소 |
| PKG-02d | 모든 `@deprecated` 제거와 마이그레이션 가이드, export snapshot 갱신 | 가이드 문서, snapshot 갱신 |

### PKG-03 계층 검사

목표 계층(위에서 아래로만 의존):

```
kernel      frame, stats, emitter, logger·reportError, Result, service key, 정의 registry, math   (도메인 import 0)
engine      EntityWorld·시스템·물리·트랜스폼, input, camera, animation, navigation, assets, audio, save, scene-object·prefab·scripting
rendering   RenderWorld, rendering, effects, next. 환경 정보는 port(EnvironmentState, SurfaceProvider)
world shell WorldContainer, 호스트(R3F, headless), createGaesupRuntime
kits        building, npc, weather, farming, crafting, economy, inventory·items, mail, quests, relations, town, dialog, catalog, events, tools, interactions, world 콘텐츠
editor      editor, project-settings, admin
```

| Slice | 내용 | 완료 기준 |
|---|---|---|
| PKG-03a | ESLint Layer 1 `patterns`(`react*`, `zustand*`, `@react-three/*`, `**/stores/**`, `**/hooks/**`, `**/components/**`), `consistent-type-imports` | Layer 1 위반을 넣으면 lint 실패 |
| PKG-03b | 도메인 SCC·도메인 간 edge baseline jest 테스트(감소만 허용), 도메인 내부 파일 직접 import 금지 lint | 새 edge 추가 시 실패 |
| PKG-03c | 계층 규칙 반전: React·zustand·R3F import는 `components/`, `hooks/`, `react/`, `stores/`에서만 허용하고 나머지 전부에 Layer 1 규칙. `stores/`는 zustand만 허용하고 React 금지. bridge 폴더의 React hook(`camera/bridge/useCameraBridge`)과 `boilerplate/hooks/useEntity`를 `hooks/`로 이동(re-export 유지) | Layer 1 검사 대상 비율 기록, 위반 0 |
| PKG-03d | 엔진 → 게임플레이 18곳을 port로(날씨 → 지면 → 편집 모드 순서, 편집 모드는 COR-06 `runtime.mode`), `BugSpot`·`FishSpot`·`Tree` 콘텐츠를 kit으로 | 엔진→kit edge 0 |

### PKG-04 코드 건강

| Slice | 내용 | 완료 기준 |
|---|---|---|
| PKG-04a | quality ratchet에 `asUnknownAs`, `nonNullAssertions`, `filesOver800` 추가, `no-console`(logger 제외) 켜고 26건 교체, knip baseline | 증가 시 CI 실패 |
| PKG-04b | 미사용 코드 삭제(내부), 공개 미사용 심볼은 `@deprecated`: `networkStateStore`, `networkConfigStore`, `useEditor`, `rollDailyStock`, `threeObjectPool`, `BuildingBridge`, 미사용 devDependency 4개, blueprints의 죽은 eslint 설정 | knip 보고 감소 |
| PKG-04c | `defineStoreDomainPlugin`으로 13개 `plugin.ts` 대체(DOM-09와 함께), 정의 registry 6개를 kernel `createDefinitionRegistry<T>()`로, pub/sub을 kernel emitter 하나로(`mitt` 제거), 수학·UI 헬퍼 통합 | registry 싱글턴 0, `mitt` 0, `cx` 정의 1 |
| PKG-04d | 대형 파일 분할: `NavigationSystem.ts`, `NPCNetworkManager.ts`(공통 transport). 나머지 대형 파일은 해당 항목에서 분할(buildingStore·npcStore는 DOM-01·DOM-03, brain 패널은 EDT-04, `PlayerNetworkManager`는 DOM-08) | 500줄 초과 모듈 10개 이하, 800줄 초과 0 |
| PKG-04e | 같은 이름 export 53개와 명칭 정리(NPC brain blueprint → behavior graph, `catalog` → collection, 달력 `events` → calendar). 내부 즉시, 공개는 2.0 | 중복 이름 수 감소 |
| PKG-04f | 루트 추적 파일(`info.tsx`, `todolist.md`, `index.ts`) 정리 | 사용자 확인 후 |

### PKG-05 CI·jest·컴파일러

| Slice | 내용 | 완료 기준 |
|---|---|---|
| PKG-05a | CI 트리거 브랜치 정리, pnpm store 캐시, jest shard 검토(VER-06과 함께) | PR CI 벽시계 ≤ 15분 |
| PKG-05b | jest 비용: `transformIgnorePatterns` 축소 또는 `@swc/jest`(측정 후 선택), 메모리 설정의 삭제 대상 정리와 heap 판정 | 전체 jest 병렬 ≤ 60초 |
| PKG-05c | ESLint `exhaustive-deps`(warn으로 시작해 파일 단위 error), 타입 인식 `no-floating-promises`, `globals.node`는 scripts·설정에만 | lint 통과 |
| PKG-05d | avatar·navigation 통합 테스트, 대상 자체를 mock하는 테스트를 실제 구현 테스트로 | mock 대상 목록 감소 |
| PKG-05e | 컴파일러 단일화(TS 7 생태계 준비 후) | `typescript` 별칭 제거 |

## 4. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 루트 editor 제거로 소비자 import 깨짐 | minor에서는 deprecate만, 2.0에서 제거와 codemod 안내 |
| `preserveModules`로 소비자 빌드 시간 증가 | `advancedChunks`와 비교 측정 후 선택 |
| lazy 등록으로 첫 사용 지연 | `createGaesupRuntime`에서 명시 등록 |
| 대형 컴포넌트 분할 중 UI 회귀 | 분할과 동작 변경을 같은 PR에 섞지 않음, 기존 probe 확인 |
