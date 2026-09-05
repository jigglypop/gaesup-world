import { createEmptyRenderSnapshot } from '../core';
import { createEmptyBuildingIndirectDrawMirror } from '../draw';
import { createEmptyGpuMirror } from '../gpu';
import { useBuildingRenderStateStore } from '../store';
import {
  createEmptyBuildingGpuUploadResources,
  type BuildingGpuUploadResources,
  type GpuBufferLike,
} from '../upload';

function createResources(
  buffers: Partial<
    Pick<BuildingGpuUploadResources, 'spatialBuffer' | 'metaBuffer' | 'indirectArgsBuffer'>
  >,
): BuildingGpuUploadResources {
  return {
    ...createEmptyBuildingGpuUploadResources(),
    backend: 'webgpu',
    ...buffers,
  };
}

describe('building render store gpu upload ownership', () => {
  beforeEach(() => {
    useBuildingRenderStateStore.getState().reset();
  });

  afterEach(() => {
    useBuildingRenderStateStore.getState().reset();
  });

  it('supports direct assignment and composes functional updates from the latest record', () => {
    const spatialBuffer: GpuBufferLike = { destroy: jest.fn() };
    const indirectArgsBuffer: GpuBufferLike = { destroy: jest.fn() };
    const first = createResources({ spatialBuffer });

    useBuildingRenderStateStore.getState().setUploadResources(first);
    useBuildingRenderStateStore.getState().setUploadResources((previous) => {
      expect(previous).toBe(first);
      return { ...previous, indirectArgsBuffer, indirectArgsBytes: 20 };
    });

    const current = useBuildingRenderStateStore.getState().uploadResources;
    expect(current.spatialBuffer).toBe(spatialBuffer);
    expect(current.indirectArgsBuffer).toBe(indirectArgsBuffer);
    expect(current.indirectArgsBytes).toBe(20);
  });

  it('detaches the current record before destroying it and releases it only once', () => {
    const destroy = jest.fn(() => {
      const current = useBuildingRenderStateStore.getState().uploadResources;
      expect(current).not.toBe(resources);
      expect(current.spatialBuffer).toBeNull();
    });
    const resources = createResources({ spatialBuffer: { destroy } });
    useBuildingRenderStateStore.getState().setUploadResources(resources);

    useBuildingRenderStateStore.getState().releaseUploadResources();
    useBuildingRenderStateStore.getState().releaseUploadResources();
    useBuildingRenderStateStore.getState().reset();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it.each(['releaseUploadResources', 'reset'] as const)(
    'destroys detached resources when a %s subscriber throws',
    (actionName) => {
      const resources = createResources({
        spatialBuffer: {
          destroy: jest.fn(() => {
            expect(useBuildingRenderStateStore.getState().uploadResources).not.toBe(resources);
          }),
        },
      });
      const expectedError = new Error('subscriber failure');
      useBuildingRenderStateStore.getState().setUploadResources(resources);
      const unsubscribe = useBuildingRenderStateStore.subscribe(() => {
        throw expectedError;
      });

      try {
        expect(() => useBuildingRenderStateStore.getState()[actionName]()).toThrow(expectedError);
      } finally {
        unsubscribe();
      }

      expect(resources.spatialBuffer?.destroy).toHaveBeenCalledTimes(1);
      expect(useBuildingRenderStateStore.getState().uploadResources.spatialBuffer).toBeNull();
    },
  );

  it('rejects resource action reentry while a functional update is being computed', () => {
    const first = createResources({});
    const next = createResources({});
    useBuildingRenderStateStore.getState().setUploadResources(first);

    expect(() =>
      useBuildingRenderStateStore.getState().setUploadResources((previous) => {
        useBuildingRenderStateStore.getState().setUploadResources(next);
        return previous;
      }),
    ).toThrow('Building GPU upload resource updates cannot be reentrant.');

    expect(useBuildingRenderStateStore.getState().uploadResources).toBe(first);
    useBuildingRenderStateStore.getState().setUploadResources(next);
    expect(useBuildingRenderStateStore.getState().uploadResources).toBe(next);
  });

  it('publishes the complete reset state before destroying detached resources', () => {
    const snapshot = createEmptyRenderSnapshot();
    snapshot.version = 4;
    const gpuMirror = createEmptyGpuMirror();
    gpuMirror.version = 5;
    const drawMirror = createEmptyBuildingIndirectDrawMirror();
    drawMirror.version = 6;
    const destroy = jest.fn(() => {
      const current = useBuildingRenderStateStore.getState();
      expect(current.snapshot.version).toBe(0);
      expect(current.gpuMirror.version).toBe(0);
      expect(current.drawMirror.version).toBe(0);
      expect(current.uploadResources.spatialBuffer).toBeNull();
    });

    useBuildingRenderStateStore.getState().setSnapshot(snapshot);
    useBuildingRenderStateStore.getState().setGpuMirror(gpuMirror);
    useBuildingRenderStateStore.getState().setDrawMirror(drawMirror);
    useBuildingRenderStateStore
      .getState()
      .setUploadResources(createResources({ spatialBuffer: { destroy } }));

    const observedVersions: Array<[number, number, number]> = [];
    const unsubscribe = useBuildingRenderStateStore.subscribe((state) => {
      observedVersions.push([
        state.snapshot.version,
        state.gpuMirror.version,
        state.drawMirror.version,
      ]);
    });

    useBuildingRenderStateStore.getState().reset();
    unsubscribe();

    expect(observedVersions).toEqual([[0, 0, 0]]);
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
