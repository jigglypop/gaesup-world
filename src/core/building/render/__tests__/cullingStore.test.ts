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

  it('updates camera metadata even when visible objects are unchanged', () => {
    const payload = {
      version: 1, tileIds: new Set<string>(), wallIds: new Set<string>(),
      objectIds: new Set<string>(), clusterCounts: new Uint32Array(),
      camera: { viewProjection: Array.from({ length: 16 }, () => 0), position: [0, 0, 0], coordinateSystem: 2001, reversedDepth: false },
    };
    const { setResult } = useBuildingGpuCullingStore.getState();
    setResult(payload);
    const first = useBuildingGpuCullingStore.getState();
    setResult({ ...payload, camera: { ...payload.camera, position: [...payload.camera.position] } });
    expect(useBuildingGpuCullingStore.getState()).toBe(first);
    setResult({ ...payload, camera: { ...payload.camera, position: [1, 0, 0] } });
    expect(useBuildingGpuCullingStore.getState().camera?.position).toEqual([1, 0, 0]);
    useBuildingGpuCullingStore.getState().reset();
    expect(useBuildingGpuCullingStore.getState().camera).toBeNull();
  });
});
