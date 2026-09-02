# HARNESS

에이전트 실행 기록. 각 라운드는 append-only 섹션으로 추가한다.

## api-sync 라운드 1 (2026-07-03)

공개 API(subpath 13개) ↔ examples ↔ docs 커버리지 스윕 1단계 실행. 갭 메우기는
문서만 진행(예제 코드는 제안만 작성, 미적용).

### 커버리지 요약 (subpath 단위)

| 엔트리 | 예제(examples/) 사용 | 문서(docs/) 반영 | 비고 |
|---|---|---|---|
| `gaesup-world` (index.ts) | 광범위 사용(World.tsx, runtime.ts 등) | API_GUIDE + 도메인별 API 문서 다수 | export 수백 개, 핵심 도메인은 기존 문서로 커버됨 |
| `gaesup-world/admin` | AdminTest.tsx, Navigation.tsx | API_GUIDE, GAESUP_WORLD_OVERVIEW | OK |
| `gaesup-world/assets` | packageSurface.ts(타입만) | EXPORT_AUTOMATION, API_GUIDE(subpath 목록) | 실사용 예제 없음(런타임 사용 갭) |
| `gaesup-world/blueprints` | player.tsx(WARRIOR_BLUEPRINT) | BLUEPRINT_API, BLUEPRINT_CONFIG | OK |
| `gaesup-world/blueprints/editor` | BlueprintEditorPage.tsx | BLUEPRINT_API, API_GUIDE | OK |
| `gaesup-world/building` | data.ts, scene.tsx, World.tsx | 신규: BUILDING_API 관련 경로/Navigation 섹션, API_GUIDE 목록 | 이전엔 subpath 자체가 문서에 없었음 → 이번에 추가 |
| `gaesup-world/editor` | NPCEditorPage.tsx, WorldEditorSurface.tsx, types.ts | API_GUIDE 목록에 신규 추가 | 전용 EDITOR_API 문서는 아직 없음(다음 라운드 후보) |
| `gaesup-world/gameplay` | runtime.ts(GameplayEventEngine, SEED_GAMEPLAY_EVENTS) | 신규: `docs/api/GAMEPLAY_API.md` 작성 | 이전엔 도메인 문서 전무 |
| `gaesup-world/navigation` | scene.tsx(NavigationSystem 등) | 신규: BUILDING_API에 Navigation 섹션 추가, API_GUIDE 목록 | 이전엔 도메인 문서 전무 |
| `gaesup-world/network` | NetworkMultiplayerPage.tsx | API_GUIDE, EXPORT_AUTOMATION | OK |
| `gaesup-world/plugins` | cozy-life-package 예제 | API_GUIDE | OK |
| `gaesup-world/postprocessing` | packageSurface.ts(타입만) | RENDERING_API(상세) | 문서는 있으나 examples 실사용 없음(갭) |
| `gaesup-world/runtime` | runtime.ts, cozy-life-package 테스트 | API_GUIDE | OK |
| `gaesup-world/server-contracts` | packageSurface.ts(타입만) | 신규: `docs/api/SERVER_CONTRACTS_API.md` 작성 | 이전엔 도메인 문서 전무, examples 실사용도 없음 |

### 이번에 추가/교정한 문서

- `docs/guide/API_GUIDE.md`: "주요 subpath" 목록에 `building`, `editor`, `navigation`, `gameplay`, `postprocessing`, `server-contracts` 6개 항목 추가, "함께 볼 문서"에 GAMEPLAY_API/SERVER_CONTRACTS_API 링크 추가.
- `docs/api/BUILDING_API.md`: "Navigation (obstacle 연동)" 섹션 신규 추가(`gaesup-world/navigation` 공개 API).
- `docs/api/GAMEPLAY_API.md`: 신규 파일. `GameplayEventEngine`, `GameplayEventRegistry`, 템플릿 헬퍼, 트리거 유니언 정리.
- `docs/api/SERVER_CONTRACTS_API.md`: 신규 파일. command/event 계약, CommandAuthorityRouter, ServerPluginHost, Snapshot/PlayerProgress, RBAC, Content Bundle 정리.

코드-문서 불일치는 발견되지 않음(`DuplicateSaveDomainBindingError` 등 API_GUIDE 기존 서술은 실제 export와 일치 확인).

### 예제 갭 제안(다음 라운드, 코드 미적용)

- `gaesup-world/assets`: `useAssetStore`, `AssetPreviewCanvas`, `SEED_ASSETS`, `HttpAssetSource` → `examples/pages/ShowcasePage.tsx`에 "에셋 카탈로그" 패널로 연결 제안(기존 캐릭터/의상 프리뷰 흐름과 자연스럽게 결합 가능).
- `gaesup-world/postprocessing`: `ColorGrade`, `LutOverlay`, `ToonOutlines`/`Outlined` → `examples/pages/World.tsx`의 `Canvas` 조립부에 토글 가능한 후처리 레이어로 연결 제안.
- `gaesup-world/server-contracts`: `createServerPluginHost`, snapshot/ops 함수들 → 클라이언트 examples 성격상 UI 연결 대상이 아님. `examples/plugins/`에 "server host sample" 스크립트(빌드 산출물 아님, node 실행용)로 별도 추가하는 것을 제안.
- `gaesup-world/gameplay`의 `GameplayEventRegistry`, `createDefaultGameplayEventRegistry`, `getGameplayEventRegistry`, 템플릿 생성 헬퍼들 → 현재 `runtime.ts`는 엔진만 사용하고 registry customization은 미사용. `examples/pages/WorldEditorSurface.tsx`의 `GameplayEventPanel` 쪽에서 커스텀 조건/액션 등록 예시로 연결 제안.
- `gaesup-world/navigation`의 `getNavigationObstacles`, `applyNPCNavigationRoute`, `createNPCNavigationRoute` → `examples/pages/world/player.tsx` 또는 NPC 이동 로직에 연결 제안(현재 NPC는 navigation route adapter를 쓰지 않음).

### 의도적 미반영(타입 전용/internal/deprecated)

- `src/index.ts`의 대량 `export type { ... }` 블록(Props/Options 타입) 전체 — 각 도메인 API 문서에 이미 표로 존재하거나(Camera/Building/Character 등) 컴포넌트 props로서 자명함. 별도 조치 불요.
- `docs/api/RENDERING_API.md`가 스스로 명시한 "내부 또는 미공개 경로"(`createGrassWindCompute`, `getWaterLODSegments`) — 공개 subpath가 아니므로 이번 스윕 대상에서 제외.

### [정리 후보]

- 이번 라운드에서 신규로 발견된 "공개되어 있으나 내부용으로 보이는" export는 없음. 다만 `gaesup-world/server-contracts`가 client-facing examples에서 전혀 쓰이지 않는 서버 전용 API(ops/RBAC, ServerPluginHost)를 포함하고 있어, 클라이언트 패키지 공개 표면에 계속 둘지(서버 도구용 별도 패키지로 분리할지)는 dev 판단이 필요 — 제거 후보는 아니지만 구조 재검토 후보로 보고.

### 검증

- 코드 미변경(문서만 수정) — tsc/lint 대상 아님.
- 문서에 새로 적은 모든 심볼(`GameplayEventEngine`, `GameplayEventRegistry`, `createDefaultGameplayEventRegistry`, `getGameplayEventRegistry`, `SEED_GAMEPLAY_EVENTS`, `createGameCommand`, `createServerEvent`, `createCommandAuthorityRouter`, `createServerPluginHost`, `createWorldSnapshotFromSaveSystem`, `createPlayerProgressFromSaveSystem`, `canMember`, `resolveRolePermissions`, `createContentBundleFromSaveSystem`, `NavigationSystem`, `registerNavigationObstacles`, `applyRegisteredNavigationObstacles`, `getNavigationObstacles`, `applyNPCNavigationRoute`, `createNPCNavigationRoute`)은 해당 `src/core/**/index.ts` 재수출 체인에서 grep으로 실존 확인함.

## dev 라운드 — 예제 갭 적용 (2026-07-04)

api-sync 라운드 1에서 제안된 예제 갭 5건을 examples에 적용(라이브러리 src/ 무변경, 공개 엔트리 import만 사용).

### 적용 내역

