import { buildBuildingIndirectDrawMirror, createBuildingIndirectDrawUploadPlan, INDIRECT_DRAW_STRIDE } from '../draw';
import { DRAW_CLUSTER_FIRE, DRAW_CLUSTER_GRASS } from '../culling';

describe('building indirect draw prep', () => {
  it('builds indirect args from cluster counts', () => {
    const counts = new Uint32Array(10);
    counts[DRAW_CLUSTER_GRASS] = 12;
    counts[DRAW_CLUSTER_FIRE] = 3;

    const mirror = buildBuildingIndirectDrawMirror(4, counts, null);

    const grassBase = DRAW_CLUSTER_GRASS * INDIRECT_DRAW_STRIDE;
    const fireBase = DRAW_CLUSTER_FIRE * INDIRECT_DRAW_STRIDE;
    expect(mirror.version).toBe(4);
    expect(mirror.args[grassBase + 1]).toBe(12);
    expect(mirror.args[fireBase + 1]).toBe(3);
    expect(mirror.dirtyRanges).toEqual([{ start: 0, end: 10 }]);
  });

  it('creates partial upload slices for changed draw clusters', () => {
    const firstCounts = new Uint32Array(10);
    firstCounts[DRAW_CLUSTER_GRASS] = 12;
    const first = buildBuildingIndirectDrawMirror(1, firstCounts, null);

    const secondCounts = new Uint32Array(10);
    secondCounts[DRAW_CLUSTER_GRASS] = 18;
    secondCounts[DRAW_CLUSTER_FIRE] = 2;
    const second = buildBuildingIndirectDrawMirror(2, secondCounts, first);
    const plan = createBuildingIndirectDrawUploadPlan(second);

    expect(plan.version).toBe(2);
    expect(plan.slices.length).toBeGreaterThan(0);
    expect(plan.slices[0]?.elementCount).toBeGreaterThan(0);
  });
});
