# 렌더링

월드가 어떤 렌더러로, 어떤 품질 설정으로, 어떤 빛·안개·후처리·재질로 그려지는지 다룬다. 렌더러 선택(`createRenderer`), 품질 profile, `CascadedSun`·`DynamicSky`·`DynamicFog`, `WorldPostProcessing`과 삭제 예정인 WebGL 전용 효과, 툰 재질, 첫 프레임 멈춤을 막는 `CompileGate`, 건축 비주얼 컴포넌트와 GPU 인스턴싱까지다. 월드의 모양과 비용을 조정하는 개발자를 위한 문서다. 이름과 기본값은 현재 작업 트리의 소스에서 확인했다.

## 렌더러

### `createRenderer`

R3F `Canvas`의 `gl`에 넘기는 비동기 팩토리다(`src/core/rendering/webgpu.ts`, 루트 export).

```tsx
<Canvas shadows="percentage" gl={createRenderer}>...</Canvas>
```

1. `isWebGPUAvailable()`로 WebGPU를 확인한다. `navigator.gpu`가 있고 `requestAdapter()`가 어댑터를 돌려주면 true다. 결과 promise는 페이지 수명 동안 캐시된다.
2. false면 `createLegacyRenderer(props)`로 classic `THREE.WebGLRenderer`를 만든다(`antialias` 기본 true, `powerPreference` 기본 `'high-performance'`).
3. true면 `three/webgpu`를 동적 import해 `WebGPURenderer`를 만들고 `await renderer.init()`을 기다린다. R3F가 넘기는 `canvas`·`antialias`·`alpha` 등은 그대로 전달하고 `powerPreference: 'default'`는 뺀다. 모듈이나 생성자를 쓸 수 없으면 classic `WebGLRenderer`로 돌아간다. `init()`이 실패하면 백엔드를 정리하고 예외를 그대로 던진다(캔버스 생성이 실패한다).
4. `WebGPURenderer`는 `init()` 중 WebGPU 장치를 얻지 못하면 스스로 WebGL2 백엔드로 바꾼다. `createRenderer`는 어댑터를 먼저 확인하므로 이 경우는 드물다.
5. 만든 렌더러의 `dispose`를 한 번만 돌게 하고 `forceContextLoss`를 붙여, 캔버스가 내려갈 때 R3F가 렌더러를 해제하게 한다.

`shadows="percentage"`를 쓰는 이유: R3F의 `shadows`(`true`)는 `PCFSoftShadowMap`을 고르는데 three r186은 이 방식을 없애고 경고와 함께 `PCFShadowMap`으로 바꾼다. `"percentage"`는 처음부터 `PCFShadowMap`이다.

브라우저별 WebGPU 기본 지원 현황은 계속 바뀌므로 여기서 다루지 않는다. 판단은 실행 중 감지(`isWebGPUAvailable`)로 한다.

### 렌더러 종류

엔진 내부는 렌더러를 세 종류로 나눈다(`rendererKind`, `src/core/rendering/webgpu.ts`, 공개 export 아님).

| 종류 | 언제 | 그리는 방식 |
|---|---|---|
| `webgpu` | `WebGPURenderer` + WebGPU 백엔드 | TSL 노드 재질, 네이티브 cascade 그림자(`CascadedSun`), GPU 인스턴스 배치와 compute 컬링(`GpuBatchBridge`), TSL 후처리 |
| `webgpu-fallback` | `WebGPURenderer` + 내장 WebGL2 백엔드 | 같은 TSL 재질과 TSL 후처리. 그림자는 단일 맵, GPU 배치 없음 |
| `webgl` | classic `WebGLRenderer`: WebGPU가 없을 때의 `createRenderer`, `gl={createLegacyRenderer}`, `gl` 생략 | 잔디·물·불·깃발·벚꽃·눈·날씨의 GLSL 경로, three-stdlib 거울 물, WebGL 그림자 깊이 재질, `@react-three/postprocessing` 후처리, 단일 맵 그림자 |

