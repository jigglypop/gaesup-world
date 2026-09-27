export type AssetReference = {
  assetId: string;
  ownerId: string;
  objectId: string;
  componentId: string;
  path: string;
};

export type AssetDependencyGraph = {
  references: AssetReference[];
  usersByAsset: Map<string, Set<string>>;
  assetsByOwner: Map<string, Set<string>>;
};

export type AssetModelStats = {
  meshes: number;
  triangles: number;
  materials: number;
  textures: number;
  maxTextureSize: number;
  bones: number;
  animationClips: string[];
  boundingSize: [number, number, number];
  /** GPU bytes of the textures uploaded as RGBA8 with mipmaps. */
  textureBytes?: number;
  /** File size, when the caller knows it. */
  bytes?: number;
};

export type AssetImportLimits = {
  maxTriangles: number;
  maxMaterials: number;
  maxTextureSize: number;
  maxBones: number;
  maxBoundingSize: number;
  maxBytes?: number;
};

export type AssetImportIssueSeverity = 'warning' | 'error';

export type AssetImportIssue = {
  code:
    | 'too-many-triangles'
    | 'too-many-materials'
    | 'texture-too-large'
    | 'too-many-bones'
    | 'unexpected-scale'
    | 'empty-model'
    | 'file-too-large'
    | 'no-skeleton'
    | 'missing-bones'
    | 'collapsed-joints'
    | 'unweighted-vertices'
    | 'hips-heavy-skin'
    | 'facing-off'
    | 'rest-pose-stub'
    | 'static-clip'
    | 'arms-out'
    | 'idle-drift'
    | 'missing-idle'
    | 'missing-walk';
  severity: AssetImportIssueSeverity;
  message: string;
};

export type FigureClipReport = {
  name: string;
  duration: number;
  moving: boolean;
  /** Height component of the upper-arm direction, left then right: 0 held out in a T, near -1 hanging down. */
  armDrop: [number | null, number | null];
  /** Largest horizontal travel of the hips, as a fraction of the figure's height. */
  hipsDrift: number;
};

export type FigureReport = {
  verdict: 'pass' | 'fail';
  stats: AssetModelStats;
  height: number;
  missingBones: string[];
  /** Largest distance between two joints, as a fraction of the height: near 0 when joints collapsed at the origin. */
  jointSpread: number;
  skinnedVertices: number;
  unweightedVertices: number;
  hipsWeightShare: number;
  /** Degrees the figure faces away from +Z, or null without hips and shoulders. */
  facingYaw: number | null;
  clips: FigureClipReport[];
  issues: AssetImportIssue[];
};