1. `gaesup-world/assets`: `examples/components/assets/AssetCatalogPanel.tsx` 신설(useAssetStore, AssetPreviewCanvas 사용, kind 필터 + 목록 + 프리뷰), `examples/pages/ShowcasePage.tsx`에서 WorldPage children으로 마운트. 접근 경로: Showcase 화면 좌측 "에셋 카탈로그" 패널.
2. `gaesup-world/postprocessing`: `examples/pages/World.tsx`에 ToonOutlines + ColorGrade(extraEffects) 조합을 토글 상태로 연결. 기본 off로 기존 시각 결과 유지. 접근 경로: 월드 HUD 우하단 "후처리 켜기/끄기" 버튼.
3. `gaesup-world/server-contracts`: `examples/plugins/server-host-sample/index.ts` 신설(createServerPluginHost + CommandAuthorityRouter route 등록 + createGameCommand ping/pong 로컬 데모), `examples/pages/runtime.ts`의 loadWorldRuntime에서 runWorldServerHostDemo() 실행 및 결과 getter 노출.
4. gameplay 레지스트리 커스터마이즈: `examples/pages/runtime.ts`에서 getGameplayEventRegistry()에 custom 조건/액션 핸들러 등록(docs/api/GAMEPLAY_API.md 서술과 일치), 커스텀 이벤트 예시 블루프린트를 시드에 추가. 접근 경로: 에디터 화면 "게임 이벤트" 패널(GameplayEventPanel)의 "커스텀 이벤트 예시" 실행.
5. navigation NPC route adapter: `examples/pages/world/player.tsx`에 NavigationRouteProbe 신설(applyNPCNavigationRoute + NavigationSystem으로 플레이어 위치→고정 목적지 경로 계산, 웨이포인트 마커 렌더), `examples/pages/World.tsx`에서 비에디터 모드에 마운트. 접근 경로: 기본 월드에서 N 키 토글.

### 검증

- `pnpm exec tsc -p tsconfig.build.json --noEmit`: 0 errors (각 건 적용 후 및 최종).
- `pnpm exec tsc --noEmit`(예제 포함): 0 errors.
- `pnpm lint`: 전체 3457건 실패는 전부 src/ 사전 존재(import/order, react/no-unknown-property 등) — 변경 파일 6개 개별 eslint 실행 결과 0건으로 무관 확인.
- `pnpm test -- examples/pages/__tests__ --runInBand`: 1 suite / 1 test 통과.

## next-core 라운드 1 — v2 신규 코어 스캐폴드 (2026-08-15)

`docs/plan/WEBGPU_FIRST_ROADMAP.md` v2(투트랙 전략) N0 단계 착수. 브랜치 `v2-next-core`. 목표: WebGPU-first data-oriented 신규 코어를 `gaesup-world/next` subpath로 스캐폴드하고 기존 v1 표면은 무변경 유지.

### 적용 내역

1. `src/next/` 신설 (v1 core 무의존, React/DOM/Three 무의존 순수 TS):
   - `core/World.ts`: 세대(generation) 기반 EntityId 할당기(NextWorld), 인덱스 재사용 + 세대 무효화, 자동 확장, MAX_ENTITY_CAPACITY 2^20.
   - `core/TransformStore.ts`: SoA TypedArray 저장(position/rotation quat/scale/originCell). 읽기는 out-인자 방식으로 호출당 할당 0. originCell은 floating origin 대비 데이터 모델에 선반영.
   - `core/TaskGraph.ts`: input→simulate→physics→render 페이즈 + 페이즈 내 deps 위상 정렬, 중복 id/순환/미지 의존/역방향 페이즈 의존 거부.
   - `core/RenderGraph.ts`: 패스 reads/writes 리소스 의존 컴파일(단일 writer 규칙, 순환/미기록 리소스 거부), 백엔드 무관 제네릭 컨텍스트.
   - `types.ts`: GeometrySource 유니언(mesh/splat/pointcloud/voxel/procedural) 타입 경계 선언.
2. subpath `gaesup-world/next` 6-파일 배선: package.json exports, vite.config.ts alias+entry, tsconfig.json paths, jest.config.js moduleNameMapper, scripts/copy-cjs-types.cjs. packageExports 가드 테스트는 package.json에서 자동 파생 대조하므로 별도 등록 불요 확인.
3. 테스트 `src/next/__tests__/` 3 suites 24 tests (한글 테스트명): 엔티티 수명주기/세대 재사용/자동 확장/트랜스폼 무할당 읽기, TaskGraph 페이즈·위상·에러 경로, RenderGraph 의존 순서·에러 경로.

### 미결/다음 라운드

- examples 배선 없음(스캐폴드 단계). N1 게이트(GPU 컬링 1만 인스턴스 데모)에서 examples 페이지와 함께 충족 예정 — AGENTS 원칙상 "기능"으로 부르려면 examples 도달 필요함을 인지하고 이연.
- N1: WebGPU 컨텍스트 + Three WebGPURenderer 백엔드를 RenderGraph 뒤에 연결, GPU 컬링 태스크 1종.

### 검증

- `pnpm test -- src/next src/__tests__/packageExports.test.ts --runInBand`: 4 suites / 32 tests 통과.
- `pnpm exec tsc -p tsconfig.build.json --noEmit`: 0 errors.
- `pnpm exec eslint src/next src/next.ts`: 0건.

## next-core 라운드 2 — N1 착수: 컬링 코어 + WebGPU 백엔드 (2026-08-15, 자율 루프)

1. `src/next/core/culling.ts`: Gribb-Hartmann 프러스텀 평면 추출(`extractFrustumPlanes`, 정규화 포함) + 구 컬링(`cullSpheres`, out 가시성 마스크, 호출당 할당 0). GPU compute 컬링의 CPU 레퍼런스이자 검증 기준.
2. `src/next/backend/threeWebGpuBackend.ts`: `isWebGpuAvailable` 능력 감지 + `createThreeWebGpuBackend`(three/webgpu 동적 import, 실패 시 null 폴백 — tsl/grass.ts 패턴).
3. examples 배선은 의도적 보류: examples/App.tsx 등에 사용자 미커밋 변경이 있어 파일 스테이징 시 WIP 혼입 위험. 사용자 복귀 후 또는 별도 확인 후 진행.

검증: `pnpm test -- src/next --runInBand` 4 suites/27 tests 통과, tsc 0 errors, eslint 0건.

## next-core 라운드 3 — N1 계속: 압축 + 인스턴스 패킹 (2026-08-15, 자율 루프)

1. `core/culling.ts`에 `compactVisible` 추가: 가시성 마스크를 가시 인덱스 목록(Uint32Array)으로 압축 — indirect draw 준비물의 CPU 레퍼런스.
2. `core/instancing.ts` 신설: `composeTrsMatrix`(쿼터니언 TRS를 열우선 4x4로 무할당 합성, three 호환 레이아웃) + `packInstanceMatrices`(가시 인덱스만 인스턴스 버퍼로 패킹).
3. 통합 테스트: 컬링-압축-패킹 파이프라인이 가시 엔티티만 행렬화함을 검증.

검증: 5 suites/33 tests 통과, tsc 0, eslint 0.

## next-core 라운드 4 — N1 데모 페이지 (2026-08-15, 자율 루프)

1. `examples/pages/NextCorePage.tsx` 신설: `gaesup-world/next` 공개 subpath import만 사용. 1만 인스턴스를 NextWorld(SoA)에 산포하고 매 프레임 컬링-압축-패킹 CPU 레퍼런스 파이프라인으로 InstancedMesh를 갱신. 오버레이에 visible/total, cull+pack ms, WebGPU 가용성 표시. 프레임 경로 버퍼는 전부 useMemo 사전 할당(프레임당 할당 0), 통계만 250ms 스로틀로 React state 반영.
2. `examples/App.tsx`에 `/next` 라우트 추가 — 단, 이 파일은 사용자 미커밋 변경과 섞여 있어 **커밋하지 않고 작업 트리에만 적용**. 사용자 확인 후 커밋 필요.
3. 검증: `pnpm exec tsc --noEmit`(examples 포함) 0 errors, eslint 신규 파일 0건, `vite build` 데모 번들 성공(47s).

N1 잔여: TSL compute 컬링(GPU 경로)과 실브라우저 확인. 데모 페이지가 생겼으므로 dev 서버에서 육안 검증 가능해짐.

## perf 라운드 1 — 클릭 이동 60→36fps 하락 수정 (2026-08-15)

증상: 클릭 이동 중 지속적 프레임 하락(사용자 보고 60→20, 프로브 재현 36fps/p50 27ms). 이등분 측정으로 원인 분리: PathLine(drei Line2가 Clicker 리렌더마다 지오메트리 재생성) 약 12fps, Clicker 기타 4fps, 시스템 잔여 8fps.

