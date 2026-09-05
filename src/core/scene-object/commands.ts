import { SCENE_DOCUMENT_VERSION, isCanonicalSceneJsonObject } from './core';
import { deepFreezeOwned } from './ownership';
import { parseSceneDocument } from './serialization';
import type {
  SceneDocument,
  SceneDocumentCommand,
  SceneDocumentCommandAcceptedResult,
  SceneDocumentCommandRejectedResult,
  SceneDocumentCommandResult,
  SceneDocumentEvent,
  SceneEuler,
  SceneObject,
  SceneObjectCommandPatch,
  SceneObjectCommandTransformPatch,
  SceneObjectId,
  SceneTag,
  SceneValidationIssue,
  SceneVector3,
} from './types';

const MISSING_PROPERTY = Symbol('missing-scene-command-property');

type SceneCommandMutation = {
  candidate: unknown;
  createEvent: (document: SceneDocument) => SceneDocumentEvent;
};

class SceneCommandIssueError extends Error {
  readonly issue: SceneValidationIssue;

  constructor(issue: SceneValidationIssue) {
    super(issue.message);
    this.issue = issue;
  }
}

export function applySceneDocumentCommand(
  document: SceneDocument,
  command: SceneDocumentCommand,
): SceneDocumentCommandResult {
  try {
    assertCanonicalSceneDocument(document, 'Current scene document');
  } catch (error) {
    return createRejectedResult(document, [
      {
        code: 'invalid-document-shape',
        message: error instanceof Error ? error.message : 'Current scene document is invalid.',
      },
    ]);
  }
  const parsedCurrent = parseSceneDocument(document);
  if (!parsedCurrent.ok || !parsedCurrent.document) {
    return createRejectedResult(document, parsedCurrent.issues);
  }

  let mutation: SceneCommandMutation;
  try {
    mutation = createMutation(parsedCurrent.document, command);
  } catch (error) {
    const issue =
      error instanceof SceneCommandIssueError
        ? error.issue
        : {
            code: 'invalid-scene-command' as const,
            message: error instanceof Error ? error.message : 'Scene command is invalid.',
          };
    return createRejectedResult(document, [issue]);
  }

  const parsedCandidate = parseSceneDocument(mutation.candidate);
  if (!parsedCandidate.ok || !parsedCandidate.document) {
    return createRejectedResult(document, parsedCandidate.issues);
  }

  return createAcceptedResult(
    parsedCandidate.document,
    mutation.createEvent(parsedCandidate.document),
  );
}

