# PRD-18 에디터

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch (18-c 이후), Fast (18-a, 18-b 분할 작업) |
| 선행 PRD | 10 (월드 모델), 12 (스크립트 Inspector) |
| 관련 active plan | `epoch-6a-scene-document-canonical-command-path`, `examples-modernization` |

## 1. 배경과 문제

### 1.1 잘 되어 있는 것
Hierarchy, Inspector, TransformGizmo, 전역 undo/redo(`editor/shell.ts:143-151`), 선택 시스템, Play 모드(`playMode.ts`), 단축키, 명령 팔레트, 저장 상태 UI. todolist Editor Core 항목이 모두 완료 상태다.

### 1.2 문제
| ID | 내용 | 근거 |
|---|---|---|
| E-01 | building 편집이 undo 스택 밖. 스토어 `getState()/setState()` 직접 호출 | `BuildingController/index.tsx:144-149`, `BuildingUI/index.tsx:510,681,1361,1490`. building 폴더 `undo` grep 0 |
| E-02 | 건설 UI 두 벌 | `building/components/BuildingUI`(examples 사용) vs `editor/.../BuildingPanel` + Tile/Wall/Block/ObjectPanel |
| E-03 | NPC 브레인 에디터 위치 오류와 크기 | `editor/components/panels/BuildingPanel/brain/index.tsx` 2,142줄 |
| E-04 | 대형 파일 | `BuildingUI` 1,554, `BuildingPanel` 956, `GameplayEventPanel` 569, `EditorLayout` 564, `NPCPanel` 505, `placement.tsx` 409, `helpers.ts` 235 |
| E-05 | 에디터가 다른 도메인 내부 경로를 직접 import (19건) | `building/stores/buildingStore`, `camera/core/types` 5건, `npc/stores/npcStore`, `animation/components/*` |
| E-06 | Prefab override, 중첩 prefab, variant 없음 | `prefab/types.ts`에 override 필드 없음 |
| E-07 | 다중 선택 일괄 편집(이동, 복제, 삭제) 미완 | todolist "Batch edit tools: Not Started" |
| E-08 | 에셋 썸네일, 누락 에셋 UI 부분적 | todolist Asset 항목 |

## 2. 목표 / 비목표

### 목표
1. 모든 편집이 하나의 command/undo 스택을 거친다.
2. 건설 UI를 하나로 합친다.
3. Prefab을 Unity 수준으로 완성한다: override, 적용(apply), 되돌리기(revert), 중첩, variant.
4. 에디터는 도메인의 공개 표면(index)만 import한다.
5. 컴포넌트 200줄 상한을 에디터 폴더에서 지킨다.

### 비목표
- 실시간 협업 편집. command 구조가 준비된 뒤 별도 PRD.
- 노드 그래프 에디터 신규(애니메이션, 셰이더).

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | building 도구(타일, 벽, 블록, 오브젝트 배치)가 `SceneDocumentCommand`를 발행. 드래그 배치는 `batch` 하나 |
| FR-2 | 건설 UI 단일화: editor `BuildingPanel` 계열로 수렴. `BuildingUI`는 이 패널을 게임 내 모드로 감싼 얇은 래퍼로 남기거나 삭제 |
| FR-3 | NPC 브레인 에디터를 `npc` 도메인(`npc/editor/`)으로 이동하고 200줄 이하 컴포넌트로 분할 |
| FR-4 | Prefab 인스턴스 링크: 인스턴스 루트에 `prefabId`, `prefabVersion`, 객체 ID 매핑 |
| FR-5 | Override 추적: 인스턴스에서 바뀐 속성 경로 목록(`objectId.transform.position`, `objectId.components[id].data.x`). Inspector에서 굵게 표시 |
| FR-6 | Apply(인스턴스 변경을 prefab에 반영), Revert(override 제거), prefab 수정 시 모든 인스턴스 갱신 |
| FR-7 | 중첩 prefab과 variant(부모 prefab + override 집합) |
| FR-8 | 다중 선택 일괄 이동, 회전, 복제(Ctrl+D), 삭제, 복사·붙여넣기 |
| FR-9 | 에디터 → 도메인 import는 도메인 `index.ts`만. 린트로 강제 |
| NFR-1 | 에디터 폴더의 200줄 초과 컴포넌트 0 |
| NFR-2 | undo 1회 적용 16ms 이하 (타일 10,000개 문서) |