수정:
1. `Clicker/PathLine.tsx` 전면 재작성: Line2/LineGeometry/LineMaterial(three-stdlib)을 1회 생성 후 `pointsRef`를 100ms 스로틀 useFrame에서 명령형 갱신. React 재생성/셰이더 재컴파일 경로 제거(최악 프레임 115ms→35ms의 원인이던 재컴파일 스파이크 소멸).
2. `Clicker/index.tsx`: PathLine에 배열 대신 ref 전달, usePlayerPosition 50ms→150ms.

검증: 클릭 프로브 36.2→53.2fps(Clicker-off 상한 52.2 도달), jank>33ms 46→3회, tsc 0, eslint 0.

잔여(별도 과제): 이동 중 systemic 8fps — usePlayerPosition 16ms 간격 소비자들(OutfitAvatar, ToolUseController, InteractionTracker)의 forceUpdate 리렌더. frame-perf-auditor 규칙 5 위반 패턴으로, ref/스냅샷 구독으로 전환 필요.

## perf 라운드 2 — usePlayerPosition 비반응 모드 (2026-08-15)

이동 중 60Hz React 리렌더를 유발하던 usePlayerPosition 소비자 수술.

1. `usePlayerPosition`에 `reactive?: boolean`(기본 true) 옵션 추가 — false면 벡터를 in-place 갱신만 하고 forceUpdate를 호출하지 않음(결과 객체 identity는 원래 stable).
2. 값을 useFrame/이벤트 핸들러에서만 읽는 3개 소비자를 reactive: false로 전환: OutfitAvatar(16ms→무리렌더), ToolUseController(16ms→무리렌더), InteractionTracker(16ms→무리렌더).

검증: motions/interactions/character 28 suites 240 tests 통과, tsc 0, eslint 0. 클릭 프로브 p50 18.4→17.6ms(WASD 16.7과 근접), WASD 59.7fps 유지.

잔여 의심: 클릭 이동 중 automation/mouse 슬라이스가 프레임마다 identity 변경되어 Clicker 등 구독자를 리렌더시킬 가능성 — 다음 성능 라운드 조사 대상.

## next-core 라운드 5 — N1 게이트: GPU compute 컬링 10만 인스턴스 (2026-08-15)

1. `src/next/backend/gpuCulledInstances.ts` 신설: three/tsl compute 커널(프러스텀 6평면 unroll, uniformArray 평면 + storage 가시성 버퍼)이 GPU에서 인스턴스별 가시성 계산, MeshNormalNodeMaterial의 positionNode에 가시성 곱(scale-to-zero) — CPU 리드백 없는 GPU-상주 컬링. WebGPU 미가용/실패 시 null 폴백.
2. 함정 해결: `/* @vite-ignore */` + 변수 specifier는 vite가 재작성하지 않아 브라우저 네이티브 bare import가 실패(조용히 null) — 리터럴 `import('three/webgpu')`로 교체. 라이브러리 빌드에서는 /^three\// external이라 동적 import로 보존됨.
3. `/next?gpu` 데모: r3f 우회, WebGPURenderer + 자체 애니메이션 루프로 10만 인스턴스. cpu 10k / gpu 100k 전환 링크.

검증(실브라우저, RTX 5060 Ti): 10만 인스턴스 렌더 확인(스크린샷), 컬링 디스패치 0.10ms, 헤드리스 무vsync 루프 290fps(실환경 60 고정 + 헤드룸), 콘솔 에러 0. tsc(examples 포함) 0, eslint 0.

한계 명시: scale-to-zero 방식이라 드로우는 여전히 10만 인스턴스 제출(정점 단계 퇴화) — indirect draw + GPU compaction은 N6 후보.

## Epoch 2a — bridge snapshot isolation (2026-09-01)

Bridge snapshot TTL cache가 entity와 runtime instance 사이에서 충돌하던 correctness 문제를 수정했다.

### 변경

1. `src/core/boilerplate/decorators/bridge.ts`: cache를 decorated method별·bridge instance별로 격리하고 engine object identity를 사용하도록 변경했다. public `snapshot(id)`는 현재 `getEngine(id)` identity를 해석한다.
2. missing bridge ID는 cache하지 않고, generic primitive cache는 amortized expiry pruning과 빈 Map early return을 사용한다.
3. `src/core/boilerplate/decorators/__tests__/bridge.test.ts`: multi-entity, multi-instance, 동일 ID engine 교체, TTL 경계, primitive key/pruning, decorator 재사용, 실제 AbstractBridge 이중 cache와 snapshot event 호환성 8개 regression을 추가했다.

### Source of truth와 compatibility

- 각 engine state가 계속 canonical source of truth다. Cache는 동일 bridge instance와 현재 engine identity에 한정된 read optimization이다.
- `CacheSnapshot(ttl)` signature, bridge public API, snapshot shape, Animation/UI의 TTL 내 snapshot event 억제를 유지했다.
- WorldDocument, frame schedule, renderer, network protocol, examples는 변경하지 않았다.

### 검증

