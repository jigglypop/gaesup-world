# PRD-12 렌더링과 GPU

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Epoch |
| 선행 PRD | 10(기준 장면), 00(D-03, D-15) |
| 담당 agent | runtime |

## 1. 배경과 문제

렌더 경로는 셋이다(three 0.186 기준).

| 경로 | 조건 | 가시성 처리 |
|---|---|---|
| WebGPU gpuResident | `supportsGpuInstanceBatches` true | `GpuBatchBridge` indirect draw |
| WebGL | 기본 | CPU `BuildingVisibilityDriver` → React 목록 필터 |
| WebGPU readback | three가 185/186 아님 | `BuildingGpuCullingDriver` compute + `mapAsync` |

typed array 스냅샷, dirty-range 업로드, readback 없는 GPU-driven 인스턴스 같은 좋은 기반이 있는데, 실제 장면 렌더는 이를 쓰지 않는 곳이 많다.

- 가시성 컬링이 React mount/unmount로 구현되어 collider까지 사라진다(D-03).
- draw call이 재질 수가 아니라 그룹·타일·조각 수에 비례한다.
- 반사 water와 glass transmission이 장면을 통째로 다시 그린다.
- 품질 프로파일(DPR, 섀도 맵)이 계산만 되고 적용되지 않은 채 후처리가 풀해상도로 돈다.

## 2. 목표 / 비목표

**목표**
- 렌더 컬링을 React 수명과 물리 수명에서 분리한다.
- draw call을 (geometry, material) 조합 수 수준으로 줄인다.
- 품질 프로파일을 renderer, 섀도, 후처리에 실제로 적용한다.
- WebGL/WebGPU 이중 구현을 TSL 하나로 수렴하는 경로를 정한다.

**비목표**
- 새 렌더러 도입. WebGPU-first 방향(AGENTS.md)을 유지한다.
- `BuildingRenderSnapshot`, `SpatialGrid`, 가시성 셀 버킷의 구조 교체. 할당 정책과 연결만 바꾼다.

## 3. 현재 상태

### 3.1 High

**12-F01 가시성 컬링이 React mount/unmount와 Rapier collider 수명에 묶임(D-03)** [확인]
- `BuildingSystem/index.tsx:146,166-175`: `visibilityReady`이면 `groups.filter(g => visibleWallGroupIds.has(g.id))` 후 `clampList`로 잘라 `WallSystem`/`TileSystem`을 key 목록으로 렌더.
- `TileSystem/index.tsx:921-931`, `WallSystem/index.tsx:334-343`: collider가 그 목록 안에 있다.
- `BuildingVisibilityDriver/index.tsx:89-93,149-193`: 0.12초마다 새 Set 4개를 store에 쓴다.
- `TileSystem`, `WallSystem`, `BlockSystem` 모두 `React.memo`가 없다. `useRef<MaterialManager>(new MaterialManager())`(TileSystem:493, WallSystem:285, BlockSystem:56)는 렌더마다 MaterialManager와 TextureLoader를 만들었다 버린다.
- 영향 [추정]: 카메라 회전 시 프러스텀 밖 그룹의 InstancedMesh, geometry, 재질, collider가 최대 약 8Hz로 destroy/create. 다시 보일 때 GPU 버퍼 재업로드. 화면 밖 지면의 collider 소실.

**12-F02 draw call이 그룹·타일·조각 수에 비례** [확인]
- 재질 공유 없음: 그룹마다 `new MaterialManager()`, TextureLoader와 텍스처 캐시도 인스턴스 소유(`core/MaterialManager.ts:13-18`). 같은 textureUrl을 그룹 수만큼 디코드·업로드.
- grass가 타일 단위: `TileSystem:1038-1040` → `TileObject/index.tsx:124-133` 타일마다 blade mesh(castShadow) + ground mesh. `Grass.tsx:382`의 `cells` 병합 경로를 쓰지 않는다.
- 타일마다 고유 geometry: round `TileSystem:968-976` `<cylinderGeometry args={[…,28]}>`, ramp(989-1005), stair(`StairTileMesh`).
- 비-solid 벽: `WallSystem/index.tsx:118-121` 조각마다 고유 BoxGeometry + 재질 6개 배열 → 조각당 draw 6회. window 벽 1개 약 26 draw.
- solid 벽 batch도 재질 6개 배열(WallSystem:269)로 InstancedMesh 하나당 draw 6회(WebGL).
- 모델: `mesh/model/index.tsx:43-48` 배치마다 `SkeletonUtils.clone(scene)`, 인스턴싱 없음.
- gpuResident 경로: source의 material group마다 indirect Mesh 하나(`gpuInstanceBatch.ts:72-122`), 카메라 이동 시 source마다 `renderer.compute(kernels)`(212) 별도 제출.
- 영향 [추정]: 그룹 50, grass 타일 200, window 벽 40 기준 메인 pass 약 1.6k draw, CSM 3 캐스케이드(`CascadedSun.tsx:19-23`) 섀도 약 4k draw.

