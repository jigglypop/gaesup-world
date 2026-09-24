# PRD-30 엔티티·컴포넌트·트랜스폼

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch |
| 선행 PRD | 21(canonical 결정), 22(서비스 키), 31-a(시스템 등록), 14-h(SceneDocument 증분 검증) |
| 담당 agent | architect, runtime |

## 1. 배경과 문제

목표는 웹 유니티다. 씬은 엔티티와 컴포넌트로 구성되고, 인스펙터가 컴포넌트를 편집하며, 시스템이 컴포넌트를 실행한다. 기반은 이미 있다. `SceneDocument`(저작·직렬화·command·migration)와 `NextWorld`(generational id, SoA `TransformStore`)다. 그러나 런타임은 둘을 쓰지 않고 도메인 store(building, npc, motions)를 중심으로 돈다.

1. 엔티티 개념이 8개이고 식별자·트랜스폼·수명이 제각각이다.
2. 표준 컴포넌트는 선언만 있고 실행하는 시스템이 없다.
3. 컴포넌트 정의가 검증 함수뿐이라 인스펙터가 JSON을 그대로 보여준다.
4. 트랜스폼 원본이 여럿이고 계층 행렬 캐시가 없다.

## 2. 목표 / 비목표

**목표**
- 런타임 엔티티 저장소를 `EntityWorld` 하나로 만든다(`NextWorld` 일반화).
- 컴포넌트 타입 정의 하나에서 검증, 기본값, 인스펙터, migration, 시스템 연결이 나오게 한다.
- 트랜스폼 원본을 하나로 정하고 동기화 지점을 고정한다.
- `SceneDocument` 변경을 objectId 단위로 `EntityWorld`에 증분 반영한다.

**비목표**
- `SceneDocument` 포맷 교체. 저작 원본으로 유지하고 확장한다.
- building, npc를 한 번에 이전. 도메인별 adapter로 옮긴다.
- 아키타입 기반 범용 ECS 쿼리 엔진. 필요성은 10-a 측정 후 판단한다(README 원칙 1, 3).
- Unity 파일 포맷 호환. `scene-object/unity.ts` interchange는 그대로 둔다.

## 3. 현재 상태

**30-F01 엔티티 개념 8개** [확인]

| 개념 | 위치 | 식별자 | 트랜스폼 | 사용처 |
|---|---|---|---|---|
| `SceneObject`/`SceneComponent` | `scene-object/types.ts:31-56` | string | euler tuple | editor Hierarchy/Inspector, minihome |
| `NextWorld` | `src/next/core/World.ts:24` | 정수(index 20bit + generation 11bit) | `TransformStore` SoA | `examples/engine`만 |
| `WorldObject` | `world/core/WorldSystem.ts:10-21` | string | `THREE.Vector3` 참조(D-18) | WorldBridge |
| `BlueprintEntity` + `ComponentRegistry` 싱글턴 | `src/blueprints/core/BlueprintEntity.ts:9-65` | string | 컴포넌트 내부 | React spawner마다 tick(`BlueprintSpawner/index.tsx:37`) |
| `PlacedObject` + `ObjectConfig` | `building/types/index.ts:104-140` | string | 필드 | fire/flag/billboard/model 필드를 한 객체에 평평하게 담음 |
| NPC instance | `npcStore` + `NPCSimulation` pose | string | 두 벌 | NPC |
| `EntityStateManager`, `ManagedMotionEntity` | `motions/` | string | Rapier 값 복사 | 캐릭터·차량 |
| `ManagedEntity` | `boilerplate/` | - | - | 사용 0(D-02) |

- 영향: 플레이어, NPC, 타일, 벽이 `SceneObject`가 아니라 Hierarchy에 나오지 않는다. 에디터가 `BuildingPanel`(building/npc store 편집)과 Hierarchy/Inspector(`SceneDocument` 편집) 둘로 나뉜다.

