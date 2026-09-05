# Rendering API

이 문서는 현재 공개 export 기준의 렌더링 API를 정리합니다.

## WebGPU/WebGL Renderer

### createRenderer

`createRenderer`는 R3F 9의 비동기 `gl` factory 계약을 구현합니다. 입력 canvas는 `HTMLCanvasElement`와 `OffscreenCanvas`를 모두 허용합니다.

```tsx
import { Canvas } from '@react-three/fiber';
import { createRenderer } from 'gaesup-world';

<Canvas gl={createRenderer}>
  {/* scene */}
</Canvas>
```

WebGPU capability가 없거나 `three/webgpu`를 불러오지 못하거나 renderer 생성자가 없거나 생성에 실패하면 legacy `WebGLRenderer`를 반환합니다. WebGL fallback의 기본값은 `antialias: true`, `powerPreference: 'high-performance'`이며 명시한 값은 그대로 유지합니다.

`WebGPURenderer.init()`은 Three.js 내부의 WebGPU/WebGL2 backend 선택까지 수행합니다. 이 초기화가 reject되면 별도 WebGL renderer를 다시 만들지 않고 원래 오류를 그대로 전달하므로, 호출자는 `<Canvas>` error boundary 또는 factory promise에서 처리해야 합니다.

초기화에 성공한 WebGPU renderer는 직접 `dispose()`하거나 R3F 9가 unmount 때 호출하는 `forceContextLoss()`를 사용해도 native dispose를 한 번만 실행합니다. renderer와 scene의 사용 수명은 이를 받은 `<Canvas>` 또는 consumer가 소유합니다.

### isWebGPUAvailable

WebGPU adapter 지원 여부를 확인합니다. 최초 호출이 시작한 promise 하나를 module lifetime 동안 캐시하므로 동시 호출과 이후 호출은 같은 probe 결과를 공유합니다. `navigator.gpu` 부재, adapter 부재, probe reject는 모두 `false`로 resolve됩니다.

```ts
import { isWebGPUAvailable } from 'gaesup-world';

const available = await isWebGPUAvailable();
```

이 값은 capability probe 결과이며 renderer 초기화 성공을 보장하지는 않습니다.

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
