import type {
  CreateSceneComponentInput,
  CreateSceneObjectInput,
  SceneComponent,
  SceneDocument,
  SceneEuler,
  SceneJsonObject,
  SceneObject,
  SceneObjectId,
  SceneTransform,
  SceneValidationIssue,
  SceneValidationResult,
  SceneVector3,
} from './types';

export const SCENE_DOCUMENT_VERSION = 1;

export const DEFAULT_SCENE_TRANSFORM: SceneTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

let sceneObjectCounter = 0;
let sceneComponentCounter = 0;

export function createSceneComponent<
  TType extends string,
  TData extends SceneJsonObject = SceneJsonObject,
>(input: CreateSceneComponentInput<TType, TData>): SceneComponent<TType, TData> {
  return {
    id: input.id ?? `component-${++sceneComponentCounter}`,
    type: input.type,
    enabled: input.enabled ?? true,
    data: input.data ?? ({} as TData),
  };
}

export function createSceneObject(input: CreateSceneObjectInput = {}): SceneObject {
  return {
    id: input.id ?? `object-${++sceneObjectCounter}`,
    name: input.name ?? 'Scene Object',
    ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
    transform: normalizeTransform(input.transform),
    components: (input.components ?? []).map((component) => (
      isSceneComponent(component)
        ? component
        : createSceneComponent(component)
    )),
    tags: [...(input.tags ?? [])],
    ...(input.layer !== undefined ? { layer: input.layer } : {}),
  };
}

export function createSceneDocument(
  input: Omit<SceneDocument, 'version' | 'objects'> & { objects?: CreateSceneObjectInput[] },
): SceneDocument {
  return {
    version: SCENE_DOCUMENT_VERSION,
    id: input.id,
    ...(input.name !== undefined ? { name: input.name } : {}),
    objects: (input.objects ?? []).map((object) => createSceneObject(object)),
  };
}

export function validateSceneDocument(document: SceneDocument): SceneValidationResult {
  const issues: SceneValidationIssue[] = [];
  const objectIds = new Set<SceneObjectId>();
  const objectById = new Map<SceneObjectId, SceneObject>();

  for (const object of document.objects) {
    if (objectIds.has(object.id)) {
      issues.push({
        code: 'duplicate-object-id',
        objectId: object.id,
        message: `Scene object "${object.id}" is duplicated.`,
      });
    }
    objectIds.add(object.id);
    objectById.set(object.id, object);

    if (!isValidVector3(object.transform.position) || !isValidVector3(object.transform.rotation) || !isValidVector3(object.transform.scale)) {
      issues.push({
        code: 'invalid-transform',
        objectId: object.id,
        message: `Scene object "${object.id}" has an invalid transform.`,
      });
    }

    const componentIds = new Set<string>();
    for (const component of object.components) {
      if (componentIds.has(component.id)) {
        issues.push({
          code: 'duplicate-component-id',
          objectId: object.id,
          componentId: component.id,
          message: `Scene object "${object.id}" has duplicate component "${component.id}".`,
        });
      }
      componentIds.add(component.id);
    }
  }

  for (const object of document.objects) {
    if (object.parentId === undefined) continue;
    if (object.parentId === object.id) {
      issues.push({
        code: 'self-parent',
        objectId: object.id,
        message: `Scene object "${object.id}" cannot parent itself.`,
      });
      continue;
    }
    if (!objectById.has(object.parentId)) {
      issues.push({
        code: 'missing-parent',
        objectId: object.id,
        message: `Scene object "${object.id}" references missing parent "${object.parentId}".`,
      });
      continue;
    }
    if (hasParentCycle(object, objectById)) {
      issues.push({
        code: 'parent-cycle',
        objectId: object.id,
        message: `Scene object "${object.id}" is part of a parent cycle.`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function getSceneChildren(document: SceneDocument, parentId: SceneObjectId | undefined): SceneObject[] {
  return document.objects.filter((object) => object.parentId === parentId);
}

function normalizeTransform(transform: Partial<SceneTransform> | undefined): SceneTransform {
  return {
    position: normalizeVector3(transform?.position, DEFAULT_SCENE_TRANSFORM.position),
    rotation: normalizeVector3(transform?.rotation, DEFAULT_SCENE_TRANSFORM.rotation),
    scale: normalizeVector3(transform?.scale, DEFAULT_SCENE_TRANSFORM.scale),
  };
}

function normalizeVector3(value: SceneVector3 | SceneEuler | undefined, fallback: SceneVector3): SceneVector3 {
  if (!value) return [...fallback] as unknown as SceneVector3;
  return [value[0], value[1], value[2]];
}

function isSceneComponent(value: SceneComponent | CreateSceneComponentInput): value is SceneComponent {
  return (
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.enabled === 'boolean' &&
    value.data !== undefined
  );
}

function isValidVector3(value: SceneVector3 | SceneEuler): boolean {
  return value.length === 3 && value.every((entry) => Number.isFinite(entry));
}

function hasParentCycle(object: SceneObject, objectById: Map<SceneObjectId, SceneObject>): boolean {
  const visited = new Set<SceneObjectId>();
  let next: SceneObject | undefined = object;

  while (next?.parentId !== undefined) {
    if (visited.has(next.parentId)) return true;
    visited.add(next.id);
    next = objectById.get(next.parentId);
  }

  return false;
}