지금 WebGPU가 없는 브라우저는 `webgpu-fallback`이 아니라 `webgl`(classic) 경로로 그린다. 저장소 측정에서 `navigator.gpu`를 지우고 잰 "WebGL2 fallback" 수치도 이 classic 경로다. `WebGPURenderer`의 WebGL2 백엔드를 강제하는 옵션(`forceWebGL`)은 `createRenderer`가 노출하지 않는다. PRD GPU-1이 `createRenderer`를 `WebGPURenderer` 전용으로 바꾸고 GLSL·`WebGLRenderer` 경로를 지운다.

코드에서 종류를 확인하려면 `rendererKind`와 같은 판정을 쓴다.

```tsx
import { useThree } from '@react-three/fiber';

export function useRendererKind(): 'webgpu' | 'webgpu-fallback' | 'webgl' {
  const gl = useThree((state) => state.gl) as unknown as {
    isWebGPURenderer?: boolean;
    backend?: { isWebGPUBackend?: boolean };
  };
  if (gl.isWebGPURenderer !== true) return 'webgl';
  return gl.backend?.isWebGPUBackend === true ? 'webgpu' : 'webgpu-fallback';
}
```

classic 경로와 비교할 때는 `<Canvas gl={createLegacyRenderer}>`로 강제한다. R3F의 `useThree((s) => s.gl)` 타입은 `WebGLRenderer`로 선언되어 있으므로 WebGPU 전용 필드는 위처럼 좁혀 읽는다.

## 품질 profile

`GaesupWorldContent`의 `quality`로 켠다. 출처: `src/core/perf/quality.tsx`, `detect.ts`, `types.ts`.

| 값 | 동작 |
|---|---|
| 생략 | profile 없음. 각 컴포넌트가 자기 기본값을 쓴다(`CascadedSun` `medium`, 캔버스 `dpr`는 준 값 그대로) |
| `'auto'` | 기기를 한 번 감지해 tier를 고른다. 결과는 페이지 전역 `usePerfStore`에 저장되어 다른 월드도 재사용한다 |
| `'low'` \| `'medium'` \| `'high'` | 그 tier의 profile로 고정 |
| `PerfProfile` 객체 | 직접 만든 profile(`tier`, `instanceScale`, `pixelRatio`, `shadowMapSize`, `postprocess`, `outline`) |

### tier와 profile

| tier | 캔버스 픽셀 비율 | 그림자 맵 | 후처리 | `instanceScale`(잔디 잎 수 배율) |
|---|---|---|---|---|
| `high` | 2.0 → 상한 1.5 | 2048 | 켬, preset `quality` | 1.0 |
| `medium` | 1.5 | 1024 | 켬, preset `balanced` | 0.7 |
| `low` | 1.0 | 512 | 끔 | 0.4 |

- 실제 픽셀 비율은 `min(profile.pixelRatio, MAX_QUALITY_PIXEL_RATIO(1.5), devicePixelRatio)`다. 후처리와 셰이딩 비용이 픽셀 수에 비례하기 때문이다. `Canvas`가 다시 렌더되며 자기 `dpr`(기본 `[1, 2]`)을 적용해도 profile 값으로 되돌린다.
- `outline` 필드는 profile에 있지만 지금 읽는 곳이 없다.

`auto` 감지(`classifyTier`): GPU 이름은 캔버스 렌더러에서 읽는다(WebGPU 어댑터 정보, 또는 WebGL `WEBGL_debug_renderer_info`). 코어 수(`hardwareConcurrency`, 없으면 4), 메모리(`deviceMemory`, 없으면 4GB), 모바일 UA를 함께 본다.

1. 소프트웨어 GPU(`swiftshader`, `llvmpipe`, `software`) → `low`
2. 모바일: 고성능 GPU 이름(`rtx`, `radeon rx`, `apple m`, `apple a1`, `apple a2`)이면 `medium`, 아니면 `low`
3. 저성능 GPU 이름(`intel`, `mali`, `adreno 3`, `adreno 4`, `powervr`): 8코어·8GB 이상이면 `medium`, 아니면 `low`
4. 고성능 GPU 이름 → `high`
5. 8코어·8GB 이상 + WebGL2(WebGPU면 참) → `high`, 4코어·4GB 이상 → `medium`, 그 밖 → `low`

