# WASM API

gaesup-world의 Rust WebAssembly 모듈 API.
CPU-bound 연산을 WASM으로 오프로딩하여 8-15x 성능 향상.

---

## 개요

두 개의 WASM 모듈 존재:

| 모듈 | 파일 | 용도 |
|---|---|---|
| gaesup_grass_attr | `/wasm/gaesup_grass_attr.wasm` | 잔디 orientation 데이터 생성 (레거시) |
| gaesup_core_wasm | `/wasm/gaesup_core.wasm` | 통합 연산 (noise, matrix, vector, spatial) |

---

## 로딩

```ts
import { loadCoreWasm, type GaesupCoreWasmExports } from 'gaesup-world';

// 비동기 로드 (싱글턴, 한 번만 fetch)
const wasm = await loadCoreWasm();
if (!wasm) {
  console.warn('WASM unavailable, JS fallback active');
}
```

- WebAssembly 미지원 환경에서 `null` 반환
- fetch 실패 시 `null` 반환
- 한 번 로드되면 캐싱됨

---

## 메모리 관리

WASM 모듈은 자체 선형 메모리를 사용. JS <-> WASM 간 데이터 전송에 alloc/dealloc 사용.

```ts
import { writeF32, readF32 } from 'gaesup-world/core/wasm/loader';

// JS -> WASM: Float32Array를 WASM 메모리에 복사
const ptr = writeF32(wasm, myFloat32Array);

// WASM -> JS: WASM 메모리에서 Float32Array 복사
const result = readF32(wasm, ptr, length);

// 사용 후 반드시 해제
wasm.dealloc_f32(ptr, length);
```

### 주의사항

- `alloc_f32` 후 반드시 `dealloc_f32` 호출 (메모리 누수 방지)
- WASM 함수 호출 후 `memory.buffer`가 변할 수 있음 (grow 발생 시)
- `readF32`는 복사본 반환이므로 안전하게 사용 가능

---

## Noise 모듈

### fill_grass_data

잔디 인스턴스의 offset + orientation + stretch 데이터를 한 번에 생성.
기존 JS `buildAttributeData` + simplex noise를 Rust로 통합.

```ts
wasm.fill_grass_data(
  instances,       // 잔디 인스턴스 수
  width,           // 분포 영역 너비
  seed,            // 난수 시드 (u32)
  offsets_ptr,     // out: instances * 3 floats (x, y, z)
  orientations_ptr,// out: instances * 4 floats (quaternion)
  stretches_ptr,   // out: instances floats
  half_sin_ptr,    // out: instances floats
  half_cos_ptr,    // out: instances floats
);
```

**통합 사용 예시 (Grass.tsx에 이미 적용됨):**

```ts
const wasm = await loadCoreWasm();

const offsetsLen = instances * 3;
const orientationsLen = instances * 4;

const offsetsPtr = wasm.alloc_f32(offsetsLen);
const orientationsPtr = wasm.alloc_f32(orientationsLen);
const stretchesPtr = wasm.alloc_f32(instances);
const halfSinPtr = wasm.alloc_f32(instances);
const halfCosPtr = wasm.alloc_f32(instances);

try {
  wasm.fill_grass_data(
    instances, width, seed,
    offsetsPtr, orientationsPtr, stretchesPtr, halfSinPtr, halfCosPtr
  );

  const buf = wasm.memory.buffer;
  const offsets = new Float32Array(new Float32Array(buf, offsetsPtr, offsetsLen));
  const orientations = new Float32Array(new Float32Array(buf, orientationsPtr, orientationsLen));
  // ... 사용
} finally {
  wasm.dealloc_f32(offsetsPtr, offsetsLen);
  wasm.dealloc_f32(orientationsPtr, orientationsLen);
  wasm.dealloc_f32(stretchesPtr, instances);
  wasm.dealloc_f32(halfSinPtr, instances);
  wasm.dealloc_f32(halfCosPtr, instances);
}
```

### fill_terrain_y

지형 메시의 Y 좌표를 noise 기반으로 생성.

```ts
wasm.fill_terrain_y(
  count,     // 정점 수
  xs_ptr,    // in: count floats (X 좌표)
  zs_ptr,    // in: count floats (Z 좌표)
  seed,      // 난수 시드
  out_ptr,   // out: count floats (Y 좌표)
);
```

---

## Matrix 모듈

### fill_instance_matrices

TileSystem/WallSystem용 인스턴스 매트릭스 배치 생성.
Three.js의 `Object3D.updateMatrix()` 오버헤드를 완전 제거.

```ts
wasm.fill_instance_matrices(
  count,           // 인스턴스 수
  positions_ptr,   // in: count * 3 floats (x, y, z)
  rotations_ptr,   // in: count floats (Y축 회전)
  scales_ptr,      // in: count * 3 floats (sx, sy, sz)
  out_ptr,         // out: count * 16 floats (4x4 column-major)
);
```

