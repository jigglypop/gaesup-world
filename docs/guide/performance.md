# 성능

월드의 비용을 재고 줄이는 방법을 다룬다. 엔진이 월드 store에 넣는 성능 값, `readRendererStats`, `PerformancePanel`, `runtime.stats`로 재는 법, 품질 tier와 `IdleFrameRate`로 줄이는 법, 후처리·잔디·그림자·인스턴싱의 비용, 번들 크기, 저장소가 잰 기준선과 아직 없는 도구까지다. 프레임 시간과 번들 크기를 다루는 개발자를 위한 문서다. 이름과 기본값은 현재 작업 트리의 소스에서 확인했고, 수치는 출처와 시점을 함께 적었다.

## 측정 원칙

- 같은 장면·장치·브라우저에서 전후를 잰다. 프레임 p50/p95, long task, draw 수를 함께 남기고, CPU 미세 측정만으로 FPS가 좋아졌다고 말하지 않는다(PRD PERF 완료 기준).
- rAF 간격(fps)은 vsync에 묶여 CPU 여유를 보여 주지 않는다. CPU 부담은 스크립트·태스크 시간으로, 렌더 부담은 draw·삼각형·프로그램 수로 본다. GPU 시간은 아직 잴 수 없다.
- 개발 서버 수치는 번들되지 않은 모듈과 개발용 측정이 섞여 운영과 다르다. 운영 수치는 production 빌드로 잰다.
- 브라우저 자동 측정(Playwright + CDP `Performance.getMetrics`), 소비자 번들·운영 라우트 크기 측정 절차는 [../dev/measurement.md](../dev/measurement.md)에 있다.

## 엔진이 모으는 값

### 월드 store의 `performance`와 `framePhases`

`GaesupWorldContent`가 올리는 `PerformanceCollector`(`src/core/perf/PerformanceCollector.tsx`, 공개 export 아님)가 채운다.

- 켜지는 조건: `GaesupWorldContent`의 `performance` prop, 없으면 production이 아닐 때 켜짐. 누군가 `retainPerformanceSampling()`을 잡고 있으면 production에서도 켜진다.
- `snapshot` 단계에서 0.25초마다(최대 4Hz) 샘플을 예약하고, 그 프레임이 그려진 뒤 렌더러 통계를 읽는다. WebGPU는 프레임 콜백 전에 카운터를 비우므로 렌더 뒤에 읽어야 한다.
- `performance`는 값이 바뀌었을 때만 갱신하고, `framePhases`는 샘플마다 새 객체로 갱신한다.

| 경로 | 뜻 |
|---|---|
| `performance.render.calls` | draw call 수. `counterScope`가 `renderer-frame`(WebGPU 렌더러)이면 프레임 전체, `last-render`(classic WebGL)이면 마지막 `render()` 호출 하나의 값이다 |
| `performance.render.renderInvocations` | 프레임 안 `render()` 호출 수. classic WebGL은 `null` |
| `performance.render.triangles`, `points`, `lines` | 같은 범위의 기본 도형 수 |
| `performance.engine.geometries`, `textures`, `programs` | 살아 있는 geometry, texture, 셰이더 프로그램 수 |
| `performance.engine.allocatedBytesEstimate` | 렌더러가 센 할당량 추정. GPU 메모리 사용량이 아니다 |
| `framePhases` | `FRAME_PHASES` 단계별 프레임당 평균 CPU ms(샘플 창 0.25초). 단계 시간 측정은 production이 아닐 때만 켜지므로 production에서는 계속 `null`이다 |

```tsx
import { useEffect } from 'react';

import { useGaesupStore } from 'gaesup-world';

export function PerfHud() {
  const calls = useGaesupStore((state) => state.performance.render.calls);
  const triangles = useGaesupStore((state) => state.performance.render.triangles);
  const phases = useGaesupStore((state) => state.framePhases);
  const retain = useGaesupStore((state) => state.retainPerformanceSampling);
  useEffect(() => retain(), [retain]); // 이 HUD가 떠 있는 동안 production에서도 샘플링한다
  const scriptMs = phases ? phases.input + phases.script + phases.prePhysics + phases.postPhysics : null;
  return (
    <div style={{ position: 'fixed', top: 8, left: 8 }}>
      draw {calls} · tris {(triangles / 1e6).toFixed(2)}M{scriptMs !== null && ` · ${scriptMs.toFixed(2)}ms`}
    </div>
  );
}
```

