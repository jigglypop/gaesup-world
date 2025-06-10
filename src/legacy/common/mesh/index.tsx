import { meshType } from "@store/mesh/type";
import { useMemo } from "react";
import * as THREE from "three";
import { glassMaterial } from "./material/material";

export default function Mesh({
  mesh,
  node,
}: {
  mesh: meshType;
  node: THREE.Object3D<THREE.Object3DEventMap>;
}) {
  const meshMemo = useMemo(() => {
    if (node instanceof THREE.Mesh === false) return <></>;
    else if (mesh.material === "GLASS") {
      return (
        <mesh
          castShadow
          receiveShadow
          material={glassMaterial({
            color: mesh.color,
          })}
          geometry={node.geometry}
        />
      );
    } else {
      return (
        <mesh
          castShadow
          receiveShadow
          geometry={node.geometry}>
          <meshStandardMaterial color={mesh.color} />
        </mesh>
      );
    }
  }, [mesh.material, mesh.color]);
  return meshMemo;
}