**12-F03 장면 재렌더 재질: 반사 water, glass transmission** [확인]
- `mesh/water/index.tsx:381-387`: 비-toon(기본) 경로에서 patch마다 three-stdlib `Water`(planar reflection). `onBeforeRender`에서 mirror camera로 scene을 다시 렌더. `lod.near=25`(TileSystem:63) 안 patch마다 full scene pass 1회 추가. 같은 컴포넌트가 patch마다 재질을 새로 만들고(122-135, 210-241) shore 4면 inline `planeGeometry`(317-359).
- `MaterialManager.ts:87-93` GLASS = `MeshPhysicalMaterial({ transmission: 0.98 })`, window/glass 벽 기본 재질(`WallSystem:19-26`). WebGL은 transmissive 객체가 하나라도 있으면 매 프레임 opaque 전체를 transmission RT에 한 번 더 그린다.

**12-F04 품질 프로파일 미적용, 후처리 풀해상도** [확인]
- `perf/detect.ts:81-110`의 `pixelRatio`, `shadowMapSize`는 소비처가 없다. `project-settings/defaults.ts:24 pixelRatio: 1.5`는 검증 코드에서만 쓰인다.
- `WorldPostProcessing.tsx:138-148,169-176`: balanced 기본값이 MRT(output+velocity+normal) + TRAA + GTAO(0.5 해상도, 8 samples) + bloom. R3F 기본 dpr [1,2]라 고DPI에서 픽셀 4배.
- 후처리가 최종 출력을 맡는데 renderer는 `antialias: true`(`webgpu.ts:48`) [미검증: MSAA 낭비 여부].
- `frameloop='demand'` 경로 없음. 정적 편집 화면도 매 프레임 렌더. minihome만 자체 demand loop(`examples/minihome/demandLoop.ts`).

**12-F05 AssetPreviewCanvas가 미리보기마다 WebGL 컨텍스트 생성** [확인]
- `assets/components/AssetPreviewCanvas/index.tsx:110-115` 보이는 타일마다 `<Canvas>`, `autoRotate`(81)로 계속 렌더.
- 16개를 넘으면 브라우저가 오래된 컨텍스트를 잃게 하고, 메인 월드 캔버스가 포함될 수 있다.

### 3.2 Medium

