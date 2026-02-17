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
