import type {
  CanonicalSceneJsonValue,
  CanonicalSceneJsonObject,
  CreateSceneComponentInput,
  CreateSceneObjectInput,
  SceneComponent,
  SceneDocument,
  SceneEuler,
  SceneJsonAuthoringObject,
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

export function createSceneComponent<TType extends string, TData extends SceneJsonAuthoringObject>(
  input: CreateSceneComponentInput<TType, TData> & { data: TData },
): SceneComponent<TType, TData>;
export function createSceneComponent<TType extends string>(
  input: CreateSceneComponentInput<TType>,
): SceneComponent<TType>;
export function createSceneComponent(input: CreateSceneComponentInput): SceneComponent {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Scene component input must be an object.');
  }
  const { data: inputData, enabled, id, type } = input;
  if (typeof type !== 'string' || !type.trim()) {
    throw new TypeError('Scene component type must be a non-empty string.');
  }
  if (id !== undefined && (typeof id !== 'string' || !id.trim())) {
    throw new TypeError('Scene component id must be a non-empty string when provided.');
  }
  if (enabled !== undefined && typeof enabled !== 'boolean') {
    throw new TypeError('Scene component enabled must be a boolean when provided.');
  }
  const data = createCanonicalSceneJsonObject(
    inputData === undefined ? {} : inputData,
    `Scene component "${type}" data`,
  );

  return {
    id: id ?? `component-${++sceneComponentCounter}`,
    type,
    enabled: enabled ?? true,
    data,
  };
}

export function createSceneObject(input: CreateSceneObjectInput = {}): SceneObject {
  return {
    id: input.id ?? `object-${++sceneObjectCounter}`,
    name: input.name ?? 'Scene Object',
    ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
    transform: normalizeTransform(input.transform),
    components: mapOwnedArray(
      input.components ?? [],
      'Scene object components',
      normalizeSceneComponent,
    ),
    tags: mapOwnedArray(input.tags ?? [], 'Scene object tags', (tag) => tag),
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
    objects: mapOwnedArray(input.objects ?? [], 'Scene document objects', (object) =>
      createSceneObject(object),
    ),
  };
}

