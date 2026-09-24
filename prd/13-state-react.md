# PRD-13 상태 관리와 React 렌더링

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Epoch(13-a~c는 Fast) |
| 선행 PRD | 10(기준 장면) |
| 담당 agent | runtime, architect(store 분할) |

## 1. 배경과 문제

selector 규율은 잘 지켜진다. src에서 selector 없이 store 전체를 구독하는 곳은 0건이고, 매번 새 객체를 반환하는 selector도 0건이다. EMPTY 상수 패턴 덕분에 zustand v5의 불안정 selector 문제도 없다. 문제는 **무엇을 store에 넣는가**와 **얼마나 넓게 구독하는가**다.

1. 공간 인덱스(Map/Set)가 immer state 안에 있어 타일 하나를 편집할 때 O(N) 복사가 일어나고, 하위 driver 5~6개가 전체를 다시 계산한다.
2. 포인터가 움직일 때마다 렌더 본문에서 placement engine을 통째로 다시 만든다.
3. 에디터 패널이 store 필드 110개를 한 번에 구독하고, hover 위치와 NPC 인스턴스까지 포함한다.
4. 입력, GPU 컬링 카메라 행렬처럼 고빈도 값이 전역 store를 거친다.

## 2. 목표 / 비목표

**목표**
- 편집 1회 비용을 O(변경량)으로 만든다.
- hover, 입력, 카메라 이동이 React commit을 일으키지 않게 한다.
- 대형 store(buildingStore 1,664줄, npcStore 1,010줄)를 책임별로 나눈다.

**비목표**
- zustand 교체.
- store 구독 규칙(selector 필수) 변경.

## 3. 현재 상태

집계 [실측]: store 생성 43회(per-world factory 28, 모듈 최상위 14, lazy 1), `useShallow` 10회, 구독 지점 `useGaesupStore` 69 / `useBuildingStore` 83 / `useNPCStore` 21.

### 3.1 High

**13-F01 타일 하나 편집에 O(N) 복사, 파생 인덱스 전체 재구축** [확인, 비용은 immer 동작 기반 추정]
- `building/stores/buildingStore.ts:51` `enableMapSet()`, `:304-305` `create(immer(...))`.
- `:119-124` `tileIndex: Map<number, Set<string>>`, `tileCells`, `tileMeta`, `wallIndex`가 immer state 안에 있다.
- `:930-967` `addTile`이 `group.tiles.push`, `state.tileMeta.set`, `indexAabb(state.tileIndex, ...)`. immer Map draft는 첫 쓰기에 `new Map(base)`를 만들고 finalize에서 전체를 순회한다. autoFreeze 기본 활성.
- 하위 재계산:
  - `BuildingRenderStateDriver/index.tsx:19-29` `buildBuildingRenderSnapshot({ wallGroups: Array.from(...), ... })`
  - `BuildingVisibilityDriver/index.tsx:60-68` `buildVisibilityIndex(...)`
  - `BuildingNavigationObstacleDriver/index.tsx:37-57`, `building/navigation.ts:126-128` `navigation.reset()` 후 전체 재적용
  - `editor/.../BuildingPanel/index.tsx:242-259`, `BuildingUI/index.tsx:294` id → group 역인덱스 매번 생성
  - `ui/core/MinimapSystem.ts:290-330` tileGroups identity 변경 시 전체 재그리기
- 영향 [추정]: 배치 1회에 O(N) 패스 약 7회. 10k 타일 이상에서 long task.

**13-F02 hover마다 렌더 본문에서 placement engine 재생성** [확인]
- `building/components/PreviewTile/index.tsx:59-62` 렌더 중 `checkTilePosition(...)`. `PreviewBlock/index.tsx:22` 동일.
- `buildingStore.ts:1317,1339` `createBuildingPlacementEngine(tileGroups.values(), wallGroups.values(), { blocks })`.
- `building/model/placement.ts:325-360` 모든 tile/wall/block을 entry로 바꾸며 tags·footprint 배열 생성, `engine.place()`가 문자열 키 `${x}:${z}:${level}`(`SquareGridAdapter.ts:61`)로 재인덱싱.
- hover 발생원: `hooks/useBuildingEditor.ts:135-137` `setHoverPosition(raycastStackable())`(snap 셀 변경마다, snap off면 mousemove마다).
- 영향 [추정]: 타일 5k에서 포인터 이동 1회에 수만 개 객체·문자열, GC 스파이크. store에는 이미 증분 유지되는 `tileIndex/tileMeta/wallIndex`가 있어 중복 작업이다.

