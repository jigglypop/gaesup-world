# PRD-20 렌더

| 항목 | 값 |
|---|---|
| 우선순위 | P0(REN-01~REN-07), P1(나머지) |
| 마일스톤 | M2(REN-01~REN-08, REN-10, REN-11), M3(REN-09, REN-12), M6(REN-13, REN-14) |
| 선행 | 10 PRD COR-02·COR-03(EntityWorld, TransformSystem), 01 PRD VER-01·VER-03 |

## 1. 목표

RC-3(렌더 단위가 React 컴포넌트)을 없앤다.

- 렌더는 `EntityWorld` 데이터에서 공유 batch로 추출한다. 엔티티·타일·파츠마다 React 컴포넌트를 두지 않는다.
- batch는 편집으로 다시 만들어지지 않는다. 바뀐 인스턴스 범위만 업로드한다.
- 셰이더는 실제로 그릴 render context(후처리 pass 포함)로 미리 컴파일한다. 워밍업 뒤 새 program 컴파일은 0이다.
- 에셋 로딩은 해당 엔티티만 기다린다. 월드 전체가 사라지지 않는다.
- WebGPU를 우선한다. 품질 등급에 따라 DPR, 그림자, 후처리, 밀도를 정한다.
- 화질 목표는 고품질 스타일라이즈드다(REN-14).

비목표:
- 새 렌더러. three `WebGPURenderer`를 유지한다.
- 실사와 하드웨어 레이 트레이싱.
- `BuildingRenderSnapshot` SoA, `SpatialGrid`, 가시성 셀 버킷 구조 교체.

## 2. 현재 상태 [확인]

