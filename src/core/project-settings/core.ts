import { DEFAULT_PROJECT_SETTINGS, PROJECT_SETTINGS_VERSION } from './defaults';
import type {
  ParseProjectSettingsResult,
  ProjectInputBinding,
  ProjectSettings,
  ProjectSettingsInput,
  ProjectSettingsIssue,
  ProjectSettingsIssueCode,
  ProjectSettingsValidationResult,
} from './types';

const RENDER_BACKENDS = new Set(['auto', 'webgl', 'webgpu']);
const TONE_MAPPINGS = new Set(['none', 'aces', 'reinhard']);
const COLOR_SPACES = new Set(['srgb', 'linear']);
const INPUT_DEVICES = new Set(['keyboard', 'mouse', 'gamepad', 'touch']);
const BUILD_TARGETS = new Set(['web']);
const CHUNK_STRATEGIES = new Set(['single', 'vendor-split', 'domain-split']);

export function createProjectSettings(input: ProjectSettingsInput = {}): ProjectSettings {
  return {
    version: PROJECT_SETTINGS_VERSION,
    name: input.name ?? DEFAULT_PROJECT_SETTINGS.name,
    physics: {
      ...DEFAULT_PROJECT_SETTINGS.physics,
      ...input.physics,
      gravity: input.physics?.gravity ?? DEFAULT_PROJECT_SETTINGS.physics.gravity,
      collisionMatrix: {
        ...DEFAULT_PROJECT_SETTINGS.physics.collisionMatrix,
        ...input.physics?.collisionMatrix,
      },
    },
    rendering: {
      ...DEFAULT_PROJECT_SETTINGS.rendering,
      ...input.rendering,
      toon: {
        ...DEFAULT_PROJECT_SETTINGS.rendering.toon,
        ...input.rendering?.toon,
      },
      postprocessing: {
        ...DEFAULT_PROJECT_SETTINGS.rendering.postprocessing,
        ...input.rendering?.postprocessing,
      },
    },
    input: {
      ...DEFAULT_PROJECT_SETTINGS.input,
      ...input.input,
      bindings: {
        ...DEFAULT_PROJECT_SETTINGS.input.bindings,
        ...input.input?.bindings,
      },
    },
    build: {
      ...DEFAULT_PROJECT_SETTINGS.build,
      ...input.build,
    },
    editor: {
      ...DEFAULT_PROJECT_SETTINGS.editor,
      ...input.editor,
    },
  };
}

export function cloneProjectSettings(settings: ProjectSettings): ProjectSettings {
  return JSON.parse(JSON.stringify(settings)) as ProjectSettings;
}

export function serializeProjectSettings(settings: ProjectSettings): string {
  return JSON.stringify(settings);
}

export function parseProjectSettings(input: string | unknown): ParseProjectSettingsResult {
  const raw = typeof input === 'string' ? parseJson(input) : input;
  if (!isRecord(raw)) {
    return invalid('Project settings must be an object.', 'invalid-project-settings-version', 'version');
  }

  const candidate = raw as Partial<ProjectSettings>;
  if (candidate.version !== PROJECT_SETTINGS_VERSION) {
    return invalid(
      `Project settings version must be ${PROJECT_SETTINGS_VERSION}.`,
      'invalid-project-settings-version',
      'version',
    );
  }

  const normalized: ProjectSettingsInput = {};
  if (typeof candidate.name === 'string') normalized.name = candidate.name;
  if (isRecord(candidate.physics)) normalized.physics = candidate.physics as NonNullable<ProjectSettingsInput['physics']>;
  if (isRecord(candidate.rendering)) normalized.rendering = candidate.rendering as NonNullable<ProjectSettingsInput['rendering']>;
  if (isRecord(candidate.input)) normalized.input = candidate.input as NonNullable<ProjectSettingsInput['input']>;
  if (isRecord(candidate.build)) normalized.build = candidate.build as NonNullable<ProjectSettingsInput['build']>;
  if (isRecord(candidate.editor)) normalized.editor = candidate.editor as NonNullable<ProjectSettingsInput['editor']>;

  const settings = createProjectSettings(normalized);
  const validation = validateProjectSettings(settings);
  return {
    ...validation,
    settings,
  };
}

export function validateProjectSettings(settings: ProjectSettings): ProjectSettingsValidationResult {
  const issues: ProjectSettingsIssue[] = [];

  if (settings.version !== PROJECT_SETTINGS_VERSION) {
    issues.push(issue('invalid-project-settings-version', 'version', `Version must be ${PROJECT_SETTINGS_VERSION}.`));
  }
  if (!settings.name.trim()) {
    issues.push(issue('invalid-project-settings-version', 'name', 'Project name must not be empty.'));
  }

  validatePhysics(settings, issues);
  validateRendering(settings, issues);
  validateInput(settings, issues);
  validateBuild(settings, issues);
  validateEditor(settings, issues);

  return {
    valid: issues.length === 0,
    issues,
  };
}