function createMutation(
  document: SceneDocument,
  commandInput: SceneDocumentCommand,
): SceneCommandMutation {
  const command = assertPlainDataRecord(commandInput, 'Scene command');
  const type = readRequiredString(command, 'type', 'Scene command type');

  switch (type) {
    case 'scene-document.replace': {
      assertOnlyKeys(command, ['type', 'document'], 'Replace scene command');
      const replacement = readRequiredProperty(command, 'document', 'Replacement scene document');
      assertCanonicalSceneDocument(replacement, 'Replacement scene document');
      return {
        candidate: replacement,
        createEvent: (nextDocument) => ({
          type: 'scene-document.replaced',
          documentId: nextDocument.id,
        }),
      };
    }
    case 'scene-object.create': {
      assertOnlyKeys(command, ['type', 'object'], 'Create scene object command');
      const object = readRequiredProperty(command, 'object', 'Created scene object');
      const objectId = assertMaterializedSceneObject(object);
      return {
        candidate: withObjects(document, [...document.objects, object]),
        createEvent: (nextDocument) => ({
          type: 'scene-object.created',
          documentId: nextDocument.id,
          objectId,
        }),
      };
    }
    case 'scene-object.update': {
      assertOnlyKeys(command, ['type', 'objectId', 'patch'], 'Update scene object command');
      const objectId = readRequiredIdentifier(command, 'objectId', 'Scene object id');
      const object = findRequiredObject(document, objectId);
      const patch = normalizeCommandPatch(
        readRequiredProperty(command, 'patch', 'Scene object patch'),
      );
      const nextObject = applyCommandPatch(object, patch);
      return {
        candidate: withObjects(
          document,
          document.objects.map((entry) => (entry.id === objectId ? nextObject : entry)),
        ),
        createEvent: (nextDocument) => ({
          type: 'scene-object.updated',
          documentId: nextDocument.id,
          objectId,
        }),
      };
    }
    case 'scene-object.delete': {
      assertOnlyKeys(command, ['type', 'objectId'], 'Delete scene object command');
      const objectId = readRequiredIdentifier(command, 'objectId', 'Scene object id');
      findRequiredObject(document, objectId);
      const deletedIds = collectDescendantIds(document, objectId);
      const deletedIdSet = new Set(deletedIds);
      return {
        candidate: withObjects(
          document,
          document.objects.filter((object) => !deletedIdSet.has(object.id)),
        ),
        createEvent: (nextDocument) => ({
          type: 'scene-object.deleted',
          documentId: nextDocument.id,
          objectIds: deletedIds,
        }),
      };
    }
    case 'scene-object.move': {
      assertOnlyKeys(command, ['type', 'objectId', 'parentId'], 'Move scene object command');
      const objectId = readRequiredIdentifier(command, 'objectId', 'Scene object id');
      const object = findRequiredObject(document, objectId);
      const parentId = readNullableIdentifier(command, 'parentId', 'Scene parent id');
      const nextObject = applyCommandPatch(object, { parentId });
      return {
        candidate: withObjects(
          document,
          document.objects.map((entry) => (entry.id === objectId ? nextObject : entry)),
        ),
        createEvent: (nextDocument) => ({
          type: 'scene-object.moved',
          documentId: nextDocument.id,
          objectId,
          parentId,
        }),
      };
    }
    case 'scene-object.component.add': {
      assertOnlyKeys(command, ['type', 'objectId', 'component'], 'Add scene component command');
      const objectId = readRequiredIdentifier(command, 'objectId', 'Scene object id');
      const object = findRequiredObject(document, objectId);
      const component = readRequiredProperty(command, 'component', 'Scene component');
      const componentId = assertMaterializedSceneComponent(component);
      const nextObject = { ...object, components: [...object.components, component] };
      return {
        candidate: withObjects(
          document,
          document.objects.map((entry) => (entry.id === objectId ? nextObject : entry)),
        ),
        createEvent: (nextDocument) => ({
          type: 'scene-object.component.added',
          documentId: nextDocument.id,
          objectId,
          componentId,
        }),
      };
    }
    case 'scene-object.component.remove': {
      assertOnlyKeys(
        command,
        ['type', 'objectId', 'componentId'],
        'Remove scene component command',
      );
      const objectId = readRequiredIdentifier(command, 'objectId', 'Scene object id');
      const componentId = readRequiredIdentifier(command, 'componentId', 'Scene component id');
      const object = findRequiredObject(document, objectId);
      if (!object.components.some((component) => component.id === componentId)) {
        throw new SceneCommandIssueError({
          code: 'missing-component',
          objectId,
          componentId,
          message: `Scene object "${objectId}" does not contain component "${componentId}".`,
        });
      }
      const nextObject = {
        ...object,
        components: object.components.filter((component) => component.id !== componentId),
      };
      return {
        candidate: withObjects(
          document,
          document.objects.map((entry) => (entry.id === objectId ? nextObject : entry)),
        ),
        createEvent: (nextDocument) => ({
          type: 'scene-object.component.removed',
          documentId: nextDocument.id,
          objectId,
          componentId,
        }),
      };
    }
    default:
      throw new TypeError(`Unsupported scene command type "${type}".`);
  }
}

function withObjects(document: SceneDocument, objects: readonly unknown[]): unknown {
  return {
    version: document.version,
    id: document.id,
    ...(document.name !== undefined ? { name: document.name } : {}),
    objects,
  };
}

function findRequiredObject(document: SceneDocument, objectId: SceneObjectId): SceneObject {
  const object = document.objects.find((entry) => entry.id === objectId);
  if (!object) {
    throw new SceneCommandIssueError({
      code: 'missing-object',
      objectId,
      message: `Scene object "${objectId}" does not exist.`,
    });
  }
  return object;
}

function collectDescendantIds(document: SceneDocument, objectId: SceneObjectId): SceneObjectId[] {
  const deleted = new Set<SceneObjectId>([objectId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const object of document.objects) {
      if (
        object.parentId !== undefined &&
        deleted.has(object.parentId) &&
        !deleted.has(object.id)
      ) {
        deleted.add(object.id);
        changed = true;
      }
    }
  }

  return document.objects.filter((object) => deleted.has(object.id)).map((object) => object.id);
}

function applyCommandPatch(object: SceneObject, patch: SceneObjectCommandPatch): SceneObject {
  const transformPatch = patch.transform;
  const next: SceneObject = {
    ...object,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.tags !== undefined ? { tags: [...patch.tags] } : {}),
    ...(transformPatch !== undefined
      ? {
          transform: {
            position: transformPatch.position ?? object.transform.position,
            rotation: transformPatch.rotation ?? object.transform.rotation,
            scale: transformPatch.scale ?? object.transform.scale,
          },
        }
      : {}),
  };

  if ('parentId' in patch) {
    if (patch.parentId === null) delete next.parentId;
    else next.parentId = patch.parentId;
  }
  if ('layer' in patch) {
    if (patch.layer === null) delete next.layer;
    else next.layer = patch.layer;
  }

  return next;
}

