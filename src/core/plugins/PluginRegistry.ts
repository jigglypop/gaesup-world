import { createPluginContext } from './createPluginContext';
import type {
  GaesupPlugin,
  PluginContext,
  PluginContextOptions,
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
  constructor(pluginId: string, dependencyId: string) {
    super(`Plugin "${pluginId}" depends on missing plugin "${dependencyId}".`);
    this.name = 'MissingPluginDependencyError';
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
  readonly context: PluginContext;

  constructor(options: PluginContextOptions = {}) {
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

  private async setupInternal(id: string, visiting: Set<string>): Promise<void> {
    const record = this.records.get(id);
    if (!record) return;
    if (record.status === 'ready') return;
    if (record.status === 'setting-up' || visiting.has(id)) {
      throw new CircularPluginDependencyError(id);
    }

    visiting.add(id);
    for (const dependencyId of record.plugin.dependencies ?? []) {
      if (!this.records.has(dependencyId)) {
        throw new MissingPluginDependencyError(id, dependencyId);
      }
      await this.setupInternal(dependencyId, visiting);
    }

    for (const dependencyId of record.plugin.optionalDependencies ?? []) {
      if (this.records.has(dependencyId)) {
        await this.setupInternal(dependencyId, visiting);
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

  private toDependencyRecord(dependencies?: string[]): Record<string, string> | undefined {
    if (!dependencies || dependencies.length === 0) return undefined;
    return Object.fromEntries(dependencies.map((id) => [id, '*']));
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