## 4. 설계

### 4.1 Prefab override 모델

```ts
export type PrefabInstanceLink = {
  prefabId: PrefabId;
  prefabVersion: number;
  objectMap: Record<SceneObjectId, SceneObjectId>;
  overrides: PrefabOverride[];
};

export type PrefabOverride =
  | { kind: 'property'; objectId: SceneObjectId; path: string; value: SceneJsonValue }
  | { kind: 'addedComponent'; objectId: SceneObjectId; component: SceneComponent }
  | { kind: 'removedComponent'; objectId: SceneObjectId; componentId: SceneComponentId }
  | { kind: 'addedObject'; object: SceneObject }
  | { kind: 'removedObject'; objectId: SceneObjectId };
```

- 링크는 인스턴스 루트 SceneObject의 `gaesup.prefabInstance` 컴포넌트에 저장한다.
- 인스턴스 편집 command가 적용될 때 override를 자동 계산한다(prefab 원본과 비교).
- prefab 수정 시: 원본 재인스턴스화 → override 재적용.

### 4.2 건설 UI 통합 순서
1. 두 UI의 기능 목록 대조표 작성(어느 쪽에만 있는 기능).
2. editor `BuildingPanel`에 부족한 기능 이식.
3. examples의 `BuildingUI` 사용처를 패널로 교체.
4. `BuildingUI` 삭제 또는 래퍼화.

## 5. 단계별 작업

| Slice | 트랙 | 내용 | 완료 기준 |
|---|---|---|---|
| 18-a | Fast | NPC 브레인 에디터 이동과 분할 | 200줄 이하, npc 테스트 |
| 18-b | Fast | `BuildingPanel`, `GameplayEventPanel`, `EditorLayout` 분할 | 200줄 이하 |
| 18-c | Epoch | building 도구 command화 (PRD-10 10-h와 같이) | 편집 → undo → redo 테스트 |
| 18-d | Epoch | 건설 UI 통합 | `BuildingUI` 제거 또는 래퍼, examples 갱신 |
| 18-e | Fast | 에디터 import 정리와 린트 규칙 | 내부 경로 import 0 |
| 18-f | Epoch | Prefab 링크와 override 추적 | override 계산 테스트 |
| 18-g | Epoch | Apply/Revert, prefab 전파 | 전파 테스트 |
| 18-h | Epoch | 중첩 prefab, variant | 중첩 테스트 |
| 18-i | Fast | 다중 선택 일괄 편집 | 에디터 테스트 |

## 6. 공개 API 영향

- 추가: `PrefabInstanceLink`, `PrefabOverride`, `applyPrefabOverrides`, `revertPrefabOverride`, 에디터 패널 export 경로 변경.
- 삭제 후보: `BuildingUI`(2.0).

## 7. 검증과 완료 기준

- editor, building, prefab, scene-object 테스트
- 브라우저: 타일 배치 → undo → redo → 저장 → 새로고침 → 복원
- `layer-auditor`

## 8. 열린 질문

1. `BuildingUI`를 게임 내 건설 모드(플레이어가 쓰는 UI)로 남길지, 완전히 삭제할지. 생활형 게임에서는 플레이어 건설 UI가 필요할 수 있다.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 18-f ~ 18-h | 완료(순수 함수) | `prefab/overrides.ts`: 인스턴스 링크 컴포넌트 `gaesup.prefabInstance`, `computePrefabOverrides`, `applyPrefabOverrides`, `propagatePrefabChanges`(루트 위치 유지), `revertPrefabOverride`, `applyInstanceToPrefab`, `createPrefabVariant` |
| 추가 | 완료 | Inspector에 animator, script 컴포넌트 전용 표시 |
| 18-a ~ 18-e, 18-i | 미착수 | 에디터 UI 연결과 분할 |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.

## 구현 현황 (2026-09-23, 3차)

