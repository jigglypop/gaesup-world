import { memo } from "react";
import * as THREE from "three";

// 메모이제이션된 서브 컴포넌트: Mesh
export const MemoizedMesh = memo<{ node: THREE.Mesh; color?: string | null }>(
  ({ node, color }) => {
    return (
      <mesh
        castShadow
        receiveShadow
        material={node.material}
        geometry={node.geometry}>
        <meshStandardMaterial
          color={color || (node.material as THREE.MeshStandardMaterial).color}
        />
      </mesh>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.node === nextProps.node && prevProps.color === nextProps.color
    );
  }
);