function normalizeCommandPatch(input: unknown): SceneObjectCommandPatch {
  const patch = assertPlainDataRecord(input, 'Scene object patch');
  assertOnlyKeys(patch, ['name', 'parentId', 'transform', 'tags', 'layer'], 'Scene object patch');

  const name = readOwnDataProperty(patch, 'name');
  const parentId = readOwnDataProperty(patch, 'parentId');
  const transform = readOwnDataProperty(patch, 'transform');
  const tags = readOwnDataProperty(patch, 'tags');
  const layer = readOwnDataProperty(patch, 'layer');

  return {
    ...(name !== MISSING_PROPERTY ? { name: assertString(name, 'Scene object name') } : {}),
    ...(parentId !== MISSING_PROPERTY
      ? { parentId: assertNullableIdentifier(parentId, 'Scene parent id') }
      : {}),
    ...(transform !== MISSING_PROPERTY ? { transform: normalizeTransformPatch(transform) } : {}),
    ...(tags !== MISSING_PROPERTY ? { tags: normalizeTags(tags) } : {}),
    ...(layer !== MISSING_PROPERTY ? { layer: assertNullableString(layer, 'Scene layer') } : {}),
  };
}

function normalizeTransformPatch(input: unknown): SceneObjectCommandTransformPatch {
  const transform = assertPlainDataRecord(input, 'Scene transform patch');
  assertOnlyKeys(transform, ['position', 'rotation', 'scale'], 'Scene transform patch');

  const position = readOwnDataProperty(transform, 'position');
  const rotation = readOwnDataProperty(transform, 'rotation');
  const scale = readOwnDataProperty(transform, 'scale');
  return {
    ...(position !== MISSING_PROPERTY
      ? { position: normalizeVector3(position, 'Scene position') }
      : {}),
    ...(rotation !== MISSING_PROPERTY
      ? { rotation: normalizeVector3(rotation, 'Scene rotation') }
      : {}),
    ...(scale !== MISSING_PROPERTY ? { scale: normalizeVector3(scale, 'Scene scale') } : {}),
  };
}

function normalizeTags(input: unknown): SceneTag[] {
  return readDenseDataArray(input, 'Scene object tags').map((value) =>
    assertString(value, 'Scene object tag'),
  );
}

function normalizeVector3(input: unknown, label: string): SceneVector3 | SceneEuler {
  const values = readDenseDataArray(input, label);
  if (values.length !== 3) throw new TypeError(`${label} must be a 3-tuple.`);

  const output: [number, number, number] = [0, 0, 0];
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (typeof value !== 'number' || !Number.isFinite(value) || Object.is(value, -0)) {
      throw new TypeError(`${label} must contain finite canonical numbers.`);
    }
    output[index] = value;
  }
  return output;
}

function assertMaterializedSceneObject(input: unknown): SceneObjectId {
  const object = assertPlainDataRecord(input, 'Created scene object');
  assertOnlyKeys(
    object,
    ['id', 'name', 'parentId', 'transform', 'components', 'tags', 'layer'],
    'Created scene object',
  );
  const id = readRequiredIdentifier(object, 'id', 'Created scene object id');
  readRequiredString(object, 'name', 'Created scene object name');

  const transform = assertPlainDataRecord(
    readRequiredProperty(object, 'transform', 'Created scene object transform'),
    'Created scene object transform',
  );
  assertOnlyKeys(transform, ['position', 'rotation', 'scale'], 'Created scene object transform');
  normalizeVector3(
    readRequiredProperty(transform, 'position', 'Created scene object position'),
    'Created scene object position',
  );
  normalizeVector3(
    readRequiredProperty(transform, 'rotation', 'Created scene object rotation'),
    'Created scene object rotation',
  );
  normalizeVector3(
    readRequiredProperty(transform, 'scale', 'Created scene object scale'),
    'Created scene object scale',
  );

  for (const component of readDenseDataArray(
    readRequiredProperty(object, 'components', 'Created scene object components'),
    'Created scene object components',
  )) {
    assertMaterializedSceneComponent(component);
  }
  normalizeTags(readRequiredProperty(object, 'tags', 'Created scene object tags'));

  const parentId = readOwnDataProperty(object, 'parentId');
  if (parentId !== MISSING_PROPERTY) assertIdentifier(parentId, 'Created scene parent id');
  const layer = readOwnDataProperty(object, 'layer');
  if (layer !== MISSING_PROPERTY) assertString(layer, 'Created scene layer');
  return id;
}