**30-F02 표준 컴포넌트를 실행하는 시스템이 없음** [확인]
- `SCENE_COMPONENT_TYPES`(`scene-object/components.ts:9-19`) 9종 중 `meshRenderer`, `buildingPiece`, `interactable`은 선언 파일 밖 참조가 0이다. `animator`, `script`는 `InspectorPanel`, `collider`/`rigidBody`는 `SceneObjectBody`만 소비한다.
- 라이브러리에 `SceneDocument` → three 렌더 경로가 없다. minihome은 자체 `miniroom.furniture` 타입과 projection을 만들고, 문서가 바뀔 때마다 `loadSceneRuntime`으로 전체를 다시 파싱하고, 모든 객체를 순회하고, 내비게이션을 재구축한다(`examples/minihome/roomEngine.ts:128-151`).

**30-F03 컴포넌트 정의가 흩어져 있고 검증만 함** [확인]
- `scene-object/componentSchemas.ts:5` 전역 `Map<type, (data) => string | null>`. 같은 역할의 전역 registry가 스크립트(`scripting/registry.ts:3`), animator(`animation/core/animator/registry.ts:5`), NPC brain(`npc/core/blueprint.ts:28`), blueprints `ComponentRegistry`에 따로 있다.
- 인스펙터는 컴포넌트 타입을 자유 텍스트로 추가하고 데이터를 `<pre>{JSON.stringify(...)}</pre>`로 표시한다(`editor/components/panels/InspectorPanel.tsx:285`).
- 필드 스키마 kind는 `ScriptPropSchema`(`scripting/types.ts:10-43`)에 이미 있다.

**30-F04 트랜스폼 원본이 여럿, 계층 캐시 없음** [확인]
- 사본: `SceneDocument` euler, `NextWorld` `TransformStore`, `WorldObject` Vector3, npcStore position과 `NPCSimulation` pose, `EntityStateManager`(Rapier 값 복사), 스크립트 핸들 `{x,y,z}`(`scripting/ScriptRuntime.ts:276-282`, `useScriptObjectTransform`으로 Object3D에만 반영).
- `SceneObjectBody`는 문서 → RigidBody 단방향이다(`scene-object/react/SceneObjectBody/index.tsx:63-64`).
- `SceneRuntime.getWorldMatrix`는 호출마다 부모 체인을 순회하고 곱셈마다 `new Array(16)`을 만든다(`scene-object/runtime.ts:97-111`, `transforms.ts:43`). dirty 플래그와 캐시가 없다.

**30-F05 Blueprint와 Prefab이 같은 일을 두 벌로 함** [확인]
- `src/blueprints`(엔티티 템플릿 + 컴포넌트)와 `core/prefab`(SceneObject 템플릿)이 모두 "엔티티 템플릿" 역할이다. 명칭 정리는 24 PRD FR-24-11.

## 4. 요구사항

