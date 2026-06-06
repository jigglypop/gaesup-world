import { useBuildingGpuCullingStore } from '../cullingStore';

describe('useBuildingGpuCullingStore', () => {
  beforeEach(() => {
    useBuildingGpuCullingStore.getState().reset();
  });

  it('does not notify subscribers when culling result is unchanged', () => {
    const payload = {
      version: 3,
      tileIds: new Set(['tile-a']),
      wallIds: new Set(['wall-a']),
      blockIds: new Set(['block-a']),
      objectIds: new Set(['object-a']),
      clusterCounts: new Uint32Array([1, 2, 3]),
    };
    const notifications: number[] = [];
    const unsubscribe = useBuildingGpuCullingStore.subscribe((state) => {
      notifications.push(state.version);
    });

    useBuildingGpuCullingStore.getState().setResult(payload);
    useBuildingGpuCullingStore.getState().setResult({
      version: payload.version,
      tileIds: new Set(payload.tileIds),
      wallIds: new Set(payload.wallIds),
      blockIds: new Set(payload.blockIds),
      objectIds: new Set(payload.objectIds),
      clusterCounts: new Uint32Array(payload.clusterCounts),
    });

    unsubscribe();
    expect(notifications).toEqual([3]);
  });
});
