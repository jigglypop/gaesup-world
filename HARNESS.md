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

## 2026-09-05 Examples modernization — 진행 중

- 사용자 목표: 예제 한국어화, 메뉴 정리, 성능·구조 최신화. 전체 목표는 미완료이며 `.codex/plans/active/examples-modernization.md`에 남은 범위와 renderer migration 조사 결과를 기록했다.
- 변경 파일군: examples의 navigation/home/assets/catalog/HUD/performance/info/World, seed asset 및 event 문구, save hooks/IndexedDB adapter, network manager/hook, 회귀 테스트와 Jest TextEncoder/TextDecoder 환경 보완.
- source of truth: 경로 manifest 및 canonical SceneDocument는 유지. 자동 저장은 명시적으로 주입한 runtime.save를 사용하며 생략 시 전역 SaveSystem으로 호환된다. useLoadOnMount의 세 번째 인자와 useAutoSave 옵션은 선택적이다. save schema 및 subpath는 바꾸지 않았다.
- 구현: 한국어 문구와 읽기 쉬운 제목, 모바일 메뉴 및 페이지 스크롤, 개발자 메뉴 닫기, 숨겨진 도구의 미마운트, 진단 패널 opt-in, query 기반 CPU/GPU 전환. 재접속 두 결함과 IndexedDB 커밋 전 성공 반환/연결 미해제, 자동 저장 인스턴스 불일치를 수정했다.
- 검증: 빌드 및 root TypeScript 통과. 저장/런타임/네트워크/API/HUD/경로 26 suites / 281 tests 통과. 전체 Jest 실행은 214 suites / 1940 tests 통과, 1 suite / 1 test skipped, 이전 성능 노출 정책 guard 1개 실패. 해당 guard를 새 제품/진단 구분에 맞게 수정한 뒤 관련 3 suites / 34 tests 통과.
- 실제 Chromium: 390px 본문 스크롤과 메뉴 닫힘, 제품 경로 로드, CPU/GPU/CPU 모드 전환 및 문서 재로드 없음 확인. 헤드리스 FPS는 성능 개선의 측정 근거로 삼지 않았다.
- 남은 검증/작업: 최종 전체 Jest, package consumer/demo, 모든 동적 패널 한국어화·접근성, 실제 성능 전후 측정, 최신 의존성/renderer migration. package.json/lockfile은 아직 변경하지 않았다. 기존 dev server 재사용 주소는 http://127.0.0.1:5173 이다.

## 2026-09-05 Renderer modernization — 안정 버전 단계

- package.json/pnpm-lock.yaml의 개발 환경을 React 19.2.8, Three 0.185.1, R3F 9.7.0, Drei 10.7.8, Rapier 2.2.0, postprocessing 3.1.1로 갱신했다. Three peer 범위에 검증한 r185를 추가했으며 기존 범위와 persistent schema는 유지했다. R3F 10 alpha 전환은 아직 하지 않았다.
- `src/next/backend/threeWebGpuBackend.ts`의 Vite-ignore 동적 bare import가 브라우저에서 실패해 빈 화면이 되는 결함을 수정했다. 번들러가 분석할 수 있는 `import('three/webgpu')`를 사용하며 factory의 null/dispose 계약은 유지했다.
- `examples/pages/NextCorePage.tsx`는 실제 renderer backend에 따라 WebGPU/WebGL2 대체/초기화 실패를 표시한다. FPS는 0.5초 동안의 프레임 수와 경과 시간으로 계산하며 GPU 첫 콜백의 짧은 시간차를 제외한다. GPU 명령 제출 시간은 GPU 실행 시간으로 표현하지 않는다.
- `AssetCatalogPanel.tsx`는 장착 부위와 기본 태그의 표시만 한국어로 바꾸며 원본 slot/tag 값은 보존한다. 필터와 항목 버튼에 선택 상태를 제공한다.
- 검증: build/root TypeScript 통과. 전체 Jest 215 suites / 1941 tests 통과, 1 suite / 1 test skipped. 이후 UI 실패 안내와 네트워크 단언 보완 관련 2 suites / 38 tests, FPS 변경 후 GPU lifecycle 15 tests 통과. 변경 파일과 추가 테스트 lint 통과.
- demo build 1595 modules 및 package surface chunk verification 통과. 최초 안정 버전 package consumer의 ESM/CJS import, 타입 검사 및 Vite consumer 빌드 통과.
- 실제 기존 dev server의 World/Creator와 GPU 10만 객체 장면을 Chromium으로 확인했다. GPU 장면 pageerror 없음, `WebGL2 대체 렌더링` 표시 확인. 이 환경은 native WebGPU adapter를 얻지 못하므로 native WebGPU 실행 검증으로 간주하지 않는다.
- 남은 범위: R3F 10 및 renderer/scheduler compatibility 검토, 나머지 동적 UI와 메뉴 감사, tooling 최신화, 실제 성능 전후 비교 및 native WebGPU 검증. Three.Clock deprecation과 큰 번들 경고가 남아 있다. 전체 목표와 renderer plan은 진행 중이다.
- GPU import 수정 후 package consumer 재실행도 통과했다. ESM/CJS runtime smoke, 타입 검사 및 consumer Vite 648 modules 빌드를 확인했다.

## 2026-09-05 Library UI localization — 진행 중

- 예제에서 소비하는 BuildingUI, editor 패널·검색·저장 상태, MotionController, NPC 이벤트·네트워크 진단 UI의 정적 문구 246곳과 접근성·입력 안내 86곳을 한국어로 변경했다. 연출 단계·NPC 이벤트 목록·저장 상태의 동적 문구도 연결했다. 파일·프로토콜·태그·enum 식별자는 유지한다.
- 명령 검색의 역할이 맞지 않는 listbox를 제거하고 포커스 타이머를 effect cleanup에서 해제한다. NPCEventEditor는 전체 instances 대신 선택된 NPC를 구독한다. 자동 저장 버튼은 aria-pressed를 제공한다.
- 모바일 editor 위치 변수가 root에서 계산되어 작은 화면의 실제 header 높이를 반영하지 못하던 문제를 AppShell에서 수정했다. 720px 이하에서는 열린 편집기의 메뉴와 본문을 위아래로 배치한다. 연출 카드에서 반복 JSON을 제거하고 전체 저장 데이터는 접힌 개발자 details로 유지한다.
- 검증: build/root 타입 검사 및 변경 파일 lint 통과. 영역 실행에서 editor 외 33 suites / 265 tests 통과, 1 suite / 1 test skipped. 번역으로 바뀐 UI 테스트 기대값과 중복 접근성 이름을 수정한 뒤 editor 17 suites / 71 tests 통과. 실제 Creator/연출 패널 로드와 한국어 옵션 표시 확인, pageerror 없음. 모바일 top 136px, navigation bottom 107px 및 document width 390px 확인.
- source of truth와 저장/네트워크 계약 변화 없음. 이번 번역 이후 전체 Jest/package/demo 재실행은 아직 하지 않았다. 동적 데이터의 남은 영어 표시, 전체 화면/모바일 메뉴 감사, 성능 비교 및 renderer/tooling 현대화 후속 작업은 계속 남아 있다.

## 2026-09-05 CPU upload / Vite 8

- `examples/pages/NextCorePage.tsx`: CPU 컬링 결과를 mesh의 instanceMatrix 배열에 직접 기록한다. 640,000바이트 중간 배열과 프레임별 subarray view·복사를 제거하고 가시 객체 범위만 전송한다. DynamicDrawUsage와 재사용 update range를 사용한다. canonical world typed arrays는 그대로다.
- 실제 Chromium `/performance`, 동일 기본 viewport/카메라 설정에서 WebGL2.bufferSubData를 관측했다. 이전 21회 모두 640,000바이트, 변경 후 21회 최소 356,352 / 최대 357,312 / 평균 356,650.7바이트. 객체 배치는 매 로드 무작위이므로 서로 다른 장면 표본이며 FPS 향상 수치로 해석하지 않는다. 전송량 감소와 중간 버퍼 제거가 확인된 개선이다.
- package.json/pnpm-lock.yaml: Vite 8.2.2, React SWC 4.3.3, GLSL 1.6.1, SVG 5.2.0. `vite-tsconfig-paths`는 Vite 내장 resolve.tsconfigPaths로 대체했다.
- `vite.config.ts`: import.meta.dirname, rolldownOptions 및 codeSplitting으로 전환했다. dependency를 건축 청크로 합치지 않도록 분리하고 strictExecutionOrder로 실행 순서를 보존한다. source of truth는 기존 manifest/config이며 public subpath와 Node 지원 범위는 유지한다.
- root/build TypeScript, API/export 2 suites / 24 tests, 컬링/GPU lifecycle 2 suites / 21 tests 및 변경 lint 통과. Vite 8 demo 1568 modules와 package surface chunk 검증 통과. ESM/CJS package runtime와 consumer 타입·Vite 빌드 통과(최종 config 재검증은 진행 중).
- 배포 산출물을 임시 로컬 HTTP 서버로 열어 홈, Creator, CPU performance, World의 한국어 UI·canvas 및 pageerror 없음 확인. 기존 5173 dev server PID 6980은 유지한다. 산출물 위치: `%TEMP%/gaesup-vite8-browser-uPKbuj`.
- 초기 스모크 도구의 루트 경로 처리와 잘못된 홈 selector 때문에 홈 검증이 실패했으나 도구를 수정해 실제 `.example-home-page` 로드를 확인했다. 제품 실패로 집계하지 않는다.
- 잔여: 큰 vendor 청크와 ineffective dynamic import 경고, TypeScript 및 renderer alpha 호환성, 나머지 동적 UI/메뉴 감사와 최종 전체 테스트. 전체 목표는 계속 진행 중이다.
- 최종 Vite 설정으로 package consumer 재실행 통과: 타입 검사, ESM/CJS runtime, consumer Vite 622 modules 빌드. build-tool-modernization 계획의 검증 조건과 자체 검토를 마쳐 completed로 이동했다.
- UI 번역·CPU upload·Vite 변경 후 전체 Jest 재실행: 215 suites / 1941 tests 통과, 1 suite / 1 test skipped. 실행 시간 61.753초.

## 2026-09-05 GPU viewport / automatic JSX

- `NextCorePage.tsx`: resize 이벤트에 맞춰 backend 크기, DPR 및 카메라 투영 비율을 갱신한다. 0 크기는 1로 제한하고 CSS 크기를 복원한다. 이벤트 소유권을 effect generation에 묶어 종료·실패 시 제거하며 resize 실패도 기존 리소스 해제 경로로 처리한다. GPU 초기화의 6,400,000바이트 중간 행렬 배열을 제거하고 instanceMatrix에 직접 기록한다.
- 실제 5173 GPU 예제를 390×844로 변경한 뒤 canvas 내부/표시 크기가 모두 390×844(DPR 1)임을 확인했다. pageerror 없음. 이 장치는 WebGL2 대체 backend이며 native WebGPU 검증으로 해석하지 않는다.
- Vite 업그레이드 뒤 기존 dev server에서 classic JSX 변환으로 `React is not defined`가 발생함을 발견했다. `tsconfig.json`을 react-jsx로 변경해 자동 JSX 변환을 명시하고 컴파일러 TS6133 진단이 가리킨 77개 파일의 미사용 React import만 제거했다. React 타입·memo 등에서 사용하는 import는 보존했다. PID 6980 dev server를 재시작하지 않고 정상 로드를 확인했다.
- VehiclePanel/MotionController의 모드·프리셋 이름과 도움말, NetworkDebugPanel 탭·연결 상태를 한국어로 정리했다. 차량 패널의 정적 모드 목록을 컴포넌트 밖으로 옮기고 mode.type만 구독하며 선택 버튼은 aria-pressed를 제공한다.
- GPU resize·실패·종료 테스트 2개 추가, lifetime 17 tests 통과. build 타입 검사와 변경 파일 lint, demo 1568 modules 및 chunk 검증 통과. 전체 Jest 중 214 suites / 1942 tests 통과, import 정리 전 실행된 examplePackageConsumption 1 test 실패. 정리 후 해당 suite 16 tests 통과. 최종 전체 합산 성공으로 표현하지 않는다.
- package consumer 재검증은 진행 중이다. 나머지 동적 UI·메뉴 감사와 TypeScript/renderer 현대화, native WebGPU 증거는 전체 계획에서 계속 추적한다.
- 후속 결과: root 타입 검사와 GPU lifetime 17 tests 통과. 자동 JSX 및 import 정리 후 package consumer 재검증도 통과했다(ESM/CJS runtime, 타입 검사, Vite consumer 622 modules). 전체 Jest의 마지막 실패 suite는 앞서 별도 실행으로 통과했으며 이후 전체를 재실행하지 않았다.

## 2026-09-05 Dynamic UI defaults

- 기본 애니메이션, 소품 카탈로그, 건축 category/group, 카메라 controller/debug/preset, 장비·표정, editor 메뉴 메타데이터·행동 프리셋·카메라 설정의 이름과 설명을 한국어로 연결했다.
- 건축의 labelEn/labelKo 구조는 보존하고 BuildingUI에서 labelKo를 사용한다. Ground/Ocean의 잘못된 한국어 필드를 지면/바다로 수정했다. 신규 프리셋 생성 시 한국어 이름을 사용하며 기존 저장 항목과 사용자 지정 이름은 일괄 변환하지 않는다.
- BuildingPanel 재질 카드의 kind와 격자 ON/OFF 표시, 사용자 지정 바닥의 기본 이름·category 설명을 정리했다. 카메라 설정의 기본 mode 표시는 기존 CameraController 모드 목록의 이름을 재사용한다. 코드용 preset/category/type 값과 저장 schema는 유지한다.
- 검증: build/root TypeScript, 변경 lint 및 diff check 통과. 초기 영역 44 suites 중 번역 기대값에 따른 4 suites 실패를 수정한 뒤 관련 7 suites / 24 tests 통과. 건축 store/panel 3 suites / 28 tests 및 EditorLayout 2 suites / 12 tests 통과. 초기 실행의 나머지 40 suites는 통과했다.
- 실제 Chromium Creator에서 벽·바닥 프리셋의 한국어 표시와 pageerror 없음 확인. 카메라 패널의 특정 모드 문구 대기는 시간 초과되어 실제 표시 상태를 추가 확인 중이다. 이번 기본 문구 수정 이후 전체 Jest/package/demo 재실행은 하지 않았다.
- 카메라 화면 후속 확인: Creator의 실제 기본 모드는 topDown이며 `모드: 위에서 보기`로 정상 표시된다. 검사 도구가 잘못 예상한 `3인칭`을 기다린 것이 시간 초과 원인이었다. pageerror 없음. Settings/Controller/Presets/Debug 탭과 FOV Sm 약어를 한국어로 추가 정리했고 CameraPanel 2 tests 및 변경 lint 통과.

## 2026-09-05 World restore and stale network messages

- 검토 턴에서 직렬화 실패 시 기존 도메인을 null로 저장하는 동작, 누락된 migration 허용, disconnect 이후 비동기 메시지 콜백 실행을 재현했다. 이를 다음 조치의 근거로 사용했으며 앞선 검토는 증거 확보에 해당한다.
- examples/pages/runtime.ts: 최초 load가 빈 슬롯을 반환한 경우에만 시작 상태를 적용한다. 해당 작업을 SaveSystem별 기존 초기화 promise에 포함해 저장 전 재진입에도 시간·시작 물품을 재설정하지 않는다. 이벤트 목록 갱신은 각 진입 시 현재 시간으로 실행한다. 저장 및 canonical domain 경로는 유지한다.
- PlayerNetworkManager: 비동기 텍스트 변환 완료와 실패를 처리하기 전에 현재 소켓 및 OPEN 상태를 확인한다. 이전 연결의 늦은 완료가 재접속한 세션에 영향을 주지 않는다. wire format과 public API는 유지한다.
- 회귀 테스트: 저장된 월드 복원, 신규 월드 초기화 및 재진입 보존, 재접속 후 이전 메시지 resolve/reject 무시와 새 메시지 수신. 관련 3 suites / 33 tests, build/root 타입 검사, 변경 파일 ESLint 및 diff check 통과.
- 이번 변경 이후 전체 Jest, demo/package build 및 브라우저 재검증은 미실행. 저장 실패 보호·migration 검증, 남은 UI/모바일 감사, compiler/renderer 현대화 및 native WebGPU 증거 확보는 계속 남아 있다.

## 2026-09-05 Blueprint editor usability

- 실제 /blueprints에서 사용하는 BlueprintEditor의 기본 속성 이름과 토글, 미리보기 안내, 기본 전사·화염 마법사·카트 이름/설명을 한국어로 정리했다. MinimalExample의 Lens/deg도 렌즈/도로 변경했다. 코드용 ID·태그·사용자 정의 필드/값은 보존한다.
- 목록을 키보드로 선택 가능한 button으로 변경하고 카테고리/목록/토글의 선택 상태와 검색 이름, 검색 결과 없음 안내를 제공한다. 1000px 이하에서는 목록·미리보기·속성을 세로 배치하고 검색 및 목록은 제한된 높이로 사용한다.
- BlueprintPreview의 window wheel listener가 편집기 전체 스크롤을 막던 문제를 수정했다. listener는 preview element가 소유하고 effect cleanup으로 제거한다. public API, 저장 schema와 registry write path는 변경하지 않는다.
- 실제 Chromium 390×844에서 가로 크기 client/scroll 모두 390, 미리보기 외부 wheel 허용/내부 처리, Enter로 목록 선택, 빈 검색 안내 및 pageerror 없음 확인. 1440×900에서도 속성 표시 확인. 기존 dev server를 재사용했다.
- build/root 타입 검사, 변경 ESLint 통과. blueprint domain의 직접 UI 테스트 파일은 없으므로 브라우저에서 조작을 검증했다. 전체 Jest/demo/package 재실행은 하지 않았다.
- 다음 감사: 별도로 export된 구형 BlueprintPanel 문구, 블루프린트 편집/생성 데이터 연결, 관리자/모바일 남은 화면. 전체 목표와 renderer/compiler 현대화는 계속 진행 중이다.

## 2026-09-05 Blueprint edit application

- BlueprintEditor의 편집 사본이 spawnAtCursor에서 읽는 registry에 적용되지 않는 경로를 수정했다. 변경 적용 버튼과 생성 직전 적용은 기존 blueprintRegistry.register를 사용한다. 목록 snapshot을 적용 직후 갱신하며 식별자/최상위 type은 읽기 전용이다.
- 세션 범위 적용임을 화면에 명시했다. 디스크 저장이나 SaveSystem 연결을 새로 주장하지 않는다. registry가 기존 source of truth이고 public API·spawn wire contract는 유지한다.
- 회귀 테스트는 적용 전 원본 불변, 적용 후 이름 목록 갱신/재선택 보존, 생성 함수가 변경된 체력을 읽는 순서를 검증한다. preview와 spawn hook은 mock이며 전체 WorldBridge 생성의 검증으로 해석하지 않는다.
- 해당 2 tests 및 변경 ESLint, build/root 타입 검사와 diff check 통과. 누적 변경을 포함한 전체 Jest는 216 suites / 1949 tests 통과, 1 suite / 1 test skipped(57.855초). Three.Clock 및 react-test-renderer의 기존 deprecated 경고는 남아 있다. 이번 적용 버튼 변경 후 브라우저, demo/package 검증은 미실행이다.

## 2026-09-05 Multiplayer speech lifetime

- useMultiplayer의 말풍선 만료 처리가 rigidBodyRef·위치 추적의 early return에 막히는 문제를 수정했다. 가장 가까운 expiresAt에 timeout 하나를 예약하며 메시지 변경 및 unmount 때 이전 timer를 해제한다. 위치 전송 주기마다 Map을 탐색하고 삭제 키 배열을 만드는 작업을 제거했다.
- 회귀 검증: rigid body 없는 연결에서 메시지 수신 후 연결이 끊겨도 만료, 같은 플레이어의 새 메시지가 만료 시각 갱신, unmount 시 timer 해제, 기존 수동 재접속 위치 전송 유지. 관련 3 tests, build 타입 검사, 변경 ESLint 통과.
- source of truth는 기존 hook의 speech state이며 public API·network message·저장 schema는 유지한다. FPS 개선 수치는 측정하지 않았다. 이번 변경 후 전체 Jest/browser/demo/package 재실행은 하지 않았다. 남은 화면 정리 및 renderer/compiler 현대화는 계속 active다.

## 2026-09-05 Native TypeScript compiler

