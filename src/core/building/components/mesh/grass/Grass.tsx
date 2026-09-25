import { FC, lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from "react";

import { useThree } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";

import { extendOnce } from '@/core/rendering/extendOnce';
import { shaderMaterial } from '@/core/rendering/legacyDrei';
import { usePerfStore } from "@core/perf/stores/perfStore";
import { createToonMaterial, getDefaultToonMode } from "@core/rendering/toon";
import { loadCoreWasm, type GaesupCoreWasmExports } from "@core/wasm/loader";

import {
  DEFAULT_BLADE_ALPHA_URL,
  DEFAULT_BLADE_DIFFUSE_URL,
  resolveGrassTextureSources,
} from "./assets";
import { placeGrassOnCells } from './cells';
import fragmentShader from "./frag.glsl";
import { GrassDepthMaterial } from './GrassDepthMaterial';
import { setGrassManagerWasm, type GrassTileRenderState } from "./manager";
import { GrassMaterialInstance, GrassMeshProps } from "./type";
import { useGrassManager } from "./useGrassManager";
import vertexShader from "./vert.glsl";

let _grassGroundToon: THREE.MeshToonMaterial | null = null;
let _grassGroundPbr: THREE.MeshStandardMaterial | null = null;
let _fallbackBladeDiffuse: THREE.DataTexture | null = null;
let _fallbackBladeAlpha: THREE.DataTexture | null = null;
let _grassTextureLoader: THREE.TextureLoader | null = null;

function getGrassTextureLoader(): THREE.TextureLoader {
  _grassTextureLoader ??= new THREE.TextureLoader();
  return _grassTextureLoader;
}

function createSolidTexture(r: number, g: number, b: number, a: number): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([r, g, b, a]), 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

function getFallbackBladeDiffuse(): THREE.Texture {
  _fallbackBladeDiffuse ??= createSolidTexture(102, 168, 70, 255);
  return _fallbackBladeDiffuse;
}

function getFallbackBladeAlpha(): THREE.Texture {
  _fallbackBladeAlpha ??= createSolidTexture(255, 255, 255, 255);
  return _fallbackBladeAlpha;
}

function configureBladeTexture(texture: THREE.Texture, colorSpace: THREE.ColorSpace): THREE.Texture {
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function loadBladeTexture(url: string, fallbackUrl: string, fallbackTexture: THREE.Texture, colorSpace: THREE.ColorSpace) {
  const loader = getGrassTextureLoader();
  const load = (src: string) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        src,
        (texture) => resolve(configureBladeTexture(texture, colorSpace)),
        undefined,
        reject,
      );
    });

  return load(url).catch(() => (url === fallbackUrl ? fallbackTexture : load(fallbackUrl).catch(() => fallbackTexture)));
}

export function getGrassGroundMaterial(toon: boolean): THREE.Material {
  if (toon) {
    if (!_grassGroundToon) {
      _grassGroundToon = createToonMaterial({
        color: '#ffffff',
        vertexColors: true,
        steps: 3,
      });
    }
    return _grassGroundToon;
  }
  if (!_grassGroundPbr) {
    _grassGroundPbr = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.95,
      metalness: 0.0,
    });
  }
  return _grassGroundPbr;
}

const noise2D = createNoise2D();
const GROUND_LIGHT = new THREE.Color('#5a7a35');
const GROUND_ACCENT = new THREE.Color('#7a8e3a');
const GROUND_DIRT = new THREE.Color('#5b4628');
/** Blades never stop the camera or other ray probes. */
const GRASS_USER_DATA = { intangible: true };

const GrassMaterial = shaderMaterial(
  {
    ...Object.fromEntries(Object.entries(THREE.UniformsLib.lights).map(([key, uniform]) => [key, uniform.value])),
    bladeHeight: 1,
    map: null as THREE.Texture | null,
    alphaMap: null as THREE.Texture | null,
    time: 0,
    windScale: 1.0,
    trampleCenter: new THREE.Vector3(0, -9999, 0),
    trampleRadius: 1.4,
    trampleStrength: 0.85,
    tipColor: new THREE.Color("#8fbc5a"),
    bottomColor: new THREE.Color("#355b2d"),
    uToon: 0,
    uToonSteps: 4,
  },
  vertexShader,
  fragmentShader
);

