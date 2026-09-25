import { createSceneDocument, createSceneDocumentController } from 'gaesup-world';

import { checkAbort, nextFrame, UnsupportedScenario, type Scenario, type ScenarioContext } from './types';
import { runMinihomeApiChecks } from '../../minihome/apiChecks';
import { createMinihome, makeFurniture } from '../../minihome/model';
import { mountMiniroom, type MiniroomEngine } from '../../minihome/room';
import { FURNITURE, type FurnitureKind } from '../../minihome/types';

export async function mountRoom(ctx: ScenarioContext, stress = false) {
  const initial = createMinihome().room;
  const kinds = Object.keys(FURNITURE) as FurnitureKind[];
  const count = ctx.config.count;
  if (stress && (!Number.isInteger(count) || count < 1 || count > 1000)) throw new UnsupportedScenario('미니룸 부하 측정의 가구 수는 1~1,000개 정수입니다.');
  const document = stress ? createSceneDocument({ id: 'miniroom-benchmark', objects: Array.from({ length: count }, (_, i) => {
    const side = Math.ceil(Math.sqrt(count));
    const object = makeFurniture(kinds[i % kinds.length]!, (i % side / Math.max(1, side - 1) - 0.5) * 6, (Math.floor(i / side) / Math.max(1, side - 1) - 0.5) * 6, `bench-${i}`);
    object.transform.scale = [0.5, 0.5, 0.5];
    return object;
  }) }) : initial;
  const controller = createSceneDocumentController(document);
  const canvas = window.document.createElement('canvas');
  canvas.style.cssText = `width:${ctx.config.width}px;height:${ctx.config.height}px;max-width:100%;display:block;touch-action:none`;
  ctx.host.append(canvas);
  const abort = new AbortController();
  const cancel = () => abort.abort(); ctx.signal.addEventListener('abort', cancel, { once: true });
  let engine: Awaited<ReturnType<typeof mountMiniroom>> = null;
  try {
    checkAbort(ctx.signal);
    engine = await mountMiniroom(canvas, controller, () => {}, () => {}, abort.signal, { backend: ctx.config.backend === 'webgl' ? 'webgl' : 'auto', dpr: ctx.config.dpr });
    if (!engine) { checkAbort(ctx.signal); throw new Error('Miniroom did not initialize'); }
    const info = engine.diagnostics();
    ctx.environment({ backend: info.backend === 'WebGPU' ? 'webgpu' : 'webgl', adapter: info.adapter, gpuClass: info.adapter ? /swiftshader|llvmpipe|software/i.test(info.adapter) ? 'software' : 'hardware' : 'unknown' });
    if (ctx.config.backend === 'webgpu' && info.backend !== 'WebGPU') throw new UnsupportedScenario('이 브라우저에서 WebGPU 미니룸을 사용할 수 없습니다.');
    engine.update({ editing: true, selected: null, theme: 'peach', zoom: 1 });
    await engine.frame();
    return { engine, controller, dispose: () => { ctx.signal.removeEventListener('abort', cancel); abort.abort(); engine?.dispose(); canvas.remove(); } };
  } catch (error) { ctx.signal.removeEventListener('abort', cancel); abort.abort(); engine?.dispose(); canvas.remove(); throw error; }
}

/** Waits until the room's demand loop has nothing scheduled: scenery moves for a few seconds after activity. */
export async function settleRoom(engine: MiniroomEngine, signal: AbortSignal, timeoutMs = 15000) {
  const until = performance.now() + timeoutMs;
  while (engine.diagnostics().pendingFrame) {
    if (performance.now() > until) throw new Error('미니룸 프레임 루프가 멈추지 않습니다.');
    await nextFrame(signal);
  }
}

async function lifetime(ctx: ScenarioContext) {
  const view = await mountRoom(ctx);
  try {
    await settleRoom(view.engine, ctx.signal);
    const before = view.engine.diagnostics();
    for (let i = 0; i < 30; i++) await nextFrame(ctx.signal);
    const idle = view.engine.diagnostics();
    const idleCallbacks = idle.loopCallbacks - before.loopCallbacks;
    ctx.sample('miniroom-idle-callbacks', idleCallbacks, 'count', '30-display-frames-idle'); ctx.assert('miniroom-idle-callbacks', 0, idleCallbacks);
    ctx.sample('miniroom-idle-draws', idle.renderedFrames - before.renderedFrames, 'count', '30-display-frames-idle');
    ctx.assert('miniroom-idle-draws', 0, idle.renderedFrames - before.renderedFrames);
    const snapshot = view.controller.getSnapshot();
    const target = snapshot.objects.find(object => object.components.some(component => component.type === 'miniroom.furniture' && component.enabled !== false));
    if (!target) throw new Error('Miniroom visibility scenario requires a visible furniture object');
    const result = view.controller.dispatch({ type: 'scene-document.replace', document: { ...snapshot, objects: snapshot.objects.map(object => object.id === target.id ? { ...object, components: object.components.map(component => ({ ...component, enabled: false })) } : object) } });
    ctx.assert('miniroom-command-accepted', true, result.accepted); await view.engine.frame();
    const mismatch = Number(view.engine.diagnostics().visibleObjects !== before.visibleObjects - 1);
    ctx.sample('miniroom-hidden-object-mismatches', mismatch, 'count', 'actual-render-projection');
    ctx.assert('miniroom-hidden-object-mismatches', 0, mismatch);
    view.dispose(); const end = view.engine.diagnostics();
    for (let i = 0; i < 5; i++) await nextFrame(ctx.signal);
    ctx.assert('miniroom-disposed-callbacks', 0, view.engine.diagnostics().loopCallbacks - end.loopCallbacks);
  } finally { view.dispose(); }
}