- 기본 CLI/declaration emit을 TypeScript 7.0.2로 전환했다. 공식 병행 설치 방식: @typescript/native=npm:typescript@7.0.2, typescript=npm:@typescript/typescript6@^6.0.2(API 엔진 6.0.3). ts-jest 29.4.12와 typescript-eslint 8.69.0은 후자의 API를 사용한다. peer override 없음.
- tsconfig는 baseUrl 제거, 상대 paths/rootDir/types 명시. 기존 alias 의미와 strict 설정을 보존한다. GPU queue의 shared buffer view 계약과 Blob 입력의 실제 ArrayBuffer 타입을 명시했으며 런타임 복사는 추가하지 않았다. consumer CLI 검사는 native tsc를, AST 검사와 CJS 선언 후처리는 TS6 API를 사용한다.
- 최초 install prepare의 declaration 검사는 ambient types와 typed-array 타입 오류로 실패했다. 해당 오류를 수정한 뒤 root/build 타입 검사, declaration emit/CJS 후처리, lint, compiler API/영향 영역 31 tests 통과. 전체 Jest 216 suites / 1951 tests 통과, 1 suite / 1 test skipped(55.481초).
- demo chunk 검증 및 package consumer 통과: ESM/CJS import/require, native CLI 소비자 타입 검사, strict declaration API 검사, Vite 623 modules. 기존 큰 chunk/ineffective dynamic import/Three.Clock/react-test-renderer 경고는 남아 있다.
- 다른 검증 프로세스 종료 후 동일 build noEmit을 TS6/TS7 순차 3회 측정했다. TS6=7192/7655/7520ms, TS7=1218/1254/1176ms. 중앙값 약 7.52초→1.22초(6.2배). 개발 검사 시간이며 앱 렌더링 성능 주장이 아니다.
- compiler slice 완료. 전체 UI/메뉴 및 renderer/native WebGPU 검증 목표는 미완료다. 실행 중 dev server를 재시작하거나 종료하지 않았다.
- 공식 근거: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/

## 2026-09-05 Legacy blueprint panel

- 별도 공개 BlueprintPanel의 카테고리/검색/생성/편집/취소 문구를 한국어로 정리하고 BlueprintEditor의 기본 속성 label을 재사용했다. 입력에 accessible name, 카테고리에 선택 상태를 제공한다.
- registry 등록 후 목록 snapshot을 갱신한다. 신규 생성 취소 시 미등록 ID와 편집 상태를 해제한다. 구현이 없는 animation/behavior/item 생성은 잘못된 character를 만들지 않도록 비활성화하며 조회는 유지한다. 편집 중 category 변경도 차단한다.
- 신규 등록의 즉시 목록 표시 및 취소/미지원 category 생성 방지 2 tests 통과. 초기 취소 문구 누락으로 1 test 실패 후 문구 수정 및 재실행 통과. build tsc/변경 ESLint/diff check 통과. public API·registry source of truth와 저장 schema는 유지한다.
- 이번 패널 변경 이후 전체 테스트/browser/demo/package는 미실행. 전체 목표는 계속 active이며 남은 화면 감사와 renderer/native WebGPU 검증이 필요하다.

## 2026-09-05 Admin login presentation

- 관리자 로그인/입력 placeholder/실패 메시지/로딩 문구를 한국어로 바꿨다. label 연결, required, 로그인 중 버튼 비활성화, 오류 alert와 로딩 status를 제공한다. 기존 인증 로직은 유지한다.
- 로그인 페이지의 100vw/100vh를 부모 기준 크기로 변경하고 폼에 border-box 및 모바일 여백을 적용했다. source of truth/public API/저장 schema 변경 없음.
- root/build 타입 검사, 변경 ESLint, diff check 통과. 문구/CSS 변경을 그대로 복제하는 테스트는 추가하지 않았다. 이번 변경의 브라우저 렌더링 및 전체 Jest/demo/package 재검증은 미실행이며 전체 완료로 판단하지 않는다.

## 2026-09-05 Save failure protection

- SaveSystem.createBlob은 모든 직렬화 진단을 수집한 뒤 실패가 있으면 AggregateError를 던진다. save가 adapter.write에 도달하지 않으므로 기존 슬롯을 부분/null 데이터로 덮어쓰지 않는다. 기존 registry/binding/write path와 schema는 유지하지만 오류 시 부분 저장 성공 계약을 실패로 변경했다.
- 미래/비정수/잘못된 version, 누락 migration, 진행하지 않거나 지원 버전을 초과하는 migration은 domain hydrate 전에 거부한다. 정상 migration chain/round-trip은 기존 테스트로 검증한다.
- 저장/runtime/editor 5 suites / 39 tests 통과. 기존 오류 진단 테스트가 성공 save를 기대해 초기 실패했으며, 진단 단언은 보존하고 rejection 단언을 추가한 뒤 통과했다. build tsc, 변경 ESLint, diff check 통과.
- 전체 Jest/browser/package 재실행은 이번 slice에서 하지 않았다. hydrate 중 개별 도메인 실패의 부분 적용 정책과 IndexedDB read 오류 구분은 남은 사항이다. 전체 UI/renderer 목표는 계속 진행 중이다.

## 2026-09-05 JSX text audit

- examples/src의 비테스트·비legacy TSX에서 JSX 텍스트와 title/placeholder/aria-label/alt를 AST로 검사했다. 추가로 JSX 자식 표현식의 단순 문자열·조건부 기본값을 검사했다. 초기 넓은 표현식 탐색은 CSS/코드 문자열까지 포함해 노이즈가 많았으므로 화면용 단순 분기로 범위를 좁혔다. 동적 레지스트리/사용자 값 전체 검증을 뜻하지 않는다.
- BlueprintList의 생성/빈 목록, Rideable 속도·가속 fallback, FieldToggle/BuildingUI 눈·안개 ON/OFF, AudioControls OFF, CharacterMenu 예제 선택 문구, Teleport 기본 안내를 한국어로 정리했다. NPC/FPS와 URL·파일경로 예시, 코드 식별자 및 사용자 override는 유지한다.
- Teleport를 disabled 지원 button으로 변경하고 FieldToggle/AudioControls/BlueprintList에 선택 상태를 제공한다. source of truth/public export/저장 계약 변경 없음.
- build tsc, 변경 ESLint, diff check 및 관련 5 suites / 12 tests 통과. 새 화면 검증과 전체 Jest/demo/package는 이번 변경 후 미실행이다. 전체 목표는 active이며 화면·동적 문구와 렌더러 검증을 계속한다.

## 2026-09-05 Initial load protection

- IndexedDBAdapter.read는 저장소 오류를 null로 숨기지 않고 reject한다. 정상 조회의 undefined만 빈 슬롯(null)으로 변환한다. 기존 loadInitialWorldSave의 실패 시 promise cache 제거 경로로 재시도가 가능하다.
- useAutoSave에 enabled(default true)를 추가했다. WorldSystems는 현재 runtime의 초기 로드가 성공한 뒤에만 자동 저장을 활성화한다. 읽기 실패/대기 중 기본 상태가 주기 또는 unload 이벤트로 저장되는 것을 막는다. 기존 호출자의 기본 동작은 유지한다.
- 읽기 오류 전달, enabled 전환과 timer/unload 해제, StrictMode 로드 전후 enabled 상태 및 기존 수명 테스트, public API/package export 가드: 6 suites / 48 tests 통과. root/build 타입 검사와 변경 ESLint 통과.
- source of truth는 기존 runtime.save이며 schema/write path 변경 없음. 전체 Jest/browser/demo/package 소비자 재검증은 이번 변경 후 미실행이다. 전체 목표는 계속 진행 중이다.

## 2026-09-05 R3F 10 timing boundary

- R3F/Drei alpha를 별도 임시 프로젝트에 설치하고 원본 build 설정의 package type paths만 바꿔 검사했다. 초기 40개 오류: clock 제거, Drei export, event/ref 타입. 현재 Rapier는 R3F 9 peer만 선언한다. dependency override나 주 저장소 업그레이드는 하지 않았다.
- 공통 frame 훅과 batch entity 훅의 시간 읽기를 내부 getFrameTimeMs로 통합했다. v10 scheduler elapsed와 v9 clock을 모두 지원하며 동일 ms throttle을 유지한다. source of truth와 public API, engine data 구조는 유지한다.
- 기존 훅과 새 timing 테스트 8 suites / 131 tests, build tsc 및 변경 ESLint/diff check 통과. 임시 v10 재검사에서 오류는 40→36개로 감소했고 공통 frame 훅 오류는 없어졌다. 남은 오류 TS2305=9, TS2375=1, TS2339=24, TS2322=2. 전체 Jest/browser/package 및 실제 R3F10/Rapier 실행은 아직 미검증이다.
- 공식 v10 근거: https://github.com/pmndrs/react-three-fiber/releases/tag/v10.0.0-alpha.4

## 2026-09-05 Effect frame timing

- 12개 효과/NPC/작물/발자국 파일의 clock 읽기를 getFrameElapsedSeconds로 이관했다. 초 단위와 shader/animation 계수를 유지하고 메모리 할당을 추가하지 않았다. sakura는 현재 프레임의 elapsed를 읽어 별도 getElapsedTime 호출에 의한 clock 갱신을 피한다. public API와 persistent state 변경 없음.
- 공통 frame/building mesh/NPC 14 suites / 151 tests 통과. root/build tsc, 변경 ESLint/diff check 통과. 추가 farming/frame 검사 2 suites / 9 tests 통과(앞선 frame 테스트 중복 포함). effects 전용 suite는 없었다. alpha 검사 오류는 36→16개로 줄었다. 타입 호환 증거이며 실제 shader 렌더링 검증은 아니다.
- 아직 R3F 10을 기본 의존성에 설치하지 않았다. camera의 legacy Clock 계약, movement wait, Drei legacy export와 pointer/ref, Rapier 실제 실행 검증이 남아 있다. 전체 Jest/browser/demo/package 재검증은 이번 변경 후 미실행이다.

## Save load error contract (2026-09-05)

- SaveSystem now rejects domain hydration failures after processing other bindings and reporting diagnostics. WorldSystems only enables autosave after successful loading; no persistent source-of-truth or save format change. Partial hydration is not rolled back and explicit manual saves are not globally blocked.
- LocalStorageAdapter propagates read/write/list/remove failures, including invalid JSON and quota errors. Only an absent key returns null; unavailable storage rejects.
- Added LocalStorage failure/round-trip coverage and a WorldSystems regression using actual SaveSystem/useAutoSave: failed hydration cannot write after 120 seconds or beforeunload. Updated the scene-document diagnostic expectation.
- Validation: 10 suites / 80 tests passed; build and root typechecks, build:types, production-file ESLint and diff --check passed. Four test files were ignored by repository ESLint configuration. Full Jest, browser, demo/package checks were not rerun.
- Next slices: repair movement automation queue semantics; continue R3F 10 scheduler/Drei compatibility and native renderer verification; finish examples UI audit. Overall goal remains active.

## Navigation input update suppression (2026-09-05)

- DirectionComponent skips publishing an identical navigation target, angle and run setting. This avoids repeated Vector2 construction and input dispatch while preserving waypoint progression and steering after displacement.
- Tests: 6 suites / 43 tests passed (movement/navigation), including 120 unchanged frames with no additional input publication, waypoint completion, position displacement and run-mode changes. Build/root typechecks, changed production-file ESLint and diff --check passed. No browser/FPS benchmark or full-suite rerun in this slice.
- No persistent source-of-truth or public API change. Automation execution remains incomplete: store and AutomationSystem own separate queues and DirectionComponent consumes the store queue. An active automation-execution plan records the actual command/event paths and required consolidation, including movement arrival semantics. The global clock wait branch is unreachable through the normal queue path; replacing its timer alone would not fix execution.

## Canonical default automation execution (2026-09-05)

- Added core/defaultAutomation.ts: default AutomationSystem owns the queue shared by global InteractionBridge and store action APIs. Store state/config/metrics project engine notifications, including async completion and reset; default-engine listeners reconnect after global disposal. Independently constructed systems/bridges remain isolated.
- DirectionComponent no longer shifts automation actions, writes unused memo directions, or stops/starts the renderer clock. It derives steering from the active input target. The global bridge applies moveTo to input and pauses/stops only the movement it initiated.
- Default automation waits for movement input completion before advancing; clearQueue cancels in-flight execution. Standalone AutomationSystem preserves prior event-only movement completion by default; its optional constructor flag opts into explicit completeMovement acknowledgment.
- Validation: full Jest 221 suites / 1977 tests passed, 1 suite / 1 test skipped (49.229s). Build/root typechecks, build:types, changed production-file ESLint and diff --check passed. Focused tests cover mixed store/bridge actions, move-wait-move, pause/resume, clear cancellation and disposal/recreation. An initial reset regression from stopping non-automation input was corrected by tracking bridge movement ownership; the final full run passed.
- Remaining: actual examples physics scenario, loop and multiple-character/manual cancellation ownership audit, native WebGPU migration and final UI verification. Automation epoch and overall goal remain active.

## Automation example and physical stop verification (2026-09-05)

- Added developer route /automation with Korean controls, runtime-ready gating, an in-Canvas position probe, and an overlay inside the world runtime provider. Existing WorldPage children remain supported; sceneChildren/overlayChildren supply scoped integration. Normal worlds no longer enable Rapier debug rendering unless showDiagnostics is true.
- Actual Chromium exposed drifting after click completion: ImpulseComponent now brakes horizontal velocity once on mouse-active to inactive, preserving vertical velocity and continued keyboard input. Direction clears the reached target direction. Two meaningful braking regression tests were added.
- Browser verification on flat north-field terrain: start X36, pause retained X39.37 for 600ms, resume completed move-wait-move and stopped X36.93 (existing 1m arrival radius). Pause was triggered via DOM button click/timer to avoid a short-route actionability race; resume used Playwright click. Mobile 390x844 panel bounds x8/y120/w374, no horizontal overflow, no pageerror. Screenshot: system temp gaesup-automation-mobile.png.
- Failed probes were resolved: Canvas-only hook outside Canvas; teleport outside runtime context; initial-load race; unsuitable straight return over the spawn platform ledge. A native pointer pause attempt raced with sequence completion; the deterministic pause run above passed.
- Validation: motions/interactions 28 suites / 261 tests passed, examples 3 suites / 12 tests passed, route/consumer 2 suites / 20 tests passed. Build/root typechecks and changed production ESLint passed. Whole Jest, demo/package and native WebGPU checks were not rerun after this slice.
- Source of truth unchanged from canonical default automation engine. Remaining: loop/multi-character/manual-input ownership, renderer modernization and final UI audit. Overall goal remains active.

## Renderer camera and event/ref boundary (2026-09-05)

- CameraCalcProps.clock is now optional/deprecated; existing clock-providing calls remain accepted. Camera calculations continue using deltaTime. useCamera forwards an existing THREE.Clock only; R3F 10 receives undefined without manufacturing a legacy clock. External controllers that read clock must handle its absence.
- WallSystem and PassiveObjects use ThreeEvent event signatures. RemotePlayer has separate outer movement and inner animation refs; useAnimations owns the scaled model root. Added clock-free camera and animation-root ownership regressions.
- Isolated R3F 10/Drei 11 probe reduced 14 diagnostics to 9. All remaining errors are Text/Grid/Line/shaderMaterial imports; installed Drei 11 declarations confirm those in its legacy subpath, with Grid/Line additionally in webgpu. Main dependency/lockfile unchanged; this does not prove alpha runtime support.
- Validation: camera/wall/network 14 suites / 77 tests passed; additional remote/API/export 3 suites / 26 tests passed (overlapping suite). Build/root typechecks, build:types, production-file ESLint passed. Full Jest/demo/package and browser animation/WebGPU validation not rerun. Renderer plan remains active.

## Automation arrival and failure review fixes (2026-09-05)

- DirectionComponent uses waypoint arrival criteria throughout an active route, clears terminal steering, and marks actual arrival with optional MouseState.hasArrived. Direct movement retains its 1m radius.
- InteractionBridge distinguishes arrival from cancellation and replacement targets; the default AutomationSystem remains canonical. Custom arrival-wait integrations must acknowledge arrival explicitly. Standalone immediate-completion mode is unchanged.
- Movement timeoutDuration now drives the existing retry policy. Timeout errors stop owned input; arrival/pause/stop/reset/dispose clear pending timers. Regression tests cover sub-meter waypoints, cancellation without success, manual target replacement, retry exhaustion and timer cleanup.
- Automation example reports per-run completion and Korean completion/retry/failure states. Chromium completed two consecutive runs (3 actions each). A distant-target fixture verified exhausted movement retries and mobile failure UI (374px wide at 390px viewport). Short-deadline-only failure probes instead recovered successfully and timed out waiting for failure; these were not counted as failed-UI verification.
- IndexedDB list/remove now reject storage failures consistently with read/write and LocalStorageAdapter; parameterized tests exercise denied storage access.
- Validation: related 36 suites / 348 tests; full Jest 221 suites / 1991 tests passed, 1 suite/test skipped; memory 5 suites / 86 tests passed. Build/root TypeScript, changed production ESLint, public API/package-export tests, declaration build and diff whitespace check passed. Demo/package build checks and native WebGPU rendering were not run for this slice. Broader modernization goal remains active.

## Product ground and minimap presentation (2026-09-05)

- Default WorldPage hides both the infinite ground grid and the building grid. Diagnostic and editor views retain their respective grid controls. Optional BuildingController/BuildingSystem.showGrid overrides only the projection; omitted props retain the store preference. An override-removal regression verifies compatibility.
- Ground uses a muted green material. Minimap compass labels and accessible canvas/zoom names are Korean. World tools button has a dark background for contrast over bright scenery.
- Chromium screenshots at 390x844 and 1440x900 were inspected after actual WebGL draws; grid-free ground and Korean compass verified, page errors 0. Initial loading screenshots were discarded as evidence. No FPS improvement is claimed.
- Build/root TypeScript, changed production ESLint, UI/examples 4 suites / 14 tests, building/API/exports 3 suites / 54 tests and declaration build passed. Canonical state/save formats unchanged. Full Jest/demo/package and native WebGPU were not rerun. Overall modernization remains active.

## Legacy Drei boundary and isolated renderer execution (2026-09-05)

- Text/Grid/Line/shaderMaterial consumers now use internal rendering/legacyDrei.ts. Main still uses installed Drei 10 root exports. Isolated R3F 10/Drei 11 type mapping to the legacy declarations passes with zero diagnostics; production dependencies remain unchanged.
- Added scripts/probe-r3f10-rapier.cjs: real Rapier WASM, React, Three and Fiber scheduler, renderer stub only. Falling/resting, pause/resume, body removal and subscription teardown pass. Rapier callback refs retain removed bodies in both R3F 9 and 10; this separate upstream behavior is reported, not treated as cleared refs.
- Drei 11 has no CommonJS export condition. Isolated Vite bundling of its root plus legacy helpers produced a require-able 188-export CJS module (1,256,762 unminified bytes); the library packaging policy has not yet changed.
- Build/root typechecks, production-file lint, related 12 suites / 64 tests, ESM/CJS/declarations and demo build passed. Demo retains large vendor chunk and admin mixed-import warnings. Alpha browser/native GPU and full dependency migration remain unverified; goal stays active.
- Package consumer first caught the earlier hasArrived field missing from its expected MouseState contract. Updated the exact schema plus optional/boolean guards, retaining old field-omitting input fixtures. Re-run passed ESM/CJS and exact-optional type variants, runtime import/require smoke and Vite consumer build on the current stable package.
- Physics comparison uses seconds for legacy manual advance and milliseconds for the R3F 10 scheduler. Both runs produced identical landing/resumed heights and verified physical body removal. Ref-null notification remains a separate Rapier limitation in both stacks. Full Jest and alpha browser/native GPU were not run this slice.

## Review regression fixes (2026-09-05)