**13-F03 에디터 패널의 사실상 전체 구독** [확인]
- `editor/components/panels/BuildingPanel/state.ts:11-121` 필드 110개, `hoverPosition`(18), `tileGroups`, `wallGroups`, `meshes`(76-78) 포함. `:135-137` `useShallow(pickStoreFields(...))`. `:138-158` NPC `instances`, `templates` 구독.
- `hoverPosition`은 NPC 섹션에서만 쓴다(`BuildingPanel/index.tsx:868`).
- `BuildingUI/index.tsx:156-260` 필드 108개 `useShallow`.
- 영향: hover 셀 변경, 타일 편집, NPC 관찰 tick마다 957줄 패널과 2,074줄 단일 컴포넌트 `NPCBrainSection`이 재렌더. 변경마다 110필드 shallow 비교.

**13-F04 NPC 목록 전체 재렌더** [확인]
- `npc/components/NPCSystem/index.tsx:24` `useNPCStore(s => s.instances)`, `:34` `useBuildingStore(s => s.hoverPosition)`, `:23` `useThree()` selector 없음.
- `:136-150` `<NPCInstance onClick={() => {...}} />` inline 함수가 `React.memo`(`NPCInstance/index.tsx:139`)를 무력화.
- `npcStore.ts:789-794` `state.instances.set(id, { ...instance, lastObservation })`(immer Map 복사).
- `editor/components/panels/StudioPanel/index.tsx:92-97` instances 변경마다 모든 NPC blueprint 재변환.
- 영향: decision tick, 에디터 hover, NPC 변경마다 NPCSystem과 모든 NPCInstance(RigidBody 포함) reconcile.

### 3.2 Medium

| ID | 발견 | 근거 |
|---|---|---|
| 13-F05 | BuildingSystem 자식 memo 없음, WallSystem이 전체 `wallGroups` Map 수신 | `BuildingSystem/index.tsx:245-266`, `WallSystem/index.tsx:277,296-299` `useMemo(() => buildWallBatches(...), [wallGroup, wallGroups, meshes])`. 벽 하나 수정에 모든 벽 그룹 batch 재구축 |
| 13-F06 | GPU 컬링 카메라 행렬이 readback마다 zustand state로 | `BuildingGpuCullingDriver/index.tsx:360-388` `viewProjection: toArray()`, `setResult({ ...parsed, camera })`. `BuildingVisibilityDriver/index.tsx:52` 구독 |
| 13-F07 | 입력 스냅샷 전역 broadcast와 in-place mutation(D-11) | `input/WorldGamepadInput.ts:94,140` → `interactions/stores/slices.ts:176-188` 새 state. 반대로 `InteractionSystem.ts:206-213`, `adapter.ts:431-441` `Object.assign(state.keyboard, input)`로 identity 불변 |
| 13-F08 | 공개 `usePlayerPosition` 기본값이 매 프레임 재렌더 | `motions/hooks/usePlayerPosition.ts:75` `reactive = true`, `:121` 변화 확인 없이 `forceUpdate`. 내부 소비자 9곳은 모두 `reactive:false` |
| 13-F09 | gaesupStore 안의 두 번째 world model | `stores/gaesupStore.ts:23,39` `createWorldSlice`, `world/stores/slices/worldStates/slice.ts:5-60` 작업마다 `new Map(state.tiles)`. 사용처는 `examples/performance/scenarios/configuration.tsx:19-20`뿐(21 PRD) |
| 13-F10 | devtools 무조건 적용 | `gaesupStore.ts:28`. 확장 설치 시 입력·perf 갱신마다 THREE 객체 포함 state 직렬화 |
| 13-F11 | 상호작용 프롬프트 12.5Hz 재렌더 | `interactionsStore.ts:76-77` 0.05m 변화마다 `set`, `InteractionPrompt/index.tsx:57` 거리 표시 |
| 13-F12 | 원격 아바타가 네트워크 메시지마다 React 재렌더 | 14 PRD 14-F03 |
| 13-F13 | `PerformanceCollector`가 production에서도 4Hz로 store 갱신 | `world/components/WorldContainer/index.tsx:6,164`가 항상 마운트하고 editor 모듈(`editor/components/panels/PerformanceCollector.tsx`, 1줄 re-export)을 거쳐 import한다. `perf/PerformanceCollector.tsx:27-51`이 `setPerformance`를 호출하고, 삼각형 수가 카메라 이동마다 바뀌어 dedupe가 거의 막지 못한다. dev에서는 `setFramePhases`도 매번 호출. 구독자 전체와 devtools(13-F10)가 깨어난다 [확인] |

### 3.3 Low

