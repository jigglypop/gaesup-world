# 측정

성능과 번들 크기를 재는 방법과 기준선이다. 이 방법들은 일회성 스크립트로 잰 것이라 저장소에 스크립트가 없다. 다시 잴 때는 아래 핵심 코드로 세션 scratchpad에 스크립트를 만들고, 끝나면 지운다([workflow.md](workflow.md)). 상시 측정 도구(GPU 시간, 성능 HUD, 벤치마크 하네스)는 PRD PERF에서 만든다.

## 원칙

- 같은 장면·장치·브라우저에서 전후를 잰다. 백그라운드에서 `verify:full` 같은 무거운 작업이 돌 때는 프레임 수치를 재지 않는다.
- rAF 간격(fps)은 vsync에 묶여 CPU 여유를 보여 주지 않는다. CPU 부담은 CDP의 스크립트·태스크 시간으로, 렌더 부담은 draw·삼각형·프로그램 수로 본다. GPU 시간은 아직 잴 수 없다(PERF).
- dev 서버 수치(첫 렌더 시간, 전송량)는 번들되지 않은 모듈이라 운영과 다르다. 운영 크기는 빌드 산출물로 잰다.

## 1. 브라우저 런타임 측정

`scripts/lib/devServer.cjs`의 `startProbeServer()`(Vite dev 서버를 빈 포트에 띄운다)와 `launchWebGpuBrowser()`(로컬 Chrome, `--enable-unsafe-webgpu --enable-gpu`)를 쓴다.

```js
const { startProbeServer, launchWebGpuBrowser, wait } = require('C:/dev/gaesup-world/scripts/lib/devServer.cjs');
const server = await startProbeServer();
const browser = await launchWebGpuBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
// WebGPU가 없는 경로를 재려면(지금은 classic WebGLRenderer, GPU-1 뒤에는 WebGPURenderer의 WebGL2 백엔드): await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
const cdp = await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
await page.goto(`${server.url}/`);
await wait(10000); // 로드와 셰이더 컴파일이 끝날 때까지
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const before = await metrics();
const frames = await page.evaluate(() => new Promise((resolve) => {
  let n = 0; const end = performance.now() + 5000;
  requestAnimationFrame(function tick(now) { n++; if (now < end) requestAnimationFrame(tick); else resolve(n); });
}));
const after = await metrics();
const scriptMsPerFrame = (after.ScriptDuration - before.ScriptDuration) * 1000 / frames;
const cpuBusyPct = 100 * (after.TaskDuration - before.TaskDuration) / (after.Timestamp - before.Timestamp);
```

**엔진 수치 읽기**: dev 서버에서는 페이지가 소스 모듈을 URL로 가져올 수 있고, 앱과 같은 모듈 인스턴스가 나온다. `GaesupWorld`만 쓰는 예제는 legacy 전역 store로 돌므로 그 store를 읽으면 된다.

```js
const stats = await page.evaluate(async () => {
  const { useGaesupStore } = await import('/src/core/stores/gaesupStore.ts');
  const state = useGaesupStore.getState();
  return { render: state.performance.render, engine: state.performance.engine, phases: state.framePhases };
});
```

`performance`는 `PerformanceCollector`가 초당 4번 넣는 draw·삼각형·프로그램 수, `framePhases`는 프레임 단계별 평균 CPU ms다(개발 모드에서만 켜진다).

**런타임 생성 비용**: 같은 방법으로 `/src/core/runtime/createGaesupRuntime.ts`를 가져와 `createGaesupRuntime()`, `setup()`, `dispose()`를 몇 번 재고 중앙값을 쓴다.

**콘솔 오류 수집**: `page.on('console')`, `page.on('pageerror')`로 모아 개수를 센다. 카메라 붕괴처럼 화면으로 드러나는 버그는 스크린샷의 하늘색 픽셀 비율(`pngjs`)로 여러 번 돌려 판정했다.

## 2. 소비자 번들 비용

