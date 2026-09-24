# PRD-21 단일 원본과 중복 경로

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch |
| 선행 PRD | 13(buildingStore 분리), 20 |
| 담당 agent | architect |

## 1. 배경과 문제

AGENTS.md는 "Persistent mutation은 하나의 canonical write path를 가진다", "migration 중 old/new path가 공존하면 canonical path를 문서와 코드에서 명시한다"고 정한다. 현재 같은 책임을 가진 경로가 여러 벌이고, 어느 것이 canonical인지 코드에 적혀 있지 않다. 서로 참조하지 않아 동기화 비용은 없지만 정합성 계약도 없다.

## 2. 목표 / 비목표

**목표**
- 책임별 canonical 경로를 정하고 코드(JSDoc `@canonical`/`@deprecated`)와 문서에 명시한다.
- 비canonical 경로는 canonical 위의 adapter로 바꾼 뒤 major에서 제거한다.

**비목표**
- 한 번에 모두 제거. 책임 하나당 slice 하나로 진행한다.

## 3. 현재 상태와 canonical 제안

| 책임 | 경로 | 근거 | canonical 제안 |
|---|---|---|---|
| World model | `buildingStore`(1,664줄, action 93개, 영속 데이터 + 편집 UI 상태 혼재, `runtime/runtimeContext` import) | `building/types/index.ts:719-738` | |
| | `SceneDocument`(`scene-object/*`, framework import 0, dispatch → `{accepted, issues}`, migration, `saveBinding.ts`) | minihome이 `createSceneDocumentController` 12곳 사용 | **SceneDocument command dispatch** |
| | `WorldSystem` + `WorldBridge` + `worldObjectStore`(SaveSystem binding 없음) | `world/core/WorldSystem.ts` | projection |
| | gaesupStore `worldStates` slice(작업마다 `new Map`) | `world/stores/slices/worldStates/slice.ts:5-60`, 사용처 examples 1곳 | 제거 |
| | `src/next/core/World.ts` `TransformStore` | | 렌더 projection |
| 저장 | `save/core/SaveSystem.ts` + DomainBinding | runtime이 사용 | **SaveSystem** |
| | `world/persistence/SaveLoadManager.ts`(자체 prefix `gaesup_world_save_`, 버전 `1.0.0`, gzip, `{success,error}`), `persistenceSlice.ts`, `world/persistence/saveSystem.ts` | 루트 export, 내부 소비 0 | deprecate |
| 결과 타입 | `{ok}` 9파일, `{success}` 1, `{accepted,issues}` 5 | `utils/result.ts`의 `Result`는 import 0 | **`{ ok: true, value } \| { ok: false, error }`** 하나로 |
| 네트워크 프로토콜 | `PlayerNetworkManager.ts:425-507` PascalCase, 버전 없음 | | |
| | `adapter/contracts.ts:3-9` 버전 있는 `game.command/state.delta/snapshot.*` | server-contracts 격리 검증됨 | **adapter/contracts** |
| | `visit/types.ts:24-25` `snapshot/leave` | | contracts 메시지로 흡수 |
| | `NetworkSystem/MessageQueue/ConnectionPool` | | 사용처 확인 후 결정 |
| 건설 UI | `building/components/BuildingUI`(1,555줄) | examples 참조 0 | deprecate |
| | `editor/.../BuildingPanel`(957 + brain 2,142 + NPCPanel 508) | examples 참조 0. `NPCPanel` 이름 2개 | **editor BuildingPanel** |
| | minihome `RoomEditorPanel`(SceneDocument 기반) | 제품 예제 | 제품 소유(library 밖) |
| 애니메이션 결정 | AnimationBridge `play` 명령(`useAnimationSetup.ts:22`), AnimationSystem `'idle'` 문자열 상태 | | |
| | `AnimatorRuntime`(`defaultCharacterAnimator.ts:51-76`) | track pool, 변경 시 notify | **AnimatorRuntime** |
| | NPC 문자열 `currentAnimation`(`NPCInstance/index.tsx:280,346`) | `AnimationController` 심볼 2개(class, component) | AnimatorRuntime으로 |
| 공간 인덱스 | `world/core/SpatialGrid.ts`(숫자 키, cell 10) | NPCPerceptionIndex 재사용 | |
| | `building/visibility/core.ts:4,45`(문자열 키, cell 18) | | |
| | `buildingStore.tileIndex/wallIndex`, `PlacementEngine`(검사마다 재생성) | 13-F01, 13-F02 | |
| | `next/core/culling.ts` | | 측정 후 결정(AGENTS.md: 측정 없이 통합 금지) |
| 날씨 상태 | `buildingStore.weatherEffect/showSnow`(`BuildingSystem/index.tsx:141,329`), `weatherStore.current` | | **weatherStore** |
| 오류 경계 | `GaesupErrorBoundary`(public, 내부 사용 0), `ModelErrorBoundary`(`building/components/mesh/model/index.tsx:21`), NPC part boundary | | **`GaesupErrorBoundary`**에 fallback·reset 옵션 추가 |

### 3.1 관련 결함

- D-09: `persistenceSlice.ts:137-142`가 npcStore `instances`를 `set` 없이 `clear()`.
- D-18: `WorldSystem.ts:81-84`가 position 참조를 저장.

## 4. 요구사항

