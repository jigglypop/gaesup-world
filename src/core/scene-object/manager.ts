import { parseSceneDocument } from './serialization';
import type { SceneDocument, SceneDocumentController, SceneObject } from './types';

export type SceneDocumentLoader = () => Promise<SceneDocument | string> | SceneDocument | string;

export type SceneLoadOptions = {
  additive?: boolean;
  idPrefix?: string;
};

export type SceneManagerEvent =
  | { type: 'loading'; sceneId: string; additive: boolean }
  | { type: 'loaded'; sceneId: string; additive: boolean; objectCount: number }
  | { type: 'unloaded'; sceneId: string }
  | { type: 'failed'; sceneId: string; message: string };

export type SceneManagerListener = (event: SceneManagerEvent) => void;

type LoadedScene = {
  sceneId: string;
  additive: boolean;
  objectIds: Set<string>;
};

function remapObjects(objects: readonly SceneObject[], prefix: string): SceneObject[] {
  if (!prefix) return [...objects];
  return objects.map((object) => ({
    ...object,
    id: `${prefix}${object.id}`,
    ...(object.parentId !== undefined ? { parentId: `${prefix}${object.parentId}` } : {}),
    components: object.components.map((component) => ({ ...component, id: `${prefix}${component.id}` })),
  }));
}

export class SceneDocumentManager {
  private readonly loaders = new Map<string, SceneDocumentLoader>();
  private readonly loaded = new Map<string, LoadedScene>();
  private readonly listeners = new Set<SceneManagerListener>();
  private generation = 0;

  constructor(private readonly controller: SceneDocumentController) {}

  register(sceneId: string, loader: SceneDocumentLoader): () => void {
    this.loaders.set(sceneId, loader);
    return () => {
      if (this.loaders.get(sceneId) === loader) this.loaders.delete(sceneId);
    };
  }

  has(sceneId: string): boolean {
    return this.loaders.has(sceneId);
  }

  getLoadedScenes(): string[] {
    return Array.from(this.loaded.keys());
  }

  subscribe(listener: SceneManagerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async load(sceneId: string, options: SceneLoadOptions = {}): Promise<boolean> {
    const loader = this.loaders.get(sceneId);
    const additive = options.additive ?? false;
    if (!loader) {
      this.emit({ type: 'failed', sceneId, message: `등록되지 않은 씬입니다: ${sceneId}` });
      return false;
    }
    const generation = ++this.generation;
    this.emit({ type: 'loading', sceneId, additive });
    let source: SceneDocument | string;
    try {
      source = await loader();
    } catch (error) {
      this.emit({ type: 'failed', sceneId, message: error instanceof Error ? error.message : String(error) });
      return false;
    }
    if (!additive && generation !== this.generation) return false;
    const parsed = parseSceneDocument(source);
    if (!parsed.ok || !parsed.document) {
      this.emit({ type: 'failed', sceneId, message: parsed.issues[0]?.message ?? '씬 문서가 올바르지 않습니다' });
      return false;
    }
    return additive
      ? this.mergeAdditive(sceneId, parsed.document, options.idPrefix ?? `${sceneId}:`)
      : this.replace(sceneId, parsed.document);
  }

  unload(sceneId: string): boolean {
    const scene = this.loaded.get(sceneId);
    if (!scene || !scene.additive) return false;
    const current = this.controller.getSnapshot();
    const result = this.controller.dispatch({
      type: 'scene-document.replace',
      document: { ...current, objects: current.objects.filter((object) => !scene.objectIds.has(object.id)) },
    });
    if (!result.accepted) return false;
    this.loaded.delete(sceneId);
    this.emit({ type: 'unloaded', sceneId });
    return true;
  }

  private replace(sceneId: string, document: SceneDocument): boolean {
    const result = this.controller.dispatch({ type: 'scene-document.replace', document });
    if (!result.accepted) {
      this.emit({ type: 'failed', sceneId, message: result.issues[0]?.message ?? '씬 교체가 거부되었습니다' });
      return false;
    }
    this.loaded.clear();
    this.loaded.set(sceneId, {
      sceneId,
      additive: false,
      objectIds: new Set(document.objects.map((object) => object.id)),
    });
    this.emit({ type: 'loaded', sceneId, additive: false, objectCount: document.objects.length });
    return true;
  }

  private mergeAdditive(sceneId: string, document: SceneDocument, prefix: string): boolean {
    if (this.loaded.has(sceneId)) this.unload(sceneId);
    const current = this.controller.getSnapshot();
    const objects = remapObjects(document.objects, prefix);
    const result = this.controller.dispatch({
      type: 'scene-document.replace',
      document: { ...current, objects: [...current.objects, ...objects] },
    });
    if (!result.accepted) {
      this.emit({ type: 'failed', sceneId, message: result.issues[0]?.message ?? '씬 병합이 거부되었습니다' });
      return false;
    }
    this.loaded.set(sceneId, { sceneId, additive: true, objectIds: new Set(objects.map((object) => object.id)) });
    this.emit({ type: 'loaded', sceneId, additive: true, objectCount: objects.length });
    return true;
  }

  private emit(event: SceneManagerEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
