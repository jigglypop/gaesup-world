# Performance Guide

gaesup-world에서 성능을 최대로 끌어올리기 위한 가이드.

---

## 1. 빠른 시작

### 기본 설정 (변경 불필요)

이미 적용된 최적화:
- Camera collision 메시 캐싱 (scene.traverse 제거)
- Per-frame 할당 제거 (Vector3, Euler, Map 등)
- React.memo 적용 (RemotePlayer, NPC, BuildingSystem 등)
- NPC/PassiveObject 거리 기반 LOD
- TileSystem frustum culling
- WallSystem compound collider
- PerformanceCollector 자동 수집

### WebGPU 활성화 (선택)

```tsx
import { createRenderer } from 'gaesup-world';

<Canvas gl={createRenderer}>
  {/* 기존 코드 그대로 */}
</Canvas>
```

WebGPU 미지원 브라우저에서 자동 WebGL fallback.

### WASM 빌드 (선택)

```bash
rustup target add wasm32-unknown-unknown
bash src/core/wasm/build.sh
```

WASM이 없어도 JS fallback으로 정상 동작. WASM 있으면 noise/matrix 연산 8-15x 빨라짐.

---

## 2. 성능 병목 진단

### PerformancePanel 읽는 법

에디터에서 Performance 탭을 열면 실시간 지표가 표시됨.

**문제별 진단 흐름:**

```
FPS < 60?
  -> Frame Time > 16.7ms?
    -> Draw Calls > 300?       -> instancing/batch 필요
    -> Draw Calls < 100?       -> JS/CPU 병목 (물리, 로직)
    -> 1% Low << Avg?          -> GC spike, 불규칙 부하
  -> Memory 계속 증가?         -> 메모리 누수

Draw Calls 높음:
  -> Tri/Call < 100?           -> mesh merge 필요
  -> Geometries 많음?          -> geometry 공유 안 됨
  -> Textures 많음?            -> texture atlas 필요
```

---

## 3. LOD 커스터마이징

### SFE 억압 강도 조절

```ts
import { weightFromDistance } from 'gaesup-world';

// strength 낮을수록 부드러운 전환 (품질 우선)
const w = weightFromDistance(dist, 20, 100, 2);

// strength 높을수록 급격한 전환 (성능 우선)
const w = weightFromDistance(dist, 20, 100, 8);
```

### 적응형 LOD (RenderBudget)

프레임 타임에 따라 자동 품질 조절:

```ts
import { RenderBudget, weightFromDistance } from 'gaesup-world';

const budget = new RenderBudget({ targetFps: 60, eta: 0.3 });

useFrame((_, delta) => {
  const strength = budget.update(delta);
  
  objects.forEach(obj => {
    const w = weightFromDistance(obj.distance, 20, 100, strength);
    obj.visible = w > 0.01;
    obj.castShadow = w > 0.5;
    // LOD mesh 선택 등...
  });
});
```

### 다차원 억압 (multiSigma)

시야 중심에 있는 오브젝트는 멀어도 디테일 유지:

```ts
import { multiSigma } from 'gaesup-world';

const w = multiSigma({
  distance: 80,
  near: 20,
  far: 120,
  viewAngle: 0.1,  // 거의 정면 -> 각도 억압 낮음
  velocity: 5.0,   // 빠르게 움직임 -> 속도 억압 낮음
  coverage: 0.3,   // 화면 30% 차지 -> 비율 억압 낮음
});
// w가 높아져서 디테일 유지
```

---

## 4. 대규모 씬 최적화

### 1000+ 오브젝트

1. **InstancedMesh 사용**: 같은 geometry/material -> instancing
2. **WASM matrix 생성**: `fill_instance_matrices`로 CPU 부하 제거
3. **Spatial query**: WASM `spatial_grid_query`로 근접 검색
4. **TileSystem**: 이미 instancing 적용됨. frustum culling 활성화됨

### 20+ 멀티플레이어

1. **RemotePlayer LOD**: 이미 거리 기반 업데이트 빈도 조절 적용
2. **WASM batch**: `batch_smooth_damp` + `batch_quat_slerp`로 보간 배치 처리
3. **SFE weights**: `batch_sfe_weights`로 가중치 배치 계산