`GaesupWorld` 아래(캔버스 옆 DOM)에 둔다. 런타임을 쓰는 월드면 그 월드의 값을 읽는다.

### `readRendererStats(info)`

렌더러의 `info`를 엔진 공통 모양(`RendererStats`)으로 바꾼다(`src/core/perf/rendererStats.ts`). 카운터를 비우지 않고 렌더 루프도 건드리지 않는다. 결과: `counterModel`(`common`·`webgl`), `counterScope`, `drawCalls`, `renderInvocations`, `triangles`, `points`, `lines`, `geometries`, `textures`, `programs`, `allocatedBytesEstimate`.

WebGPU 렌더러는 프레임 시작에 카운터를 비우므로 R3F의 `addAfterEffect`처럼 렌더가 끝난 뒤에 읽는다.

```tsx
import { useEffect } from 'react';

import { addAfterEffect, useThree } from '@react-three/fiber';
import { readRendererStats } from 'gaesup-world';

export function StatsProbe({ onSample }: { onSample: (drawCalls: number, triangles: number) => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => addAfterEffect(() => {
    const stats = readRendererStats(gl.info);
    onSample(stats.drawCalls, stats.triangles);
  }), [gl, onSample]);
  return null;
}
```

`addAfterEffect`는 매 프레임 불리므로 무거운 처리는 직접 솎아 낸다. 월드 store 값으로 충분하면 그것을 쓴다.

### `PerformancePanel`

에디터 패널이다(루트와 `gaesup-world/editor` export, `src/core/editor/components/panels/PerformancePanel.tsx`). 브라우저 FPS(평균·최소·최대·하위 1%), 프레임 간격, 엔진 프레임 단계, draw·삼각형·호출당 삼각형, geometry·texture·프로그램 수, JS 힙(`performance.memory`가 있는 브라우저만)을 보여 준다.

- `GaesupWorld` 아래, 캔버스 바깥 DOM에 둔다. 스타일은 `import 'gaesup-world/style.css'`.
- 떠 있는 동안 `retainPerformanceSampling()`을 잡으므로 production에서도 draw·삼각형이 갱신된다. 단계 시간은 production에서 비어 있다.
- FPS와 프레임 간격은 패널이 자체 `requestAnimationFrame`으로 잰 브라우저 값이다. 캔버스가 실제로 그린 프레임 수가 아니다(`IdleFrameRate`로 그리기를 줄여도 여기 FPS는 그대로다).

```tsx
<GaesupWorld urls={{ characterUrl: '/gltf/trainer_green.glb' }}>
  <Canvas shadows="percentage" gl={createRenderer}>...</Canvas>
  <PerformancePanel style={{ position: 'fixed', right: 8, top: 8, width: 280 }} />
</GaesupWorld>
```

### `runtime.stats`

런타임의 정수 카운터다(`EngineStats`, `src/core/kernel/stats.ts`). `snapshot()`은 `frames`(캔버스 스케줄러가 돈 프레임 수), `fixedTicks`(고정 스텝 틱 수), `clockSystems`(지금 시계에 등록된 시스템 수)를 돌려준다. `frames`와 `fixedTicks`는 마지막 `reset()` 이후 증가분이다.

```ts
import type { GaesupRuntime } from 'gaesup-world';

export async function measureWindow(runtime: GaesupRuntime, ms: number) {
  runtime.stats.reset();
  await new Promise((resolve) => setTimeout(resolve, ms));
  const { frames = 0, fixedTicks = 0 } = runtime.stats.snapshot();
  return { drawnFps: (frames * 1000) / ms, fixedTicksPerSecond: (fixedTicks * 1000) / ms };
}
```

`frames`는 캔버스가 실제로 돈 프레임이라 `IdleFrameRate`의 효과가 보인다(`GaesupWorldContent`가 없으면 `frames`가 없다). 고정 틱은 초당 60이 정상이다. 모자라면 런타임이 비활성이거나, 시계를 쓰는 소비자(`WorldPhysics`, NPC)가 없거나, 프레임이 너무 길어 밀린 시간을 버리고 있는 것이다([world-runtime.md](world-runtime.md)).

### 개발과 production의 차이

