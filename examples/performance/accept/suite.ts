import { createElement } from 'react';

import type { RootState } from '@react-three/fiber';
import { createRoot } from 'react-dom/client';
import { AnimationMixer, BufferGeometry, Frustum, Matrix4, Sphere, Vector3, type Object3D } from 'three';

import { resolveQualityDpr, useNPCStore, usePerfStore } from 'gaesup-world';
import { useBuildingStore } from 'gaesup-world/building';

import { instrumented, pageCounters } from './counters';
import { trackRenderer } from './instrument';
import { checkBudget, scenarios as entries, verdict, violations, type Metrics, type ScenarioStatus, type Verdict } from '../../../test/accept/budget';
import { createTerrain, paintTiles } from '../../minihome/terrain';
import { PerfWorldScene, REMOTE_UPDATE_HZ, type PerfWorldSceneProps } from '../../world/PerfWorld';
import type { LabRun } from '../model';
import { mountRoom, settleRoom } from '../scenarios/minihome';
import { nextFrame, UnsupportedScenario, type Scenario, type ScenarioContext } from '../scenarios/types';

declare global {
  /** `pnpm accept` exposes this to screenshot the live scene once a scenario has measured. */
  interface Window { __acceptCapture?: (id: string) => Promise<void> }
}

/**
 * Records the metrics and one assertion per budget line of test/accept/budgets.json (null lines are record-only),
 * then lets the runner capture the scene before it is disposed.
 */
async function judge(ctx: ScenarioContext, id: string, metrics: Metrics): Promise<void> {
  for (const [name, value] of Object.entries(metrics)) ctx.sample(name, Number(value), /Bytes/.test(name) ? 'bytes' : 'count', 'accept');
  for (const { name, limit, value, pass } of checkBudget(metrics, entries[id]!.budget)) {
    ctx.assert(name, limit === null ? '기록' : typeof limit === 'boolean' ? limit : `≤ ${limit}`, value ?? '미측정', pass);
  }
  await window.__acceptCapture?.(id);
}

/** Shows progress and lets the Lab's own commit land before a measurement window opens. */
async function step(ctx: ScenarioContext, text: string): Promise<void> {
  ctx.progress(text);
  await nextFrame(ctx.signal);
  await nextFrame(ctx.signal);
}

/** Advances display frames for `ms`, passing each frame interval to `each`. */
async function during(ctx: ScenarioContext, ms: number, each?: (interval: number) => void): Promise<void> {
  let previous = await nextFrame(ctx.signal);
  const end = previous + ms;
  while (previous < end) {
    const time = await nextFrame(ctx.signal);
    each?.(time - previous);
    previous = time;
  }
}

type Quiesce = { minMs?: number; quietMs?: number; maxMs?: number; each?: () => void };

/**
 * Waits for loading to settle: at least `minMs`, then until no request has completed for `quietMs` (models, textures,
 * chunks). `each` runs every frame meanwhile, so loading itself can be observed.
 */
async function quiesce(ctx: ScenarioContext, { minMs = 2000, quietMs = 1000, maxMs = 60000, each }: Quiesce = {}): Promise<void> {
  const start = await nextFrame(ctx.signal);
  let requests = pageCounters().requests;
  let since = start;
  for (;;) {
    const now = await nextFrame(ctx.signal);
    each?.();
    if (pageCounters().requests !== requests) { requests = pageCounters().requests; since = now; }
    if (now - start >= minMs && now - since >= quietMs) return;
    if (now - start > maxMs) throw new Error('장면 로드가 끝나지 않습니다.');
  }
}

type SceneProps = Omit<PerfWorldSceneProps, 'style' | 'onCreated'>;
const FILL = { width: '100%', height: '100%' };