export function validateSceneDocument(document: SceneDocument): SceneValidationResult {
  const issues: SceneValidationIssue[] = [];
  if (
    document === null ||
    typeof document !== 'object' ||
    document.version !== SCENE_DOCUMENT_VERSION ||
    typeof document.id !== 'string' ||
    !document.id.trim() ||
    (document.name !== undefined && typeof document.name !== 'string') ||
    !Array.isArray(document.objects)
  ) {
    return {
      valid: false,
      issues: [{ code: 'invalid-document-shape', message: 'Scene document shape is invalid.' }],
    };
  }
  const objectIds = new Set<SceneObjectId>();
  const objectById = new Map<SceneObjectId, SceneObject>();

  for (const object of document.objects) {
    if (!isValidSceneObjectRecord(object)) {
      issues.push({
        code: 'invalid-document-shape',
        message: 'Scene document contains an invalid object record.',
      });
      continue;
    }
    if (objectIds.has(object.id)) {
      issues.push({
        code: 'duplicate-object-id',
        objectId: object.id,
        message: `Scene object "${object.id}" is duplicated.`,
      });
    }
    objectIds.add(object.id);
    objectById.set(object.id, object);

    if (
      !isValidVector3(object.transform.position) ||
      !isValidVector3(object.transform.rotation) ||
      !isValidVector3(object.transform.scale)
    ) {
      issues.push({
        code: 'invalid-transform',
        objectId: object.id,
        message: `Scene object "${object.id}" has an invalid transform.`,
      });
    }

    const componentIds = new Set<string>();
    for (const component of object.components) {
      if (!isValidSceneComponentRecord(component)) {
        issues.push({
          code: 'invalid-document-shape',
          objectId: object.id,
          message: `Scene object "${object.id}" contains an invalid component record.`,
        });
        continue;
      }
      if (componentIds.has(component.id)) {
        issues.push({
          code: 'duplicate-component-id',
          objectId: object.id,
          componentId: component.id,
          message: `Scene object "${object.id}" has duplicate component "${component.id}".`,
        });
      }
      componentIds.add(component.id);
      if (!isCanonicalSceneJsonObject(component.data)) {
        issues.push({
          code: 'invalid-component-data',
          objectId: object.id,
          componentId: component.id,
          message: `Scene component "${component.id}" contains non-canonical JSON data.`,
        });
      }
    }
  }

  for (const object of document.objects) {
    if (!isValidSceneObjectRecord(object)) continue;
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

export function getSceneChildren(
  document: SceneDocument,
  parentId: SceneObjectId | undefined,
): SceneObject[] {
  return document.objects.filter((object) => object.parentId === parentId);
}

function normalizeTransform(transform: Partial<SceneTransform> | undefined): SceneTransform {
  return {
    position: normalizeVector3(transform?.position, DEFAULT_SCENE_TRANSFORM.position),
    rotation: normalizeVector3(transform?.rotation, DEFAULT_SCENE_TRANSFORM.rotation),
    scale: normalizeVector3(transform?.scale, DEFAULT_SCENE_TRANSFORM.scale),
  };
}

function normalizeVector3(
  value: SceneVector3 | SceneEuler | undefined,
  fallback: SceneVector3,
): SceneVector3 {
  if (value === undefined) return [...fallback] as unknown as SceneVector3;
  return [value[0], value[1], value[2]];
}

function isSceneComponent(value: unknown): value is SceneComponent {
  return isValidSceneComponentRecord(value);
}

function normalizeSceneComponent(
  component: SceneComponent | CreateSceneComponentInput,
): SceneComponent {
  if (!isSceneComponent(component)) return createSceneComponent(component);

  return {
    id: component.id,
    type: component.type,
    enabled: component.enabled,
    data: createCanonicalSceneJsonObject(component.data, `Scene component "${component.id}" data`),
  };
}

export function isCanonicalSceneJsonObject(value: unknown): value is CanonicalSceneJsonObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  return isCanonicalSceneJsonObjectInternal(value, new WeakSet<object>());
}

function createCanonicalSceneJsonObject(value: unknown, label: string): CanonicalSceneJsonObject {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError();
    }

    return cloneCanonicalSceneJsonObject(
      value,
      new WeakSet<object>(),
      new WeakMap<object, CanonicalSceneJsonValue>(),
    );
  } catch {
    throw new TypeError(`${label} must contain only canonical JSON values.`);
  }
}

function cloneCanonicalSceneJsonValue(
  value: unknown,
  ancestors: WeakSet<object>,
  clones: WeakMap<object, CanonicalSceneJsonValue>,
): CanonicalSceneJsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new TypeError();
    return value;
  }
  if (typeof value !== 'object' || ancestors.has(value)) throw new TypeError();

  const existingClone = clones.get(value);
  if (existingClone !== undefined) return existingClone;

  if (Array.isArray(value)) {
    return cloneCanonicalSceneJsonArray(value, ancestors, clones);
  }
  return cloneCanonicalSceneJsonObject(value, ancestors, clones);
}

function cloneCanonicalSceneJsonArray(
  value: unknown[],
  ancestors: WeakSet<object>,
  clones: WeakMap<object, CanonicalSceneJsonValue>,
): readonly CanonicalSceneJsonValue[] {
  if (Object.getPrototypeOf(value) !== Array.prototype) throw new TypeError();

  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1) throw new TypeError();
  if (
    !keys.every(
      (key) => key === 'length' || (typeof key === 'string' && /^0$|^[1-9]\d*$/.test(key)),
    )
  ) {
    throw new TypeError();
  }

  const clone: CanonicalSceneJsonValue[] = [];
  clones.set(value, clone);
  ancestors.add(value);
  try {
    for (let index = 0; index < value.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor?.enumerable || !('value' in descriptor)) throw new TypeError();
      clone.push(cloneCanonicalSceneJsonValue(descriptor.value, ancestors, clones));
    }
  } finally {
    ancestors.delete(value);
  }

  return clone;
}

