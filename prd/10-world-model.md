# PRD-10 월드 데이터 모델 통합

| 항목 | 값 |
|---|---|
| 우선순위 | P0 (엔진화의 전제) |
| 트랙 | Epoch (source of truth 변경, 공개 API 변경) |
| 선행 PRD | 00 |
| 후속 PRD | 12, 18, 21, 25 |
| 관련 active plan | `epoch-6a-scene-document-canonical-command-path`, `SPATIAL_RUNTIME_FOUNDATIONS` |

## 1. 배경과 문제

월드를 이루는 데이터가 네 곳에 나뉘어 있다.

| 모델 | 위치 | 쓰는 곳 |
|---|---|---|
| building 상태 | `src/core/building/stores/buildingStore.ts` (1,686줄, Zustand+immer) | 타일, 벽, 블록, 배치 오브젝트. 사실상 월드 원본 |
| SceneDocument | `src/core/scene-object/` | 에디터 Hierarchy, Inspector, Gizmo, prefab |
| WorldObject | `src/core/world/core/WorldSystem.ts`, `world/bridge/WorldBridge.ts` | blueprint 스폰 |
| 레거시 world 슬라이스 | `src/core/world/stores/slices/worldStates/slice.ts` (루트 `gaesupStore.ts:32`에 합성) | 외부 사용처 없음 |

그 결과:
- 에디터의 Hierarchy/Inspector/undo가 building 요소를 다루지 못한다.
- 저장 경로가 두 벌이다(`SaveSystem`과 `SaveLoadManager`/`persistenceSlice`).
- 공간 인덱스가 세 벌이다(`buildingStore.tileIndex/wallIndex`, `PlacementEngine`, `world/core/SpatialGrid`).
- `buildingStore.addTile`이 UI 드래프트 상태(`selectedTileObjectType`, `currentTerrainColor`)를 읽어서 같은 입력에 다른 결과가 나온다(`buildingStore.ts:960-981`).
- 날씨와 안개가 building 직렬화 스키마 안에 있어 `weather` 도메인과 소유권이 겹친다(`building/types/index.ts:200-204`).

## 2. 목표 / 비목표

### 목표
1. `SceneDocument`를 월드의 유일한 영속 원본으로 만든다. epoch 6a가 채택한 "WorldDocument의 첫 수직 subset" 방향을 building까지 확장한다.
2. building 요소를 SceneObject와 표준 컴포넌트로 표현한다. 이미 정의된 `gaesup.buildingPiece` 컴포넌트 타입을 기반으로 한다.
3. 모든 월드 변경이 `SceneDocumentCommand`를 거친다. 따라서 undo, 저장, 네트워크 동기화가 같은 경로를 쓴다.
4. 레거시 모델과 저장 경로를 삭제한다.
5. 렌더 성능(인스턴싱, GPU 컬링)은 유지한다.

### 비목표
- building 렌더러(TileSystem, WallSystem, 이펙트 메시)의 재작성. 렌더러는 새 모델의 투영을 받도록 입력만 바꾼다.
- 씬 스트리밍(청크 로딩). 이 PRD는 단일 문서까지만 다룬다. 스트리밍은 PRD-25의 후속으로 둔다.
- 네트워크 동기화 구현. command 경로를 만드는 데서 멈춘다.

## 3. 현재 상태 근거

- `scene-object/types.ts`: `SceneObject { id, name, parentId, transform, components[], tags, layer }`, `SceneDocument { version: 1, objects[] }`, command 7종, accepted/rejected result, controller.
- `scene-object/components.ts`: 표준 컴포넌트 `meshRenderer`, `collider`, `rigidBody`, `script`, `interactable`, `buildingPiece`, `npc`.
- `scene-object/saveBinding.ts`: `scene-document` 키로 SaveSystem에 저장.
- `building/stores/persistence.ts`: `BuildingSerializedState` version 1, 2단계 hydrate.
- `building/types/index.ts`: `MeshConfig`, `WallConfig`, `WallGroupConfig`, `TileConfig`, `TileGroupConfig`, `BuildingBlockConfig`, `PlacedObject`.