### profile을 쓰는 곳

| 대상 | 쓰는 값 |
|---|---|
| 캔버스 픽셀 비율 | `pixelRatio`(상한 1.5) |
| `CascadedSun` | `quality`를 주지 않았으면 `tier`로 그림자 preset(아래 표) |
| `DynamicSky` | `shadowMapSize`를 주지 않았으면 `shadowMapSize` |
| `GaesupWorldContent postProcessing` | `postprocess`가 false면 올리지 않는다. preset을 주지 않았으면 `low`→`performance`, `medium`→`balanced`, `high`→`quality` |
| 잔디(`Grass`) | `instanceScale`. 단, 월드 profile이 아니라 전역 `usePerfStore`의 profile을 읽는다. `quality="low"`처럼 tier를 고정해도 잔디는 `usePerfStore`(감지 전 기본 `medium`)를 따르므로 `usePerfStore.getState().setTier('low')`도 함께 부른다 |

### 관련 API

| API | 쓰임 |
|---|---|
| `resolveQualityDpr(quality)` | `<Canvas dpr={resolveQualityDpr('auto')}>`로 첫 프레임부터 맞는 크기로 그린다. `auto`면 한 번 감지한다. 렌더러가 아직 없으므로 WebGL 탐색 컨텍스트로 GPU 이름을 읽고 바로 해제하며, 이 결과가 저장되어 캔버스 안에서 WebGPU 어댑터로 다시 감지하지 않는다 |
| `useQualityProfile()` | 월드 profile, 없으면 `null`. 자기 컴포넌트가 tier를 따르게 할 때 쓴다 |
| `usePerfStore` | 페이지 전역 profile store. `setTier(tier)`(수동 고정, `auto` 월드와 잔디가 따른다), `resetAuto()`(다시 감지), `detect(identity?)`, `profile`, `capabilities`, `manualOverride` |
| `QualityProfileProvider` | `GaesupWorldContent` 없이 profile만 적용할 때. `quality`를 주지 않으면 아무것도 바꾸지 않는다 |
| `profileForTier`, `classifyTier`, `detectCapabilities`, `autoDetectProfile` | 감지 단계를 직접 쓸 때 |

```tsx
import { Canvas } from '@react-three/fiber';
import { createRenderer, GaesupWorldContent, resolveQualityDpr, useQualityProfile, type PerfProfile } from 'gaesup-world';

export const calm: PerfProfile = {
  tier: 'medium', instanceScale: 0.5, pixelRatio: 1.25, shadowMapSize: 1024, postprocess: false, outline: false,
};

export function CalmWorld() {
  return (
    <Canvas gl={createRenderer} dpr={resolveQualityDpr(calm)}>
      <GaesupWorldContent quality={calm}>{/* 월드 내용 */}</GaesupWorldContent>
    </Canvas>
  );
}

export function ShadowAware() {
  const profile = useQualityProfile();
  return <mesh castShadow={profile?.tier !== 'low'}><sphereGeometry /></mesh>;
}
```

## 조명

`CascadedSun`과 `DynamicSky`는 둘 다 directional light를 만든다. 한 월드에는 하나만 둔다. 두 컴포넌트는 three r186 `SunLight`(두 백엔드 CSM)와 시간대 연동 하나로 합칠 예정이다(PRD UP-1).

### `CascadedSun`

고정된 해와 cascade 그림자다(`src/core/rendering/sky/CascadedSun.tsx`). 환경광은 만들지 않으므로 `<ambientLight>`를 따로 둔다. 품질 profile을 따르려면 `GaesupWorldContent` 안에 둔다.

| prop | 기본값 | 뜻 |
|---|---|---|
| `position` | `[28, 36, 18]` | 빛 위치. 방향만 의미가 있다 |
| `color` | `'#ffffff'` | |
| `intensity` | 1.8 | |
| `quality` | profile tier, 없으면 `'medium'` | 그림자 preset |
| `castShadow` | `true` | |
| `cascades`, `maxFar`, `lightMargin`, `shadowMapSize` | preset 값 | preset을 개별로 덮는다 |
| `mode` | `'practical'` | cascade 분할(`uniform`·`logarithmic`·`practical`) |
| `fade` | `true` | cascade 경계를 섞는다 |
| `shadowBias`, `shadowNormalBias`, `shadowRadius` | −0.00015, 0.04, 1 | |