- SaveSystem.load accepts an optional AbortSignal and returns false before hydration when aborted. useLoadOnMount aborts during cleanup, preventing an older slot response from replacing a newer world or mutating state after unmount. Adapter I/O and the persistent schema remain unchanged.
- useManagedEntity disposes failed initialization before throwing the original error, including when cleanup itself fails. Stationary player name/color/model changes now produce a network update; unchanged snapshots remain suppressed and reset permits a fresh snapshot.
- Automation retry counts are engine-local rather than stored in caller action.data. Each action/loop gets a fresh retry budget after completion/exhaustion; pause/resume preserves the current budget. Caller payload is untouched.
- Save/managed regression tests: 5 suites / 58 tests. Interaction/network tests: 27 suites / 364 tests. Memory: 5 suites / 88 tests. Public API/exports: 2 suites / 24 tests. Build/root TypeScript, production lint, declarations and diff check passed. Browser/package/demo builds were not run for this slice; renderer migration, runtime ownership and the full UI audit remain active.
- Final full Jest: 222 suites / 2001 tests passed, 1 suite/test skipped (48.101s). The save-load-cancellation slice is completed; the overall modernization objective remains active.

## Project panel and mobile editor cleanup (2026-09-05)

- Korean project category/search/filter/status/card labels and remaining floor categories. IDs and source records are unchanged. Asset kind filtering now applies only to the assets group, preserving the filter while switching to scenes/materials/prefabs.
- Category controls expose pressed state; the editor navigation has an accessible name. Mobile editor navigation scrolls horizontally, its action row no longer stretches the play button, and a darker sidebar improves contrast over the world.
- Actual Chromium /creator at 1440x900 and 390x844: search, group switch, retained filter and focus-scrolling to the last panel button passed; page errors 0. Mobile project group moved from y418 to y367 (51px recovered). Viewed final screenshots in the system temp directory: gaesup-project-panel-{desktop,mobile}.png. An earlier loading-only desktop screenshot was discarded.
- Relevant tests passed: project/floor 2 suites / 27 tests; layout/project/HUD 4 suites / 21 tests. Updated one stale English test locator after its initial failure. Build/root types, changed production ESLint, diff check and test:demo passed. Existing large vendor chunks and mixed admin imports still warn. Full Jest/package consumer were not repeated; broader UI audit and renderer migration remain active.

## NPC brain editor implementation and labels (2026-09-05)

- Compared the 2,107-line NPC brain sections in sections.tsx and brain/index.tsx and confirmed exact equality after newline normalization. The former now re-exports the latter, preserving its imports while removing 2,123 duplicate body/import lines. Persistent state and commands are unchanged.
- Korean default mode/action/condition/status/target/branch labels now cover preview, node titles/descriptions, clone text, graph edges and graph control accessibility names. User-provided labels/dialogue remain intact.
- Missing-branch repair now reads graph edges directly instead of parsing display warnings. A mounted inspector regression verifies true/false branch creation under Korean warnings and preservation of the source blueprint.
- Editor/NPC 20 suites / 85 tests, API/exports 2 suites / 24 tests, build/root TypeScript, changed production ESLint, diff check and demo build passed. Initial post-extraction import type errors were corrected. No browser/full-Jest/package-consumer rerun in this slice, and no FPS/bundle-size improvement claim. Renderer migration and remaining UI/runtime audits remain active.

## Review follow-up: reconnect snapshots and custom tile identity (2026-09-05)

- Confirmed with the real position tracker that an initial connection emitted one update but automatic reconnect and a direct room switch emitted none for a stationary body. Each successful connection now resets the tracker. The hook regression uses the real tracker and covers automatic reconnect, room changes and manual reconnect.
- Custom tile IDs now encode the complete name/color/texture tuple instead of stripping Korean text and truncating at 48 characters. Korean names and URLs with long shared prefixes remain distinct; identical drafts reuse their new ID. Existing saved IDs are not rewritten. Previously collapsed records cannot be reconstructed by this change.
- Building state remains owned by its existing store; network snapshots remain owned by the existing tracker. No public API or save schema change. Added real store regressions for distinct names, URL identity, save/load and legacy IDs.
- Network/building tests: 47 suites and 478 tests passed, one suite/test skipped. Build TypeScript, production ESLint and diff check passed. Test files are excluded by the repository ESLint configuration. Browser, full Jest, demo/package builds and native WebGPU were not run in this slice. The broader UI and renderer goal remains active.

## R3F 10 actual browser renderer ownership probe (2026-09-05)

- The reusable browser probe now runs three scene lifetimes with actual WebGPURenderer and Rapier. Fixture ownership releases the renderer in Fiber's root-unmount callback; three creations/disposals, repeated-release idempotence, physics pause/resume/removal and stopped frame callbacks passed. Main runtime ownership has not been migrated.
- Actual backend was WebGL2 fallback. The --require-webgpu gate rejected it with exit 1, so native WebGPU remains unverified. Initial per-frame draw-call readiness timed out; cumulative render calls and a viewed rendered screenshot supplied the corrected readiness evidence.
- Each live cycle reported identical Three memory counters (6,487,063 bytes; 3 geometries, 3 textures, 4 programs). All counters became zero after disposal, but Three resets these counters itself, so this is not physical GPU leak proof. Frame intervals and details are recorded in the active renderer plan; no performance improvement claim.
- Syntax/build TypeScript/format/diff checks passed. No main dependency, public API, canonical state or compatibility change. Browser/server created by the probe were closed; existing development server was preserved. Full Jest, production package/demo rebuilds and native GPU validation were not run.

## Multiplayer entry form (2026-09-05)

- ConnectionForm uses scoped CSS, a viewport-constrained card, readable Korean guidance, associated input labels, visible focus and an announced error. The random initial player color can now be changed with a native color input.
- Submission trims both room and player name and rejects blank rooms and submissions while connecting. Existing props, default room code and network payload shape remain intact. Local form state remains the source of truth; no persistent state migration.
- Added behavior tests for actual labelled inputs, selected color, whitespace room rejection, busy submission and recovery after an error. Network 19 suites / 225 tests, build TypeScript, component ESLint, formatting and test:demo passed. Demo still reports existing large vendor chunks and mixed static/dynamic admin imports.
- Mobile/desktop browser appearance, actual server connection, full Jest and package consumer were not rerun in this slice. Responsive CSS is implemented but visual correctness is not yet browser-verified. Renderer migration and the broader UI audit remain active.

## Administrator route loading boundary (2026-09-05)

- App now lazily imports AdminTest and a dedicated AdminPage that composes the existing authenticated administrator shell with the editable world. Navigation still subscribes to the existing auth store, URLs and login behavior remain unchanged, and no public API or canonical state changed.
- The demo verifier now emits a manifest, walks initial static imports, and rejects eager administrator route entries or a shared administrator UI chunk in that graph. Actual build passes: shared administrator UI is 1,597 JS bytes outside initial imports. The previous mixed static/dynamic admin-entry import warning disappeared. Shared vendor costs and packageSurface's post-mount work remain, so this is not an overall page-load/FPS improvement measurement.
- Build/root TypeScript, changed-file ESLint and demo manifest verification passed. Existing oversized vendor warnings remain. Browser login/navigation, full Jest and package consumer were not rerun; follow-up runtime and native WebGPU verification remain active.

## On-demand package diagnostics (2026-09-05)

- Removed AppLayout's unconditional post-mount packageSurface import and discarded runtime creation. The developer catalog now exposes a Korean package-check button; only that action loads the module, creates its sample objects and disposes the returned runtime. Success/failure is visible and failed checks can be retried. Shared styles remain imported by examples/style.css.
- No package export, persistent source of truth or route changed. The existing factory remains available; its former invisible startup call is now a deliberate developer action. No claim is made that shared engine/vendor imports or their loading costs have been removed.
- Mounted catalog behavior plus package-consumption guards: 2 suites / 18 tests passed. The initial consumer guard failed on jest-dom matcher types in the new test; native DOM assertions resolved it. Memory suite 5 suites / 88 tests, build/root TypeScript, changed production ESLint, demo chunk verification and diff check passed. Full Jest, browser timing/UI and package consumer builds were not rerun.

## Browser follow-up: multiplayer, catalog and administrator (2026-09-05)

- Actual Chromium on existing 5173 server, isolated browser profile: labelled connection inputs, blank-room disable, valid-room enable and color selection passed. At widths 320/390/1440, no horizontal page/form overflow. A viewed 320px screenshot exposed the heading under navigation despite the earlier width-only check.
- ConnectionForm.css now uses the shell header-height variable (with standalone fallback) and a scrollable viewport-height container. Recheck confirms the form starts below navigation and actual wheel scrolling exposes the submit button at 320x568. Screenshots in the system temp directory: gaesup-connection-{320,390,1440}.png and gaesup-connection-320-scrolled.png. A strict 100% viewport assertion initially failed at 99.57% due to boundary clipping; the final check uses real scrolling and 99% visibility, with the final screenshot viewed.
- Developer catalog starts with an empty result, then the package-check button succeeds with the real module. AdminTest's actual demo login succeeds, navigation logout returns home, and /admin shows its login gate afterward. Page errors: 0. Viewed gaesup-catalog-check.png and gaesup-admin-gate.png. No external credentials or multiplayer server were used.
- Build TypeScript and diff check passed. This follow-up changes only connection-form layout; routes, public API, state ownership and saved data are unchanged. Full Jest/package/demo rebuilds, real multiplayer server connectivity and native WebGPU remain unverified in this slice.

## Cross-domain regression checkpoint (2026-09-05)

- Full Jest after the reconnect/custom-tile fixes, UI extraction, administrator lazy routing and package diagnostics changes: 226 suites / 2,011 tests passed; one suite/test skipped. No failing test in that run.
- Subsequently, MinimalExamplePage's custom camera renderer was found to expose raw control IDs. It now reads the existing public CAMERA_CONTROLLER_DEFAULT_MODES labels; the displayed project-name typo was also corrected. No new label source, public API or persistent state change.
- After that display-only edit, camera controller/settings 4 suites / 12 tests, build/root TypeScript, component ESLint and formatting passed. Full Jest was not repeated for the label-only edit. Browser camera display and production package rebuild were not run in this slice.
- The checkpoint does not complete the modernization goal: main R3F 10/Drei 11 packaging and ownership, native WebGPU execution, remaining UI scenarios and multi-runtime automation ownership remain open.

## Borrowed interaction engine ownership (2026-09-05)

- Reproduced two failures: disposing one bridge disposed an InteractionSystem shared with another bridge, and disposing a bridge cancelled a caller-supplied AutomationSystem's running wait. Bridge disposal now retains borrowed input/automation systems and disposes only its directly created automation engine plus its own subscriptions/timers. disposeGlobal explicitly disposes default automation, preserving store projection reset/recreation.
- Added tests for surviving shared keyboard listeners, retained external automation execution, and disposal of locally created automation. External callers supplying engines must now dispose them explicitly; this is an intentional ownership contract correction. Persistent state and canonical automation queue remain unchanged. Explicit reset still resets connected engines as before.
- Initial regression tests failed as expected; after the fix, interactions/API/export 12 suites / 167 tests and memory 5 suites / 88 tests passed. Full Jest: 227 suites / 2,013 tests passed, one suite/test skipped. Build TypeScript, changed production ESLint, build:types and diff check passed.
- Simultaneous movement authority across shared bridges, browser loop execution, renderer migration, native GPU and remaining UI audits remain active. Demo/package consumer and browser tests were not rerun for this slice.

## Independent automation loop integration (2026-09-05)

- Added real-system integration coverage for two independent input/automation/bridge pairs. Pausing/resuming and disposing A does not stop B; B records two arrivals, re-enters its movement loop and leaves zero timers when stopped. This closes the independent-instance pause/dispose concern at engine level, not the shared-input arbitration or browser physics concerns.
- Only the ownership integration test and audit records changed. Production API, source of truth and compatibility are unchanged. Build TypeScript and interactions 10 suites / 144 tests passed. Full Jest, browser and package builds were not repeated for this test-only extension.

## Multiplayer panel browser verification (2026-09-05)

### Blueprint registry import cleanup

#### Existing component registration preservation

##### Blueprint entity cleanup follow-up

- Reproduced leaked initialized components after a later initializer throws, and skipped cleanup of later components when the first disposer throws. BlueprintEntity now rolls back construction, disposes a failed added component, detaches removed components before disposal, and clears its owned list before attempting every disposer.
- Original initialization errors are preserved after cleanup attempts. Explicit dispose failures are now AggregateError containing the underlying failures; repeated disposal does not call failed disposers again. Public method signatures and persistent state remain unchanged.
- Blueprint 6 suites / 9 tests, memory 5 suites / 88 tests, build TypeScript and production lint passed. Full-suite, package and browser checks were not repeated for this cleanup slice.

- Follow-up: registerDefaultComponents itself also overwrote custom implementations on each call. Its registration now fills missing types only, and BlueprintFactory delegates to it instead of retaining a separate no-op default path. Factory-first creation therefore uses the existing real movement/animation implementations. Explicit overrides remain supported; stats/behavior placeholders remain incomplete. The active blueprint-registration plan records this behavior correction and pending browser validation.
- After this follow-up, blueprint/motions 136 tests, full Jest 229 suites / 2,026 tests (one suite/test skipped), build TypeScript, production lint and diff check passed. Browser behavior and rebuilt package consumer were not run for this registration boundary change.

- The missing-component audit found a separate regression: first BlueprintFactory initialization overwrote registered real CharacterMovement/CharacterAnimation implementations and custom factories with no-op defaults. A regression test failed before the fix. Initialization now fills only absent factories; explicit registerComponentFactory replacement is unchanged. Seven duplicated fallback registrations share one loop.
- Blueprint 3 suites / 5 tests, build TypeScript, production lint and diff check passed. This preserves ComponentRegistry as the source of truth and changes no public signature or save schema. Default CharacterStats/CharacterBehavior remain placeholders; their gameplay semantics are not implemented by this correction. Full-suite, package and browser validation were not repeated for this local registration change.

- BlueprintFactory now uses the same static registry import as the public blueprint entry and hooks; the ineffective dynamic-import warning disappeared from rebuilt ESM/CJS output. createFromId still returns a Promise and missing IDs still return null; registry lookup/entity construction now occur in the async function body without waiting for a dynamic import. Missing-ID diagnostics use the project logger.
- Blueprint tests (2 suites / 4 tests), build TypeScript and production lint passed. Direct imports of rebuilt ESM and CJS entries both created char_warrior_basic by ID and disposed the result successfully.
- The runtime smoke printed existing missing-factory diagnostics for CharacterStats and CharacterBehavior. It proves entity creation/disposal, not implementation of those components. Full package consumer and demo were not rerun after this import-only change; they passed at the preceding checkpoint. Large Three/physics chunks remain.

### Package and demo checkpoint after the culling controls

- Rebuilt ESM/CJS/declarations and ran test:package successfully after the shared-input, save callback, tracking, panel and CPU culling changes. The packed consumer passed ESM/CJS strict type checks, optional-property compatibility checks, runtime import/require and Vite build. No publish occurred.
- test:demo passed; administrator UI remains outside the initial import closure (1,597 JS bytes). The existing 5173 dev server (PID 6980) was retained. No source or protocol changes were made for this verification checkpoint.
- Remaining warnings: BlueprintFactory dynamically imports a registry also imported statically; Three/physics and the broad package-consumer entry exceed the chunk-size advisory. These are not reported as corrected or as performance improvements.
- This checkpoint verifies the installed stable stack. It does not close the R3F10/Drei11 transition, native WebGPU gate, untested UI scenarios or browser physics-loop audits.

### CPU culling precision regression

- NextCorePage compared Float32 cached matrix values against Three's unrounded number values. The stationary-camera regression executed culling 120 times in 120 frames. A Float64 comparison cache reduces that to one cull and one instance attribute version increment; moving the camera triggers a second update. GPU matrix data remains Float32, with 64 extra persistent bytes and no new frame allocations. No FPS or actual GPU-transfer claim is made.
- CPU/GPU lifetime 20 tests, build/root TypeScript, production lint and diff check passed. Browser performance and native GPU were not run for this change. Renderer modernization remains active.

### Tracking configuration identity follow-up

- Reproduced six position sends for a stationary player across the initial sample and five equivalent config rerenders. useMultiplayer now depends on tracking scalar values and updates the existing tracker instead of replacing it. The same scenario sends once; threshold changes preserve history and equivalent rerenders preserve a runtime 2Hz override.
- Reconnect still explicitly resets the tracker. Public API, persistent state and network protocol are unchanged. Network 19 suites / 228 tests, build TypeScript and production ESLint passed. This is deterministic call-count evidence, not an FPS or real-server bandwidth measurement. Full Jest and browser probes were not repeated for this hook-only follow-up.

- PlayerInfoOverlay now places diagnostics behind native details controls, uses the example header-height variable, bounds its width/height to the viewport and wraps long player names. Chat has a Korean accessible name and placeholder, a 200-character limit and an isComposing guard. Public API and persistence are unchanged.
- scripts/probe-multiplayer-panel.cjs reuses the existing server at 127.0.0.1:5173 and intercepts only the multiplayer WebSocket in an isolated Chromium page. No live multiplayer server or other users receive its synthetic chat. It verifies the actual route and Canvas composition with a long remote name.
- Passed at 390x844 (panel x10/y134/w320/h323.28), 320x568 (x10/y134/w300/h323.28), and 1440x900 (x10/y74/w320/h323.28). Menu separation, viewport bounds, diagnostic disclosure, send/disconnect controls and pageerror=0 passed. The 320px screenshot was visually inspected; screenshots are in the system temp folder as gaesup-player-panel-{width}.png.
- Synthetic composing Enter retained the draft without sending; normal Enter sent once through the intercepted socket and disconnect restored the form. This does not prove OS-native IME behavior or real-server connectivity. Previous production validation: network 227 tests, build/root TypeScript and production lint passed.
- This browser verification leaves renderer migration, native GPU validation and other pending UI/runtime audits active.

## Shared movement ownership (2026-09-05)

- Reproduced simultaneous ownership when two bridges request the same target on one input. The latest movement request now takes transient ownership keyed by MouseState; the previous distinct automation engine is stopped without disabling the new input. Arrival, cancellation and disposal release ownership. Persistent state and public signatures are unchanged.
- Added real-engine coverage for equal/different targets, old bridge disposal, new-owner arrival, reentrant movement from a cancellation listener and projection transfer between bridges sharing one automation engine. The shared engine is retained rather than stopped.
- Full Jest passed 227 suites / 2,022 tests with one suite/test skipped. That run started before the final shared-engine refinement; final interactions 10 suites / 148 tests, build TypeScript and production ESLint were rerun successfully after it. Memory 5 suites / 88 tests passed. Native GPU, browser physics loops and package/demo rebuilds were not run in this slice.
- The modernization goal remains active: renderer migration, native GPU evidence, remaining product UI audits and actual browser multi-input/loop behavior are not proven complete.

## Blueprint spawner execution and cleanup (2026-09-05)

- Reproduced missing frame updates and leaked entities completing after unmount or blueprint replacement. BlueprintSpawner now advances its current entity with the R3F delta, detaches ownership before cleanup, and disposes stale asynchronous results without publishing spawn/destroy callbacks. Callback replacements do not recreate entities. Creation failures are handled by the project logger.
- React DOM tests exercise real BlueprintEntity/component lifetime with mocked R3F scheduling and deferred factory results: live frame update, unmount, reverse completion order, latest destroy callback, and StrictMode effect replay. Blueprint 7 suites / 14 tests, memory 5 suites / 88 tests, build TypeScript and production ESLint passed. No persistent source of truth or public signature changes; the spawner now owns its entity frame updates.
- Browser physics, input bridging, grounded/jump animation behavior and package/demo rebuilds were not validated here. Registration and modernization plans remain active.

## World readiness callback lifetime (2026-09-05)

- Reproduced two runtime initializations when replacing a pending ready callback or using an inline callback that updates parent state. WorldSystems now reads the latest committed callback from a ref; only runtime identity controls its lifecycle effect. Existing per-SaveSystem operation ordering, cancellation and autosave readiness gates remain intact.
- World lifecycle/runtime 2 suites / 12 tests passed, including latest callback notification, ready-state callback replacement without disposal, parent state updates, and same-SaveSystem runtime replacement ordering. Memory 5 suites / 88 tests, build/root TypeScript, production ESLint and diff check passed. Public API and persistent state ownership are unchanged. Browser, package/demo and full Jest were not rerun for this slice.

## Blueprint UI browser audit (2026-09-05)