/** Mounts the /world scene into the scenario host; `host` is the element that sizes its canvas. */
async function mountWorld(ctx: ScenarioContext, props: SceneProps) {
  const element = document.createElement('div');
  element.style.cssText = `width:${ctx.config.width}px;height:${ctx.config.height}px;max-width:100%`;
  ctx.host.append(element);
  const root = createRoot(element);
  const cleanup = () => { root.unmount(); element.remove(); };
  try {
    const state = await new Promise<RootState>((resolve, reject) => {
      const abort = () => reject(new DOMException('실행 중지', 'AbortError'));
      ctx.signal.addEventListener('abort', abort, { once: true });
      root.render(createElement(PerfWorldScene, { ...props, style: FILL, onCreated: (created) => {
        ctx.signal.removeEventListener('abort', abort);
        resolve(created);
      } }));
    });
    const renderer = trackRenderer(state.gl as unknown as Parameters<typeof trackRenderer>[0]);
    const backend = (state.gl as unknown as { backend?: { isWebGPUBackend?: boolean } }).backend;
    ctx.environment({ backend: backend?.isWebGPUBackend ? 'webgpu' : 'webgl' });
    return { renderer, host: element, gl: state.gl, camera: state.camera, canvas: state.gl.domElement, dispose: () => { renderer.dispose(); cleanup(); } };
  } catch (error) {
    cleanup();
    throw error;
  }
}
type World = Awaited<ReturnType<typeof mountWorld>>;

async function withWorld(ctx: ScenarioContext, props: SceneProps, run: (world: World) => Promise<void>): Promise<void> {
  const world = await mountWorld(ctx, props);
  try {
    await step(ctx, '장면 로드와 warm-up');
    await quiesce(ctx);
    await run(world);
  } finally {
    world.dispose();
  }
}

// Forward, strafe, jump, back, strafe back, rest: each cycle ends where it started, so the character stays on the
// spawn patch instead of drifting off its edge (the frame harness timeline walks off and falls).
const WASD = [['KeyW', 1500], ['KeyD', 1000], ['Space', 150], ['KeyS', 1500], ['KeyA', 1000], [null, 500]] as const;

async function drive(ctx: ScenarioContext, canvas: HTMLCanvasElement, ms: number, each?: (interval: number) => void): Promise<void> {
  for (let index = 0, remaining = ms; remaining > 0; index++) {
    const [code, hold] = WASD[index % WASD.length]!;
    const span = Math.min(hold, remaining);
    if (code) canvas.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
    try {
      await during(ctx, span, each);
    } finally {
      if (code) canvas.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true }));
    }
    remaining -= span;
  }
}

// useCamera turns 0.0015 rad per dragged pixel and ignores the first 4 px as a click.
const ORBIT_RADIANS_PER_PIXEL = 0.0015;
const ORBIT_DRAG_START_PX = 5;
// Population of the NPC and remote-player scenarios (prd/01-verification.md S-B09, S-B14).
const NPCS = 30;
const REMOTES = 24;