| preset | cascade 수 | 맵 크기 | `maxFar` | `lightMargin` |
|---|---|---|---|---|
| `low` | 2 | 512 | 80 | 60 |
| `medium` | 3 | 1024 | 140 | 100 |
| `high` | 4 | 2048 | 220 | 140 |

- `webgpu`: three `CSMShadowNode`(`three/addons/csm/CSMShadowNode.js`를 동적 import)로 cascade 그림자를 만든다. 노드가 준비된 뒤에 그림자를 켜므로 마운트 직후 잠깐 그림자가 없다. 잔디 잎처럼 가는 물체는 가장 가까운 cascade에만 그림자를 넣는다.
- `webgpu-fallback`·`webgl`: 한 장의 그림자 맵(한 변 140m)을 카메라 앞 지면에 맞추고, 맵이 떨리지 않도록 texel 단위로 스냅해 매 프레임 옮긴다.
- 갱신은 `effects` 단계에서 돈다(그 프레임의 카메라를 따른다). 위 props 중 그림자 설정을 바꾸면 빛이 다시 만들어진다.

### `DynamicSky`

게임 시간·날씨·계절에 따라 해와 환경광을 바꾼다(`src/core/rendering/sky/index.tsx`). 자체 `ambientLight`와 `directionalLight`를 갖는다. 시간과 날씨는 그 월드의 `timeStore`·`weatherStore`에서 읽는다.

| prop | 기본값 | 뜻 |
|---|---|---|
| `rigDistance` | 60 | 해를 놓는 거리 |
| `castShadow` | `true` | |
| `shadowMapSize` | profile `shadowMapSize`, 없으면 1024 | |
| `shadowRange` | 90 | 그림자 상자 반너비(m) |
| `followCamera` | `true` | 그림자 상자를 카메라 앞 지면에 둔다. false면 원점 |
| `keyframes` | 0·5·7·10·13·16·18·20·24시 표 | `SkyKeyframe[]`(`hour`, `sunColor`, `ambientColor`, `sunIntensity`, `ambientIntensity`, `azimuth`, `elevation`) |
| `damping` | 0.12 | 색과 세기를 목표값으로 따라가는 비율(0.01~1) |

- 날씨(`sunny`·`cloudy`·`rain`·`snow`·`storm`)는 세기를 줄이고 색을 흐린 쪽으로, 계절은 색을 약하게 물들인다.
- 해 방향은 약 0.2° 이상 바뀔 때만 옮긴다. 분 단위로 그림자 맵이 흔들리지 않게 하기 위해서다.
- 그림자는 cascade 없이 한 장이다.

## 안개: `DynamicFog`

게임 시간과 날씨로 `scene.fog`(`THREE.Fog`)를 조절한다(`src/core/rendering/fog/DynamicFog.tsx`). `Canvas` 안 어디에나 한 번 둔다.

| prop | 기본값 | 뜻 |
|---|---|---|
| `color` | `'#cfd8e3'` | 맑은 낮의 기본 색 |
| `near`, `far` | 35, 220 | 맑은 낮의 거리 |
| `enabled` | `true` | false면 마운트 전 안개로 돌려놓는다 |

- 밤에는 색을 어둡게 하고 거리를 줄인다(near×0.45, far×0.55). 새벽·해질녘에는 색을 물들인다. 비·폭풍·눈은 색을 바꾸고 거리를 더 줄인다.
- 내려가면 마운트 전의 `scene.fog`로 되돌린다.
- 건축 데이터의 `showFog`를 켜면 `BuildingController`가 `fogColor`를 기본 색으로 `DynamicFog`를 올린다. 이때 따로 `DynamicFog`를 두지 않는다(둘이 `scene.fog`를 다툰다). `worldSurface: 'water'`는 월드 둘레에 카메라를 따라가는 바다(480m 판)를 깐다.