function assertCanonicalSceneDocument(input: unknown, label: string): void {
  const document = assertPlainDataRecord(input, label);
  assertOnlyKeys(document, ['version', 'id', 'name', 'objects'], label);
  const version = readRequiredProperty(document, 'version', `${label} version`);
  if (version !== SCENE_DOCUMENT_VERSION) {
    throw new TypeError(`${label} version must be ${SCENE_DOCUMENT_VERSION}.`);
  }
  readRequiredIdentifier(document, 'id', `${label} id`);
  const name = readOwnDataProperty(document, 'name');
  if (name !== MISSING_PROPERTY) assertString(name, `${label} name`);
  for (const object of readDenseDataArray(
    readRequiredProperty(document, 'objects', `${label} objects`),
    `${label} objects`,
  )) {
    assertMaterializedSceneObject(object);
  }
}

function assertMaterializedSceneComponent(input: unknown): string {
  const component = assertPlainDataRecord(input, 'Scene component');
  assertOnlyKeys(component, ['id', 'type', 'enabled', 'data'], 'Scene component');
  const id = readRequiredIdentifier(component, 'id', 'Scene component id');
  readRequiredIdentifier(component, 'type', 'Scene component type');
  const enabled = readRequiredProperty(component, 'enabled', 'Scene component enabled');
  if (typeof enabled !== 'boolean') throw new TypeError('Scene component enabled must be boolean.');
  const data = readRequiredProperty(component, 'data', 'Scene component data');
  if (!isCanonicalSceneJsonObject(data)) {
    throw new TypeError('Scene component data must contain only canonical JSON values.');
  }
  return id;
}

function assertPlainDataRecord(input: unknown, label: string): object {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError(`${label} must be a plain data object.`);
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain data object.`);
  }
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== 'string') throw new TypeError(`${label} must use string keys.`);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError(`${label} must contain only enumerable data properties.`);
    }
  }
  return input;
}

function assertOnlyKeys(input: object, keys: readonly string[], label: string): void {
  const allowed = new Set(keys);
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== 'string' || !allowed.has(key)) {
      throw new TypeError(`${label} contains unsupported properties.`);
    }
  }
}

function readOwnDataProperty(input: object, key: string): unknown | typeof MISSING_PROPERTY {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  if (descriptor === undefined) return MISSING_PROPERTY;
  if (!descriptor.enumerable || !('value' in descriptor)) {
    throw new TypeError(`Scene command property "${key}" must be enumerable data.`);
  }
  return descriptor.value;
}

function readRequiredProperty(input: object, key: string, label: string): unknown {
  const value = readOwnDataProperty(input, key);
  if (value === MISSING_PROPERTY) throw new TypeError(`${label} is required.`);
  return value;
}

function readRequiredString(input: object, key: string, label: string): string {
  return assertString(readRequiredProperty(input, key, label), label);
}

function readRequiredIdentifier(input: object, key: string, label: string): string {
  return assertIdentifier(readRequiredProperty(input, key, label), label);
}

function readNullableIdentifier(input: object, key: string, label: string): string | null {
  return assertNullableIdentifier(readRequiredProperty(input, key, label), label);
}

function assertString(input: unknown, label: string): string {
  if (typeof input !== 'string') throw new TypeError(`${label} must be a string.`);
  return input;
}

function assertIdentifier(input: unknown, label: string): string {
  const value = assertString(input, label);
  if (!value.trim()) throw new TypeError(`${label} must be a non-empty string.`);
  return value;
}

function assertNullableIdentifier(input: unknown, label: string): string | null {
  return input === null ? null : assertIdentifier(input, label);
}

function assertNullableString(input: unknown, label: string): string | null {
  return input === null ? null : assertString(input, label);
}

function readDenseDataArray(input: unknown, label: string): unknown[] {
  if (!Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype) {
    throw new TypeError(`${label} must be an array.`);
  }
  const keys = Reflect.ownKeys(input);
  if (
    keys.length !== input.length + 1 ||
    !keys.every(
      (key) => key === 'length' || (typeof key === 'string' && /^0$|^[1-9]\d*$/.test(key)),
    )
  ) {
    throw new TypeError(`${label} must be a dense data array.`);
  }

  const values: unknown[] = [];
  for (let index = 0; index < input.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
    if (!descriptor?.enumerable || !('value' in descriptor)) {
      throw new TypeError(`${label} must contain only data elements.`);
    }
    values.push(descriptor.value);
  }
  return values;
}

function createAcceptedResult(
  document: SceneDocument,
  event: SceneDocumentEvent,
): SceneDocumentCommandAcceptedResult {
  return deepFreezeOwned({ accepted: true, document, event });
}

function createRejectedResult(
  document: SceneDocument,
  issues: readonly SceneValidationIssue[],
): SceneDocumentCommandRejectedResult {
  const ownedIssues = issues.map((issue) => deepFreezeOwned({ ...issue }));
  return Object.freeze({ accepted: false, document, issues: Object.freeze(ownedIssues) });
}