- The actual /blueprints route exposed a mobile overlap: at 390px, navigation ended at y157.19 while the search input began at y136. Navigation now measures its bottom on resize/content-size changes and owns the shell's transient header-height override, restoring it and disconnecting its observer/listener on cleanup. Search now begins at y178 on 320/390px and y92 on 1440px. Preview controls use wrapping document flow instead of absolute positioning over the stats.
- scripts/probe-blueprint-ui.cjs reuses the existing dev server and checks Korean/legacy tag searches, real Tab/Enter/Space selection, header/search bounds and preview text separation at 320/390/1440px. Page errors: zero. The 390px, 1440px and scrolled mobile preview screenshots in the temp directory were visually inspected. No publish or server restart occurred.
- The multiplayer probe initially measured during a transient hidden state; network-idle waiting also timed out. It now polls the actual panel bounds. Final multiplayer 320/390/1440px checks, synthetic IME/chat/disconnect and pageerror=0 passed. Blueprint/config/HUD 9 suites / 21 tests, memory 5 suites / 88 tests, build/root TypeScript and production lint passed. Persistent state and public APIs are unchanged. Broader UI and renderer modernization remain incomplete.

## Multiplayer configuration application (2026-09-05)

- Reproduced updateConfig websocket/ACK/retry/logging changes being ignored by the next connect. The hook now retains explicit overrides separately from declarative defaults and merges them when constructing the next manager. Equivalent rerenders preserve overrides; updating settings alone does not reconnect. Explicit connection overrides persist until replaced through updateConfig. Changed tracking props retain the previous precedence over imperative tracking settings, keeping tracker and subsequent manager send limits consistent.
- Chat range now follows current props when no imperative override exists; per-message range wins over the override, and zero is preserved. Network 19 suites / 229 tests passed; the subsequently expanded hook regression suite passed all 8 tests. Build TypeScript, production lint and diff check passed. No network protocol, persistent state or public signature changes. Real-server and browser configuration switching were not exercised.

## Modernization integration checkpoint (2026-09-05)

- After spawner ownership/frame updates, world readiness callback stabilization, dynamic navigation sizing, blueprint labels/array editing/draft protection and multiplayer configuration changes, full Jest passed 233 suites / 2,042 tests; one suite/test was skipped. Full output: system temp gaesup-modernization-jest.log.
- test:package rebuilt ESM/CJS and declarations and passed the packed consumer checks. test:demo passed and administrator UI remains deferred from initial imports (1,597 JS bytes). Logs: system temp gaesup-modernization-package.log and gaesup-modernization-demo.log. This was build/verification only; no publish or development-server restart occurred.
- Remaining warnings include chunks over 500kB and upstream THREE.Clock/react-test-renderer deprecations. The broad package consumer entry remains approximately 4,321kB minified; no bundle-size improvement is claimed by this checkpoint. Native WebGPU, R3F10/Drei11 migration, the remaining UI audits and browser checks for the newest array/draft changes are not complete.

## Remote player render allocations (2026-09-05)

- Reproduced 533 Vector3 constructions for one mounted RemotePlayer followed by 40 network-state rerenders (13 initial plus 520 discarded replacements). Its vectors, quaternions and kinematic write objects now belong to one lazy per-instance scratch allocation. Interpolation math, thresholds, wire format and persistent state are unchanged.
- Constructor-count regression now stays at the initial allocation count. The same test executes 40 interpolation frames and confirms 41 kinematic translation writes including initialization, with the final position advancing smoothly between its initial position and target. Real Three math is used behind counted constructor wrappers; React scene and Rapier host objects are mocked. This is allocation/call-count evidence, not browser FPS or GPU-memory evidence.
- Network 19 suites / 231 tests, memory 5 suites / 88 tests, build TypeScript, production ESLint and diff check passed. The first instrumentation attempt could not spy on immutable module exports; counted module wrappers resolved that before reproducing the actual allocation failure. Browser and package/demo builds were not repeated after this change.

## Remote player tint ownership (2026-09-05)

- Fixed the review's failing material regression: tint effects now retain each mesh's original material assignment, share one owned clone per source material, restore assignments before disposal, and clean up partial traversal failures. Color changes start from restored source materials; clearing color and unmounting restore original material and array references. Borrowed source materials remain undisposed.
- Regression covers red-to-green recoloring, clearing tint, blue tint followed by unmount, clone sharing and exactly-once owned disposal using real Three materials with mocked React scene/Rapier hosts. Network 19 suites / 232 tests and memory 5 suites / 88 tests passed. Build TypeScript, production ESLint and scoped diff check passed. Test files are excluded by the repository ESLint configuration.
- The expanded regression initially compared against the loader scene's array rather than the cloned mesh's original array; corrected the captured reference. Build checking also caught an over-narrow inferred clone type; explicit Material typing fixed it. Persistent source of truth, wire protocol and public API are unchanged. Browser/GPU, full-suite and package/demo verification were not repeated. LOD elapsed-time handling, blueprint input/grounding, broader example UX and renderer modernization remain open.

## Remote player LOD elapsed time (2026-09-05)

- Fixed distance-throttled position/rotation interpolation discarding skipped frame time. The update now consumes the full accumulated interval for damping, exponential rotation smoothing and long-gap snapping, then resets the accumulator. Distance thresholds, prediction and wire/persistent contracts remain unchanged.
- Added 64/128 FPS comparisons using real Three math with mocked React/Rapier hosts. Before the fix, the 128 FPS near/far position difference after half a second was 3.6944 world units. Both regressions now keep the position difference below 0.05 and angular difference below 0.001 radians while the far body still receives only four updates. A subsequent 300ms stall snaps to the target. These are deterministic interpolation checks, not browser FPS measurements.
- Network 19 suites / 234 tests, build TypeScript, production ESLint and scoped diff check passed. No resource ownership changed in this slice; memory tests were not repeated. Browser/native GPU and full package/demo verification remain unrun for this change. Blueprint input/grounding/animation integration and the remaining example UX and renderer migration are still open.

## Blueprint spawn physics projection (2026-09-05)

- Reproduced the warrior blueprint's mass 80 being passed to RigidBody as 1. BlueprintSpawner now resolves ID-based physics through the existing registry, preserves explicit blueprint precedence, and applies configured mass for characters, vehicles and airplanes. Rotation enablement is explicit in both directions so switching from a character to a vehicle/airplane releases character locks.
- Extracted the repeated physics defaults into factory/physics.ts, shared by BlueprintConverter and BlueprintSpawner. Blueprint definitions remain the configuration source; no persistent state, public exports or method signatures changed. Existing async entity creation/cancellation and callback ownership remain covered.
- Blueprint 7 suites / 17 tests, build TypeScript, production ESLint and scoped diff check passed. Regression checks RigidBody props for warrior 80, ID/direct kart 275 and ID airplane 720, friction/damping and rotation transitions. It uses mocked Rapier hosts; actual collider mass, browser controls and flight were not verified. The first failing matcher attempted to print React internal props; assertions were narrowed to scalar physics props before reproducing the mass mismatch.
- Input follow-up investigation confirmed BlueprintPreview currently uses GaesupController, not BlueprintSpawner. Connecting every spawned entity to default input would create shared-control ownership problems. Explicit controlled-entity input and grounded-state integration remain unfinished, as do the broader example UX and renderer migration. Full/package/demo and memory tests were not repeated for this configuration-only slice.

## Blueprint preview selection and model ownership (2026-09-05)

- BlueprintPreview previously mounted a character controller for vehicle/other selections while retaining the previous character URL. It now mounts the interactive canvas only for character blueprints with a nonblank legacy model or body-part URL. Unsupported types, missing models and empty selection show Korean status text; they do not initialize a canvas or keyboard/world-setting effects. This does not implement vehicle preview or vehicle driving.
- Model selection resolves/trims a single URL for both validation and loading. On model change/unmount, the preview restores the previous world character URL (empty when unset) only while its own URL remains current. A newer external URL is preserved. Camera/mode sharing still requires further isolation.
- Blueprint 8 suites / 20 tests, memory 5 suites / 88 tests, build TypeScript, production ESLint and scoped diff check passed. Tests cover unsupported/missing/empty states, character-to-kart canvas removal, URL restoration and external-update preservation with mocked canvas/store. Type checking caught the optional previous URL; normalization to the store's empty-string convention resolved it.
- Browser layout/GPU, full suite and package/demo checks were not repeated. The broader localization/menu audit, controlled blueprint input/grounding, camera/mode isolation and renderer migration remain incomplete.

## Blueprint preview camera/mode restoration (2026-09-05)

- Reproduced preview cleanup leaving the global mode as character and retaining preview camera options. The configuration effect now retains only the prior/applied mode and camera slices and restores fields that still match its writes. External edits to other fields survive, and preview-only optional camera keys are removed through the existing replaceCameraOption path.
- Regression covers original mode/camera restoration, external control/FOV edits, optional-key removal, StrictMode setup/cleanup and blueprint replacement before close. Capturing slice references rather than the entire mock store also avoids retaining an unrelated full-store snapshot in production.
- Blueprint 8 suites / 23 tests, memory 5 suites / 88 tests, build TypeScript, production ESLint and scoped diff check passed. The tests use mocked store actions and canvas; browser camera/input behavior and multiple simultaneous previews were not verified. Persistent state, public APIs and the canonical global store are unchanged. This is guarded restoration, not complete per-canvas store/input isolation. Full suite/package/demo checks were not repeated; broader UI, input ownership and renderer modernization remain open.

## Post-review integration checkpoint (2026-09-05)

- Verified the combined remote-player tint/LOD changes, blueprint physics projection, unsupported-preview handling and guarded model/camera/mode restoration. Root TypeScript including examples passed. Full Jest passed 234 suites / 2,053 tests in 63.208s; one suite/test remains skipped. Log: system temp gaesup-integration-review-jest.log.
- test:package rebuilt the library and declarations and passed the packed consumer verification. Its broad consumer bundle was 4,320.69kB minified / 1,451.37kB gzip, so no material size improvement is claimed. test:demo passed with administrator UI deferred at 1,597 JS bytes. Logs: gaesup-integration-review-package.log and gaesup-integration-review-demo.log in system temp. All three commands exited zero; PowerShell wraps native stderr warnings as NativeCommandError in the redirected log, including the existing >500kB chunk warning.
- This checkpoint changes no production source, canonical state or public API and does not publish or restart the existing development server. Actual browser verification of the newest preview transitions, native GPU, main R3F10/Drei11 adoption, blueprint input/grounding/animation and the remaining example UX audit are still incomplete. Keep the overall modernization goal active.

## Blueprint UI follow-up browser audit (2026-09-05)

- Extended scripts/probe-blueprint-ui.cjs against the existing 127.0.0.1:5173 server (PID 6980). Real Chromium verifies Korean/legacy tag search, Tab/Enter/Space selection, dirty-name navigation protection and cancellation, editing/cancelling the second attack array entry, vehicle category selection, unsupported-preview status with zero canvases and return to a character canvas. Page errors: zero.
- Navigation/search separation passed at 320/390/1440px. Viewed mobile and desktop unsupported-preview screenshots and fixed Korean words breaking mid-word using keep-all with anywhere overflow fallback. Final computed-style assertion and screenshot confirm the change. Screenshots: system temp gaesup-blueprints-kart-{390,1440}.png. The original script attempt omitted switching to the vehicle category and timed out; the sidebar accessibility snapshot identified the correct category buttons. A stale served stylesheet was observed and refreshed by rewriting the same source content; the final run asserts the actual CSS value.
- Final browser probe, build TypeScript, Node syntax and scoped diff check passed. Only preview CSS, browser verification script and this record changed; canonical state and public API are unchanged. No publish or dev-server restart. This verifies DOM editing/canvas mount transitions, not live camera restoration, avatar motion or native GPU behavior. Full Jest/package/demo were not repeated after this CSS-only adjustment. Overall UI/renderer modernization remains active.

## Blueprint animation missing-clip handling (2026-09-05)

- Reproduced missing jump transitions stopping the active idle action, and string-array idle/run definitions registering zero actions. CharacterAnimationComponent now resolves the first loaded clip in ordered string candidates and checks the target action before stopping playback. Existing string mappings and transition thresholds remain unchanged.
- Real Three AnimationMixer/keyframe tests verify continued idle track progress through unavailable jump/walk transitions and switching to the available run action for both string and array definitions. Blueprint 8 suites / 25 tests, memory 5 suites / 88 tests, build TypeScript, production ESLint and scoped diff check passed.
- No public signatures, persistent source of truth or asset-loading path changed. Structured jump start/loop/land, production population of the legacy animation map and grounded input remain unfinished. This prevents missing-clip freezes; it does not complete blueprint gameplay animation. Browser/full/package/demo checks were not repeated.

## Blueprint spawn failure feedback (2026-09-05)

- BlueprintEditor now reports a Korean role=alert message when spawnAtCursor returns null or rejects. It keeps the editor and edited values available for retry, clears the failure on retry/selection and closes only after a successful result. Unexpected exceptions use the project logger. Existing apply-before-spawn registry behavior is preserved.
- Reproduced missing failure feedback and an unhandled rejection before the fix. Tests cover null/rejected results, edited health retention and successful retry with the alert cleared. Blueprint 8 suites / 27 tests, build TypeScript, production ESLint and scoped diff check passed.
- Changed editor implementation/styles/tests only; persistent state and public contracts are unchanged. Actual browser failure layout and real world creation were not verified, and full/package/demo/memory tests were not repeated for this UI slice. Broader localization, spawn/input integration and renderer modernization remain open.

## Blueprint preview/spawn model resolution (2026-09-05)

- Reproduced the default warrior's body-part model being previewable but serialized to empty characterUrl during useSpawnFromBlueprint. Internal model.ts now supplies the same resolver to preview and world-object/controller creation: nonblank legacy visuals.model, then nonblank body part, then metadata.modelUrl; URLs are trimmed. Vehicle/airplane metadata fallback remains unchanged in shape. Other body parts are not newly assembled by spawning.
- Hook tests inspect the actual outgoing WorldBridge object metadata and controller URL setter with mocked bridge/store. They cover default body parts, explicit model precedence, whitespace, metadata fallback and empty URLs. Blueprint 9 suites / 32 tests, build TypeScript, production ESLint and scoped diff check passed. Initial checks caught indexed metadata access and import ordering; both were corrected before the passing checks.
- Replaced console.error in the touched hook with the project logger. No public exports/signatures or canonical persistent write path changed; existing blueprint configuration now resolves consistently at both consumers. Actual world rendering/spawn success, browser transitions, full suite/package/demo and memory tests were not repeated for this resolution-only slice. Input/grounding, complete model assembly and renderer modernization remain open.

## Blueprint spawn target readiness (2026-09-05)

- Found that AbstractBridge.execute silently returns when the target engine is absent, while WorldBridge.addObject still returns an ID. The spawn hook previously treated that as success and changed controller mode/model. It now checks the existing default world engine before allocating or dispatching the object and returns null without controller changes when the world is not registered. It does not create an unowned world automatically or alter the bridge's public behavior.
- The missing-engine regression failed with a fabricated successful entity before the fix. Blueprint/world 14 suites / 98 tests passed, followed by a new real-WorldBridge/store integration test: unregistered spawn fails without state mutation; after explicit registration, retry retains an object at [3,2,1] with the warrior body model. The integration test disposes its owned bridge and restores its store state. Build/root TypeScript, production ESLint and scoped diff check passed.
- Existing canonical WorldBridge writes, public signatures and save formats remain unchanged. These checks verify engine insertion, not a rendered or persisted playable entity. Actual example runtime ownership, browser spawning, full/package/demo and GPU verification remain open; the broader modernization goal is still active.

## Performance mode measurement isolation (2026-09-05)

- Reproduced the performance overlay retaining GPU's 100,000-object statistics immediately after switching to CPU mode. Each mode now gets its own statistics ref initialized with the correct object count, and the overlay remounts for a mode change so the previous backend/FPS/time values cannot be displayed under the new mode label. Camera-control rerenders within one mode retain the ref and scene.
- GPU lifetime/CPU culling 2 suites / 21 tests, memory 5 suites / 88 tests, build/root TypeScript, production ESLint and scoped diff check passed. The new test switches GPU→CPU→GPU while GPU initialization is pending and asserts immediate count/backend reset without waiting for the 250ms refresh timer. Existing cleanup and unchanged-camera upload tests remain green.
- Changed only the example page and its regression test; persistent state/public APIs are unchanged. Browser/native GPU, full suite and package/demo builds were not repeated. This fixes measurement attribution, not rendering throughput or a like-for-like CPU/GPU benchmark. Broader UI and renderer modernization remain active.

## Repeatable performance scenes (2026-09-05)

- CPU/GPU scatter generation now shares one local fixed-seed generator instead of consuming global Math.random. Each remount starts the same scene for a given mode; counts, field dimensions, culling and frame hot paths are unchanged. The overlay explains in Korean that placement is fixed and the two modes differ in object count and measurement scope.
- Reproduced different coordinate buffers across benchmark remounts before the change. The new regression compares all 30,000 CPU coordinate values across two mounts and confirms a nonempty layout. Performance 2 suites / 22 tests passed before the subsequent static explanatory paragraph; build/root TypeScript, production ESLint and scoped diff check passed on the final source.
- Only the performance example/test changed; no persistent state/public API changes. This improves reproducibility, not measured FPS. Native GPU coordinates, browser layout of the new paragraph, memory/full/package/demo checks were not repeated. The broader modernization goal remains active.

## GPU benchmark camera control (2026-09-05)

- Exposed the existing Korean camera-auto-rotation checkbox in GPU mode and wired the animation loop through a live ref. Toggling changes camera motion without rerunning asynchronous GPU setup; frame timestamps continue advancing while rotation is paused so resume does not accumulate the paused interval. CPU control behavior is preserved.
- Added a regression with a deterministic clock and mock GPU camera that advances, pauses, resumes and verifies one backend/culling/loop initialization plus exactly-once final disposal. Performance 2 suites / 23 tests, memory 5 suites / 88 tests, build/root TypeScript, production ESLint and scoped diff check passed.
- Only the example page and its test changed; public APIs and persistent state are unchanged. This does not claim native GPU execution or measured speed improvements. Browser control/layout, full suite and package/demo builds were not repeated. Broader renderer migration and example/input integration remain open.

## Visit snapshot isolation (2026-09-05)
- Fixed inbound visit defaults to use DEFAULT_VISIT_DOMAINS, preserving explicit custom allowlists and empty-list rejection. Existing save bindings remain canonical; public signatures and wire format are unchanged. Callers relying on implicit application of custom domains must now pass allowedDomains explicitly.
- Cleared a departing host's cached local snapshot before leave notification, preserving other hosts and preventing replay during reentrant subscriptions.
- Added five regression cases; two failed before fixes. Network/public export checks: 21 suites, 263 tests passed. Build and full TypeScript checks and scoped production ESLint passed. Browser, real transport, full suite and package build were not run in this slice.
- Broad examples and renderer migration remain open; blueprint runtime integration is still pending.


## Blueprint ID hook resolution (2026-09-05)
- Replaced fabricated empty definitions for string IDs with registry lookup and existing factory conversion. Direct definitions keep their original path. Returned entity now updates after effect creation and becomes null on disabling or missing-ID replacement.
- Added real-factory hook tests for registered component/mass application, direct definition compatibility, StrictMode/replacement/disabling ownership, and missing-ID diagnostics with previous entity removal. Three tests failed before implementation. Blueprint/motions 168 tests, focused hook/export 27 tests, memory 88 tests, build/root TypeScript and scoped production lint passed.
- No persistent source-of-truth, public signature or export changes. Browser, full Jest, demo and packed-consumer builds were not run. Blueprint input/grounding/animation and broad examples/renderer work remain incomplete.


## Motion and animation panel labels (2026-09-05)
- Localized remaining motion/animation tab defaults and motion diagnostic labels, booleans, mode names and missing-value display. Tab IDs, custom label overrides and field keys remain unchanged.
- Unmeasured total distance now displays missing information instead of a fabricated zero. Diagnostic rows wrap long values with spacing for narrow panels.
- Motion/editor tests: 29 suites, 167 tests; animation/editor tests after the additional tab update: 14 suites, 56 tests. Build/root TypeScript and scoped production lint passed (root check preceded final label-only change). Scoped diff check passed. No new tests were added for label-only changes; browser layout was not verified in this slice.
- No persistent source-of-truth changes. Broad UI audit, blueprint runtime input and renderer migration remain open.


## Static GPU benchmark culling (2026-09-05)
- NextCorePage now retains GPU visibility results while its static world and owned camera view are unchanged. First frame, resize and advancing automatic rotation invalidate the view; paused frames still render and sample FPS while reporting zero culling submission work.
- Inspected gpuCulledInstances: compute writes persistent visibility storage consumed by the material; no per-render clearing. Extended camera lifetime regression to assert compute counts across pause, resize, unchanged frames and resume, with continued rendering and unchanged resource ownership. Test failed before the fix; performance 2 suites / 23 tests passed afterward. Build/root TypeScript, production ESLint and scoped diff check passed.
- No library API or persistent source-of-truth changes. Native GPU timing/browser/full/package/demo checks were not run; no measured GPU speedup is claimed. Main renderer modernization and broader example integration remain open.


