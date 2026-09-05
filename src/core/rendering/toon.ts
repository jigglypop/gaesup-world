import * as THREE from 'three';

const _gradientCache = new Map<number, THREE.DataTexture>();

function buildGradient(steps: number): THREE.DataTexture {
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) {
    data[i] = Math.round(((i + 1) / steps) * 255);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

export function getToonGradient(steps: number = 3): THREE.DataTexture {
  const clamped = Math.max(2, Math.min(8, Math.floor(steps)));
  const cached = _gradientCache.get(clamped);
  if (cached) return cached;
  const tex = buildGradient(clamped);
  _gradientCache.set(clamped, tex);
  return tex;
}

export type ToonOptions = {
  color?: THREE.ColorRepresentation;
  vertexColors?: boolean;
  transparent?: boolean;
  opacity?: number;
  steps?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  map?: THREE.Texture | null;
  alphaMap?: THREE.Texture | null;
  side?: THREE.Side;
  depthWrite?: boolean;
};

export function createToonMaterial(opts: ToonOptions = {}): THREE.MeshToonMaterial {
  const mat = new THREE.MeshToonMaterial({
    color: opts.color ?? '#ffffff',
    vertexColors: opts.vertexColors ?? false,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    map: opts.map ?? null,
    alphaMap: opts.alphaMap ?? null,
    emissive: opts.emissive ?? '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    gradientMap: getToonGradient(opts.steps ?? 3),
    side: opts.side ?? THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
  });
  return mat;
}

let _toonModeDefault = false;

export function setDefaultToonMode(enabled: boolean): void {
  _toonModeDefault = enabled;
}

export function getDefaultToonMode(): boolean {
  return _toonModeDefault;
}

export function disposeToonGradients(): void {
  for (const tex of _gradientCache.values()) tex.dispose();
  _gradientCache.clear();
}

type ToonMaterialValue = THREE.Material | null | undefined;

type ToonMaterialShape = ToonMaterialValue | ToonMaterialValue[];

type ToonCompatibleMesh = Omit<THREE.Mesh, 'material'> & {
  material: ToonMaterialShape;
};

type ToonMaterialSlot = {
  mesh: THREE.Mesh;
  source: ToonMaterialShape;
  projected: ToonMaterialShape;
};

type ToonOwnershipRecord = {
  replacements: Map<THREE.Material, THREE.MeshToonMaterial>;
  slots: ToonMaterialSlot[];
};

const _toonOwnership = new WeakMap<THREE.Object3D, ToonOwnershipRecord>();

function getMeshMaterial(mesh: THREE.Mesh): ToonMaterialShape {
  return (mesh as unknown as ToonCompatibleMesh).material;
}

function setMeshMaterial(mesh: THREE.Mesh, material: ToonMaterialShape): void {
  (mesh as unknown as ToonCompatibleMesh).material = material;
}

function isToonMaterial(material: THREE.Material): material is THREE.MeshToonMaterial {
  return (material as THREE.MeshToonMaterial).isMeshToonMaterial === true;
}

function createSceneToonMaterial(
  source: THREE.Material,
  gradient: THREE.DataTexture,
): THREE.MeshToonMaterial {
  const standard = source as THREE.MeshStandardMaterial;
  return new THREE.MeshToonMaterial({
    color: standard.color?.clone() ?? new THREE.Color('#ffffff'),
    map: standard.map ?? null,
    normalMap: standard.normalMap ?? null,
    alphaMap: standard.alphaMap ?? null,
    transparent: source.transparent,
    opacity: source.opacity,
    side: source.side,
    emissive: standard.emissive?.clone() ?? new THREE.Color(0x000000),
    emissiveMap: standard.emissiveMap ?? null,
    emissiveIntensity: standard.emissiveIntensity ?? 1,
    gradientMap: gradient,
  });
}

function disposeGeneratedMaterials(materials: Iterable<THREE.MeshToonMaterial>): void {
  let hasError = false;
  let firstError: unknown;
  for (const material of materials) {
    try {
      material.dispose();
    } catch (error) {
      if (!hasError) {
        hasError = true;
        firstError = error;
      }
    }
  }
  if (hasError) throw firstError;
}

export function applyToonToScene(root: THREE.Object3D, steps: number = 4): void {
  if (!root || _toonOwnership.has(root)) return;

  const replacements = new Map<THREE.Material, THREE.MeshToonMaterial>();
  const slots: ToonMaterialSlot[] = [];
  let gradient: THREE.DataTexture | undefined;
  const project = (source: ToonMaterialValue): ToonMaterialValue => {
    if (!source) return source;
    if (isToonMaterial(source)) return source;
    const existing = replacements.get(source);
    if (existing) return existing;
    gradient ??= getToonGradient(steps);
    const generated = createSceneToonMaterial(source, gradient);
    replacements.set(source, generated);
    return generated;
  };

  try {
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = getMeshMaterial(mesh);
      if (Array.isArray(source)) {
        const projected = source.map(project);
        if (projected.some((material, index) => material !== source[index])) {
          slots.push({ mesh, source, projected });
        }
        return;
      }
      const projected = project(source);
      if (projected !== source) slots.push({ mesh, source, projected });
    });
  } catch (error) {
    try {
      disposeGeneratedMaterials(replacements.values());
    } catch {
      // Preserve the application error while still attempting every generated material cleanup.
    }
    throw error;
  }

  _toonOwnership.set(root, { replacements, slots });
  const attempted: ToonMaterialSlot[] = [];
  try {
    for (const slot of slots) {
      attempted.push(slot);
      setMeshMaterial(slot.mesh, slot.projected);
    }
  } catch (error) {
    _toonOwnership.delete(root);
    for (let index = attempted.length - 1; index >= 0; index--) {
      const slot = attempted[index];
      if (!slot) continue;
      try {
        setMeshMaterial(slot.mesh, slot.source);
      } catch {
        // Preserve the assignment error while continuing rollback and generated material cleanup.
      }
    }
    try {
      disposeGeneratedMaterials(replacements.values());
    } catch {
      // Preserve the assignment error while still attempting every generated material cleanup.
    }
    throw error;
  }
}

