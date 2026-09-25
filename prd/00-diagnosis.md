# PRD-00 진단: 뿌리 원인과 기준선

기준: `main` 8a0f3873 + 작업 트리(2026-09-25).
근거:
- 2026-09-24~25 코드 정독.
- 이전 판 PRD 항목 346개의 상태 감사. 항목마다 반박 검증을 거쳤다.
- 코드 전체 성능 탐색. 95건 중 86건이 확인됐다.

## 1. 요약

지금까지의 개선은 증상 단위였다. 카메라 충돌, 잔디 chunk, NPC LOD처럼 하나를 고치면 같은 종류의 문제가 다른 도메인에서 다시 나왔다. 원인은 다섯 가지 구조 문제다. 3판 PRD는 이 원인을 없애는 순서로 짰다.

## 2. 뿌리 원인

### RC-1 데이터 원본이 여럿이다 [확인]

| 대상 | 사본 | 위치 |
|---|---|---|
| 엔티티 개념 | 7 | `SceneObject`(`scene-object/types.ts:31-56`), `NextWorld`(`next/core/World.ts:24`), `WorldObject`(`world/core/WorldSystem.ts:10-21`), `BlueprintEntity`(`blueprints/core/BlueprintEntity.ts:9-65`), `PlacedObject`(`building/types/index.ts:104-140`), NPC instance(`npcStore` + `NPCSimulation` pose), `EntityStateManager`·`ManagedMotionEntity`(`motions/`) |
| 트랜스폼 | 6 | SceneDocument euler, `TransformStore`, `WorldObject` Vector3, npcStore position과 NPC pose, `EntityStateManager`(Rapier 값 복사), 스크립트 핸들(`scripting/ScriptRuntime.ts:276-282`) |
| world model | 5 | `buildingStore`, `SceneDocument`, `WorldSystem`, gaesupStore `worldStates`, `NextWorld` |
| 편집/플레이 모드 | 4 | `createEditorPlayModeController`(호출 0), `editorSlice.playMode`, `ScriptPlayModeSource`, `buildingStore.isInEditMode()`(실제 역할, 소비 5곳) |
| 날씨 상태 | 2 | `buildingStore.weatherEffect/showSnow`, `weatherStore` |

결과:
- 플레이어, NPC, 타일이 Hierarchy에 나오지 않는다.
- 에디터가 `BuildingPanel`(store 편집)과 Hierarchy/Inspector(`SceneDocument` 편집) 둘로 갈라진다.
- Play 중 스크립트 변경이 저작 문서에 기록되고 자동 저장된다(`ScriptRuntime.ts:408`).

### RC-2 실행 순서와 수명이 React에 묶여 있다 [확인]

- **스케줄러가 4종이다.** `FRAME_PHASES`, `SIMULATION_PHASES`, `TaskGraph`, `AbstractSystem`이다. 렌더 출력 없는 React 컴포넌트가 시스템 역할을 한다(building RenderState·Visibility·NavigationObstacle Driver). 실행 순서가 mount 순서에 달려 있고 캔버스 없이는 돌지 않는다.
- **물리 바디가 React 컴포넌트(`RigidBody`)다.**
  - 재렌더마다 바디 옵션이 WASM으로 다시 적용된다.
  - 거리 LOD가 collider 수명을 정한다(`world/components/PassiveObjects:115-133`).
- **Suspense 경계가 월드 전체에 하나뿐이다**(`world/components/WorldContainer/index.tsx:171`). NPC 스폰, 의상 교체, 새 오브젝트처럼 새 GLB가 하나라도 들어오면 월드 전체가 사라진다.

결과: headless 테스트와 서버 시뮬레이션이 불가능하다. 순서가 어긋나는 버그가 생기고, 로딩 중 월드가 사라진다.

### RC-3 렌더 단위가 React 컴포넌트다 [확인]

- **그룹·타일·NPC 파츠마다 컴포넌트가 있다.** 편집 1회가 다음을 새로 만든다.
  - 그룹 전체의 잔디 blade(`building/components/mesh/grass/chunks.tsx:52`, 400타일 그룹 약 70ms)
  - 지형 측면(`TileSystem/index.tsx:91`, O(N²))
  - 모래·눈밭(`mesh/sand.tsx:60`, O(N²))
  - 프리셋 벽 batch(`WallSystem/batch.tsx:71`)와 블록 batch(`BlockSystem/index.tsx:170`)
