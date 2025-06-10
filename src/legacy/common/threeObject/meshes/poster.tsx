import { useTexture } from "@react-three/drei";
import { memo } from "react";
import * as THREE from "three";

export default function PosterMesh({
  node,
  poster_url,
}: {
  node: THREE.Mesh;
  poster_url: string | null | undefined;
}) {
  const material = node.material;
  const texture = useTexture(poster_url || `./pamplet/aggjack.webp`);
  if (!texture) return null;
  texture.flipY = false;
  return (
    <mesh
      castShadow
      receiveShadow
      material={material}
      geometry={node.geometry}>
      <meshPhysicalMaterial
        map={texture}
        roughness={0.1}
        emissive={new THREE.Color(0xffffff)}
        emissiveMap={texture}
        emissiveIntensity={0.2}
        envMapIntensity={1}
      />
    </mesh>
  );
}
export const MemoizedPosterMesh = memo<{
  node: THREE.Mesh;
  poster_url?: string | null;
}>(
  ({ node, poster_url }) => {
    return (
      <PosterMesh
        node={node}
        poster_url={poster_url}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.node === nextProps.node &&
      prevProps.poster_url === nextProps.poster_url
    );
  }
);
