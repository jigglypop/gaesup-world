import { createSceneDocument, createSceneObject, validateSceneDocument } from './core';
import type {
  CreateSceneComponentInput,
  SceneDocument,
  SceneJsonAuthoringObject,
  SceneObject,
  SceneTransform,
  SceneValidationIssue,
  SceneValidationResult,
} from './types';

export interface ParseSceneDocumentResult {
  ok: boolean;
  document?: SceneDocument;
  issues: SceneValidationIssue[];
}

const MISSING_PROPERTY = Symbol('missing-scene-property');

class SceneDocumentShapeError extends TypeError {}

class SceneTransformError extends TypeError {}

export function serializeSceneDocument(document: SceneDocument): string {
  const issue = validateSceneDocument(document).issues[0];
  if (issue) throw new TypeError(issue.message);

  const canonicalDocument = createSceneDocument({
    id: document.id,
    ...(document.name !== undefined ? { name: document.name } : {}),
    objects: document.objects,
  });
  const canonicalIssue = validateSceneDocument(canonicalDocument).issues[0];
  if (canonicalIssue) throw new TypeError(canonicalIssue.message);

  return JSON.stringify(canonicalDocument);
}

export function cloneSceneDocument(document: SceneDocument): SceneDocument {
  return (
    parseSceneDocument(serializeSceneDocument(document)).document ?? {
      version: 1,
      id: document.id,
      objects: [],
    }
  );
}

export function parseSceneDocument(input: string | unknown): ParseSceneDocumentResult {
  const raw = typeof input === 'string' ? parseJson(input) : input;
  let version: unknown | typeof MISSING_PROPERTY;
  let id: unknown | typeof MISSING_PROPERTY;
  let name: unknown | typeof MISSING_PROPERTY;
  let objectValues: unknown | typeof MISSING_PROPERTY;
  try {
    assertPlainRecord(raw, 'Scene document');
    version = readOwnDataProperty(raw, 'version');
    id = readOwnDataProperty(raw, 'id');
    name = readOwnDataProperty(raw, 'name');
    objectValues = readOwnDataProperty(raw, 'objects');
  } catch (error) {
    return invalid(
      error instanceof Error ? error.message : 'Scene document must be a plain data object.',
      'invalid-document-shape',
    );
  }

  if (version !== 1) {
    return invalid('Scene document version must be 1.');
  }
  if (typeof id !== 'string' || !id.trim()) {
    return invalid('Scene document id must be a non-empty string.');
  }
  if (name !== MISSING_PROPERTY && typeof name !== 'string') {
    return invalid('Scene document name must be a string.', 'invalid-document-shape');
  }
  if (!Array.isArray(objectValues)) {
    return invalid('Scene document objects must be an array.');
  }

  let objectInputs: unknown[];
  try {
    objectInputs = readSceneObjectArray(objectValues);
  } catch (error) {
    return invalid(
      error instanceof Error ? error.message : 'Scene document objects are invalid.',
      'invalid-document-shape',
    );
  }

  let document: SceneDocument;
  try {
    document = {
      version: 1,
      id,
      ...(typeof name === 'string' ? { name } : {}),
      objects: objectInputs.map((object) => normalizeSceneObject(object)),
    };
  } catch (error) {
    return invalid(
      error instanceof Error ? error.message : 'Scene component data is invalid.',
      error instanceof SceneTransformError
        ? 'invalid-transform'
        : error instanceof SceneDocumentShapeError
          ? 'invalid-document-shape'
          : 'invalid-component-data',
    );
  }
  const validation = validateSceneDocument(document);
  return {
    ok: validation.valid,
    document,
    issues: validation.issues,
  };
}

function readSceneObjectArray(values: unknown[]): unknown[] {
  return readDenseDataArray(values, 'Scene document objects');
}

function readDenseDataArray(values: unknown[], label: string): unknown[] {
  const keys = Reflect.ownKeys(values);
  if (keys.length !== values.length + 1) {
    throw new SceneDocumentShapeError(`${label} must be a dense array.`);
  }
  if (
    !keys.every(
      (key) => key === 'length' || (typeof key === 'string' && /^0$|^[1-9]\d*$/.test(key)),
    )
  ) {
    throw new SceneDocumentShapeError(`${label} must not contain custom properties.`);
  }

  const objects: unknown[] = [];
  for (let index = 0; index < values.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(values, String(index));
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new SceneDocumentShapeError(`${label} must contain only data elements.`);
    }
    objects.push(descriptor.value);
  }
  return objects;
}