const run = {
  'S-B02': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm' }, async (world) => {
    await step(ctx, '입력 없이 5초');
    const before = pageCounters();
    const renders = world.renderer.frame.renders;
    await during(ctx, 5000);
    const after = pageCounters();
    await judge(ctx, 'S-B02', { renders: world.renderer.frame.renders - renders, commits: after.commits - before.commits, requests: after.requests - before.requests });
  }),
  'S-B03': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm' }, async (world) => {
    await step(ctx, 'WASD warm-up 5초');
    await drive(ctx, world.canvas, 5000);
    await step(ctx, 'WASD 20초');
    const programs = world.renderer.programsCreated();
    const before = pageCounters();
    let drawCalls = 0;
    let travelled = 0;
    let lowest = Infinity;
    const last = world.camera.position.clone();
    await drive(ctx, world.canvas, 20000, (interval) => {
      ctx.sample('frame-interval', interval, 'ms', 'accept-wasd');
      drawCalls = Math.max(drawCalls, world.renderer.frame.drawCalls);
      travelled += world.camera.position.distanceTo(last);
      lowest = Math.min(lowest, world.camera.position.y);
      last.copy(world.camera.position);
    });
    if (travelled < 5) throw new Error(`WASD 입력이 캐릭터에 닿지 않았습니다(카메라 이동 ${travelled.toFixed(1)}m).`);
    if (lowest < -5) throw new Error(`캐릭터가 바닥 아래로 떨어졌습니다(카메라 y ${lowest.toFixed(1)}).`);
    ctx.sample('camera-travel', travelled, 'world', 'accept-wasd');
    const after = pageCounters();
    ctx.sample('long-tasks', after.longTasks - before.longTasks, 'count', 'accept-wasd');
    await judge(ctx, 'S-B03', { drawCalls, programsAfterWarmup: world.renderer.programsCreated() - programs });
  }),
  'S-B04': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm' }, async (world) => {
    await step(ctx, '3인칭 궤도 360°');
    const rect = world.canvas.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const dispose = BufferGeometry.prototype.dispose;
    let disposed = 0;
    BufferGeometry.prototype.dispose = function (this: BufferGeometry) { disposed++; dispose.call(this); };
    try {
      const geometries = world.renderer.stats().geometries;
      const before = pageCounters();
      const started = performance.now();
      const turn = (2 * Math.PI) / ORBIT_RADIANS_PER_PIXEL;
      const steps = 120;
      const direction = new Vector3();
      const heading = () => { world.camera.getWorldDirection(direction); return Math.atan2(direction.x, direction.z); };
      let previous = heading();
      let turned = 0;
      const track = () => { const current = heading(); turned += Math.atan2(Math.sin(current - previous), Math.cos(current - previous)); previous = current; };
      world.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, buttons: 2, clientX: x, clientY: y, bubbles: true }));
      for (let step = 0; step <= steps; step++) {
        window.dispatchEvent(new MouseEvent('mousemove', { buttons: 2, clientX: x + ORBIT_DRAG_START_PX + (turn * step) / steps, clientY: y, bubbles: true }));
        await nextFrame(ctx.signal);
        track();
      }
      window.dispatchEvent(new MouseEvent('mouseup', { button: 2, bubbles: true }));
      await during(ctx, 1000, track);
      if (Math.abs(turned) < Math.PI) throw new Error(`궤도 입력이 카메라에 닿지 않았습니다(${Math.round((Math.abs(turned) * 180) / Math.PI)}°).`);
      ctx.sample('orbit-degrees', Math.round((Math.abs(turned) * 180) / Math.PI), 'count', 'accept');
      const seconds = (performance.now() - started) / 1000;
      const commits = pageCounters().commits - before.commits;
      await judge(ctx, 'S-B04', {
        geometriesCreated: Math.max(0, world.renderer.stats().geometries - geometries + disposed),
        geometriesDisposed: disposed,
        commitsPerSecond: Math.round((commits / seconds) * 100) / 100,
      });
    } finally {
      BufferGeometry.prototype.dispose = dispose;
    }
  }),
  'S-B05': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm' }, async () => {
    await step(ctx, '타일 칠하기 20회');
    const tiles = useBuildingStore.getState().tileGroups.get('perf-tiles-0')?.tiles ?? [];
    if (tiles.length < 20) throw new Error('기준 장면에 타일이 부족합니다.');
    let commitsPerEdit = 0;
    for (let index = 0; index < 20; index++) {
      const before = pageCounters().commits;
      useBuildingStore.getState().updateTile('perf-tiles-0', tiles[index]!.id, { objectType: index % 2 ? 'grass' : 'sand' });
      await nextFrame(ctx.signal);
      await nextFrame(ctx.signal);
      commitsPerEdit = Math.max(commitsPerEdit, pageCounters().commits - before);
    }
    await judge(ctx, 'S-B05', { commitsPerEdit });
  }),
  'S-B06': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm' }, async (world) => {
    const draws = async () => {
      let most = 0;
      await during(ctx, 1000, () => { most = Math.max(most, world.renderer.frame.drawCalls); });
      return most;
    };
    await step(ctx, '보기 모드 draw');
    const viewing = await draws();
    await step(ctx, '타일 편집 모드 진입');
    useBuildingStore.getState().setEditMode('tile');
    try {
      await quiesce(ctx, { minMs: 1000 });
      const editing = await draws();
      ctx.sample('view-draw-calls', viewing, 'count', 'accept');
      ctx.sample('edit-draw-calls', editing, 'count', 'accept');
      // Edit mode also unmounts the player, so frame totals cannot isolate the overlay: it stays unmeasured until the
      // overlay draws are counted on their own (REN-04a).
      await judge(ctx, 'S-B06', {});
    } finally {
      useBuildingStore.getState().setEditMode('none');
    }
  }),
  'S-B07': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm' }, async (world) => {
    await step(ctx, '새 모델 로드');
    let visible = Infinity;
    await during(ctx, 500, () => { visible = Math.min(visible, world.renderer.frame.triangles); });
    const compiles = world.renderer.frame.compiles;
    let visibleInstanceDrops = 0;
    // A clothing model and an object type the scene has not loaded yet.
    const npc = useNPCStore.getState();
    npc.addTemplate({
      id: 'accept-new', name: 'accept', category: 'humanoid', defaultAnimation: 'idle',
      baseParts: [{ id: 'accept-new-body', type: 'body', url: `${import.meta.env.BASE_URL}gltf/ally_body.glb` }],
      clothingParts: [{ id: 'accept-new-top', type: 'top', url: `${import.meta.env.BASE_URL}gltf/ally_cloth_blue.glb` }],
    });
    npc.addInstance({ id: 'accept-new-npc', templateId: 'accept-new', name: 'accept-new-npc', position: [3, 0, 3], rotation: [0, 0, 0], scale: [1, 1, 1] });
    useBuildingStore.getState().addObject({ id: 'accept-new-object', type: 'billboard', position: { x: 4, y: 0, z: -4 } });
    try {
      await quiesce(ctx, { each: () => { if (world.renderer.frame.triangles < visible * 0.9) visibleInstanceDrops++; } });
      await judge(ctx, 'S-B07', { visibleInstanceDrops, syncCompileFrames: world.renderer.frame.compiles - compiles });
    } finally {
      useNPCStore.getState().removeInstance('accept-new-npc');
      useNPCStore.getState().removeTemplate('accept-new');
      useBuildingStore.getState().removeObject('accept-new-object');
    }
  }),
  'S-B08': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm', postprocessing: true }, async (world) => {
    await step(ctx, '후처리 warm-up 뒤 객체 배치');
    const programs = world.renderer.programsCreated();
    useBuildingStore.getState().addObject({ id: 'accept-placed-tree', type: 'tree', position: { x: 6, y: 0, z: 6 } });
    try {
      await quiesce(ctx, { minMs: 1000 });
      await judge(ctx, 'S-B08', { programsAfterWarmup: world.renderer.programsCreated() - programs });
    } finally {
      useBuildingStore.getState().removeObject('accept-placed-tree');
    }
  }),
  'S-B09': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm', npcs: NPCS }, async (world) => {
    const update = AnimationMixer.prototype.update;
    // NPCSystem renders every NPC under its "npc-system" group; the player's mixer is elsewhere.
    const owners = new Map<AnimationMixer, boolean>();
    // A mixer can update before its model joins the scene, so only a finished walk (NPC group or scene) is kept.
    const isNpc = (mixer: AnimationMixer) => {
      const known = owners.get(mixer);
      if (known !== undefined) return known;
      for (let node: Object3D | null = mixer.getRoot() as Object3D | null; node; node = node.parent) {
        if (node.name === 'npc-system' || (node as { isScene?: boolean }).isScene) {
          owners.set(mixer, node.name === 'npc-system');
          return node.name === 'npc-system';
        }
      }
      return false;
    };
    const frustum = new Frustum();
    const view = new Matrix4();
    const bounds = new Sphere(undefined, 2);
    let counting = false;
    let offscreen = 0;
    AnimationMixer.prototype.update = function (this: AnimationMixer, delta: number) {
      if (counting && this.getRoot() && isNpc(this)) {
        frustum.setFromProjectionMatrix(view.multiplyMatrices(world.camera.projectionMatrix, world.camera.matrixWorldInverse));
        (this.getRoot() as Object3D).getWorldPosition(bounds.center);
        if (!frustum.intersectsSphere(bounds)) offscreen++;
      }
      return update.call(this, delta);
    };
    try {
      await step(ctx, `NPC ${NPCS}체`);
      counting = true;
      await during(ctx, 5000);
      counting = false;
      const mixers = [...owners.values()].filter(Boolean).length;
      if (mixers < NPCS) throw new Error(`NPC ${NPCS}체 중 ${mixers}체만 애니메이션을 갱신했습니다(플레이어가 NPC 표시 범위 밖이면 NPC가 마운트되지 않습니다).`);
      await judge(ctx, 'S-B09', { mixersPerNpc: Math.round((mixers / NPCS) * 100) / 100, offscreenMixerUpdates: offscreen });
    } finally {
      AnimationMixer.prototype.update = update;
    }
  }),
  'S-B10': async (ctx: ScenarioContext) => {
    let dprKeptAfterResize = true;
    for (const quality of ['low', 'medium', 'high'] as const) {
      const world = await mountWorld(ctx, { size: 's', quality });
      try {
        await step(ctx, `품질 ${quality}`);
        await quiesce(ctx, { minMs: 1000 });
        const expected = resolveQualityDpr(quality);
        const kept = () => Math.abs(world.gl.getPixelRatio() - expected) < 1e-6;
        const before = kept();
        world.host.style.width = `${Math.round(ctx.config.width * 0.8)}px`;
        await during(ctx, 500);
        ctx.sample(`dpr-${quality}`, world.gl.getPixelRatio(), 'count', 'accept');
        if (!before || !kept()) dprKeptAfterResize = false;
      } finally {
        world.dispose();
      }
    }
    // auto classifies the device once, from the canvas renderer.
    usePerfStore.setState({ capabilities: null, manualOverride: false });
    const world = await mountWorld(ctx, { size: 's', quality: 'auto' });
    try {
      await step(ctx, '품질 auto');
      await quiesce(ctx, { minMs: 1000 });
      await judge(ctx, 'S-B10', { dprKeptAfterResize, autoDetected: usePerfStore.getState().capabilities !== null });
    } finally {
      world.dispose();
    }
  },
  'S-B11': async (ctx: ScenarioContext) => {
    const view = await mountRoom(ctx);
    try {
      const idle = async () => {
        await settleRoom(view.engine, ctx.signal);
        const before = view.engine.diagnostics().loopCallbacks;
        await during(ctx, 2500);
        return view.engine.diagnostics().loopCallbacks - before;
      };
      await step(ctx, '미니룸 대기');
      let idleFrames = await idle();
      await step(ctx, '타일 칠하기 후 대기');
      view.engine.update({ editing: true, selected: null, theme: 'peach', zoom: 1, terrain: paintTiles(createTerrain(), [0], 'sand') });
      idleFrames += await idle();
      await judge(ctx, 'S-B11', { idleFrames });
    } finally {
      view.dispose();
    }
  },
  'S-B14': (ctx: ScenarioContext) => withWorld(ctx, { size: 'm', remotes: REMOTES }, async () => {
    await step(ctx, `원격 ${REMOTES}명 이동 5초`);
    const before = pageCounters().commits;
    const started = performance.now();
    await during(ctx, 5000);
    // The mock delivers every remote's state at the network rate: one message per remote per update.
    const messages = Math.max(1, Math.floor(((performance.now() - started) / 1000) * REMOTE_UPDATE_HZ) * REMOTES);
    await judge(ctx, 'S-B14', { commitsPerMessage: Math.round(((pageCounters().commits - before) / messages) * 1000) / 1000 });
  }),
} satisfies Record<string, (ctx: ScenarioContext) => Promise<void>>;

