import type {
  CreateSceneObjectInput,
  SceneComponent,
  SceneJsonObject,
  SceneJsonValue,
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

export type PrefabInstanceLink = {
  prefabId: PrefabId;
  idPrefix: string;
};

export type PrefabPropertyPath =
  | 'name'
  | 'tags'
  | 'layer'
  | 'transform.position'
  | 'transform.rotation'
  | 'transform.scale';

export type PrefabOverride =
  | { kind: 'property'; objectId: SceneObjectId; path: PrefabPropertyPath; value: SceneJsonValue }
  | { kind: 'componentData'; objectId: SceneObjectId; componentId: string; data: SceneJsonObject; enabled: boolean }
  | { kind: 'addedComponent'; objectId: SceneObjectId; component: SceneComponent }
  | { kind: 'removedComponent'; objectId: SceneObjectId; componentId: string }
  | { kind: 'addedObject'; object: SceneObject }
  | { kind: 'removedObject'; objectId: SceneObjectId };

export type ComputePrefabOverridesOptions = {
  includeRootTransform?: boolean;
};

export type PrefabInstanceResult = {
  objects: SceneObject[];
  link: PrefabInstanceLink;
};
