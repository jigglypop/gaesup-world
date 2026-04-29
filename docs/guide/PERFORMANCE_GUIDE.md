# Performance Guide

이 문서는 현재 코드 기준으로 성능을 관리할 때 우선 확인할 지점을 정리합니다.

## 기본 원칙

- 매 프레임 실행되는 코드에서는 새 객체와 새 배열 생성을 피합니다.
- Zustand store는 필요한 값만 selector로 구독합니다.
- R3F `useFrame` 콜백은 도메인별로 필요 최소한만 둡니다.
- 대량 반복 오브젝트는 instancing, batching, culling 경로를 우선 사용합니다.
- 공개 API 문서는 실제 export된 항목만 예시로 사용합니다.

## 공개 성능 API

성능 tier와 profile은 루트 엔트리에서 사용할 수 있습니다.

```ts
import {
  autoDetectProfile,
  classifyTier,
  detectCapabilities,
  profileForTier,
  usePerfStore,
} from 'gaesup-world';
```

React 컴포넌트에서는 필요한 값만 구독합니다.

```tsx
const tier = usePerfStore((state) => state.tier);
```

## Renderer Stats 확인

`GaesupWorldContent`는 내부적으로 `PerformanceCollector`를 사용해 renderer stats를 store에 기록합니다.

```tsx
import { useGaesupStore } from 'gaesup-world';

function RenderStats() {
  const calls = useGaesupStore((state) => state.performance.render.calls);
  const triangles = useGaesupStore((state) => state.performance.render.triangles);

  return (
    <div>
      draw calls: {calls}, triangles: {triangles}
    </div>
  );
}
```

`PerformanceCollector` 자체는 현재 외부 공개 컴포넌트로 문서화하지 않습니다.

## Zustand 구독

객체를 반환하는 selector는 `useShallow`를 사용합니다.

```tsx
import { useShallow } from 'zustand/react/shallow';

const data = useStore(useShallow((state) => ({
  a: state.a,
  b: state.b,
})));
```

단일 값은 개별 selector를 사용합니다.

```tsx
const a = useStore((state) => state.a);
```

## Building / Rendering

대량 building 데이터는 render snapshot과 visibility driver 계층을 사용합니다.

- `BuildingRenderStateDriver`: store 데이터를 render snapshot으로 동기화
- `BuildingGpuCullingDriver`: GPU visibility flag를 읽고 culling 결과 생성
- `BuildingIndirectDrawDriver`: indirect draw 경로
- `parseBuildingGpuVisibilityFlags`: 대량 visibility flag parsing smoke benchmark 대상

## Grass / Foliage

잔디는 타일별 독립 `useFrame`을 늘리는 방식보다 `GrassDriver`와 manager 기반 batch 경로를 우선 사용합니다.

현재 grass 경로는 다음 비용을 줄이는 데 초점을 둡니다.

- 반복 인스턴스 데이터 생성
- weather/distance 기반 갱신
- frustum culling 누락
- 불필요한 draw call

WASM이 가능하면 `loadCoreWasm()` 기반 경로를 사용하고, 실패하면 JS fallback으로 동작합니다.

## WASM

외부에서 보장되는 공개 API는 `loadCoreWasm`와 `GaesupCoreWasmExports` 타입입니다.

```ts
import { loadCoreWasm, type GaesupCoreWasmExports } from 'gaesup-world';
```

저수준 memory helper는 현재 package subpath로 공개하지 않습니다.

## WebGPU Renderer

WebGPU/WebGL fallback renderer는 루트 엔트리에서 사용할 수 있습니다.

```tsx
import { createRenderer } from 'gaesup-world';

<Canvas gl={createRenderer}>
  {/* scene */}
</Canvas>
```

WebGPU compute, TSL grass/water 유틸은 현재 public package subpath로 보장하지 않습니다.

## 벤치마크 문서화 기준

성능 수치를 문서에 남길 때는 아래를 함께 기록합니다.

- 실행 명령
- 브라우저/OS/GPU/CPU
- scene 규모
- 측정 지표
- 변경 전후 commit 또는 날짜

환경이 없는 고정 수치는 문서에 남기지 않습니다.

## 현재 회귀 테스트

- selector subscription 테스트: unrelated store update가 불필요한 리렌더를 만들지 않는지 확인
- culling parser smoke benchmark: 20,000개 visibility flag parsing 기준선 확인
- perf detect 테스트: capability/profile 분류 확인
