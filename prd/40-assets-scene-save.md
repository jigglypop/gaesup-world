# PRD-40 에셋·씬·저장

| 항목 | 값 |
|---|---|
| 우선순위 | P1(AST-06a는 P0, M0) |
| 마일스톤 | M0(AST-06a), M4 |
| 선행 | 10 PRD COR-02·COR-04(프리팹·씬), 01 PRD VER-01 |

## 1. 목표

유니티처럼 에셋을 GUID로 참조하고, 프리팹 인스턴스가 원본을 따라가고, 씬을 에셋으로 load/unload한다. 저장은 바뀐 도메인만 직렬화한다.

비목표: 에셋 임포트 GUI, 원격 에셋 서버. 기존 `scripts/assets` 파이프라인을 레코드 생성 쪽으로 확장한다.

## 2. 현재 상태

| 영역 | 문제 | 근거 |
|---|---|---|
| 로더 | 공용 로더가 meshopt만 설정. drei `useGLTF`(8곳)는 Draco 디코더를 gstatic CDN에서 받는다. `public/draco/`가 있는데 `setDecoderPath` 0, `KTX2Loader` 0. GLTFLoader 구현 두 벌(three-stdlib, three/examples) | `assets/gltfLoader.ts:5-7`, D-14 |
| 캐시 | drei 캐시(eviction 없음)와 refcount `GLTFAssetCache` 이원화. `preloadSizes`가 acquire→release로 즉시 dispose한 뒤 `useGLTF`가 같은 URL을 다시 받음 | `motions/hooks/useGaesupGltf.ts:28,91-95` |
| LOD | 파이프라인이 LOD1·2를 만들지만 런타임 레코드는 LOD0 URL만 남김 | `assets/production/index.ts:268` |
| 참조 | 영속 데이터에 원시 URL(`flagTexture`, `billboardImageUrl`, `modelUrl`, NPC `fullModelUrl`). URL 복구 코드(`NPC_ASSET_URL_REPLACEMENTS`) 존재 | `building/types/index.ts:109-128`, `npc/stores/npcStore.ts:69,183` |
| 매니페스트 | `GaesupProjectFile`과 `ContentBundle` 두 포맷, 런타임은 어느 쪽도 읽지 않음. 콘텐츠 로더가 JSON을 순차 await | `project-settings/projectFile.ts:11-19`, `content/types.ts:52-61`, `content/loader.ts:113` |
| 프리팹 | 인스턴스는 문서에 복사, variant는 bake, 전파에 이전 버전 인자 필요, 중첩 없음. 프리팹 편집 명령과 `SceneDocumentManager`가 증분 명령을 우회해 전체 replace | `prefab/overrides.ts:302-312`, `prefab/instances.ts:121` |
| 씬 | 씬 관리자 2개(`scene/`, `scene-object/manager.ts:35`). 씬 전환이 문서를 load하지 않음 | |
| undo | 명령 전 문서를 잡아 두고 `replace`로 되돌림 → reset delta로 소비자 전체 재투영 | `editor/shell.ts:266-279`, `scene-object/delta.ts:39-41` |
| 저장 | revision 없는 binding 하나가 전 도메인 skip을 끔. 롤백 스냅샷 전체 생성, 로드 clone 중복, 로드 후 재직렬화, `beforeunload` 비동기 저장, 슬롯 메타데이터 인덱스 없음. NPC 저장에 휘발 필드(`lastObservation`, `lastDecision`) 포함. 서버 호스트가 모든 도메인을 직렬화한 뒤 절반을 버림 | `save/core/SaveSystem.ts:172,205,264-271`, `building/stores/persistence.ts:167`, `saveHookCoordinator.ts:157`, `npc/plugin.ts:44`, `platform/serverHost.ts:107` |
| wasm | `document.baseURI` 기준 URL, `instantiateStreaming` 미사용, 본문 수신 오류를 영구 캐시 | `wasm/loader.ts:160-210` |

## 3. 설계

```
project manifest (scenes, prefabs, scripts, assets)
  └─ AssetDB: guid → { kind, source, importer, settings, deps, hash, variants(lod, format) }
       ├─ assets.resolve(guid, variant?) ──► 로더 하나(meshopt·Draco·KTX2) ──► 캐시 하나(refcount + LRU grace)
       ├─ SceneManager.load(sceneGuid, { additive }) ──► SceneDocument ──► SceneProjector(10 PRD)
       └─ prefab(guid, revision) ──► instance { prefabGuid, revision, overrides } (load 시 전개, revision 캐시)
SaveSystem
  └─ 도메인별 { revision, 직렬화 값 } 캐시 ──► 바뀐 도메인만 serialize ──► 경계에서 clone 1회 ──► adapter.put
```

## 4. 작업

### AST-01 로더 하나

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-01a | 공용 로더 팩토리에 로컬 `/draco/`와 KTX2(renderer 필요) 설정, drei `useGLTF`는 `extendLoader`로 같은 설정 공유(D-14). three-stdlib GLTFLoader 제거 | Draco GLB를 `gltfAssetCache.acquire`로 로드하는 테스트, gstatic 요청 0(S-B01 요청 목록) |

