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

const _toonSwappedRoots = new WeakSet<THREE.Object3D>();

export function applyToonToScene(root: THREE.Object3D, steps: number = 4): void {
  if (!root || _toonSwappedRoots.has(root)) return;
  _toonSwappedRoots.add(root);
  const gradient = getToonGradient(steps);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = mats.map((src) => {
      if (!src) return src;
      const m = src as THREE.MeshToonMaterial;
      if (m.isMeshToonMaterial) return src;
      const std = src as THREE.MeshStandardMaterial;
      const toon = new THREE.MeshToonMaterial({
        color: (std.color && std.color.clone()) || new THREE.Color('#ffffff'),
        map: std.map ?? null,
        normalMap: std.normalMap ?? null,
        alphaMap: std.alphaMap ?? null,
        transparent: src.transparent,
        opacity: src.opacity,
        side: src.side,
        emissive: (std.emissive && std.emissive.clone()) || new THREE.Color(0x000000),
        emissiveMap: std.emissiveMap ?? null,
        emissiveIntensity: std.emissiveIntensity ?? 1,
        gradientMap: gradient,
      } as THREE.MeshToonMaterialParameters);
      return toon;
    });
    mesh.material = Array.isArray(mesh.material)
      ? (next as THREE.Material[])
      : (next[0] as THREE.Material);
  });
}