```tsx
import { DynamicFog, DynamicSky } from 'gaesup-world';

export function TimeOfDayLights() {
  return (
    <>
      <DynamicSky shadowRange={60} followCamera />
      <DynamicFog color="#cfd8e3" near={35} far={220} />
    </>
  );
}
```

## 후처리

### `WorldPostProcessing`

캔버스 하나의 최종 렌더를 맡는 후처리다(`src/core/rendering/postprocess/WorldPostProcessing.tsx`). `gaesup-world/postprocessing`에서 export한다.

| prop | 기본값 | 뜻 |
|---|---|---|
| `quality` | `'balanced'` | `performance`·`balanced`·`quality`. 아래 기본값을 정한다 |
| `antialias` | `performance`면 `'none'`, 아니면 `'traa'` | 시간축 안티에일리어싱(TRAA) |
| `ambientOcclusion` | `performance`가 아니면 켬 | GTAO |
| `aoRadius` | 2 | |
| `aoSamples` | `quality`면 16, 아니면 8 | |
| `aoResolutionScale` | `quality`면 1, 아니면 0.5 | 0.25~1 |
| `bloomStrength`, `bloomRadius`, `bloomThreshold` | 0.18, 0.4, 1 | 항상 켜진 bloom |
| `saturation` | 1.08 | |
| `historyVersion` | 0 | 텔레포트, 월드 교체, 서버 위치 보정 뒤에 올린다. TRAA 이력을 버려 잔상을 없앤다 |

- `webgpu`·`webgpu-fallback`: TSL `RenderPipeline`이다. 장면 pass(TRAA·AO를 쓰면 velocity·normal MRT, 이때 MSAA 끔) → TRAA → GTAO를 색에 곱함 → bloom 더함 → 채도. `three/webgpu`, `three/tsl`, `BloomNode`·`TRAANode`·`GTAONode` addon을 켤 때 동적으로 불러온다.
- 카메라가 5m 넘게 튀거나 크게 돌거나 투영이 바뀌면 TRAA 이력을 스스로 버린다.
- MRT를 쓰지 않는 `performance` preset이면 장면 파이프라인을 먼저 컴파일한 뒤 렌더를 넘겨받고, 그 전까지는 장면을 직접 그린다. TRAA나 AO를 쓰면 바로 넘겨받는다(아래 `CompileGate` 참고).
- `useFrame` priority 1로 캔버스 렌더를 소유한다. 다른 `EffectComposer`나 렌더 소유자를 같은 캔버스에 두지 않는다.
- `webgl`(classic): props를 무시하고 `ToonOutlines` + `ColorGrade`(`@react-three/postprocessing`) 조합을 올린다.

### 켜는 방법

권장은 `GaesupWorldContent`의 `postProcessing`이다.

```tsx
<GaesupWorldContent quality="auto" postProcessing={{ bloomStrength: 0.25, ambientOcclusion: false }}>
  ...
</GaesupWorldContent>
```

- `true` 또는 props 객체를 받는다. 켠 월드만 후처리 청크를 `React.lazy`로 내려받고, 로딩 중에도 월드는 계속 그려진다.
- profile의 `postprocess`가 false인 tier(`low`)에서는 올리지 않는다. `quality`를 주지 않으면 tier에서 preset을 고른다.
- 직접 올리려면 `import { WorldPostProcessing } from 'gaesup-world/postprocessing'` 뒤 캔버스 안에 `<WorldPostProcessing quality="balanced" historyVersion={teleports} />`를 둔다. 이때는 tier 연동과 lazy 로드가 없다.

### WebGL 전용 효과(삭제 예정)

아래는 `@react-three/postprocessing`의 `EffectComposer` 기반이라 classic `WebGLRenderer`에서만 동작한다. WebGPU 렌더러에서는 쓰지 않는다. PRD GPU-1에서 지우고 필요한 효과는 TSL로 옮긴다. 루트와 `gaesup-world/postprocessing` 양쪽에서 export한다.

