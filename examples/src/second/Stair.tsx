import { Gltf, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { GaeSupProps } from "../../../src";

const gltf_url = "./stair.glb";
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ffffff",
  transmission: 1,
  roughness: 0,
  envMapIntensity: 1,
});

export default function Stair() {
  const gltf = useGLTF(gltf_url);
  const { scene } = gltf;
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  return (
    <GaeSupProps>
      <RigidBody
        type="kinematicPosition"
        colliders="trimesh"
        position={[0, 0.3, 0]}
      >
        <Gltf src={gltf_url} />
        {/* {Object.keys(nodes).map((name: string, key: number) => {
          const node = nodes[name];
          if (node instanceof THREE.SkinnedMesh) {
            return (
              <skinnedMesh
                castShadow
                receiveShadow
                material={node.material}
                geometry={node.geometry}
                skeleton={node.skeleton}
                key={key}
              />
            );
          } else if (node instanceof THREE.Mesh) {
            const material = node.material;
            return (
              <mesh
                castShadow
                receiveShadow
                material={material}
                geometry={node.geometry}
                key={key}
              ></mesh>
            );
          }
        })} */}
      </RigidBody>
    </GaeSupProps>
  );
}