**FR**
- FR-30-01: `EntityWorld`는 `NextWorld`를 일반화한다. generational id를 쓰고, 컴포넌트 타입별 저장소를 둔다(숫자 필드는 SoA typed array, 그 외는 sparse Map). `SceneObjectId` ↔ `EntityId` 양방향 인덱스를 소유한다. runtime 서비스로 등록한다(22 FR-22-10).
- FR-30-02: runtime 스코프 `ComponentTypeRegistry`를 두고, 정의는 `defineComponent({ type, version, schema, defaults, migrate?, system? })`로 한다. `schema`는 `ScriptPropSchema` kind를 재사용한다. 검증, 기본값, 인스펙터 필드 편집기, migration이 이 정의 하나에서 나온다. 기존 `registerSceneComponentSchema`는 이 registry의 adapter가 된다.
- FR-30-03: `SceneProjector`는 `SceneDocumentController` 변경을 objectId 단위 delta `{ added, removed, updated: { id, componentTypes, transform } }`로 받아 `EntityWorld`에 반영한다. 전체 재파싱을 금지한다. 이 delta 형식을 building 변경 delta(13 FR-13-02)와 공유한다.
- FR-30-04: `TransformSystem`은 local/world `Float32Array`, parent index, dirty 전파를 틱당 1회 처리한다. `getWorldMatrix`는 캐시를 조회한다. 동기화 지점은 5.2절 표로 고정한다.
- FR-30-05: 표준 컴포넌트 시스템을 `defineSystem`(31 PRD)으로 등록한다. `meshRenderer`는 12 FR-12-03의 공용 batch를, `collider`/`rigidBody`는 Rapier를(`SceneObjectBody` 대체), `animator`는 `AnimatorRuntime`을, `interactable`은 `SpatialGrid`를 쓴다.
- FR-30-06: 플레이어, NPC, 원격 플레이어, 건설 조각을 `EntityWorld` 엔티티로 노출해 Hierarchy/Inspector가 한 목록을 보여준다. 저장하지 않는 런타임 엔티티는 `transient` 플래그로 구분한다.
- FR-30-07: `src/blueprints`를 prefab + script 조합으로 흡수하고 `@deprecated`를 붙인다.

**NFR**
- NFR-30-01: 문서 명령 1회 반영 비용은 변경 객체 수에 비례한다(전체 객체 수와 무관).
- NFR-30-02: steady state에서 `TransformSystem` 틱당 할당 0, dirty 아닌 엔티티의 행렬 계산 0.
- NFR-30-03: `EntityWorld`, `TransformSystem`, `ComponentTypeRegistry`는 React·three import 0(20 PRD 계층 검사 대상).
- NFR-30-04: 엔티티 10k의 world matrix 갱신 < 1ms [추정 목표, 10-a 측정 후 확정].

## 5. 설계

### 5.1 흐름

```
SceneDocument (저작 원본: 직렬화, command, undo, save)
   │ objectId delta (FR-30-03, building delta와 같은 형식)
   ▼
SceneProjector ──► EntityWorld (runtime projection)
                    ├─ ids: generational (NextWorld)
                    ├─ TransformSystem: local/world SoA, parent, dirty
                    └─ component stores (ComponentTypeRegistry 정의)
                           │ defineSystem (31 PRD: fixed / presentation lane)
      ┌──────────────┬─────┴────────┬──────────────┬──────────────┐
  meshRenderer   collider/body   animator     interactable    script
  (12 batch)     (Rapier)        (Animator)   (SpatialGrid)   (31 PRD)
```

`EntityWorld`는 원본이 아니라 projection이다. 영속 데이터의 원본은 `SceneDocument` 하나다(21 PRD). building/npc store는 과도기에 자기 객체를 `EntityWorld`에 등록하는 adapter가 된다.

건설 데이터는 타일마다 엔티티를 만들지 않는다. 타일 그룹·벽 그룹 하나가 엔티티 하나이고, `gaesup.buildingPiece` data에 셀 배열을 담는다(삭제된 이전 PRD-10 5.1절 결정 유지). 개별 타일 조회는 `BuildingSpatialIndex`(13 FR-13-01)가 맡는다. Hierarchy와 command 비용이 타일 수에 비례하지 않게 하기 위해서다.

### 5.2 트랜스폼 동기화 지점

