import * as THREE from 'three';

/**
 * `geometry.userData` key under which a merged geometry lists its parts: the draw offset (index offset, or vertex offset
 * without an index) where each part ends, ascending. Such a geometry fades part by part instead of as a whole.
 */
export const MERGED_PARTS_KEY = 'mergedParts';

const COLLAPSED = new THREE.Matrix4().makeScale(0, 0, 0);
const tint = new THREE.Color();
const skipRaycast = (): void => {};

/** A whole mesh swaps its material; an instance is drawn apart by a proxy; a merged part draws in its own group. */
export type FadeKind = 'whole' | 'instance' | 'part';

/** One occluder made see-through: a mesh, or one instance or merged part of it. */
export type Fade = {
  kind: FadeKind;
  mesh: THREE.Mesh;
  /** The instance or merged part; -1 for a whole mesh. */
  part: number;
  /** What the mesh drew with when the fade was made. */
  original: THREE.Material | THREE.Material[];
  /** The distinct original materials, and a see-through copy and the opacity of each. */
  sources: THREE.Material[];
  copies: THREE.Material[];
  opacities: number[];
  /** `original` with each material replaced by its copy. */
  faded: THREE.Material | THREE.Material[];
  /** Draws the instance while its batch holds it at zero scale; its matrix is the instance's own. */
  proxy: THREE.Mesh | null;
  /** Draw range of a merged part. */
  start: number;
  count: number;
  /** 0 opaque to 1 fully faded. */
  amount: number;
  /** Seconds it still counts as occluding; each contact sets it again. */
  hold: number;
  shown: boolean;
};

/** A merged mesh with faded parts: its own material, and the groups and materials it draws with meanwhile. */
type Merged = { original: THREE.Material; geometry: THREE.BufferGeometry; array: THREE.Material[]; fades: Fade[] };

function fadeableMaterial(material: THREE.Material | undefined): boolean {
  return !!material && material.visible && material.colorWrite && !(material as THREE.ShaderMaterial).isShaderMaterial;
}

function fadeable(material: THREE.Material | THREE.Material[]): boolean {
  if (!Array.isArray(material)) return fadeableMaterial(material);
  for (let i = 0; i < material.length; i++) if (!fadeableMaterial(material[i])) return false;
  return material.length > 0;
}

function sameMaterial(a: THREE.Material | THREE.Material[], b: THREE.Material | THREE.Material[]): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
  return a.length === b.length && a.every((material, i) => material === b[i]);
}

/** Turns `copy`, a copy of `material`, see-through. `Material.copy` leaves out instance shader hooks; they come along. */
function seeThroughCopy(copy: THREE.Material, material: THREE.Material): THREE.Material {
  if (Object.hasOwn(material, 'onBeforeCompile')) copy.onBeforeCompile = material.onBeforeCompile;
  if (Object.hasOwn(material, 'customProgramCacheKey')) copy.customProgramCacheKey = material.customProgramCacheKey;
  copy.transparent = true;
  // A faded occluder must not hide what is behind it, itself included.
  copy.depthWrite = false;
  return copy;
}

/** A proxy is no instance, so the instance color moves into its copies. */
function tintProxy(fade: Fade): void {
  const color = (fade.mesh as THREE.InstancedMesh).instanceColor;
  if (!color) return;
  tint.fromBufferAttribute(color, fade.part);
  for (const copy of fade.copies) (copy as { color?: THREE.Color }).color?.multiply(tint);
}

/** Draws one instance of `batch` apart: a plain mesh the sweeps and pointer events pass through. */
function proxyOf(batch: THREE.InstancedMesh, material: THREE.Material | THREE.Material[]): THREE.Mesh {
  const proxy = new THREE.Mesh(batch.geometry, material);
  proxy.name = 'camera-fade';
  proxy.matrixAutoUpdate = false;
  proxy.castShadow = batch.castShadow;
  proxy.receiveShadow = batch.receiveShadow;
  proxy.renderOrder = batch.renderOrder;
  proxy.frustumCulled = batch.frustumCulled;
  proxy.layers.mask = batch.layers.mask;
  proxy.userData['intangible'] = true;
  proxy.raycast = skipRaycast;
  return proxy;
}

