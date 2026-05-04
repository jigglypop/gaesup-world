import { createPluginContext } from './createPluginContext';
import type {
  GaesupPlugin,
  PluginDependencyDeclaration,
  PluginDependencyInput,
  PluginContext,
  PluginContextOptions,
  PluginDiagnostic,
  PluginManifest,
  PluginRecord,
  PluginRegistryApi,
  PluginStatus,
} from './types';

export class DuplicatePluginError extends Error {
  constructor(id: string) {
    super(`Plugin "${id}" is already registered.`);
    this.name = 'DuplicatePluginError';
  }
}

export class MissingPluginDependencyError extends Error {
  constructor(pluginId: string, dependencyId: string, versionRange = '*') {
    super(`Plugin "${pluginId}" depends on missing plugin "${dependencyId}" (${versionRange}).`);
    this.name = 'MissingPluginDependencyError';
  }
}

export class PluginVersionMismatchError extends Error {
  constructor(pluginId: string, dependencyId: string, actualVersion: string, versionRange: string) {
    super(
      `Plugin "${pluginId}" depends on "${dependencyId}" ${versionRange}, but version "${actualVersion}" is registered.`,
    );
    this.name = 'PluginVersionMismatchError';
  }
}

export class PluginManifestValidationError extends Error {
  constructor(pluginId: string, reason: string) {
    super(`Plugin "${pluginId}" has an invalid manifest: ${reason}`);
    this.name = 'PluginManifestValidationError';
  }
}

export class CircularPluginDependencyError extends Error {
  constructor(pluginId: string) {
    super(`Circular plugin dependency detected while setting up "${pluginId}".`);
    this.name = 'CircularPluginDependencyError';
  }
}

export class PluginRegistry implements PluginRegistryApi {
  private readonly records = new Map<string, PluginRecord>();
  private readonly setupOrder: string[] = [];
  private readonly options: PluginContextOptions;
  readonly context: PluginContext;

  constructor(options: PluginContextOptions = {}) {
    this.options = options;
    this.context = createPluginContext(this, options);
  }

  register(plugin: GaesupPlugin): void {
    if (this.records.has(plugin.id)) {
      throw new DuplicatePluginError(plugin.id);
    }

    this.records.set(plugin.id, {
      plugin,
      manifest: this.toManifest(plugin),
      status: 'registered',
    });
  }

  async use(plugin: GaesupPlugin): Promise<void> {
    this.register(plugin);
    await this.setup(plugin.id);
  }

  async setupAll(): Promise<void> {
    for (const id of this.records.keys()) {
      await this.setup(id);
    }
    this.reportCapabilityDiagnostics();
  }

  async setup(id: string): Promise<void> {
    await this.setupInternal(id, new Set<string>());
  }

  async dispose(id: string): Promise<void> {
    const record = this.records.get(id);
    if (!record || record.status === 'disposed') return;

    record.status = 'disposing';
    try {
      await record.plugin.dispose?.(this.context);
      this.removePluginExtensions(id);
      record.status = 'disposed';
      this.removeFromSetupOrder(id);
    } catch (error) {
      record.status = 'failed';
      record.error = error;
      throw error;
    }
  }

  async disposeAll(): Promise<void> {
    const ids = Array.from(this.setupOrder).reverse();
    for (const id of ids) {
      await this.dispose(id);
    }
  }

  has(id: string): boolean {
    return this.records.has(id);
  }

  get(id: string): PluginRecord | undefined {
    return this.records.get(id);
  }

  list(): PluginRecord[] {
    return Array.from(this.records.values());
  }

  status(id: string): PluginStatus | undefined {
    return this.records.get(id)?.status;
  }

  getDiagnostics(): PluginDiagnostic[] {
    return this.collectCapabilityDiagnostics();
  }

  private async setupInternal(id: string, visiting: Set<string>): Promise<void> {
    const record = this.records.get(id);
    if (!record) return;
    if (record.status === 'ready') return;
    if (record.status === 'setting-up' || visiting.has(id)) {
      throw new CircularPluginDependencyError(id);
    }

    this.validateManifest(record.manifest);
    visiting.add(id);
    for (const dependency of this.toDependencyDeclarations(record.plugin.dependencies)) {
      const dependencyRecord = this.records.get(dependency.id);
      const versionRange = dependency.version ?? '*';
      if (!dependencyRecord) {
        throw new MissingPluginDependencyError(id, dependency.id, versionRange);
      }
      this.validateDependencyVersion(id, dependency.id, dependencyRecord.manifest.version, versionRange);
      await this.setupInternal(dependency.id, visiting);
    }

    for (const dependency of this.toDependencyDeclarations(record.plugin.optionalDependencies)) {
      const dependencyRecord = this.records.get(dependency.id);
      if (dependencyRecord) {
        this.validateDependencyVersion(
          id,
          dependency.id,
          dependencyRecord.manifest.version,
          dependency.version ?? '*',
        );
        await this.setupInternal(dependency.id, visiting);
      }
    }

    record.status = 'setting-up';
    try {
      await record.plugin.setup(this.context);
      record.status = 'ready';
      if (!this.setupOrder.includes(id)) {
        this.setupOrder.push(id);
      }
    } catch (error) {
      record.status = 'failed';
      record.error = error;
      throw error;
    } finally {
      visiting.delete(id);
    }
  }