| 위치 | 내용 |
|---|---|
| `scopedStore.ts:11`, `gaesupStore.ts:67` 등 10곳 | 공개 hook이 selector 없는 overload 허용 |
| `stores/domain/*` 4개, `networkStateStore`, `networkConfigStore`, `editor/hooks/useEditor.ts:8-36` | 미사용 store·hook(24 PRD) |
| `building/stores/presets.ts:55-60,132,139` | import 시점과 hook 본문에서 localStorage 읽기 |
| `worldObjectStore.ts:16` | render 중 bridge 구독, 해제 없음 |
| `examples/performance/scenarios/characterScene.tsx:19` | `useRoomVisibilityStore()` selector 없음(examples) |

## 4. 요구사항

**FR**
- FR-13-01: 공간 인덱스(`tileIndex`, `tileCells`, `tileMeta`, `wallIndex`)를 immer state 밖의 mutable `BuildingSpatialIndex`로 옮긴다. store factory closure가 소유하고 hydrate 때만 전체 재구축한다. state에는 `indexRevision`만 둔다.
- FR-13-02: building 변경을 `{ added, removed, updated }` id delta와 그룹별 revision으로 발행한다. render snapshot, visibility, navigation, minimap은 delta로 증분 갱신한다.
- FR-13-03: id → group 역인덱스를 store가 소유한다. UI는 조회만 한다.
- FR-13-04: 배치 검사는 `BuildingSpatialIndex` 후보 조회로 한다. placement engine을 hover마다 만들지 않는다. 과도기에는 `(tileGroups, wallGroups, blocks)` identity를 키로 engine을 memo한다.
- FR-13-05: 입력(keyboard, mouse, gamepad)은 zustand store에서 빼고 revision 기반 `useSyncExternalStore`와 frame loop ref 읽기로 제공한다. store에는 `isActive` 같은 저빈도 flag만 둔다.
- FR-13-06: 에디터 패널은 섹션 leaf에서 필요한 필드만 구독한다. action은 `useBuildingStoreApi().getState()`로 접근한다.
- FR-13-07: NPC 목록은 추가·삭제 시에만 바뀌는 `instanceIds`를 구독하고, `NPCInstance`가 자기 인스턴스를 개별 구독한다. `onSelect(id)`는 안정 참조로 전달한다.
- FR-13-08: `lastObservation`, `lastDecision` 같은 휘발성 brain 데이터는 React 밖 side table에 둔다(11 PRD FR-11-05와 공유).
- FR-13-09: GPU 컬링 결과는 store에 `version`과 bitset만 둔다. 카메라 행렬은 ref로 전달한다.
- FR-13-10: `usePlayerPosition`의 `reactive` 기본값을 `false`로 바꾸거나 변경 여부 확인 후에만 `forceUpdate`한다.
- FR-13-11: devtools는 `enabled` opt-in으로 바꾼다.
- FR-13-12: buildingStore를 `buildingEditorStore`(도구 상태, 비영속, `current*` 약 70개)와 `buildingDataStore`(영속 데이터)로 나눈다. `initializeDefaults`의 데모 데이터 약 370줄은 data 파일로 옮긴다.
- FR-13-13: npcStore를 catalog(template/clothing/animation), instance, brain side table, action executor로 나눈다.
- FR-13-14: `PerformanceCollector`는 성능 패널이 열렸거나 `performance` 옵션이 켜졌을 때만 마운트한다. `WorldContainer`는 `perf/`에서 직접 import한다.

**NFR**
- NFR-13-01: 타일 1개 추가 `set`은 타일 수와 무관(10k 타일에서 < 1ms 목표).
- NFR-13-02: hover sweep 중 placement engine 생성 0, `BuildingPanel` render 0(패널 표시 값이 불변일 때).
- NFR-13-03: 정지 카메라 React commit 0/s, 궤도 ≤ 2/s.
- NFR-13-04: store 분할 후에도 공개 hook 이름과 selector 시그니처는 유지한다.

## 5. 설계

### 5.1 buildingStore 분리

```
buildingDataStore (zustand, immer 없음 또는 얕은 복사)
  ├─ tileGroups / wallGroups / blocks / objects      ← 영속, SaveSystem binding
  ├─ revision, groupRevisions
  └─ changes: ring buffer of { kind, ids }            ← 구독자가 lastSeen 이후 delta 소비
BuildingSpatialIndex (closure 소유, mutable)
  ├─ tileIndex / tileCells / tileMeta / wallIndex
  ├─ groupOf(id)
  └─ query(aabb, out)                                ← placement, support height, collision
buildingEditorStore (zustand)
  └─ editMode, current*, hoverPosition, selection    ← 비영속
```

