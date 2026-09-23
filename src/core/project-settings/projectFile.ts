import { createProjectSettings, parseProjectSettings } from './core';
import type { ProjectSettings, ProjectSettingsInput } from './types';

export const PROJECT_FILE_VERSION = 1;

export type ProjectFileEntry = {
  id: string;
  path: string;
};

export type GaesupProjectFile = {
  version: typeof PROJECT_FILE_VERSION;
  settings: ProjectSettings;
  startScene: string;
  scenes: ProjectFileEntry[];
  prefabs: ProjectFileEntry[];
  requiredScripts: string[];
  assetManifest?: string;
};

export type ProjectFileIssue = {
  path: string;
  message: string;
};

export type ProjectFileValidationOptions = {
  isScriptRegistered?: (scriptId: string) => boolean;
};

export function createProjectFile(input: {
  settings?: ProjectSettingsInput;
  startScene: string;
  scenes: ProjectFileEntry[];
  prefabs?: ProjectFileEntry[];
  requiredScripts?: string[];
  assetManifest?: string;
}): GaesupProjectFile {
  return {
    version: PROJECT_FILE_VERSION,
    settings: createProjectSettings(input.settings),
    startScene: input.startScene,
    scenes: input.scenes.map((entry) => ({ ...entry })),
    prefabs: (input.prefabs ?? []).map((entry) => ({ ...entry })),
    requiredScripts: [...(input.requiredScripts ?? [])],
    ...(input.assetManifest !== undefined ? { assetManifest: input.assetManifest } : {}),
  };
}

function validateEntries(entries: ProjectFileEntry[], field: string, issues: ProjectFileIssue[]): void {
  const seen = new Set<string>();
  entries.forEach((entry, index) => {
    if (!entry.id.trim()) issues.push({ path: `${field}[${index}].id`, message: 'id가 비어 있습니다' });
    if (!entry.path.trim()) issues.push({ path: `${field}[${index}].path`, message: 'path가 비어 있습니다' });
    if (seen.has(entry.id)) issues.push({ path: `${field}[${index}].id`, message: `중복 id: ${entry.id}` });
    seen.add(entry.id);
  });
}

export function validateProjectFile(
  file: GaesupProjectFile,
  options: ProjectFileValidationOptions = {},
): ProjectFileIssue[] {
  const issues: ProjectFileIssue[] = [];
  if (file.version !== PROJECT_FILE_VERSION) {
    issues.push({ path: 'version', message: `지원하지 않는 프로젝트 버전: ${String(file.version)}` });
  }
  const settings = parseProjectSettings(file.settings);
  settings.issues.forEach((issue) => issues.push({ path: `settings.${issue.path}`, message: issue.message }));
  validateEntries(file.scenes, 'scenes', issues);
  validateEntries(file.prefabs, 'prefabs', issues);
  if (!file.scenes.some((scene) => scene.id === file.startScene)) {
    issues.push({ path: 'startScene', message: `시작 씬이 scenes에 없습니다: ${file.startScene}` });
  }
  if (options.isScriptRegistered) {
    file.requiredScripts.forEach((scriptId, index) => {
      if (!options.isScriptRegistered?.(scriptId)) {
        issues.push({ path: `requiredScripts[${index}]`, message: `등록되지 않은 스크립트: ${scriptId}` });
      }
    });
  }
  return issues;
}

export function parseProjectFile(input: string | unknown): { file?: GaesupProjectFile; issues: ProjectFileIssue[] } {
  let raw: unknown = input;
  if (typeof input === 'string') {
    try {
      raw = JSON.parse(input);
    } catch {
      return { issues: [{ path: '', message: 'JSON 형식이 아닙니다' }] };
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { issues: [{ path: '', message: '프로젝트 파일은 객체여야 합니다' }] };
  }
  const record = raw as Record<string, unknown>;
  const settings = parseProjectSettings(record['settings'] ?? {});
  if (!settings.settings) {
    return { issues: settings.issues.map((issue) => ({ path: `settings.${issue.path}`, message: issue.message })) };
  }
  const toEntries = (value: unknown): ProjectFileEntry[] =>
    Array.isArray(value)
      ? value.filter((entry): entry is ProjectFileEntry =>
          Boolean(entry) && typeof entry === 'object' && typeof (entry as ProjectFileEntry).id === 'string' && typeof (entry as ProjectFileEntry).path === 'string')
      : [];
  const file: GaesupProjectFile = {
    version: PROJECT_FILE_VERSION,
    settings: settings.settings,
    startScene: typeof record['startScene'] === 'string' ? record['startScene'] : '',
    scenes: toEntries(record['scenes']),
    prefabs: toEntries(record['prefabs']),
    requiredScripts: Array.isArray(record['requiredScripts'])
      ? record['requiredScripts'].filter((entry): entry is string => typeof entry === 'string')
      : [],
    ...(typeof record['assetManifest'] === 'string' ? { assetManifest: record['assetManifest'] } : {}),
  };
  const issues = validateProjectFile(
    record['version'] === PROJECT_FILE_VERSION ? file : { ...file, version: record['version'] as typeof PROJECT_FILE_VERSION },
  );
  return { file, issues };
}