| ID | 발견 | 근거 |
|---|---|---|
| 12-F06 | `GpuBatchBridge`가 count 변경마다 전체 재구축, geometry 복제 | `GpuBatchBridge.tsx:162-171` storage buffer 4개 재할당, 재질 clone, kernel 재생성·재컴파일. WallBatchMesh는 capacity 1.5배(WallSystem:231-237)인데 bridge는 count 기준. `gpuInstanceBatch.ts:99` material group마다 `geometry.clone()`. `:180-183` 변경 시 인스턴스마다 `[x,y,z,r]` 배열. `gpuMaterialSync.ts:18-24` part마다 매 프레임 재질 key 전체 순회 |
| 12-F07 | readback culling 경로는 비용만 있고 효과 없음 | `BuildingGpuCullingDriver/index.tsx:20,332-389` 180ms마다 compute + `mapAsync`, string Set 4개(`render/culling.ts:71-103`), React commit 4~5회 연쇄. `BuildingVisibilityDriver:110-116`은 viewProjection 완전 일치일 때만 GPU 결과를 써서 카메라 이동 중엔 항상 CPU 경로. CPU 경로는 17×17 셀 × 4종 문자열 키(`visibility/core.ts:299-312`). `render/upload.ts:139,148-151,188-201`의 meta/indirect args buffer는 테스트 외 바인딩 0 |
| 12-F08 | 가시성 변경마다 batch geometry 전체 재생성 | `BuildingSystem:195-237` visibleObjects → `sakura.tsx:429,454-498` canopy/ground/falling geometry 재생성 + 모든 matrix 업로드. FireBatch(`fire/index.tsx:551-637`), FlagBatch, BillboardBatch 동일 |
| 12-F09 | Grass 타일별 리소스 중복, 섀도 비용 | `Grass.tsx:142-175` 타일마다 blade 텍스처 2개 load(`THREE.Cache` 미사용), `NodeGrassMaterial.tsx:7` 타일마다 재질. `Grass.tsx:516` blade `castShadow`(최대 18,000 instance × 10 tri × 캐스케이드). ground(388-393, 최대 128² segment)는 컬링 대상 아님 |
| 12-F10 | TRAA history 리셋마다 RT 재할당 | `WorldPostProcessing.tsx:236-243` `setSize(1,1)` 후 복원. FOV/zoom smoothing 중 매 프레임, GPU batch matrix 변경마다(GpuBatchBridge:175) |
| 12-F11 | WebGL/WebGPU 이중 구현과 WebGPU 미지원 경로 | fire(GLSL `fire/index.tsx:286-432` vs `tsl/fire.ts`), grass, flag, snow, weather, water 3종, bloom glow 두 벌. `sakura.tsx:500-510` ShaderMaterial, `:636-641` PointsMaterial size는 WebGPU 경로 없음 [미검증: 표시 결과]. 대응 `NodeTreeParticles.tsx`는 테스트 외 사용 0. `next/backend/gpuCulledInstances.ts:87-89`는 scale 0으로 숨겨 vertex 비용 그대로, dispose가 storage attribute 미해제(105-107). `tsl/grass.ts:40-78` wind compute는 CPU 루프 placeholder |
| 12-F12 | 셰이더 컴파일 히치 | `compileAsync` 워밍업 0건. GPU batch 재질 clone, 모델 첫 표시, 날씨 전환(`WeatherEffect:40-73` kind 변경마다 새 PointsMaterial)이 첫 프레임 동기 컴파일. `mesh/model/index.tsx:112-119` lamp마다 `<pointLight>` → WebGL은 light 수가 program key라 배치·삭제마다 lit 재질 전체 재컴파일 |
| 12-F13 | 월드 오브젝트와 모델 캐시 | `world/components/Tree/index.tsx:118-131` 나무마다 geometry·재질 3개, `:82-93` 나무마다 매 프레임 콜백(공개 `TreeObject`). drei `useGLTF` 캐시(eviction 없음)와 refcount `GLTFAssetCache` 이원화 |
| 12-F14 | 불필요한 castShadow, 고정 섀도 카메라 | 평면 타일 batch(`TileSystem:475-481`), sand/snowfield(`sand.tsx:114,287`), 측면 mesh(`TileSystem:1007-1014`, frustumCulled=false). `sky/index.tsx:159,167-181` 섀도 카메라 ±90 고정, 매 프레임 sun 이동으로 섀도 갱신, 약 17cm/texel |

### 3.3 Low

| 위치 | 내용 |
|---|---|
| `WeatherEffect/index.tsx:88-114`, `snow/index.tsx:278,333` | 매 프레임 position 버퍼 전체 업로드 |
| `Footprints:116-135` | 변화 없어도 매 프레임 matrix·color 업로드 |
| `TeleportDropEffect:169-193` | 파티클마다 geometry·재질, 이펙트 하나에 14+ draw |
| `avatar/runtime/assembler.ts:143` | 모든 skinned part `frustumCulled=false`, 원격 아바타 항상 렌더 |
| FireBatch, SakuraBatch | 인스턴스 변경 후 `computeBoundingSphere` 없음(D-15) |
| `WorldPostProcessing.tsx:252,272-274` | 매 프레임 `{...camera.view}`. WebGL Outline children이 `<group/>`뿐인 순수 오버헤드 |
| `billboard:25-61` | 그룹마다 512px canvas 텍스처 |
| `perf/detect.ts:27-30` | 감지용 WebGL 컨텍스트 미해제 |
| `PassiveObjects:115-133` | 거리 LOD로 RigidBody mount/unmount(12-F01과 같은 결합) |
| `MaterialManager.getMaterial` | dev에서 `@Profile`이 호출마다 로그 |