`pnpm run build`로 만든 `dist`에 대해, import 모양별 가상 진입 파일을 Vite `build` API(rolldown)로 묶는다. 피어 의존성은 external로 빼서 라이브러리 코드만 잰다.

```js
import { build } from 'file:///C:/dev/gaesup-world/node_modules/vite/dist/node/index.js';
const PEERS = [/^react($|\/)/, /^react-dom($|\/)/, /^three($|\/)/, /^three-stdlib/, /^@react-three\//, /^@dimforge\//];
const output = await build({
  configFile: false, logLevel: 'silent', root: 'C:/dev/gaesup-world',
  resolve: { alias: [{ find: /^gaesup-world$/, replacement: 'C:/dev/gaesup-world/dist/index.js' }] },
  plugins: [{ name: 'entry', resolveId: (id) => (id === 'entry' ? '\0entry' : null),
    load: (id) => (id === '\0entry' ? "export { createSceneDocument } from 'gaesup-world';" : null) }],
  build: { write: false, minify: true, rollupOptions: {
    input: 'entry', preserveEntrySignatures: 'strict', external: (id) => PEERS.some((p) => p.test(id)) } },
});
// 엔트리 청크와 그 정적 import(chunk.imports)를 따라가며 크기와 gzip 크기를 더한다.
```

함정:
- 앱 빌드 모드는 엔트리의 export를 버린다. `preserveEntrySignatures: 'strict'`가 없으면 0KB가 나온다.
- 엔트리 청크만 세면 정적 import로 떨어진 공유 청크가 빠진다. `chunk.imports`를 따라 폐포를 더한다.
- Windows 절대 경로는 ESM import에 `file:///`로 쓴다.

## 3. 운영 라우트 크기

`vite build --outDir <임시> --manifest`로 예제를 빌드하고, sourcemap의 `sources`에 `examples/minihome/Minihome.tsx`가 있는 청크를 찾아 그 정적 import 폐포의 크기를 더한다. `scripts/verify-demo-surface-chunk.cjs`가 같은 방식으로 라우트를 찾는다.

## 기준선

| 측정 | 값 | 시점 |
|---|---|---|
| 작은 마을(12×12 타일, NPC 2, 플레이어 1), WebGPU, dev | 60fps(vsync), 스크립트 2.34ms/프레임, 태스크 2.57ms, CPU 15%, draw 81(렌더 호출 6), 삼각형 230만, 프로그램 135, 힙 81MB, 첫 렌더 6.9s | 2026-09-27, P0 전 |
| 같은 장면, `navigator.gpu` 제거(classic `WebGLRenderer` 경로) | 스크립트 2.11ms, draw 55, 삼각형 226만, 프로그램 46, 첫 렌더 3.3s | 같음 |
| 엔진 프레임 단계 합(`framePhases`) | 0.43ms | 같음 |
| 런타임 create / setup / dispose | 0.4 / 0.2 / 0.2ms | 같음 |
| 소비자 번들: `createSceneDocument` 하나 | 712KB min, 217KB gz | DEL-1 전 |
| 소비자 번들: `GaesupWorld` 하나 | 57KB, 16KB gz | DEL-1 전 |
| 소비자 번들: 최소 월드 6개 이름 | 848KB, 260KB gz | DEL-1 전 |
| 소비자 번들: 전체 `export *` | 1,495KB, 451KB gz | DEL-1 전 |
| 운영 월드 라우트 정적 폐포 | 4,016 → 3,913KB min, 1,338 → 1,311KB gz(후처리 lazy 로드) | P0 |

유휴 상태에서도 CPU 15%를 쓰는 것은 입력이 없어도 매 프레임 그리기 때문이다(`IdleFrameRate`가 기본 장착되지 않는다). 삼각형 대부분은 잔디다.

## 관련 문서

- [../guide/performance.md](../guide/performance.md) · [verification.md](verification.md) · [workflow.md](workflow.md) · [module-status.md](module-status.md)
- [../../PRD.md](../../PRD.md)
