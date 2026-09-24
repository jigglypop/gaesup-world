import { BoxGeometry, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial } from 'three';

import { readRendererStats } from 'gaesup-world';

import { mountScene } from './scene';
import { checkAbort, UnsupportedScenario, type Scenario, type ScenarioContext } from './types';

function instances(ctx: ScenarioContext) {
  const geometry = new BoxGeometry(0.6, 1, 0.6);
  const material = new MeshStandardMaterial({ color: '#8b4513', roughness: 0.8 });
  const source = new InstancedMesh(geometry, material, ctx.config.count);
  source.name = 'building-batch:lab:primary';
  source.frustumCulled = false;
  const matrix = new Matrix4();
  const width = Math.ceil(Math.sqrt(ctx.config.count));
  let seed = ctx.config.seed >>> 0;
  for (let i = 0; i < ctx.config.count; i++) {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    matrix.makeScale(1, 0.5 + (seed / 0x100000000) * 2, 1);
    matrix.setPosition((i % width - width / 2) * 0.9, 0, (Math.floor(i / width) - width / 2) * 0.9);
    source.setMatrixAt(i, matrix);
  }
  source.instanceMatrix.needsUpdate = true;
  return { source, material, dispose: () => { source.dispose(); geometry.dispose(); material.dispose(); } };
}

async function waitForGpuBatch(view: Awaited<ReturnType<typeof mountScene>>, sourceName: string): Promise<Mesh | undefined> {
  let gpu: Mesh | undefined;
  for (let i = 0; i < 180 && !gpu; i++) {
    await view.frame();
    gpu = view.state.scene.getObjectByName(`gpu-resident:${sourceName}:0`) as Mesh | undefined;
  }
  return gpu;
}

async function metrics(ctx: ScenarioContext, batch = false) {
  const objects = instances(ctx);
  const view = await mountScene(ctx, [objects.source], batch);
  const longTasks: PerformanceEntry[] = [];
  const observer = typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes.includes('longtask')
    ? new PerformanceObserver((list) => longTasks.push(...list.getEntries())) : null;
  let measuredAt = Number.POSITIVE_INFINITY;
  try {
    if (batch && !(await waitForGpuBatch(view, objects.source.name))) throw new UnsupportedScenario('현재 backend/Three 버전에서 GPU instance batch가 활성화되지 않았습니다.');
    observer?.observe({ entryTypes: ['longtask'] });
    const untilWarm = performance.now() + ctx.config.warmupMs;
    ctx.progress('셰이더·장면 warmup');
    while (performance.now() < untilWarm) { checkAbort(ctx.signal); await view.frame(); }
    measuredAt = performance.now();
    let frames = 0; let overBudget = 0; let lastProgress = measuredAt;
    while (performance.now() - measuredAt < ctx.config.durationMs) {
      const frame = await view.frame();
      frames++;
      if (frame.intervalMs > 1000 / 60) overBudget++;
      ctx.sample('frame-interval', frame.intervalMs, 'ms', 'foreground-frame');
      ctx.sample('render-submit', frame.submitMs, 'ms', 'cpu-render-call');
      ctx.sample('draw-calls', frame.stats.drawCalls, 'count', 'all-passes-since-frame-reset');
      ctx.sample('triangles', frame.stats.triangles, 'count', 'all-passes-since-frame-reset');
      if (frame.stats.renderInvocations !== null) ctx.sample('render-invocations', frame.stats.renderInvocations, 'count', 'all-passes-since-frame-reset');
      if (performance.now() - lastProgress > 1000) {
        lastProgress = performance.now();
        ctx.progress(`측정 ${((lastProgress - measuredAt) / 1000).toFixed(0)} / ${ctx.config.durationMs / 1000}초 · ${frames}프레임`);
      }
    }
    const info = view.state.gl.info;
    const stats = readRendererStats(info);
    // Count actual public render-object callbacks, including the common renderer's
    // fullscreen output pass. WebGL's fixture consists of one instanced draw.
    if (batch) {
      ctx.assert('gpu-batch-active', true, !!view.state.scene.getObjectByName(`gpu-resident:${objects.source.name}:0`));
    } else {
      const reference = view.referenceCounts() ?? { draws: 1, triangles: ctx.config.count * 12 };
      ctx.assert('draw-calls-reference', reference.draws, stats.drawCalls);
      ctx.assert('triangles-reference', reference.triangles, stats.triangles);
    }
    ctx.assert('samples-collected', true, frames > 0);
    ctx.sample('geometries', stats.geometries, 'count', 'end-of-measurement');
    ctx.sample('textures', stats.textures, 'count', 'end-of-measurement');
    ctx.sample('programs', stats.programs, 'count', 'end-of-measurement');
    ctx.sample('frames-over-16.67ms', overBudget, 'count', 'measurement-window');
    if (stats.allocatedBytesEstimate !== null) ctx.sample('renderer-bytes-estimate', stats.allocatedBytesEstimate, 'bytes', 'renderer-accounted-not-vram');
    else ctx.unavailable('renderer-bytes-estimate', 'bytes', 'renderer-accounted-not-vram', '이 renderer는 allocation byte 통계를 제공하지 않음');
    const measuredUntil = performance.now();
    const gpuTiming = await view.gpuTiming();
    if (gpuTiming.supported && !gpuTiming.error) {
      const samples = gpuTiming.samples.filter((sample) => sample.at >= measuredAt && sample.at <= measuredUntil);
      for (const sample of samples) ctx.sample('gpu-render-time', sample.ms, 'ms', 'gpu-last-resolved-frame-all-render-passes');
      ctx.assert('gpu-timestamps-collected', true, samples.length > 0);
    } else ctx.unavailable('gpu-render-time', 'ms', 'gpu-last-resolved-frame-all-render-passes', gpuTiming.error ?? '현재 backend/device에서 timestamp-query 미지원');
    if (observer) {
      longTasks.push(...observer.takeRecords());
      ctx.sample('long-tasks', longTasks.filter((task) => task.startTime >= measuredAt).length, 'count', 'measurement-window');
    } else ctx.unavailable('long-tasks', 'count', 'measurement-window', 'Long Task API 미지원');
  } finally { observer?.disconnect(); view.dispose(); objects.dispose(); }
}