| 영역 | 사실 | 근거 |
|---|---|---|
| 합성 | 소비자가 `<Canvas gl={createRenderer}>`를 만든다. `GaesupWorldContent`는 월드 전체를 `Suspense` 하나로 감싼다. Rapier `<Physics>`가 WASM 로딩 동안 suspend해 건설·캐릭터가 모두 기다린다. R3F v9 `hideInstance`는 `visible=false`라 suspend 시 월드가 통째로 사라진다 | `world/components/WorldContainer/index.tsx:171-179`, `WorldPhysics/index.tsx:52-71` |
| 렌더러 | `createRenderer`: adapter 확인 → `three/webgpu` 동적 import → `WebGPURenderer` → `init()`. WebGL 폴백은 adapter·import·생성자 실패만, `init` 실패는 throw | `rendering/webgpu.ts:116-158` |
| 건설 batch | 월드 단위 InstancedMesh는 box 타일과 solid 벽뿐. 나머지(절벽 측면, 계단·램프·원형 타일, 물, 잔디, 모래·눈밭, 비-solid 벽)는 그룹마다 React 서브트리. 편집마다 `BuildingBatches` 전체 재계산과 행렬 전체 재기록 | `BuildingSystem/index.tsx:145-264`, `BuildingBatches/index.tsx:50-85` |
| capacity | `useInstanceCapacity`(1.25배 여유, 1.5배 성장, 축소 없음)가 있지만 capacity와 재질이 `args`에 있어 성장·재질 변경 시 InstancedMesh 재생성. 블록과 오브젝트 batch는 정확한 개수를 `args`로 받아 추가·삭제마다 재생성 | `BuildingBatches/capacity.ts:3-17`, `BlockSystem/index.tsx:167-173` |
| 재질 | 그룹마다 `MaterialManager`. `updateMaterial`을 쓰는 곳이 없어 메시 설정 편집 시 재질을 새로 만들고 batch·GPU batch까지 재생성 | `building/core/MaterialManager.ts:33-101` |
| GPU 상주 | three r185/186·네이티브 WebGPU에서 `GpuBatchBridge`가 이름(`building-batch:`)으로 InstancedMesh를 추적해 비동기로 GPU batch(storage buffer, 복제 NodeMaterial, compute reset·cull·compaction, indirect draw)를 만든다. 원본 메시가 그림자·picking을 맡는다. geometry·재질·instanceMatrix·instanceColor 중 하나가 바뀌면 재생성 | `rendering/GpuBatchBridge.tsx:26-215`, `rendering/gpuInstanceBatch.ts:36-253` |
| 가시성 | WebGL 경로만 거리 상주(140m, 이탈 +20m, 0.12초마다). 상주 변경마다 그룹 System mount/unmount와 world batch 재기록. 타일 그룹 경계를 `tile.size*0.5`로 잡아 셀 크기 4를 곱하지 않음(경계가 약 4배 작음) | `BuildingVisibilityDriver/index.tsx:16-52`, `visibility/core.ts:135-136` |
| 편집 오버레이 | 타일·벽·블록마다 mesh 하나(벽은 sphere geometry와 재질을 벽마다 생성) | `TileSystem/index.tsx:737-752`, `WallSystem/index.tsx:226-246`, `BlockSystem/index.tsx:109-127` |
| 컴파일 | `CompileGate`는 오브젝트와 모델만 감싸고, `compileAsync`가 현재 RT·MRT 기준이라 후처리 pass(MRT, samples 0)와 다른 파이프라인을 만든다. 후처리는 로딩 중 fallback `gl.render`로 컴파일한 뒤 pass에서 전부 재컴파일. GPU batch 재질·compute는 첫 draw에 동기 컴파일 | `rendering/CompileGate.tsx:16-60`, `postprocess/WorldPostProcessing.tsx:197,260`, `GpuBatchBridge.tsx:194` |
| NPC·캐릭터 | NPC 파츠마다 `useGLTF` + `SkeletonUtils.clone` + mixer, 스켈레톤 공유 없음, 화면 밖 mixer 갱신, LOD 범위 밖은 언마운트, NPC에 Suspense 경계 없음. 캐릭터는 `ModelRenderer`가 노드마다 스킨 메시를 만들고 파츠는 공유 스켈레톤 바인딩(identical/remappable/incompatible 3분기). 원격 플레이어는 drei `useAnimations` | `npc/components/NPCInstance/index.tsx:91-108,308-370`, `motions/entities/refs/PartsGroupRef.tsx:14-140`, `character/skeleton.ts:206-250` |
| 후처리 | Node 경로: `pass` + MRT(output, velocity, normalView, samples 0) → TRAA → GTAO → bloom → saturation. history 리셋 규칙(revision, 5m 이동, 큰 회전, 투영 변경)과 투영 복원. 사전 컴파일 없음 | `WorldPostProcessing.tsx:93-261` |
| 그림자 | `ShadowDepthMaterials`는 WebGL 전용, 500ms 순회. `DynamicSky`·`CascadedSun`은 공개돼 있지만 예제가 쓰지 않는다. 그림자 박스는 카메라를 따라가며 세 축 모두 텍셀 단위로 스냅한다(`sky/shadowFollow.ts`) | `rendering/shadow/ShadowDepthMaterials.tsx`, `rendering/sky/` |
| 조명 | 램프는 pointLight 4개를 가까운 램프에 0.2초마다 재배정 | `building/components/mesh/model/lampPool.tsx:8-103` |
| 품질 | 품질 프로파일(`perf/quality.tsx`)은 DPR, 후처리, CascadedSun, DynamicSky에만 적용된다. 잔디는 전역 perfStore를 읽고 `outline` 플래그는 미사용 | `perf/quality.tsx`, `Grass.tsx:388` |
| 백엔드 차이 | WebGPU에서 GLSL `ShaderMaterial`은 기본 NodeMaterial로 대체된다. 사쿠라 낙화(`sakura.tsx:500-510,640`)와 기본 three-stdlib `Water`가 WebGPU에서 의도대로 그려지지 않는다. 대체용 `NodeTreeParticles.tsx`는 미사용 | `three/src/nodes/core/NodeBuilder.js:3156-3163` |
| `src/next` | `/engine` 예제만 렌더. `RenderGraph`는 패스 순서만 정하고 렌더하지 않음 | `next/core/RenderGraph.ts` |

## 3. 설계

### 3.1 RenderWorld

