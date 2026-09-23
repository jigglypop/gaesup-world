import {
  Mesh,
  SkinnedMesh,
  Texture,
  type BufferGeometry,
  type Material,
  type Skeleton,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type GLTFAssetLease = { gltf: GLTF; release: () => void };
type Entry = { promise: Promise<GLTF>; references: number };

/** Catalog resource ownership shared by imperative consumers. Instances never own source resources. */
export class GLTFAssetCache {
  private entries = new Map<string, Entry>();
  constructor(
    private readonly load: (uri: string) => Promise<GLTF> = (uri) =>
      new GLTFLoader().loadAsync(uri),
  ) {}

  async acquire(uri: string): Promise<GLTFAssetLease> {
    let entry = this.entries.get(uri);
    if (!entry) {
      entry = { promise: Promise.resolve().then(() => this.load(uri)), references: 0 };
      this.entries.set(uri, entry);
    }
    const owned = entry;
    owned.references++;
    let gltf: GLTF;
    try {
      gltf = await owned.promise;
    } catch (error) {
      owned.references--;
      if (this.entries.get(uri) === owned) this.entries.delete(uri);
      throw error;
    }
    let released = false;
    return {
      gltf,
      release: () => {
        if (released) return;
        released = true;
        if (--owned.references > 0) return;
        if (this.entries.get(uri) === owned) this.entries.delete(uri);
        disposeGLTFAsset(gltf);
      },
    };
  }
  getReferenceCount(uri: string): number {
    return this.entries.get(uri)?.references ?? 0;
  }
}

function disposeGLTFAsset(gltf: GLTF): void {
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

export const gltfAssetCache = new GLTFAssetCache();
