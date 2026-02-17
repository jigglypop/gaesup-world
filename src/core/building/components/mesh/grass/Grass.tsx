import { FC, memo, useEffect, useMemo, useRef, useState } from "react";

import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";

import bladeAlpha from "/resources/blade_alpha.jpg";
import bladeDiffuse from "/resources/blade_diffuse.jpg";
import fragmentShader from "./frag.glsl";
import { GrassMeshProps } from "./type";
import vertexShader from "./vert.glsl";
import { loadCoreWasm, type GaesupCoreWasmExports } from "@core/wasm/loader";

const noise2D = createNoise2D();

const GrassMaterial = shaderMaterial(
  {
    bladeHeight: 1,
    map: null as THREE.Texture | null,
    alphaMap: null as THREE.Texture | null,
    time: 0,
    tipColor: new THREE.Color(0.0, 0.6, 0.0).convertSRGBToLinear(),
    bottomColor: new THREE.Color(0.0, 0.1, 0.0).convertSRGBToLinear(),
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
      offsets: new Float32Array(new Float32Array(buf, offsetsPtr, offsetsLen)),
      orientations: new Float32Array(new Float32Array(buf, orientationsPtr, orientationsLen)),
      stretches: new Float32Array(new Float32Array(buf, stretchesPtr, instances)),
      halfRootAngleSin: new Float32Array(new Float32Array(buf, halfSinPtr, instances)),
      halfRootAngleCos: new Float32Array(new Float32Array(buf, halfCosPtr, instances)),
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

  let i = 0;
  let j = 0;

  for (let idx = 0; idx < instances; idx++) {
    const ix = idx % gridSize;
    const iz = (idx / gridSize) | 0;

    const x = (ix + 0.5) * cellSize - width / 2;
    const z = (iz + 0.5) * cellSize - width / 2;
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

    stretches[idx] = 0.8 + Math.random() * 0.2;
  }

  return { offsets, orientations, stretches, halfRootAngleCos, halfRootAngleSin };
}

const Grass: FC<GrassMeshProps> = memo(
  ({
    options = { bW: 0.12, bH: 0.5, joints: 5 },
    width = 4,
    instances = 1000,
    ...props
  }) => {
    const { bW, bH, joints } = options;
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const geometryRef = useRef<THREE.InstancedBufferGeometry | null>(null);

    const [texture, alphaMap] = useLoader(THREE.TextureLoader, [
      bladeDiffuse,
      bladeAlpha,
    ]);

    // WASM-accelerated attribute generation with JS fallback.
    const [wasmModule, setWasmModule] = useState<GaesupCoreWasmExports | null>(null);
    useEffect(() => {
      loadCoreWasm().then((w) => { if (w) setWasmModule(w); });
    }, []);

    const attributeData = useMemo(
      () => wasmModule
        ? buildAttributeDataWasm(wasmModule, instances, width)
        : buildAttributeDataJS(instances, width),
      [instances, width, wasmModule],
    );

    const [baseGeom, groundGeo] = useMemo(() => {
      const bg = new THREE.PlaneGeometry(bW, bH, 1, joints).translate(0, bH / 2, 0);
      const gg = new THREE.PlaneGeometry(width, width, 32, 32);
      const positions = gg.getAttribute("position") as THREE.BufferAttribute;
      for (let k = 0; k < positions.count; k++) {
        const x = positions.getX(k);
        const z = positions.getZ(k);
        positions.setY(k, getYPosition(x, z));
      }
      gg.computeVertexNormals();
      return [bg, gg];
    }, [bW, bH, joints, width]);
    useEffect(() => {
      return () => {
        baseGeom.dispose();
        groundGeo.dispose();
      };
    }, [baseGeom, groundGeo]);

    useEffect(() => {
      const geo = geometryRef.current;
      if (geo) {
        geo.instanceCount = instances;
      }
    }, [instances, attributeData]);

    useFrame((state) => {
      const time = materialRef.current?.uniforms?.["time"];
      if (time) time.value = state.clock.elapsedTime / 4;
    });

    return (
      <group {...props}>
        <mesh>
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
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <bufferGeometry {...groundGeo} />
          <meshStandardMaterial color="#001f00" />
        </mesh>
      </group>
    );
  }
);

Grass.displayName = "Grass";

export default Grass;
