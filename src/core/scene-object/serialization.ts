import { createSceneObject, validateSceneDocument } from './core';
import type { SceneDocument, SceneObject, SceneValidationIssue, SceneValidationResult } from './types';

export interface ParseSceneDocumentResult {
  ok: boolean;
  document?: SceneDocument;
  issues: SceneValidationIssue[];
}

export function serializeSceneDocument(document: SceneDocument): string {
  return JSON.stringify(document);
}

export function cloneSceneDocument(document: SceneDocument): SceneDocument {
  return parseSceneDocument(serializeSceneDocument(document)).document ?? {
    version: 1,
    id: document.id,
    objects: [],
  };
}

export function parseSceneDocument(input: string | unknown): ParseSceneDocumentResult {
  const raw = typeof input === 'string' ? parseJson(input) : input;
  if (!raw || typeof raw !== 'object') {
    return invalid('Scene document must be an object.');
  }

  const candidate = raw as Partial<SceneDocument>;
  if (candidate.version !== 1) {
    return invalid('Scene document version must be 1.');
  }
  if (typeof candidate.id !== 'string' || !candidate.id.trim()) {
    return invalid('Scene document id must be a non-empty string.');
  }
  if (!Array.isArray(candidate.objects)) {
    return invalid('Scene document objects must be an array.');
  }

  const document: SceneDocument = {
    version: 1,
    id: candidate.id,
    ...(typeof candidate.name === 'string' ? { name: candidate.name } : {}),
    objects: candidate.objects.map((object) => normalizeSceneObject(object)),
  };
  const validation = validateSceneDocument(document);
  return {
    ok: validation.valid,
    document,
    issues: validation.issues,
  };
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

function invalid(message: string): ParseSceneDocumentResult {
  return {
    ok: false,
    issues: [{ code: 'invalid-transform', message }],
  };
}

function normalizeSceneObject(input: unknown): SceneObject {
  if (!input || typeof input !== 'object') {
    return createSceneObject();
  }

  const object = input as Partial<SceneObject>;
  return createSceneObject({
    ...(typeof object.id === 'string' ? { id: object.id } : {}),
    ...(typeof object.name === 'string' ? { name: object.name } : {}),
    ...(typeof object.parentId === 'string' ? { parentId: object.parentId } : {}),
    ...(object.transform && typeof object.transform === 'object' ? { transform: object.transform } : {}),
    ...(Array.isArray(object.components) ? { components: object.components } : {}),
    ...(Array.isArray(object.tags) ? { tags: object.tags.filter((tag): tag is string => typeof tag === 'string') } : {}),
    ...(typeof object.layer === 'string' ? { layer: object.layer } : {}),
  });
}