```
EntityWorld (meshRenderer, skinnedMesh, instances, buildingChunk, effect 컴포넌트)
   │ world.changed(type, cursor)
RenderExtractSystem (presentation lane, snapshot phase)
   ├─ 정적 batch      key = (geometry, material, shadow 플래그)
   │                   InstancedMesh 1개, 슬롯 할당(swap-remove), capacity 성장은 attribute 교체
   │                   바뀐 슬롯 범위만 updateRange 업로드
   ├─ chunk geometry   지형 측면·모래·눈밭·물 patch를 16×16 chunk 단위 병합 메시로, dirty chunk만 재생성
   ├─ 스킨 인스턴스     엔티티당 skeleton 1, mixer 1, 파츠는 공유 스켈레톤 바인딩
   └─ 효과             잔디 chunk, 파티클, 물
RenderWorld.root (Group) ◄── 호스트가 mount 한 번
WebGPU: 정적 batch를 GPU 상주 batch로 직접 연결(이름 추적 없음), compute 1회 dispatch
```

- **batch identity:** 키가 같은 batch는 월드 수명 동안 같은 mesh와 재질을 쓴다. capacity 성장은 instance attribute(WebGPU는 storage buffer)만 교체한다. 그래서 program이 다시 만들어지지 않는다(S-B05 batchesCreated 0).
- **재질 캐시:** 재질은 전역 `MaterialCache`(키 `createMaterialKey`)와 refcount 텍스처 캐시가 소유한다. 메시 설정 편집은 `updateMaterial`로 제자리 갱신한다.
- **단위 geometry:** round, stair, ramp, 벽 조각은 공유 geometry 레지스트리에서 가져온다.
- **picking:** instance id → entity 역인덱스를 batch가 소유한다.
- **그림자:** batch 키의 shadow 플래그로 처리한다. GPU 상주 경로도 같은 batch로 그림자와 picking을 처리한다. 지금처럼 원본 메시를 따로 두지 않는다.
- **시각 동등성(S-B12) 체크리스트:** 옛 경로와 같은 결과를 내야 하는 규칙이다.
  - **변환:** 타일 plane 크기 4·size, y+0.001. 벽 Box(4,4,0.5)를 z+2만큼 옮겨 y+2. 벽 6면 재질 매핑과 flipSides. 블록 오프셋.
  - **그림자 플래그:** 타일은 y>0.02일 때만 cast, 절벽은 낙차 ≥0.5일 때만 cast. 지면·물·모래는 receive만. 잔디 blade와 캐릭터는 cast.
  - **`MaterialManager` 규칙:** Standard/Toon 선택, GLASS(transmission 0.98, toon이면 불투명도 0.45), 텍스처 RepeatWrapping.
  - **그룹 파생 geometry:** 절벽 측면 vertex color와 해시 바위, 물 patch와 shore, 잔디 chunk·바람·밟힘.
  - **LOD 수치:** 건설 140m+20m, NPC 30/120(+15), 물 25/90, 잔디 24/160.
  - **GPU 경로:** TRAA용 `positionPrevious`, 인스턴스 변경 시 history 무효화.
  - **백엔드별 기준:** GLSL 재질은 WebGPU에서 다르게 그려진다(2절). 그래서 비교는 백엔드별로 한다.

### 3.2 셰이더 컴파일

- **pass 등록:** 렌더러마다 활성 scene pass(RenderTarget, MRT)를 등록한다. `WorldPostProcessing`이 pass를 만들 때 등록하고 해제할 때 지운다.
- **공용 컴파일 함수:** pass가 있으면 RT와 MRT를 걸고 `compileAsync`를 호출한 뒤 동기로 원복한다. `compileAsync`는 첫 await 전에 RT와 MRT를 읽으므로 안전하다.
- **새 variant는 컴파일 뒤 보인다.** RenderWorld는 새 재질 variant(새 batch 키, 새 스킨 재질)를 이 함수로 컴파일한 뒤 보이게 한다. `CompileGate` 컴포넌트는 RenderWorld 밖의 공개 컴포넌트용으로 남긴다.
- **후처리 첫 프레임:** pipeline이 준비될 때까지 fallback `gl.render`로 그리지 않는다(로딩 화면 뒤라 빈 프레임은 문제없다). 준비되면 `scenePass.compileAsync`를 끝낸 뒤 전환한다.
- **워밍업 시점:** 로딩 단계에서 매니페스트의 재질 variant를 한 번에 워밍업한다.

### 3.3 비동기 에셋 표시