/** S-B01 measures page loads, so only `pnpm accept` runs it; the page judges the metrics it reports. */
export const RUNNER_ONLY = ['S-B01'];

export const acceptScenarios: Scenario[] = Object.entries(run).map(([id, measure]) => ({
  id,
  title: `${id} ${entries[id]!.title}`,
  description: `${entries[id]!.item} 수용 시나리오. 예산은 test/accept/budgets.json이 정합니다.`,
  version: 1,
  run: async (ctx) => {
    if (!instrumented()) throw new UnsupportedScenario('수용 시나리오는 /accept 경로에서 실행합니다(commit·요청 계측).');
    await measure(ctx);
  },
}));

export type AcceptVerdict = { status: ScenarioStatus | null; verdict: Verdict | 'error'; violations: string[] };

/** Verdict of a browser run: errors or an unsupported run never count as a pass or as known-red. */
export function runVerdict(run: LabRun): AcceptVerdict {
  const entry = entries[run.scenarioId];
  const status = entry?.status ?? null;
  const problems = [...run.errors, ...run.unsupportedReasons];
  if (!entry || run.status === 'aborted' || run.status === 'unsupported' || problems.length) return { status, verdict: 'error', violations: problems };
  const over = run.assertions.filter((assertion) => !assertion.pass).map(({ id, expected, actual }) => `${id}: ${String(actual)} (budget ${String(expected)})`);
  return { status, verdict: verdict(entry.status, over), violations: over };
}

/** Judges metrics measured outside the page (S-B01) with the same budget table. */
export function judgeMetrics(id: string, metrics: Metrics): AcceptVerdict {
  const entry = entries[id];
  if (!entry) return { status: null, verdict: 'error', violations: [`unknown scenario ${id}`] };
  const over = violations(metrics, entry.budget);
  return { status: entry.status, verdict: verdict(entry.status, over), violations: over };
}
