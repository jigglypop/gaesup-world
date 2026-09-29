import { SETTLE_PASSES, SETTLED_RATE_DIVISOR, scheduledProbeBudget } from '../core/probeSchedule';
import { ProbeCascade, createVoxelGrid, fillVoxelBox } from '../index';
import type { GiEnvironment, ProbeVolumeConfig } from '../index';

const DAY: GiEnvironment = {
  sunDirection: { x: 0.3, y: 0.8, z: 0.4 },
  sunIrradiance: [2, 2, 2],
  skyZenith: [0.4, 0.5, 0.9],
  skyHorizon: [0.7, 0.75, 0.8],
  skyGround: [0.2, 0.18, 0.15],
};

function createCascade(): ProbeCascade {
  const grid = createVoxelGrid({ x: -2, y: -2, z: -2 }, 0.5, [16, 12, 16]);
  fillVoxelBox(grid, { min: { x: -2, y: -1, z: -2 }, max: { x: 6, y: 0, z: 6 } });
  const config: ProbeVolumeConfig = {
    origin: { x: -1, y: 0.5, z: -1 },
    spacing: 2,
    counts: [4, 2, 4],
    raysPerProbe: 8,
    blend: 0.1,
    normalBias: 0.5,
    maxRayDistance: 16,
  };
  return new ProbeCascade(grid, config, null, DAY);
}

describe('프로브 갱신 일정', () => {
  it('첫 바퀴는 몰아서, 수렴할 때까지는 그대로, 수렴한 뒤에는 4분의 1로 갱신한다', () => {
    expect(scheduledProbeBudget(32, 0, 4)).toBe(128);
    expect(scheduledProbeBudget(32, 0.5)).toBe(32);
    expect(scheduledProbeBudget(32, 1)).toBe(32);
    expect(scheduledProbeBudget(32, SETTLE_PASSES - 0.01)).toBe(32);
    expect(scheduledProbeBudget(32, SETTLE_PASSES)).toBe(32 / SETTLED_RATE_DIVISOR);
    expect(scheduledProbeBudget(2, SETTLE_PASSES)).toBe(1);
    expect(scheduledProbeBudget(0, 0, 4)).toBe(0);
  });

  it('캐스케이드는 바뀐 뒤 돈 바퀴 수를 세고 복셀이나 빛이 바뀌면 처음부터 센다', () => {
    const cascade = createCascade();
    expect(cascade.passesSinceChange).toBe(0);
    cascade.update(16);
    cascade.update(16);
    expect(cascade.passesSinceChange).toBeCloseTo(1, 9);
    cascade.update(8);
    expect(cascade.passesSinceChange).toBeCloseTo(1.25, 9);

    cascade.setEnvironment({ ...DAY, sunDirection: { x: -0.5, y: 0.4, z: 0.2 } });
    expect(cascade.passesSinceChange).toBe(0);
    cascade.update(32);
    cascade.markDirtyBox({ min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } });
    expect(cascade.passesSinceChange).toBe(0);
    cascade.update(32);
    cascade.markAllDirty();
    expect(cascade.passesSinceChange).toBe(0);
  });
});