const extendGrassMaterial = extendOnce({ GrassMaterial });
const NodeGrassMaterial = lazy(() => import('./NodeGrassMaterial'));

function getYPosition(x: number, z: number): number {
  return 0.05 * noise2D(x / 50, z / 50) + 0.05 * noise2D(x / 100, z / 100);
}

/** Lifts ground vertices onto the noise field and paints meadow patches, dirt scuffs included. */
function paintGround(geometry: THREE.BufferGeometry, baseColor: THREE.Color, accentColor: THREE.Color): void {
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  const colors = new Float32Array(positions.count * 3);
  const tmp = new THREE.Color();
  for (let k = 0; k < positions.count; k++) {
    const x = positions.getX(k);
    const z = positions.getZ(k);
    positions.setY(k, positions.getY(k) + getYPosition(x, z));

    // Two-octave noise gives natural patchiness; an extra tight noise
    // sprinkles dirt scuffs so the ground reads as a real meadow.
    const n0 = 0.5 + 0.5 * noise2D(x * 0.18, z * 0.18);
    const n1 = 0.5 + 0.5 * noise2D(x * 0.04 + 11.3, z * 0.04 - 7.7);
    const n2 = 0.5 + 0.5 * noise2D(x * 0.55 - 3.1, z * 0.55 + 9.4);

    const tint = THREE.MathUtils.clamp(n0 * 0.65 + n1 * 0.45, 0, 1);
    tmp.copy(baseColor).multiplyScalar(0.58 + tint * 0.42).lerp(accentColor, n1 * 0.28);
    if (n2 > 0.86) {
      tmp.lerp(GROUND_DIRT, (n2 - 0.86) * 4.0);
    }

    const ci = k * 3;
    colors[ci]     = tmp.r;
    colors[ci + 1] = tmp.g;
    colors[ci + 2] = tmp.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
}

/** Noise-lifted, vertex-colored meadow ground under the given cells as one indexed geometry (one draw). */
export function createGrassGround(
  cells: ReadonlyArray<readonly [number, number, number?]>,
  cellSize: number,
  groundColor?: string,
  groundAccentColor?: string,
): THREE.BufferGeometry {
  const geometry = createCellGround(cells, cellSize);
  paintGround(geometry, new THREE.Color(groundColor ?? GROUND_LIGHT), new THREE.Color(groundAccentColor ?? GROUND_ACCENT));
  return geometry;
}

function createCellGround(cells: ReadonlyArray<readonly [number, number, number?]>, cellSize: number): THREE.BufferGeometry {
  const segments = Math.max(2, Math.min(16, Math.round(cellSize * 1.5)));
  const plane = new THREE.PlaneGeometry(cellSize, cellSize, segments, segments).rotateX(-Math.PI / 2);
  const source = plane.getAttribute("position");
  const sourceIndex = plane.index!;
  const positions = new Float32Array(cells.length * source.count * 3);
  const indices = new Uint32Array(cells.length * sourceIndex.count);
  cells.forEach(([x, z, y = 0], cell) => {
    const base = cell * source.count;
    for (let v = 0; v < source.count; v++) {
      positions[(base + v) * 3] = source.getX(v) + x;
      positions[(base + v) * 3 + 1] = source.getY(v) + y;
      positions[(base + v) * 3 + 2] = source.getZ(v) + z;
    }
    for (let i = 0; i < sourceIndex.count; i++) indices[cell * sourceIndex.count + i] = sourceIndex.getX(i) + base;
  });
  plane.dispose();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

type GrassAttributeData = {
  offsets: Float32Array;
  orientations: Float32Array;
  stretches: Float32Array;
  halfRootAngleCos: Float32Array;
  halfRootAngleSin: Float32Array;
};

function disposeBladeTextures(texture: THREE.Texture, alphaMap: THREE.Texture): void {
  if (texture !== getFallbackBladeDiffuse()) texture.dispose();
  if (alphaMap !== getFallbackBladeAlpha()) alphaMap.dispose();
}

function useGrassBladeTextures(textureSources: ReturnType<typeof resolveGrassTextureSources>) {
  const [textures, setTextures] = useState(() => ({
    texture: getFallbackBladeDiffuse(),
    alphaMap: getFallbackBladeAlpha(),
  }));

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadBladeTexture(
        textureSources.bladeDiffuseUrl,
        DEFAULT_BLADE_DIFFUSE_URL,
        getFallbackBladeDiffuse(),
        THREE.SRGBColorSpace,
      ),
      loadBladeTexture(
        textureSources.bladeAlphaUrl,
        DEFAULT_BLADE_ALPHA_URL,
        getFallbackBladeAlpha(),
        THREE.NoColorSpace,
      ),
    ]).then(([texture, alphaMap]) => {
      if (cancelled) {
        disposeBladeTextures(texture, alphaMap);
        return;
      }
      setTextures({ texture, alphaMap });
    });

    return () => {
      cancelled = true;
    };
  }, [textureSources.bladeAlphaUrl, textureSources.bladeDiffuseUrl]);

  useEffect(() => () => disposeBladeTextures(textures.texture, textures.alphaMap), [textures]);

  return textures;
}

