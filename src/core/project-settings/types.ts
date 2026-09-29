export type ProjectSettingsVersion = 1;
export type ProjectRenderBackend = 'auto' | 'webgl' | 'webgpu';
export type ProjectBuildTarget = 'web';
export type ProjectChunkStrategy = 'single' | 'vendor-split' | 'domain-split';
export type ProjectInputDevice = 'keyboard' | 'mouse' | 'gamepad' | 'touch';

export type ProjectVector3 = readonly [number, number, number];

export type ProjectPhysicsSettings = {
  enabled: boolean;
  gravity: ProjectVector3;
  timeStep: number;
  maxSubSteps: number;
  solverIterations: number;
  collisionMatrix: Record<string, string[]>;
};

export type ProjectRenderingSettings = {
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
};

export type ProjectInputBinding = {
  device: ProjectInputDevice;
  code: string;
  scale?: number;
};

export type ProjectInputSettings = {
  pointerLock: boolean;
  touchControls: boolean;
  gamepad: boolean;
  bindings: Record<string, ProjectInputBinding[]>;
};

export type ProjectBuildSettings = {
  target: ProjectBuildTarget;
  publicPath: string;
  assetBaseUrl: string;
  sourceMaps: boolean;
  minify: boolean;
  chunkStrategy: ProjectChunkStrategy;
};

export type ProjectEditorSettings = {
  autosave: boolean;
  autosaveIntervalMs: number;
  gridSize: number;
  snapMove: number;
  snapRotateDegrees: number;
  showGizmos: boolean;
};

export type ProjectSettings = {
  version: ProjectSettingsVersion;
  name: string;
  physics: ProjectPhysicsSettings;
  rendering: ProjectRenderingSettings;
  input: ProjectInputSettings;
  build: ProjectBuildSettings;
  editor: ProjectEditorSettings;
};

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

export type ProjectSettingsIssue = {
  code: ProjectSettingsIssueCode;
  path: string;
  message: string;
};

export type ProjectSettingsValidationResult = {
  valid: boolean;
  issues: ProjectSettingsIssue[];
};

export interface ParseProjectSettingsResult extends ProjectSettingsValidationResult {
  settings?: ProjectSettings;
}