## Integrated verification after visit, blueprint hook and example updates (2026-09-05)
- Full Jest initially found one failure: examplePackageConsumption independently compiles the GPU lifetime test without the DOM matcher augmentation. Added explicit @testing-library/jest-dom import in that test. Focused consumer/GPU checks passed 2 suites / 37 tests; final full rerun passed 237 suites / 2,075 tests with 1 suite / 1 test skipped (51.012s). Root TypeScript and scoped diff check passed.
- test:package passed fresh ESM/CJS/declaration builds and packed-consumer checks. Broad consumer chunk: 4,320.71 kB minified / 1,451.40 kB gzip; existing large-chunk warning remains. test:demo passed; administrator UI deferred from initial imports: 1,597 JS bytes. No bundle reduction or GPU performance claim.
- Logs: TEMP/gaesup-current-full-fixed.log, gaesup-current-package.log, gaesup-current-demo.log and gaesup-consumer-types-fixed.log. No browser or native GPU validation in this checkpoint. Blueprint input/grounding/animation and main renderer migration are still incomplete; overall goal stays active.


## Shared motion state subscription (2026-09-05)
- Reproduced stale rendered values after useStateSystem updates in normal and StrictMode consumers. EntityStateManager mutates stable objects, so those objects cannot serve as changing useSyncExternalStore snapshots. Hook notifications now increment a scalar revision; one subscription replaces two. Shared state objects and non-React physics writes are preserved.
- Removed cleanup that nulled the shared manager reference during StrictMode effect replay. A hook borrows the global manager and only its React subscription is released on unmount. Regression covers multiple consumers, updates, resets, StrictMode replay and continued use after another consumer unmounts.
- Focused motion/camera/hooks: 33 suites / 227 tests; memory: 5 suites / 88 tests; build/root TypeScript, production lint and scoped diff passed. Full suite pending at this point. No persistent model/public signatures changed. Direct manager mutations still do not emit hook notifications; this is not a new per-frame React publishing path.

- Final full Jest result: 238 suites / 2,077 tests passed; 1 suite / 1 test skipped (50.971s). Log: TEMP/gaesup-state-full.log. Browser, package and demo builds were not rerun for this hook slice. Broader examples and renderer modernization remain active.


## Minimap zoom behavior (2026-09-05)
- Fixed useMinimap's ignored initialScale alias and custom minScale/maxScale bounds; initial zoom is clamped. MiniMap already passed those options, so its configured scale now reaches the renderer.
- MinimapSystem invalidates cached drawing when scale changes, including a stationary player. Existing position threshold and unchanged-scale cache remain; no new per-frame allocations introduced.
- Real MiniMap/canvas regression failed before implementation and now verifies initial zoom, custom button/wheel limits, redraw on zoom and no redraw when a limit rejects another zoom. UI 3 suites / 5 tests and final focused test passed; build/root TypeScript, production lint and scoped diff passed. No browser, full/package/demo checks in this slice.
- Public signatures and persistent state unchanged. Shared-singleton multiple-map ownership and broader renderer/examples work remain open.


## Stationary minimap content updates (2026-09-05)
- MinimapSystem invalidates cached drawing when immutable tile-group or scene-object map references change and on marker mutation notifications. Unchanged input retains the existing render cache. Cached map references are cleared by canvas detach/dispose.
- Added canvas regression for unchanged-frame reuse, building addition/removal and marker addition/rename/removal without player movement. Test failed on the first building change before the fix; UI 4 suites / 6 tests and memory 5 suites / 88 tests passed. Build/root TypeScript, production ESLint and scoped diff passed.
- Building stores/marker APIs remain source of truth; no public signatures changed. In-place external map edits are not detected by identity caching. Browser and full/package/demo checks were not rerun. Multiple minimap ownership and broad examples/renderer modernization remain open.


## Reachable diagnostic panels and browser validation (2026-09-05)
- Existing WorldEditorSurface defaults hid animation/motion/performance even on /showcase. ShowcasePage now supplies stable editor options exposing those diagnostic panels on the Developer route; creator defaults remain unchanged.
- Browser verified Korean motion tab/state/missing-distance labels and animation tab navigation. Found remaining English play/pause accessible names and unnamed select; localized/named them. Fixed ap-panel content-box width overflow that clipped right-side playback controls on mobile.
- Added scripts/probe-motion-panels.cjs: existing 5173 server, owned Chromium closed in finally; 390px motion/animation panel navigation, selection/play accessible names and next-button viewport containment, plus 1440px animation tab visibility. Final pageerror list empty. Mobile screenshots inspected before/after overflow fix. TEMP artifacts gaesup-motion-mobile.png, gaesup-animation-mobile.png, gaesup-animation-desktop.png. No actual animation playback/native GPU or minimap browser behavior claim.
- Root/build TypeScript and production lint passed after import-order correction. Animation/editor 14 suites / 56 tests passed after updating existing English accessible-name assertions. Scoped diff passed. Full/package/demo checks not rerun. Fake animation timeline and unwired skip buttons observed and remain follow-up work; overall goal stays active.


## Animation player command controls (2026-09-05)
- Wired previous/next buttons to existing playAnimation commands over the registered list. Unavailable current selection resolves to the first registered entry; zero/one-entry navigation is disabled. Missing bridge snapshots now clear stale playing/list state.
- Removed fabricated 30-percent slider and fixed 1:30 duration plus unused timeline CSS because bridge exposes neither seeking nor clip-duration data. Empty registered list shows Korean status and disabled controls. Existing stop command now uses a stop icon/name instead of claiming pause.
- Added tests for previous/next wraparound, empty state/disabled controls/no fake timing and unavailable-current fallback. Animation/editor 14 suites / 59 tests passed; build/root TypeScript, production lint and scoped diff passed. Public signatures, persistent state and engine command paths unchanged.
- Browser/native playback, full/package/demo checks not rerun. Actual clip registration in showcase and timeline transport support remain incomplete; no full playback implementation claim. Broad examples and renderer goal remains active.


## Animation snapshot freshness (2026-09-05)
- Traced normal model actions through PhysicsEntity/useEntity/useAnimationSetup to the shared AnimationBridge. Editor mode removes the player, so an empty list there alone does not prove a broken loader. Found a separate real stale snapshot issue: same-tick registration/play/stop returned the previous 16ms TTL-cached state.
- Replaced the animation bridge's two TTL caches with reusable snapshots keyed weakly by engine. Values refresh on reads; animation-name arrays rebuild when action count changes. Registration notifications expose each addition/removal immediately. Engine-local snapshots/metrics and unchanged lists remain identical over 20 frame updates.
- Real-engine regression failed before fix and passed afterward. Animation 6 suites / 27 tests, memory 5 suites / 88 tests, build/root TypeScript, production ESLint and scoped diff passed. Fixed an initial private-field name collision with the base bridge before final verification. Full Jest pending at this point.
- Persistent state and public signatures unchanged. Snapshots are reusable live projections, not historical immutable copies. No actual browser/native animation playback or package/demo build this slice. Broad examples and renderer goal remains active.

- Final full Jest: 241 suites / 2,083 tests passed; 1 suite / 1 test skipped (51.263s). Log: TEMP/gaesup-animation-snapshot-full.log.


## Animation speed and crossfade stop (2026-09-05)
- AnimationBridge snapshots report current action timeScale instead of hardcoded 1. Stop commands stop all actions registered to that AnimationSystem, including outgoing crossfade actions, while leaving unrelated actions on the same mixer running.
- Real Three mixer regression first failed on speed=2 reporting 1, then on outgoing walk action still running after stop. Both fixed; current/new action speed, zero active registered actions and unrelated action preservation pass. Existing bridge mocks now include the real state's actions map.
- Animation/motion 27 suites / 164 tests, memory 5 suites / 88 tests, build/root TypeScript, production lint and scoped diff passed. Browser/full/package/demo not rerun. Public command signatures and persistent source of truth unchanged. Full examples/renderer modernization remains open.


## Animation diagnostic sampling (2026-09-05)
- AnimationDebugPanel marks matching bridge notifications dirty and samples at 250ms, instead of allocating state and rendering React for each frame event. Initial snapshot remains immediate; subscriptions and timer are released on unmount.
- Korean playback/type/count/missing labels replace raw booleans and English values. Unsupported frameCount/averageFrameTime/blendDuration fields now show missing data; removed incorrect mappings from action count and accumulated mixer time.
- Reused-snapshot test: 120 notifications cause no immediate reads and one read at the UI interval; mutated speed appears, idle intervals do not read, unsubscribe occurs once and zero timers remain. Animation 7 suites / 29 tests, final focused test, memory 88 tests, build/root TypeScript, production lint and scoped diff passed.
- Existing bridge/system remains source of truth; public types unchanged. Display lag is at most one 250ms interval during continuous notifications. Browser/full/package/demo not rerun; broad modernization stays active.


## Attached-part animation subscriptions (2026-09-05)
- PhysicsEntity's useEntity remains the animation owner. Attached PartsGroupRef instances now render as inactive animation controllers, avoiding duplicated global input/store/bridge subscriptions per accessory. Independent PartsGroupRef isActive=true still mounts its own driver; inactive parts mount no animation hook.
- Existing real-Three rendering fixture extended with six accessories: seven meshes retained, zero accessory animation hooks; standalone activation invokes the hook and deactivation removes it. Failed before fix, passed afterward. Motion/animation 28 suites / 166 tests, memory 5 suites / 88 tests, build/root TypeScript, production lint and scoped diff passed. Corrected import ordering reported by lint.
- Public props, model/skeleton rendering and persistent state unchanged. No measured browser FPS claim; browser/full/package/demo not rerun. Renderer and broader example migration remain open.


## Camera diagnostic mode labels (2026-09-05)
- CameraDebugPanel default formatting reuses CameraController's Korean mode labels for mode/activeController values and renders the unknown sentinel with the configured unavailable label. Raw snapshot values, custom-field getters and custom format callbacks remain unchanged.
- Existing visible/hidden label checks corrected to Korean; custom formatter regression verifies raw chase still reaches the callback. Camera components: 6 suites / 18 tests passed; build/root TypeScript and scoped production lint passed after import ordering correction; scoped diff passed.
- No public signature, identifier or persistent source-of-truth changes. Browser/full/package/demo not rerun; remaining broad UI/renderer work stays active.


## Animation natural completion (2026-09-05)
- AnimationSystem synchronizes isPlaying from active action metrics after each update and before notifying subscribers. Natural completion retains the selected clip for replay.
- Real Three.js LoopOnce regressions cover normal completion and clampWhenFinished, subscriber state, and replay. Both failed before the fix; animation/motion 28 suites and 168 tests pass after the fix.
- Build/root TypeScript, scoped production ESLint and scoped diff checks pass. No persistent source-of-truth or public signature changes. Browser, full suite, package and demo builds were not run for this slice.
- Remaining goal work includes blueprint input/grounding, shared animation/minimap ownership, and renderer migration verification.


## Independent minimap rendering ownership (2026-09-05)
- useMinimap owns one effect-created MinimapSystem per mounted canvas, disposing it and unsubscribing on cleanup. The existing singleton remains the canonical marker source; local marker projections synchronize on changes, not frames.
- Disposing a non-singleton system no longer resets the shared singleton. No-listener marker updates skip snapshot allocation.
- StrictMode regression failed before the fix when zooming the first map rendered the second canvas. It now covers independent zoom, shared marker addition/update/removal, sibling unmount, singleton identity, and timer cleanup.
- UI 4 suites/7 tests, build/root TypeScript, scoped production ESLint and diff checks pass. Existing R3F THREE.Clock deprecation warnings remain. Browser/full/package/demo checks were not run for this slice.
- Public signatures and persistent source of truth are unchanged. Remaining goal work includes blueprint input/grounding, animation registration ownership, and renderer migration validation.


## Blueprint entity-local movement input (2026-09-05)
- Added BlueprintMovementInput to the existing public blueprint core contract. Entity update, spawner and motion hook forward input into reused component context. CharacterMovement no longer polls unpopulated window globals and no longer uses an always-false private grounding flag.
- Input is explicit per entity; absent input does not overwrite rigid-body velocity. Grounded jump accepts a new press, preserves gravity otherwise, rejects airborne presses and avoids repeated held-key impulses.
- Blueprint/motion/public export tests: 33 suites, 196 tests pass. Build/root TypeScript and scoped production ESLint pass after import-order correction. Existing export maps, build aliases, TypeScript/Jest paths and CJS type-copy configuration were inspected; no subpath changes needed.
- Example runtime input and per-body ground detection wiring, browser verification, full suite and fresh package/demo builds remain open. This is the input contract slice, not a claim of playable blueprint integration. Persistent source of truth is unchanged; former window-global input consumers require explicit input migration.


## Blueprint movement example (2026-09-05)
- Added examples/pages/BlueprintPlayground.tsx with focus-scoped movement/run/jump input, self-excluding per-body ground ray, explicit capsule collider, and reset. App routes and catalog expose the lazy scenario; editor link opens a new tab without destroying draft state.
- Removed global body overflow styling from blueprint-page CSS to avoid affecting unrelated routes. Scenario viewport owns its height and focus outline.
- Blueprint/hook/example-consumption tests: 12 suites/54 tests passed before final route addition; catalog and example-consumption guards rerun successfully afterward. Build/root TypeScript and production lint passed; scoped diff check passed. Browser physics, full suite, fresh package/demo builds not run. No persistent model changes. Next: browser interaction validation and touch controls, then model animation integration.


## Blueprint playground browser and pointer controls (2026-09-05)
- Added six holdable controls with pointer capture, up/cancel/lost-capture cleanup, keyboard activation and separate pointer/keyboard sets. Window blur and unmount clear both inputs. Reset clears all input.
- Actual 390x844 browser inspection found header overlap and poor inherited contrast. Added header-aware spacing, dark surface, button contrast, 44px targets and visible focus; inspected the final screenshots.
- scripts/probe-blueprint-playground.cjs reuses existing localhost:5173, launches/closes an owned browser, captures idle/moved/jump and pointer release. Visual screenshots show horizontal movement and jump ascent; no page errors. Mouse pointer capture was exercised, not native multi-touch hardware. Exact post-release stopping and lost-window-focus physics remain to be measured.
- Root TypeScript, scoped ESLint and diff check pass. No full/package/demo rerun. Browser skill Node REPL unavailable, so installed @playwright/test fallback used. Main renderer modernization and blueprint model/animation integration remain active.


## Time-based blueprint braking and integration checkpoint (2026-09-05)
- CharacterMovement braking now scales its existing 60Hz retention by elapsed seconds. Zero/negative/non-finite elapsed time does not apply extra damping; velocity scratch storage is reused.
- Regression compares equal elapsed braking at 30/60/120Hz and confirms zero elapsed does not brake. It failed before the fix. Existing 60Hz behavior remains covered by the prior speed/diagonal/gravity test.
- Blueprint/motion 31 suites/173 tests, build TypeScript, scoped production ESLint and scoped diff check pass. Full integration suite: 242 suites/2092 tests pass, 1 suite/test skipped (52.641s). Log: TEMP/gaesup-blueprint-integration-full.log.
- Public API and persistent source of truth unchanged. Browser at fixed frame rates and fresh package/demo builds not run for this slice. Remaining work includes blueprint model/clip loading, animation registration ownership and main renderer modernization.


## Blueprint jump animation phases (2026-09-05)
- CharacterAnimation now registers jump.start/loop/land from the existing structured configuration. Takeoff and landing actions play once; the loop persists through apex/descent when explicit grounding is provided, and landing returns to locomotion after completion.
- Real Three.js action tests cover phase sequence, apex, descent, landing completion plus prior missing clips, alternate names and mixer cleanup. Blueprint/hook tests, build TypeScript, scoped ESLint and diff checks passed.
- Public API and persistent source of truth unchanged. The existing window clip-source dependency is still unresolved; actual model/clip loading into the playground remains required. No browser/full/package/demo rerun for this slice.


## Blueprint per-entity animation clips (2026-09-05)
- Added optional BlueprintAnimationClips forwarding through factory, entity context, spawner and hook. Replaced CharacterAnimation window clip lookup with its borrowed per-entity clip map. Clip replacement rebuilds the owned entity and releases the old mixer; caller retains clip ownership.
- Migrated existing animation tests to explicit maps. Added real factory same-name clip isolation and sibling disposal regression. Blueprint/hook/public-export tests: 13 suites/65 tests pass. Build/root TypeScript, scoped production ESLint and diff check pass.
- No new subpath or persistent data contract. Legacy global clip users must pass animationClips. Actual model loading, browser animation playback and fresh package/demo builds remain open; this slice does not claim their completion.


## Blueprint playground model and embedded clips (2026-09-05)
- Inspected public/gltf/ally_body.glb JSON: locomotion clips idle/walk/run/jump/jumpIdle/land exist, with Draco compression. Corrected warrior seed locomotion names from nonexistent external files to embedded clip names; existing saved blueprints are not rewritten.
- Playground now loads the local GLB with local Draco assets, clones the skeleton per entity, normalizes model height to the collider, and injects a memoized clip map through useBlueprintEntity. Owned clone skeletons dispose on cleanup; shared loader geometry/materials remain borrowed via primitive dispose=null.
- Added shipped GLB/seed clip contract test. Blueprint/hook/example-consumption: 13 suites/58 tests pass. Build/root TypeScript, scoped production ESLint and diff checks pass. Browser model pose, visual scale, animation playback and repeated-reset GPU lifecycle remain REQUIRED and unverified. No fresh full/package/demo builds.


## Blueprint model browser reset verification (2026-09-05)
- Actual browser screenshots at 390x844 show loaded model, horizontal movement and changed jump pose; reset and desktop1440x900 snapshots inspected. No page errors.
- Extended owned-browser probe with WebGL createTexture/deleteTexture instrumentation. Four repeated reset samples were [9,9,9,9], repeated successfully after layout refinement. This proves bounded live texture handles in this scenario, not complete GPU/heap leak freedom.
- Desktop controls now have a 32rem maximum width, and the reset button keeps a 44px minimum target without spanning the whole screen. Final desktop screenshot inspected; scoped diff check passes. No unit/full/package/demo rerun for CSS/probe-only changes.
- Browser skill read; Node REPL unavailable, installed Playwright fallback used with the existing server. Remaining work includes exact animation-phase automation, movement-facing behavior, broader renderer migration and package verification.


## Packaged blueprint integration checkpoint (2026-09-05)
- Fresh test:package passes ESM/CJS library builds, declaration generation/finalization and packed-consumer verification. Added consumer.tsx usage of BlueprintAnimationClips/BlueprintMovementInput, factory animationClips config, entity.update input, useBlueprintEntity callback and BlueprintSpawner props. test:package:built rerun passes with this added contract.
- test:demo passes; administrator UI remains deferred from initial imports (1597 JS bytes). Consumer bundle still emits >500kB warnings (~4321.38kB minified /1451.55kB gzip in the first run); no claim that bundle size goals are complete.
- Node syntax and scoped diff checks pass. No production API or persistent state changes in this verification slice. Native WebGPU and main R3F10/Drei11 migration remain unverified/incomplete; plan stays active. Logs: TEMP/gaesup-blueprint-package.log, gaesup-blueprint-package-contract.log, gaesup-blueprint-demo.log.


## Animation action-scoped cleanup (2026-09-05)
- unregisterAnimations accepts an optional expected-action map and removes only matching identities; omitted map retains whole-type clear. AnimationSystem stops displaced actions on replacement. useAnimationSetup captures the registration map in its effect so cleanup does not depend on later lazy getter changes.
- Name-list cache follows membership mutations, fixing stale names after removal/addition with equal final counts while reusing arrays on unchanged frames.
- Real Three.js test covers sanitized names, replacement stop, stale-owner cleanup, unrelated registration preservation, equal-count membership changes and legacy clear. Animation/motion/export tests:30 suites/193 tests pass. Build/root TypeScript, scoped production ESLint and diff checks pass.
- Type-level command targeting remains; independent per-entity command routing is outside this slice. Persistent state unchanged. Packaged consumer check and hook-specific StrictMode/mutable-getter lifetime coverage remain open in animation-action-ownership plan. No browser/full/package/demo rerun.