| 이름 | props(기본값) | 뜻 |
|---|---|---|
| `ColorGrade` | `preset?`(`neutral`·`morning`·`noon`·`sunset`·`night`·`rain`·`snow`·`storm`, 생략하면 시간·날씨로 자동), `intensity`(1), `vignette`(true) | 톤매핑·밝기·대비·색조·채도·비네트. `EffectComposer` 안이나 `ToonOutlines`의 `extraEffects`에 둔다 |
| `LutOverlay` | `url`(`.cube`), `tetrahedralInterpolation`(true), `blendFunction?`, `onLoad?`, `onError?` | `.cube` LUT pass |
| `ToonOutlines` | `children`, `edgeStrength`(6), `visibleEdgeColor`·`hiddenEdgeColor`(`#000000`), `pulseSpeed`(0), `xRay`(false), `blur`(false), `multisampling`(0), `extraEffects?` | 선택 기반 외곽선. 자체 `EffectComposer`를 만든다 |
| `Outlined` | `children`, `enabled`(true) | `ToonOutlines` 안에서 외곽선을 받을 메시를 표시한다 |
| `parseCubeLut`, `createLutTexture`, `loadCubeLut`, `loadCubeLutTexture` | | `.cube` 파일을 `Data3DTexture`로 만드는 도우미 |

## 툰 재질

출처: `src/core/rendering/toon.ts`. 모두 루트 export다.

| 함수 | 뜻 |
|---|---|
| `setDefaultToonMode(enabled)` / `getDefaultToonMode()` | 페이지 전역 기본 툰 모드. 켜면 건축 타일·벽·블록, 모래·설원·잔디 지면, 벚꽃·나무, 간판, 조작 캐릭터와 NPC 모델이 `MeshToonMaterial`로, 물은 툰 전용 셰이더로 그려진다. 각 컴포넌트가 `toon` prop을 받으면 그것이 우선한다. 컴포넌트가 마운트할 때 읽으므로 월드를 올리기 전에 부른다 |
| `createToonMaterial(options)` | `MeshToonMaterial`을 만든다. `color`, `vertexColors`, `transparent`, `opacity`, `steps`(3), `emissive`, `emissiveIntensity`, `map`, `alphaMap`, `side`, `depthWrite` |
| `getToonGradient(steps)` | 단계 수(2~8로 자름)별 계단 그라디언트 텍스처. 캐시해서 공유한다 |
| `applyToonToScene(root, steps?)` | `root` 아래 메시의 재질을 색·맵·투명도를 옮긴 `MeshToonMaterial`로 바꾼다(기본 4단계). 같은 root에는 한 번만 적용된다 |
| `disposeToonGradients()` | 캐시한 그라디언트 텍스처를 해제한다 |

```tsx
import { useEffect, useMemo } from 'react';

import { createToonMaterial, setDefaultToonMode } from 'gaesup-world';

setDefaultToonMode(true); // 앱 시작 시, 월드를 올리기 전

export function ToonBox() {
  const material = useMemo(() => createToonMaterial({ color: '#f7bfd2', steps: 4 }), []);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh material={material}><boxGeometry /></mesh>;
}
```

`WebGPURenderer`는 `MeshToonMaterial`을 노드 재질로 바꿔 그리므로 두 렌더러 모두에서 동작한다.

## 첫 프레임 멈춤 방지: `CompileGate`

새 콘텐츠는 처음 그려지는 프레임에 셰이더와 파이프라인을 동기로 만들면서 멈춘다. `CompileGate`(`src/core/rendering/CompileGate.tsx`, 공개 export 아님)는 감싼 콘텐츠를 숨긴 채 `compileAsync`로 파이프라인을 먼저 만들고, 끝나면 보이게 한다.

- 건축의 벚꽃·나무, 깃발, 불, 간판 배치와 모델 오브젝트, 불 효과가 이 문 안에 있다. 그래서 새로 놓은 오브젝트가 몇 프레임 늦게 나타날 수 있다.
- 장면을 그리는 대상(후처리 pass의 렌더 타깃)과, `WebGPURenderer`에서는 그림자 cascade마다 따로 컴파일한다.
- 후처리 pass가 MRT를 쓰면(TRAA나 AO가 켜진 `balanced`·`quality` preset) 미리 컴파일하지 못한다. three가 나중 작업에서 MRT 없이 셰이더를 만들기 때문이다. 이때 콘텐츠는 바로 보이고 처음 그릴 때 컴파일된다. `performance` preset이나 후처리가 없으면 미리 컴파일한다(`src/core/rendering/CompileGate.tsx`의 `compilesAhead`).
- three r185·r186이고 렌더러에 `compileAsync`가 있을 때만 동작한다. 그 밖에서는 바로 보인다.

