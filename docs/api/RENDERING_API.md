# Rendering API

gaesup-world의 WebGPU 렌더러, TSL compute shader, LOD 시스템 API.

---

## WebGPU Renderer

### createRenderer

WebGPU 가용 시 자동 전환, 불가 시 WebGL fallback.
R3F v9의 async `gl` prop에 직접 사용.

```tsx
import { createRenderer, isWebGPUAvailable } from 'gaesup-world';

// 방법 1: Canvas gl prop에 직접 사용
<Canvas gl={createRenderer}>
  {/* ... */}
</Canvas>

// 방법 2: 수동 체크 후 분기
const available = await isWebGPUAvailable();
console.log('WebGPU:', available ? 'active' : 'fallback to WebGL');
```

### isWebGPUAvailable

WebGPU 지원 여부를 확인. 결과 캐싱됨 (한 번만 체크).

```ts
import { isWebGPUAvailable } from 'gaesup-world';

const available = await isWebGPUAvailable();
```

**브라우저 지원:**

| 브라우저 | WebGPU | WebGL Fallback |
|---|---|---|
| Chrome 113+ | O | O |
| Edge 113+ | O | O |
| Firefox Nightly | O | O |
| Safari 18+ | 부분 | O |
| 구 브라우저 | X | O |

### WebGPU 이점

- Draw call throughput 2-5x 향상
- 전력 소비 ~30% 감소
- Compute shader 사용 가능
- Off-thread shader compilation

---

## TSL Compute Shader

Three Shading Language 기반 GPU compute. WebGPU 환경에서만 활성화.

### Grass Wind Compute

GPU에서 잔디 바람 시뮬레이션. CPU 부하 0.

```ts
import { createGrassWindCompute } from 'gaesup-world/core/rendering/tsl/grass';

const compute = await createGrassWindCompute(instanceCount, windStrength);
if (compute) {
  // 매 프레임
  compute.update(time);
  // compute.windBuffer: Float32Array with per-instance wind angles
  
  // 정리
  compute.dispose();
}
// compute가 null이면 TSL/WebGPU 미지원 -> 기존 GLSL vertex shader 사용
```

### Water LOD

카메라 거리에 따른 Water 세그먼트 수 자동 조절.

```ts
import { getWaterLODSegments, computeWaveDisplacement } from 'gaesup-world/core/rendering/tsl/water';

// 거리에 따른 세그먼트 수
const segments = getWaterLODSegments(distance, near, far);
// distance <= 30:  64 segments
// distance >= 180: 8 segments
// 중간: 지수 감쇠

// Wave displacement 계산
const config = { width: 16, height: 16, segments: 32, waveSpeed: 1, waveAmplitude: 0.5 };
const displacement = computeWaveDisplacement(config, time);
```

### WebGPU Renderer 감지

```ts
import { isWebGPURenderer } from 'gaesup-world/core/rendering/tsl/grass';

// Canvas 내부에서
const renderer = useThree((s) => s.gl);
if (isWebGPURenderer(renderer)) {
  // WebGPU 전용 로직
}
```

---

## 내장 LOD 시스템

### NPCSystem LOD

`NPCSystem`에 내장. 카메라 120m+ NPC 자동 숨김.

```
거리 <= 30m:  w = 1.0 (표시)
거리 120m+:   w = 0   (숨김)
중간:        w = exp(-sigma)
```

0.5초 간격으로 체크. 에디트 모드에서는 비활성화.

설정 변경이 필요하면 `NPCSystem/index.tsx`의 상수 수정:

```ts
const NPC_LOD_NEAR = 30;    // 억압 시작 거리
const NPC_LOD_FAR = 120;    // 완전 숨김 거리
const NPC_LOD_STRENGTH = 4; // 억압 강도
```

### PassiveObjects LOD

`PassiveObjects`에 내장. 카메라 150m+ 정적 오브젝트 숨김.

```ts
const PASSIVE_LOD_FAR_SQ = 150 * 150; // 150m 제곱
```

### RemotePlayer LOD

`RemotePlayer`에 내장. SFE `weightFromDistance` 기반.

```
w >= 0.7: 매 프레임 업데이트 (60fps)
w >= 0.4: 30fps 업데이트
w >= 0.2: 15fps 업데이트
w <  0.2: 8fps 업데이트
```

---

## Frustum Culling

### TileSystem

인스턴스 매트릭스 업데이트 후 바운딩 박스/구를 자동 계산하여 GPU frustum culling 활성화.

```tsx
<instancedMesh frustumCulled />
// useLayoutEffect 내에서 자동:
// mesh.computeBoundingBox();
// mesh.computeBoundingSphere();
```

### Camera Collision Cache

카메라 충돌 감지용 메시 목록을 60프레임마다 캐싱.

```ts
import { invalidateCollisionCache } from 'gaesup-world';

// 씬 구조가 급격히 변할 때 수동 갱신
invalidateCollisionCache();
```

---

## WallSystem Compound Collider

개별 벽마다 별도 `<CuboidCollider>` 대신, 단일 `<RigidBody type="fixed">` 안에 compound 구조.

JSX 오버헤드 감소:
- Before: N개 독립 RigidBody + N개 CuboidCollider
- After: 1개 RigidBody + N개 CuboidCollider (compound)

물리 시뮬레이션 성능은 동일하나 React 렌더 트리가 훨씬 단순.
