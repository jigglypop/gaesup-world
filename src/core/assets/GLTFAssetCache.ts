import {
  Mesh,
  SkinnedMesh,
  Texture,
  type BufferGeometry,
  type Material,
  type Skeleton,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { loadGLTF } from './gltfLoader';

export type GLTFAssetLease = { gltf: GLTF; release: () => void };

/** Models no one holds that the shared cache keeps, the most recently released: returning to one is instant. */
export const GLTF_RETAINED = 24;
/** Downloads at once; the rest wait for one to finish. */
export const GLTF_CONCURRENCY = 3;
/** Milliseconds before a failed model is downloaded again, doubling with each failure in a row up to a minute. */
export const GLTF_RETRY_MS = 5000;
const RETRY_LIMIT_MS = 60_000;

export type GLTFAssetCacheOptions = {
  /** Models no one holds that stay loaded; past that the one released longest ago is disposed. Default 0. */
  retained?: number;
  concurrency?: number;
  retryMs?: number;
};

type Entry = { promise: Promise<GLTF>; gltf?: GLTF; error?: unknown; failedAt?: number; failures: number; references: number };

/**
 * One loaded copy of each model for every consumer: leases for imperative code, `read` and `retain` for React hooks
 * (`useGLTFAsset`). A model stays loaded while anything holds it, then among the `retained` most recently released;
 * past that its geometry, materials and textures are disposed. A failed model fails fast until its retry pause ends.
 */
export class GLTFAssetCache {
  private readonly entries = new Map<string, Entry>();
  /** Loaded models no one holds, the first released longest ago. */
  private readonly idle = new Set<string>();
  private readonly waiting: (() => void)[] = [];
  private active = 0;
  private readonly retained: number;
  private readonly concurrency: number;
  private readonly retryMs: number;

  constructor(
    private readonly load: (uri: string) => Promise<GLTF> = loadGLTF,
    { retained = 0, concurrency = GLTF_CONCURRENCY, retryMs = GLTF_RETRY_MS }: GLTFAssetCacheOptions = {},
  ) {
    this.retained = retained;
    this.concurrency = concurrency;
    this.retryMs = retryMs;
  }

  async acquire(uri: string): Promise<GLTFAssetLease> {
    const entry = this.entry(uri);
    const release = this.hold(uri, entry);
    try {
      return { gltf: await entry.promise, release };
    } catch (error) {
      release();
      throw error;
    }
  }

  /** The loaded model for a render: throws the pending load for Suspense, or the failure for an error boundary. */
  read(uri: string): GLTF {
    const entry = this.entry(uri);
    if (entry.gltf) return entry.gltf;
    throw entry.failedAt === undefined ? entry.promise : entry.error;
  }

  /** Holds the model at `uri` for one user, as a lease does; the returned function lets go of it. */
  retain(uri: string): () => void {
    return this.hold(uri, this.entry(uri));
  }

  /** Starts loading `uri` without holding it. */
  preload(uri: string): void {
    this.entry(uri);
  }

  getReferenceCount(uri: string): number {
    return this.entries.get(uri)?.references ?? 0;
  }

  /** The entry of `uri`, loading it when there is none or its failure's retry pause is over. */
  private entry(uri: string): Entry {
    const known = this.entries.get(uri);
    if (known && (known.failedAt === undefined || Date.now() - known.failedAt < this.pause(known.failures))) return known;
    const entry = { failures: known?.failures ?? 0, references: 0 } as Entry;
    entry.promise = this.queue(uri).then(
      (gltf) => {
        entry.gltf = gltf;
        // Loaded for a render or a preload: retained like a released model, pushed out by a later release.
        if (entry.references === 0 && this.entries.get(uri) === entry) this.idle.add(uri);
        return gltf;
      },
      (error: unknown) => {
        entry.error = error;
        entry.failedAt = Date.now();
        entry.failures++;
        throw error;
      },
    );
    // Callers see a failure through `read` and `acquire`; the stored promise must not report it as unhandled.
    entry.promise.catch(() => undefined);
    this.entries.set(uri, entry);
    return entry;
  }

  private pause(failures: number): number {
    return Math.min(RETRY_LIMIT_MS, this.retryMs * 2 ** Math.max(0, failures - 1));
  }

  private hold(uri: string, entry: Entry): () => void {
    entry.references++;
    this.idle.delete(uri);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (--entry.references === 0 && entry.gltf) this.letGo(uri, entry);
    };
  }

  /** A loaded model no one holds joins the retained ones; past their count the one released longest ago is disposed. */
  private letGo(uri: string, entry: Entry): void {
    if (this.entries.get(uri) !== entry) return;
    this.idle.add(uri);
    for (const oldest of this.idle) {
      if (this.idle.size <= this.retained) return;
      this.idle.delete(oldest);
      const gltf = this.entries.get(oldest)?.gltf;
      this.entries.delete(oldest);
      if (gltf) disposeGLTFAsset(gltf);
    }
  }

  /** Runs a load when fewer than `concurrency` run; a finishing load hands its slot to the next one waiting. */
  private async queue(uri: string): Promise<GLTF> {
    if (this.active < this.concurrency) this.active++;
    else await new Promise<void>((resolve) => this.waiting.push(resolve));
    try {
      return await this.load(uri);
    } finally {
      const next = this.waiting.shift();
      if (next) next();
      else this.active--;
    }
  }
}

/** Disposes every geometry, material, texture and skeleton of a loaded model: only once nothing draws it any more. */
export function disposeGLTFAsset(gltf: Pick<GLTF, 'scenes'>): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const skeletons = new Set<Skeleton>();
  for (const scene of gltf.scenes)
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      if (object instanceof SkinnedMesh) skeletons.add(object.skeleton);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material))
          if (value instanceof Texture) textures.add(value);
      }
    });
  for (const resource of [...geometries, ...materials, ...textures, ...skeletons])
    resource.dispose();
}

/** The cache every gaesup-world component loads models through. */
export const gltfAssetCache = new GLTFAssetCache(loadGLTF, { retained: GLTF_RETAINED });