## 건축 비주얼 컴포넌트

`gaesup-world/building`(루트에도 있음)이 내보내는 비주얼이다. 보통은 직접 올리지 않는다. `BuildingController`가 건축 store의 타일(`objectType`)과 오브젝트(`type`)를 보고 배치 버전으로 그린다. 건축 데이터 없이 장식으로 쓸 때만 직접 올린다.

| 컴포넌트 | props(기본값) | 비고 |
|---|---|---|
| `Grass` | `group` props + `width`(4), `density`(m²당 잎 수), `instances`, `maxInstances`(18000), `cells`, `cellSize`(1), `ground`(true), `lod`, `center`, `options`(`bW`·`bH`·`joints`), 색·텍스처 URL, `toon` | 캔버스에 `GrassDriver`가 하나 있어야 바람·밟힘·거리 LOD·절두체 컬링이 돈다. 잎 수에 전역 `usePerfStore`의 `instanceScale`을 곱한다. 잎 데이터는 WASM, 없으면 JS로 만든다 |
| `GrassDriver` | 없음 | 모든 잔디를 한 `effects` 콜백으로 갱신한다. `BuildingController`는 이미 하나 올린다 |
| `GrassManagerProvider` | `value`(`createGrassManager()`) | 런타임 없는 독립 장면에서 잔디 관리자를 따로 둘 때 |
| `Water` | `size`(16), `width`, `depth`, `shore`(네 변 모래톱, 기본 모두), `lod`, `center`, `followCamera`(false), `normalMap`, `toon`, `brightness`(1) | 노드 렌더러: 툰이면 TSL 물, 아니면 반사 없는 반투명 면. classic WebGL: 툰이면 GLSL, 아니면 three-stdlib 거울 물(반사 렌더 타깃 192~384px) |
| `Fire` | `intensity`(1.5), `width`(1), `height`(1.5), `color`(`#ffffff`) | 위치 prop이 없으므로 `group`으로 감싼다 |
| `Sakura` / `SakuraBatch` | `size`(4), `toon` / `trees`(`SakuraTreeEntry[]`: `position`, `size`, `treeKind`, `blossomColor`, `barkColor`), `toon` | `treeKind`: `sakura`·`oak`·`pine`·`maple`·`birch`·`willow`·`cypress`·`dead` |
| `Sand` / `SandBatch`, `Snowfield` / `SnowfieldBatch` | `size`(4), `toon`, `color`, `accentColor` / `entries`, `toon` | 일반 재질이라 두 렌더러가 같다 |
| `Snow` | `gpu`, `followCamera`(false) | `gpu`: 노드 렌더러면 TSL, classic이면 GLSL 버텍스 셰이더. 아니면 CPU 입자(WASM 또는 JS) |
| `Billboard` | `text`, `imageUrl`, `width`, `height`, `scale`, `color`, `elevation`, `intensity`, `toon` | 글자는 캔버스 텍스처로 그린다 |

- 깃발 컴포넌트는 export되지 않는다. 깃발은 오브젝트 `type: 'flag'`(`config.flagWidth`·`flagHeight`·`flagStyle`·`flagTexture`)로 `BuildingController`가 그린다.
- 잔디·물·불·깃발·벚꽃·눈·날씨의 GLSL 경로는 PRD GPU-1에서 지운다.

```tsx
import { Billboard, Fire, Grass, GrassDriver, Sakura, Water } from 'gaesup-world/building';

export function Scenery() {
  return (
    <>
      <GrassDriver />
      <Grass position={[0, 0, 0]} width={8} density={60} />
      <group position={[12, 0, 0]}><Water size={8} /></group>
      <group position={[-6, 0, 4]}><Fire intensity={1.2} /></group>
      <group position={[6, 0, -6]}><Sakura size={4} /></group>
      <group position={[0, 0, -10]}><Billboard text="WELCOME" width={4} height={1.5} color="#00ff88" /></group>
    </>
  );
}
```

