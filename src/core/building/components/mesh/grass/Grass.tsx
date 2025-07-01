import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { FC, memo, useEffect, useMemo, useRef } from "react";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";

import fragmentShader from "./frag.glsl";
import { GrassMeshProps } from "./type";
import vertexShader from "./vert.glsl";
import bladeAlpha from "/resources/blade_alpha.jpg";
import bladeDiffuse from "/resources/blade_diffuse.jpg";

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

const Grass: FC<GrassMeshProps> = memo(
  ({
    options = { bW: 0.12, bH: 0.5, joints: 5 },
    width = 4,
    instances = 1000,
    ...props
  }) => {
    const { bW, bH, joints } = options;
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [texture, alphaMap] = useLoader(THREE.TextureLoader, [
      bladeDiffuse,
      bladeAlpha,
    ]);
    const { gl } = useThree();

    const [baseGeom, groundGeo, attributeData] = useMemo(() => {
      const baseGeom = new THREE.PlaneGeometry(bW, bH, 1, joints).translate(
        0,
        bH / 2,
        0
      );

      const groundGeo = new THREE.PlaneGeometry(width, width, 32, 32);
      const positions = groundGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        positions.setY(i, getYPosition(x, z));
      }
      groundGeo.computeVertexNormals();

      const attributeData = getAttributeData(instances, width);

      return [baseGeom, groundGeo, attributeData];
    }, [bW, bH, joints, width, instances]);

    useEffect(() => {
      gl.setPixelRatio(window.devicePixelRatio);
    }, [gl]);

    useFrame((state) => {
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = state.clock.elapsedTime / 4;
      }
    });

    return (
      <group {...props}>
        <mesh>
          <instancedBufferGeometry
            index={baseGeom.index}
            attributes-position={baseGeom.attributes.position}
            attributes-uv={baseGeom.attributes.uv}>
            <instancedBufferAttribute
              attach="attributes-offset"
              args={[new Float32Array(attributeData.offsets), 3]}
            />
            <instancedBufferAttribute
              attach="attributes-orientation"
              args={[new Float32Array(attributeData.orientations), 4]}
            />
            <instancedBufferAttribute
              attach="attributes-stretch"
              args={[new Float32Array(attributeData.stretches), 1]}
            />
            <instancedBufferAttribute
              attach="attributes-halfRootAngleSin"
              args={[new Float32Array(attributeData.halfRootAngleSin), 1]}
            />
            <instancedBufferAttribute
              attach="attributes-halfRootAngleCos"
              args={[new Float32Array(attributeData.halfRootAngleCos), 1]}
            />
          </instancedBufferGeometry>
          <grassMaterial
            ref={materialRef}
            map={texture}
            alphaMap={alphaMap}
            toneMapped={false}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}>
          <bufferGeometry {...groundGeo} />
          <meshStandardMaterial color="#001f00" />
        </mesh>
      </group>
    );
  }
);

function getAttributeData(instances: number, width: number) {
  const offsets = new Float32Array(instances * 3);
  const orientations = new Float32Array(instances * 4);
  const stretches = new Float32Array(instances);
  const halfRootAngleSin = new Float32Array(instances);
  const halfRootAngleCos = new Float32Array(instances);

  const quaternion = new THREE.Quaternion();
  const axisX = new THREE.Vector3(1, 0, 0);
  const axisZ = new THREE.Vector3(0, 0, 1);

  const gridSize = Math.sqrt(instances);
  const cellSize = width / gridSize;

  let i = 0,
    j = 0,
    k = 0;

  for (let ix = 0; ix < gridSize; ix++) {
    for (let iz = 0; iz < gridSize; iz++) {
      // Position
      const x = (ix + 0.5) * cellSize - width / 2;
      const z = (iz + 0.5) * cellSize - width / 2;
      offsets[i] = x;
      offsets[i + 1] = getYPosition(x, z);
      offsets[i + 2] = z;
      i += 3;

      // Orientation
      let angle = Math.PI - Math.random() * (Math.PI / 6); // Reduced angle variation
      halfRootAngleSin[k] = Math.sin(0.5 * angle);
      halfRootAngleCos[k] = Math.cos(0.5 * angle);

      quaternion
        .setFromAxisAngle(axisZ, angle)
        .multiply(
          new THREE.Quaternion().setFromAxisAngle(
            axisX,
            (Math.random() * Math.PI) / 8
          )
        );

      orientations[j] = quaternion.x;
      orientations[j + 1] = quaternion.y;
      orientations[j + 2] = quaternion.z;
      orientations[j + 3] = quaternion.w;
      j += 4;

      // Stretch
      stretches[k] = 0.8 + Math.random() * 0.2;
      k++;
    }
  }

  return {
    offsets,
    orientations,
    stretches,
    halfRootAngleCos,
    halfRootAngleSin,
  };
}

function getYPosition(x: number, z: number): number {
  return 0.05 * noise2D(x / 50, z / 50) + 0.05 * noise2D(x / 100, z / 100);
}

export default Grass;