| Slice | 상태 | 내용 |
|---|---|---|
| 추가 | 완료 | 에디터 커맨드 `updateComponent(objectId, componentId, data)`(`scene-object.component.update`, undo/redo). Inspector 스크립트 prop 편집과 스크립트 추가 메뉴 연결(PRD-12 12-g) |
| NFR-2 | 개선 | 커맨드 실행 전 스냅샷을 컨트롤러 경로에서는 불변 스냅샷 참조로 보관한다(accepted 문서는 deep-freeze). 매 커맨드의 문서 전체 복제를 없앴다. 레거시 `getDocument`/`setDocument` 스토어 경로만 복제를 유지한다. 6개 커맨드의 중복 run/undo 구현을 헬퍼 하나로 합쳤고 커맨드 ID와 라벨은 그대로다 |

검증: editor 테스트 통과(commandStack에 컴포넌트 갱신, undo, redo 케이스 추가).

## 구현 현황 (2026-09-23, 4차)

| Slice | 상태 | 내용 |
|---|---|---|
| 18-g | 부분(문서·커맨드) | `prefab/instances.ts`: 문서 안 인스턴스 수집(`getPrefabInstanceObjects`: `idPrefix:` 오브젝트와 그 자손), 인스턴스 단위 교체(원래 위치와 루트의 외부 부모 연결 유지), `revertPrefabInstanceOverride`, `revertPrefabInstance`(수정·추가·삭제를 원본으로, 루트 transform만 유지), `propagatePrefabToDocument`(같은 prefab의 모든 인스턴스에 전파, 인스턴스별 override 유지). 에디터 커맨드 `revertPrefabOverride`, `revertPrefabInstance`, `propagatePrefab`(undo는 실행 직전 스냅샷 복원). 스냅샷 헬퍼가 실행 시점 문서로 명령을 만드는 함수도 받는다. 자손 수집 반복문은 `collectPrefabSubtreeIds` 하나로 합쳤다 |
| 버그 | 수정 | 기존 `applyPrefabOverrides`/`propagatePrefabChanges`는 인스턴스를 부모 없이 다시 만들어 `parentId`로 배치한 인스턴스 루트의 부모 연결이 사라졌다. 문서 단위 교체에서 외부 부모를 보존한다(테스트) |
| 남은 것 | 미착수 | Inspector prefab 섹션(override 목록, 되돌리기, 적용), 예제의 prefab 라이브러리(선택으로 prefab 만들기, 배치) |

검증: prefab 12 tests, editor·API·예제 48 suites / 268 tests 통과, `tsc`(src, examples) 0, 변경 파일 eslint 0. 공개 export 6개 추가(스냅샷 갱신, 삭제 없음).

## 구현 현황 (2026-09-23, 5차)

| Slice | 상태 | 내용 |
|---|---|---|
| 18-f, 18-g | 완료 | Inspector `PrefabInstanceView`: 인스턴스 루트면 원본 prefab 이름, override 목록(루트 배치 위치 제외)과 항목별 "되돌리기", "모두 되돌리기", "프리팹에 적용". 일반 객체면 "프리팹으로 만들기", 원본이 없으면 안내. `Editor`/`EditorLayout`의 `scenePrefab`(`InspectorPrefabActions`) prop 하나로 연결. 에디터 커맨드 `instantiatePrefab`, `convertToPrefabInstance`와 문서 연산 `addPrefabInstance`, `replaceWithPrefabInstance`(서브트리를 같은 위치·부모의 인스턴스로 교체) 추가 |
| 예제 | 완료 | `/creator`: 세션의 prefab 라이브러리(`examples/pages/world/scenePrefabs.ts`). 선택 객체로 prefab 만들기, 프로젝트 패널 prefab 선택으로 배치, 되돌리기, 적용(같은 prefab의 모든 인스턴스로 전파). 라이브러리 변경은 커맨드 run/undo에 묶여 undo가 prefab 목록도 되돌린다. 브라우저에서 만들기 → 이름 수정(override 1) → 되돌리기(override 0) 확인 |
| 18-h | 순수 함수만 | 중첩 prefab, variant의 에디터 UI는 없음 |

검증: prefab 13, editor·API·예제 49 suites / 272 tests 통과, `tsc`(src, examples) 0, 변경 파일 eslint 0, 브라우저 페이지 오류 0. 공개 export 추가: `addPrefabInstance`, `replaceWithPrefabInstance`, 타입 `InspectorPrefabActions`(editor), 삭제 없음.
