import { FC, memo, useEffect, useMemo, useRef, useState } from "react";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";

import { usePerfStore } from "@core/perf/stores/perfStore";
import { createToonMaterial, getDefaultToonMode } from "@core/rendering/toon";
import { loadCoreWasm, type GaesupCoreWasmExports } from "@core/wasm/loader";

import {
  DEFAULT_BLADE_ALPHA_URL,
  DEFAULT_BLADE_DIFFUSE_URL,
  resolveGrassTextureSources,
} from "./assets";
import fragmentShader from "./frag.glsl";
import { getGrassManager, setGrassManagerWasm, type GrassTileRenderState } from "./manager";
import { GrassMeshProps } from "./type";
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

function getGroundMaterial(toon: boolean): THREE.Material {
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

const GrassMaterial = shaderMaterial(
  {
    bladeHeight: 1,
    map: null as THREE.Texture | null,
    alphaMap: null as THREE.Texture | null,
    time: 0,
    windScale: 1.0,
    trampleCenter: new THREE.Vector3(0, -9999, 0),
    trampleRadius: 1.4,
    trampleStrength: 0.85,
    tipColor: new THREE.Color("#8fbc5a").convertSRGBToLinear(),
    bottomColor: new THREE.Color("#355b2d").convertSRGBToLinear(),
    uToon: 0,
    uToonSteps: 4,
  },
  vertexShader,
  fragmentShader
);

extend({ GrassMaterial });

function getYPosition(x: number, z: number): number {
  return 0.05 * noise2D(x / 50, z / 50) + 0.05 * noise2D(x / 100, z / 100);
}

type GrassAttributeData = {
  offsets: Float32Array;
  orientations: Float32Array;
  stretches: Float32Array;
  halfRootAngleCos: Float32Array;
  halfRootAngleSin: Float32Array;
};

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
      if (cancelled) return;
      setTextures({ texture, alphaMap });
    });

    return () => {
      cancelled = true;
    };
  }, [textureSources.bladeAlphaUrl, textureSources.bladeDiffuseUrl]);

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