### 3.4 2차 분석 추가(2026-09-24)

**12-F15 `ShadowDepthMaterials`가 WebGPU에서 효과 없이 씬을 순회** [확인]
- three에서 `customDepthMaterial`을 읽는 곳은 `renderers/webgl/WebGLShadowMap.js`뿐이다. WebGPU/node 렌더러는 읽지 않는다.
- 그런데 `world/components/WorldContainer/index.tsx:165`가 항상 마운트하고, `rendering/shadow/ShadowDepthMaterials.tsx:19`가 500ms마다 `scene.traverse`를 한다.
- castShadow 메시마다 `[material]` 배열, `parts[]`, `join()` 문자열, `.some` 클로저를 만든다(`depthMaterialCache.ts:36-44,64`). 변경이 없어도 같다.
- 비용 [추정]: 객체 10k에서 500ms마다 1~3ms 스파이크와 GC.

**12-F16 NPC 파츠 toon 재질 누수(D-23)와 LOD 재마운트** [확인]
- `npc/components/NPCInstance/index.tsx:93-94`가 `useMemo` 안에서 `applyToonToScene(clone)`만 하고 `releaseToonFromScene`을 호출하지 않는다(`PhysicsEntity.tsx:108`, `RiderRef.tsx:34`는 해제함). 파츠 마운트마다 `MeshToonMaterial`이 새로 쌓인다.
- `npc/components/NPCSystem/index.tsx:61-80,136-151`: 0.5초마다 120m 경계를 넘은 NPC를 mount/unmount한다. 그때마다 `SkeletonUtils.clone`, drei mixer, kinematic body와 collider 2개를 다시 만들고 위 누수가 반복된다. `setVisibleIds`는 모든 인스턴스를 재렌더한다.

**12-F17 TSL 재질마다 전용 time uniform과 JS 프레임 콜백** [확인]
- `tsl/fire.ts:20,59`, `flag.ts:5`, `snow.ts:5`, `weather.ts:12`, `grassMaterial.ts:33`, `toonWater.ts:11`이 각자 `uniform(0)` time을 두고 `NodeWeather`, `NodeFireEffects`, `NodeGpuSnow`, `NodeWaterMaterial`이 프레임 콜백으로 갱신한다. 재질 공유를 막고 콜백 N개가 돈다.
- `NodeWeather`는 `wind`, `area`, `height`를 노드 그래프에 굽는다(useMemo 의존성). 값이 바뀌면 재질과 파이프라인을 다시 만든다.

**12-F18 Grass가 타일마다 매 프레임 역행렬** [확인]
- `mesh/grass/Grass.tsx:461-483`의 `apply`가 타일마다 매 프레임 uniform 4개를 쓰고 `mesh.worldToLocal`(Matrix4 invert)을 호출한다. 값은 모든 타일에서 같다. `manager.ts:215`는 타일마다 state 객체를 만들고, `:204`는 WASM이 계산한 lod 가중치를 JS로 다시 계산한다.

## 4. 요구사항