- **월드 수준 Suspense 제거:** 모델 로딩은 해당 엔티티만 기다린다. RenderWorld가 에셋 준비와 컴파일이 끝난 엔티티만 batch에 넣는다. 물리 바디는 에셋과 무관하게 먼저 생긴다(COR-07).
- **공개 컴포넌트 경계:** 공개 React 컴포넌트가 남아 있는 동안(이전 기간)은 엔티티 단위 `<Suspense fallback={null}>`로 감싼다. 월드를 바꾸는 갱신은 `startTransition`으로 한다.
- **로드 병렬화:** 매니페스트의 캐릭터·파츠·NPC GLB와 core wasm을 렌더러 초기화와 병렬로 선로드한다. Rapier 초기화도 월드 트리 밖에서 시작한다.

### 3.4 품질 등급

- **등급:** 프로파일 하나(`perf/detect.ts` 등급)가 DPR 상한, 섀도 맵·cascade 수, 후처리 프리셋, 잔디 밀도, 물 반사, glass transmission, outline을 정한다.
- **DPR 적용:** 해석한 DPR은 Canvas `dpr` prop으로 넘긴다. provider는 현재 DPR을 구독해 어긋나면 다시 맞춘다. 이렇게 하면 리사이즈·스크롤 뒤에도 유지된다(S-B10).
- **`auto` 감지:** 첫 렌더 전에 기존 renderer 정보(WebGPU adapter info, WebGL debug renderer info)로 동기 감지한다. 감지용 WebGL 컨텍스트를 새로 만들면 바로 해제한다.
- **기본값:** 1.x에서 `quality` 미지정은 기존 동작(R3F 기본 dpr [1,2], 컴포넌트별 기본값)을 유지한다. 예제와 수용 장면은 `auto`를 쓴다. 2.0 기본값은 `auto`다(결정 N6).

## 4. 작업

### REN-01 RenderWorld와 공용 batch(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-01a | RenderWorld 코어: batch 레지스트리(키, capacity 성장은 attribute 교체, 슬롯 swap-remove, dirty range 업로드, picking 역인덱스), 카운터(batchesCreated·Resized, instanceWrites, bufferBytesUploaded). 전역 `MaterialCache`·텍스처 refcount·`updateMaterial` 제자리 갱신, 단위 geometry 레지스트리 | batch 단위 테스트, 1만 인스턴스 추가·삭제 반복에서 batchesCreated = 키 수 |
| REN-01b | `meshRenderer` 추출: 정적 모델을 URL×mesh 인스턴싱(배치마다 `SkeletonUtils.clone` 제거), 오브젝트 batch(사쿠라, 불, 깃발, 빌보드)를 capacity와 인스턴스 가시성으로 | S-B03 draw ≤ 예산, 오브젝트 추가·삭제 시 batchesCreated 0 |
| REN-01c | building 추출(DOM-01d와 같은 PR): 타일·벽·블록, chunk geometry. 그룹 System 컴포넌트와 `BuildingBatches` 제거 | S-B05, S-B12 |

### REN-02 GPU 상주 경로(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-02a | RenderWorld 정적 batch를 GPU 상주 batch로 직접 연결(이름 추적·childadded 제거), 모든 batch compute 1회 dispatch, 재질 동기화는 `material.version` 변경 시에만, geometry는 원본 attribute 참조(복제 제거), 그림자·picking을 같은 batch로, raw `useFrame` 제거 | 편집 연타 중 long task 0(S-B05 기록), geometries 불변 |

### REN-03 가시성과 상주(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-03a | 상주·컬링은 batch 인스턴스 범위와 가시성 bitset으로(React mount/unmount 0). 상주 기준점을 카메라 target으로 하거나 margin을 궤도 지름 이상으로. 타일 그룹 경계 계산 버그(`visibility/core.ts:135-136`, 셀 크기 누락) 수정 | S-B04, 경계 계산 테스트 |

### REN-04 편집 오버레이와 picking(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-04a | 오버레이를 그룹(또는 월드)당 InstancedMesh 2개(일반, 선택)로, 선택은 `instanceId` → 엔티티. 벽 핸들은 공유 geometry·재질 2개 InstancedMesh | S-B06 |

