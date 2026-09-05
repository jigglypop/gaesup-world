import { isWebGpuAvailable } from './threeWebGpuBackend';

const PLANE_COUNT = 6;
const PLANE_STRIDE = 4;

type TslNode = {
  assign(value: TslNode | number): void;
  mul(value: TslNode | number): TslNode;
  add(value: TslNode | number): TslNode;
  dot(value: TslNode): TslNode;
  lessThan(value: TslNode | number): TslNode;
  element(index: TslNode | number): TslNode;
  readonly xyz: TslNode;
  readonly w: TslNode;
};

type TslModule = {
  Fn(body: () => void): () => { compute(count: number): unknown };
  If(condition: TslNode, body: () => void): void;
  storage(attribute: unknown, type: string, count: number): TslNode;
  uniformArray(values: unknown[]): TslNode;
  instanceIndex: TslNode;
  positionLocal: TslNode;
  float(value: number): TslNode;
};

type NodeMaterialLike = {
  positionNode: unknown;
  dispose(): void;
};

type WebGpuModule = {
  MeshNormalNodeMaterial: new () => NodeMaterialLike;
  StorageInstancedBufferAttribute: new (array: Float32Array, itemSize: number) => unknown;
};

export type PlaneVectorLike = {
  set(x: number, y: number, z: number, w: number): unknown;
};

export type GpuCulledInstancesResult = {
  material: NodeMaterialLike;
  computeNode: unknown;
  updatePlanes(planes: Float32Array): void;
  dispose(): void;
};

export type GpuCulledInstancesOptions = {
  count: number;
  positions: Float32Array;
  radius: number;
  createPlaneVector: () => PlaneVectorLike;
};

export async function createGpuCulledInstances(
  options: GpuCulledInstancesOptions,
): Promise<GpuCulledInstancesResult | null> {
  if (!isWebGpuAvailable()) {
    return null;
  }
  try {
    const webgpu = (await import('three/webgpu')) as unknown as WebGpuModule;
    const tsl = (await import('three/tsl')) as unknown as TslModule;
    const { count, positions, radius } = options;
    const planeVectors = Array.from({ length: PLANE_COUNT }, () => options.createPlaneVector());
    const positionAttribute = new webgpu.StorageInstancedBufferAttribute(positions, 3);
    const visibilityArray = new Float32Array(count).fill(1);
    const visibilityAttribute = new webgpu.StorageInstancedBufferAttribute(visibilityArray, 1);
    const positionStorage = tsl.storage(positionAttribute, 'vec3', count);
    const visibilityStorage = tsl.storage(visibilityAttribute, 'float', count);
    const planesUniform = tsl.uniformArray(planeVectors as unknown[]);
    const negativeRadius = tsl.float(-radius);
    const cullKernel = tsl.Fn(() => {
      const instancePosition = positionStorage.element(tsl.instanceIndex);
      const visibility = visibilityStorage.element(tsl.instanceIndex);
      visibility.assign(1);
      for (let planeIndex = 0; planeIndex < PLANE_COUNT; planeIndex += 1) {
        const plane = planesUniform.element(planeIndex);
        const distance = plane.xyz.dot(instancePosition).add(plane.w);
        tsl.If(distance.lessThan(negativeRadius), () => {
          visibility.assign(0);
        });
      }
    });
    const computeNode = cullKernel().compute(count);
    const material = new webgpu.MeshNormalNodeMaterial();
    material.positionNode = tsl.positionLocal.mul(
      visibilityStorage.element(tsl.instanceIndex),
    );
    return {
      material,
      computeNode,
      updatePlanes: (planes: Float32Array) => {
        for (let planeIndex = 0; planeIndex < PLANE_COUNT; planeIndex += 1) {
          const offset = planeIndex * PLANE_STRIDE;
          const vector = planeVectors[planeIndex];
          vector?.set(
            planes[offset] ?? 0,
            planes[offset + 1] ?? 0,
            planes[offset + 2] ?? 0,
            planes[offset + 3] ?? 0,
          );
        }
      },
      dispose: () => {
        material.dispose();
      },
    };
  } catch {
    return null;
  }
}
