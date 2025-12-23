export interface SaveData {
  version: string;
  timestamp: number;
  world: WorldSaveData;
  metadata?: SaveMetadata;
}

export interface WorldSaveData {
  id: string;
  name: string;
  buildings: BuildingSaveData;
  npcs: NPCSaveData[];
  environment: EnvironmentSaveData;
  camera?: CameraSaveData;
}

export interface BuildingSaveData {
  wallGroups: Array<{
    id: string;
    name: string;
    walls: Array<{
      id: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      scale?: { x: number; y: number; z: number };
      meshId: string;
    }>;
  }>;
  tileGroups: Array<{
    id: string;
    name: string;
    tiles: Array<{
      id: string;
      position: { x: number; y: number; z: number };
      size?: number;
      rotation?: number;
    }>;
  }>;
  meshes: Array<{
    id: string;
    color: string;
    material: string;
    mapTextureUrl?: string;
    normalTextureUrl?: string;
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
  }>;
}

export interface NPCSaveData {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  modelUrl?: string;
  behavior?: string;
  metadata?: Record<string, unknown>;
}

export interface EnvironmentSaveData {
  lighting: {
    ambientIntensity: number;
    directionalIntensity: number;
    directionalPosition: { x: number; y: number; z: number };
  };
  fog?: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  skybox?: {
    type: string;
    color?: string;
    textureUrl?: string;
  };
}

export interface CameraSaveData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  mode: string;
  settings?: Record<string, unknown>;
}

export interface SaveMetadata {
  description?: string;
  tags?: string[];
  thumbnail?: string;
  author?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SaveLoadOptions {
  includeBuildings?: boolean;
  includeNPCs?: boolean;
  includeEnvironment?: boolean;
  includeCamera?: boolean;
  compress?: boolean;
}

export interface SaveLoadResult {
  success: boolean;
  data?: SaveData;
  error?: string;
} 