`NODE_ENV`는 소비자 번들러가 정한다. 라이브러리 빌드는 `process.env.NODE_ENV` 식을 그대로 두고, 번들러가 치환하지 않아 `process`가 없으면 개발 동작이 된다(`src/core/utils/env.ts`).

| 항목 | 개발 | production |
|---|---|---|
| 렌더러 통계 수집 | 기본 켜짐 | `performance` prop이나 `retainPerformanceSampling()`이 있을 때만 |
| `framePhases`(단계별 시간 측정) | 채워진다 | 항상 `null` |
| legacy store 경고, 중복 스케줄러 호스트 경고, 엔진 `logger` | 나온다 | 없다 |
| 엔진 오류 보고(프레임·시계 콜백 예외) | `console.error` 또는 `onError` | 같다 |

## 품질 tier로 줄이기

`GaesupWorldContent quality="auto"`가 기기를 감지해 tier를 고른다. 감지 규칙과 profile 값 전체는 [rendering.md](rendering.md)에 있다. 비용과 관련된 차이만 추리면 다음과 같다.

| tier | 픽셀 비율 | 그림자(`CascadedSun`) | 후처리 | 잔디 잎 배율 |
|---|---|---|---|---|
| `high` | 1.5(상한) | 4 cascade, 2048 | `quality`(TRAA, AO 16샘플 전해상도) | 1.0 |
| `medium` | 1.5 | 3 cascade, 1024 | `balanced`(TRAA, AO 8샘플 반해상도) | 0.7 |
| `low` | 1.0 | 2 cascade, 512 | 끔 | 0.4 |

- `<Canvas dpr={resolveQualityDpr('auto')}>`로 첫 프레임부터 맞는 크기로 그린다.
- 실행 중에 낮추려면 `usePerfStore.getState().setTier('low')`, 다시 감지하려면 `resetAuto()`를 부른다. `quality="auto"`인 월드와 잔디가 따른다. `usePerfStore`는 페이지 전역이다.
- tier를 `quality="low"`처럼 고정하면 월드 profile은 바뀌지만 잔디는 전역 `usePerfStore`를 읽는다. 잔디까지 줄이려면 `setTier`도 함께 부른다.
- 엔진은 느린 프레임을 보고 tier를 스스로 내리지 않는다. 필요하면 `runtime.stats`나 월드 store 값으로 판단해 `setTier`를 부른다.

## 입력이 없을 때 fps 낮추기: `IdleFrameRate`

기본 설정의 캔버스는 입력이 없어도 매 프레임 그린다. 저장소 기준 측정에서 작은 마을은 유휴 상태에서도 CPU 약 15%를 쓴다. `IdleFrameRate`(`src/core/perf/idle.tsx`, 루트 export)는 입력이 있는 동안 매 프레임 그리고, 입력이 끊기면 낮은 fps로 그린다.

```tsx
<Canvas shadows="percentage" gl={createRenderer}>
  <IdleFrameRate fps={30} after={2} />
  <GaesupWorldContent quality="auto">...</GaesupWorldContent>
</Canvas>
```

| prop | 기본값 | 뜻 |
|---|---|---|
| `fps` | 30 | 유휴 상태의 초당 최대 그리기 횟수 |
| `after` | 2 | 이 시간(초) 동안 입력이 없으면 유휴로 본다 |

- `Canvas` 안 어디에나 한 번 둔다. 마운트할 때 캔버스 `frameloop`가 `always`면 `never`로 바꾸고 자기 `requestAnimationFrame`에서 R3F `advance`로 직접 그린다. 캔버스 시계는 이어진다. 내려가면 `always`로 되돌린다. 처음부터 `frameloop`가 `always`가 아니면 아무것도 하지 않는다.
- 캔버스를 직접 모는 방식이라, 잠들지 않는 물리 몸체처럼 다른 곳에서 오는 프레임 요청이 유휴 캔버스를 다시 최고 fps로 돌리지 못한다.
- 시뮬레이션은 계속 60Hz다. `frameloop`가 `always`가 아니면 `WorldPhysics`가 캔버스 대신 시계 자체의 rAF로 고정 틱을 돌린다. 물리·NPC·게임 시간은 정상 속도로 가고, 화면만 낮은 fps로 갱신된다.
- 활동으로 치는 입력: `window`의 `pointerdown`, `pointermove`, `wheel`, `keydown`, `keyup`, `touchstart`, `touchmove`. 게임패드 입력과 화면 속 움직임(NPC, 애니메이션, 입자)은 활동이 아니다. 게임패드로만 조작하거나 움직임이 중요한 화면에서는 끊겨 보인다.
- 60Hz 화면에서 `fps={30}`은 정확히 한 프레임 걸러 그린다(간격 판정에 10% 여유를 둔다).
- 아직 월드에 기본 장착되지 않는다(PRD PERF).

