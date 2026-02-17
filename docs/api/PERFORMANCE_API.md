# Performance API

gaesup-world의 성능 모니터링, 적응형 LOD, 렌더 예산 시스템 API.

---

## PerformanceCollector

R3F Canvas 내부에서 `gl.info`를 수집하여 Zustand store에 기록하는 컴포넌트.
`GaesupWorldContent` 안에 자동 포함되므로 별도 설정 불필요.

```tsx
import { PerformanceCollector } from 'gaesup-world';

// Canvas 내부에 직접 배치할 경우:
<Canvas>
  <PerformanceCollector />
  {/* ... */}
</Canvas>
```

### 수집 데이터

30프레임마다 갱신되며, Zustand store의 `performance` 슬라이스에 저장:

```ts
interface PerformanceData {
  render: {
    calls: number;      // Draw call 수
    triangles: number;  // 렌더링된 삼각형 수
    points: number;     // 포인트 수
    lines: number;      // 라인 수
  };
  engine: {
    geometries: number; // 활성 지오메트리 수
    textures: number;   // 활성 텍스처 수
  };
}
```

### 읽기

```ts
import { useGaesupStore } from 'gaesup-world';

function MyComponent() {
  const perf = useGaesupStore((s) => s.performance);
  console.log(perf.render.calls);      // Draw calls
  console.log(perf.render.triangles);  // Triangle count
  console.log(perf.engine.geometries); // Geometry count
}
```

---

## PerformancePanel

에디터 내장 성능 대시보드. `EditorLayout`에 자동 포함.

### 표시 지표

| 섹션 | 지표 | 설명 |
|---|---|---|
| Frame Rate | FPS, Avg, Min, Max | 초당 프레임 수 |
| Frame Rate | 1% Low | 하위 1% 프레임의 평균 FPS. 끊김 감지에 핵심 |
| Frame Time | ms, Budget Bar | 프레임 소요 시간. 16.7ms 초과 시 경고 |
| GPU Pipeline | Draw Calls | GPU draw call 수. 100 이하 권장 |
| GPU Pipeline | Triangles | 렌더링 삼각형 수 |
| GPU Pipeline | Tri/Call | 콜당 삼각형 수. 높을수록 instancing 효율 좋음 |
| Resources | Geometries, Textures | GPU 리소스 사용량 |
| Memory | MB, Usage% | JS heap 메모리 사용량 |

### 해석 가이드

- **1% Low < 30**: 간헐적 끊김 발생. GC pressure 또는 heavy computation 의심
- **Draw Calls > 300**: instancing 미적용 오브젝트 다수. batch 필요
- **Tri/Call < 100**: draw call 대비 삼각형이 적음. mesh merge 또는 instancing 권장
- **Frame Time > 16.7ms**: 60fps 미달. Budget bar 노랑/빨강이면 최적화 필요

---

## SFE 억압 시스템

docs/sfe/ Core_Theory의 억압장 모델을 렌더링에 적용한 LOD 시스템.
`w = exp(-sigma)` 구조로 거리/각도/속도/화면비율을 단일 가중치로 통합.

### weightFromDistance

기본 거리 기반 억압 가중치.

```ts
import { weightFromDistance } from 'gaesup-world';

const w = weightFromDistance(distance, near, far, strength);
// distance <= near: w = 1 (풀 디테일)
// distance >= far:  w = 0 (완전 억압)
// 중간:            w = exp(-sigma), sigma = t * strength
```

**파라미터:**

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| distance | number | - | 카메라~오브젝트 거리 |
| near | number | - | 억압 시작 거리 |
| far | number | - | 완전 억압 거리 (w=0) |
| strength | number | 4 | 억압 강도. 클수록 급격한 LOD 전환 |

### multiSigma

다차원 억압. 거리 + 시야각 + 속도 + 화면 비율을 하나의 가중치로 통합.

```ts
import { multiSigma, type SuppressionFactors, type SuppressionConfig } from 'gaesup-world';

const factors: SuppressionFactors = {
  distance: 50,
  near: 10,
  far: 100,
  viewAngle: 0.8,    // 시야 중심에서 벗어난 각도 (라디안)
  velocity: 2.0,      // 오브젝트 속도
  coverage: 0.05,     // 화면 차지 비율 [0,1]
};

const config: Partial<SuppressionConfig> = {
  distanceStrength: 4,   // 거리 억압 강도
  angleStrength: 2,      // 시야각 억압 강도
  velocityStrength: 1,   // 속도 억압 강도 (역: 빠르면 덜 억압)
  coverageStrength: 1.5, // 화면비율 억압 강도 (역: 크면 덜 억압)
  maxAngle: Math.PI / 2, // 최대 시야각
  velocityThreshold: 0.5 // 이 속도 이하에서 속도 억압 적용
};

const w = multiSigma(factors, config);
// w: [0, 1] 가중치
// 활용: LOD 레벨, 업데이트 빈도, 그림자 품질 등
```

**sigma 합산 공식:**

```
sigma_total = sigma_dist + sigma_angle + sigma_velocity + sigma_coverage
w = exp(-sigma_total)
```

### RenderBudget

프레임 타임에 따라 억압 강도를 자동 조절하는 적응형 시스템.

```ts
import { RenderBudget } from 'gaesup-world';

const budget = new RenderBudget({
  targetFps: 60,        // 목표 FPS
  eta: 0.5,             // 조절 속도 (클수록 빠른 반응)
  initialStrength: 4,   // 초기 억압 강도
  minStrength: 1,       // 최소 강도 (품질 상한)
  maxStrength: 12,      // 최대 강도 (품질 하한)
  historySize: 30,      // FPS 평균 계산용 히스토리 크기
});

// 매 프레임 호출
useFrame((_, delta) => {
  const strength = budget.update(delta);
  // strength를 weightFromDistance의 strength 파라미터로 사용
  const w = weightFromDistance(dist, near, far, strength);
});

// 상태 조회
budget.strength;    // 현재 억압 강도
budget.averageFps;  // 평균 FPS
budget.reset();     // 초기화
```

**동작 원리:**

```
d(sigma)/dt = -eta * (target_fps - actual_fps)
```

- FPS < target: strength 증가 -> LOD 강화 -> 부하 감소
- FPS > target: strength 감소 -> 품질 향상

---

## Camera Collision Cache

카메라 충돌 검사에서 `scene.traverse`를 캐싱으로 대체.

```ts
import { invalidateCollisionCache } from 'gaesup-world';

// 씬에 오브젝트를 동적으로 추가/제거한 후 호출
invalidateCollisionCache();
```

60프레임마다 자동 갱신되므로 대부분의 경우 수동 호출 불필요.
씬이 급격하게 변할 때(텔레포트, 맵 전환 등)에만 호출.
