import { createSceneComponent } from './core';
import type { SceneComponent, SceneJsonObject, SceneVector3 } from './types';

export const SCENE_COMPONENT_TYPES = {
  meshRenderer: 'gaesup.meshRenderer',
  collider: 'gaesup.collider',
  rigidBody: 'gaesup.rigidBody',
  script: 'gaesup.script',
  interactable: 'gaesup.interactable',
  buildingPiece: 'gaesup.buildingPiece',
  npc: 'gaesup.npc',
} as const;

export type StandardSceneComponentType =
  (typeof SCENE_COMPONENT_TYPES)[keyof typeof SCENE_COMPONENT_TYPES];

export interface MeshRendererComponentData extends SceneJsonObject {
  assetId?: string;
  url?: string;
  materialId?: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface ColliderComponentData extends SceneJsonObject {
  shape: 'box' | 'sphere' | 'capsule' | 'mesh';
  size?: SceneVector3;
  radius?: number;
  height?: number;
  trigger?: boolean;
}

export interface RigidBodyComponentData extends SceneJsonObject {
  type: 'fixed' | 'dynamic' | 'kinematic';
  mass?: number;
  gravityScale?: number;
  lockRotations?: boolean;
}

export interface ScriptComponentData extends SceneJsonObject {
  scriptId: string;
  props?: SceneJsonObject;
}

export interface InteractableComponentData extends SceneJsonObject {
  kind: string;
  prompt?: string;
  radius?: number;
  command?: string;
}

export interface BuildingPieceComponentData extends SceneJsonObject {
  kind: 'tile' | 'wall' | 'block' | 'object';
  catalogId?: string;
  footprintId?: string;
}

export interface NpcComponentData extends SceneJsonObject {
  npcId: string;
  scheduleId?: string;
  dialogTreeId?: string;
}

export type MeshRendererComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.meshRenderer,
  MeshRendererComponentData
>;
export type ColliderComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.collider,
  ColliderComponentData
>;
export type RigidBodyComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.rigidBody,
  RigidBodyComponentData
>;
export type ScriptComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.script,
  ScriptComponentData
>;
export type InteractableComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.interactable,
  InteractableComponentData
>;
export type BuildingPieceComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.buildingPiece,
  BuildingPieceComponentData
>;
export type NpcComponent = SceneComponent<
  typeof SCENE_COMPONENT_TYPES.npc,
  NpcComponentData
>;

export type StandardSceneComponent =
  | MeshRendererComponent
  | ColliderComponent
  | RigidBodyComponent
  | ScriptComponent
  | InteractableComponent
  | BuildingPieceComponent
  | NpcComponent;

export function createMeshRendererComponent(data: MeshRendererComponentData = {}): MeshRendererComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.meshRenderer,
    data,
  });
}

export function createColliderComponent(data: ColliderComponentData): ColliderComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.collider,
    data,
  });
}

export function createRigidBodyComponent(data: RigidBodyComponentData): RigidBodyComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.rigidBody,
    data,
  });
}

export function createScriptComponent(data: ScriptComponentData): ScriptComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.script,
    data,
  });
}

export function createInteractableComponent(data: InteractableComponentData): InteractableComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.interactable,
    data,
  });
}

export function createBuildingPieceComponent(data: BuildingPieceComponentData): BuildingPieceComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.buildingPiece,
    data,
  });
}

export function createNpcComponent(data: NpcComponentData): NpcComponent {
  return createSceneComponent({
    type: SCENE_COMPONENT_TYPES.npc,
    data,
  });
}

