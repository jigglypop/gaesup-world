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