| 방향 | 시점 | 대상 |
|---|---|---|
| document → transform | 명령 적용 시(SceneProjector) | 모든 엔티티 |
| transform → Rapier | fixed lane `prePhysics` | kinematic body |
| Rapier → transform | fixed lane `postPhysics` | dynamic body |
| transform → Object3D | presentation lane `snapshot` | 렌더 대상, 보간은 11 FR-11-06 |
| transform → document | 편집 명령 또는 play 종료 시 저장 정책(31 PRD) | 영속 엔티티 |

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 30-a | `ComponentTypeRegistry`, `defineComponent`, objectId delta 계약, `registerSceneComponentSchema` adapter. delta 완료(2026-09-24): `scene-object/delta.ts` `SceneObjectDelta`(reset·added·removed·updated), `toSceneObjectDelta`, `subscribeSceneObjectDelta`. batch 안 생성 후 삭제는 상쇄, 삭제 후 재생성은 updated. 레지스트리는 인스펙터 작업(30-f)과 함께 | scene-object 테스트 통과. delta 계약 테스트. 13-e가 같은 형식 사용 |
| 30-b | `TransformSystem`(캐시, dirty), `SceneRuntime.getWorldMatrix` 대체. `SceneRuntime` 부분 완료(2026-09-25): 불변 스냅샷이라 dirty 없이 가장 가까운 캐시 조상부터 위→아래로 한 번씩 계산해 동결 공유한다. 1k 객체 깊이 8에서 반복 조회 1.42→0.056ms(순수 Node), 결과는 Three.js 합성과 1e-9 이내. 남은 비용은 문서 변경마다 `loadSceneRuntime` 재파싱(4.5ms)이라 30-c `SceneProjector` 몫이다. 가변 `TransformSystem`(SoA, dirty)은 첫 가변 소비자인 `EntityWorld`와 함께 30-c에서 만든다 | 깊이 8 계층 1k 객체에서 `getWorldMatrix` 할당 0, 결과 동일 |
| 30-c | `EntityWorld`(NextWorld 일반화), `SceneProjector`, runtime 서비스 등록 | 명령 1회 반영 시 전체 순회 0(호출 수 테스트) |
| 30-d | `collider`/`rigidBody` 시스템(`SceneObjectBody` 대체), `meshRenderer` 시스템(12-f batch) | minihome probe 동작 동일 |
| 30-e | `animator`, `interactable`, `npc` 컴포넌트 시스템 | 도메인 테스트 통과 |
| 30-f | 건설 조각 `buildingPiece` 컴포넌트화(21-g 위), 플레이어·NPC·원격 플레이어 엔티티 노출, 인스펙터 스키마 편집기 | Hierarchy에 전 엔티티 표시, save 왕복 동일 |
| 30-g | blueprints를 prefab + script로 흡수, `@deprecated` | export snapshot 불변 |

## 7. 공개 API 영향

- 추가만: `EntityWorld`, `defineComponent`, `useSceneEntity`. `useEntity`는 boilerplate에 같은 이름이 있으므로 쓰지 않는다.
- `SceneObjectBody` props 유지, 내부 구현만 시스템으로 바꾼다.
- `src/blueprints` 공개 API는 `@deprecated` 후 major 제거.

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/scene-object src/core/prefab src/core/scripting src/next --runInBand
corepack pnpm exec jest examples/minihome --runInBand
node scripts/probe-minihome.cjs
node scripts/check-entry-isolation.cjs --layer1 --max-violations=0
```

완료 기준: NFR-30-01~04 충족. minihome이 자체 projection 없이 표준 컴포넌트로 동작한다.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| world model이 하나 더 생김 | `EntityWorld`는 projection으로 한정하고 원본은 `SceneDocument` 하나(21 ADR에 명시) |
| building/npc 이전 비용 | 도메인별 adapter(strangler), 도메인 하나당 slice 하나 |
| React 컴포넌트 기반 소비자 호환 | 기존 컴포넌트는 `EntityWorld`를 조회하는 wrapper로 유지 |
| SoA 전환이 이득 없음 | 30-b에서 `TransformSystem`만 먼저 측정하고, 컴포넌트 저장 방식은 측정 후 결정 |

## 10. 열린 질문

1. `SceneDocument`를 world model canonical로 확정하는가(21 PRD 열린 질문 1과 같은 결정).
2. 플레이어·원격 플레이어처럼 저장하지 않는 엔티티를 문서에 두지 않고 `transient`로만 둘 것인가.
3. `src/blueprints`를 deprecate해도 되는가.