- **편집 오버레이를 타일마다 mesh 하나로 그린다**(`TileSystem/index.tsx:737`). 타일 1만 개면 draw 1만 회다.
- **NPC 파츠마다 skeleton과 mixer가 따로 있다**(`npc/components/NPCInstance/index.tsx:94`). 화면 밖 NPC도 매 프레임 갱신한다.
- **셰이더 사전 컴파일이 후처리 경로에서 효과가 없다.** `CompileGate`가 후처리 pass와 다른 render context로 컴파일해(`rendering/CompileGate.tsx:26`), 후처리를 켠 월드는 첫 draw에서 동기로 다시 컴파일한다.

결과: 편집할 때 수십~수백 ms 스파이크가 나고, draw call과 commit이 개수에 비례한다.

대조: 대표 데모 minihome은 라이브러리의 R3F 월드 대신 three를 직접 다루는 자체 엔진(`examples/minihome/roomEngine.ts`)으로 이 문제를 피했다. 코어가 제품 요구를 받치지 못한다는 신호다.

### RC-4 전역 상태와 import 부수효과 [확인]

- **전역 store와 fallback:** 모듈 최상위 store 약 36개. `?? useXStore` fallback 31곳, `BridgeFactory.getOrCreate*` 7곳이다.
- **import만으로 전역 등록이 일어난다.** `reflect-metadata`, `initializeBridges()`, `enableMapSet()`, `registerDefaultReinforcementAdapter()`, R3F `extend` 4곳이 그렇다.
- **`GaesupRuntime`이 닫힌 struct다.** 33개 도메인을 import하고, 게임플레이 store 12종을 옵션과 무관하게 모두 만든다(`runtime/createGaesupRuntime.ts:80-103`).

결과:
- world 여러 개가 상태를 공유하고, 테스트마다 전역 reset이 필요하다.
- 엔트리 경계가 무너진다. `runtime` 엔트리 폐포가 432파일, 49개 도메인이다.
- 타입 수준 도메인 SCC가 42다.

### RC-5 측정이 운영을 대표하지 않는다 [확인]

- **frame harness가 vite dev 서버를 잰다**(`scripts/frame-harness.cjs:261`). development React와 dev 전용 수집기가 켜진 상태다.
- **성능 게이트가 draw call에도 ms와 같은 15% 허용치를 쓴다**(`frame-harness.cjs:251-256`). draw call이 늘어도 통과한다.
- **기준 장면에 빠진 것이 많다.** NPC, 원격 플레이어, 편집·궤도 경로, commit 계측이 없다. 그림자 frustum은 기본 ±5m다(`examples/world/PerfWorld.tsx:24`).
- **CI가 실행된 적이 없다.** 로컬 main이 origin보다 28커밋 앞서 있어 새 CI workflow가 GitHub에서 돈 적이 없다. PR 단계에는 브라우저 검사가 없다.
- **회귀 장치 일부가 깨져 있다.** 삭제된 라우트를 여는 probe 8개가 동작하지 않는다(`browser-smoke`, `probe-webgpu-world`, `probe-social-world`, `probe-editor-return`, `probe-creator-menu`, `probe-multiplayer-panel`, `probe-toon-water`, `probe-avatar`). fixture와 벤치 일부가 내부 경로(`/src/core/...`)를 import해 코어를 바꾸면 깨진다.

결과: "고쳤다"를 판정할 수 없다. 01 문서가 이 원인을 없앤다.

## 3. 증상과 원인

이번 성능 탐색에서 확인된 문제 중 심각도 상·중을 원인별로 묶었다. 처리 항목은 새 ID다.

