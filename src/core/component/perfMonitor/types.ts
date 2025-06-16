export interface PerfMonitorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  updateInterval?: number;
  visible?: boolean;
  zIndex?: number;
  enableGPUInfo?: boolean;
  enableNetworkInfo?: boolean;
  enableRapierInfo?: boolean;
  historyLength?: number;
}

export interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

export interface WebGLInfo {
  textures: number;
  geometries: number;
  programs: number;
  drawCalls: number;
  triangles: number;
  lines: number;
  points: number;
}

export interface GPUInfo {
  vendor: string;
  renderer: string;
  maxTextures: number;
  maxTextureSize: number;
  maxVertexTextures: number;
  maxCombinedTextures: number;
  extensions: string[];
}

export interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface RapierInfo {
  rigidBodies: number;
  colliders: number;
  joints: number;
  islandCount: number;
  stepTime: number;
}

export interface FrameMetrics {
  fps: number;
  frameTime: number;
  minFps: number;
  maxFps: number;
  avgFps: number;
  frameTimes: number[];
  cpuTime: number;
  gpuTime: number;
}

export interface PerformanceData {
  frame: FrameMetrics;
  memory: MemoryInfo;
  webgl: WebGLInfo;
  gpu?: GPUInfo;
  network?: NetworkInfo;
  rapier?: RapierInfo;
  timestamp: number;
}

export interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}
