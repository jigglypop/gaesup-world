# Rendering API

이 문서는 현재 공개 export 기준의 렌더링 API를 정리합니다.

## WebGPU/WebGL Renderer

### createRenderer

`createRenderer`는 WebGPU가 가능하면 WebGPU renderer를 만들고, 실패하면 WebGL renderer로 fallback합니다.

```tsx
import { Canvas } from '@react-three/fiber';
import { createRenderer } from 'gaesup-world';

<Canvas gl={createRenderer}>
  {/* scene */}
</Canvas>
```

### isWebGPUAvailable

WebGPU 지원 여부를 확인합니다. 결과는 내부적으로 캐시됩니다.

```ts
import { isWebGPUAvailable } from 'gaesup-world';

const available = await isWebGPUAvailable();
```

## Postprocessing Subpath

후처리 관련 API는 별도 subpath에서도 사용할 수 있습니다.

```tsx
import { ColorGrade, LutOverlay } from 'gaesup-world/postprocessing';
```

공개 항목:

- `ColorGrade`
- `LutOverlay`
- `parseCubeLut`
- `createLutTexture`
- `loadCubeLut`
- `loadCubeLutTexture`
- `ToonOutlines`
- `Outlined`

## 루트 렌더링 export

루트 엔트리에서도 아래 렌더링 API가 공개됩니다.

- `createRenderer`, `isWebGPUAvailable`
- `DynamicFog`
- `DynamicSky`
- `ColorGrade`
- `LutOverlay`
- `ToonOutlines`, `Outlined`
- toon material helpers: `createToonMaterial`, `getToonGradient`, `setDefaultToonMode`, `getDefaultToonMode`, `disposeToonGradients`, `applyToonToScene`

## DynamicSky / DynamicFog

시간대나 장면 분위기에 맞춰 sky/fog를 조절하는 컴포넌트입니다.

```tsx
import { DynamicFog, DynamicSky } from 'gaesup-world';

<>
  <DynamicSky />
  <DynamicFog />
</>
```

## 내부 또는 미공개 경로

아래 import는 현재 `package.json`의 public exports에 포함되어 있지 않습니다.

```ts
// 공개 subpath가 아님
import { createGrassWindCompute } from 'gaesup-world/core/rendering/tsl/grass';
import { getWaterLODSegments } from 'gaesup-world/core/rendering/tsl/water';
```

TSL/WebGPU compute helper를 외부 API로 만들려면 먼저 `package.json` exports와 타입 출력 경로를 추가해야 합니다.

## Building Rendering

building 도메인은 대량 배치를 위해 별도 렌더링 driver를 제공합니다.

- `BuildingRenderStateDriver`
- `BuildingGpuMirrorDriver`
- `BuildingGpuUploadDriver`
- `BuildingGpuCullingDriver`
- `BuildingIndirectDrawDriver`
- `BuildingIndirectArgsUploadDriver`
- `BuildingVisibilityDriver`

이 항목들은 building 도메인 API로 다룹니다. 자세한 내용은 [Building API](./BUILDING_API.md)를 참고합니다.