- mutation 함수는 데이터 변경 → 인덱스 증분 갱신 → `revision++` → delta push 순서로 한 곳에서 처리한다. 이 함수가 21 PRD의 canonical write path adapter가 된다.
- 기존 `useBuildingStore(selector)`는 두 store를 합친 facade로 유지하고 내부에서 분기한다(strangler). 새 코드는 분리된 hook을 쓴다.

### 5.2 hover와 배치 검사

`checkTilePosition`은 `BuildingSpatialIndex.query(footprintAabb, scratchOut)`로 후보만 모은 뒤 기존 `PlacementEngine`의 판정 함수를 후보에만 적용한다. `PreviewTile`은 렌더 본문 대신 `useMemo([cellKey, revision])`에서 호출한다.

### 5.3 입력 경로

`WorldInputBackend`가 이미 snapshot과 listener를 갖고 있으므로 이를 canonical 입력 소스로 둔다. `interaction` slice의 `keyboard/mouse/gamepad` 필드는 `@deprecated` getter로 남기고 backend snapshot을 반환한다. React 소비자는 `useInputSnapshot(selector)`(`useSyncExternalStore` + revision)를 쓴다. in-place mutation(D-11)은 backend 내부로 한정되고 외부에는 revision이 바뀐 snapshot만 노출한다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 13-a | placement engine identity memo(과도기), `PreviewTile`/`PreviewBlock` 호출 위치 변경. 완료(2026-09-25): 배치 엔진을 tileGroups·wallGroups·blocks identity로 memo하고 PreviewTile·PreviewBlock 검사를 hover 셀·데이터 identity 키의 `useMemo`로 옮겼다. 60셀 hover sweep(데이터 변경 3회) 엔진 생성 59→3. 13-d 잔여에서 엔진을 쓰지 않게 되어 memo는 제거했다 | hover sweep 중 engine 생성 = 데이터 변경 수 |
| 13-b | NPC `onClick` 안정화, `useThree` selector, hover 구독 제거(`getState()`로 읽기). 완료(2026-09-24): `onSelect` 추가, hover·instances를 클릭 시점에 읽음 | NPC 30체 hover 중 NPCInstance render 0 |
| 13-c | devtools opt-in, `usePlayerPosition` 변경 확인, 프롬프트 거리 양자화 | 정지 캐릭터에서 `usePlayerPosition` 소비자 render 0 |
| 13-d | `BuildingSpatialIndex` 분리(FR-13-01), 배치 검사 후보 조회(FR-13-04). FR-13-01 완료(2026-09-24): 인덱스 Map 6개를 immer가 draft하지 않는 `BuildingSpatialIndex` 인스턴스로 옮기고, hydrate는 새 인스턴스를 채워 적용 시 교체한다. `addTile` 중앙값 1만 타일 5.51→1.04ms, 2만 타일 11.85→2.78ms. 남은 O(N)은 그룹 `tiles` 배열 복사(13-e, 13-j). `indexRevision`은 구독자가 생길 때 추가. FR-13-04 잔여. FR-13-04 완료(2026-09-25): `BuildingSpatialIndex`가 타일·블록 배치 셀을 (x, z) 열로 증분 보관하고 `check*Position`은 후보 셀만 조회해 엔진 no-overlap과 같은 답을 낸다(무작위 편집 3 seed×160회 대조 불일치 0). hover·편집 중 엔진 생성 0, 1만 타일 편집 직후 첫 검사 13.5→0.002ms. 65,536셀 초과 블록은 추가·hydrate 때 거부하고, 다른 그룹을 넘긴 `removeTile`은 색인을 지우지 않는다 | `addTile` 10k회 연속 시간이 선형. 타일 수별 1회 비용 일정 |
| 13-e | delta 발행과 driver 증분 갱신(render snapshot, visibility, navigation, minimap). render snapshot과 visibility 완료(2026-09-25): `createBuildingRenderSnapshotBuilder`가 config identity로 엔티티 record를 캐시해 바뀐 그룹만 다시 계산한다. `BuildingVisibilityDriver`는 store 그룹을 다시 훑지 않고, 스냅샷 값이 바뀐 엔티티만 `syncVisibilityIndex`로 다시 넣는다. 셀 키는 문자열에서 model의 `indexAabb`/`queryAabbIds` 숫자 키로 바꿨고, 중복이던 `buildVisibilityIndex`는 삭제했다. 편집 1회 비용(순수 Node, 스냅샷+가시성 인덱스): 20×1000 타일 2.61→0.017ms, 긴 그룹 200×100 53.3→0.77ms, 1×20000 0.53→0.21ms. 소비자가 값 비교로 충분해 별도 delta 발행은 보류. navigation은 격자 재래스터화라 영역 dirty 재구축이 필요해 잔여, minimap은 뷰 범위 캔버스 재그리기라 유지 | 타일 1개 추가 시 `buildBuildingRenderSnapshot` 전체 호출 0 |
| 13-f | 에디터 패널 섹션별 구독과 memo, `hoverPosition` NPC 섹션 이동. 완료(2026-09-25): 패널 루트는 `editMode`·`selectedPlacedObjectType`만, 섹션은 보여주는 필드만 구독하고 action은 `getState()`로 읽는다. `hoverPosition`은 NPC 이동 섹션, NPC 데이터는 NPC 패널만 구독한다. 300셀 hover sweep 패널 commit 300→0(5개 모드), NPC 모드 루트 render 300→0. BuildingUI는 패널 경로 밖이고 hover 중 render 0이라 13-j로 미룬다 | hover sweep 5초 동안 `BuildingPanel` render 0 |
| 13-g | NPC `instanceIds` 구독과 개별 구독, brain side table, StudioPanel lazy 변환. 완료(2026-09-25): `NPCSystem`은 id 목록만 (`useShallow`) 구독해 추가·삭제에만 다시 그리고, NPC마다 slot이 자기 인스턴스만 구독한다. `NPCInstance` memo는 매 결정 틱 바뀌는 `lastObservation`·`lastDecision`을 비교에서 뺀다(공개 필드는 유지, side table 대신). StudioPanel은 NPC 수만 구독하고 blueprint 변환은 번들을 만들 때 한다. 결정 틱에 NPC 1체가 바뀌면 그 NPC slot만 1회 렌더, 목록 렌더 0 | NPC 50체 decision tick 중 commit ≤ 1/tick |
| 13-h | 입력 경로 분리(5.3), D-11 수정 | 스틱 입력 중 gaesupStore 알림 0 |
| 13-i | GPU 컬링 결과 version/bitset화 | 카메라 이동 중 컬링 store 구독자 render 0 |
| 13-j | buildingStore 분할(FR-13-12), npcStore 분할(FR-13-13) | 파일 500줄 이하, 공개 hook 불변, export snapshot 불변 |
| 13-k | `PerformanceCollector` 조건부 마운트, editor 경유 import 제거(FR-13-14) | 기본 설정 world에서 `setPerformance` 호출 0 |