async function gpuMaterial(ctx: ScenarioContext) {
  const objects = instances(ctx);
  const view = await mountScene(ctx, [objects.source], true);
  try {
    const gpu = await waitForGpuBatch(view, objects.source.name);
    if (!gpu) throw new UnsupportedScenario('현재 backend/Three 버전에서 GPU instance batch가 활성화되지 않았습니다.');
    objects.material.color.set('#00ff00');
    objects.material.roughness = 0.25;
    objects.material.opacity = 0.6;
    for (let i = 0; i < 4; i++) await view.frame();
    const material = gpu.material as MeshStandardMaterial;
    ctx.assert('color-sync', objects.material.color.getHexString(), material.color.getHexString());
    ctx.assert('roughness-sync', objects.material.roughness, material.roughness);
    ctx.assert('opacity-sync', objects.material.opacity, material.opacity);
    ctx.assert('batch-reused-for-uniforms', true, gpu === view.state.scene.getObjectByName(gpu.name));
    ctx.sample('material-mismatches', Number(objects.material.color.getHex() !== material.color.getHex()) + Number(objects.material.roughness !== material.roughness) + Number(objects.material.opacity !== material.opacity), 'count', 'in-place-material-edit');
    ctx.sample('source-material-version', objects.material.version, 'count', 'after-uniform-edit');
    objects.material.transparent = true;
    for (let i = 0; i < 4; i++) await view.frame();
    ctx.assert('transparent-original-path', true, !view.state.scene.getObjectByName(gpu.name));
    objects.material.transparent = false;
    let rebuilt: Mesh | undefined;
    for (let i = 0; i < 180 && !rebuilt; i++) {
      await view.frame();
      rebuilt = view.state.scene.getObjectByName(gpu.name) as Mesh | undefined;
    }
    ctx.assert('opaque-batch-restored', true, !!rebuilt);
  } finally { view.dispose(); objects.dispose(); }
}

export const renderingScenarios: Scenario[] = [
  { id: 'metrics', title: '렌더러 계측', description: '고정된 인스턴스 장면을 렌더링하며 실제 카운터와 프레임 표본을 기록합니다.', version: 2, requirementIds: ['R14'], timed: true, run: (ctx) => metrics(ctx) },
  { id: 'metrics-gpu-batch', title: '렌더러 계측 (GPU batch)', description: '같은 인스턴스 장면을 GpuBatchBridge로 렌더링해 metrics와 프레임·GPU 시간을 비교합니다.', version: 1, requirementIds: ['R14'], timed: true, run: (ctx) => metrics(ctx, true) },
  { id: 'gpu-material', title: 'GPU 재질 변경', description: '색·roughness·opacity 편집과 투명 재질 전환을 실제 GpuBatchBridge로 검사합니다.', version: 2, requirementIds: ['R06'], run: gpuMaterial },
];