## 4. 요구사항

### 기능 (FR)
| ID | 요구사항 |
|---|---|
| FR-1 | 타일 그룹, 벽 그룹, 블록, 배치 오브젝트를 SceneObject로 표현할 수 있다. |
| FR-2 | building 편집 도구(배치, 삭제, 회전, 색 변경)는 `SceneDocumentCommand`만 발행한다. |
| FR-3 | 기존 `BuildingSerializedState` v1 저장본을 SceneDocument로 마이그레이션한다. 로드 시 자동 변환하고, 원본은 보존한다. |
| FR-4 | 에디터 Hierarchy에서 building 요소가 보이고 선택, 이름 변경, 삭제, 부모 변경이 된다. |
| FR-5 | 공간 질의(셀 점유, 겹침, 지지 여부)는 단일 공간 인덱스 API를 쓴다. |
| FR-6 | 날씨와 안개는 `weather` 도메인이 소유하고 SceneDocument의 씬 설정 컴포넌트로 저장된다. |
| FR-7 | 하나의 command 배치(예: 드래그로 타일 200개 배치)는 하나의 undo 단위다. |

### 비기능 (NFR)
| ID | 요구사항 | 측정 |
|---|---|---|
| NFR-1 | 타일 10,000개 문서에서 단일 타일 추가 command 적용 시간 | 1ms 이하 (jest 벤치) |
| NFR-2 | 드래그 배치 200개 배치 command | 16ms 이하 |
| NFR-3 | 편집 1회당 문서 전체 복사 금지 | 구조적 공유로 변경된 객체만 새로 생성. 테스트로 identity 검증 |
| NFR-4 | 렌더 투영 갱신은 변경된 그룹만 재계산 | TileSystem 배치 재생성 횟수 테스트 |
| NFR-5 | 기존 저장본 로드 실패율 | 0 (fixture 기반 테스트) |

## 5. 설계

### 5.1 표현 방식: 그룹 단위 SceneObject

타일 하나마다 SceneObject를 만들면 수만 개 객체가 되어 Hierarchy와 command 비용이 커진다. 따라서 **그룹 단위**로 표현한다.

```
SceneObject (name: "Floor 1", tags: ["building"])
  components:
    - type: gaesup.buildingPiece
      data: { kind: "tileGroup", materialId, shape, cells: [[x,y,z,rot,variant], ...] }
SceneObject (name: "Wall A")
  components:
    - type: gaesup.buildingPiece
      data: { kind: "wallGroup", preset, edges: [[x,z,dir,kind], ...] }
SceneObject (name: "Sakura 3")
  transform: { position, rotation, scale }
  components:
    - type: gaesup.meshRenderer  (또는 gaesup.effect)
    - type: gaesup.collider
```

- 타일과 벽은 **그룹 컴포넌트 안의 압축 배열**로 둔다. JSON 크기와 command 비용을 줄인다.
- 배치 오브젝트(나무, 깃발, 모델)는 **개별 SceneObject**다. Inspector에서 개별 편집 대상이기 때문이다.
- 그룹 안의 개별 셀 편집을 위해 command를 추가한다.

### 5.2 새 command

기존 7종에 컴포넌트 데이터 패치 command를 추가한다. 현재 `scene-object.update`는 이름, 부모, transform, tags, layer만 바꿀 수 있고 컴포넌트 데이터를 바꿀 수 없다.

