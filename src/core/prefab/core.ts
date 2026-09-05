import {
  createSceneDocument,
  createSceneObject,
  validateSceneDocument,
  type SceneObject,
  type SceneObjectId,
} from '../scene-object';
import type {
  CreatePrefabDocumentInput,
  PrefabDocument,
  PrefabMetadata,
  PrefabValidationIssue,
  PrefabValidationResult,
} from './types';

export const PREFAB_DOCUMENT_VERSION = 1;

export const DEFAULT_PREFAB_METADATA: PrefabMetadata = {
  tags: [],
};

export function createPrefabDocument(input: CreatePrefabDocumentInput): PrefabDocument {
  const objects = (input.objects ?? []).map((object) => createSceneObject(object));
  const rootObjectIds = input.rootObjectIds ?? getPrefabRootObjectIds(objects);

  return {
    version: PREFAB_DOCUMENT_VERSION,
    id: input.id,
    name: input.name ?? input.id,
    objects,
    rootObjectIds,
    metadata: {
      ...DEFAULT_PREFAB_METADATA,
      ...input.metadata,
      tags: [...(input.metadata?.tags ?? DEFAULT_PREFAB_METADATA.tags)],
    },
  };
}

export function createPrefabFromSceneObjects(input: {
  id: string;
  name?: string;
  objects: SceneObject[];
  rootObjectIds?: SceneObjectId[];
  metadata?: Partial<PrefabMetadata>;
}): PrefabDocument {
  return createPrefabDocument({
    id: input.id,
    ...(input.name !== undefined ? { name: input.name } : {}),
    objects: input.objects,
    ...(input.rootObjectIds !== undefined ? { rootObjectIds: input.rootObjectIds } : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  });
}

export function validatePrefabDocument(prefab: PrefabDocument): PrefabValidationResult {
  const issues: PrefabValidationIssue[] = [];

  if (prefab.version !== PREFAB_DOCUMENT_VERSION) {
    issues.push({
      code: 'unsupported-prefab-version',
      message: `Prefab document version must be ${PREFAB_DOCUMENT_VERSION}.`,
    });
  }
  if (typeof prefab.id !== 'string' || !prefab.id.trim()) {
    issues.push({
      code: 'invalid-prefab-id',
      message: 'Prefab id must be a non-empty string.',
    });
  }
  if (prefab.objects.length === 0) {
    issues.push({
      code: 'empty-prefab',
      message: 'Prefab must contain at least one scene object.',
    });
  }

  const sceneValidation = validateSceneDocument(createSceneDocument({
    id: `prefab:${prefab.id || 'unknown'}`,
    objects: prefab.objects,
  }));
  for (const issue of sceneValidation.issues) {
    issues.push({
      code: 'invalid-prefab-scene',
      ...(issue.objectId !== undefined ? { objectId: issue.objectId } : {}),
      message: issue.message,
    });
  }

  const objectIds = new Set(prefab.objects.map((object) => object.id));
  for (const rootObjectId of prefab.rootObjectIds) {
    if (!objectIds.has(rootObjectId)) {
      issues.push({
        code: 'missing-root-object',
        objectId: rootObjectId,
        message: `Prefab root object "${rootObjectId}" does not exist.`,
      });
    }
  }

  for (const object of prefab.objects) {
    if (object.parentId === undefined && !prefab.rootObjectIds.includes(object.id)) {
      issues.push({
        code: 'invalid-root-object',
        objectId: object.id,
        message: `Top-level object "${object.id}" must be listed in rootObjectIds.`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function getPrefabRootObjectIds(objects: SceneObject[]): SceneObjectId[] {
  const objectIds = new Set(objects.map((object) => object.id));
  return objects
    .filter((object) => object.parentId === undefined || !objectIds.has(object.parentId))
    .map((object) => object.id);
}
