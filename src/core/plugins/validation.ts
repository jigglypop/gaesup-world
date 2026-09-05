import {
  CircularPluginDependencyError,
  DuplicatePluginError,
  MissingPluginDependencyError,
  PluginManifestValidationError,
  PluginVersionMismatchError,
  createPluginRegistry,
} from './PluginRegistry';
import type {
  GaesupPlugin,
  PluginContextOptions,
  PluginDiagnostic,
  PluginManifest,
  PluginRuntime,
} from './types';

export type PluginValidationIssueCode =
  | 'dependency'
  | 'diagnostic'
  | 'manifest'
  | 'runtime'
  | 'save-namespace'
  | 'setup';

export interface PluginValidationIssue {
  code: PluginValidationIssueCode;
  message: string;
  pluginId: string;
  details?: unknown;
}

export interface PluginValidationOptions {
  dependencies?: GaesupPlugin[];
  expectedRuntime?: PluginRuntime | PluginRuntime[];
  requiredSaveNamespaces?: string[];
  allowedSaveNamespaces?: string[];
  registry?: PluginContextOptions;
}

export interface PluginValidationResult {
  ok: boolean;
  pluginId: string;
  manifest: PluginManifest | null;
  issues: PluginValidationIssue[];
  diagnostics: PluginDiagnostic[];
  saveNamespaces: string[];
}

export class PluginValidationAssertionError extends Error {
  readonly result: PluginValidationResult;

  constructor(result: PluginValidationResult) {
    super(`Plugin "${result.pluginId}" failed validation: ${result.issues.map((issue) => issue.message).join('; ')}`);
    this.name = 'PluginValidationAssertionError';
    this.result = result;
  }
}

export async function validateGaesupPlugin(
  plugin: GaesupPlugin,
  options: PluginValidationOptions = {},
): Promise<PluginValidationResult> {
  const registry = createPluginRegistry(options.registry);
  const issues: PluginValidationIssue[] = [];
  const expectedRuntime = Array.isArray(options.expectedRuntime)
    ? options.expectedRuntime
    : options.expectedRuntime
      ? [options.expectedRuntime]
      : null;

  if (expectedRuntime && !expectedRuntime.includes(plugin.runtime ?? 'client')) {
    issues.push({
      code: 'runtime',
      message: `Plugin "${plugin.id}" targets runtime "${plugin.runtime ?? 'client'}", expected ${expectedRuntime.join(', ')}.`,
      pluginId: plugin.id,
    });
  }

  try {
    for (const dependency of options.dependencies ?? []) {
      registry.register(dependency);
    }
    registry.register(plugin);
    await registry.setup(plugin.id);
  } catch (error) {
    issues.push(toValidationIssue(plugin.id, error));
  }

  const diagnostics = registry.getDiagnostics();
  for (const diagnostic of diagnostics) {
    issues.push({
      code: 'diagnostic',
      message: diagnostic.message,
      pluginId: plugin.id,
      details: diagnostic,
    });
  }

  const saveNamespaces = registry.context.save
    .list()
    .filter((entry) => entry.pluginId === plugin.id)
    .map((entry) => entry.id);

  for (const namespace of options.requiredSaveNamespaces ?? []) {
    if (saveNamespaces.includes(namespace)) continue;
    issues.push({
      code: 'save-namespace',
      message: `Plugin "${plugin.id}" did not register required save namespace "${namespace}".`,
      pluginId: plugin.id,
      details: { namespace, saveNamespaces },
    });
  }

  const allowedSaveNamespaces = options.allowedSaveNamespaces
    ? new Set(options.allowedSaveNamespaces)
    : null;
  if (allowedSaveNamespaces) {
    for (const namespace of saveNamespaces) {
      if (allowedSaveNamespaces.has(namespace)) continue;
      issues.push({
        code: 'save-namespace',
        message: `Plugin "${plugin.id}" registered unexpected save namespace "${namespace}".`,
        pluginId: plugin.id,
        details: { namespace, allowedSaveNamespaces: Array.from(allowedSaveNamespaces) },
      });
    }
  }

  const manifest = registry.get(plugin.id)?.manifest ?? null;
  await registry.disposeAll();

  return {
    ok: issues.length === 0,
    pluginId: plugin.id,
    manifest,
    issues,
    diagnostics,
    saveNamespaces,
  };
}

export async function assertValidGaesupPlugin(
  plugin: GaesupPlugin,
  options: PluginValidationOptions = {},
): Promise<PluginValidationResult> {
  const result = await validateGaesupPlugin(plugin, options);
  if (!result.ok) {
    throw new PluginValidationAssertionError(result);
  }
  return result;
}

function toValidationIssue(pluginId: string, error: unknown): PluginValidationIssue {
  if (error instanceof PluginManifestValidationError) {
    return { code: 'manifest', message: error.message, pluginId, details: error };
  }
  if (
    error instanceof MissingPluginDependencyError ||
    error instanceof PluginVersionMismatchError ||
    error instanceof CircularPluginDependencyError
  ) {
    return { code: 'dependency', message: error.message, pluginId, details: error };
  }
  if (error instanceof DuplicatePluginError) {
    return { code: 'setup', message: error.message, pluginId, details: error };
  }
  return {
    code: 'setup',
    message: error instanceof Error ? error.message : 'Plugin setup failed.',
    pluginId,
    details: error,
  };
}