- `corepack pnpm test -- src/core/boilerplate src/core/animation/bridge src/core/networks/bridge --runInBand`: 21 suites / 399 tests 통과.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`: 통과.
- 변경 source ESLint와 신규 test `--no-ignore` ESLint: 통과.
- `corepack pnpm test -- --runInBand`: 183 suites 통과, 1 skipped; 1,691 tests 통과, 1 skipped.
- `git diff --check`: 통과.
- invariant 및 frame/performance 독립 감사: 확정 blocker 없음.
- `corepack pnpm test:memory`: 기존 Jest CLI 옵션(`--testPathPattern`) 때문에 실행 전 실패. 수정된 `--testPathPatterns=memory`로 확인했으나 해당 suite가 없어 `No tests found`였다.

### 다음 slice

React hook-order 위반 21건과 이를 누락시키는 ESLint `react-hooks/rules-of-hooks` gate를 함께 수정한다. `test:memory` script 복구는 quality-gate slice에서 다룬다.

## Epoch 2b — React hook-order correctness (2026-09-01)

상태 전환과 가변 batch 길이에 따라 hook graph가 달라지던 production 경로를 제거하고 기본 ESLint에 rules-of-hooks gate를 추가했다.

### 변경

1. `RemotePlayer`, `TileObject`: eligibility를 판단하는 outer component와 hook을 소유하는 inner component로 분리했다.
2. `PlayerInfoOverlay`, `EntityController`: hook 호출을 모든 early return보다 앞에 고정했다.
3. `useBatchManagedEntities`: 가변 `map(useManagedEntity)`를 ID Map reconciliation, transactional creation rollback, 전 record cleanup, publication 이후 registration callback activation, 단일 allocation-free `useFrame`, record별 throttle로 교체했다.
4. 중복 ID는 first-wins와 단일 lifecycle로 결정하고 add/remove/reorder, engine/dependency/callback 교체, inline callback, throttle, partial failure, cleanup failure regression을 추가했다.
5. `eslint.config.js`: `eslint-plugin-react-hooks`를 등록하고 `react-hooks/rules-of-hooks: error`를 활성화했다.

### Source of truth와 compatibility

- React mount가 component/resource lifecycle의 source of truth이고 batch ID Map이 entity ownership의 canonical path다.
- public props, hook signature, exports, routes, renderer/network/save contract는 유지했다.
- callback 교체는 외부 registration만 갱신하고 bridge 자체의 unregister/register event를 재발행하지 않는다. production batch call site는 없다.

### 검증

- 변경 파일과 신규 test ESLint: 통과.
- production rules-of-hooks scan: 0 errors. 전체 lint에는 기존 non-hook source 오류 16건이 남아 있다.
- 관련 domain Jest: 10 suites / 131 tests 통과.
- build TypeScript와 examples TypeScript: 통과.
- 전체 Jest: 188 suites 통과, 1 skipped; 1,704 tests 통과, 1 skipped.
- `git diff --check`: 통과.
- invariant 및 runtime/frame 독립 감사: blocker 없음.

### 실패·미실행과 다음 slice

- 실제 R3F Canvas/Rapier integration은 mock 기반 unit test만 실행했고 브라우저 통합 계측은 미실행했다.
- React 19 `react-test-renderer` deprecation, 기존 bridge/engine detach-vs-dispose ownership, DI bridge와 인자 bridge 이중 소유 가능성을 후속 부채로 기록했다.
- 다음 slice는 기존 ESLint 16 errors, boundary/package gate와 `test:memory` script를 정리하는 quality-gate epoch다.

## Epoch 2c — executable quality gates (2026-09-01)

실행 전 실패하거나 false-green이던 repository lint, architecture, examples boundary, memory와 package-consumer gate를 실제 배포 계약에 맞게 복구했다.

### 변경

1. `.tmp/**`를 generated output으로 제외하고 tracked package-consumer 생성물 13개를 제거했다. authored lint 16건을 정리하고 root lint를 0 errors / 0 warnings로 만들었다.
2. 오분류되던 ESLint boundary rule을 TypeScript AST/resolution test로 교체했다. 현재 29 local upward edge와 Layer 1 Rapier import 9개를 exact baseline으로 잠그고 Layer 1 direct React/Zustand/R3F 신규 import는 0 baseline으로 차단한다.
3. examples의 static/type/export/dynamic/require import를 검사해 private tsconfig alias, Vite-only alias와 resolved `src/` 접근을 거부한다.
4. Jest 30에서 깨진 memory script를 실제 bridge/cache/entity lifecycle 5 suites로 연결했다.
5. Node engine, required peers, direct dependencies와 lockfile을 built graph에 맞췄다. package/demo verifier는 OS temp와 finally cleanup을 사용하고, declaration finalizer는 848-file ESM/CJS graph 대칭·target·idempotence를 검사한다. fresh consumer는 NodeNext ESM/CJS, exact-optional false/true owned declarations, GLTF Bundler compatibility, runtime import와 Vite bundle을 검증한다.
6. strict declaration 감사에서 드러난 scene JSON 경계를 교정했다. `SceneJsonObject` strict read 계약과 `SceneJsonAuthoringObject` 입력 계약을 분리하고 component data를 owned plain copy로 만든다. persisted parser는 stable object/component ID, wrapper와 exact transform tuple을 검증하며 load/save는 owned document를 재물질화한다.

### Source of truth와 compatibility

- lint source of truth는 authored repository source/config이고 `.tmp`, `dist`, `demo-dist`, coverage는 generated output이다.
- architecture debt는 TypeScript가 resolve한 exact edge baseline, examples boundary는 `package.json.exports`, package requirement는 built ESM/CJS import graph다.
- scene JSON은 factory 이전 authoring data와 factory/parse/load/save 이후 canonical owned data를 구분한다.
- public symbol, package exports, render behavior, `SceneVector3` tuple과 반환 component data의 mutable 타입은 유지했다.
- 의도적 migration으로 raw standard authoring interface는 strict `SceneJsonObject`에 직접 assign되지 않으며 factory를 거쳐야 한다. component/document identity alias는 보존하지 않고 `loadSceneRuntime`도 owned document를 사용한다. `serializeSceneDocument`는 모든 validation issue에 `TypeError`를 던진다. README, world-model context와 consumer probe에 이를 기록했다.

### 검증

- root lint, build/root TypeScript, relevant Prettier, script syntax, frozen lockfile 및 `git diff --check`: 통과.
- boundary/examples/public/package/scene-object focused: 6 suites / 85 tests 통과.
- memory 기본/CI: 각각 5 suites / 86 tests 통과, CI heap 80–137 MB.
- 전체 Jest: 189 suites / 1,743 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각 915 modules, npm 95 packages, strict declarations, ESM/CJS runtime, 648-module consumer bundle 통과.
- demo: OS temp 1,615-module build와 lazy package surface contract 통과.
- `publint`: all good.
- 독립 invariant/API 및 package metadata 감사: blocker 없음.

### 잔여 debt와 다음 slice

- architecture legacy baseline 29+9는 이번 slice에서 이동하지 않았다.
- 외부 peer declaration 자체의 NodeNext strict diagnostic은 package-owned declaration gate와 분리했다.
- peer range 하한 설치 matrix, `test:memory:verbose`, Playwright `test:browser`는 실행하지 않았다.
- React 19 test renderer deprecation, duplicate Three instance와 legacy BridgeRegistry warning은 기존 non-failing debt다.
- 다음 slice는 simulation/physics/resource lifetime 중 하나의 domain boundary를 선택해 29+9 baseline을 실제로 줄인다.

## Epoch 2d — Navigation WASM lifetime (2026-09-01)

동일 singleton을 여러 consumer가 초기화할 때 발생하던 WASM buffer 누수와 dispose 이후 stale initialization 부활을 차단했다.

### 변경

1. `NavigationSystem`이 instance별 in-flight initialization Promise를 공유해 loader와 grid/path allocation을 한 번만 수행한다.
2. lifecycle generation으로 stale continuation을 무효화하고, pending pointer는 grid sync까지 성공한 뒤에만 instance ownership으로 commit한다.
3. loader/partial allocation 실패는 소유한 buffer를 회수하고 Promise slot을 정리해 retry할 수 있다.
4. dispose는 pointer와 WASM 참조를 먼저 초기화한 뒤 각 allocation을 최대 한 번 해제하고, 오래된 instance가 replacement singleton을 분리하지 못하게 한다.
5. concurrency, repeated dispose, stale/replacement initialization, loader failure와 partial allocation retry regression 7개를 추가했다.

### Source of truth와 compatibility

- 각 `NavigationSystem` generation이 initialization task와 WASM buffer pair의 단일 소유자다.
- `getInstance()`, `init(): Promise<boolean>`, grid/path API와 WASM ABI는 유지했다. dispose로 취소된 stale init만 `false`를 반환한다.
- navigation 알고리즘, persistent world state, renderer, physics와 examples는 변경하지 않았다.

### 검증

- source ESLint와 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- navigation/building integration: 3 suites / 35 tests 통과.
- build/root TypeScript: 통과.
- `git diff --check`: 통과.
- 독립 lifecycle 재검토: blocker, major, minor 없음.

### 실패·미실행과 다음 slice

- 최초 ignored-test lint warning과 persistent Jest mock 누출 실패는 명령/test 격리 수정 후 재검증했다.
- legacy full-file formatting debt 때문에 Prettier check는 실패했으며 unrelated 전체 재format은 포함하지 않았다.
- public/package/examples surface가 변하지 않아 전체 Jest, package/demo gate는 미실행했다.
- 다음 slice는 공유 `PhysicsBridge`의 고정 `global-physics` ID를 entity별 ownership으로 교체한다.

## Epoch 2e — PhysicsBridge entity ownership (2026-09-01)

공유 `PhysicsBridge`의 모든 hook이 고정 `global-physics` engine을 덮어쓰고 서로의 system을 dispose하던 ownership 결함을 entity별 key로 교정했다.

### 변경

1. public `UsePhysicsBridgeOptions`에 optional `entityId`를 추가하고 `useEntity`의 mount-stable ID를 motion/physics 경로에 함께 전달한다.
2. 직접 hook 소비자는 `useId()`와 module-local mount nonce를 결합해 동일 tree, StrictMode와 다중 React root에서 고유한 fallback ID를 가진다.
3. registration은 exact `{ bridge, entityId }` record가 소유하며 cleanup은 effect가 캡처한 pair만 unregister한다.
4. config command와 frame update도 current registration pair를 사용해 runtime swap, enabled 전환과 unmount에서 다른 engine을 건드리지 않는다.
5. actual shared PhysicsBridge lifecycle, fallback/StrictMode, runtime transition, old/new bridge routing, useEntity wiring과 fixed-ID 제거 regression을 추가했다.
6. fresh package consumer가 `UsePhysicsBridgeOptions.entityId` public declaration을 직접 컴파일한다.

### Source of truth와 compatibility

- `useEntity`의 stable ID가 한 entity의 MotionBridge/PhysicsBridge canonical ownership key다. 직접 hook은 hook instance key가 source of truth다.
- 기존 hook 호출과 `PhysicsEntity` props는 유지되며 `entityId`는 additive optional contract다.
- bridge command/snapshot, physics algorithm, Rapier identity, network/save/examples contract는 변경하지 않았다.

### 검증

- source/script 및 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- focused: 3 suites / 14 tests, motions+boilerplate hooks: 20 suites / 239 tests 통과.
- public/package exports: 2 suites / 22 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- fresh package: ESM/CJS 각 915 modules, npm 95 packages, declaration/runtime와 648-module consumer bundle 통과.
- 독립 lifecycle/API 재검토: blocker, major, minor 없음.

### 실패·미실행과 다음 slice

- test import-order, non-replaying StrictMode wrapper와 일시적인 incomplete npm pack은 각각 수정/공식 option/clean full retry로 재검증했다.
- duplicate Three와 Vite large-chunk warning은 기존 non-failing debt다.
- 전체 Jest와 demo gate는 미실행했다.
- 다음 slice는 `MotionSystem` 인스턴스 간 mutable THREE state 공유와 `AbstractSystem.reset()` seed 보존을 수정한다.

## Epoch 2f — Motion state isolation (2026-09-02)

공유 module-level Three.js 기본값과 current-state reset 때문에 여러 `MotionSystem`이 서로의 위치·속도·회전·metrics를 오염하던 결함을 instance-owned seed 경계로 교정했다.

### 변경

1. `AbstractSystem`에 additive initializer function 경로를 추가하되 기존 object reset의 current-state 의미는 보존했다.
2. initializer reset은 state/metrics 둘을 모두 먼저 materialize한 뒤 assign해 partial reset을 방지한다.
3. `MotionSystem`은 constructor 시점 seed를 owned closure로 캡처하고 construct/reset마다 fresh `Vector3`/`Euler`를 만든다.
4. Three brand, numeric component와 Euler order를 검사한 뒤 로컬 constructor로 복사해 mixed ESM/CJS와 duplicate Three seed도 보존한다.
5. instance/dispose/caller seed 격리, configured reset, atomic base reset과 foreign prototype regression을 추가했다.
6. public MotionBridge reset 경로에서 rigid body zero+wake, system 값 초기화와 cached snapshot/nested/config/subscriber identity 보존을 고정했다.

### Source of truth와 compatibility

- initializer를 선택한 system에서는 constructor-captured initializer가 runtime state/metrics ownership과 reset seed의 source of truth다.
- legacy object initializer를 쓰는 나머지 system은 기존 current-state reset 경로에 남아 nested resource identity가 바뀌지 않는다.
- Motion engine state는 reset 때 fresh identity를 얻지만 consumer-visible MotionBridge snapshot cache의 top-level/nested/config identity는 유지된다.
- public constructor/options/state/metrics, bridge command/snapshot, renderer/network/save/examples contract는 바뀌지 않았다.

### 검증

- 변경 source/test ESLint: 0 errors / 0 warnings.
- focused: 3 suites / 25 tests, motions+boilerplate: 36 suites / 503 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 193 suites / 1,764 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각 915 modules, npm 95 packages, runtime smoke와 648-module Vite consumer bundle 통과.
- 독립 재검토: blocker, major, minor 없음.

### 실패·미실행과 다음 slice

- 최초 reviewer가 mixed ESM/CJS `instanceof` minor를 재현했고 brand/structure + local copy와 foreign-prototype test로 수정한 뒤 재검증했다.
- duplicate Three, React test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 physics config의 store/bridge/system source of truth와 stale child propagation을 교정한다.

## Epoch 2g — Physics config source of truth (2026-09-02)

physics 설정 타입과 live mutation 경로를 motions core 중심으로 통합하고, runtime config 변경과 reset이 parent 및 모든 child 계산에 같은 값으로 반영되도록 교정했다.

### 변경

1. canonical `PhysicsConfigType`을 motions Layer 1 `core/config.ts`로 이동하고 store의 기존 타입 경로는 compatibility re-export로 유지했다.
2. `PhysicsSystem`은 caller와 분리한 하나의 stable config를 소유하고 Vector3를 복사하며 Direction, Impulse, Gravity child에 동일 객체를 전달한다. config command는 이 객체를 in-place patch한다.
3. `usePhysicsBridge` registration은 render-latest store config를 seed로 사용하고 기존 full update command를 유지해 runtime swap과 disable/re-enable의 stale seed를 제거했다.
4. main/dormant physics store와 reset은 매번 fresh top-level config와 Vector3를 만들고, 기본값 없는 optional key는 explicit `undefined` reset sentinel로 materialize한다.
5. 실제 bridge frame에서 최신 walk speed, gravity scale, damping을 함께 검증하고 caller/vector ownership, hook transition, store reset, shared config clearing 회귀 테스트를 추가했다.
6. physics config 관련 upward edge 9개를 제거해 exact architecture baseline을 29에서 20으로 줄였고 ESM/CJS root type consumer probe를 고정했다.

### Source of truth와 compatibility

- schema source of truth는 motions Layer 1 `core/config.ts`, entity별 live runtime value는 `PhysicsSystem`의 stable owned object, write path는 bridge `updateConfig` command다.
- Zustand physics slice는 application desired projection이며 hook이 최신 전체 값을 register와 command로 전달한다. reset sentinel은 partial command 호환성을 유지하면서 omitted key도 제거한다.
- 기존 type 이름, store compatibility 경로, bridge/system/hook signature, public runtime behavior와 renderer/network/save/examples contract를 유지했다.

### 검증

- 변경 source/script 및 test ESLint(`--no-ignore` 포함): 0 errors / 0 warnings.
- focused: 7 suites / 77 tests, reviewer 수정 후 reset focused 5 suites / 55 tests 통과.
- motions+stores domain: 16 suites / 132 tests 통과.
- public API/package exports: 2 suites / 22 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 194 suites / 1,769 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations, ESM/CJS runtime smoke와 648-module Vite consumer bundle 통과.
- 독립 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- 최초 리뷰에서 발견한 CJS named type probe 공백과 live reset omitted-key 문제는 수정 후 재검증했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 첫 frame 이후 stale할 수 있는 `PhysicsState.modeType`과 `automationOption` lifecycle이다.

## Epoch 2h — Live physics mode projection (2026-09-02)

동일 entity와 physics engine identity를 유지하면서 Zustand의 최신 mode/automation을 매 frame 단일 snapshot으로 projection하고, character·vehicle·airplane 전환의 transient와 rigid-body 설정을 원자적으로 정규화했다.

### 변경

1. `usePhysicsBridge`는 실행 frame마다 store snapshot을 정확히 한 번 읽어 initial/retained `PhysicsState.modeType`, `automationOption`과 `calcProp.worldContext`에 같은 객체를 전달한다.
2. projection은 기존 registration, engine, `PhysicsState`와 calc-props identity를 유지해 mode 변경 때 bootstrap이나 위치 보정을 반복하지 않는다.
3. `PhysicsSystem`은 실제 mode transition에서 direction/dir, pitch/roll과 jump latch를 정리하고 logical yaw를 character inner group과 vehicle/airplane rigid body 사이에서 이전한다.
4. mode별 gravity, damping과 rotation-axis ownership을 공통 helper로 통합했다. focus 중 전환도 movement/impulse/force 계산 없이 destination persistent body 설정을 같은 frame에 적용한다.
5. vehicle 계산이 `GravityComponent`를 사용하도록 연결해 airplane→vehicle 전환의 stale gravity를 제거했다.
6. hook projection, retained identity, character→vehicle→airplane→character, focused 전환, yaw ownership, gravity/transient와 direct bridge authority 회귀 테스트를 추가했다.

### Source of truth와 compatibility

- application desired mode/automation은 Zustand, hook-owned frame projection은 frame 시작의 단일 store snapshot이 source of truth다.
- 직접 `PhysicsBridge.updateEntity()` 경로에서는 caller가 전달한 `PhysicsState.modeType`이 계속 source of truth이며 system은 전역 store를 읽지 않는다.
- persistent body 설정은 `applyModeRigidBodySettings`, transition transient와 yaw ownership은 entity의 `PhysicsSystem` instance가 소유한다.
- public 타입/options/commands/snapshots/exports shape와 position, velocity, logical heading, engine/state identity를 유지했다.

### 검증

- 변경 source 및 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- 최종 focused: 3 suites / 36 tests, motions 전체: 16 suites / 120 tests, broader domain: 23 suites / 249 tests 통과.
- architecture/public/package focused: 7 suites / 65 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 195 suites / 1,772 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, declaration/runtime smoke와 648-module Vite consumer bundle 통과.
- 독립 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- 최초 reviewer의 focus-transition persistent 설정 major를 공통 설정 helper와 focused airplane→vehicle/character 테스트로 수정한 뒤 재검토했다.
- damping 값만으로 fresh 호출을 구분하지 못하는 비차단 테스트 정밀도 공백이 남지만 gravity/rotation/impulse/identity assertion과 실제 호출 경로로 보완된다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 `AutomationSystem`의 delay ownership, cancellation, stale continuation과 fresh reset lifecycle이다.

## Epoch 2i — Automation execution lifetime (2026-09-02)

소유되지 않은 wait와 분리된 post/retry timer 때문에 pause·stop·reset·dispose 뒤 되살아나던 automation continuation을 system-owned delay, execution generation과 run-aware lifecycle 경계로 교정했다.

### 변경

1. wait, post-action과 retry delay를 ambient timer 기반의 단일 owned handle/cancellation settler로 통합해 lifecycle 취소 시 timer를 제거하고 pending Promise를 반드시 settle한다.
2. lifetime-monotonic execution generation과 async/callback/event 뒤 guard로 stale stats/index/event/retry/next-schedule mutation을 차단한다.
3. start/pause/resume/stop을 idempotent하게 만들고 synchronous first action/request와 기존 delay/retry/loop 의미를 유지한다.
4. execution run identity와 active stopped-dispatch ownership을 분리해 같은 run의 reset/dispose 중첩 stopped는 억제하고 reentrant 새 run의 stopped/completed 순서는 허용한다.
5. factory state/metrics, deep-owned config와 reset 후 silent normalization으로 listener mutation까지 fresh defaults로 복원하되 top-level reset identity와 stopped→queueCleared event를 유지한다.
6. observer 예외를 listener별 project logger에 격리하고 detached rejection을 소비해 모든 listener와 dispose commit이 완료되도록 했다.
7. wait/post/retry cancellation, duplicate lifecycle, stop→restart, reset/dispose observer 재진입, run별 event order, retry exhaustion, loop와 ownership을 deterministic fake-timer tests로 고정했다.

### Source of truth와 compatibility

- queue/state는 system-local execution source of truth, execution generation은 async mutation 권한, run identity는 stopped-event ownership의 source다.
- owned handle/settler가 delay resource의 유일한 owner이며 lifecycle invalidation이 canonical cancellation path다.
- constructor/reset factory가 state/metrics/config 기본값을 소유한다.
- public methods/types/event payload, synchronous first request, fallback delay, retry/maxRetries, loop, stop queue/index와 stopped-before-completed 계약을 유지했다.
- idle/duplicate lifecycle no-op, observer-local error 격리와 failed after-callback의 success-stat 제외는 의도적인 안전성 교정이다.

### 검증

- 변경 source 및 test `--no-ignore` ESLint: 0 errors / 0 warnings.
- root focused: 6 suites / 102 tests, interactions 전체: 8 suites / 110 tests, lifetime 전용: 24 tests 통과.
- build/root TypeScript와 `git diff --check`: 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, declaration/runtime smoke와 648-module Vite consumer bundle 통과.
- 독립 최종 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- exact architecture edge kind 회귀는 기존 value-import compatibility를 복원해 수정했다.
- 리뷰에서 재현한 reset auto-start, same-run stopped 중복과 cross-run stopped 과잉 억제 세 major를 generation/run-aware 테스트와 함께 수정했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 중복 core/bridge automation type schema와 Layer 1 upward edge를 canonical core types로 정리한다.

## Epoch 2j — Automation type boundary (2026-09-02)

중복된 automation schema를 Layer 1 core의 단일 원선언으로 통합하고 `AutomationSystem`의 bridge 타입 의존을 제거했다.

### 변경

1. `AutomationAction`, `AutomationSettings`, `AutomationState`, `AutomationConfig`, `AutomationMetrics`의 canonical interface를 `core/types.ts`에 한 번만 정의했다.
2. action data는 기존 public value union을 유지해 object/string/number/boolean/null/undefined를 허용하고 bigint/symbol은 거부한다.
3. bridge의 중복 interface를 제거하고 같은 original symbol을 import/direct type re-export해 기존 bridge/root 경로와 declaration identity를 유지했다.
4. `AutomationSystem`은 local core types만 type-import하며 runtime JS와 lifecycle observable behavior는 바꾸지 않았다.
5. core barrel은 다섯 automation 타입만 명시적으로 노출하고 architecture exact baseline을 20에서 19로 줄였다.
6. ESM/CJS package probe가 다섯 full shape, optionality, discriminant, callback, 허용/거부 payload를 실제 consumer 값과 양방향 assignability로 고정한다.

### Source of truth와 compatibility

- schema source of truth는 `src/core/interactions/core/types.ts`, bridge는 같은 symbol을 재노출하는 compatibility projection이다.
- 기존 이름, 필드, optionality, interface declaration kind와 root/bridge import 경로를 유지했다.
- `BaseState.lastUpdate`와 `BaseMetrics.frameTime`은 system-local intersection이며 public automation state/metrics에 포함하지 않았다.
- root export-star 직접 module augmentation은 원선언과 병합되지 않아 지원 계약으로 간주하지 않는다.

### 검증

- 변경 source/test/script ESLint, `node --check`, build/root TypeScript와 `git diff --check`: 통과.
- focused: 6 suites / 102 tests, interactions: 8 suites / 110 tests 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations, runtime smoke와 648-module Vite consumer bundle 통과.
- mutation 감사: baseline 0 errors, action data 삭제 1 error, string-only 축소 7 errors.
- 독립 최종 검토: blocker 0 / major 0. 2j 문서 minor는 수정했다.

### 실패·경고·미실행과 다음 slice

- 최초 root augmentation 가정과 negative-only probe false positive를 reviewer가 재현했다. 비지원 augmentation 주장을 제거하고 ESM/CJS exact/positive probe로 교체한 뒤 clean package를 재검증했다.
- package verifier의 초기 parse 이전 temp-dir 생성은 기존 2c cleanup minor이며 후속 quality slice로 분리했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22, 비-Windows와 renderer/examples 변경이 없어 demo gate는 미실행했다.
- 다음 slice는 raw input quartet을 canonical core interface로 이동해 architecture baseline을 19에서 17로 줄인다.

## Epoch 2k — Raw input type boundary (2026-09-02)

Keyboard·Mouse·Gamepad·Touch schema를 Layer 1 core의 단일 원선언으로 통합하고 raw input 타입의 bridge upward edge를 제거했다.

### 변경

1. raw input quartet을 core canonical interface로 전환하고 `MouseState.isLookAround?: boolean` 누락을 public 계약 그대로 흡수했다.
2. bridge의 quartet 중복 정의를 제거하고 같은 original symbol을 import/direct type re-export했다.
3. adapter는 quartet을 local core types에서 가져오고 `InteractionSystem`은 raw quartet과 아직 bridge 소유인 aggregate schema import를 분리했다.
4. Keyboard/Mouse의 `InteractionSystem` compatibility export와 core barrel도 canonical symbol을 재노출한다.
5. architecture의 raw import/export edge 세 건을 제거하고 aggregate type-only edge 한 건만 남겨 exact baseline을 19에서 17로 줄였다.
6. package probe가 ESM/CJS full shape, Three vector fields, Mouse omission/boolean과 exact optional true/false의 explicit undefined 기대를 실제 consumer 컴파일로 고정한다.

### Source of truth와 compatibility

- raw input schema source는 `src/core/interactions/core/types.ts`, bridge는 동일 declaration identity의 compatibility projection이다.
- 기존 이름, nested shape, interface declaration kind와 root/bridge/InteractionSystem import 경로를 유지했다.
- aggregate interaction schema는 다음 slice까지 bridge public compatibility source로 남는다.
- compiled runtime JS와 input update/backend/resource lifetime 동작은 바뀌지 않았다.

### 검증

- 변경 source/test/script ESLint, `node --check`, build/root TypeScript와 `git diff --check`: 통과.
- focused: 7 suites / 76 tests, interactions: 8 suites / 110 tests 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package source build: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations 통과.
- exact optional true/false ESM/CJS consumer, runtime smoke와 648-module Vite bundle 통과.
- 독립 최종 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- reviewer가 exact=false consumer가 실제로는 실행되지 않는 minor를 찾았고 별도 ESM/CJS false fixture로 수정 후 재검증했다.
- 마지막 clean package run은 bundle 완료 뒤 Windows Node 24 libuv assertion으로 한 차례 종료됐지만 같은 fresh dist consumer 재실행과 앞선 clean run은 통과했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22, 비-Windows와 renderer/examples 변경이 없어 demo gate는 미실행했다.
- 다음 slice는 aggregate interaction schema를 core로 이동해 architecture baseline을 17에서 16으로 줄인다.

## Epoch 2l — Aggregate interaction type boundary (2026-09-02)

중복된 aggregate interaction schema를 Layer 1 core의 단일 원선언으로 통합하고 interactions domain의 마지막 bridge upward edge를 제거했다.

### 변경

1. `InteractionState`, `InteractionConfig`, `InteractionMetrics`를 `core/types.ts`의 canonical interface로 정의했다.
2. public compatibility를 위해 State의 required `lastUpdate`, Metrics의 required `lastUpdate`와 `frameTime`을 유지했다.
3. bridge의 중복 interface를 제거하고 같은 original symbol을 import/direct type re-export해 bridge/root declaration identity를 보존했다.
4. `InteractionSystem`은 raw input quartet과 aggregate schema를 모두 local core types에서 가져온다.
5. architecture의 마지막 interactions bridge type edge를 제거하고 exact baseline을 17에서 16으로 낮췄다.
6. ESM/CJS package probe가 세 schema의 full nested shape, requiredness, positive values와 양방향 exact assignability를 고정한다.

### Source of truth와 compatibility

- aggregate interaction schema source는 `src/core/interactions/core/types.ts`, bridge는 동일 declaration identity의 compatibility projection이다.
- 기존 이름, nested fields, requiredness, interface declaration kind와 root/bridge import 경로를 유지했다.
- schema source만 통합했으며 System, input backend, bridge snapshot과 Zustand store의 runtime state ownership은 바꾸지 않았다.
- constructor/reset/update/timestamp/snapshot runtime body와 dormant `metrics.lastUpdate` 의미는 그대로다.

### 검증

- 변경 source/test/script ESLint, generated probe `node --check`, build/root TypeScript와 `git diff --check`: 통과.
- focused: 7 suites / 74 tests, interactions: 8 suites / 110 tests 통과.
- 전체 Jest: 196 suites / 1,796 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations와 runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22, 비-Windows와 renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 `InteractionSystem` reset이 mutated raw input, metrics와 config를 그대로 보존하는 lifecycle 결함을 local default creators와 reset normalization으로 교정한다.

## Epoch 2m — Interaction reset lifecycle (2026-09-02)

`InteractionSystem.reset()`이 stale raw input, metrics와 config를 보존하던 결함을 교정하고 retained input identity, observer fanout과 external backend authority를 명시적인 lifecycle 계약으로 고정했다.

### 변경

1. local state, metrics와 config default creators를 reset defaults의 canonical source로 만들었다.
2. legacy state/metrics top-level 교체를 유지하면서 raw quartet와 `activeInputs` identity를 보존한다.
3. raw object를 fresh prototype과 own descriptor로 재구성해 nested caller alias, hidden string/symbol own property와 inherited prototype pollution을 제거한다.
4. non-configurable/non-extensible raw state와 clear 불가능한 scratch는 base reset 전에 검출해 partial mutation 없는 atomic no-op으로 처리한다.
5. state→metrics→config 복원 완료 후 internal reset event를 정확히 한 번 발행하고 reset 재진입과 listener mutation/throw를 격리한다.
6. system/default backend는 generation-gated fanout, idempotent duplicate registration과 project logger observer isolation을 사용한다.
7. Zustand, motions hook와 default/explicit Bridge reset projection을 검증하고 injected memory backend raw state는 reset 대상에서 제외했다.

### Source of truth와 compatibility

- System-owned reset defaults는 `InteractionSystem` local creators가 소유한다.
- raw quartet outer objects와 `activeInputs`는 retained runtime identity, reset 뒤 nested values와 descriptors는 fresh System-owned defaults다.
- state/metrics top-level은 legacy `AbstractSystem` object reset처럼 교체되고 updateCount는 0으로 돌아간다.
- callback registry와 default backend binding은 reset을 넘어 유지되며 unsubscribe/dispose가 cleanup path다.
- injected backend raw state는 외부 authority이고 Bridge reset은 System metadata/config/metrics만 초기화한다.
- public types/exports, architecture baseline 16, raw/frame timestamp와 dormant `metrics.lastUpdate` 의미를 유지했다.

### 검증

- 변경 source/test ESLint `--no-ignore`, build/root TypeScript와 `git diff --check`: 통과.
- focused: 9 suites / 97 tests, interactions: 8 suites / 126 tests 통과.
- 전체 Jest: 196 suites / 1,813 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, declaration/runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- reviewer가 재현한 callback self-registration, subscriber throw, descriptor/extensibility, frozen scratch와 inherited setter 문제는 단계별 회귀 테스트와 함께 수정했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22, 비-Windows와 renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 R3F/WebGPU renderer와 GPU resource ownership·dispose 경계를 감사해 가장 작은 leak 또는 compatibility correction을 선택한다.

## Epoch 3a — Building GPU upload ownership (2026-09-02)

building spatial/meta/indirect upload resource의 경쟁 private ref를 제거하고 최신 record와 terminal cleanup을 render store의 단일 canonical 경로로 통합했다.

### 변경

1. `setUploadResources`가 direct assignment와 최신 record 기반 functional updater를 함께 지원한다.
2. functional updater 계산 중 resource action 재진입을 거부하고 실패 뒤 guard를 복구한다.
3. release/reset은 fresh empty record를 먼저 publish하고 `finally`에서 detached buffers를 destroy해 throwing subscriber에도 cleanup을 보장한다.
4. 개별 resize/zero-size buffer retirement는 기존 upload sync helper가 계속 소유한다.
5. spatial/indirect driver의 private resource ref와 indirect driver의 매-render 동기화 effect를 제거했다.
6. spatial → indirect → same-capacity spatial 갱신에서 indirect buffer identity를 보존한다.
7. reset/unmount 양방향과 StrictMode 첫 mount/replay 두 resource generation의 exact-once terminal cleanup을 검증했다.

### Source of truth와 compatibility

- transient 최신 upload resource record와 terminal cleanup은 `useBuildingRenderStateStore.uploadResources`가 소유한다.
- resource 전환에서 displaced 된 개별 buffer retirement는 기존 sync helper가 소유한다.
- public direct setter는 exact assignment/ownership transfer compatibility를 유지하고 내부 전이는 functional updater를 사용한다.
- 공개 export/subpath와 기존 component/store action은 유지되며 release action과 setter parameter만 additive/widening이다.
- typed-array mirror, dirty range, queue upload, culling/LOD와 INV-018은 그대로다.

### 검증

- 변경 source/test ESLint `--no-ignore`, build/root TypeScript와 `git diff --check`: 통과.
- focused lifecycle: 2 suites / 9 tests 통과.
- building domain: 28 suites / 251 tests 통과, 1 suite / 1 test skipped.
- public API/package exports focused: 2 suites / 22 tests 통과.
- 최종 전체 Jest: 198 suites / 1,822 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations와 runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 재검토: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- aliased/throwing buffer와 GPU allocation/write 예외의 실패 원자성은 normal distinct/non-throwing device precondition 밖으로 문서화했다.
- device 교체, 실제 browser WebGPU와 culling async race는 이번 slice에서 제외했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- demo, Node 20/22, 비-Windows와 실제 GPU browser validation은 미실행했다.
- 다음 slice는 renderer factory capability single-flight, init failure boundary, R3F 9 dispose compatibility와 OffscreenCanvas 타입 계약을 교정한다.

## Epoch 3b — Renderer factory compatibility boundary (2026-09-02)

공개 renderer factory의 capability, fallback, R3F 9 canvas 타입과 WebGPU renderer 종료 경계를 Three r178의 실제 동작에 맞춰 결정론적으로 고정했다.

### 변경

1. availability probe를 module lifetime의 in-flight/settled promise 하나로 통합했다.
2. fallback을 capability/import/missing-constructor/constructor failure까지만 허용하고 init 오류의 identity를 보존했다.
3. WebGPU constructor에서 WebGL context와 `'default'` power preference를 제거했다.
4. native dispose와 R3F 9 `forceContextLoss()`를 throw/reentry에도 exact-once인 cleanup 경로로 통합했다.
5. compatibility 설치 실패는 initialized renderer를 best-effort 정리하고 원래 installation error를 전파한다.
6. R3F 전용 public type import를 제거하고 Three props + `EventTarget` canvas의 독립 structural signature로 R3F 9 Canvas 호환을 유지했다.
7. package verifier가 ESM/CJS declaration의 R3F import 부재와 renderer public symbol의 함수 export를 검사한다.

### Source of truth와 compatibility

- capability probe/result, renderer selection, fallback과 disposal compatibility는 `src/core/rendering/webgpu.ts`가 canonical source다.
- 성공 renderer의 사용 수명은 Canvas/consumer가 소유하고 두 cleanup method는 동일 native dispose를 최대 한 번 실행한다.
- public symbol/import path와 legacy defaults를 유지하며, R3F 9 Canvas strict 타입을 지원한다.
- 허용 peer R3F 8 declaration은 version-specific root export를 요구하지 않지만 R3F 8 async Canvas runtime을 새로 보장하지 않는다.

### 검증

- renderer focused 14 tests, rendering domain 21 tests, public API/package exports 22 tests 통과.
- 변경 lint/Prettier, build/root TypeScript, script syntax와 diff check 통과.
- memory gate: 5 suites / 86 tests 통과.
- 최종 전체 Jest: 199 suites / 1,836 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, 95 packages, exact-optional false·true declaration과 runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 실제 R3F 8.17.10 strict declaration 소비자 통과.
- 독립 최종 재리뷰: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- demo, Node 20/22, 비-Windows, 실제 브라우저 WebGPU와 실제 R3F timer 기반 unmount integration은 미실행했다.
- 다음 slice는 Drei GLTF cache scene을 per-instance projection과 분리하고 생성 toon material의 exact cleanup ownership을 정한다.

## Epoch 3c — GLTF instance toon ownership (2026-09-02)

Drei의 URL별 shared GLTF scene을 read-only asset source로 고정하고 toon projection과 생성 material lifetime을 `PhysicsEntity`/`RiderRef` clone으로 이동했다.

### 변경

1. `useGltfAndSize()`의 cache source mutation과 읽히지 않던 local ref-count retention을 제거했다.
2. root-local source material map으로 동일 material의 mesh/array slot을 하나의 generated toon material로 dedupe했다.
3. weak ownership record가 original/projected slot과 generated material cleanup을 소유한다.
4. apply 실패는 slot rollback과 generated material 전량 cleanup 뒤 원래 error를 보존한다.
5. release는 registry를 먼저 detach하고 restore/dispose 오류를 격리해 전체 cleanup 뒤 최초 error를 전파한다.
6. authored toon, source material/texture/geometry, falsy array slot과 global gradient는 instance가 소유하거나 dispose하지 않는다.
7. 두 entity는 committed clone의 layout effect에서만 toon을 만들고 node revision으로 실제 ModelRenderer material snapshot을 갱신한다.
8. StrictMode discarded render, effect replay, URL 전환과 unmount generation의 ownership을 테스트로 고정했다.

### Source of truth와 compatibility

- `useGLTF(url).scene`은 read-only shared asset source다.
- 각 SkeletonUtils clone은 runtime toon projection과 generated material의 React-lifetime owner다.
- `src/core/rendering/toon.ts`의 root별 WeakMap이 generated material과 source replacement의 canonical cleanup record다.
- `applyToonToScene(...): void`, 기존 root exports와 non-toon appearance를 유지하며 cleanup helper는 internal module export다.

### 검증

- focused 3 suites / 11 tests, rendering+motions 22 suites / 153 tests 통과.
- public API/package exports 2 suites / 22 tests 통과.
- 변경 lint/Prettier, build/root TypeScript와 diff check 통과.
- memory gate: 5 suites / 86 tests 통과.
- 최종 전체 Jest: 202 suites / 1,847 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, 95 packages, strict declaration/runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 재리뷰: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- reviewer가 찾은 cleanup restore exception Major는 slot별 격리와 first-error 보존 회귀 테스트로 수정했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- demo, Node 20/22, 비-Windows와 실제 GLTF/Canvas/GPU material memory 관측은 미실행했다.
- 다음 slice는 experimental Three WebGPU backend factory의 init/post-init cleanup phase를 분리한다.

## Epoch 3d — Next WebGPU backend lifecycle (2026-09-02)

Experimental `gaesup-world/next`의 Three WebGPURenderer facade를 실패 phase별로 분리하고 initialized renderer의 exact-once terminal ownership을 고정했다.

### 변경

1. navigator capability, dynamic import, constructor, init과 post-init setup 실패를 독립 경계로 분리했다.
2. navigator/gpu getter 예외와 import·constructor·init failure는 기존 `false`/`null` fallback으로 정규화했다.
3. Three r178 init reject에서는 public-safe하지 않은 partial renderer dispose를 호출하지 않는다.
4. init 성공 뒤 initial `setSize()` 실패는 native dispose를 best-effort 정확히 한 번 시도하고 `null` contract를 유지한다.
5. 성공 facade는 flag-before-call로 dispose throw/reentry에도 native exact-once를 보장하고 dispose 뒤 resize를 no-op 처리한다.
6. `kind: 'webgpu'`가 resolved adapter 증명이 아닌 Three WebGPURenderer facade family임을 문서화했다.
7. package consumer가 `gaesup-world/next`의 `NextWorld`, `createThreeWebGpuBackend`, `isWebGpuAvailable` ESM/CJS named runtime과 함수 shape를 검사한다.

### Source of truth와 compatibility

- `src/next/backend/threeWebGpuBackend.ts`가 capability gate, initialization phase와 returned facade lifetime의 canonical source다.
- init 성공 전 partial renderer는 caller가 소유하지 않고, 성공 뒤 local dispose-once closure가 terminal path다.
- 기존 public import path, 함수 signature, options와 result shape, failure의 `null` fallback을 유지한다.
- `native`는 호환성 escape hatch이며 wrapper 밖의 직접 사용·dispose까지 exact-once를 보장하지 않는다.

### 검증

- focused backend 1 suite / 10 tests, `src/next` 7 suites / 50 tests 통과.
- public API/package exports 2 suites / 22 tests 통과.
- 변경 lint `--no-ignore`, Prettier, build/root TypeScript, script syntax와 diff check 통과.
- memory gate 5 suites / 86 tests 통과.
- 최종 전체 Jest 203 suites / 1,857 tests 통과, 1 suite / 1 test skipped.
- fresh package ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declaration/runtime smoke 통과.
- Vite package consumer bundle 648 modules 통과.
- 독립 최종 재리뷰: blocker 0 / major 0 / minor 0.

### 실패·경고·미실행과 다음 slice

- Three r178 partial-init device/context/listener는 public API로 안전하게 회수할 수 없고 actual resolved backend도 판별하지 않는다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- demo, Node 20/22, 비-Windows와 실제 browser WebGPU device/context memory 관측은 미실행했다.
- 다음 slice는 `NextCorePage` raw GPU scene의 async unmount race, loop Promise와 multi-resource cleanup을 교정한다.

## Epoch 3e — Next GPU scene lifetime (2026-09-02)

`NextCorePage` GPU showcase를 public next backend boundary의 실제 consumer로 전환하고 async setup과 transient GPU scene resource를 effect generation별 exact-once lifetime으로 통합했다.

### 변경

1. raw `three/webgpu` import·constructor·init을 제거하고 `gaesup-world/next`의 `createThreeWebGpuBackend()`를 사용한다.
2. culled result, initialized backend, geometry와 requested animation loop를 effect-local owner slot에 등록한다.
3. cancellation과 await late settle은 획득 즉시 같은 release path로 수렴하며 handle별 detach가 duplicate cleanup을 막는다.
4. cleanup은 owner slot을 먼저 모두 비우고 loop stop → geometry → culled → backend 순서로 각 disposer를 독립 시도한다.
5. Three r178 animation-loop start/stop Promise rejection, synchronous setup, disposer와 logger throw를 처리해 unhandled rejection과 cleanup short-circuit를 막는다.
6. stale loop callback은 cancellation 뒤 즉시 반환하고 backend factory가 변경한 canvas width/height를 `100%`로 복원한다.
7. deferred Promise, post-init failure, reentry, StrictMode와 responsive style을 15개 lifecycle test로 고정했다.

### Source of truth와 compatibility

- Three renderer capability/import/init과 terminal native lifetime은 `src/next/backend/threeWebGpuBackend.ts`가 계속 canonical source다.
- `GpuScene` effect generation은 culled/backend/geometry/requested-loop transient handles의 React-lifetime owner다.
- world typed arrays와 GPU culling algorithm, route/UI/fallback, public factory signature와 imports는 유지했다.
- capability/backend `null`과 정상 cancellation은 조용히 종료하며 setup·cleanup failure만 public project logger로 전달한다.

### 검증

- focused GPU lifetime 1 suite / 15 tests 통과.
- examples public package consumption과 route 2 suites / 20 tests 통과.
- 변경 lint `--no-ignore`, Prettier, root TypeScript와 targeted diff check 통과.
- demo package surface Vite 1,616 modules와 chunk verification 통과.
- 최종 전체 Jest 204 suites / 1,872 tests 통과, 1 suite / 1 test skipped.
- 독립 최종 재리뷰: blocker 0 / major 0 / minor 0 / residual 1.

### 실패·경고·미실행과 다음 slice

- residual은 jsdom/mock으로 관측할 수 없는 실제 browser WebGPU adapter/device loss, GPU memory 회수와 browser layout이다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- public library source·declaration이 바뀌지 않아 fresh package consumer와 memory gate는 미실행했다.
- 다음 단계는 hardened `SceneDocument`를 WorldDocument의 첫 vertical subset으로 삼아 canonical command/controller/save path를 도입한다.