```ts
export type SceneObjectComponentUpdateCommand = {
  readonly type: 'scene-object.component.update';
  readonly objectId: SceneObjectId;
  readonly componentId: SceneComponentId;
  readonly data: SceneJsonObject;
};

export type SceneObjectComponentPatchCellsCommand = {
  readonly type: 'scene-object.component.cells';
  readonly objectId: SceneObjectId;
  readonly componentId: SceneComponentId;
  readonly add: readonly SceneJsonValue[];
  readonly remove: readonly string[];
};

export type SceneDocumentBatchCommand = {
  readonly type: 'scene-document.batch';
  readonly label: string;
  readonly commands: readonly SceneDocumentCommand[];
};
```

- `batch`는 전부 적용되거나 전부 거부된다.
- cells command는 셀 키(`"x,y,z"`)로 제거한다. 셀 데이터 스키마는 `buildingPiece` 컴포넌트 검증기가 소유한다.
- 컴포넌트 타입별 검증기 등록소를 둔다: `registerSceneComponentSchema(type, validate)`. 현재 `invalid-component-data` 이슈 코드를 이 검증기가 채운다.

### 5.3 역할 분리

| 층 | 소유 | 위치 |
|---|---|---|
| 영속 원본 | SceneDocument | `scene-object` controller |
| 편집 드래프트 | 선택된 도구, 브러시, 현재 색, 미리보기 | `building/stores/buildingDraftStore.ts` (신규, 저장 안 함) |
| 파생 인덱스 | 셀 점유, AABB, 지지 관계 | `placement`의 공간 인덱스 (immer 밖 클래스, controller 이벤트로 증분 갱신) |
| 렌더 투영 | 인스턴스 행렬, 배치 버퍼 | building render 모듈 (controller 구독) |

`buildingStore`는 이 전환 동안 호환 파사드로 남긴다. 읽기는 controller 스냅샷에서 계산하고, 쓰기는 command로 변환한다. 마지막 slice에서 삭제한다.

### 5.4 공간 인덱스 단일화

- `placement/`의 `PlacementEngine`을 유일한 공간 인덱스로 정한다. `grid/`의 `SquareGridAdapter`를 좌표계로 쓴다.
- `buildingStore.tileIndex/wallIndex`와 `world/core/SpatialGrid`는 PlacementEngine 질의로 대체한다.
- 인덱스는 controller 이벤트(`created`, `updated`, `deleted`, 신규 `component.updated`)를 받아 증분 갱신한다. 문서 교체(`replaced`) 시에만 전체 재구성한다.

### 5.5 WorldObject 처리

- `WorldSystem`/`WorldBridge`는 런타임 전용 엔티티(스폰된 발사체, 임시 이펙트)의 저장소로 역할을 좁힌다. 영속 오브젝트는 SceneDocument로 간다.
- blueprint 스폰(`useSpawnFromBlueprint`)은 "영속 스폰"이면 `scene-object.create`, "런타임 스폰"이면 WorldSystem을 쓰도록 옵션을 나눈다.
- `WorldBridge.createSnapshot`의 프레임당 할당은 PRD-13에서 함께 고친다.

### 5.6 마이그레이션

