import { SCENE_DOCUMENT_VERSION } from './core';
import { parseSceneDocument } from './serialization';
import type { SceneDocument, SceneValidationIssue } from './types';

export type UnknownSceneDocument = {
  version?: unknown;
  id?: unknown;
  name?: unknown;
  objects?: unknown;
  [key: string]: unknown;
};

export interface SceneMigration {
  fromVersion: number;
  toVersion: number;
  description?: string;
  migrate: (document: UnknownSceneDocument) => UnknownSceneDocument;
}

export interface SceneMigrationStep {
  fromVersion: number;
  toVersion: number;
  description?: string;
}

export interface MigrateSceneDocumentResult {
  ok: boolean;
  document?: SceneDocument;
  version?: number;
  steps: SceneMigrationStep[];
  issues: SceneValidationIssue[];
}

export interface SceneMigrationRegistry {
  register: (migration: SceneMigration) => void;
  getMigrations: () => SceneMigration[];
  migrate: (input: string | unknown, targetVersion?: number) => MigrateSceneDocumentResult;
}

export function createSceneMigrationRegistry(migrations: SceneMigration[] = []): SceneMigrationRegistry {
  const entries = [...migrations];

  return {
    register(migration) {
      entries.push(migration);
    },
    getMigrations() {
      return [...entries].sort(compareMigrations);
    },
    migrate(input, targetVersion = SCENE_DOCUMENT_VERSION) {
      return migrateSceneDocument(input, entries, targetVersion);
    },
  };
}

export function migrateSceneDocument(
  input: string | unknown,
  migrations: SceneMigration[] = [],
  targetVersion = SCENE_DOCUMENT_VERSION,
): MigrateSceneDocumentResult {
  const raw = typeof input === 'string' ? parseJson(input) : input;
  if (!isRecord(raw)) {
    return invalid('Scene document must be an object.');
  }

  const sourceVersion = readVersion(raw);
  if (!Number.isInteger(sourceVersion)) {
    return invalid('Scene document version must be an integer.');
  }

  let current: UnknownSceneDocument = raw;
  let currentVersion = sourceVersion;
  const steps: SceneMigrationStep[] = [];
  const sortedMigrations = [...migrations].sort(compareMigrations);
  const visited = new Set<number>();

  while (currentVersion !== targetVersion) {
    if (visited.has(currentVersion)) {
      return invalid(`Scene migration loop detected at version ${currentVersion}.`, steps, currentVersion);
    }
    visited.add(currentVersion);

    const migration = sortedMigrations.find((entry) => (
      entry.fromVersion === currentVersion && entry.toVersion <= targetVersion
    ));
    if (!migration) {
      return invalid(
        `No scene migration found from version ${currentVersion} to ${targetVersion}.`,
        steps,
        currentVersion,
        'unsupported-scene-version',
      );
    }

    try {
      current = {
        ...migration.migrate(current),
        version: migration.toVersion,
      };
      currentVersion = migration.toVersion;
      steps.push({
        fromVersion: migration.fromVersion,
        toVersion: migration.toVersion,
        ...(migration.description ? { description: migration.description } : {}),
      });
    } catch (error) {
      return invalid(
        error instanceof Error ? error.message : 'Scene migration failed.',
        steps,
        currentVersion,
        'scene-migration-failed',
      );
    }
  }

  const parsed = parseSceneDocument(current);
  return {
    ok: parsed.ok,
    ...(parsed.document ? { document: parsed.document } : {}),
    version: currentVersion,
    steps,
    issues: parsed.issues,
  };
}

function compareMigrations(a: SceneMigration, b: SceneMigration): number {
  return a.fromVersion - b.fromVersion || a.toVersion - b.toVersion;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is UnknownSceneDocument {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readVersion(document: UnknownSceneDocument): number {
  return typeof document.version === 'number' ? document.version : Number.NaN;
}

function invalid(
  message: string,
  steps: SceneMigrationStep[] = [],
  version?: number,
  code: SceneValidationIssue['code'] = 'scene-migration-failed',
): MigrateSceneDocumentResult {
  return {
    ok: false,
    ...(version !== undefined ? { version } : {}),
    steps,
    issues: [{ code, message }],
  };
}
