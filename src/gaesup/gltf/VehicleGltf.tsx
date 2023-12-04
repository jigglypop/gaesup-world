import { GLTFResult } from "@gaesup/type";

export type VehicleGltfType = {
  gltf: GLTFResult;
};

export default function VehicleGltf({ gltf }: VehicleGltfType) {
  const { materials, nodes } = gltf;
  return (
    <>
      {nodes && materials && (
        <group receiveShadow castShadow rotation={[0, Math.PI, 0]}>
          {Object.keys(nodes).map((name: string, key: number) => {
            if (
              nodes[name].type === "Mesh" ||
              nodes[name].type === "SkinnedMesh"
            ) {
              return (
                <mesh
                  castShadow
                  receiveShadow
                  material={materials[name]}
                  geometry={nodes[name].geometry}
                  key={key}
                />
              );
            }
          })}
        </group>
      )}
    </>
  );
}