- `building/stores/persistence.ts`의 v1 저장본을 읽어 SceneDocument 조각으로 변환하는 순수 함수 `migrateBuildingStateToSceneObjects(state)`를 `scene-object/migration.ts`의 등록소에 넣는다.
- 로드 순서: `scene-document`가 있으면 그것을 쓴다. 없고 `building`만 있으면 변환해서 `scene-document`로 쓴다. 원본 `building` 키는 다음 저장 때까지 보존한다.
- 날씨·안개 필드는 `weather` 저장 키로 이동한다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 10-a | 죽은 레거시 제거: `worldStates/slice.ts`를 `gaesupStore`에서 분리, `world/stores/slices.ts` 비공개화 | 공개 API 테스트 갱신, 사용처 0 확인 |
| 10-b | 컴포넌트 스키마 등록소와 `component.update`, `batch` command 추가 | 수락·거부·원자성 테스트 |
| 10-c | `buildingPiece` 셀 스키마와 `component.cells` command | 셀 추가·제거·중복·범위 테스트 |
| 10-d | `buildingDraftStore` 분리: 드래프트 필드 이동, `addTile` 등이 드래프트를 인자로 받게 변경 | `buildingStore` 필드 수 감소, 기존 building 테스트 통과 |
| 10-e | 공간 인덱스 단일화 (PlacementEngine) | 인덱스 3개 → 1개, NFR-1, NFR-2 벤치 |
| 10-f | building 저장본 → SceneDocument 마이그레이션 | fixture 저장본 전부 변환 성공 |
| 10-g | building 렌더러 입력을 controller 투영으로 교체 | TileSystem, WallSystem이 SceneDocument에서 그려짐, 데모 시각 비교 |
| 10-h | building 편집 경로를 command로 교체, `buildingStore` 파사드화 | 편집 → undo → redo 테스트 |
| 10-i | 레거시 저장 경로 삭제: `SaveLoadManager`, `persistenceSlice`, building 저장 키 | 공개 API 삭제 (사용자 확인) |
| 10-j | `buildingStore` 파사드 삭제 | building 폴더에서 스토어가 드래프트만 남음 |

## 7. 공개 API 영향

- 삭제 후보: `SaveLoadManager`, `persistenceSlice` 관련 export, `worldStates` 슬라이스 액션(`addWallToGroup`, `addTileToGroup`, `setCurrentMeshId` 등), `useBuildingStore`의 영속 필드 쓰기 액션.
- 추가: `SceneObjectComponentUpdateCommand`, `SceneObjectComponentPatchCellsCommand`, `SceneDocumentBatchCommand`, `registerSceneComponentSchema`, building 셀 데이터 타입.
- 삭제는 2.0에 묶는다. 1.x 동안은 deprecated 표기와 `logger.warn`.
- `src/index.ts`, `publicApi.test.ts`, `packageExports.test.ts` 갱신.

## 8. 검증과 완료 기준

- scene-object, building, placement, world, save 도메인 테스트 통과
- 공개 API 테스트 통과
- 메모리 테스트 통과
- NFR-1~5 측정값을 이 문서에 기록
- 데모 `/world`와 `/creator`에서 같은 문서를 편집하고 저장, 새로고침 후 복원됨을 브라우저 테스트로 확인
- `invariant-guard`, `api-surface-guard` 감사

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 대형 문서에서 불변 갱신 비용 | 그룹 컴포넌트의 셀 배열을 청크(예: 256셀) 단위로 나눠 구조적 공유 |
| 기존 저장본 손상 | 원본 키 보존, 변환 실패 시 로드 중단과 진단 이벤트 |
| building UX 회귀 | 파사드 단계(10-h)에서 기존 컴포넌트 테스트를 그대로 통과시키고 삭제는 마지막에 |
| epoch 6a와의 충돌 | 6a를 먼저 close하고 이 PRD를 6b로 시작 |

## 10. 열린 질문

1. 타일 그룹의 기준을 무엇으로 할 것인가: 재질별, 층별, 사용자가 만든 그룹 중 선택.
2. 1.x에서 레거시 API를 deprecated로 얼마나 유지할 것인가.
3. 셀 청크 크기와 문서 최대 크기 상한.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 10-b | 완료 | `scene-object.component.update`, `scene-document.batch`(원자적) 명령과 이벤트, 컴포넌트 데이터 스키마 등록소 `registerSceneComponentSchema`. 구현은 `scene-object/extendedCommands.ts`, `componentSchemas.ts`이고 `applySceneDocumentCommand`가 위임한다 |
| 10-a, 10-c ~ 10-j | 미착수 | building 원본 이전은 테스트 실행 없이 진행하기에 위험이 커서 보류 |

배치는 하위 명령마다 문서 전체를 다시 파싱하므로 NFR-2(200개 16ms)는 아직 측정하지 않았고 만족하지 못할 가능성이 있다.

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