**FR**
- FR-12-01: collider는 가시성과 무관한 persistent driver가 소유한다. 가시성은 렌더(visible, instance count, GPU compaction)에만 영향을 준다.
- FR-12-02: 전역 `MaterialCache`(키 `createMaterialKey`)와 refcount 텍스처 캐시를 둔다. 그룹별 `MaterialManager` 생성을 없앤다.
- FR-12-03: (geometry, material) 키당 world-level InstancedMesh를 둔다. 그룹은 instance 범위로 표현하고 `BuildingRenderSnapshot` typed array를 쓴다.
- FR-12-04: grass는 그룹당 `Grass` 하나(`cells`)로 합친다. round/ramp/stair/벽 조각은 단위 geometry를 공유한다. 벽 6면 재질이 같으면 단일 재질을 쓴다.
- FR-12-05: 모델은 URL×mesh별 InstancedMesh 또는 BatchedMesh로 그린다.
- FR-12-06: 반사 water는 opt-in이며 같은 평면 높이 patch끼리 reflector 하나를 공유한다. 기본은 TSL toon water.
- FR-12-07: glass transmission은 quality 옵션(high 이상)에서만 켠다. 기본은 transparent + fresnel/env.
- FR-12-08: 품질 프로파일을 Canvas `dpr`(상한 1.5), 섀도 맵 크기, 후처리 해상도·샘플에 적용한다. 후처리가 켜지면 `antialias: false`.
- FR-12-09: 정지 상태 감지 후 invalidate 기반 렌더(`frameloop='demand'`) 옵션을 제공한다.
- FR-12-10: 에셋 미리보기는 공유 오프스크린 renderer로 썸네일을 한 번 렌더해 이미지로 캐시하거나, 단일 Canvas + drei `<View>`를 쓴다.
- FR-12-11: `GpuBatchBridge`는 capacity 기준으로 할당하고 바뀐 인스턴스만 `addUpdateRange`로 올린다. geometry는 원본 attribute를 참조하고 복제하지 않는다. 재질 동기화는 `material.version` 변경 시에만 한다.
- FR-12-12: readback culling 경로는 readback 없는 `gpuDrivenInstances` 방식으로 바꾸거나 제거한다. WebGL에서는 mirror/upload driver를 마운트하지 않는다.
- FR-12-13: batch(sakura, fire, flag, billboard)는 전체 객체로 한 번 구성하고 가시성은 per-instance attribute나 compaction으로 처리한다.
- FR-12-14: 로딩 단계에서 `renderer.compileAsync`로 재질을 워밍업한다. 램프 조명은 emissive + bloom 또는 고정 크기 light pool로 바꾼다.
- FR-12-15: 지면류는 receiveShadow만 한다. 섀도 카메라는 플레이어를 따라가며 texel snapping을 적용한다.
- FR-12-16: `ShadowDepthMaterials`는 WebGL 렌더러에서만 마운트한다. WebGL에서도 주기 순회 대신 객체 add/remove 또는 렌더 revision 변경 시에만 갱신하고, 메시별 결과를 `(material.version, geometry.id)` 키로 캐시한다.
- FR-12-17: toon 재질 적용은 layout effect에서 하고 cleanup에서 해제한다(D-23). toon 재질은 원본 재질 키 refcount 캐시로 공유한다.
- FR-12-18: (2026-09-24 수정) NPC 거리 LOD의 mount/unmount는 먼 NPC의 mixer·물리 바디를 없애는 스트리밍 역할을 하므로 유지한다. 대신 경계 왕복 재마운트를 막는 히스테리시스(표시 후 far + 15m까지 유지)를 둔다. 목록은 안정 `onSelect`로 NPCInstance memo를 살린다.
- FR-12-19: TSL 재질은 내장 `time` 노드를 쓰고 JS time 콜백을 없앤다. 그래프에 굽는 파라미터는 uniform으로 바꾸고, 같은 설정은 재질 하나를 공유한다. Grass 공통 uniform은 타일 간 공유하고 trample은 world 좌표로 전달한다.

**NFR**
- NFR-12-01: 카메라 궤도 중 geometry 생성·해제 0, React commit ≤ 2/s(10 PRD 예산).
- NFR-12-02: M 장면 메인 pass draw call을 10-a 측정값 대비 50% 이상 줄인다.
- NFR-12-03: warm-up 후 새 program 컴파일 0.
- NFR-12-04: 모든 GPU 리소스는 소유자와 dispose 경로를 가진다(AGENTS.md).

## 5. 설계

### 5.1 컬링 분리(12-F01)

```
buildingStore(데이터) ──► BuildingColliderDriver(persistent, 그룹 전체) ──► Rapier
                     └─► BuildingRenderStateDriver ──► RenderBatches(InstancedMesh per key)
BuildingVisibilityDriver ──► visibility bitset ──► RenderBatches.setVisibleRange / count
```

React는 batch 컨테이너만 소유한다. 가시성 변경은 React state를 거치지 않고 batch의 instance 순서와 count를 바꾼다. `BuildingVisibilityDriver`의 Set 4개는 그룹 인덱스 bitset(Uint32Array)으로 바꾸고 store에는 `version`만 둔다.

### 5.2 배치 통합(12-F02)