## Animation action ownership closure (2026-09-05)
- Added real bridge hook tests for StrictMode sibling ownership and cleanup after lazy getters become null; both pass. Animation/motion/export31 suites/195 tests and root TS pass.
- Packaged consumer now type-checks scoped unregisterAnimations(type, actions) and legacy unregisterAnimations(type). Fresh test:package passes ESM/CJS/declarations/consumer builds; existing >500kB chunk warning remains. Node syntax and diff checks pass.
- Self-review recorded and animation-action-ownership plan moved to completed after its gates passed. Type-level targeting and same-action shared-reference accounting remain outside this slice. Broader modernization goal remains active; native GPU/main renderer migration and product UX audits remain outstanding.


## Example catalog organization and search (2026-09-05)
- Product experiences appear before developer/compatibility examples. All existing route links remain reachable, including blueprint playground. Product cards omit implementation paths; developer cards retain paths.
- Added labeled case-insensitive search across names/descriptions/categories/paths, count and empty state. Clearing search restores every route. Responsive grid fits columns below220px without forcing overflow; keyboard focus outlines and44px search input added.
- Catalog3 tests, root TypeScript, scoped ESLint, Prettier and diff checks pass. Browser visual verification, full suite, package and demo build not rerun for this UI slice. No public API or persistent source changes. Broader renderer and product audit remains active.


## Camera diagnostics measurement labels (2026-09-05)
- Camera debug default position/velocity/rotation labels now identify the controlled entity; distance/FOV labels identify settings. These values come from activeState and cameraOption, not measured camera-world transforms.
- Documented legacy frameCount and averageFrameTime fields as panel sample count and last sample interval. They are not render-frame performance measurements and remain absent from default displayed fields. Existing keys, values and custom renderers are preserved.
- Updated existing label assertions; camera component6 suites/18 tests, build TypeScript, scoped production ESLint and diff checks pass. Browser/full/package/demo not rerun. No persistent source or API signature changes.


## Renderer partial initialization audit (2026-09-05)
- Current Three0.185.1 source confirms that dispose after failed init is not safe to invoke blindly: setAnimationLoop awaits the rejected init promise. Updated factory docs and retained existing error contracts rather than adding misleading cleanup.
- Rendering/next11 suites/77 tests, build TypeScript, scoped ESLint and diff checks pass. This turn changes documentation and establishes current dependency evidence; it does not change production behavior or persistent/API contracts. Native GPU/browser/full/package/demo checks not rerun. Delayed successful initialization cancellation remains next.


## Overlapping renderer initialization ownership (2026-09-05)
- Extended NextCorePage GPU lifetime test to overlap late old backend completion with an already-running replacement view. Verified old backend/culling release once, no old animation-loop start, current callback identity preserved, current draw succeeds, and current owners release on final unmount.
- GPU lifetime22 tests, root TypeScript and scoped diff check pass. Production behavior, public API and persistent source unchanged. No native/browser/full/package/demo execution in this verification slice. Main R3F10 Canvas cancellation remains unverified and next.


## Integration checkpoint after input, visit and UI fixes (2026-09-05)
- Verified current worktree: full Jest run passed 245 suites / 2109 tests, with one suite/test skipped. Fresh test:package passed library build, declarations and isolated packed consumer verification. test:demo passed; administrator UI remains deferred (1597 JS bytes).
- Includes session-scoped visit snapshots and stale approval/event rejection, configurable minimap size/polling with resize-aware gradient cache, frame-rate-independent airborne steering, input-based locomotion animation choice, directional playground controls and grouped developer navigation.
- Latest playground browser probe observed keyboard movement/jump, no page errors, and live WebGL texture counts [9,9,9,9] after four resets. This is not a measurement of all GPU allocations or native WebGPU performance. Grouped developer menu has not yet received browser visual verification.
- Existing >500 kB chunk warnings remain. The broad packed consumer produced 4321.97 kB JS (1451.66 kB gzip); this is not the default showcase startup payload. No package version, public API signature, persistent source of truth or save format was changed in this checkpoint.
- Logs: system temporary directory gaesup-integration-review.log, gaesup-integration-package.log and gaesup-integration-demo.log. Whole-goal completion remains unproven: remaining dynamic UI audit, grouped-menu browser checks, R3F10 lifecycle migration and native WebGPU verification remain open.

## Event and studio editor reliability (2026-09-05)
- Localized event condition/action choices, disabled type displays, missing field labels, event template fallback names/messages and default studio bundle name. Execution policy now selects once/repeat with Korean labels while retaining serialized values. Caller-provided names and identifiers are preserved.
- Studio operations await completion, reject duplicate requests while pending, report failures and support retries. A successful save followed by list failure is reported distinctly. Studio regression4 tests passed, plus build/root TypeScript and production ESLint.
- Event execution now reports pending/failure and distinguishes fallback-engine skipped/no-action results from successful actions. Pending execution disables both run entry points. The panel retains its fallback engine across definition edits and replaces definitions immediately before dispatch, preserving once/cooldown history and runtime flags for the mounted panel.
- Latest event panel/engine2 suites/7 tests passed, including definition edits retaining once history and a new event consuming an earlier flag. Build/root TypeScript and scoped ESLint passed. No save schema, public signatures or canonical persistent path changed; panel-local fallback state is still lost on unmount. Browser and full/package/demo checks were not repeated for these slices. External onRun retains its void completion contract, so skipped outcomes from external runtimes cannot be inspected by this panel.

## Grouped developer menu browser verification (2026-09-05)
- Added scripts/probe-developer-navigation.cjs against the existing local server. Chromium390x844 and1440x900 verified four groups, focus scrolling to the final item, Escape closing with focus restored, and same-route selection closing. Page errors0.
- Visual inspection revealed background text bleeding through the menu and mobile overlap with primary navigation. Changed the menu to an opaque background and mobile positioning relative to the full navigation bar. Re-ran the probe and inspected both resulting screenshots; the menu now opens below primary navigation on mobile and text remains readable.
- Screenshots in system temporary directory: gaesup-developer-menu-mobile.png and gaesup-developer-menu-desktop.png. Mobile menu scrolls for the final experimental link; focus brings it into view. No routes, public API or persistent source changed. Full tests/package/demo were not rerun for this CSS-only behavior correction.

## R3F10 cancellation gate evidence (2026-09-05)
- Actual isolated alpha cancellation probe fails the strict framework cleanup gate: null scene teardown error, retained root and0 framework disposals. Deferred owner teardown comparison passes with root removal and one renderer disposal.
- Added --defer-unmount to scripts/probe-r3f10-cancellation.cjs and documented the production ownership requirements in the active renderer plan. Stub renderer/Node lifecycle only; not a main package migration or native GPU result. No production API, dependency or persistent source change.

## 장면 문서 공유 누락 수정

- WORLD_SNAPSHOT_DOMAINS에 기존 scene-document 저장 키를 추가했다. 콘텐츠 번들, 월드 스냅샷, 기본 방문 수락에 제작 오브젝트가 포함된다. 기존 scene 및 개인 진행 데이터 분리는 유지한다.
- source of truth는 기존 SceneDocumentController이며 수신은 기존 save binding의 replace 명령을 따른다. 저장 형식과 public entry/subpath 변경 없음.
- 예제 runtime.setup 후 제작 명령으로 생성한 오브젝트의 번들 포함 및 방문 복원을 검증했다. 관련/API/export 8 suites / 60 tests, build/root 타입 검사, production ESLint, diff check 통과. 브라우저/전체 Jest/package consumer 미실행.
- 전체 예제 현대화와 native WebGPU 검증은 미완료다.

## 제작 계층 목록 표시 확인

- HierarchyPanel의 펼치기/접기 접근성 이름을 한글로 변경하고 1c 표시를 컴포넌트 1개로 풀어 썼다. 기존 장면 ID와 선택/확장 상태 경로는 유지한다.
- scripts/probe-creator-menu.cjs로 기존 개발 서버의 /creator를 검증했다. Chromium 390x844에서 실제 계층 펼치기 후 하위 장면 표식 표시, 1440x900에서 계층/편집 화면을 확인했다. pageerror 0. 초기 로딩 스크린샷은 근거에서 제외했다.
- 시스템 임시 폴더 gaesup-creator-hierarchy.png 및 gaesup-creator-hierarchy-desktop.png 확인. 계층 테스트 3개, build 타입 검사, 변경 production ESLint 통과. 전체 테스트와 native WebGPU 검증은 미실행.

## 편집·내보내기 통합 검증 체크포인트

- 최근 콘텐츠 직렬화 실패 전달, scene-document 공유, 미니맵 회전 잠금, 장면 기본 이름 한글화, 계층 표시, 속성 태그/숫자 입력 변경을 포함한 현재 작업 트리에서 전체 Jest 247 suites / 2125 tests 통과, 1 suite / 1 test skipped. 실행 시간 55.5초.
- test:demo 통과, 관리자 UI 1597 JS bytes는 초기 import에서 분리 유지. test:package의 ESM/CJS/타입 빌드와 별도 packed consumer 검증 통과.
- 기존 Three/physics 대형 chunk 경고 유지. package consumer의 4322.78 kB JS는 넓은 API 소비 fixture 결과이며 showcase 초기 payload 측정값이 아니다.
- 로그: 시스템 임시 폴더 gaesup-editor-integration-{tests,demo,package}.log. 이번 검증은 브라우저 숫자 입력 및 native WebGPU 검증을 대신하지 않는다. 전체 현대화 목표는 진행 중이다.

## 편집 입력과 이동 키 분리

- 실제 /creator 속성 입력 검증 중 useKeyboard가 입력 필드의 mapped key를 처리하고 편집 모드에서는 preventDefault하는 경로를 확인했다. input/textarea/select/contenteditable 대상은 이동 키 처리를 생략하고 기존에 눌린 이동 키만 해제한다.
- useKeyboard 22 tests, build 타입 검사, production ESLint 통과. 상태 소유 및 public API 변경 없음.
- 브라우저 검증은 미완료: 빈 숫자 복원/음수 확정 및 일부 실행에서 태그 입력·확정까지 진행했으나, 후속 Playwright 호출이 완료되지 않았다. 반복 실행마다 마지막 진행 단계가 달라 이 변경이 정지 원인 전체를 해결했다고 주장하지 않는다. 스크립트에 기본 동작 timeout과 단계 로그를 추가했다. 자체 검증 프로세스와 그 자식만 종료했고 개발 서버는 유지했다.
- 로그: 시스템 임시 폴더 gaesup-creator-input.log. 입력 이후 패널 재진입 및 전체 브라우저 통과 증거는 아직 없다. 기존 통합 테스트 체크포인트는 이 keyboard 변경 이전 결과다.

## 속성 입력 명령 경로 재현

- InspectorPanel을 실제 예제 WorldSceneDocumentSession/SceneDocumentController 명령 경로에 연결한 통합 테스트를 추가했다. 빈 숫자 입력은 변경 이벤트 0회, 위치·태그·회전 확정은 총 3회이며, 패널 재마운트 후 값이 유지된다.
- 장면 세션 10 tests 및 root 타입 검사 통과. production 동작 변경 없음. 해당 경로에서 반복 mutation은 재현되지 않았다.
- 이 검증에는 Canvas/GPU와 브라우저 이벤트 루프가 포함되지 않으므로 앞선 Playwright 정지를 해결하거나 원인을 확정한 것으로 보지 않는다. 다음 조사 대상은 실제 렌더링을 포함한 브라우저 실행이다.

## 속성 브라우저 검증 완료 및 벡터 입력 겹침 수정

- 이전 Playwright 미완료를 정지로 판단한 기록을 정정한다. pw:api 로그와 Node heartbeat를 함께 수집한 실행은 진행 중이었고 약 100초 후 정상 종료했다. 개별 브라우저 입력 응답에 수 초가 걸렸으며 원인 전체를 GPU로 확정하지 않는다. 작업 시작 시 검증 잔여 프로세스 없음, 여유 메모리 약 31GB.
- 실제 /creator에서 빈 위치 값 복원, -2.75 위치 확정, example/forest 태그 연속 입력, 회전 Y=1.57 확정, 계층으로 전환 후 속성 재진입 시 값 유지, 모바일 빈 값 복원까지 통과했다. pageerror 0, browser.close 정상 완료. 로그 gaesup-creator-input-debug.log.
- 스크린샷에서 숫자 입력의 content-box 너비 때문에 다음 축 글자와 겹침을 확인했다. theme.css의 number input을 border-box로 바꾸고 vector grid의 최소 너비를 0으로 조정했다. --layout-only 검증으로 1440x900 및 390x844의 9개 입력에서 겹침 없음 확인, 두 스크린샷 직접 확인. gaesup-creator-vector-{390,1440}.png 및 gaesup-creator-vector.log.
- 속성 테스트 6개 및 build 타입 검사 통과. source of truth, 저장 형식, 공개 API 변경 없음. 전체 테스트와 native WebGPU는 이번 slice에서 미실행.

## R3F10 브라우저 크기·포인터 검증

- 격리된 실제 Fiber10 alpha / WebGPURenderer StrictMode 실행에서 크기 변경 시 렌더러 재생성 없이 canvas 및 카메라 갱신, 메시 클릭 전달을 확인했다. 3회 lifecycle에서6생성/6해제, 취소 경로2생성/2해제 및0프레임.
- scripts/probe-r3f10-browser.cjs에 크기 변경 스크린샷을 추가했고 실제640x560 결과를 확인했다. Node syntax 통과. WebGL2 fallback이며 해제 시 scheduler root-not-found 경고가 남는다. native GPU와 production 통합 완료로 보지 않는다.

## 방문 공유 직렬화 실패 전파

- serializeVisit에서 직렬화 예외를 null로 바꾸던 처리를 제거했다. 실패하면 호출자에게 예외가 전달되며 publishNow는 전송과 lastPublished 갱신 전에 중단한다. 정상적인 null 데이터, 도메인 선택과 기존 스냅샷 형식은 유지한다. canonical 상태 소유권 변경 없음.
- 실제 local channel과 React hook 테스트에서 이전 게시물 유지, 새 구독자의 이전 게시물 수신, 실패 복구 후 재전송을 확인했다. 방문/번들/Studio 4 suites 27 tests 및 build 타입 검사 통과. production serializer ESLint 오류 없음; 두 테스트 파일은 저장소 ignore 정책으로 lint 제외되었다.
- 방문 훅을 직접 사용하는 예제 화면은 현재 없다. 이번 결과는 브라우저 방문 UX 검증이 아니다. 수신 payload 검증, 플랫폼 collectSaveDomains의 오류 은폐, 키보드 설정 및 입력 해제 결함은 후속 작업으로 남아 있다. 전체 테스트와 native WebGPU 검증은 이번 slice에서 미실행.

## 방문 WebSocket 메시지 형태 검증

- channel.ts의 JSON 단언을 unknown 기반 검사로 변경했다. 필수 식별자, kind, 양의 정수 스냅샷 버전, 유한한 비음수 시간과 객체형 domains 및 leave.hostId를 검사한다. 기존 wire version 1과 정상 스냅샷 형식, 상태 소유권은 유지한다. 개별 도메인 데이터와 호스트 권한까지 검증한 것은 아니다.
- 새 webSocketChannel.test.ts에서 정상 왕복·구독 해제, 잘못된 envelope/snapshot 차단과 이후 정상 메시지 수신을 확인했다. 방문 3 suites 42 tests, build/root 타입 검사 및 channel.ts ESLint 통과. 첫 타입 검사의 TS4111은 index signature 대괄호 접근으로 수정 후 재검증했다.
- 전체 테스트·브라우저·native WebGPU는 이번 slice에서 미실행. 다음은 예제 키보드 비활성화 설정 및 입력 소유권 해제, 도메인 hydrate 검증이다.

## 블루프린트 미리보기 키보드 설정 연결

- BlueprintPreview의 중복 useKeyboard 호출을 제거했다. controls.enableKeyboard → GaesupController/EntityController.enableKeyboard → useKeyboard 네 번째 enabled 인자로 연결한다. 선택적 인자는 기본 true이며 기존 인자와 export 경로는 유지한다. 입력 상태의 source of truth는 기존 InputAdapter다.
- disabled 입력 차단, 누른 상태에서 비활성화 시 초기화, 재활성화 입력, 미리보기 prop 전달과 중복 구독 없음 검증. keyboard/controller/preview/publicApi/packageExports 5 suites 56 tests, build/root 타입 검사와 변경 구현 ESLint 통과.
- 실제 Canvas 물리 이동 확인, 복수 훅의 입력 소유권과 unmount 해제는 아직 미완료다. 전역 입력 상태를 여러 훅이 공유하므로 하나의 unmount에서 무조건 전체 초기화하는 변경은 넣지 않았다. 전체 테스트·package/demo 빌드와 브라우저 검증은 이번 slice에서 미실행이다.

### 미리보기 키보드 실제 브라우저 검증 완료

- scripts/probe-preview-keyboard.cjs에서 기존 서버 /blueprints를 사용해 실제 키보드 사용 버튼을 켜짐/꺼짐/켜짐으로 전환했다. 테스트 페이지에서만 기존 body ref를 노출했고, 500ms D 입력의 Rapier 수평 이동은 5.0417/0/5.0643이었다. 실제 Canvas 경로 검증 완료, pageerror 0, 브라우저 해제 및 probe exit 0, Node syntax 통과.
- TEMP/gaesup-preview-keyboard.png 직접 확인. 이동 후 캐릭터가 화면 밖에 나가 있는 모습은 카메라 추적 후속 조사 대상이며 키보드 검증으로 해결된 것으로 보지 않는다. 복수 입력 소유권 해제도 남아 있다. 완료 조건 충족한 preview-keyboard-control plan은 completed로 이동했다.

## 미리보기 카메라 정지 수정

- 실제 프레임에서 activeState 위치는 움직이지만 카메라는 [0,10,20]에 고정됨을 확인했다. pageerror와 별개로 console.error에 LineSegments2의 Raycaster.camera 누락 및 ThirdPersonController.update 예외가 반복됐다. 이전 pageerror 0은 콘솔 오류 없음의 증거가 아니었다.
- camera.ts 충돌 대상에서 Mesh를 상속한 화면용 LineSegments2를 제외하고, intangible 부모의 하위 객체도 제외하도록 수정했다. 부모 제외 상속만 적용한 중간 브라우저 실행은 실패했고, 선분 제외 후 통과했다. 기존 일반 메시 충돌과 명시적 제외 목록은 유지한다. canonical 상태와 public API 변경 없음.
- 실제 /blueprints에서 이동/정지/재이동 중 카메라가 초기 위치를 벗어나 추적하고 대상의 투영 좌표가 화면 범위 안에 있는지 검사한다. 브라우저 pageerror/console.error 모두 0, 스크린샷에서 캐릭터 표시 확인. TEMP/gaesup-preview-camera.log 및 gaesup-preview-keyboard.png.
- 카메라 12 suites 76 tests, build/root 타입 검사, camera.ts ESLint 및 probe syntax 통과. 기존 Clock/react-test-renderer deprecation 경고 존재. 전체 스위트·package/demo·native WebGPU는 이번 수정에서 미실행. 다음은 복수 키보드 입력 소유권과 해제 경로다.

## 블루프린트 카메라 모드 한글 선택 메뉴

- BlueprintEditor의 camera.mode 자유 텍스트 입력을 기존 CAMERA_CONTROLLER_DEFAULT_MODES를 공유하는 선택 메뉴로 바꿨다. 3인칭·1인칭·추적·위에서 보기 등 한글로 표시하며 내부 값 thirdPerson/topDown 등은 유지한다. 알 수 없는 기존 값은 사용자 지정 옵션으로 보존한다.
- 변경 취소 및 적용 후 레지스트리의 canonical 값 보존 테스트 포함 편집기 7 tests, build/root 타입 검사와 구현 ESLint 통과. 첫 lint import 순서 실패는 수정 후 통과했다. 상태 소유권·public API·저장 형식 변경 없음.
- 이 선택 메뉴의 실제 브라우저 조작은 미실행이다. 전체 테스트·package/demo·native WebGPU 또한 이번 수정에서 미실행. 복수 키보드 입력 해제와 남은 동적 영어 표시 감사는 계속 남아 있다.

## 통합 검사 및 미리보기 이동 속도 연결