직접 만든 루프에는 같은 판정기 `createIdleFrameGate({ fps, afterMs })`를 쓴다. `activity(time)`으로 입력 시각을 알리고, 매 프레임 `shouldDraw(time)`이 true일 때만 그린다(시각은 ms).

```ts
import { createIdleFrameGate } from 'gaesup-world';

export function customLoop(draw: (time: number) => void) {
  const gate = createIdleFrameGate({ fps: 20, afterMs: 3000 });
  const wake = () => gate.activity(performance.now());
  window.addEventListener('pointermove', wake, { passive: true });
  let handle = requestAnimationFrame(function frame(time) {
    handle = requestAnimationFrame(frame);
    if (gate.shouldDraw(time)) draw(time);
  });
  return () => {
    cancelAnimationFrame(handle);
    window.removeEventListener('pointermove', wake);
  };
}
```

## 비용이 큰 것

### 후처리

- `GaesupWorldContent postProcessing`을 켠 월드만 후처리 청크를 lazy로 내려받는다. 끈 월드는 다운로드 비용도 없다. `low` tier는 켜도 올리지 않는다.
- preset별 차이(`WorldPostProcessing`):

| preset | TRAA | GTAO | AO 샘플 | AO 해상도 | bloom·채도 | 장면 pass 추가 출력 |
|---|---|---|---|---|---|---|
| `performance` | 끔 | 끔 | | | 켬 | 없음 |
| `balanced` | 켬 | 켬 | 8 | 0.5 | 켬 | velocity, normal(MRT, MSAA 끔) |
| `quality` | 켬 | 켬 | 16 | 1.0 | 켬 | velocity, normal(MRT, MSAA 끔) |

- 비용은 픽셀 수에 비례하므로 픽셀 비율 상한(1.5)이 함께 효과를 낸다. AO만 줄이려면 `aoResolutionScale`·`aoSamples`를 낮춘다.
- MRT를 쓰는 preset에서는 `CompileGate`가 파이프라인을 미리 만들지 못해 새 콘텐츠가 처음 그려지는 프레임에 멈출 수 있다([rendering.md](rendering.md)).
- classic WebGL 경로는 `@react-three/postprocessing`의 `EffectComposer`(외곽선 + 색보정)를 쓴다.

### 잔디와 삼각형

잔디가 삼각형의 대부분을 만든다.

- 잎 수 ≈ `grassDensity`(m²당, 기본 90) × 잔디 타일 면적 × `instanceScale`(tier 배율). 4m 타일 하나는 16m²라 기본 밀도에서 잎 1,440개(배율 1)다.
- 잎 하나는 삼각형 10개다(`options.joints` 기본 5단 × 2).
- 예제 마을은 144칸 중 96칸이 잔디다. 배율 1이면 잎 138,240개이고, 모두 화면에 들어오고 거리 LOD로 줄기 전이면 메인 pass에서 삼각형 약 138만 개다. 그림자 pass가 가장 가까운 cascade에서 잔디를 한 번 더 그린다. 저장소 측정의 프레임 전체 삼각형은 230만 개였다.
- 잔디 타일은 8×8 타일 청크로 묶여 청크마다 draw 하나이고, 청크 단위로 거리 LOD와 절두체 컬링을 한다(`GrassDriver`).
- 줄이는 순서: 타일의 `objectConfig.grassDensity`를 낮춘다 → tier를 낮춘다(`setTier`) → 잔디 타일 수를 줄인다.

### 그림자

- `CascadedSun` 비용은 cascade 수와 맵 크기에 비례한다. `quality`, `cascades`, `shadowMapSize`로 줄이고, 필요 없으면 `castShadow={false}`.
- 장식 메시는 `castShadow`를 끈다. 잔디는 가장 가까운 cascade에만 그림자를 넣는다.
- `DynamicSky`는 카메라를 따라가는 단일 그림자 맵 하나다.

### 인스턴싱과 draw 수