function collapsed(batch: THREE.InstancedMesh, instance: number): boolean {
  const matrices = batch.instanceMatrix.array;
  for (let i = 0; i < 16; i++) if (matrices[instance * 16 + i] !== COLLAPSED.elements[i]) return false;
  return true;
}

/** The part of a merged geometry that draw offset `offset` belongs to, or -1. */
export function partAt(geometry: THREE.BufferGeometry, offset: number): number {
  const ends = geometry.userData[MERGED_PARTS_KEY] as ArrayLike<number>;
  let low = 0;
  let high = ends.length - 1;
  if (high < 0 || offset >= ends[high]!) return -1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (ends[middle]! > offset) high = middle;
    else low = middle + 1;
  }
  return low;
}

/**
 * Makes occluders see-through without changing anything they share: each fade draws with copies of its own. A whole mesh
 * swaps its material, a batch holds the instance at zero scale while a proxy draws it, and a merged part draws in a group
 * of its own. A fade is undone only where the mesh still draws what it made; an owner that replaced a material, geometry
 * or instance keeps its change.
 */
export class SeeThrough {
  private readonly merged = new Map<THREE.Mesh, Merged>();

  /** How the mesh can fade: null when invisible, batched, a shader material, or a merged mesh already split in groups. */
  kindOf(mesh: THREE.Mesh): FadeKind | null {
    if (!mesh.visible || (mesh as THREE.BatchedMesh).isBatchedMesh) return null;
    const batch = mesh as THREE.InstancedMesh;
    if (batch.isInstancedMesh) return !batch.morphTexture && fadeable(batch.material) ? 'instance' : null;
    if (this.merged.has(mesh)) return 'part';
    if (!fadeable(mesh.material)) return null;
    if (!mesh.geometry.userData[MERGED_PARTS_KEY]) return 'whole';
    return Array.isArray(mesh.material) || mesh.geometry.groups.length > 0 ? null : 'part';
  }

  /** A fade of the mesh, instance or part, not shown yet; null when the mesh cannot fade or a material cannot be copied. */
  create(mesh: THREE.Mesh, part: number): Fade | null {
    const kind = this.kindOf(mesh);
    if (!kind) return null;
    const original = this.merged.get(mesh)?.original ?? mesh.material;
    const sources: THREE.Material[] = [];
    const copies: THREE.Material[] = [];
    const copyOf = (material: THREE.Material): THREE.Material => {
      const known = sources.indexOf(material);
      if (known >= 0) return copies[known]!;
      sources.push(material);
      copies.push(seeThroughCopy(material.clone(), material));
      return copies[copies.length - 1]!;
    };
    let faded: THREE.Material | THREE.Material[];
    try {
      faded = Array.isArray(original) ? original.map(copyOf) : copyOf(original);
    } catch {
      // A material whose userData cannot be deep-copied keeps pushing.
      copies.forEach((copy) => copy.dispose());
      return null;
    }
    const fade: Fade = {
      kind, mesh, part, original, sources, copies, opacities: sources.map((material) => material.opacity), faded,
      proxy: kind === 'instance' ? proxyOf(mesh as THREE.InstancedMesh, faded) : null,
      start: 0, count: 0, amount: 0, hold: 0, shown: false,
    };
    if (this.locate(fade)) return fade;
    copies.forEach((copy) => copy.dispose());
    return null;
  }

  /**
   * Brings a kept fade up to date with the mesh, whose materials, instances or merged parts may have changed since it
   * last showed. False when it no longer fits: other materials, a part or instance gone, a material that no longer copies.
   */
  refresh(fade: Fade): boolean {
    const { mesh } = fade;
    if (this.kindOf(mesh) !== fade.kind || !sameMaterial(fade.original, this.merged.get(mesh)?.original ?? mesh.material)) {
      return false;
    }
    try {
      for (let k = 0; k < fade.copies.length; k++) {
        const source = fade.sources[k]!;
        seeThroughCopy(fade.copies[k]!.copy(source), source).needsUpdate = true;
        fade.opacities[k] = source.opacity;
      }
    } catch {
      return false;
    }
    return this.locate(fade);
  }