1. `MaterialCache` 도입: 기존 `MaterialManager`의 재질 생성 로직을 전역 캐시로 옮기고 그룹별 인스턴스는 조회만 한다(strangler).
2. 단위 geometry 레지스트리: `unitBox`, `unitCylinder(28)`, `unitRamp`, `unitStair`를 공유한다.
3. world-level InstancedMesh: 키 = (unit geometry, material key). `BuildingRenderSnapshot`의 SoA에서 matrix를 채운다.
4. gpuResident 경로도 같은 키로 전역 instance buffer를 두고 compute를 한 번 dispatch한다.

### 5.3 품질 프로파일 적용 지점(12-F04, 10 PRD FR-10-06)

`RenderQualityProfile`(tier별 dpr, shadowMapSize, cascadeCount, postprocess preset, transmission, reflection)을 하나 두고 `WorldContainer`가 Canvas와 `WorldPostProcessing`, `CascadedSun`, water, glass에 전달한다. frame time 기반 동적 해상도는 이 프로파일의 dpr만 조정한다.

### 5.4 이중 구현 수렴(12-F11)

TSL은 WebGL2 backend에서도 동작하므로 TSL을 canonical로 둔다. GLSL 구현은 `compat/webgl/` 경계로 옮기고 새 기능은 TSL에만 추가한다. 도메인별(fire → grass → water → weather → sakura) 순서로 한 slice에 하나씩 옮긴다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 12-a | D-03 핫픽스: collider를 가시성 필터 밖으로 이동. D-15 `computeBoundingSphere` | 카메라 밖 NPC 낙하 재현 테스트 통과. 궤도 중 collider 수 불변 |
| 12-b | `TileSystem`/`WallSystem`/`BlockSystem` `React.memo`, `useState(() => new MaterialManager())` | 궤도 중 TileSystem render 수 감소(Profiler) |
| 12-c | 품질 프로파일 적용(dpr, 섀도 맵, 후처리 preset, antialias) | dpr 1/1.5/2별 GPU timestamp 비교 기록 |
| 12-d | `MaterialCache`와 텍스처 refcount 캐시 | M 장면 `info.memory.textures`가 그룹 수와 무관 |
| 12-e | 가시성 bitset과 batch 기반 컬링(5.1). 마운트 분리 완료(2026-09-25): `BuildingVisibilityDriver`는 프러스텀 대신 거리로 상주 그룹을 정한다(진입 140m, 이탈 +20m 히스테리시스, 카메라 1m 미만 이동은 재계산 없음). 화면 밖 draw는 three의 객체별 프러스텀 컬링이 맡고, 바위 InstancedMesh도 bounding sphere를 갱신한다. 회전은 결과를 바꾸지 않아 궤도 중 mount·commit이 0이다. GPU readback 예산으로 그룹 목록을 앞에서부터 자르던 clamp(보이는 그룹과 무관)는 삭제했다. bitset과 world-level batch는 12-f와 함께 | 궤도 중 geometry churn 0, commit ≤ 2/s |
| 12-f | 단위 geometry 공유, world-level InstancedMesh, grass `cells` 병합, 벽 단일 재질 | M 장면 draw call 50% 감소 |
| 12-g | water 반사 opt-in·공유, glass transmission 품질 옵션 | glass 벽 1개 추가 전후 `render.calls` 2배 증가 없음 |
| 12-h | `GpuBatchBridge` capacity 할당, 부분 업로드, geometry 참조, 재질 version 동기화 | 편집 연타 중 long task 수, `info.memory.geometries` 불변 |
| 12-i | readback culling 제거 또는 교체, WebGL에서 mirror/upload 미마운트. 마운트 제거 완료(2026-09-25, 12-e): `BuildingController`가 mirror·upload·culling·indirect draw·args 드라이버를 마운트하지 않는다(소비자 0). 공개 export와 코드 삭제는 2.0 | `world-render-state` 시나리오 commit 수와 CPU ms 감소 |
| 12-j | batch 재구성 제거(sakura, fire, flag, billboard) | 가시성 변경 시 `computeSpecs`/`makePointsGeo` 호출 0 |
| 12-k | 에셋 미리보기 단일 renderer 썸네일 | 에셋 패널 스크롤 중 `webglcontextlost` 0 |
| 12-l | `compileAsync` 워밍업, lamp light pool | warm-up 후 program 증가 0 |
| 12-m | 섀도 정리(receive only, 추적 섀도 카메라, 갱신 임계) | 섀도 pass draw call 기록 감소 |
| 12-n | TSL 수렴(도메인별 slice), `gpuCulledInstances` deprecate | GLSL 경로가 `compat/webgl/`에만 존재 |
| 12-o | demand 렌더 옵션, TRAA 리셋 RT 재할당 제거, 3.3절 Low 항목 | 정지 상태 GPU 사용률 감소 기록 |
| 12-p | D-23 toon 해제, toon 재질 refcount 공유(FR-12-17) | NPC 파츠 mount/unmount 100회 후 `MeshToonMaterial` 수 불변 |
| 12-q | `ShadowDepthMaterials` WebGPU 미마운트, WebGL 변경 기반 갱신(FR-12-16) | WebGPU에서 `scene.traverse` 0. WebGL 정지 장면에서 순회 0 |
| 12-r | NPC LOD 히스테리시스, 안정 `onSelect`(FR-12-18). 완료(2026-09-24) | 경계 왕복 시 재마운트 0(`NPCSystem/__tests__/lod.test.ts`) |
| 12-s | TSL 내장 time, 파라미터 uniform화, Grass 공통 uniform(FR-12-19). 부분 완료(2026-09-24): fire·ember·snow·weather 재질이 TSL `time` 노드를 쓰고 fire time 콜백과 weather time 콜백을 제거, weather area·height·wind는 uniform이라 wind 변경에 재질·파이프라인을 다시 만들지 않는다. flag(GLSL·TSL 공용 인스턴스 타입)와 Grass는 잔여 | time 프레임 콜백 0, 날씨 파라미터 변경 시 program 증가 0, Grass 프레임당 invert 0 |