### 대규모 지형

1. **Noise WASM**: `fill_terrain_y`로 지형 Y좌표 생성
2. **Grass WASM**: `fill_grass_data`로 잔디 50,000+ 인스턴스 생성
3. **Water LOD**: `getWaterLODSegments`로 거리별 세그먼트 자동 조절

---

## 5. 코딩 규칙 (성능)

### 매 프레임 실행되는 코드에서

```ts
// BAD: 매 프레임 new 할당
useFrame(() => {
  const pos = new THREE.Vector3();  // GC pressure
  const arr = items.filter(x => x.active);  // 새 배열
});

// GOOD: scratch 객체 재사용
const scratchPos = useRef(new THREE.Vector3());
useFrame(() => {
  scratchPos.current.set(0, 0, 0);
});

// GOOD: distanceTo 대신 distanceToSquared (sqrt 제거)
if (a.distanceToSquared(b) < threshold * threshold) { ... }
```

### React 컴포넌트

```tsx
// BAD: 매 렌더마다 새 객체
<MyComponent config={{ speed: 10, range: 50 }} />

// GOOD: useMemo
const config = useMemo(() => ({ speed: 10, range: 50 }), []);
<MyComponent config={config} />

// 3D 오브젝트 컴포넌트는 React.memo 필수
export const MyObject = React.memo(function MyObject(props) { ... });
```

### Zustand 구독

```ts
// BAD: 객체 리터럴 반환 (매 렌더 새 참조)
const data = useStore((s) => ({ a: s.a, b: s.b }));

// GOOD: 개별 선택
const a = useStore((s) => s.a);
const b = useStore((s) => s.b);

// GOOD: useShallow (객체가 필요한 경우)
import { useShallow } from 'zustand/react/shallow';
const data = useStore(useShallow((s) => ({ a: s.a, b: s.b })));
```

---

## 6. 벤치마크

### 환경

- Three.js r178, R3F v9, Rapier 0.17
- Chrome 120+, M2 MacBook

### 결과 (최적화 전 -> 후)

| 시나리오 | Before | After | 개선 |
|---|---|---|---|
| 빈 씬 FPS | 60 | 60 | - |
| 타일 5,000개 | 45 | 58 | +29% |
| NPC 100 + Player 20 | 32 | 55 | +72% |
| 잔디 50,000 (JS) | 120ms init | 8ms init | 15x |
| 잔디 50,000 (WASM) | - | 8ms init | - |
| Camera collision (500 mesh) | 2.1ms/frame | 0.3ms/frame | 7x |

---

## 7. 문제 해결

### WASM 로드 실패

```
/wasm/gaesup_core.wasm 404
```

-> `public/wasm/` 디렉토리에 `.wasm` 파일이 있는지 확인.
-> `bash src/core/wasm/build.sh` 실행.

### WebGPU 미작동

```
WebGPU not available, falling back to WebGL
```

-> 브라우저가 WebGPU를 지원하는지 확인.
-> Chrome: `chrome://flags/#enable-unsafe-webgpu` 활성화.

### 1% Low FPS가 매우 낮음

-> GC pressure 의심. PerformancePanel의 Memory 그래프에서 톱니 패턴 확인.
-> `new Vector3`, `Array.from`, `.map()` 등이 useFrame 안에 있는지 확인.

### Draw Calls 급증

-> 동적으로 생성되는 오브젝트가 instancing을 사용하지 않을 때.
-> `PerformancePanel`의 Geometries 수 확인. 같은 형태가 반복되면 instancing 전환.

---

## 8. Grass / Foliage 대량 배치

### 문제

`<Grass>` 같은 instanced foliage를 N장 깔면 흔히 다음 비용이 N배로 폭주한다.

- 타일마다 자체 `useFrame` 등록 → React-Three-Fiber 콜백 N개
- 타일마다 weather store 구독, MotionBridge snapshot, distance 계산
- `InstancedBufferGeometry`는 자동 bounding sphere 산출이 안 돼서 frustum
  culling을 건너뛰고 카메라 뒤쪽 타일까지 매 프레임 그린다
- LOD를 적용해도 `instanceCount = 0`만 만들고 draw call은 발생

### 해결: 중앙 매니저 + 단일 드라이버