### REN-05 셰이더 컴파일(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-05a | 렌더러별 활성 pass 등록과 공용 컴파일 함수(3.2), RenderWorld 새 variant 컴파일 후 표시, `CompileGate`도 같은 함수 사용 | S-B08 |
| REN-05b | 후처리: fallback 렌더 제거, `scenePass.compileAsync` 후 전환, 애드온 import 선시작. 로딩 단계 일괄 워밍업. 날씨 kind 전환 재질도 워밍업 | S-B08 첫 pass 프레임 long task 0 |

### REN-06 비동기 에셋 표시와 로드 순서(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-06a | 엔티티 단위 대기(3.3). 이전 기간 공개 컴포넌트는 엔티티 단위 Suspense와 `startTransition`. NPC·PhysicsEntity·파츠·빌보드 이미지 경계 | S-B07 |
| REN-06b | 선로드: 매니페스트 GLB·wasm·Rapier를 렌더러 초기화와 병렬로, 파츠 URL을 본체와 함께 요청, 잔디 JS→wasm 이중 빌드 제거(`peekCoreWasm`, AST-08a). `createRenderer`의 adapter 재요청·직렬 초기화 정리 | S-B01 첫 표시 ms 기록 감소, 잔디 attribute 생성 chunk당 1회 |

### REN-07 품질 등급(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-07b | 프로파일 소비 확대: 잔디 밀도는 context, 후처리 시 `antialias: false`, `cascadeCount`·물 반사·glass transmission·outline 필드, `project-settings` `rendering.pixelRatio` 소비, 감지용 WebGL 컨텍스트 해제 | 등급별 GPU ms 비교 기록 |

### REN-08 그림자(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-08b | 잔디 `castShadow` 옵션(라이브러리, 기본 true), 정적 장면 그림자 갱신 임계(caster 변화 시에만), 그림자 pass draw 계측, `CascadedSun`의 `castShadow` 전환·key 재마운트로 lit 파이프라인이 두 번 다시 만들어지는 문제, WebGL `ShadowDepthMaterials`는 객체 add/remove·revision 기반 갱신과 `(material.version, geometry.id)` 캐시 | 정지 장면 그림자 재렌더 0, WebGL 정지 장면 순회 0 |

### REN-09 스키닝과 애니메이션 비용(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-09a | NPC를 캐릭터 wearable 경로로: body 하나만 clone·mixer, 나머지 스킨 파츠는 `resolveSharedSkeletonBinding`, rigid 파츠는 본 부착. 화면 밖·원거리 mixer는 delta 누적 후 2~4프레임마다 갱신. 원격 플레이어 mixer도 공유 채널 | S-B09 |
| REN-09b | 스킨 메시 bounds 기반 컬링(`frustumCulled=false` 제거), toon 재질 원본 키 refcount 공유(NPC N개에서 `MeshToonMaterial` 수가 N과 무관) | 화면 밖 스킨 메시 draw 0, toon 재질 수 테스트 |

### REN-10 절차 지형(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-10a | 잔디: chunk 재사용(셀 내용이 같으면 이전 배열 identity), blade 방향·높이를 셀 좌표 해시로 결정적으로, cells 경로의 불필요 offset·noise 계산 제거, chunk별 텍스처·재질 공유, 공통 uniform 공유(chunk마다 역행렬 제거) | 잔디 타일 1개 편집 시 해당 chunk만 재생성, 편집 전후 다른 chunk blade 동일 |
| REN-10b | 지형 측면·계단 지지 높이를 셀 키 맵 O(1) 조회로, 모래·눈밭 skirt 판정을 셀 키 Set으로, segs를 `max(6, size×2)` 수준으로(삼각형 약 9배 감소, 시각 비교), 표면 raycast 끄기, 물 patch 정수 키 1회 정렬. terrain 색 memo를 색 값 기준으로. 모두 chunk 단위 재생성 | 3천 타일 그룹 편집 1회 ms 기록 감소, S-B12 |

### REN-11 후처리와 demand 렌더(M2)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-11a | `frameloop="demand"` 옵션: 카메라·시뮬레이션·애니메이션·편집이 없으면 렌더하지 않음(invalidate 기반). TRAA history 리셋에서 RT 재할당(`setSize(1,1)`) 제거, 매 프레임 `{...camera.view}` 복사 제거 | S-B02 대기 렌더 0 |

