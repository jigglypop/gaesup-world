# PRD-32 에셋 DB·프리팹·씬 관리

| 항목 | 값 |
|---|---|
| 우선순위 | P1(32-a는 P0) |
| 트랙 | Fast(32-a) → Epoch |
| 선행 PRD | 14(14-c 로더, 14-i GLTF 캐시 통합), 30-a, 30-c |
| 담당 agent | platform, architect |

## 1. 배경과 문제

유니티형 엔진은 에셋을 GUID로 참조하고, 프리팹 인스턴스가 원본 변경을 따라가며, 씬을 에셋으로 load/unload한다. 현재는 다음과 같다.

1. 객체 ID가 모듈 카운터라 새로고침 뒤 저장본의 ID와 충돌한다(D-22).
2. 영속 데이터에 원시 URL이 들어가서, URL이 바뀌면 이를 복구하는 코드가 필요하다.
3. 프리팹 인스턴스는 문서에 복사되고 variant는 bake되어 원본 변경이 전파되지 않는다.
4. 씬 관리자가 둘이고 씬 전환이 문서를 load하지 않는다.

## 2. 목표 / 비목표

**목표**
- 기본 ID를 충돌 없는 UUID로 바꾼다.
- 에셋 참조를 GUID 하나로 통일하고 URL은 `resolve` 결과로만 쓴다.
- 프리팹 인스턴스와 variant가 원본 revision을 따라간다.
- 씬 관리자를 하나로 만든다.

**비목표**
- 에셋 임포트 GUI. 기존 `scripts/assets` 파이프라인을 레코드 생성 쪽으로 확장한다.
- 원격 에셋 서버.

## 3. 현재 상태

**32-F01 ID가 모듈 카운터(D-22)** [확인]
- `object-${++n}`(`scene-object/core.ts:26,64`), `component-${++n}`(`:27,55`), `${prefab.id}-${++n}`(`prefab/instantiate.ts:4,10`), `${prefab.id}-instance-${++n}`(`prefab/overrides.ts:24,68`), play mode snapshot 카운터(`editor/playMode.ts:35`).
- 새로고침하면 카운터가 0부터 다시 시작한다. 저장본을 load한 뒤 editor `createObject`(`editor/shell.ts:290`)가 기존 ID를 만들면 `duplicate-object-id`(`scene-object/core.ts:120`)로 거부된다 [확인: 코드 경로, 미검증: 재현].
- minihome은 `crypto.randomUUID()`를 직접 넘겨 이 문제를 피한다(`examples/minihome/model.ts:41-42`).

**32-F02 GUID 없는 에셋 참조** [확인]
- `AssetKind` 9종이 아바타·건설 위주다(`assets/types.ts:1-10`). scene, prefab, script, texture, audio, animator controller가 없다.
- 영속 데이터에 원시 URL을 저장한다.
  - building: `flagTexture`, `billboardImageUrl`, `modelUrl`(`building/types/index.ts:109-128`)
  - NPC: `fullModelUrl`(`npc/types/index.ts:25`)
- 이를 고치는 `NPC_ASSET_URL_REPLACEMENTS`, `repairDefaultNPCAssetUrls`(`npc/stores/npcStore.ts:69,183`)가 있다.
- `meshRenderer`는 `assetId`와 `url`을 둘 다 받는다(`scene-object/components.ts:25-26`).
- 루트 포맷이 둘이고 런타임은 어느 쪽도 읽지 않는다: `GaesupProjectFile`(scenes, prefabs, requiredScripts, `project-settings/projectFile.ts:11-19`), `ContentBundle`(world, assets, blueprints, gameplay, `content/types.ts:52-61`).

**32-F03 프리팹 연결이 약함** [확인]
- 인스턴스는 문서에 복사되고 원본과는 `idPrefix` 문자열로만 이어진다.
- variant는 `applyOverridesToObjects`로 bake된다(`prefab/overrides.ts:302-312`). base가 바뀌어도 variant에 반영되지 않는다.
- 원본 변경을 전파하려면 호출자가 이전 prefab 버전을 넘겨야 한다(`prefab/instances.ts:121` `propagatePrefabToDocument(document, previous, next)`). 중첩 prefab이 없다.

**32-F04 undo가 문서 전체 교체** [확인]
- editor 명령의 undo는 실행 전 문서를 잡아 두었다가 `scene-document.replace`로 되돌린다(`editor/shell.ts:261-279`). 그래서 undo 1회마다 전체 검증과 전체 projection이 다시 돈다(14-h, 30-c와 충돌).

**32-F05 씬 관리자 2개** [확인]
- `scene/`(SceneDescriptor, `sceneStore` 전환, SceneRoot/RoomRoot)와 `scene-object/manager.ts:35` `SceneDocumentManager`(load, additive load, 문서 교체 방식 unload).
- 씬 전환이 문서를 load하지 않는다.

## 4. 요구사항