  private toManifest(plugin: GaesupPlugin): PluginManifest {
    const manifest: PluginManifest = {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      runtime: plugin.runtime ?? 'client',
      capabilities: plugin.capabilities ?? [],
    };
    const dependencies = this.toDependencyRecord(plugin.dependencies);
    const optionalDependencies = this.toDependencyRecord(plugin.optionalDependencies);
    if (dependencies) {
      manifest.dependencies = dependencies;
    }
    if (optionalDependencies) {
      manifest.optionalDependencies = optionalDependencies;
    }
    return manifest;
  }

  private toDependencyRecord(dependencies?: PluginDependencyInput[]): Record<string, string> | undefined {
    if (!dependencies || dependencies.length === 0) return undefined;
    return Object.fromEntries(
      this.toDependencyDeclarations(dependencies).map((dependency) => [
        dependency.id,
        dependency.version ?? '*',
      ]),
    );
  }

  private toDependencyDeclarations(
    dependencies: PluginDependencyInput[] | undefined,
  ): PluginDependencyDeclaration[] {
    if (!dependencies) return [];
    return dependencies.map((dependency) => {
      if (typeof dependency === 'string') {
        return { id: dependency, version: '*' };
      }
      return dependency.version === undefined
        ? { id: dependency.id, version: '*' }
        : { id: dependency.id, version: dependency.version };
    });
  }

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id.trim()) {
      throw new PluginManifestValidationError(manifest.id || '<empty>', 'id must be a non-empty string.');
    }
    if (!manifest.name.trim()) {
      throw new PluginManifestValidationError(manifest.id, 'name must be a non-empty string.');
    }
    if (!isValidSemver(manifest.version)) {
      throw new PluginManifestValidationError(manifest.id, `version "${manifest.version}" must be semver.`);
    }
    for (const [dependencyId, versionRange] of Object.entries(manifest.dependencies ?? {})) {
      if (!dependencyId.trim()) {
        throw new PluginManifestValidationError(manifest.id, 'dependency id must be non-empty.');
      }
      if (!isSupportedVersionRange(versionRange)) {
        throw new PluginManifestValidationError(
          manifest.id,
          `dependency "${dependencyId}" has unsupported version range "${versionRange}".`,
        );
      }
    }
    for (const [dependencyId, versionRange] of Object.entries(manifest.optionalDependencies ?? {})) {
      if (!dependencyId.trim()) {
        throw new PluginManifestValidationError(manifest.id, 'optional dependency id must be non-empty.');
      }
      if (!isSupportedVersionRange(versionRange)) {
        throw new PluginManifestValidationError(
          manifest.id,
          `optional dependency "${dependencyId}" has unsupported version range "${versionRange}".`,
        );
      }
    }
  }

  private validateDependencyVersion(
    pluginId: string,
    dependencyId: string,
    actualVersion: string,
    versionRange: string,
  ): void {
    if (!isVersionSatisfied(actualVersion, versionRange)) {
      throw new PluginVersionMismatchError(pluginId, dependencyId, actualVersion, versionRange);
    }
  }

  private reportCapabilityDiagnostics(): void {
    for (const diagnostic of this.collectCapabilityDiagnostics()) {
      this.context.logger.warn(diagnostic.message, diagnostic);
    }
  }

  private collectCapabilityDiagnostics(): PluginDiagnostic[] {
    const diagnostics: PluginDiagnostic[] = [];
    const capabilityOwners = this.collectCapabilityOwners();
    for (const capability of this.options.requiredCapabilities ?? []) {
      if (capabilityOwners.has(capability)) continue;
      diagnostics.push({
        kind: 'missing-capability',
        message: `Required capability "${capability}" is not provided by any registered plugin.`,
        pluginIds: [],
        capabilities: [capability],
      });
    }

    for (const capability of this.options.exclusiveCapabilities ?? []) {
      const owners = capabilityOwners.get(capability) ?? [];
      if (owners.length <= 1) continue;
      diagnostics.push({
        kind: 'capability-conflict',
        message: `Exclusive capability "${capability}" is provided by multiple plugins: ${owners.join(', ')}.`,
        pluginIds: owners,
        capabilities: [capability],
      });
    }

    const emittedPairs = new Set<string>();
    for (const [capability, conflicts] of Object.entries(this.options.capabilityConflicts ?? {})) {
      const owners = capabilityOwners.get(capability) ?? [];
      if (owners.length === 0) continue;
      for (const conflict of conflicts) {
        const conflictOwners = capabilityOwners.get(conflict) ?? [];
        if (conflictOwners.length === 0) continue;
        const key = [capability, conflict].sort().join('\0');
        if (emittedPairs.has(key)) continue;
        emittedPairs.add(key);
        diagnostics.push({
          kind: 'capability-conflict',
          message: `Capabilities "${capability}" and "${conflict}" are both provided.`,
          pluginIds: [...owners, ...conflictOwners],
          capabilities: [capability, conflict],
        });
      }
    }
    return diagnostics;
  }

  private collectCapabilityOwners(): Map<string, string[]> {
    const capabilityOwners = new Map<string, string[]>();
    for (const record of this.records.values()) {
      for (const capability of record.manifest.capabilities) {
        const owners = capabilityOwners.get(capability) ?? [];
        owners.push(record.manifest.id);
        capabilityOwners.set(capability, owners);
      }
    }
    return capabilityOwners;
  }

  private removeFromSetupOrder(id: string): void {
    const index = this.setupOrder.indexOf(id);
    if (index !== -1) {
      this.setupOrder.splice(index, 1);
    }
  }

  private removePluginExtensions(pluginId: string): void {
    this.context.grid.removeByPlugin(pluginId);
    this.context.placement.removeByPlugin(pluginId);
    this.context.catalog.removeByPlugin(pluginId);
    this.context.assets.removeByPlugin(pluginId);
    this.context.rendering.removeByPlugin(pluginId);
    this.context.input.removeByPlugin(pluginId);
    this.context.interactions.removeByPlugin(pluginId);
    this.context.npc.removeByPlugin(pluginId);
    this.context.quests.removeByPlugin(pluginId);
    this.context.blueprints.removeByPlugin(pluginId);
    this.context.editor.removeByPlugin(pluginId);
    this.context.save.removeByPlugin(pluginId);
    this.context.services.removeByPlugin(pluginId);
    this.context.systems.removeByPlugin(pluginId);
    this.context.components.removeByPlugin(pluginId);
  }
}