  show(fade: Fade): void {
    fade.shown = true;
    const { mesh } = fade;
    if (fade.kind === 'whole') mesh.material = fade.faded;
    else if (fade.kind === 'part') this.layout(mesh, fade, true);
    else {
      const batch = mesh as THREE.InstancedMesh;
      const proxy = fade.proxy!;
      batch.getMatrixAt(fade.part, proxy.matrix);
      proxy.matrixWorldNeedsUpdate = true;
      batch.setMatrixAt(fade.part, COLLAPSED);
      batch.instanceMatrix.needsUpdate = true;
      batch.add(proxy);
    }
  }

  /** Puts back what the fade changed, where the mesh still draws what the fade left it. */
  hide(fade: Fade): void {
    if (!fade.shown) return;
    fade.shown = false;
    const { mesh } = fade;
    if (fade.kind === 'whole') {
      if (mesh.material === fade.faded) mesh.material = fade.original;
    } else if (fade.kind === 'part') this.layout(mesh, fade, false);
    else {
      const batch = mesh as THREE.InstancedMesh;
      const proxy = fade.proxy!;
      if (proxy.parent === batch && fade.part < batch.count && collapsed(batch, fade.part)) {
        batch.setMatrixAt(fade.part, proxy.matrix);
        batch.instanceMatrix.needsUpdate = true;
      }
      proxy.removeFromParent();
    }
  }

  /** Whether the mesh still draws what the fade made: its owner may have replaced a material, geometry or instances. */
  owns(fade: Fade): boolean {
    const { mesh } = fade;
    if (fade.kind === 'whole') return mesh.material === fade.faded;
    if (fade.kind === 'part') {
      const merged = this.merged.get(mesh);
      return !!merged && mesh.material === merged.array && mesh.geometry === merged.geometry;
    }
    const batch = mesh as THREE.InstancedMesh;
    return fade.proxy!.parent === batch && fade.part < batch.count && collapsed(batch, fade.part);
  }

  /** Undoes the fade where it still can and frees its copies. */
  release(fade: Fade): void {
    this.hide(fade);
    for (const copy of fade.copies) copy.dispose();
  }

  /** Takes the part's draw range, or the instance's geometry and color, from the mesh as it is now; false once gone. */
  private locate(fade: Fade): boolean {
    const { mesh, part } = fade;
    if (fade.kind === 'part') {
      const ends = mesh.geometry.userData[MERGED_PARTS_KEY] as ArrayLike<number>;
      if (part >= ends.length) return false;
      fade.start = part > 0 ? ends[part - 1]! : 0;
      fade.count = ends[part]! - fade.start;
    } else if (fade.kind === 'instance') {
      if (part >= (mesh as THREE.InstancedMesh).count) return false;
      fade.proxy!.geometry = mesh.geometry;
      tintProxy(fade);
    }
    return true;
  }

  /** Draws a merged mesh with one group per faded part, or as before once none is left. */
  private layout(mesh: THREE.Mesh, fade: Fade, add: boolean): void {
    let merged = this.merged.get(mesh);
    if (add && !merged) {
      merged = { original: mesh.material as THREE.Material, geometry: mesh.geometry, array: [], fades: [] };
      this.merged.set(mesh, merged);
    }
    if (!merged) return;
    if (add) merged.fades.push(fade);
    else merged.fades.splice(merged.fades.indexOf(fade), 1);
    const { geometry, fades } = merged;
    const current = mesh.material === merged.array || mesh.material === merged.original;
    if (fades.length === 0) {
      this.merged.delete(mesh);
      if (mesh.material === merged.array) mesh.material = merged.original;
      if (mesh.geometry === geometry) geometry.clearGroups();
      return;
    }
    if (!current || mesh.geometry !== geometry) return;
    fades.sort((a, b) => a.start - b.start);
    merged.array = [merged.original];
    geometry.clearGroups();
    let cursor = 0;
    for (const part of fades) {
      if (part.start > cursor) geometry.addGroup(cursor, part.start - cursor, 0);
      geometry.addGroup(part.start, part.count, merged.array.push(part.faded as THREE.Material) - 1);
      cursor = part.start + part.count;
    }
    const end = geometry.index ? geometry.index.count : geometry.getAttribute('position').count;
    if (end > cursor) geometry.addGroup(cursor, end - cursor, 0);
    mesh.material = merged.array;
  }
}