### REN-12 기타 렌더 비용(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-12a | 물 반사 옵션과 같은 높이 patch의 reflector 공유, glass transmission 품질 옵션(기본값 유지). `GroundClicker` 1000×1000 투명 plane 렌더 제외(raycast 전용). 램프 풀이 멀리 있어도 모든 픽셀에서 point light 4개를 계산하는 문제는 REN-14b 전까지 거리로 끄기 | glass 벽 1개 추가 전후 render 호출 2배 증가 없음 |
| REN-12b | 작은 항목: 날씨·눈 매 프레임 position 버퍼 전체 업로드, `Footprints` 불변 시 업로드와 늦은 `instanceColor` 생성, `TeleportDropEffect` 파티클별 geometry·재질, 빌보드 그룹별 512px canvas 텍스처, BuildingSystem 날씨 파티클이 카메라를 따라가지 않음, `BuildingBatches` `MaterialManager` 누수 | 항목별 카운터 테스트 |

### REN-13 TSL 수렴(M6)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-13a | GLSL 구현(불, 잔디, 깃발, 눈, 날씨, 물, 사쿠라)을 TSL canonical로, GLSL은 `compat/webgl/` 경계로. 도메인 하나당 slice 하나(불 → 잔디 → 물 → 날씨 → 사쿠라). 사쿠라 낙화와 기본 물은 WebGPU에서 제대로 그려지게 된다. 남은 TSL time uniform·프레임 콜백 제거. `gpuCulledInstances` `@deprecated` | GLSL 경로가 `compat/webgl/`에만, WebGPU 스크린샷에서 낙화·물 표시 |

### REN-14 화질 로드맵(M6)

목표는 고품질 스타일라이즈드다. 비용 대비 화면 변화가 큰 것부터 한다. 각 기능은 품질 등급으로 켜고 끄며, 등급별 GPU ms를 기록한다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| REN-14a | 라이트 프로브와 라이트맵 베이크: 에디터에서 굽고(EDT-07), 결과는 AssetDB 에셋. 런타임 비용은 텍스처·SH 조회뿐. 에셋 파이프라인에 라이트맵 UV 생성 | 베이크 전후 스크린샷, 런타임 GPU ms 증가 ≤ 예산 |
| REN-14b | compute 기반 클러스터(타일드) 포워드 조명: 램프 풀(pointLight 4개 재배정) 대체, 조명 수 제한 제거 | 조명 64개 장면 GPU ms 기록, 램프 수와 무관한 셰이더 |
| REN-14c | 룩 스택: 컬러 그레이딩 LUT, 높이 안개, 접촉 그림자, 림라이트 | 등급별 on/off 스크린샷 |
| REN-14d | 고사양 등급: SSR, 프로브 기반 동적 GI, 볼류메트릭 안개 | high 등급에서만 켜짐, GPU ms 기록 |

## 5. 공개 API 영향

- **추가만:** `RenderWorld` 옵션, `frameloop` prop, water `reflection`, glass `transmission`, 잔디 `castShadow`, 품질 프로파일 필드.
- **내부만 교체하고 props는 유지:** `TreeObject`, `BuildingSystem`, 공개 mesh 컴포넌트(`Grass`, `Water` 등).
- **2.0에서 제거:** `CompileGate`, readback 드라이버 export, `gpuCulledInstances`. 2.0에서 `quality` 기본값을 `auto`로 바꾼다.

## 6. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| batch 통합이 편집 picking을 깨뜨림 | instance id → 엔티티 역인덱스를 batch가 소유, picking 테스트 |
| 추출 경로의 화면 차이 | S-B12 A/B 비교를 이전 PR의 게이트로. 백엔드별 기준 |
| capacity attribute 교체 시 WebGPU 버퍼 재할당 스파이크 | 1.5배 성장·축소 없음 유지, 교체 횟수 카운터 기록 |
| TSL 수렴 중 WebGL 품질 저하 | 도메인별 slice, WebGL2 backend 스크린샷 비교 |
| 라이트맵 베이크 품질·시간 | 오프라인(에디터) 전용, 런타임은 결과만 사용. 먼저 라이트 프로브만으로 시작 |