- 전체 Jest 실행: 249 suites 2163 tests 통과, 1 suite/test skipped. TEMP/gaesup-current-regression.log. 이 실행은 이동 속도 연결 작업을 시작하기 전에 시작했으므로 새 수정 전체를 포함하는 최종 검증으로 간주하지 않는다.
- 미리보기는 이동 속도 5를 표시하면서 전역 PhysicsConfig의 walkSpeed 10을 사용하고 있었다. BlueprintPreview에서 blueprint.physics.moveSpeed/runSpeed를 기존 store.physics에 적용하고, cleanup은 기존 restorePreviewFields로 외부 변경을 보존하며 이전 필드와 부재 상태까지 복원한다. 새 persistent source of truth나 public API는 추가하지 않았다.
- 이동 속도 수정 후 preview 8 tests, build/root 타입 검사 및 구현 ESLint 통과. 첫 타입 오류는 optional speed 필드의 정확한 복원 방식으로 해결했다. 실제 속도별 브라우저 이동량과 여러 미리보기 동시 소유권은 미검증이다. 점프 힘·충돌체 크기 등 다른 blueprint 물리 항목의 미리보기 연결은 후속 감사 대상이다.

## 키보드 구독별 해제

- useKeyboard/ownership.ts는 동일 InputAdapter의 동작별 누름 수와 구독별 입력 소스를 추적한다. 최초 누름과 마지막 해제만 backend에 전달해 중복 구독의 중복 write를 줄인다. 실제 키와 화면 버튼은 별도 입력 소스로 처리한다. 입력 상태 source of truth는 기존 adapter다.
- useKeyboard의 unmount/backend 변경 cleanup은 자신의 누름만 해제한다. 자동화 옵션 변화로 리스너를 갱신할 때는 해제하지 않는다. clearAllKeys는 다른 구독의 활성 키를 보존하고 창 blur도 처리한다. 기존 console.error는 logger로 교체했다.
- hook/소유권/controller/preview 4 suites 38 tests, build/root 타입 검사 및 구현 ESLint 통과. 같은 키 동시 소유, 버튼/키 중첩, 다른 키, 별도 adapter, unmount, blur, 설정 재렌더 검증. 실제 hook backend 교체와 브라우저 복합 입력은 남아 있다. 전체 스위트·package/demo는 이번 수정 뒤 미실행이다.

### backend 교체 및 동기 입력 구독 검증

- 실제 hook의 backend 교체 시 이전 키를 해제하고 새 backend로 누름을 전달하지 않는 것을 확인했다. 새 backend 입력과 unmount 해제까지 통과했다.
- createMemoryInputBackend의 동기 subscriber가 true 수신 중 release를 호출하면 키가 남는 실패를 재현했다. ownership.ts에서 소유권 기록 갱신을 backend 알림보다 먼저 수행하도록 수정했다. 이전 소유자 해제 알림 중 새 소유자가 누르는 경우도 유지되고 마지막 해제 시 false가 되는지 확인했다.
- 관련 4 suites 41 tests, build/root 타입 검사 및 구현 ESLint 통과. 기존 InputAdapter 상태 경로와 public API 유지. 실제 브라우저 복합 입력·전체 스위트·package/demo·native WebGPU는 이번 수정 뒤 미실행이며 전체 목표는 진행 중이다.

## 게임패드 구독 통합과 기본 이름 정리

- GamePad와 GamePadButton의 중복 useKeyboard를 부모 한 번으로 통합했다. N개 버튼에서 N+1 hook 구독이 1개로 줄며 별도 FPS 향상 수치로 주장하지 않는다. 사용되지 않던 방향 분류/active 객체와 filter를 제거하고 키 목록을 직접 렌더링한다.
- 기본 버튼은 앞으로/뒤로/왼쪽/오른쪽/점프/달리기/취소 및 동작 키 이름으로 표시하며 사용자 label override와 key 값은 유지한다. 버튼은 pointer 이벤트로 이중 mouse 입력을 피하고 취소·이탈·blur·unmount에서 누름을 해제한다. Enter/Space 조작 지원, 게임패드 모드 종료 시 버튼 제거 및 재진입 상태 초기화.
- Gamepad/keyboard 3 suites 33 tests, build/root 타입 검사와 변경 구현 ESLint 통과. InputAdapter 상태 소유권과 public export는 유지한다. 실제 브라우저의 복합 입력, 전체 스위트·package/demo·native WebGPU는 이번 변경 뒤 미실행이다.

## 입력 통합 및 패키지·예제 빌드 체크포인트

- Gamepad.input.test.tsx는 실제 GamePad/useKeyboard/ownership와 createMemoryInputBackend를 연결해 키보드/포인터 중첩, pointercancel, 게임패드 제거와 모드 변경, 다른 컨트롤러의 누름 보존·최종 해제를 검증한다. 두 통합 테스트 및 root 타입 검사 통과. 브라우저/Rapier 검증은 포함하지 않는다.
- 최신 production 코드로 test:package 통과: ESM/CJS 런타임 import, 선언 파일 및 소비자 빌드 검증. test:demo 통과: 초기 import에서 관리자 UI 1,597 JS bytes 지연 유지. 로그 TEMP/gaesup-input-{package,demo}.log.
- 넓은 API를 사용하는 package fixture의 JS는 4,323.62 kB, gzip 1,452.55 kB이며 showcase 첫 로딩 크기를 뜻하지 않는다. 500 kB 초과 청크 경고는 남아 있다. 저장 상태 source of truth와 public API는 이번 검증에서 변경하지 않았다. 실제 브라우저 복합 입력·속도 검증 및 native WebGPU/전체 현대화 완료 조건은 남아 있다.

## 미리보기 이동과 카메라 재검증

### 점프 설정 투영

- BlueprintPreview에 표시만 되던 jumpForce를 physics.jumpSpeed에 연결했다. 기존 WarriorEntity.jump의 jumpForce/mass 규칙을 따른다. 양수가 아닌 mass 또는 유효하지 않은 결과·음수 속도는0으로 처리한다. 실제 rigid body의 질량/충돌체 변경은 포함하지 않는다.
- StrictMode에서350/80 적용, force400/mass40→10, mass0·음수 힘·힘0→0, 종료 시 기존 jumpSpeed15 복원을 확인했다. 기존 필드 단위 복원 경로를 사용하고 저장 schema/API는 유지한다.
- preview13 tests, build/root 타입 검사, 구현lint 통과. 실제 브라우저 점프 높이·착지와 force/mass 편집 반영 검증은 아직 미실행이다.

### 편집 시 전체 복제와 카메라 재설정 감소

- BlueprintEditor는 필드 편집마다 JSON 전체 복제를 하던 경로를 root 및 수정 경로의 object/array만 복사하도록 변경했다. 최초 선택 시 편집본 분리는 유지한다. 이름 편집 후 camera/physics 참조 보존, physics 편집 후 camera 참조 보존 및 이전 physics 값 불변을 실제 editor 테스트로 확인했다.
- BlueprintPreview의 카메라 effect는 전체 blueprint 대신 camera 설정과 controller 설정을 따른다. 이름·이동 속도를 편집할 때 camera apply/restore/mode write 0회 및 zoom1.5 유지, 속도7 반영 테스트 통과. FPS나 메모리 절감률 실측을 의미하지 않는다.
- 관련2 suites20 tests, build/root 타입 검사 및 변경 구현lint 통과. source of truth와 public API/저장 schema 유지. 변경 후 브라우저·package/demo·전체 suite는 아직 미실행이다.

### 미리보기 마우스 설정 완료

- `probe-preview-keyboard.cjs --mouse --camera` 실제 브라우저 검사 통과. off/on/off에서 wheel zoom 변화0/0.1/0, Ctrl+mouse orbit 변화0/0.11977/0, 바닥 클릭500ms 이동0/1.70968/0. 각 클릭 이동이 끝난 후 다음 조건을 측정했으며 진행 중 이동 강제 취소는 범위 밖이다. 페이지·콘솔 오류 없음. TEMP/gaesup-preview-mouse.log.
- Camera(enableMouse=true), useCamera(enableMouse=true)와 BlueprintPreview의 카메라·자체 wheel·Clicker 연결 검증. 기존 무인자 호출 및 InputAdapter/카메라 상태 소유권 유지. 직전 카메라·preview·API 가드 테스트, build/root 타입 및 구현lint 통과; 이번 probe syntax 통과. 전체 suite/package/demo는 이번 브라우저 검사 뒤 재실행하지 않았다.

### 전체 회귀 및 R3F10 종료 순서

- 운영 팩터리 통합 검사 `node scripts/probe-renderer-factory-failure.mjs` 통과. Vite SSR로 실제 createRenderer 및 Three WebGPURenderer/backend를 불러와 모의 device 할당 뒤 backend 설정 실패와 fallback context 실패를 주입했다. owned device destroy1, 원래 fallback 오류 보존 및 WebGL 정리 오류 기록1 확인. 실제 GPU 장애나 브라우저 검증은 아니다. script syntax 통과.
- backend 정리 production 변경 이후 test:package와 test:demo 통과. 패키지 소비자의 import/types/build 검증 및 관리자 UI 지연1,597 bytes 유지. TEMP/gaesup-backend-{package,demo}.log. 기존 500kB 청크 경고 유지. 전체 Jest는 이번 턴에 재실행하지 않았다. source of truth/API 유지; native GPU 및 production R3F10 통합은 남아 있다.

- production src/core/rendering/webgpu.ts에 init 실패 시 original/current backend별 정리 시도 및 원래 오류 보존, successful fallback 시 버려진 backend 정리를 추가했다. renderer.dispose를 호출해 실패 Promise를 다시 발생시키지 않는다. 정리 오류는 project logger에 기록하고 다음 backend 처리를 계속한다.
- renderer factory 16 tests, build/root 타입 검사, 구현 ESLint 및 실제 Three backend method probe 통과. 실제 WebGPUBackend.dispose는 초기화 전 호출과 외부 device 보존을 처리했고, 초기화 전 WebGLBackend.dispose는 오류를 낸다. device는 모의 객체로 실제 GPU 장애 자원 회수 증거는 아니다.
- 공개 API와 저장 source of truth는 유지. 이 production 변경 뒤 브라우저/package/demo/전체 Jest는 미실행이며 native WebGPU와 전체 현대화는 계속 미완료다.

- `node scripts/probe-three-init-disposal.mjs` 통과: 실제 Three185 Renderer + 모의 자원 할당 Backend에서 init 실패 뒤 dispose가 backend 정리를 생략하고 동일 실패 Promise를 다시 거부하는 현상을 확인했다. 검사 끝에 모의 backend 자원을 직접 해제한다. 실제 GPU 누수량 측정은 아니다.
- 단순 catch→renderer.dispose 추가로는 해결되지 않는다. backend/device의 실패 시 소유권 정리가 필요하며 fallback 이전 backend도 고려해야 한다. script syntax 통과, production/public API/persistent state 변경 없음. 초기화 실패 자원 정리 gate는 계속 열려 있다.

- 검증용 Canvas 초기화를 root 생성 전으로 이동한 실제 StrictMode 브라우저 검사 통과. 정상 반복은 root3 / renderer 생성6·해제6이며 context/resize/pointer/physics 시나리오와 최종 resource counter0 유지. 초기화 중 취소는 root0 / renderer 생성2·해제2 / frame0.
- GPU 생성 전 주입한 초기화 실패는 원래 오류 보존, canvas 제거 및 root0을 확인했다. renderer.init이 일부 GPU 자원을 생성한 뒤 실패하는 경우나 root.configure 자체 실패의 처리를 증명하지 않는다. WebGL2 fallback 경로이며 production/native WebGPU 이관은 아직 미완료다.
- 로그 TEMP/gaesup-r3f10-preinit-browser.log. fixture/probe syntax 통과. 메인 의존성·API·저장 구조 변화 없음.

- 초기화 실패 후속 검사: `probe-r3f10-init-failure.cjs --require-cleanup`은 실제 Fiber10 alpha에서 실패를 재현한다. factory 오류는 전파되지만 unmount의 null scene 정리 오류로 root 등록이 남는다. `--initialize-before-root` 비교는 원래 오류를 유지하고 root 미생성을 확인해 통과한다. script syntax 통과.
- GPU를 생성하지 않는 주입 실패 검사이며 실제 Three 부분 초기화 자원 정리를 증명하지 않는다. production/browser owner의 초기화 순서는 아직 수정하지 않았고 실패 gate는 열린 상태다. 메인 코드·공개 API·저장 구조 변경 없음.

- 컨텍스트 후속 검증: isolated OwnedCanvas에 useBridge/FiberProvider 연결. 상위 React context initial→updated가 장면에 전달되고 renderer 생성 수가 증가하지 않는 실제 브라우저 검사 통과. 이후 재생성한 장면에서도 updated 유지.
- StrictMode resize/pointer·물리 반복 실행 및 renderer 생성6/해제6, 초기화 취소 생성2/해제2·frame0도 통과. stale scheduler 경고 및 페이지·콘솔 오류 없음. TEMP/gaesup-r3f10-context-browser.log. 변경 fixture/probe syntax 통과.
- 메인 의존성과 저장 계약은 그대로다. 검증은 WebGL2 fallback fixture이며 production RuntimeProvider, 초기화 실패·native WebGPU·Canvas 전체 옵션 대응은 아직 미완료다.

- 후속 브라우저 검사에서 자식 drain만으로는 경고가 남았다. trace 결과 이벤트 disconnect의 store 변경이 scheduler unregister 뒤 invalidate를 호출했다. fixture에서 자식 정리 → 이벤트 disconnect → root 해제로 순서를 수정했다.
- 실제 StrictMode 브라우저 재검증 통과: resize/pointer, 물리 pause/resume/remove 3회 및 renderer 생성6/해제6, 마지막 resource counter 모두0. 초기화 도중 취소 생성2/해제2 및 scene frame0. stale-root 경고를 실패 조건에 추가했고 최종 실행에서는 발생하지 않았다. 로그 TEMP/gaesup-r3f10-disconnect-browser.log. script/fixture syntax 통과.
- 이번 결과는 WebGL2 fallback의 isolated R3F10 prototype에 한정된다. production 코드·dependency·저장 계약은 변경하지 않았고 native WebGPU, 초기화 실패 처리, context 전달과 production Canvas 통합은 미완료다.

- 최신 전체 Jest 252 suites / 2184 tests 통과, 1 suite/test skipped(52.013s). TEMP/gaesup-current-full.log. 최근 미리보기·입력 구현 포함.
- isolated Fiber10 alpha / Three185 Node 재현에서 passive cleanup의 invalidate가 root unregister 뒤 실행되어 경고가 발생했다. --drain-children 비교에서는 자식을 먼저 정리해 경고 0, root 제거 및 renderer dispose 1회를 검증했다.
- 브라우저 fixture는 완료 통지 컴포넌트의 passive effect를 기다린 후 root를 해제하도록 수정했다. syntax 검사만 통과했으며 이 새 순서의 실제 브라우저 검증은 미실행이다. production renderer/public API/persistent state 변경 없음. native WebGPU 및 production R3F10 이관은 계속 미완료다.

### 화면 게임패드 연결 후 브라우저 검증

- `probe-preview-keyboard.cjs --gamepad`와 `--gamepad --compact` 통과(1440x900 / 390x844). 키보드 비활성 시 물리 W 이동 0, 화면 버튼 입력 이동 약 2.5/500ms, 물리 키·화면 버튼 중 한쪽만 해제하면 계속 이동, 전체 해제·게임패드 끄기 이동 0. 재진입 버튼 눌림 false. 페이지·콘솔 오류 없음.
- 작은 화면 캡처에서 캐릭터를 가리던 버튼을 별도 grid 행으로 이동하고 해당 모바일 미리보기 높이를 440px로 확보했다. 수정 후 양쪽 크기 입력 검사 재통과, 캡처 직접 확인. 데스크톱 Canvas/버튼 비중첩과 44px 이상 터치 영역·가로 경계 검사도 통과. 초기 compact 실패는 검사 스크립트의 화면 밖 좌표 클릭이었으며 scrollIntoViewIfNeeded로 수정했다.
- 현재 스크립트 syntax 검사 통과. 직전 구현의 도메인/API 테스트 72개 및 추가 물리 구독 전환 테스트 포함 keyboard 32개, build/root 타입 검사·구현 lint 통과. 이번 CSS/브라우저 검사 뒤 전체 suite/package/demo는 재실행하지 않았다. InputAdapter가 canonical 상태를 유지한다. 새 listenToKeyboard 인자는 기본 true, GamePad는 false로 호출한다.

- 현재 개발 서버에서 `node scripts/probe-preview-keyboard.cjs --camera` 통과. 500 ms KeyD 입력에 키보드 활성/비활성/재활성 이동 거리 2.5828/0/2.5676. 이동 속도 5 설정과 일치하는 범위이며 카메라 투영 좌표가 화면 안에 유지됐다. 페이지·콘솔 오류 없음. TEMP/gaesup-preview-current.log 및 gaesup-preview-keyboard.png 저장, 이미지 직접 확인.
- 이후 카메라 x/y/z 거리와 zoomSpeed의 명시적인 0을 기본값으로 덮어쓰던 `||`를 `??`로 수정했다. 미리보기 9 tests, build/root 타입 검사 및 변경 구현 lint 통과. 이 0 설정 변경은 브라우저에서 별도 검증하지 않았다.
- InputAdapter와 저장 구조·공개 API는 유지한다. 미리보기 controls.enableGamepad는 아직 연결되지 않았다. 화면 게임패드/물리 키 복합 입력의 브라우저 검증과 native WebGPU/렌더러 현대화 완료 조건은 남아 있다.

## 예제 현대화 누적 회귀 검사 (2026-09-05, 최신 체크포인트)

- 현재 작업 트리의 전체 Jest: 253 suites / 2197 tests 통과, 1 suite/test skipped, 64.741s. TEMP/gaesup-latest-full.log. 최근 스냅샷 수집·전송 실패 전달, NPC/이벤트/상점 문구, 건축 패널 중복 제거, 미리보기 입력/점프 및 미니맵 타일 제외 변경을 포함한다.
- test:package 통과: 라이브러리/선언 빌드와 별도 패키지 소비자 검증. TEMP/gaesup-latest-package.log. test:demo 통과: 초기 관리자 코드 지연 로딩 및 package surface 청크 검증. TEMP/gaesup-latest-demo.log. 기존 500kB 초과 청크 경고는 남아 있다.
- test:memory 5 suites / 88 tests 통과. 설정의 실제 범위는 boilerplate bridge/entity/hooks 5개 파일이며, native GPU 메모리 누수 부재를 증명하지 않는다. TEMP/gaesup-latest-memory.log.
- 위 과거 기록의 게임패드 미연결 문구는 이후 완료된 preview-gamepad-control plan과 브라우저 검사로 대체되었다. 전체 목표 완료를 뜻하지 않는다. 방문 도메인 데이터 검증, 일부 동적 UI·모바일 확인, 실제 미니맵 픽셀 비교 및 native WebGPU/main renderer 이관은 여전히 남아 있다.
- 이번 체크포인트에서 production 코드·상태 소유권·호환성 계약 변경 없음. 다음 구현은 위 미완료 경로의 실제 동작 검증과 수정으로 진행한다.

## 에셋 표시·검색·방문 버전 누적 검증 (2026-09-05)

- 현재 작업 트리 전체 Jest 257 suites / 2264 tests 통과, 1 suite/test skipped, 55.912s. TEMP/gaesup-current-regression.log. 방문 버전 적용 차단, 연결 취소 시 대기 메시지 제거, 안경 메뉴·이름 검색, 미리보기 이미지 실패 복구·복제 skeleton 소유권·가시 영역 Canvas 수명과 next renderer 초기화 실패 cleanup을 포함한다.
- 전체 TypeScript, test:demo와 test:package 통과. TEMP/gaesup-current-demo.log 및 gaesup-current-package.log. 패키지 검사는 tarball을 설치한 별도 소비 프로젝트의 ESM/CJS 타입·런타임 smoke 및 Vite build를 포함한다. demo의 관리자 코드 지연 로딩·package surface 청크 검사도 통과했다. 기존 500kB 초과 청크 경고는 남아 있다.
- production 코드와 source of truth 및 호환성 계약은 이번 검증 턴에 변경하지 않았다. 실제 모바일 에셋 스크롤·안경 장착 검증은 scripts/probe-asset-previews.cjs와 examples-modernization plan의 후속 기록을 참조한다. 이번 전체 테스트 통과는 native WebGPU 전환, 대형 월드 성능이나 모든 UI의 시각 검증을 증명하지 않는다. 남은 메뉴·동적 문구 감사, 브라우저 오류 복구 시나리오와 main renderer 이관을 계속 진행한다.

