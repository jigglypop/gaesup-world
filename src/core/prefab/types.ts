import type {
  CreateSceneObjectInput,
  SceneObject,
  SceneObjectId,
  SceneTransform,
} from '../scene-object';

export type PrefabId = string;
export type PrefabDocumentVersion = 1;

export interface PrefabMetadata {
  description?: string;
  thumbnailUrl?: string;
  tags: string[];
  sourceSceneId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrefabDocument {
  version: PrefabDocumentVersion;
  id: PrefabId;
  name: string;
  objects: SceneObject[];
  rootObjectIds: SceneObjectId[];
  metadata: PrefabMetadata;
}

export interface CreatePrefabDocumentInput {
  id: PrefabId;
  name?: string;
  objects?: CreateSceneObjectInput[];
  rootObjectIds?: SceneObjectId[];
  metadata?: Partial<PrefabMetadata>;
}

export interface InstantiatePrefabOptions {
  idPrefix?: string;
  parentId?: SceneObjectId;
  rootTransform?: Partial<SceneTransform>;
  nameSuffix?: string;
}

export type PrefabValidationIssueCode =
  | 'unsupported-prefab-version'
  | 'invalid-prefab-id'
  | 'empty-prefab'
  | 'missing-root-object'
  | 'invalid-root-object'
  | 'invalid-prefab-scene';

export interface PrefabValidationIssue {
  code: PrefabValidationIssueCode;
  objectId?: SceneObjectId;
  message: string;
}

export interface PrefabValidationResult {
  valid: boolean;
  issues: PrefabValidationIssue[];
}

export interface ParsePrefabDocumentResult {
  ok: boolean;
  prefab?: PrefabDocument;
  issues: PrefabValidationIssue[];
}