12-f의 world-level batch는 building 전용이 아니라 `(geometry, material)` 키의 공용 batch로 만든다. 30 PRD의 `meshRenderer` 시스템(30-d)이 같은 batch를 쓴다.

## 7. 공개 API 영향

- `TreeObject`: 내부 구현을 InstancedMesh 기반으로 바꾸되 props는 유지한다.
- `WorldContainer`/`GaesupWorld`에 `quality`(프로파일 이름 또는 객체)와 `frameloop` prop을 추가한다(추가만).
- water `reflection`, glass `transmission` 옵션 추가. 기본값 변경은 시각 결과가 바뀌므로 열린 질문 1.
- `gpuCulledInstances`는 `@deprecated`.

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/building src/core/rendering src/next --runInBand
node scripts/probe-rendering-performance.cjs
node scripts/benchmark-culling.cjs
corepack pnpm perf:check --scene=perf-world --size=M   # 10 PRD
```

완료 기준: NFR-12-01~04 충족. `probe-building-gpu-culling.cjs`, `probe-webgpu-world.cjs`, `probe-toon-water.cjs`가 기존대로 통과한다.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| world-level InstancedMesh가 편집 picking을 깨뜨림 | instance id → (group, tile) 역인덱스를 batch가 소유. `GpuBatchBridge`의 picking/shadow 원본 유지 방식을 재사용 |
| 기본 water·glass 변경으로 시각 회귀 | 기본값 변경은 사용자 확인 후, `probe-minihome-lighting.cjs` 스크린샷 비교 |
| TSL 수렴 중 WebGL 품질 저하 | 도메인별 slice로 옮기고 WebGL2 backend 스크린샷 비교 |
| collider driver 분리로 편집 중 collider 갱신 지연 | 그룹 revision 기반 증분 갱신, 편집 명령 후 같은 프레임 반영 테스트 |

## 10. 열린 질문

1. 기본 water를 반사 없는 TSL toon으로, 기본 glass를 transmission 없는 재질로 바꿔도 되는가.
2. readback culling 경로(three 185/186 외 WebGPU)를 제거해도 되는가, 아니면 gpuDrivenInstances 방식으로 교체해야 하는가.
3. peer three 범위(0.168~0.186)를 유지하면 TSL 수렴 범위가 제한된다. 15 PRD의 peer 범위 결정과 함께 정한다.