const Grass: FC<GrassMeshProps> = memo(
  ({
    options = { bW: 0.14, bH: 0.65, joints: 5 },
    width = 4,
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
    const { bW, bH, joints } = options;
    // Auto-clamp instance budget to the active perf tier. Low-end devices get
    // a quarter of the blades; high-end keep the user-supplied cap. This is
    // why "many tiles" no longer melts down on integrated GPUs.
    const instanceScale = usePerfStore((s) => s.profile.instanceScale);
    const resolvedInstances = useMemo(() => {
      const cap = Math.max(64, Math.min(maxInstances, Math.round(maxInstances * instanceScale)));
      if (typeof instances === 'number' && instances > 0) {
        return Math.max(1, Math.min(cap, Math.floor(instances * instanceScale)));
      }
      const d = typeof density === 'number' && density > 0 ? density : 90;
      const area = Math.max(1, width * width);
      return Math.max(64, Math.min(cap, Math.round(d * area * instanceScale)));
    }, [instances, density, width, maxInstances, instanceScale]);
    const useToon = toon ?? getDefaultToonMode();
    const groundMat = getGroundMaterial(useToon);
    const baseGroundColor = useMemo(() => new THREE.Color(groundColor ?? GROUND_LIGHT), [groundColor]);
    const accentGroundColor = useMemo(() => new THREE.Color(groundAccentColor ?? GROUND_ACCENT), [groundAccentColor]);
    const tipBladeColor = useMemo(
      () => new THREE.Color(bladeTipColor ?? '#8fbc5a').convertSRGBToLinear(),
      [bladeTipColor],
    );
    const bottomBladeColor = useMemo(
      () => new THREE.Color(bladeBottomColor ?? '#355b2d').convertSRGBToLinear(),
      [bladeBottomColor],
    );
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const lastInstanceCount = useRef(resolvedInstances);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
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
      loadCoreWasm().then((w) => {
        if (!w) return;
        setWasmModule(w);
        setGrassManagerWasm(w);
      });
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
        return data;
      },
      [resolvedInstances, width, wasmModule],
    );

    const [baseGeom, groundGeo] = useMemo(() => {
      const bg = new THREE.PlaneGeometry(bW, bH, 1, joints).translate(0, bH / 2, 0);
      // Ground tessellation must scale with width so the noise-driven elevation
      // stays smooth on big tiles instead of degenerating into flat quads.
      const groundSegs = Math.max(8, Math.min(128, Math.round(width * 1.5)));
      const gg = new THREE.PlaneGeometry(width, width, groundSegs, groundSegs);
      const positions = gg.getAttribute("position") as THREE.BufferAttribute;
      const colors = new Float32Array(positions.count * 3);
      const tmp = new THREE.Color();
      for (let k = 0; k < positions.count; k++) {
        const x = positions.getX(k);
        const z = positions.getZ(k);
        positions.setY(k, getYPosition(x, z));

        // Two-octave noise gives natural patchiness; an extra tight noise
        // sprinkles dirt scuffs so the ground reads as a real meadow.
        const n0 = 0.5 + 0.5 * noise2D(x * 0.18, z * 0.18);
        const n1 = 0.5 + 0.5 * noise2D(x * 0.04 + 11.3, z * 0.04 - 7.7);
        const n2 = 0.5 + 0.5 * noise2D(x * 0.55 - 3.1, z * 0.55 + 9.4);

        const tint = THREE.MathUtils.clamp(n0 * 0.65 + n1 * 0.45, 0, 1);
        tmp.copy(baseGroundColor).multiplyScalar(0.58 + tint * 0.42).lerp(accentGroundColor, n1 * 0.28);
        if (n2 > 0.86) {
          tmp.lerp(GROUND_DIRT, (n2 - 0.86) * 4.0);
        }

        const ci = k * 3;
        colors[ci]     = tmp.r;
        colors[ci + 1] = tmp.g;
        colors[ci + 2] = tmp.b;
      }
      gg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      gg.computeVertexNormals();
      return [bg, gg];
    }, [accentGroundColor, bW, bH, baseGroundColor, joints, width]);
    useEffect(() => {
      return () => {
        baseGeom.dispose();
        groundGeo.dispose();
      };
    }, [baseGeom, groundGeo]);

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
      if (m.uniforms['tipColor']) m.uniforms['tipColor'].value.copy(tipBladeColor);
      if (m.uniforms['bottomColor']) m.uniforms['bottomColor'].value.copy(bottomBladeColor);
    }, [bottomBladeColor, tipBladeColor, useToon]);

    // Register with the central GrassManager. The manager runs one
    // shared `useFrame` (via <GrassDriver />) and updates per-tile
    // uniforms + instanceCount in batch. When the driver is not mounted
    // the local frame loop below covers a single tile so legacy uses
    // keep working.
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
        if (geo.instanceCount !== s.instanceCount) {
          geo.instanceCount = s.instanceCount;
          lastInstanceCount.current = s.instanceCount;
        }
        if (u['time']) u['time'].value = s.time;
        if (u['windScale']) u['windScale'].value = s.windScale;
        if (u['trampleCenter']) {
          const v = u['trampleCenter'].value as THREE.Vector3;
          v.copy(s.trampleCenter);
        }
        if (u['trampleStrength']) u['trampleStrength'].value = s.trampleStrength;
      };

      const handle = getGrassManager().register({
        width,
        height: bH * 1.4,
        center: initialCenter,
        maxInstances: resolvedInstances,
        ...(lod ? { lod } : {}),
        apply,
      });

      return () => { getGrassManager().unregister(handle.id); };
    }, [width, bH, resolvedInstances, center?.[0], center?.[1], center?.[2], lod?.near, lod?.far, lod?.strength]);

    // Pre-compute a bounding sphere that contains every blade in the tile.
    // InstancedBufferGeometry can't compute one automatically because the
    // per-instance offset attribute isn't part of `position`. Without this
    // the renderer falls back to skipping frustum culling and draws every
    // tile every frame.
    useEffect(() => {
      const geo = geometryRef.current;
      if (!geo) return;
      const radius = Math.hypot(width, bH * 1.4) * 0.6;
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, bH * 0.5, 0), radius);
      geo.boundingBox = new THREE.Box3(
        new THREE.Vector3(-width * 0.5, 0, -width * 0.5),
        new THREE.Vector3(width * 0.5, bH * 1.6, width * 0.5),
      );
    }, [width, bH]);

    return (
      <group ref={groupRef} {...props}>
        <mesh ref={meshRef} frustumCulled>
          <instancedBufferGeometry
            ref={geometryRef}
            index={baseGeom.index}
            attributes-position={baseGeom.getAttribute("position")}
            attributes-uv={baseGeom.getAttribute("uv")}
          >
            <instancedBufferAttribute attach="attributes-offset" args={[attributeData.offsets, 3]} />
            <instancedBufferAttribute attach="attributes-orientation" args={[attributeData.orientations, 4]} />
            <instancedBufferAttribute attach="attributes-stretch" args={[attributeData.stretches, 1]} />
            <instancedBufferAttribute attach="attributes-halfRootAngleSin" args={[attributeData.halfRootAngleSin, 1]} />
            <instancedBufferAttribute attach="attributes-halfRootAngleCos" args={[attributeData.halfRootAngleCos, 1]} />
          </instancedBufferGeometry>
          <grassMaterial
            ref={materialRef}
            map={texture ?? null}
            alphaMap={alphaMap ?? null}
            toneMapped={false}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={groundMat}
          receiveShadow
        >
          <primitive object={groundGeo} attach="geometry" />
        </mesh>
      </group>
    );
  }
);

Grass.displayName = "Grass";

export default Grass;
