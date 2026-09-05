export type ProjectSettingsVersion = 1;
export type ProjectRenderBackend = 'auto' | 'webgl' | 'webgpu';
export type ProjectBuildTarget = 'web';
export type ProjectChunkStrategy = 'single' | 'vendor-split' | 'domain-split';
export type ProjectInputDevice = 'keyboard' | 'mouse' | 'gamepad' | 'touch';

export type ProjectVector3 = readonly [number, number, number];

export interface ProjectPhysicsSettings {
  enabled: boolean;
  gravity: ProjectVector3;
  timeStep: number;
  maxSubSteps: number;
  solverIterations: number;
  collisionMatrix: Record<string, string[]>;
}

export interface ProjectRenderingSettings {
  backend: ProjectRenderBackend;
  pixelRatio: number;
  shadows: boolean;
  antialias: boolean;
  toneMapping: 'none' | 'aces' | 'reinhard';
  outputColorSpace: 'srgb' | 'linear';
  toon: {
    enabled: boolean;
  };
  postprocessing: {
    enabled: boolean;
    bloom: boolean;
    colorGrade: boolean;
    outline: boolean;
  };
}

export interface ProjectInputBinding {
  device: ProjectInputDevice;
  code: string;
  scale?: number;
}

export interface ProjectInputSettings {
  pointerLock: boolean;
  touchControls: boolean;
  gamepad: boolean;
  bindings: Record<string, ProjectInputBinding[]>;
}

export interface ProjectBuildSettings {
  target: ProjectBuildTarget;
  publicPath: string;
  assetBaseUrl: string;
  sourceMaps: boolean;
  minify: boolean;
  chunkStrategy: ProjectChunkStrategy;
}

export interface ProjectEditorSettings {
  autosave: boolean;
  autosaveIntervalMs: number;
  gridSize: number;
  snapMove: number;
  snapRotateDegrees: number;
  showGizmos: boolean;
}

export interface ProjectSettings {
  version: ProjectSettingsVersion;
  name: string;
  physics: ProjectPhysicsSettings;
  rendering: ProjectRenderingSettings;
  input: ProjectInputSettings;
  build: ProjectBuildSettings;
  editor: ProjectEditorSettings;
}

export type ProjectSettingsInput = Partial<{
  name: string;
  physics: Partial<ProjectPhysicsSettings>;
  rendering: Partial<Omit<ProjectRenderingSettings, 'toon' | 'postprocessing'>> & Partial<{
    toon: Partial<ProjectRenderingSettings['toon']>;
    postprocessing: Partial<ProjectRenderingSettings['postprocessing']>;
  }>;
  input: Partial<ProjectInputSettings>;
  build: Partial<ProjectBuildSettings>;
  editor: Partial<ProjectEditorSettings>;
}>;

export type ProjectSettingsIssueCode =
  | 'invalid-build-settings'
  | 'invalid-editor-settings'
  | 'invalid-input-binding'
  | 'invalid-physics-settings'
  | 'invalid-rendering-settings'
  | 'invalid-project-settings-version';

export interface ProjectSettingsIssue {
  code: ProjectSettingsIssueCode;
  path: string;
  message: string;
}

export interface ProjectSettingsValidationResult {
  valid: boolean;
  issues: ProjectSettingsIssue[];
}

export interface ParseProjectSettingsResult extends ProjectSettingsValidationResult {
  settings?: ProjectSettings;
}
