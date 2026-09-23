import { validateSceneComponentData } from './componentSchemas';
import { isCanonicalSceneJsonObject } from './core';
import { deepFreezeOwned } from './ownership';
import { parseSceneDocument } from './serialization';
import type {
  SceneDocument,
  SceneDocumentBatchCommand,
  SceneDocumentCommand,
  SceneDocumentCommandResult,
  SceneDocumentEvent,
  SceneObjectComponentUpdateCommand,
  SceneValidationIssue,
} from './types';

type ApplySceneCommand = (
  document: SceneDocument,
  command: SceneDocumentCommand,
) => SceneDocumentCommandResult;

function accept(document: SceneDocument, event: SceneDocumentEvent): SceneDocumentCommandResult {
  return deepFreezeOwned({ accepted: true, document, event });
}

function reject(document: SceneDocument, issues: readonly SceneValidationIssue[]): SceneDocumentCommandResult {
  const ownedIssues = issues.map((issue) => deepFreezeOwned({ ...issue }));
  return Object.freeze({ accepted: false, document, issues: Object.freeze(ownedIssues) });
}

export function applySceneComponentUpdate(
  document: SceneDocument,
  command: SceneObjectComponentUpdateCommand,
): SceneDocumentCommandResult {
  const { objectId, componentId } = command;
  const object = document.objects.find((entry) => entry.id === objectId);
  if (!object) {
    return reject(document, [
      { code: 'missing-object', objectId, message: `Scene object "${objectId}" does not exist.` },
    ]);
  }
  const component = object.components.find((entry) => entry.id === componentId);
  if (!component) {
    return reject(document, [
      {
        code: 'missing-component',
        objectId,
        componentId,
        message: `Scene object "${objectId}" does not contain component "${componentId}".`,
      },
    ]);
  }
  if (command.data === undefined && command.enabled === undefined) {
    return reject(document, [
      { code: 'invalid-scene-command', objectId, componentId, message: 'Component update is empty.' },
    ]);
  }
  if (command.enabled !== undefined && typeof command.enabled !== 'boolean') {
    return reject(document, [
      { code: 'invalid-scene-command', objectId, componentId, message: 'Component enabled must be boolean.' },
    ]);
  }
  if (command.data !== undefined) {
    if (!isCanonicalSceneJsonObject(command.data)) {
      return reject(document, [
        { code: 'invalid-component-data', objectId, componentId, message: 'Component data must be canonical JSON.' },
      ]);
    }
    const schemaMessage = validateSceneComponentData(component.type, command.data);
    if (schemaMessage) {
      return reject(document, [
        { code: 'invalid-component-data', objectId, componentId, message: schemaMessage },
      ]);
    }
  }
  const nextComponent = {
    ...component,
    ...(command.data !== undefined ? { data: command.data } : {}),
    ...(command.enabled !== undefined ? { enabled: command.enabled } : {}),
  };
  const nextObject = {
    ...object,
    components: object.components.map((entry) => (entry.id === componentId ? nextComponent : entry)),
  };
  const parsed = parseSceneDocument({
    version: document.version,
    id: document.id,
    ...(document.name !== undefined ? { name: document.name } : {}),
    objects: document.objects.map((entry) => (entry.id === objectId ? nextObject : entry)),
  });
  if (!parsed.ok || !parsed.document) return reject(document, parsed.issues);
  return accept(parsed.document, {
    type: 'scene-object.component.updated',
    documentId: parsed.document.id,
    objectId,
    componentId,
  });
}

export function applySceneDocumentBatch(
  document: SceneDocument,
  command: SceneDocumentBatchCommand,
  applyCommand: ApplySceneCommand,
): SceneDocumentCommandResult {
  if (!Array.isArray(command.commands) || command.commands.length === 0) {
    return reject(document, [{ code: 'invalid-scene-command', message: 'Scene batch must contain commands.' }]);
  }
  if (command.label !== undefined && typeof command.label !== 'string') {
    return reject(document, [{ code: 'invalid-scene-command', message: 'Scene batch label must be a string.' }]);
  }
  let current = document;
  const events: SceneDocumentEvent[] = [];
  for (const entry of command.commands) {
    const result = applyCommand(current, entry);
    if (!result.accepted) return reject(document, result.issues);
    current = result.document;
    events.push(result.event);
  }
  return accept(current, {
    type: 'scene-document.batch-applied',
    documentId: current.id,
    ...(command.label !== undefined ? { label: command.label } : {}),
    events,
  });
}