**FR**
- FR-21-01: 책임별 canonical 표(3절)를 `prd/adr/0001-canonical-paths.md`로 확정하고, 각 모듈 JSDoc에 `@canonical` 또는 `@deprecated 대체: <경로>`를 붙인다.
- FR-21-02: 영속 world 데이터 변경은 SceneDocument command dispatch 하나로 한다. building 편집은 13 PRD의 mutation 함수를 SceneDocument command로 감싸는 adapter를 거친다.
- FR-21-03: 영속 store 모듈은 React를 import하지 않는다(`runtimeContext` 의존 제거). boundary 테스트로 강제한다.
- FR-21-04: `SaveLoadManager`, `createPersistenceSlice`는 SaveSystem binding 위임 adapter로 바꾸고 `@deprecated`를 붙인다. in-place fallback(D-09)은 제거한다.
- FR-21-05: 결과 타입을 `Result<T, E>` 하나로 정하고 새 코드는 이것만 쓴다. 기존 `{success}`, `{accepted, issues}`는 경계 adapter로 변환한다.
- FR-21-06: `PlayerNetworkManager`를 transport adapter로 줄이고 contracts 형식으로 매핑하는 codec을 둔다(14 PRD codec과 같은 경계).
- FR-21-07: `BuildingUI`는 deprecate하거나 editor 섹션을 조합하는 얇은 wrapper로 만든다. `NPCPanel` 이름 중복을 해소한다.
- FR-21-08: 애니메이션 상태 결정은 AnimatorRuntime만 한다. AnimationBridge `play`와 NPC 문자열 애니메이션은 AnimatorRuntime 파라미터로 변환한다.
- FR-21-09: 날씨 상태는 weatherStore만 소유한다.
- FR-21-10: `WorldSystem`은 position을 복제해 저장한다(D-18).
- FR-21-11: 공간 인덱스는 `benchmark-culling.cjs`와 13 PRD `BuildingSpatialIndex` 측정 후 통합 여부를 결정한다.

**NFR**
- NFR-21-01: 책임마다 canonical 경로가 코드에 명시되어 있다.
- NFR-21-02: deprecated 경로는 canonical 경로의 동작을 복제하지 않고 위임한다.
- NFR-21-03: 저장 포맷 호환: legacy 포맷 load 테스트가 통과한다.

## 5. 설계

### 5.1 world model 흐름

```
Editor UI / Gameplay ──command──► SceneDocument.dispatch ──► document(canonical, serializable)
                                         │ changes
            ┌────────────────────────────┼─────────────────────────┐
            ▼                            ▼                         ▼
   buildingData projection      WorldSystem projection      render/physics projection
   (13 PRD BuildingSpatialIndex)  (SpatialGrid, query)       (batches, colliders)
SaveSystem ◄── SceneDocument saveBinding
```

buildingStore는 과도기에 SceneDocument command를 내부에서 발행하는 adapter다. 기존 `useBuildingStore` action 시그니처는 유지한다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 21-a | canonical ADR, JSDoc 표기, D-09·D-18 수정 | 3절 표의 모든 모듈에 표기. 재현 테스트 통과 |
| 21-b | 날씨 상태 weatherStore 단일화 | `buildingStore.weatherEffect/showSnow`가 weatherStore 위임 |
| 21-c | `SaveLoadManager`/`persistenceSlice` adapter화, `@deprecated` | legacy 포맷 load 테스트, export snapshot 불변 |
| 21-d | `Result` 타입 통일(새 코드 규칙 + 경계 adapter) | lint 또는 ratchet으로 새 `{success}` 반환 0 |
| 21-e | gaesupStore `worldStates` slice deprecate, examples 교체 | examples 사용 0 |
| 21-f | 영속 store의 React 의존 제거 | boundary 테스트 통과 |
| 21-g | building mutation → SceneDocument command adapter | save/hydrate 왕복 테스트, 편집 undo 동작 동일 |
| 21-h | 네트워크 codec과 contracts 매핑, visit 메시지 흡수 | codec 왕복 테스트, `serverContractsIsolation.test.ts` |
| 21-i | 애니메이션 결정 AnimatorRuntime 단일화 | `useCharacterAnimator`, NPC 애니메이션 테스트 |
| 21-j | BuildingUI wrapper화, `NPCPanel` 이름 정리, 오류 경계 통합 | 중복 심볼 0 |
| 21-k | 공간 인덱스 통합 판단(측정 기반) | 벤치 결과와 결정 기록 |

## 7. 공개 API 영향

- `SaveLoadManager`, `createPersistenceSlice`, `BuildingUI`, gaesupStore world slice: `@deprecated` 후 major 제거.
- 결과 타입 변경은 새 API에만 적용하고 기존 공개 함수 반환 타입은 major에서 바꾼다.
- 중복 이름(`AnimationController`, `NPCPanel`) 정리는 major 변경이다.

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/scene-object src/core/save src/core/world src/core/building src/core/animation --runInBand
corepack pnpm test -- src/__tests__/exportSnapshot.test.ts src/__tests__/publicApi.test.ts --runInBand
corepack pnpm exec jest examples/minihome --runInBand
```

완료 기준: NFR-21-01~03 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| building → SceneDocument adapter가 편집 성능을 떨어뜨림 | 14 PRD 14-h(SceneDocument 명령 증분 검증)를 먼저 완료 |
| legacy 저장 데이터 손실 | migration 테스트, legacy prefix 읽기 경로를 major까지 유지 |

## 10. 열린 질문

1. world model canonical을 SceneDocument로 확정하는가.
2. `BuildingUI`를 제거할 것인가, wrapper로 유지할 것인가.
3. `NetworkSystem/MessageQueue/ConnectionPool`의 외부 소비자가 있는가.