## 저장·네트워크·편집 복구 누적 검증 (2026-09-05)

- 전체 Jest 255 suites / 2236 tests 통과, 1 suite/test skipped, 62.25s. TEMP/gaesup-modernization-regression.log. 건축 반복 작업 제한과 store 실패 보존, 스냅샷 대상 도메인 선택, 소켓 수명·ACK 실패, 채팅 오류 안내, 예제 오류 경로 복구 및 Studio의 runtime 저장 시스템 선택을 포함한다.
- test:package 통과: 라이브러리 빌드·선언 생성과 별도 소비 프로젝트 검증. TEMP/gaesup-modernization-package.log. 기존 500kB 초과 청크 경고가 남는다. 직전 Studio 변경 후 test:demo 통과 기록은 TEMP/gaesup-studio-runtime-demo.log이며 이번 검증 턴에는 production 변경이 없다.
- root TypeScript 통과. test:memory 5 suites / 88 tests 통과, TEMP/gaesup-modernization-memory.log. 실제 jest.memory.config.js는 AbstractBridge, ManagedEntity, bridge decorator, useManagedEntity와 useBatchManagedEntities만 포함하며 GPU 자원 수명 검증이 아니다.
- source of truth와 호환성 계약 변경 없음. 일부 실제 브라우저 UI·오류 시나리오, 대형 청크 개선 및 main renderer/R3F10/native WebGPU 검증은 계속 미완료다. 이 체크포인트는 전체 목표 완료를 뜻하지 않는다.

## 저장 준비·거래·모바일 배치 누적 빌드 검증 (2026-09-05)

- test:package 통과: ESM/CJS/타입 선언 재빌드, 별도 소비자 설치(95 packages), ESM/CJS 및 strict 선언 검사, import/require 실행, 소비자 Vite build. 준비 단계·경제 바인딩·거래 공간 검사까지 포함한 현재 코드 기준이다.
- test:demo 통과: 초기 정적 의존성 7 chunks / 516,412 JS bytes. 관리자 UI 1,592 bytes는 지연 로딩이며 AssetsPage도 독립 dynamic entry다. Three 1,757.18kB와 physics 2,259.59kB 청크 및 소비자 smoke bundle의 500kB 경고는 남는다. 이 검사는 실행 FPS나 native WebGPU를 증명하지 않는다.
- 직전 모바일 검사: 390x844에서 앱 셸의 toast 위치 override 수정 후 빠른 도구 겹침 해소, 세 메뉴의 Enter 토글, minimap 숨김/복원, 가로 overflow false, pageerror 0. TEMP/gaesup-world-tools-ksBiBP. 초기 UI 캡처이므로 3D 로딩 완료 증거가 아니다.
- 전체 Jest 최신 checkpoint는 경제 준비 단계 이전 264 suites / 2,371 tests 통과(1 skip)다. 이후 경제 준비는 관련 88 tests로 검증했으며 현재 전체 재실행으로 오인하지 않는다. 전체 원자성, main R3F10/native WebGPU, 나머지 UX 검증은 미완료다.

## 생활 도구·콘텐츠·보상 처리 누적 검증 (2026-09-05)

- 후속 test:package 통과: 현재 라이브러리 ESM/CJS/타입 선언 빌드, 임시 소비자 설치(95 packages), 타입 검사, runtime import/require, 소비자 Vite build 완료. dist/index.css에서 mailbox-panel 규칙도 확인했다. 소비자 번들 4,333.89kB의 큰 청크 경고는 남는다. 예제 의자 레시피 결과를 chair-basic으로 수정한 별도 통합 테스트까지 7 tests 통과, build/root 타입·예제 콘텐츠 ESLint 통과. 의자는 인벤토리 아이템이며 3D 배치 기능을 추가한 것은 아니다.

- 현재 작업 트리 전체 Jest는 270 suites / 2,425 tests 통과, 1 suite/test skipped, 64.674초다. 우편 부분 수령, 납품 이중 차감, 제작 공간 검사, 인벤토리 이동, 실시간 시계, 도감 재열기와 예제 콘텐츠 등록·생활 도구 연결을 포함한다.
- test:demo 통과. 초기 정적 의존성 7 chunks / 517,258 JS bytes, 관리자 UI 1,592 bytes 지연 로딩 유지. 우편함 스타일과 data-world-overlay 규칙의 최종 CSS 포함 검사를 추가하고 재실행해 통과했다. 생성된 임시 빌드는 검증 스크립트가 정리한다.
- 빌드 타입 검사와 검증 스크립트 문법 검사 통과. Three 및 physics의 500kB 초과 청크 경고는 남아 있다. 이번 누적 검증은 test:package, 최신 생활 도구의 브라우저 제작 흐름, native WebGPU와 하드웨어 성능 검증을 포함하지 않는다.
- 이번 변경 파일은 데모 검증 스크립트와 이 기록이다. runtime source of truth, 저장 형식, 공개 API는 변경하지 않았다. main R3F10/WebGPU 전환과 예제 전체 UX 완료를 의미하지 않는다.

## 저장 복원 준비 단계 (2026-09-05)

- DomainBinding.prepareHydrate를 선택적으로 추가하고 SaveSystem이 모든 준비를 완료한 뒤 적용하도록 변경했다. scene-document는 마이그레이션/검증을 준비 단계로 옮기고 기존 controller.dispatch 교체 경로를 유지한다.
- 준비 실패 시 앞선 legacy/prepared 바인딩도 적용하지 않는 회귀 검사, 직접 hydrate 호환 및 migration 1회 실행 검사를 포함해 save/scene-object/publicApi/packageExports 128 tests 통과. 빌드 타입·변경 production ESLint·build:types 통과.
- 준비 단계만 분리된 첫 slice다. 기존 바인딩 적용 중 오류와 구독 부수 효과를 포함한 전체 원자성은 미완료이며 후속 바인딩 이관이 필요하다. 저장 파일 형식 및 canonical scene source of truth는 유지한다.

## 로드 취소·네트워크 검증·성능 표시 누적 검사 (2026-09-05)

- 후속 공개 호환 경계: LegacyGrid를 root에서 노출하고 예제 Ground가 이를 사용한다. 기존 Drei Grid와 객체 동일성 검사를 포함한 publicApi/packageExports/World.loading 27 tests와 stable 타입·lint, test:demo, test:package 통과. alpha 타입 검사는 937 files / diagnostics0이며 legacyDrei 파일을 Drei11 /legacy로 가상 치환했다. 실제 main dependency나 native renderer 전환을 증명하지 않는다. 자세한 변경·미완료 범위는 renderer-modernization plan 참조.

- 현재 작업 트리 전체 Jest: 259 suites / 2285 tests 통과, 1 suite/test skipped, 72.391s. TEMP/gaesup-lifecycle-checkpoint-tests.log. 원격 캐릭터 skeleton 해제, 네트워크 메시지 runtime 검증, WorldSystems 초기 로드 취소·재진입, 활성 캐릭터 초기화 범위, BrainFlow 삭제 및 성능 패널의 메모리 미지원 표시를 포함한다.
- root TypeScript, test:demo, test:package 모두 통과. TEMP/gaesup-lifecycle-checkpoint-demo.log 및 gaesup-lifecycle-checkpoint-package.log. 패키지는 ESM/CJS 및 선언 빌드 후 별도 소비자 설치·타입·실행·Vite build를 검증한다. demo 관리자 초기 로딩 제외 검사도 통과했고 지연된 관리자 JS는 1,597 bytes다. 500kB 초과 청크 경고는 여전히 남아 있다.
- 별도 R3F10 alpha browser fixture의 초기화 취소·실패 및 장면 생성 전/후 configure 실패 검증은 renderer-modernization plan의 최신 결과를 따른다. 실제 backend는 WebGL2 fallback이었다. 주 의존성 전환 및 native WebGPU 검증을 이 전체 테스트 결과로 대신하지 않는다.
- 이번 누적 검증에서 production 코드·public API·persistent source of truth 변경 없음. 실제 UI 일부 시나리오와 메모리 표시의 브라우저 확인, 저장 도메인 간 실패 복구, 대형 청크 개선 및 main renderer 통합은 미완료다.

## 농사 상태 수명과 공유 시간 구독 (2026-09-05)

- plotStore가 영속 작물 수명을 소유하고 CropPlot unmount는 삭제하지 않는다. 명시적 unregisterPlot이 삭제 경로다. farming plugin과 standalone view는 단일 시간 구독을 공유한다.
- 21개 view와 2개 runtime context에서 구독 1개, 시간 변경당 tick 1회, 화면 밖 성장 및 마지막 owner 정리를 검증했다. 변경 없는 tick은 plot record를 복제하지 않는다.
- 관련 92 tests, memory 88 tests, 전체 Jest 280 suites / 2557 tests 통과(기존 1 suite / 1 test skip). 타입 검사·production ESLint·build:types 통과. 실제 브라우저 FPS/GPU 측정은 미실행이다.

## 집 상태 수명과 저장 좌표 표시 (2026-09-05)

- HousePlot cleanup에서 집 삭제를 제거했다. townStore가 영속 상태를 소유하고 화면은 저장된 위치·크기를 사용한다. 명시적 unregisterHouse는 유지하고 moveOut도 크기를 보존한다.
- geometry를 R3F 선언적 자식으로 전환하고 주민 구독을 해당 주민으로 좁혔다. StrictMode 기본 크기 렌더, 예약/입주 후 props 변경과 remount, hydrate 좌표/크기, 삭제 후 화면 제거를 실제 R3F test renderer로 검사했다.
- town 21 tests, build TypeScript, production ESLint, memory 88 tests 통과. Save version 1과 public exports 유지. R3F 내부 THREE.Clock deprecation 경고 존재. 전체 suite·package·browser/FPS/GPU 검사는 미실행.

## 비동기 저장 복원 순서 (2026-09-05)

- 같은 SaveSystem에서 마지막으로 시작한 load/hydrateBlob만 복원 권한을 가진다. 이전 read 응답은 false를 반환하고 domain에 적용하지 않는다. 최신 요청 실패/취소 후에도 이전 요청은 되살아나지 않으며 사전 취소 요청은 기존 요청을 무효화하지 않는다.
- 수정 전 stale-read 5개 실패를 재현했다. 수정 후 응답 순서 양방향과 새 요청 실패/누락/취소/직접 hydrate, 후속 정상 load를 포함해 save/runtime/publicApi/packageExports 124 tests 통과. build TypeScript와 production ESLint 통과.
- SaveSystem 내부 실행 세대만 추가했고 저장 형식과 public signature는 유지했다. 전체 적용 오류 rollback·adapter write 경합·브라우저 검증은 미완료다. active save-hydration-preparation plan에 후속 범위를 유지한다.

## 모바일 생활 도구와 미니맵 브라우저 검사 (2026-09-05)

- 현재 예제를 임시 Vite build/preview와 별도 Chromium으로 실행했다. 320×568에서 I/V/J/M/K로 가방·제작대·퀘스트·우편함·도감을 각각 열고 Escape로 닫았다. 다섯 창 모두 viewport 안에 있고 clientWidth와 scrollWidth가 같으며 pageerror는 0이었다. TEMP/gaesup-mobile-audit-wmh2E4에 화면 증거가 있다.
- 미니맵 모바일 width/height가 inline style에 덮이는 문제를 max-width/max-height로 수정했다. 수정 후 새 빌드에서 320×568 미니맵 외곽 114×114, desktop 1280×720은 기존 202×202를 확인했다. TEMP/gaesup-mobile-fixed-v2ZU2k. root TypeScript 통과.
- 이어 max-height 500px에도 같은 제한을 적용했고, 동일 빌드 페이지에 현재 AppShell CSS를 주입한 844×390 검사에서 114×114를 확인했다. 이 마지막 media 조건의 전체 재빌드는 미실행이다. screenshot world-landscape-css.png.
- 가로 화면 상단 성능 메뉴 잘림은 남은 UX 문제로 확인했다. Native WebGPU/FPS·모바일 실기기 검증은 수행하지 않았다. 검사에 사용한 Chromium과 임시 preview 서버는 종료했다.

## 상단 메뉴 반응형 후속 검사 (2026-09-05)

- nav의 auto width를 max-content와 border-box로 바꿔 가로 화면에서 불필요하게 줄어들던 메뉴 영역을 수정했다. 320px에서 10px 초과하던 주요 메뉴는 작은 화면 버튼 좌우 여백을 줄였다.
- 현재 소스 Vite build와 Chromium에서 320×568, 844×390, 1280×720의 주요 링크 5개가 모두 그룹 경계 안에 있고 scrollWidth=clientWidth임을 확인했다. 각 크기에서 개발자 메뉴도 viewport 안에 있고 Escape로 닫힌다. pageerror 0. TEMP/gaesup-nav-verified-3lp6NO에 screenshot이 있다. root TypeScript 통과.
- 개발자 메뉴 위를 덮던 환영 알림은 메뉴가 열렸을 때 toast layer를 nav보다 낮추도록 수정했다. 현재 examples CSS를 동일 빌드 페이지에 주입해 toast 변수 calc(120 - 1), nav 120을 확인했다. 이 마지막 CSS의 전체 재빌드는 미실행이다.
- 저장 상태/public API 변경 없음. Native WebGPU/FPS·실기기 및 로그인 후 추가 메뉴 폭은 이번 검사 범위 밖이다. 사용한 임시 preview와 Chromium은 종료했다.

## 생활 도구·저장·미니맵 누적 회귀 검사 (2026-09-05)

- 전체 Jest 287 suites / 2606 tests 통과, 기존 1 suite / 1 test skipped. 145.798초. TEMP/gaesup-current-regression.log. 집 수명, 상점 재진입, 저장 복원 요청 순서, 생활 도구 입력 처리와 미니맵 백그라운드 중단을 포함한 현재 트리 검사다.
- root TypeScript, build:esm, build:cjs, build:types, test:package:built 통과. 실제 별도 소비자 설치·타입·ESM/CJS·Vite 검증을 완료했다. TEMP/gaesup-current-package.log. 통합 test:package의 clean 단계는 실행하지 않았다.
- test:demo 통과. 최근 nav/toast/minimap CSS를 포함한 실제 build 확인이며 initial 7 chunks / 518658 JS bytes, 관리자 지연 1592 bytes. TEMP/gaesup-current-demo.log. 500kB 초과 Three/physics 청크 경고는 남아 있다.
- 이번 checkpoint 자체는 production 변경 없음. Native WebGPU main renderer 전환, domain commit 원자성, 실제 FPS/CPU 비교와 전체 제품 scenario 검증은 여전히 미완료다.

## GPU 눈 효과의 노드 렌더링 경로 (2026-09-05)

- `Snow gpu`가 WebGPURenderer에서 NodeGpuSnow를 lazy-load한다. 기존 WebGL Points shader는 유지한다. 노드 경로는 크기 표현을 위해 2000-instance Sprite를 사용하고 낙하/감김/흔들림 수식을 SnowNodeMaterial로 이관한다.
- Sprite 공용 geometry를 복제한 뒤 인스턴스 데이터를 붙이며 소유 geometry/material만 해제한다. 상태 소유권·저장 형식·public exports는 유지한다.
- 실제 R3F + 대체 node factory 검사와 기존 Snow lifecycle 총 8 tests, memory 88 tests, 타입·production lint·demo build 통과. WGSL/GLSL 생성 10조건 통과. 실제 native GPU/시각적 동등성/FPS 검증은 남아 있고 main World Canvas는 여전히 WebGL이다.

## 슬롯별 저장·삭제 순서 보장 (2026-09-05)

- SaveSystem은 같은 슬롯의 save/remove를 호출 순서대로 실행한다. snapshot은 save 호출 시 캡처하며 실패한 요청의 오류를 전달한 뒤 다음 요청을 진행한다. 다른 슬롯은 독립적으로 처리하고 완료한 큐는 제거한다. 도메인 store의 소유권·저장 형식·공개 메서드는 유지한다.
- 수정 전 신규 순서 테스트 5개 실패, 수정 후 save/runtime/publicApi/packageExports 129 tests 및 기존 memory suite 88 tests 통과. build TypeScript와 production ESLint 통과. memory suite는 저장 큐 자체의 메모리 측정이 아니다.
- 전체 테스트·브라우저 검증 미실행. 다른 SaveSystem/탭 사이 저장 동기화, read의 쓰기 대기 및 domain commit rollback은 보장하지 않는다. 상점·제작의 중간 실패 처리와 renderer/제품 시나리오 검증은 계속 남아 있다.

## 중복 정리한 개발자 메뉴의 브라우저 검증 (2026-09-05)

- probe-developer-navigation은 현재 소스를 임시 빌드하고 별도 preview/Chromium을 생성·정리한다. 기존 개발 서버는 변경하지 않는다. 320×568, 844×390, 1440×900에서 그룹·기존 카탈로그 링크·포커스·Escape·바깥 클릭·동일 경로 닫힘·가로 넘침 검사가 통과했다. 최종 직접 실행 종료0, pageerror 0, TEMP/gaesup-navigation-dIicu3.
- 최초 검증 실패는 스크립트의 존재하지 않는 heading 선택과 둥근 모서리 클릭 때문으로 수정했다. 모바일 및 가로 화면 이미지를 직접 확인했다. 빌드는 성공했으며 500kB 초과 청크 경고는 남아 있다. 이번 변경은 검증 스크립트와 기록에 한정되며 상태 소유권·호환 경로는 유지한다. 전체 제품 시나리오·로그인 메뉴·native GPU 검증은 미완료다.

## 긴 사용자 이름으로 인한 메뉴 소실 수정 (2026-09-05)

- 로그인 fixture에서 844px 화면의 주요 메뉴 폭 0px을 재현한 뒤 주요 메뉴 shrink 방지·사용자 이름 최대 너비/말줄임표를 적용했다. 전체 이름은 title로 유지한다. 인증 상태 소유권과 URL/API는 변경하지 않았다.
- 로그인/비로그인 Chromium 각 3개 화면 크기에서 메뉴 폭·로그아웃 가시성·기존 메뉴 동작 통과, pageerror 0. 실제 인증은 시험하지 않았다. 수정 후 로그인 가로 화면 TEMP/gaesup-navigation-LN7nhJ/menu-landscape.png 직접 확인. 비로그인 산출물 TEMP/gaesup-navigation-afK6ZE. 타입·production lint 통과, 전체 Jest 미실행. 전체 제품 시나리오·native GPU 검증과 거래 일관성 작업은 남아 있다.

## 날씨 효과 재생성과 자원 해제 수정 (2026-09-05)

- WeatherEffect는 실제 사용할 날씨 종류만 구독한다. 입자 계산에 사용하지 않는 세기 변경과 강제 종류가 있는 상태의 전역 날씨 변경으로 입자를 다시 만들지 않는다. 교체·맑은 날씨·unmount 시 소유 geometry/material을 해제한다. 상태 소유권·public props·입자 계산 방식은 유지한다.
- 실제 R3F 신규 테스트 2개가 수정 전 실패했고 수정 후 weather 9 tests, build TypeScript·production ESLint·기존 memory 88 tests가 통과했다. GPU 메모리/FPS·실제 브라우저·전체 Jest 검증은 미실행이다. main World의 WebGPU 전환은 완료되지 않았으며 날씨 점 크기·후처리·남은 셰이더 호환 검증을 계속해야 한다.

## 날씨 입자의 노드 렌더링 연결 (2026-09-05)

- WebGPURenderer에서 lazy NodeWeather와 WeatherNodeMaterial을 사용한다. 기존 CPU 위치 배열·이동 수식·카메라 따라가기를 유지하고 단일 인스턴스 Sprite에 동일 배열을 연결한다. WebGL Points 경로와 공개 props는 유지한다. 소유 geometry/material만 해제한다.
- weather 11 tests, WGSL/GLSL 생성 16조건, build/root 타입·production ESLint·기존 memory 88 tests·demo build 통과. 초기 정적 graph는 7 chunks / 519148 JS bytes다. R3F 테스트의 node material/renderer는 대체됐으며 실제 GPU 검증을 의미하지 않는다.
- 실제 브라우저 입자 크기·색·안개 비교, native GPU/FPS와 메인 월드 전환은 미완료다. source of truth는 기존 weather store와 WeatherEffect의 비영속 입자 배열이다. 전체 Jest는 이번에 실행하지 않았다.
