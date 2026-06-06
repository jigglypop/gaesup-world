import { createPrefabDocument, validatePrefabDocument } from './core';
import type { ParsePrefabDocumentResult, PrefabDocument, PrefabValidationIssue } from './types';

export function serializePrefabDocument(prefab: PrefabDocument): string {
  return JSON.stringify(prefab);
}

export function clonePrefabDocument(prefab: PrefabDocument): PrefabDocument {
  return parsePrefabDocument(serializePrefabDocument(prefab)).prefab ?? createPrefabDocument({
    id: prefab.id,
    name: prefab.name,
  });
}

export function parsePrefabDocument(input: string | unknown): ParsePrefabDocumentResult {
  const raw = typeof input === 'string' ? parseJson(input) : input;
  if (!raw || typeof raw !== 'object') {
    return invalid('Prefab document must be an object.');
  }

  const candidate = raw as Partial<PrefabDocument>;
  if (candidate.version !== 1) {
    return invalid('Prefab document version must be 1.');
  }
  if (typeof candidate.id !== 'string' || !candidate.id.trim()) {
    return invalid('Prefab document id must be a non-empty string.');
  }
  if (!Array.isArray(candidate.objects)) {
    return invalid('Prefab document objects must be an array.');
  }

  const prefab = createPrefabDocument({
    id: candidate.id,
    ...(typeof candidate.name === 'string' ? { name: candidate.name } : {}),
    objects: candidate.objects,
    ...(Array.isArray(candidate.rootObjectIds)
      ? { rootObjectIds: candidate.rootObjectIds.filter((id): id is string => typeof id === 'string') }
      : {}),
    ...(candidate.metadata && typeof candidate.metadata === 'object'
      ? { metadata: normalizeMetadata(candidate.metadata) }
      : {}),
  });
  const validation = validatePrefabDocument(prefab);
  return {
    ok: validation.valid,
    prefab,
    issues: validation.issues,
  };
}

export function validateSerializedPrefabDocument(input: string | unknown): { valid: boolean; issues: PrefabValidationIssue[] } {
  const parsed = parsePrefabDocument(input);
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

function invalid(message: string): ParsePrefabDocumentResult {
  return {
    ok: false,
    issues: [{ code: 'invalid-prefab-scene', message }],
  };
}

function normalizeMetadata(input: object): Partial<PrefabDocument['metadata']> {
  const metadata = input as Partial<PrefabDocument['metadata']>;
  return {
    ...(typeof metadata.description === 'string' ? { description: metadata.description } : {}),
    ...(typeof metadata.thumbnailUrl === 'string' ? { thumbnailUrl: metadata.thumbnailUrl } : {}),
    ...(Array.isArray(metadata.tags) ? { tags: metadata.tags.filter((tag): tag is string => typeof tag === 'string') } : {}),
    ...(typeof metadata.sourceSceneId === 'string' ? { sourceSceneId: metadata.sourceSceneId } : {}),
    ...(typeof metadata.createdAt === 'string' ? { createdAt: metadata.createdAt } : {}),
    ...(typeof metadata.updatedAt === 'string' ? { updatedAt: metadata.updatedAt } : {}),
  };
}