function buildAttributeDataWasm(
  wasm: GaesupCoreWasmExports,
  instances: number,
  width: number,
): GrassAttributeData {
  const offsetsLen = instances * 3;
  const orientationsLen = instances * 4;

  const offsetsPtr = wasm.alloc_f32(offsetsLen);
  const orientationsPtr = wasm.alloc_f32(orientationsLen);
  const stretchesPtr = wasm.alloc_f32(instances);
  const halfSinPtr = wasm.alloc_f32(instances);
  const halfCosPtr = wasm.alloc_f32(instances);

  try {
    const seed = (Math.random() * 0xFFFFFFFF) >>> 0;
    wasm.fill_grass_data(instances, width, seed, offsetsPtr, orientationsPtr, stretchesPtr, halfSinPtr, halfCosPtr);

    const buf = wasm.memory.buffer;
    return {
      offsets: new Float32Array(buf, offsetsPtr, offsetsLen).slice(),
      orientations: new Float32Array(buf, orientationsPtr, orientationsLen).slice(),
      stretches: new Float32Array(buf, stretchesPtr, instances).slice(),
      halfRootAngleSin: new Float32Array(buf, halfSinPtr, instances).slice(),
      halfRootAngleCos: new Float32Array(buf, halfCosPtr, instances).slice(),
    };
  } finally {
    wasm.dealloc_f32(offsetsPtr, offsetsLen);
    wasm.dealloc_f32(orientationsPtr, orientationsLen);
    wasm.dealloc_f32(stretchesPtr, instances);
    wasm.dealloc_f32(halfSinPtr, instances);
    wasm.dealloc_f32(halfCosPtr, instances);
  }
}

function buildAttributeDataJS(instances: number, width: number): GrassAttributeData {
  const offsets = new Float32Array(instances * 3);
  const orientations = new Float32Array(instances * 4);
  const stretches = new Float32Array(instances);
  const halfRootAngleSin = new Float32Array(instances);
  const halfRootAngleCos = new Float32Array(instances);

  const quaternion = new THREE.Quaternion();
  const tempQuaternion = new THREE.Quaternion();
  const axisX = new THREE.Vector3(1, 0, 0);
  const axisZ = new THREE.Vector3(0, 0, 1);

  const gridSize = Math.ceil(Math.sqrt(instances));
  const cellSize = width / gridSize;
  // Jitter inside each cell so the field never reads as a regular grid.
  const jitter = cellSize * 0.9;

  let i = 0;
  let j = 0;

  for (let idx = 0; idx < instances; idx++) {
    const ix = idx % gridSize;
    const iz = (idx / gridSize) | 0;

    const jx = (Math.random() - 0.5) * jitter;
    const jz = (Math.random() - 0.5) * jitter;
    const x = (ix + 0.5) * cellSize - width / 2 + jx;
    const z = (iz + 0.5) * cellSize - width / 2 + jz;
    offsets[i] = x;
    offsets[i + 1] = getYPosition(x, z);
    offsets[i + 2] = z;
    i += 3;

    const angle = Math.PI - Math.random() * (Math.PI / 6);
    halfRootAngleSin[idx] = Math.sin(0.5 * angle);
    halfRootAngleCos[idx] = Math.cos(0.5 * angle);

    quaternion.setFromAxisAngle(axisZ, angle);
    tempQuaternion.setFromAxisAngle(axisX, (Math.random() * Math.PI) / 8);
    quaternion.multiply(tempQuaternion);

    orientations[j] = quaternion.x;
    orientations[j + 1] = quaternion.y;
    orientations[j + 2] = quaternion.z;
    orientations[j + 3] = quaternion.w;
    j += 4;

    stretches[idx] = 0.7 + Math.random() * 0.45;
  }

  return { offsets, orientations, stretches, halfRootAngleCos, halfRootAngleSin };
}