function cloneCanonicalSceneJsonObject(
  value: object,
  ancestors: WeakSet<object>,
  clones: WeakMap<object, CanonicalSceneJsonValue>,
): CanonicalSceneJsonObject {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError();

  const clone: Record<string, CanonicalSceneJsonValue> = {};
  clones.set(value, clone);
  ancestors.add(value);
  try {
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string') throw new TypeError();
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !('value' in descriptor)) throw new TypeError();
      Object.defineProperty(clone, key, {
        configurable: true,
        enumerable: true,
        value: cloneCanonicalSceneJsonValue(descriptor.value, ancestors, clones),
        writable: true,
      });
    }
  } finally {
    ancestors.delete(value);
  }

  return clone;
}

function mapOwnedArray<TInput, TOutput>(
  values: readonly TInput[],
  label: string,
  mapValue: (value: TInput) => TOutput,
): TOutput[] {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array.`);

  const keys = Reflect.ownKeys(values);
  if (keys.length !== values.length + 1) throw new TypeError(`${label} must be a dense array.`);
  if (
    !keys.every(
      (key) => key === 'length' || (typeof key === 'string' && /^0$|^[1-9]\d*$/.test(key)),
    )
  ) {
    throw new TypeError(`${label} must not contain custom properties.`);
  }

  const output: TOutput[] = [];
  for (let index = 0; index < values.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(values, String(index));
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError(`${label} must contain only data elements.`);
    }
    output.push(mapValue(descriptor.value));
  }
  return output;
}

function isCanonicalSceneJsonValue(value: unknown, ancestors: WeakSet<object>): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value) && !Object.is(value, -0);
  if (typeof value !== 'object') return false;
  if (ancestors.has(value)) return false;

  ancestors.add(value);
  try {
    if (Array.isArray(value)) return isCanonicalSceneJsonArray(value, ancestors);
    return isCanonicalSceneJsonObjectInternal(value, ancestors);
  } finally {
    ancestors.delete(value);
  }
}

function isCanonicalSceneJsonArray(value: unknown[], ancestors: WeakSet<object>): boolean {
  if (Object.getPrototypeOf(value) !== Array.prototype) return false;

  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1) return false;

  for (let index = 0; index < value.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !('value' in descriptor)) return false;
    if (!isCanonicalSceneJsonValue(descriptor.value, ancestors)) return false;
  }

  return keys.every(
    (key) => key === 'length' || (typeof key === 'string' && /^0$|^[1-9]\d*$/.test(key)),
  );
}

function isCanonicalSceneJsonObjectInternal(
  value: object,
  ancestors: WeakSet<object>,
): value is CanonicalSceneJsonObject {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) return false;
    if (!isCanonicalSceneJsonValue(descriptor.value, ancestors)) return false;
  }

  return true;
}

function isValidSceneObjectRecord(value: unknown): value is SceneObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const object = value as Partial<SceneObject>;
  return (
    typeof object.id === 'string' &&
    Boolean(object.id.trim()) &&
    typeof object.name === 'string' &&
    (object.parentId === undefined || typeof object.parentId === 'string') &&
    object.transform !== null &&
    typeof object.transform === 'object' &&
    Array.isArray(object.components) &&
    Array.isArray(object.tags) &&
    object.tags.every((tag) => typeof tag === 'string') &&
    (object.layer === undefined || typeof object.layer === 'string')
  );
}

function isValidSceneComponentRecord(value: unknown): value is SceneComponent {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const component = value as Partial<SceneComponent>;
  return (
    typeof component.id === 'string' &&
    Boolean(component.id.trim()) &&
    typeof component.type === 'string' &&
    Boolean(component.type.trim()) &&
    typeof component.enabled === 'boolean' &&
    component.data !== null &&
    typeof component.data === 'object' &&
    !Array.isArray(component.data)
  );
}

function isValidVector3(value: unknown): value is SceneVector3 | SceneEuler {
  if (!Array.isArray(value) || value.length !== 3) return false;

  for (let index = 0; index < value.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (
      !descriptor?.enumerable ||
      !('value' in descriptor) ||
      typeof descriptor.value !== 'number' ||
      !Number.isFinite(descriptor.value) ||
      Object.is(descriptor.value, -0)
    ) {
      return false;
    }
  }
  return true;
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