export function createPluginRegistry(options: PluginContextOptions = {}): PluginRegistry {
  return new PluginRegistry(options);
}

function isValidSemver(version: string): boolean {
  return parseSemver(version) !== null;
}

function isSupportedVersionRange(range: string): boolean {
  if (range === '*') return true;
  return range
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => {
      if (part.startsWith('^') || part.startsWith('~')) {
        return parseSemver(part.slice(1)) !== null;
      }
      const comparison = part.match(/^(>=|<=|>|<|=)(.+)$/);
      if (comparison) {
        return parseSemver(comparison[2]?.trim() ?? '') !== null;
      }
      return parseSemver(part) !== null;
    });
}

function isVersionSatisfied(version: string, range: string): boolean {
  const parsed = parseSemver(version);
  if (!parsed) return false;
  if (range === '*') return true;
  const parts = range.split(/\s+/).filter(Boolean);
  return parts.every((part) => isVersionRangePartSatisfied(parsed, part));
}

function isVersionRangePartSatisfied(
  version: readonly [number, number, number],
  rangePart: string,
): boolean {
  if (rangePart.startsWith('^')) {
    const minimum = parseSemver(rangePart.slice(1));
    if (!minimum || compareSemver(version, minimum) < 0) return false;
    const upper: [number, number, number] = minimum[0] > 0
      ? [minimum[0] + 1, 0, 0]
      : minimum[1] > 0
        ? [0, minimum[1] + 1, 0]
        : [0, 0, minimum[2] + 1];
    return compareSemver(version, upper) < 0;
  }
  if (rangePart.startsWith('~')) {
    const minimum = parseSemver(rangePart.slice(1));
    if (!minimum || compareSemver(version, minimum) < 0) return false;
    return compareSemver(version, [minimum[0], minimum[1] + 1, 0]) < 0;
  }

  const comparison = rangePart.match(/^(>=|<=|>|<|=)(.+)$/);
  if (comparison) {
    const operator = comparison[1];
    const expected = parseSemver(comparison[2]?.trim() ?? '');
    if (!operator || !expected) return false;
    const result = compareSemver(version, expected);
    switch (operator) {
      case '>':
        return result > 0;
      case '>=':
        return result >= 0;
      case '<':
        return result < 0;
      case '<=':
        return result <= 0;
      case '=':
        return result === 0;
      default:
        return false;
    }
  }

  const expected = parseSemver(rangePart);
  return expected ? compareSemver(version, expected) === 0 : false;
}

function parseSemver(version: string): [number, number, number] | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.-]+)?$/);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor) || !Number.isSafeInteger(patch)) {
    return null;
  }
  return [major, minor, patch];
}

function compareSemver(
  left: readonly [number, number, number],
  right: readonly [number, number, number],
): number {
  if (left[0] !== right[0]) return left[0] - right[0];
  if (left[1] !== right[1]) return left[1] - right[1];
  if (left[2] !== right[2]) return left[2] - right[2];
  return 0;
}