function validatePhysics(settings: ProjectSettings, issues: ProjectSettingsIssue[]): void {
  const physics = settings.physics;
  if (!isVector3(physics.gravity)) {
    issues.push(issue('invalid-physics-settings', 'physics.gravity', 'Gravity must be a numeric vector3.'));
  }
  if (!isPositive(physics.timeStep)) {
    issues.push(issue('invalid-physics-settings', 'physics.timeStep', 'Physics timeStep must be positive.'));
  }
  if (!Number.isInteger(physics.maxSubSteps) || physics.maxSubSteps < 1) {
    issues.push(issue('invalid-physics-settings', 'physics.maxSubSteps', 'maxSubSteps must be a positive integer.'));
  }
  if (!Number.isInteger(physics.solverIterations) || physics.solverIterations < 1) {
    issues.push(issue('invalid-physics-settings', 'physics.solverIterations', 'solverIterations must be a positive integer.'));
  }
  Object.entries(physics.collisionMatrix).forEach(([layer, collisions]) => {
    if (!layer.trim() || !Array.isArray(collisions) || collisions.some((entry) => typeof entry !== 'string' || !entry.trim())) {
      issues.push(issue('invalid-physics-settings', `physics.collisionMatrix.${layer}`, 'Collision matrix entries must be layer name arrays.'));
    }
  });
}

function validateRendering(settings: ProjectSettings, issues: ProjectSettingsIssue[]): void {
  const rendering = settings.rendering;
  if (!RENDER_BACKENDS.has(rendering.backend)) {
    issues.push(issue('invalid-rendering-settings', 'rendering.backend', 'Rendering backend is not supported.'));
  }
  if (!isPositive(rendering.pixelRatio)) {
    issues.push(issue('invalid-rendering-settings', 'rendering.pixelRatio', 'Pixel ratio must be positive.'));
  }
  if (!TONE_MAPPINGS.has(rendering.toneMapping)) {
    issues.push(issue('invalid-rendering-settings', 'rendering.toneMapping', 'Tone mapping is not supported.'));
  }
  if (!COLOR_SPACES.has(rendering.outputColorSpace)) {
    issues.push(issue('invalid-rendering-settings', 'rendering.outputColorSpace', 'Output color space is not supported.'));
  }
}

function validateInput(settings: ProjectSettings, issues: ProjectSettingsIssue[]): void {
  Object.entries(settings.input.bindings).forEach(([action, bindings]) => {
    if (!action.trim() || !Array.isArray(bindings)) {
      issues.push(issue('invalid-input-binding', `input.bindings.${action}`, 'Input action must map to binding arrays.'));
      return;
    }
    bindings.forEach((binding, index) => {
      if (!isValidInputBinding(binding)) {
        issues.push(issue('invalid-input-binding', `input.bindings.${action}.${index}`, 'Input binding has invalid device or code.'));
      }
    });
  });
}

function validateBuild(settings: ProjectSettings, issues: ProjectSettingsIssue[]): void {
  const build = settings.build;
  if (!BUILD_TARGETS.has(build.target)) {
    issues.push(issue('invalid-build-settings', 'build.target', 'Build target is not supported.'));
  }
  if (!build.publicPath.trim()) {
    issues.push(issue('invalid-build-settings', 'build.publicPath', 'publicPath must not be empty.'));
  }
  if (!build.assetBaseUrl.trim()) {
    issues.push(issue('invalid-build-settings', 'build.assetBaseUrl', 'assetBaseUrl must not be empty.'));
  }
  if (!CHUNK_STRATEGIES.has(build.chunkStrategy)) {
    issues.push(issue('invalid-build-settings', 'build.chunkStrategy', 'Chunk strategy is not supported.'));
  }
}

function validateEditor(settings: ProjectSettings, issues: ProjectSettingsIssue[]): void {
  const editor = settings.editor;
  if (!Number.isInteger(editor.autosaveIntervalMs) || editor.autosaveIntervalMs < 1000) {
    issues.push(issue('invalid-editor-settings', 'editor.autosaveIntervalMs', 'Autosave interval must be at least 1000ms.'));
  }
  if (!isPositive(editor.gridSize)) {
    issues.push(issue('invalid-editor-settings', 'editor.gridSize', 'Grid size must be positive.'));
  }
  if (!isPositive(editor.snapMove)) {
    issues.push(issue('invalid-editor-settings', 'editor.snapMove', 'Move snapping must be positive.'));
  }
  if (!isPositive(editor.snapRotateDegrees)) {
    issues.push(issue('invalid-editor-settings', 'editor.snapRotateDegrees', 'Rotate snapping must be positive.'));
  }
}

function isValidInputBinding(binding: ProjectInputBinding): boolean {
  return (
    isRecord(binding) &&
    INPUT_DEVICES.has(binding.device) &&
    typeof binding.code === 'string' &&
    binding.code.trim().length > 0 &&
    (binding.scale === undefined || Number.isFinite(binding.scale))
  );
}

function isVector3(value: unknown): boolean {
  return Array.isArray(value) && value.length === 3 && value.every((item) => Number.isFinite(item));
}

function isPositive(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function invalid(message: string, code: ProjectSettingsIssueCode, path: string): ParseProjectSettingsResult {
  return {
    valid: false,
    issues: [issue(code, path, message)],
  };
}

function issue(code: ProjectSettingsIssueCode, path: string, message: string): ProjectSettingsIssue {
  return { code, path, message };
}