**FR**
- FR-32-01: 기본 ID는 `crypto.randomUUID()`로 만든다. 없는 환경에서는 기존 카운터에 세션 prefix를 붙여 fallback한다. 명시 ID 계약은 유지한다.
- FR-32-02: AssetDB 레코드는 `{ guid, kind, source, importer, settings, deps, hash, variants }` 형태로 한다.
  - `kind`에 scene, prefab, script, model, texture, material, audio, animatorController를 추가한다.
  - `assets.resolve(guid, variant?)`는 URL과 로더를 반환한다. 캐시는 14-i의 통합 GLTF 캐시를 쓴다.
  - `scripts/assets/build.mjs`가 레코드를 출력한다.
- FR-32-03: 영속 데이터에는 GUID만 저장한다. 기존 URL은 load 시 migration으로 GUID로 바꾼다(SceneDocument migration, building/npc hydrate). 등록되지 않은 URL은 `external` 레코드로 보존한다. migration이 끝나면 URL 복구 코드를 삭제한다.
- FR-32-04: 프로젝트 매니페스트는 하나로 한다. `GaesupProjectFile`을 확장해 scenes, prefabs, scripts, assets를 담고, `ContentBundle`은 이 매니페스트의 export 형식으로 흡수한다.
- FR-32-05: 프리팹 인스턴스는 `{ prefabGuid, revision, overrides }`로 저장하고 load 시 전개한다.
  - variant는 base GUID와 overrides로 표현하고 bake하지 않는다.
  - 중첩 prefab을 허용하고 순환은 검사로 막는다.
  - 원본 revision이 바뀌면 이전 버전 인자 없이 전파한다.
- FR-32-06: `SceneManager`는 하나로 한다. SceneDocument 에셋을 additive load/unload하고 전환 이벤트를 낸다. room, portal은 컴포넌트로 표현한다.
- FR-32-07: editor undo는 명령의 역연산(patch)으로 한다. 문서 전체 replace를 쓰지 않는다.

**NFR**
- NFR-32-01: 새로고침 후 저장본 load → 객체 생성에서 ID 충돌 0.
- NFR-32-02: migration 후 영속 데이터의 원시 URL 0.
- NFR-32-03: prefab base 변경이 인스턴스와 variant에 반영된다(override는 보존).
- NFR-32-04: undo 1회 비용은 변경 객체 수에 비례한다.

## 5. 설계

```
project manifest (scenes, prefabs, scripts, assets)
   └─ AssetDB: guid → { kind, variants(lod, format), deps, hash }
        ├─ assets.resolve(guid) ──► GLTF 캐시(14-i), 텍스처 캐시(12-d)
        ├─ SceneManager.load(sceneGuid, { additive }) ──► SceneDocument ──► SceneProjector(30)
        └─ prefab(guid, revision) ──► instance { prefabGuid, revision, overrides } (load 시 전개)
```

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 32-a | D-22 UUID 기본값, 카운터 fallback | 카운터를 초기화한 뒤 저장본을 load하고 새 객체를 만들어도 충돌 0인 테스트 |
| 32-b | AssetDB 레코드, `resolve`, kind 확장, build.mjs 레코드 출력(14-c, 14-i 이후) | 레코드 왕복 테스트, 캐시 중복 요청 0 |
| 32-c | 영속 URL → GUID migration(building, npc, meshRenderer), URL 복구 코드 삭제 | legacy 저장본 load 테스트, 영속 URL 0 |
| 32-d | 프로젝트 매니페스트 통합, `ContentBundle` 흡수 | 매니페스트 load 테스트 |
| 32-e | prefab GUID 인스턴스, live variant, 중첩 | base 변경 전파 테스트 |
| 32-f | undo 역연산 | 2k 객체 문서에서 undo 비용 일정 |
| 32-g | `SceneManager` 통합(30-c 이후) | additive load/unload 테스트, `scene/` 전환 동작 동일 |

## 7. 공개 API 영향

- 32-a: 명시 ID를 넘기지 않은 호출의 ID 형식이 바뀐다(`object-1` → UUID). ID 형식에 기대는 소비자에게는 동작 변경이다.
- `AssetKind` 확장, `assets.resolve`, 매니페스트 필드는 추가만.
- `propagatePrefabToDocument(document, previous, next)`는 유지하고 새 API는 revision 기반으로 추가한다. `ContentBundle`은 `@deprecated`.

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/scene-object src/core/prefab src/core/assets src/core/content src/core/project-settings src/core/editor --runInBand
corepack pnpm run test:asset-tools
corepack pnpm exec jest examples/minihome --runInBand
```

완료 기준: NFR-32-01~04 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 기존 저장본 URL 손실 | 미등록 URL은 `external` 레코드로 보존, legacy load 테스트 |
| ID 형식 변경으로 스냅샷 테스트 변경 | 명시 ID를 쓰는 테스트는 그대로, 자동 ID 단언만 형식 검사로 교체 |
| prefab load 시 전개 비용 | 전개 결과를 revision 키로 캐시 |

## 10. 열린 질문

1. 자동 ID를 UUIDv4(`crypto.randomUUID`)로 할 것인가, 정렬 가능한 UUIDv7로 할 것인가.
2. 샘플 GLB를 패키지에서 분리할 때(15 FR-15-12) AssetDB 기본 레코드는 어디에 둘 것인가.
3. `ContentBundle`을 deprecate해도 되는가.