export function releaseToonFromScene(root: THREE.Object3D): void {
  const ownership = _toonOwnership.get(root);
  if (!ownership) return;
  _toonOwnership.delete(root);

  let hasError = false;
  let firstError: unknown;
  const captureError = (error: unknown): void => {
    if (hasError) return;
    hasError = true;
    firstError = error;
  };
  const sourcesByGenerated = new Map<THREE.Material, THREE.Material>();
  for (const [source, generated] of ownership.replacements) {
    sourcesByGenerated.set(generated, source);
  }
  for (const slot of ownership.slots) {
    try {
      const current = getMeshMaterial(slot.mesh);
      if (Array.isArray(current)) {
        const projected = slot.projected;
        const canRestoreOriginal =
          Array.isArray(projected) &&
          current.length === projected.length &&
          current.every((material, index) => material === projected[index]);
        if (canRestoreOriginal) {
          setMeshMaterial(slot.mesh, slot.source);
          continue;
        }
        let changed = false;
        const restored = current.map((material) => {
          if (!material) return material;
          const source = sourcesByGenerated.get(material);
          if (!source) return material;
          changed = true;
          return source;
        });
        if (changed) setMeshMaterial(slot.mesh, restored);
        continue;
      }
      if (!current) continue;
      const source = sourcesByGenerated.get(current);
      if (source) setMeshMaterial(slot.mesh, source);
    } catch (error) {
      captureError(error);
    }
  }

  try {
    disposeGeneratedMaterials(ownership.replacements.values());
  } catch (error) {
    captureError(error);
  }
  if (hasError) throw firstError;
}