| 증상 | 위치 | 비용 | 원인 | 처리 |
|---|---|---|---|---|
| revision 없는 도메인이 하나라도 있으면 변경 없는 저장 skip이 통째로 꺼짐. 런타임이 `gameplay-events`를 revision 없이 항상 등록 | `save/core/SaveSystem.ts:264-271`, `runtime/createGaesupRuntime.ts:440` | autosave·탭 숨김마다 전 도메인 직렬화 | RC-1 | AST-06a(M0) |
| minihome 기본 설정에서 렌더 루프가 멈추지 않음 | `examples/minihome/roomEngine.ts:306` | 대기 중 60Hz bloom·그림자 | 기본값 결함 | DOM-11a(M0) |
| 월드 Suspense 하나라 새 GLB가 월드를 숨김 | `WorldContainer/index.tsx:171` | 새 URL마다 0.1~1초 공백 | RC-2 | REN-06 |
| 로드 직렬 워터폴(렌더러 → Rapier → 본체 GLB → Draco → 파츠 → wasm), 선로드 0 | `world/components/WorldPhysics/index.tsx:53` | [추정] 0.5~1.3초 | RC-2 | REN-06 |
| 잔디 그룹 전체 재생성, 편집마다 blade 무작위 변화 | `mesh/grass/chunks.tsx:52` | 400타일 약 70ms, 2천 타일 약 300ms | RC-3 | REN-10 |
| 프리셋 벽·블록 batch 재생성 | `WallSystem/batch.tsx:71`, `BlockSystem/index.tsx:170` | 편집당 약 50ms | RC-3 | REN-01 |
| 편집 오버레이 타일마다 mesh | `TileSystem/index.tsx:737` | 타일 1만 개면 draw 1만 | RC-3 | REN-04 |
| 지형 측면·모래 O(N²), 프리셋 클릭이 모든 그룹 재빌드 | `TileSystem/index.tsx:91`, `mesh/sand.tsx:60` | 3천 타일 그룹 최대 313ms | RC-3 | REN-10 |
| WebGL 상주 변경마다 world batch 전체 재기록 | `BuildingSystem/index.tsx:124` | 경계 통과마다 수~수십 ms | RC-3 | REN-03 |
| NPC 파츠별 skeleton·mixer, 화면 밖 갱신 | `NPCInstance/index.tsx:94` | NPC 30체면 1.5~5ms/frame | RC-3 | REN-09 |
| `CompileGate`가 후처리 context를 컴파일하지 못함 | `rendering/CompileGate.tsx:26` | 새 재질당 약 90ms, 빌보드 약 246ms | RC-3 | REN-05 |
| 후처리 로딩 중 fallback 렌더로 컴파일한 뒤 pass에서 전부 재컴파일 | `rendering/postprocess/WorldPostProcessing.tsx:418` | [추정] 로드 직후 1~2초 정지 | RC-3 | REN-05 |
| GPU batch 재질·compute kernel이 첫 draw에 동기 컴파일 | `rendering/GpuBatchBridge.tsx:194` | 로드·첫 배치 시 수백 ms | RC-3 | REN-05 |
| 잔디가 JS로 만든 뒤 wasm 도착 시 재생성·재업로드 | `mesh/grass/Grass.tsx:430` | chunk당 약 15~30ms × 2 | RC-2 | REN-10 |
| NPC 편집 패널이 NPC 목록 전체 구독 | `editor/.../BuildingPanel/NPCPanel.tsx:26` | 결정 틱마다 1~3ms commit | RC-1 | EDT-03 |
| BlueprintPreview가 메인 월드 store·runtime을 직접 변경 | `blueprints/components/BlueprintPreview/index.tsx:130` | 선택마다 메인 플레이어 모델 교체 | RC-4 | EDT-05 |
| BlueprintPreview 두 번째 Canvas가 입력 없이 매 프레임 렌더 | `BlueprintPreview/index.tsx:165` | [추정] iGPU 1~3ms/frame | RC-3 | EDT-05 |
| `MultiplayerCanvas` HDR을 raw.githack.com에서 받아 월드 전체 대기 | `networks/components/MultiplayerCanvas.tsx:113` | 외부 CDN 1~2MB, 장애 시 캔버스 오류 | RC-2 | DOM-08 |
| minihome 지형 버퍼 전체 업로드(pointermove마다 약 6~8.7MB), 커밋마다 잔디 13.6만 blade 재생성, 대기 중 그림자 15Hz | `examples/minihome/roomTerrain.ts:17`, `roomEnvironment.tsx:49`, `roomEngine.ts:309` | 칠하기 중 수백 MB/s | 예제 | DOM-11 |
| 기본 경로 minihome이 루트 barrel로 rapier·editor·postprocessing을 로드 | `examples/minihome/apiChecks.ts:10` | 첫 로드 JS 5.4MB(gz 1.77MB) | RC-4 | PKG-01 |
| frame harness가 dev 서버를 잼, 기준 장면 지표 누락 | `frame-harness.cjs:261`, `PerfWorld.tsx:24` | 판정 불가 | RC-5 | VER-03, VER-05 |

심각도 하 항목은 해당 문서의 "작은 항목" 표에 있다.

## 4. 기준선 [실측]

### 4.1 규모

| 항목 | 값 |
|---|---|
| src 비테스트 ts/tsx | 약 1,027파일, 110,305줄(2026-09-24) |
| 테스트 | 426 suites, 3,097 tests(2026-09-25) |
| 공개 엔트리 | 루트 + 서브패스 15개 + `style.css`. 루트 runtime export 1,082개 |
| 배포 패키지 | 압축 2.76MB, 해제 14.17MB. `public/gltf` 8.36MB(59%) |

### 4.2 검증 명령(2026-09-25, 작업 트리)

| 명령 | 결과 |
|---|---|
| typecheck, lint, `check:layer1`, `check:entries`, `check:quality`, `test:harness` | 통과 |
| jest | 426 suites, 3,097 tests 통과(1 skip) |

### 4.3 브라우저