export function validateSerializedSceneDocument(input: string | unknown): SceneValidationResult {
  const parsed = parseSceneDocument(input);
  return {
    valid: parsed.ok,
    issues: parsed.issues,
  };
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function invalid(
  message: string,
  code: SceneValidationIssue['code'] = 'invalid-transform',
): ParseSceneDocumentResult {
  return {
    ok: false,
    issues: [{ code, message }],
  };
}

function normalizeSceneObject(input: unknown): SceneObject {
  assertPlainRecord(input, 'Scene object');

  const id = readOwnDataProperty(input, 'id');
  if (typeof id !== 'string' || !id.trim()) {
    throw new SceneDocumentShapeError('Persisted scene object id must be a non-empty string.');
  }
  const name = readOwnDataProperty(input, 'name');
  if (name !== MISSING_PROPERTY && typeof name !== 'string') {
    throw new SceneDocumentShapeError('Scene object name must be a string when provided.');
  }
  const parentId = readOwnDataProperty(input, 'parentId');
  if (parentId !== MISSING_PROPERTY && (typeof parentId !== 'string' || !parentId.trim())) {
    throw new SceneDocumentShapeError(
      'Scene object parentId must be a non-empty string when provided.',
    );
  }
  const transform = readOwnDataProperty(input, 'transform');
  if (
    transform !== MISSING_PROPERTY &&
    (transform === null || typeof transform !== 'object' || Array.isArray(transform))
  ) {
    throw new SceneTransformError('Scene object transform must be an object when provided.');
  }
  const normalizedTransform =
    transform === MISSING_PROPERTY ? MISSING_PROPERTY : normalizePersistedTransform(transform);
  const componentValues = readOwnDataProperty(input, 'components');
  if (componentValues !== MISSING_PROPERTY && !Array.isArray(componentValues)) {
    throw new SceneDocumentShapeError('Scene object components must be an array when provided.');
  }
  const components =
    componentValues === MISSING_PROPERTY
      ? []
      : readDenseDataArray(componentValues, 'Scene object components').map(
          normalizePersistedSceneComponent,
        );
  const tagValues = readOwnDataProperty(input, 'tags');
  if (tagValues !== MISSING_PROPERTY && !Array.isArray(tagValues)) {
    throw new SceneDocumentShapeError('Scene object tags must be an array when provided.');
  }
  const tags =
    tagValues === MISSING_PROPERTY ? [] : readDenseDataArray(tagValues, 'Scene object tags');
  if (!tags.every((tag) => typeof tag === 'string')) {
    throw new SceneDocumentShapeError('Scene object tags must contain only strings.');
  }
  const layer = readOwnDataProperty(input, 'layer');
  if (layer !== MISSING_PROPERTY && typeof layer !== 'string') {
    throw new SceneDocumentShapeError('Scene object layer must be a string when provided.');
  }

  return createSceneObject({
    id,
    ...(name !== MISSING_PROPERTY ? { name } : {}),
    ...(parentId !== MISSING_PROPERTY ? { parentId } : {}),
    ...(normalizedTransform !== MISSING_PROPERTY ? { transform: normalizedTransform } : {}),
    components,
    tags: tags as string[],
    ...(layer !== MISSING_PROPERTY ? { layer } : {}),
  });
}

function normalizePersistedTransform(value: object): Partial<SceneTransform> {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new SceneTransformError('Scene object transform must be a plain object.');
  }

  const position = readOwnDataProperty(value, 'position');
  const rotation = readOwnDataProperty(value, 'rotation');
  const scale = readOwnDataProperty(value, 'scale');
  return {
    ...(position !== MISSING_PROPERTY
      ? { position: readPersistedVector3(position, 'position') }
      : {}),
    ...(rotation !== MISSING_PROPERTY
      ? { rotation: readPersistedVector3(rotation, 'rotation') }
      : {}),
    ...(scale !== MISSING_PROPERTY ? { scale: readPersistedVector3(scale, 'scale') } : {}),
  };
}

function readPersistedVector3(value: unknown, label: string): SceneTransform['position'] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new SceneTransformError(`Scene transform ${label} must be a 3-tuple.`);
  }
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== 4 ||
    !keys.every((key) => key === 'length' || (typeof key === 'string' && /^[0-2]$/.test(key)))
  ) {
    throw new SceneTransformError(`Scene transform ${label} must be a dense 3-tuple.`);
  }

  const output: [number, number, number] = [0, 0, 0];
  for (let index = 0; index < value.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (
      !descriptor?.enumerable ||
      !('value' in descriptor) ||
      typeof descriptor.value !== 'number' ||
      !Number.isFinite(descriptor.value) ||
      Object.is(descriptor.value, -0)
    ) {
      throw new SceneTransformError(
        `Scene transform ${label} must contain finite canonical numbers.`,
      );
    }
    output[index] = descriptor.value;
  }
  return output;
}

function normalizePersistedSceneComponent(
  input: unknown,
): CreateSceneComponentInput<string, SceneJsonAuthoringObject> {
  assertPlainRecord(input, 'Scene component');

  const id = readOwnDataProperty(input, 'id');
  const type = readOwnDataProperty(input, 'type');
  const enabled = readOwnDataProperty(input, 'enabled');
  const data = readOwnDataProperty(input, 'data');
  if (typeof id !== 'string' || !id.trim()) {
    throw new SceneDocumentShapeError('Persisted scene component id must be a non-empty string.');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw new SceneDocumentShapeError('Persisted scene component type must be a non-empty string.');
  }
  if (typeof enabled !== 'boolean') {
    throw new SceneDocumentShapeError('Persisted scene component enabled must be a boolean.');
  }
  if (
    data === MISSING_PROPERTY ||
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw new SceneDocumentShapeError('Persisted scene component data must be an object.');
  }

  return { id, type, enabled, data: data as SceneJsonAuthoringObject };
}

function assertPlainRecord(value: unknown, label: string): asserts value is object {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new SceneDocumentShapeError(`${label} must be an object.`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new SceneDocumentShapeError(`${label} must be a plain object.`);
  }
}

function readOwnDataProperty(value: object, key: string): unknown | typeof MISSING_PROPERTY {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined) return MISSING_PROPERTY;
  if (!descriptor.enumerable || !('value' in descriptor)) {
    throw new SceneDocumentShapeError(`Scene property "${key}" must be enumerable data.`);
  }
  return descriptor.value;
}
