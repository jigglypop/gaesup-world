import type { RuntimeRecord } from '../../boilerplate/types';

export type SaveData = {
  version: string;
  timestamp: number;
  world: WorldSaveData;
  metadata?: SaveMetadata;
};

export type WorldSaveData = {
  id: string;
  name: string;
  buildings: BuildingSaveData;
  npcs: NPCSaveData[];
  environment: EnvironmentSaveData;
  camera?: CameraSaveData;
};

export type BuildingSaveData = {
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
  blocks?: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    cell?: { x: number; z: number; level?: number };
    size?: {
      x?: number;
      y?: number;
      z?: number;
    };
    materialId?: string;
    tags?: string[];
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
};

export type NPCSaveData = {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  modelUrl?: string;
  behavior?: string;
  metadata?: RuntimeRecord;
};

export type EnvironmentSaveData = {
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
};

export type CameraSaveData = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  mode: string;
  settings?: RuntimeRecord;
};

export type SaveMetadata = {
  description?: string;
  tags?: string[];
  thumbnail?: string;
  author?: string;
  createdAt: number;
  updatedAt: number;
};

export type SaveLoadOptions = {
  includeBuildings?: boolean;
  includeNPCs?: boolean;
  includeEnvironment?: boolean;
  includeCamera?: boolean;
  compress?: boolean;
};

export type SaveLoadResult = {
  success: boolean;
  data?: SaveData;
  error?: string;
}; 