13-e의 delta 형식은 30 PRD FR-30-03의 objectId delta와 같게 정한다. 형식은 `scene-object/delta.ts`의 `SceneObjectDelta`(reset·added·removed·updated)로 확정(2026-09-24)되었고, building은 그룹 id를 같은 집합에 담는다.

## 7. 공개 API 영향

- `usePlayerPosition` `reactive` 기본값 변경은 동작 변경이다(열린 질문 1).
- `useBuildingStore`는 facade로 유지한다. 새 hook(`useBuildingEditor`, `useBuildingData`)은 추가만.
- `interaction.keyboard/mouse/gamepad` store 필드는 `@deprecated` 후 major에서 제거.
- 선택자 없는 overload는 dev 경고 후 major에서 제거(열린 질문 2).

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/building src/core/npc src/core/editor src/core/interactions --runInBand
corepack pnpm test -- src/__tests__/publicApi.test.ts src/__tests__/exportSnapshot.test.ts --runInBand
corepack pnpm perf:check --scene=perf-world --size=M
```

jest 벤치: 타일 10k fixture에서 `addTile` 1회, `checkTilePosition` 1k회의 시간과 heap. React Profiler: hover sweep, NPC tick, 카메라 궤도의 commit 수.

완료 기준: NFR-13-01~04 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| immer 제거로 불변성 가정이 깨져 구독자가 변경을 놓침 | revision을 selector 입력에 포함. 데이터 컬렉션은 변경 시 새 참조를 주는 얕은 복사 유지 |
| delta 소비자가 delta를 놓쳐 불일치 | ring buffer overflow 시 full rebuild로 fallback, 테스트로 고정 |
| store 분할 중 저장 포맷 변경 | `buildingDataStore`의 `serialize()`/`hydrate()` 포맷을 기존과 동일하게 유지. save 왕복 테스트 |

## 10. 열린 질문

1. `usePlayerPosition`의 `reactive` 기본값을 `false`로 바꿔도 되는가(외부 소비자 동작 변경).
2. selector 없는 공개 hook overload를 제거해도 되는가.
3. buildingStore 분할 후 `useBuildingStore` facade를 언제까지 유지할 것인가.
