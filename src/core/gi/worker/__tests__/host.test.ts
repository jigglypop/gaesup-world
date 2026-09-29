import { createGiRuntime } from '../../components/GiVolume/runtime';
import type { GiRuntimeParams } from '../../components/GiVolume/types';
import { PROBE_ATLAS_ALPHA, probeAtlasLength } from '../../core/probeAtlas';
import { SETTLE_PASSES, scheduledProbeBudget } from '../../core/probeSchedule';
import type { GiEnvironment, ProbeAtlasUpload, VoxelSourceBox } from '../../types';
import { GI_WORKER_TICK_MS, GiWorkerHost } from '../host';
import type { GiWorkerResponse } from '../protocol';

const DAY: GiEnvironment = {
  sunDirection: { x: 0.4, y: 0.8, z: 0.3 },
  sunIrradiance: [2.5, 2.4, 2.2],
  skyZenith: [0.35, 0.55, 0.95],
  skyHorizon: [0.75, 0.8, 0.85],
  skyGround: [0.18, 0.16, 0.14],
};

const BOXES: VoxelSourceBox[] = [
  { min: { x: 0, y: -0.5, z: 0 }, max: { x: 8, y: 0, z: 8 }, albedo: [0.4, 0.5, 0.3] },
  { min: { x: 3, y: 0, z: 3 }, max: { x: 3.5, y: 3, z: 6 }, albedo: [0.8, 0.2, 0.1] },
];

const PARAMS: GiRuntimeParams = {
  voxelSize: 0.5,
  probeSpacing: 4,
  raysPerProbe: 8,
  padding: 2,
  blend: 0.1,
  fineBounds: null,
};

const INTERVAL_MS = 100;

/** Timers that run only when the test advances time. */
class FakeClock {
  time = 0;
  private readonly timers = new Map<number, () => void>();
  private nextId = 1;
  readonly api = {
    now: () => this.time,
    setTimeout: (callback: () => void) => {
      const id = this.nextId++;
      this.timers.set(id, callback);
      return id;
    },
    clearTimeout: (handle: unknown) => {
      this.timers.delete(handle as number);
    },
  };

  get pending(): number {
    return this.timers.size;
  }

  advance(ms: number): void {
    this.time += ms;
    const due = [...this.timers.values()];
    this.timers.clear();
    for (const callback of due) callback();
  }
}

function startHost() {
  const clock = new FakeClock();
  const posted: { message: GiWorkerResponse; transfer: Transferable[] }[] = [];
  const host = new GiWorkerHost((message, transfer) => posted.push({ message, transfer }), clock.api);
  host.handle({ type: 'init', module: null, probesPerTick: 16, uploadIntervalMs: INTERVAL_MS });
  host.handle({ type: 'scene', boxes: BOXES, params: PARAMS, environment: DAY });
  const atlases = () =>
    posted.flatMap(({ message }) => (message.type === 'atlas' ? [message.levels] : [])) as ProbeAtlasUpload[][];
  return { clock, host, posted, atlases };
}

describe('GI 워커 호스트', () => {
  it('장면을 받으면 타이머로 프로브를 추적하고 메인 스레드와 같은 아틀라스를 옮겨 보낸다', () => {
    const { clock, posted, atlases } = startHost();
    const reference = createGiRuntime(null, BOXES, PARAMS, DAY);
    if (!reference) throw new Error('reference runtime');
    const level = reference.cascade.coarse;

    expect(clock.pending).toBe(1);
    clock.advance(GI_WORKER_TICK_MS);
    reference.cascade.update(scheduledProbeBudget(16, 0, 4));
    const expected = new Uint16Array(probeAtlasLength(level.config.counts));
    level.packAtlas(expected);

    const first = atlases()[0]?.[0];
    expect(first?.config.counts).toEqual(level.config.counts);
    expect(Array.from(first?.atlas ?? [])).toEqual(Array.from(expected));
    expect(first?.atlas[3]).toBe(PROBE_ATLAS_ALPHA);
    expect(posted[0]?.transfer).toEqual([first?.atlas.buffer]);
    expect(posted[0]?.message).toMatchObject({ type: 'atlas', usesWasm: false });
  });

  it('업로드 간격을 지키고 돌려받은 배열에 다음 아틀라스를 담는다', () => {
    const { clock, host, atlases } = startHost();
    clock.advance(GI_WORKER_TICK_MS);
    expect(atlases()).toHaveLength(1);
    clock.advance(GI_WORKER_TICK_MS);
    expect(atlases()).toHaveLength(1);

    const sent = atlases()[0]?.[0]?.atlas;
    if (!sent) throw new Error('no atlas');
    host.handle({ type: 'recycle', atlases: [sent] });
    clock.advance(INTERVAL_MS);
    expect(atlases()).toHaveLength(2);
    expect(atlases()[1]?.[0]?.atlas).toBe(sent);
  });

  it('수렴하면 업로드를 줄이고 빛이 바뀌면 다시 빠르게 보낸다', () => {
    const { clock, host, atlases } = startHost();
    // Enough ticks for every probe to be traced SETTLE_PASSES times at the full rate.
    for (let tick = 0; tick < SETTLE_PASSES * 40; tick++) clock.advance(GI_WORKER_TICK_MS);
    const settledAt = atlases().length;
    for (let tick = 0; tick < 50; tick++) clock.advance(INTERVAL_MS / 5);
    // 1000 ms at a four-times-longer interval: two or three uploads instead of ten.
    expect(atlases().length - settledAt).toBeLessThanOrEqual(3);

    host.handle({ type: 'environment', environment: { ...DAY, sunDirection: { x: -0.6, y: 0.3, z: 0.2 } } });
    const changedAt = atlases().length;
    for (let tick = 0; tick < 50; tick++) clock.advance(INTERVAL_MS / 5);
    expect(atlases().length - changedAt).toBeGreaterThanOrEqual(9);
  });

  it('가려진 페이지에서는 멈췄다가 다시 보이면 이어서 추적한다', () => {
    const { clock, host, atlases } = startHost();
    host.handle({ type: 'pause', paused: true });
    expect(clock.pending).toBe(0);
    clock.advance(INTERVAL_MS * 3);
    expect(atlases()).toHaveLength(0);

    host.handle({ type: 'pause', paused: false });
    expect(clock.pending).toBe(1);
    clock.advance(GI_WORKER_TICK_MS);
    expect(atlases()).toHaveLength(1);
  });

  it('dispose 뒤에는 추적도 전송도 하지 않는다', () => {
    const { clock, host, atlases } = startHost();
    clock.advance(GI_WORKER_TICK_MS);
    host.handle({ type: 'dispose' });
    const count = atlases().length;
    clock.advance(INTERVAL_MS * 3);
    host.handle({ type: 'scene', boxes: BOXES, params: PARAMS, environment: DAY });
    clock.advance(INTERVAL_MS * 3);

    expect(atlases()).toHaveLength(count);
    expect(clock.pending).toBe(0);
  });
});