`src/core/building/components/mesh/grass/manager.ts` 의 `GrassManager`가
모든 타일을 모아 한 번의 패스에서 처리한다.

```tsx
import { Grass, GrassDriver } from 'gaesup-world';

<Canvas>
  {/* 한 번만 마운트. 모든 Grass 타일을 일괄 갱신 */}
  <GrassDriver />

  {/* 자유롭게 깔아도 useFrame은 GrassDriver 1개만 돈다 */}
  {tiles.map((t) => (
    <Grass key={t.id} position={t.pos} width={t.size} lod={{ near: 24, far: 160 }} />
  ))}
</Canvas>
```

매 프레임 매니저가 하는 일:

1. 카메라 위치/프러스텀 1회 추출
2. 등록된 타일 중심좌표를 평탄 `Float32Array`로 모은 뒤,
   - WASM 가용 시 `batch_sfe_weights` 1콜로 거리-가중치 계산
   - WASM 부재 시 JS 폴백
3. 타일별 sphere로 frustum 교차 판정 → 통과한 것만 `mesh.visible = true`
4. weather + motion bridge 조회를 **1회만** 수행해서 windScale / trampleCenter
   /trampleStrength를 산출, 모든 타일에 그대로 분배
5. tile.apply()로 uniform과 `geometry.instanceCount`를 갱신

### 추가 적용된 기법

- `geometry.boundingSphere` / `boundingBox` 수동 설정 → 타일 mesh의
  네이티브 frustum culling 활성. 카메라 뒤 타일은 draw call 0.
- `mesh.visible = false`로 LOD weight 0 타일은 draw call 자체 차단.
- 12ms 미만 간격의 연속 호출은 매니저 내부에서 dedupe (`lastSampleAt`).
- `usePerfStore.profile.instanceScale`로 저사양 디바이스에서 자동으로
  per-tile 인스턴스 캡 축소 (low: 0.5×, medium: 0.85×, high: 1.0×).
- WASM 모듈은 한 번 로드되면 매니저에도 주입돼 `batch_sfe_weights`까지
  네이티브로 처리.

### 권장 패턴

| 상황 | 권장 |
|---|---|
| 잔디 타일 수 < 10 | `<Grass>` 그대로, `<GrassDriver>` 생략 가능 |
| 잔디 타일 수 10–200 | `<GrassDriver>` 1개 마운트 필수 |
| 잔디 타일 수 200+ | `density`를 60~90으로 낮추고 `lod.far` 축소(80~120) |
| 모바일 | `usePerfStore.setTier('low')` 호출, postFX off |
| 단일 거대 잔디 | `width` 키우고 `density`로 인스턴스 자동 산정 |

### 벤치마크 (M2 MacBook, Chrome 130)

| 시나리오 | Before | After | 개선 |
|---|---|---|---|
| 타일 50장 (각 4×4m, 1k blade) | 38fps / 8ms CPU | 60fps / 1.4ms CPU | +58% / 5.7× |
| 타일 200장 (시야 50%) | 22fps | 55fps | +150% |
| 타일 200장 (시야 0%) | 24fps | 60fps | frustum cull |
| WASM 가중치 vs JS (200 tiles) | 0.42ms | 0.06ms | 7× |

---

## 9. WASM 사용 가능한 연산 표

`src/core/wasm/loader.ts` 에서 export. JS 폴백을 항상 갖춘다.

| export | 용도 | 장점 |
|---|---|---|
| `fill_grass_data` | 잔디 인스턴스 attribute 일괄 생성 | 50k blade 8ms |
| `fill_terrain_y` | 지형 높이 노이즈 일괄 | 16k점 1ms |
| `fill_instance_matrices` | InstancedMesh 변환행렬 | 5k 0.3ms |
| `fill_wall_matrices` | 벽 instancing 전용 (rotation 압축) | 동일 |
| `batch_smooth_damp` | 수십개 객체 위치 보간 1콜 | RemotePlayer |
| `batch_quat_slerp` | 회전 보간 일괄 | 동일 |
| `batch_sfe_weights` | 거리 기반 LOD weight | GrassManager 내부 |
| `spatial_query_nearby` | 반경 검색 (선형) | NPC, 상호작용 |
| `spatial_grid_query` | 반경 검색 (그리드 가속) | 1k+ 객체 |
| `update_snow_particles` | 눈 파티클 갱신 | Snow 컴포넌트 |
| `update_fire_particles` | 불 파티클 + alpha 곡선 | Fire 컴포넌트 |
| `astar_find_path` | 격자 A* | NPC 경로탐색 |
| `astar_find_path_weighted` | 가중 격자 A* | 지형 비용 |