// Both the WASM and JS path lay blades on a regular grid. That is visually a
// dead giveaway on big tiles (you can read the rows). Apply per-cell jitter on
// top of each source so the lawn looks natural at every tile size, and add gentle
// length variance so rows of identical clones don't pop out.
function jitterAndVary(data: GrassAttributeData, instances: number, width: number): void {
  const gridSize = Math.ceil(Math.sqrt(instances));
  const cellSize = width / gridSize;
  const jitter = cellSize * 0.9;
  const offsets = data.offsets;
  const stretches = data.stretches;
  for (let idx = 0; idx < instances; idx++) {
    const oi = idx * 3;
    const x = (offsets[oi] ?? 0) + (Math.random() - 0.5) * jitter;
    const z = (offsets[oi + 2] ?? 0) + (Math.random() - 0.5) * jitter;
    offsets[oi] = x;
    offsets[oi + 2] = z;
    // Re-sample noise-driven Y so jittered position still rests on terrain.
    offsets[oi + 1] = getYPosition(x, z);
    // Wider stretch range gives a bit of natural height variation.
    stretches[idx] = 0.7 + Math.random() * 0.55;
  }
}

const GrassContent: FC<GrassMeshProps> = memo(
  ({
    options = { bW: 0.14, bH: 0.65, joints: 5 },
    width = 4,
    cells,
    cellSize = 1,
    ground = true,
    instances,
    density,
    maxInstances = 18000,
    toon,
    lod,
    center,
    groundColor,
    groundAccentColor,
    bladeTipColor,
    bladeBottomColor,
    bladeDiffuseUrl,
    bladeAlphaUrl,
    ...props
  }) => {
    extendGrassMaterial();
    const { bW = 0.14, bH = 0.65, joints = 5 } = options;
    const useNodes = useThree((state) => 'isWebGPURenderer' in state.gl && state.gl.isWebGPURenderer === true);
    const manager = useGrassManager();
    // Auto-clamp instance budget to the active perf tier. Low-end devices get
    // a quarter of the blades; high-end keep the user-supplied cap. This is
    // why "many tiles" no longer melts down on integrated GPUs.
    const instanceScale = usePerfStore((s) => s.profile.instanceScale);
    const resolvedInstances = useMemo(() => {
      if (cells?.length === 0) return 0;
      const cap = Math.max(64, Math.min(maxInstances, Math.round(maxInstances * instanceScale)));
      if (typeof instances === 'number' && instances > 0) {
        return Math.max(1, Math.min(cap, Math.floor(instances * instanceScale)));
      }
      const d = typeof density === 'number' && density > 0 ? density : 90;
      const area = Math.max(1, cells ? cells.length * cellSize * cellSize : width * width);
      return Math.max(64, Math.min(cap, Math.round(d * area * instanceScale)));
    }, [instances, density, width, maxInstances, instanceScale, cells, cellSize]);
    const maxCellHeight = useMemo(() => cells?.reduce((max, cell) => Math.max(max, Math.abs(cell[2] ?? 0)), 0) ?? 0, [cells]);
    const useToon = toon ?? getDefaultToonMode();
    const groundMat = getGrassGroundMaterial(useToon);
    const baseGroundColor = useMemo(() => new THREE.Color(groundColor ?? GROUND_LIGHT), [groundColor]);
    const accentGroundColor = useMemo(() => new THREE.Color(groundAccentColor ?? GROUND_ACCENT), [groundAccentColor]);
    const tipBladeColor = useMemo(
      () => new THREE.Color(bladeTipColor ?? '#8fbc5a'),
      [bladeTipColor],
    );
    const bottomBladeColor = useMemo(
      () => new THREE.Color(bladeBottomColor ?? '#355b2d'),
      [bladeBottomColor],
    );
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const lastInstanceCount = useRef(resolvedInstances);
    const materialRef = useRef<GrassMaterialInstance | null>(null);
    const geometryRef = useRef<THREE.InstancedBufferGeometry | null>(null);

    const textureSources = useMemo(
      () => resolveGrassTextureSources({
        ...(bladeDiffuseUrl ? { bladeDiffuseUrl } : {}),
        ...(bladeAlphaUrl ? { bladeAlphaUrl } : {}),
      }),
      [bladeDiffuseUrl, bladeAlphaUrl],
    );
    const { texture, alphaMap } = useGrassBladeTextures(textureSources);

    // WASM-accelerated attribute generation with JS fallback. Loaded once
    // and shared with the central GrassManager so manager-side passes
    // (LOD weight batching) can also benefit.
    const [wasmModule, setWasmModule] = useState<GaesupCoreWasmExports | null>(null);
    useEffect(() => {
      let active = true;
      loadCoreWasm().then((w) => {
        if (!w || !active) return;
        setWasmModule(w);
        setGrassManagerWasm(w);
      });
      return () => { active = false; };
    }, []);

    const attributeData = useMemo(
      () => {
        const data = wasmModule
          ? buildAttributeDataWasm(wasmModule, resolvedInstances, width)
          : buildAttributeDataJS(resolvedInstances, width);
        // WASM lays blades on a perfect grid (no jitter) and the JS path uses a
        // narrower jitter; normalise both with a strong jitter pass so big tiles
        // never show the underlying lattice pattern.
        jitterAndVary(data, resolvedInstances, width);
        if (cells) placeGrassOnCells(data.offsets, cells, cellSize);
        return data;
      },
      [resolvedInstances, width, wasmModule, cells, cellSize],
    );

    const baseGeom = useMemo(() => new THREE.PlaneGeometry(bW, bH, 1, joints).translate(0, bH / 2, 0), [bH, bW, joints]);
    const groundGeo = useMemo(() => {
      if (!ground) return null;
      // Ground tessellation must scale with width so the noise-driven elevation
      // stays smooth on big tiles instead of degenerating into flat quads.
      const groundSegs = Math.max(8, Math.min(128, Math.round(width * 1.5)));
      const gg = cells
        ? createCellGround(cells, cellSize)
        : new THREE.PlaneGeometry(width, width, groundSegs, groundSegs).rotateX(-Math.PI / 2);
      paintGround(gg, baseGroundColor, accentGroundColor);
      return gg;
    }, [accentGroundColor, baseGroundColor, width, cells, cellSize, ground]);
    useEffect(() => () => baseGeom.dispose(), [baseGeom]);
    useEffect(() => () => groundGeo?.dispose(), [groundGeo]);

    useEffect(() => {
      const geo = geometryRef.current;
      if (geo) {
        geo.instanceCount = resolvedInstances;
        lastInstanceCount.current = resolvedInstances;
      }
    }, [resolvedInstances, attributeData]);

    useEffect(() => {
      const m = materialRef.current;
      if (!m?.uniforms) return;
      if (m.uniforms['uToon']) m.uniforms['uToon'].value = useToon ? 1 : 0;
      if (m.uniforms['uToonSteps']) m.uniforms['uToonSteps'].value = 4;
      if (m.uniforms['tipColor']) (m.uniforms['tipColor'].value as THREE.Color).copy(tipBladeColor);
      if (m.uniforms['bottomColor']) (m.uniforms['bottomColor'].value as THREE.Color).copy(bottomBladeColor);
    }, [bottomBladeColor, tipBladeColor, useToon]);

    // Register with the central GrassManager. The manager runs one
    // shared engine frame (via <GrassDriver />) and updates per-tile
    // uniforms + instanceCount in batch. BuildingSystem mounts the driver;
    // standalone grass scenes must mount GrassDriver alongside their tiles.
    useEffect(() => {
      const grp = groupRef.current;
      const initialCenter = new THREE.Vector3();
      if (center) {
        initialCenter.set(center[0], center[1], center[2]);
      } else if (grp) {
        grp.updateWorldMatrix(true, false);
        grp.getWorldPosition(initialCenter);
      }

      const apply = (s: GrassTileRenderState) => {
        const mesh = meshRef.current;
        const geo = geometryRef.current;
        const u = materialRef.current?.uniforms;
        if (!mesh || !geo || !u) return;

        if (mesh.visible !== s.visible) mesh.visible = s.visible;
        // A previous manager registration can run before passive cleanup after
        // React replaces a smaller geometry. Never draw beyond its buffers.
        const instanceCount = Math.min(s.instanceCount, geo.getAttribute('offset')?.count ?? 0);
        if (geo.instanceCount !== instanceCount) {
          geo.instanceCount = instanceCount;
          lastInstanceCount.current = instanceCount;
        }
        if (u['bladeHeight']) u['bladeHeight'].value = bH;
        if (u['time']) u['time'].value = s.time;
        if (u['windScale']) u['windScale'].value = s.windScale;
        if (u['trampleCenter']) {
          const v = u['trampleCenter'].value as THREE.Vector3;
          v.copy(s.trampleCenter);
          mesh.worldToLocal(v);
        }
        if (u['trampleStrength']) u['trampleStrength'].value = s.trampleStrength;
      };

      const handle = manager.register({
        width,
        height: bH * 2.2 + maxCellHeight * 2,
        center: initialCenter,
        maxInstances: resolvedInstances,
        ...(lod ? { lod } : {}),
        apply,
      });

      return () => { manager.unregister(handle.id); };
    }, [manager, width, bH, maxCellHeight, resolvedInstances, center?.[0], center?.[1], center?.[2], lod?.near, lod?.far, lod?.strength]);

    // Pre-compute a bounding sphere that contains every blade in the tile.
    // InstancedBufferGeometry can't compute one automatically because the
    // per-instance offset attribute isn't part of `position`. Without this
    // the renderer falls back to skipping frustum culling and draws every
    // tile every frame.
    useEffect(() => {
      const geo = geometryRef.current;
      if (!geo) return;
      const radius = Math.hypot(width, width, bH * 2.2 + maxCellHeight * 2) * 0.5;
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, maxCellHeight * 0.5 + bH, 0), radius);
      geo.boundingBox = new THREE.Box3(
        new THREE.Vector3(-width * 0.5 - bH, -maxCellHeight - bH, -width * 0.5 - bH),
        new THREE.Vector3(width * 0.5 + bH, maxCellHeight + bH * 2.2, width * 0.5 + bH),
      );
    }, [width, bH, maxCellHeight, resolvedInstances]);

    return (
      <group ref={groupRef} {...props}>
        <mesh ref={meshRef} frustumCulled castShadow receiveShadow userData={GRASS_USER_DATA}>
          <instancedBufferGeometry
            key={resolvedInstances}
            ref={geometryRef}
            instanceCount={resolvedInstances}
            index={baseGeom.index}
            attributes-position={baseGeom.getAttribute("position")}
            attributes-uv={baseGeom.getAttribute("uv")}
            attributes-normal={baseGeom.getAttribute("normal")}
          >
            <instancedBufferAttribute attach="attributes-offset" args={[attributeData.offsets, 3]} />
            <instancedBufferAttribute attach="attributes-orientation" args={[attributeData.orientations, 4]} />
            <instancedBufferAttribute attach="attributes-stretch" args={[attributeData.stretches, 1]} />
            <instancedBufferAttribute attach="attributes-halfRootAngleSin" args={[attributeData.halfRootAngleSin, 1]} />
            <instancedBufferAttribute attach="attributes-halfRootAngleCos" args={[attributeData.halfRootAngleCos, 1]} />
          </instancedBufferGeometry>
          {useNodes ? <NodeGrassMaterial materialRef={materialRef} texture={texture} alphaMap={alphaMap}
            toon={useToon} tipColor={tipBladeColor} bottomColor={bottomBladeColor} /> : <grassMaterial
            ref={materialRef}
            map={texture ?? null}
            alphaMap={alphaMap ?? null}
            toneMapped={false}
            side={THREE.DoubleSide}
            transparent={false}
            lights
          />}
          {!useNodes && <GrassDepthMaterial source={materialRef} />}
        </mesh>
        {groundGeo && <mesh
          position={[0, 0, 0]}
          material={groundMat}
          receiveShadow
        >
          <primitive object={groundGeo} attach="geometry" />
        </mesh>}
      </group>
    );
  }
);

GrassContent.displayName = "GrassContent";

const Grass: FC<GrassMeshProps> = (props) => <Suspense fallback={null}><GrassContent {...props} /></Suspense>;
Grass.displayName = "Grass";

export default Grass;