**결과를 InstancedMesh에 직접 적용:**

```ts
const matrices = readF32(wasm, outPtr, count * 16);
instancedMesh.instanceMatrix.array.set(matrices);
instancedMesh.instanceMatrix.needsUpdate = true;
```

### fill_wall_matrices

벽 전용 (uniform scale=1). position + Y rotation만.

```ts
wasm.fill_wall_matrices(
  count,
  positions_ptr,   // in: count * 3 floats
  rotations_ptr,   // in: count floats (Y축 회전)
  out_ptr,         // out: count * 16 floats
);
```

---

## Vector 모듈

### batch_smooth_damp

Unity-style SmoothDamp를 N개 Vector3에 대해 배치 실행.
20+ remote player 환경에서 유의미한 성능 이득.

```ts
wasm.batch_smooth_damp(
  count,           // Vector3 쌍 수
  current_ptr,     // in/out: count * 3 floats (현재 위치)
  target_ptr,      // in: count * 3 floats (목표 위치)
  velocity_ptr,    // in/out: count * 3 floats (속도 상태)
  smooth_time,     // smoothing 시간 상수
  max_speed,       // 최대 속도
  dt,              // delta time (초)
);
```

### batch_quat_slerp

N개 quaternion의 구면 보간을 배치 실행.

```ts
wasm.batch_quat_slerp(
  count,           // quaternion 수
  current_ptr,     // in/out: count * 4 floats (x, y, z, w)
  target_ptr,      // in: count * 4 floats
  alpha,           // 보간 계수 [0, 1]
);
```

### batch_sfe_weights

SFE 억압 가중치를 N개 오브젝트에 대해 배치 계산.

```ts
wasm.batch_sfe_weights(
  count,           // 오브젝트 수
  positions_ptr,   // in: count * 3 floats (오브젝트 위치)
  camera_x, camera_y, camera_z,  // 카메라 위치
  near, far, strength,           // SFE 파라미터
  out_ptr,         // out: count floats (가중치 [0,1])
);
```

---

## Spatial 모듈

### spatial_query_nearby

브루트포스 거리 기반 근접 검색.

```ts
const found = wasm.spatial_query_nearby(
  count,              // 전체 오브젝트 수
  positions_ptr,      // in: count * 3 floats
  query_x, query_y, query_z,  // 쿼리 중심
  radius,             // 검색 반경
  out_indices_ptr,    // out: u32 배열
  out_capacity,       // 결과 버퍼 크기
);
// found: 실제 매칭 수
```

### spatial_grid_query

셀 기반 공간 검색. 대규모(1000+) 오브젝트에서 효율적.

```ts
const found = wasm.spatial_grid_query(
  count,
  positions_ptr,
  cell_size,          // 그리드 셀 크기
  query_x, query_y, query_z,
  radius,
  out_indices_ptr,
  out_capacity,
);
```

---

## 빌드

### 사전 요구사항

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# WASM target
rustup target add wasm32-unknown-unknown

# (선택) wasm-opt for 추가 최적화
npm install -g binaryen
```

### 빌드 명령

```bash
# core wasm 빌드 (SIMD 활성화)
bash src/core/wasm/build.sh
# 결과: public/wasm/gaesup_core.wasm

# grass wasm 빌드 (레거시)
cd src/core/building/components/mesh/grass/wasm
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/gaesup_grass_attr.wasm ../../../../../../public/wasm/
```

### SIMD 지원

빌드 시 `RUSTFLAGS="-C target-feature=+simd128"` 플래그로 WASM SIMD 활성화.
지원 브라우저: Chrome 91+, Firefox 89+, Safari 16.4+.

### Cargo.toml 설정

```toml
[profile.release]
opt-level = 3      # 속도 최적화 (크기 아님)
lto = true          # 링크 타임 최적화
codegen-units = 1   # 단일 코드 생성 (최적화 극대화)
panic = "abort"     # panic 시 즉시 종료 (바이너리 크기 절감)
```

---

## JS Fallback

WASM이 로드되지 않는 환경에서는 자동으로 JS fallback이 동작.
예: `Grass.tsx`는 WASM 로드 실패 시 `buildAttributeDataJS`를 사용.

```ts
const wasm = await loadCoreWasm();
const data = wasm
  ? buildAttributeDataWasm(wasm, instances, width)
  : buildAttributeDataJS(instances, width);
```

성능 비교 (instances=50,000):

| 경로 | 시간 |
|---|---|
| JS (simplex-noise) | ~120ms |
| WASM (no SIMD) | ~15ms |
| WASM (SIMD) | ~8ms |
