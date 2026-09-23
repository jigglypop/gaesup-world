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
};

export type AssetImportLimits = {
  maxTriangles: number;
  maxMaterials: number;
  maxTextureSize: number;
  maxBones: number;
  maxBoundingSize: number;
};

export type AssetImportIssueSeverity = 'warning' | 'error';

export type AssetImportIssue = {
  code: 'too-many-triangles' | 'too-many-materials' | 'texture-too-large' | 'too-many-bones' | 'unexpected-scale' | 'empty-model';
  severity: AssetImportIssueSeverity;
  message: string;
};