async function rendering(ctx: ScenarioContext) {
  const view = await mountRoom(ctx, true);
  try {
    const warmup = performance.now() + ctx.config.warmupMs;
    ctx.progress('미니룸 셰이더·가구 warmup');
    while (performance.now() < warmup) { checkAbort(ctx.signal); await view.engine.frame(); }
    const started = performance.now(); let previous = started; let frames = 0;
    while (performance.now() - started < ctx.config.durationMs) {
      checkAbort(ctx.signal); const frame = await view.engine.frame();
      ctx.sample('frame-interval', frame.at - previous, 'ms', 'foreground-miniroom-forced-frames'); previous = frame.at;
      ctx.sample('render-submit', frame.submitMs, 'ms', 'cpu-miniroom-render-call');
      ctx.sample('draw-calls', frame.stats.drawCalls, 'count', 'all-passes-since-frame-reset');
      ctx.sample('triangles', frame.stats.triangles, 'count', 'all-passes-since-frame-reset'); frames++;
    }
    const info = view.engine.diagnostics();
    ctx.sample('miniroom-objects', info.objectCount, 'count', 'actual-scene');
    ctx.sample('geometries', info.frame!.stats.geometries, 'count', 'end-of-measurement');
    ctx.sample('textures', info.frame!.stats.textures, 'count', 'end-of-measurement');
    if (info.frame!.stats.allocatedBytesEstimate !== null) ctx.sample('renderer-bytes-estimate', info.frame!.stats.allocatedBytesEstimate, 'bytes', 'renderer-accounted-not-vram');
    else ctx.unavailable('renderer-bytes-estimate', 'bytes', 'renderer-accounted-not-vram', '이 렌더러는 할당 byte 통계를 제공하지 않음');
    ctx.unavailable('gpu-time', 'ms', 'gpu-render-pass', 'CPU 제출 시간과 GPU 시간은 구분합니다. 이 시나리오는 GPU timestamp를 수집하지 않습니다.');
    ctx.assert('miniroom-samples', true, frames > 0);
  } finally { view.dispose(); }
}

export const minihomeScenarios: Scenario[] = [
  { id: 'minihome-api', title: '미니홈피 API 기능 검사', description: '별도 fixture에서 미니홈피 이력과 공유의 실제 반환 상태를 검사합니다. 라이브러리 공개 API 계약은 패키지 테스트가 검사합니다.', version: 2, requirementIds: ['R25', 'R27', 'R29'], run: async ctx => {
    const results = await runMinihomeApiChecks(ctx.signal);
    for (const result of results) ctx.assert(result.id, 'passed', result.status);
    ctx.sample('miniroom-api-failures', results.filter(result => result.status === 'failed').length, 'count', 'isolated-public-api-fixtures');
    ctx.sample('miniroom-api-checks', results.length, 'count', 'isolated-public-api-fixtures');
    ctx.sample('miniroom-api-calls-covered', new Set(results.flatMap(result => result.apis)).size, 'count', 'named-entry-points-and-methods');
    for (const result of results) if (result.status === 'failed') throw new Error(`${result.title}: ${result.detail}`);
  } },
  { id: 'minihome-lifecycle', title: '미니룸 대기·표시·종료', description: '3D 타운의 실제 미니홈피 엔진에서 대기 프레임 루프, 컴포넌트 enabled 반영, 종료 후 작업을 검사합니다.', version: 3, requirementIds: ['R25', 'R26'], run: lifetime },
  { id: 'minihome-rendering', title: '미니룸 가구 부하·렌더링', description: '타일·가구 12종·Bloom을 포함한 미니룸에서 1~1,000개 가구, 고정 배치·DPR·크기로 제출 시간과 draw call을 측정합니다. 정식 비교는 10초 예열·30초 측정입니다.', version: 2, requirementIds: ['R05', 'R13'], timed: true, run: rendering },
];