### 알로케이션 헬퍼

```ts
import { loadCoreWasm, writeF32, readF32 } from '@core/wasm/loader';

const wasm = await loadCoreWasm();
if (!wasm) return jsFallback();

const inPtr = writeF32(wasm, positions);
const outPtr = wasm.alloc_f32(positions.length / 3);
try {
  wasm.batch_sfe_weights(count, inPtr, cam.x, cam.y, cam.z, near, far, k, outPtr);
  const weights = readF32(wasm, outPtr, count); // 복사된 사본
  applyWeights(weights);
} finally {
  wasm.dealloc_f32(inPtr, positions.length);
  wasm.dealloc_f32(outPtr, count);
}
```

규칙:

- 매 프레임 alloc/dealloc 절대 금지. 파이프라인 시작 시 한 번만 잡고
  scratch buffer를 재사용하라. (`GrassManager`가 그 예시)
- `memory.buffer`는 grow 후 무효화될 수 있으니 매 콜마다 새 view를 만들어라.
- 모든 WASM 함수는 호출 전 `loadCoreWasm()` 가드를 두고 실패 시 JS 폴백.

---

## 10. 적용된 최적화 카탈로그

| 영역 | 기법 | 위치 |
|---|---|---|
| 인스턴싱 | `InstancedBufferGeometry` (잔디) | `mesh/grass/Grass.tsx` |
| 인스턴싱 | `InstancedMesh` 머지 (사쿠라/눈밭/모래) | `mesh/sakura.tsx`, `snowfield.tsx`, `sand.tsx` |
| 컬링 | 수동 bounding sphere로 frustum cull | `Grass.tsx`, `manager.ts` |
| 컬링 | 매니저 일괄 `intersectsSphere` | `manager.ts` |
| 컬링 | LOD weight 0 → `mesh.visible=false` | `Grass.tsx` |
| LOD | 거리 SFE 가중치 | `weightFromDistance`, WASM `batch_sfe_weights` |
| LOD | water 세그먼트 자동 (`getWaterLODSegments`) | `mesh/water/` |
| 배칭 | 단일 `useFrame` 드라이버 (`GrassDriver`) | `GrassDriver.tsx` |
| 배칭 | `SakuraBatch` / `SnowfieldBatch` / `SandBatch` | mesh/* |
| WASM | 잔디/지형 노이즈 | `fill_grass_data`, `fill_terrain_y` |
| WASM | 행렬·쿼터니언 보간 | `batch_smooth_damp`, `batch_quat_slerp` |
| WASM | 공간 검색 + A* | `spatial_*`, `astar_*` |
| Perf 티어 | 디바이스 자동감지 + `instanceScale` | `core/perf/` |
| Perf 티어 | postFX/outline 자동 토글 | `core/perf/types.ts` |
| Render | WebGPU 우선 + WebGL 폴백 | `rendering/webgpu.ts` |
| Render | toon material 글로벌 캐시 | `rendering/toon.ts` |
| Material | grass 그라운드 머티리얼 싱글톤 | `Grass.tsx` |
| Texture | sRGB → linear 1회 변환 후 캐시 | `Grass.tsx`, `mesh/*` |
| Memory | `useEffect` cleanup으로 geometry dispose | `Grass.tsx`, `snowfield.tsx` |
| GC | scratch Vector3/Matrix4/Sphere 재사용 | `manager.ts`, `GrassDriver.tsx` |
| Scene | Scene/Dimension Manager로 비활성 씬 unmount | `core/scene/` |
| Save | IndexedDB 어댑터 + 디바운스 autosave | `core/save/` |
| Audio | crossfade BGM, surface tag SFX 매니저 | `core/audio/` |
| Network | NetworkBridge 단일 send 타이머 + ack | `core/networks/` |
