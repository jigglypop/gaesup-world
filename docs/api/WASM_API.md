# WASM API

이 문서는 현재 코드 기준의 WASM 로더 상태를 정리합니다.

## 공개 API 상태

현재 배포 패키지의 루트 엔트리와 `package.json` exports 기준으로 WASM 로더는 외부 공개 API로 보장되지 않습니다.

```ts
// 현재 공개 API로 보장하지 않음
import { loadCoreWasm, type GaesupCoreWasmExports } from 'gaesup-world';
```

구현은 `src/core/wasm/loader.ts`와 `src/core/index.ts`에 있지만, 루트 `src/index.ts`와 package subpath exports에는 노출되어 있지 않습니다.

## loadCoreWasm

`loadCoreWasm()`는 내부 로더입니다. `/wasm/gaesup_core.wasm`을 한 번만 로드하고 결과를 캐시합니다.

```ts
import { loadCoreWasm } from './core/wasm/loader';

const wasm = await loadCoreWasm();

if (!wasm) {
  // WebAssembly 미지원, fetch 실패, 모듈 shape 불일치 시 null
}
```

반환값은 `GaesupCoreWasmExports | null`입니다.

## GaesupCoreWasmExports

현재 타입에 포함된 주요 함수군입니다.

- memory/alloc: `memory`, `alloc_f32`, `dealloc_f32`, `alloc_u8`, `dealloc_u8`, `alloc_u32`, `dealloc_u32`
- noise: `fill_grass_data`, `fill_terrain_y`
- matrix: `fill_instance_matrices`, `fill_wall_matrices`
- vector: `batch_smooth_damp`, `batch_quat_slerp`, `batch_sfe_weights`
- spatial: `spatial_query_nearby`, `spatial_grid_query`
- particle: `update_snow_particles`, `update_fire_particles`
- pathfinding: `astar_find_path`, `astar_find_path_weighted`

## 메모리 사용

WASM 함수는 선형 메모리 pointer를 사용합니다. alloc 후에는 반드시 대응하는 dealloc을 호출합니다.

```ts
const ptr = wasm.alloc_f32(values.length);

try {
  new Float32Array(wasm.memory.buffer, ptr, values.length).set(values);
  // wasm function call
} finally {
  wasm.dealloc_f32(ptr, values.length);
}
```

`writeF32`, `readF32`, `readU32` 같은 helper는 `src/core/wasm/loader.ts`에 있지만 현재 package subpath로 공개하지 않습니다. 외부 문서에서는 아래 import를 사용하지 않습니다.

```ts
// 공개 export가 아님
import { writeF32, readF32 } from 'gaesup-world/core/wasm/loader';
```

## Fallback 원칙

WASM은 선택 최적화입니다. 로드 실패 시 JS fallback이 있어야 합니다.

```ts
const wasm = await loadCoreWasm();

if (wasm) {
  // WASM path
} else {
  // JS fallback
}
```

현재 grass manager와 일부 배치 계산 경로가 이 원칙을 사용합니다.

## 배포 경로

기본 로더는 `import.meta.env.BASE_URL`와 `document.baseURI`를 고려해 `wasm/gaesup_core.wasm` URL을 계산합니다.

WASM 파일이 배포 산출물 또는 public asset 경로에 없으면 `loadCoreWasm()`는 `null`을 반환합니다.

## 공개 범위 주의

현재 `package.json` exports에는 `./core/wasm/loader` 같은 deep subpath가 없고 루트 엔트리도 WASM 로더를 재수출하지 않습니다. 외부 사용자용 API로 확장하려면 다음을 함께 수정해야 합니다.

- `src/index.ts` 루트 export 또는 별도 subpath export
- `package.json` exports
- `vite.config.ts` library entry
- 타입 선언 출력 경로
- README/API 문서