### AST-02 캐시 하나

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-02a | GLTF 캐시를 `GLTFAssetCache` 하나로. release 후 idle grace(예: 30초)와 LRU, 동시 로드 제한(4~6), preload API. `preloadSizes` 즉시 dispose 제거 | 같은 URL 요청 세션당 1회(duplicateRequests 0) |

### AST-03 AssetDB

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-03a | 레코드 형식, `kind`에 scene·prefab·script·model·texture·material·audio·animatorController 추가, `assets.resolve`, `scripts/assets/build.mjs` 레코드 출력. LOD variant를 레코드에 남기고 런타임이 선택. 에셋 store의 공개 selector(`selectAssetsByKind` 등)는 호출마다 새 배열을 만들지 않게 쿼리별 memo | 레코드 왕복 테스트, LOD1·2 선택 테스트 |
| AST-03b | 영속 URL → GUID migration(building, npc, meshRenderer). 미등록 URL은 `external` 레코드로 보존. 끝나면 URL 복구 코드 삭제 | S-H15, 영속 데이터 원시 URL 0 |

### AST-04 프리팹

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-04a | 인스턴스를 `{ prefabGuid, revision, overrides }`로 저장하고 load 시 전개, variant는 base GUID + overrides, 중첩 허용과 순환 검사, revision 기반 전파(이전 버전 인자 불필요). 프리팹 편집 명령은 증분 명령 경로를 탄다 | S-H15, 전개 결과 revision 캐시 테스트 |

| AST-04b | `src/blueprints`(엔티티 템플릿 + 컴포넌트)를 prefab + script 조합으로 흡수하고 `@deprecated`. `BlueprintSpawner`는 prefab 인스턴스화로 동작 | 기존 blueprints 테스트 통과, export snapshot 불변 |

### AST-05 씬과 매니페스트

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-05a | 프로젝트 매니페스트 하나(`GaesupProjectFile` 확장), `ContentBundle`은 export 형식으로 흡수(`@deprecated`), 콘텐츠 JSON 병렬 로드 | 매니페스트 load 테스트 |
| AST-05b | `SceneManager` 하나. SceneDocument 에셋 additive load/unload, 전환 이벤트, room·portal은 컴포넌트 | additive load/unload 테스트, 기존 `scene/` 전환 동작 동일 |

### AST-06 저장

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-06a(M0) | skip 판정을 도메인 단위로: 슬롯마다 도메인별 `{revision, 값}` 캐시, revision이 같으면 재사용, 모든 도메인이 같을 때만 쓰기 생략. `gameplay-events` 엔진에 revision 카운터, `createStoreDomainPlugin`·npc·camera·economy binding에 `createIdentityRevision` | S-H10 |
| AST-06b | 로드 clone 경계 1회(IDB structured clone 뒤 재복제 금지), 롤백 스냅샷은 적용 도메인만 lazy, 로드 후 재직렬화와 building 전체 재구성 제거 | S-H12, 로드 clone 호출 수 테스트 |
| AST-06c | `beforeunload`는 동기 가능한 최소 저장, 나머지는 `visibilitychange`. 슬롯 메타데이터 인덱스 키. NPC 휘발 필드 저장 제외. 서버 호스트 스냅샷은 필요한 도메인만 직렬화 | 저장 크기 비교 테스트 |
| AST-06d | `SaveLoadManager`, `createPersistenceSlice`를 SaveSystem binding 위임 adapter로 바꾸고 `@deprecated` | legacy 포맷 load 테스트, export snapshot 불변 |

### AST-07 undo 역연산

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-07a | editor undo를 명령의 역연산 patch로. 문서 전체 replace 금지. minihome session의 commit마다 `JSON.stringify` 비교 제거 | S-H16 |

### AST-08 wasm 로더

| Slice | 내용 | 완료 기준 |
|---|---|---|
| AST-08a | `new URL('./wasm/gaesup_core.wasm', import.meta.url)` + `instantiateStreaming`(Content-Type 불일치 시 arrayBuffer fallback), 본문 수신 오류 transient 재시도(D-13 잔여), 동기 accessor `peekCoreWasm()`(REN-10 잔디 이중 빌드 제거에 사용), 런타임 생성 시 선로드 | 5xx·본문 오류 재시도 테스트 |

## 5. 공개 API 영향

- 추가만: `AssetKind` 확장, `assets.resolve`, 매니페스트 필드, revision 기반 프리팹 API, `peekCoreWasm`.
- `propagatePrefabToDocument(document, previous, next)`는 유지한다.
- `ContentBundle`, `SaveLoadManager`, `createPersistenceSlice`는 `@deprecated` 후 2.0에서 제거한다.

## 6. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 기존 저장본 URL 손실 | 미등록 URL은 `external` 레코드로 보존, legacy load 테스트(S-H12) |
| 도메인 revision 누락으로 저장 누락 | revision 증가를 canonical write path 한 곳에서만. 누락 검출 테스트(값이 바뀌었는데 revision이 같으면 실패) |
| GLTF LRU evict 후 재사용 시 hitch | grace 기간, preload API |
| 프리팹 전개 비용 | revision 키 캐시 |