- 건축 타일·벽·블록은 재질별 `InstancedMesh` 배치로 그린다. WebGPU 백엔드에서는 `GpuBatchBridge`가 이 배치를 compute로 컬링하고 간접 draw로 그린다. 그 밖의 렌더러에서는 `BuildingVisibilityDriver`가 카메라 거리로 그릴 그룹을 고른다.
- 벚꽃·나무, 깃발, 불, 간판은 개수와 상관없이 종류마다 고정된 수의 draw로 그린다. 모델 오브젝트(`type: 'model'`)는 오브젝트마다 draw가 늘어난다.
- NPC는 카메라에서 120m(보이던 NPC는 135m)보다 멀면 화면에서 내린다. 시뮬레이션은 거리와 상관없이 모든 NPC를 돌린다.
- 저장소 측정에서 작은 마을은 draw 81(`render()` 호출 6)이었다.

## 번들 크기

- 라이브러리 빌드가 모듈을 큰 청크로 합쳐 트리셰이킹이 약하다. 함수 하나만 가져와도 수백 KB가 딸려 온다. 루트 진입점은 값 export가 952개이고 에디터도 다시 내보낸다(PRD LIB-1이 `preserveModules` 빌드와 에디터 분리를 한다).
- 지금 할 수 있는 것: 월드 화면을 `React.lazy`로 늦게 불러 첫 UI 청크에서 three와 엔진을 뺀다(예제 `examples/main.tsx` 방식). 후처리는 켜기 전까지 내려받지 않는다.

## 기준선

출처: [../dev/measurement.md](../dev/measurement.md), 루트 `PRD.md`. 모두 2026-09-27 저장소 측정이다.

| 측정 | 값 | 시점 |
|---|---|---|
| 작은 마을(12×12 타일, NPC 2, 플레이어 1), WebGPU, dev 서버 | 60fps(vsync), 스크립트 2.34ms/프레임, 태스크 2.57ms, CPU 15%(유휴에도 매 프레임 그림), draw 81(`render()` 호출 6), 삼각형 230만(대부분 잔디), 프로그램 135 | P0 전 |
| 같은 장면, `navigator.gpu` 제거(지금은 classic `WebGLRenderer` 경로) | 스크립트 2.11ms, draw 55, 삼각형 226만, 프로그램 46 | P0 전 |
| 엔진 프레임 단계 합(`framePhases`) | 0.43ms | P0 전 |
| 런타임 create / setup / dispose | 0.4 / 0.2 / 0.2ms | P0 전 |
| 소비자 번들(피어 제외): `createSceneDocument` 하나 | 712KB min, 217KB gz | DEL-1 전 |
| 소비자 번들: 최소 월드 6개 이름 | 848KB min, 260KB gz | DEL-1 전 |
| 소비자 번들: 전체 `export *` | 1,495KB min, 451KB gz | DEL-1 전 |
| 운영 월드 라우트 정적 폐포 | 3,913KB min, 1,311KB gz | P0(후처리 lazy 로드 뒤) |

소비자 번들 수치는 생활 게임 도메인과 NPC 네트워크 등을 지우기(DEL-1, DEL-2) 전에 잰 값이다. 지금은 더 작을 수 있으니 비교가 필요하면 다시 잰다.

## 아직 없는 것

| 공백 | PRD |
|---|---|
| GPU 시간(timestamp query, `trackTimestamp`)을 재지 않는다 | PERF |
| 게임 화면용 성능 HUD가 없다. `PerformancePanel`은 에디터 패널이고 FPS를 자체 rAF로 따로 잰다 | PERF |
| `IdleFrameRate`가 기본 장착되지 않는다 | PERF |
| 잔디 밀도가 품질 tier(월드 `quality`)를 따르지 않는다 | PERF |
| 건물 편집 증분 갱신, 내비게이션 변경 영역만 갱신, NPC 비가시 시뮬레이션 예산, 장면 전체 순회 제거 | PERF |
| 트리셰이킹(`preserveModules`), 루트에서 에디터 분리 | LIB-1 |
| 업스케일(TAAU/FSR) 품질 tier | UP-1 |
| classic WebGL·GLSL 경로 제거 | GPU-1 |

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md)
- [building.md](building.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md) · [api-map.md](api-map.md)
- [../dev/measurement.md](../dev/measurement.md) · [../dev/architecture.md](../dev/architecture.md) · [../../PRD.md](../../PRD.md)
