export type EntityId = number;
export type NextWorldOptions = {
  capacity?: number;
};
export type TaskPhase = 'input' | 'simulate' | 'physics' | 'render';
export type TaskDescriptor = {
  id: string;
  phase: TaskPhase;
  deps?: readonly string[];
  run: (deltaTime: number) => void;
};
export type RenderPassDescriptor<TContext> = {
  id: string;
  reads?: readonly string[];
  writes?: readonly string[];
  execute: (context: TContext) => void;
};
export type RendererBackendKind = 'webgpu';
export type RendererBackend = {
  /** Identifies the Three WebGPURenderer facade family, not a proven native WebGPU adapter. */
  kind: RendererBackendKind;
  native: unknown;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};
export type ThreeWebGpuBackendOptions = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};
export type GeometrySourceKind = 'mesh' | 'splat' | 'pointcloud' | 'voxel' | 'procedural';
export type MeshGeometrySource = {
  kind: 'mesh';
  id: string;
  url?: string;
};
export type SplatGeometrySource = {
  kind: 'splat';
  id: string;
  url?: string;
};
export type PointCloudGeometrySource = {
  kind: 'pointcloud';
  id: string;
  url?: string;
};
export type VoxelGeometrySource = {
  kind: 'voxel';
  id: string;
  url?: string;
};
export type ProceduralGeometrySource = {
  kind: 'procedural';
  id: string;
  generator: string;
};
export type GeometrySource =
  | MeshGeometrySource
  | SplatGeometrySource
  | PointCloudGeometrySource
  | VoxelGeometrySource
  | ProceduralGeometrySource;