## GPU 인스턴싱: `GpuBatchBridge`

건축 타일·벽·벽 조각·블록은 재질별 `InstancedMesh` 배치로 그리며, 이름이 `building-batch:`로 시작한다. `GpuBatchBridge`(`src/core/rendering/GpuBatchBridge.tsx`, `gaesup-world/building` export)는 한 루트 아래의 이 배치를 GPU로 옮긴다.

- 각 인스턴스의 경계구를 카메라 절두체 6면과 compute로 비교해 보이는 것만 남기고 간접 draw로 그린다. 인스턴스 수·행렬·색 변경은 바뀐 것만 올린다.
- 원래 `InstancedMesh`는 그대로 둔다. 선택(picking), 물리, 그림자 pass는 원본을 쓰고, 메인 pass에서만 원본을 건너뛴다.
- 투명 재질, 노드 재질(자체 TSL 변형), 노멀·범프·변위 맵이 있는 재질은 제외하고 원래 경로로 그린다. 배치 생성이 실패해도 원본으로 그린다.
- 켜지는 조건은 `supportsGpuInstanceBatches(gl)`: `webgpu` 백엔드, three r185·r186, 렌더러 내부 속성 저장소. `BuildingController`가 이 조건을 보고 자동으로 올린다. 조건이 맞지 않으면 CPU 쪽 `BuildingVisibilityDriver`가 카메라 거리로 그릴 그룹을 고른다.
- 잔디, 벚꽃·나무, 깃발, 불, 간판은 대상이 아니다. 벚꽃·깃발·불·간판은 개수와 상관없이 종류마다 고정된 수의 draw로 그리는 자체 배치를, 잔디는 8×8 타일 청크마다 draw 하나를 쓴다. 모델 오브젝트(`type: 'model'`)는 오브젝트마다 그린다.

## 팁

- 잔디가 가장 비싸다. 잎 수는 대략 `grassDensity`(기본 90) × 타일 면적(4m 타일이면 16m²) × `instanceScale`이다. 타일의 `objectConfig.grassDensity`를 낮추는 것이 가장 효과가 크다. 수치는 [performance.md](performance.md)에 있다.
- 그림자 비용은 cascade 수와 맵 크기에 비례한다. `CascadedSun quality="low"`나 `shadowMapSize`로 줄이고, 그림자가 필요 없는 장식 메시는 `castShadow`를 끈다. 잔디는 가장 가까운 cascade에만 그림자를 넣는다.
- classic WebGL의 거울 물은 반사 장면을 한 번 더 그린다. 툰 모드나 WebGPU에서는 이 반사 pass가 없다.
- 후처리 `quality="performance"`는 TRAA와 AO를 끄고 bloom과 채도만 남긴다. AO는 `aoResolutionScale`로 해상도를 낮출 수 있다.
- `Canvas`의 기본 `dpr`는 `[1, 2]`다. `quality`를 주지 않으면 고해상도 화면에서 픽셀 비율 2로 그린다.

## 현재 제한

- WebGPU가 없으면 `WebGPURenderer`의 WebGL2 백엔드가 아니라 classic `WebGLRenderer`와 GLSL 경로로 그린다(GPU-1에서 바뀐다).
- `ColorGrade`·`LutOverlay`·`ToonOutlines`와 GLSL 재질 경로가 남아 있다(GPU-1).
- 해가 `CascadedSun`·`DynamicSky` 두 벌이다(UP-1). `DynamicSky`에는 cascade 그림자가 없다.
- 잔디 밀도는 월드 `quality`를 직접 따르지 않는다. 품질 tier별 잔디 밀도는 PRD PERF 항목이다.
- 깃발 컴포넌트는 export되지 않는다.
- GPU 시간(timestamp query)을 재는 곳이 없다(PERF).

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [performance.md](performance.md)
- [building.md](building.md) · [character-camera-input.md](character-camera-input.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/trends-2026.md](../dev/trends-2026.md) · [../../PRD.md](../../PRD.md)