| 장면 | 조건 | 값 |
|---|---|---|
| minihome `/` | 커밋 ff92fd7e, RTX 5060 Ti, WebGPU, dev 서버 | CPU script 2.28ms/frame, heap 112KB/frame, draw 137, `render()` 14.31/frame, 약 71.4만 삼각형 |
| `/world?size=m` | 2026-09-25 개선 후, dev 서버 | 약 45fps(vsync), script 9.5ms/frame, 할당 334KB/frame, GC 11회/20초, draw 약 238, geometries 401, textures 98 |

두 값 모두 dev 서버 측정이라 VER-03 이후 운영 빌드로 다시 잰다. S·L 규모는 아직 재지 않았다.

jest의 vm 컨텍스트에서는 전역 조회가 느려, 같은 코드가 순수 Node보다 수십~수백 배 느리게 나온다. 예를 들어 20k 타일 bounds 계산이 jest에서 9.7ms, 순수 Node에서 0.06ms다. 절대값 벤치는 순수 Node에서 잰다.

### 4.4 번들

| 엔트리 | 정적 폐포 raw | gz |
|---|---|---|
| 루트 | 1,810,767 | 468,915 |
| editor | 1,135,021 | 282,654 |
| runtime | 691,741 | 191,413 |
| building | 686,462 | 176,957 |

`{ createSceneDocument, createSceneDocumentController }` 두 개만 import해도 115KB gz이고 `@xyflow/react`가 따라온다.

## 5. 남은 정확성 결함

| ID | 결함 | 근거 | 처리 |
|---|---|---|---|
| D-06 | authority router가 `verifyActor` 미지정 시 경고 없이 actor 검증 생략 | `networks/adapter/authority.ts:222` | DOM-08 |
| D-07 | visit room에서 임의 피어가 `VisitLeave`로 격리 종료 | `networks/visit/useVisitRoom.ts:156-157` | DOM-08 |
| D-10 | 프로젝트 설정 `timeStep`·`maxSubSteps`가 runtime clock에 연결되지 않음 | `time/core/timeClock.ts:12` | COR-05 |
| D-11 | 입력 객체를 store 안에서 in-place 변경 | `interactions/core/InteractionSystem.ts:206-213` | DOM-05 |
| D-14 | 공용 glTF 로더에 Draco·KTX2 없음. 번들 `ally*.glb` 9개는 Draco 필수 | `assets/gltfLoader.ts:5-7` | AST-01 |
| D-17 | 접지 상태가 entityId 키 전역 Map | `motions/core/system/groundContacts.ts:1` | COR-07 |
| D-18 | `WorldSystem` position identity 계약이 문서화되지 않음 | `world/core/WorldSystem.ts:74-79` | DOM-02(EntityWorld로 대체) |
| D-21 | CJS 빌드가 ESM 전용 `three/webgpu`·`three/tsl`을 require | dist CJS | PKG-02(2.0) |

결함은 해당 항목의 첫 slice로 처리하고, 수정 전에 실패하는 재현 테스트를 먼저 둔다.

## 6. 보존 자산

아래 구현은 새 코어에서 교체하지 않고 확장하거나 그대로 쓴다.

| 자산 | 위치 | 새 구조에서의 역할 |
|---|---|---|
| `FrameScheduler`, `useEngineFrame`, `useSharedFrame` | `runtime/frame/` | presentation lane의 실행기 |
| `FixedStepClock` | `simulation/` | fixed lane의 실행기 |
| `SceneDocument`(순수 command, 증분 검증, migration, `SceneObjectDelta`, saveBinding) | `scene-object/` | 저작 원본 |
| `NextWorld`(generational id, SoA `TransformStore`) | `next/core/` | `EntityWorld`의 기반 |
| readback 없는 GPU-driven 인스턴스, `GpuBatchBridge` | `next/backend/`, `rendering/` | RenderWorld의 WebGPU 경로 |
| `BuildingRenderSnapshot` SoA와 dirty-range `writeBuffer` | `building/render/` | batch 업로드 방식 |
| `BuildingSpatialIndex`, `SpatialGrid` | `building/stores/`, `world/core/` | 공간 조회 |
| `GLTFAssetCache` 참조 카운트 | `assets/` | 통합 캐시의 기준 |
| `SaveSystem` prepareHydrate/rollback, 슬롯별 큐 | `save/core/` | 저장 경로 |
| `AnimatorRuntime` | `animation/core/animator/` | 애니메이션 결정의 단일 경로 |
| `server-contracts` 격리, 수신 데이터 방어 | `src/server-contracts.ts`, `networks/` | 서버 경계 |
| export snapshot, 계층·엔트리 검사, quality ratchet | `src/__tests__/`, `scripts/` | 회귀 방지 |
| strict TS(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | `tsconfig.json` | 유지 |
