import { useContext } from "react";
import { GaesupWorldContext } from "../../stores/context/gaesupworld";

export default function VehicleGltf() {
  const { vehicleGltf: gltf } = useContext(GaesupWorldContext);
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
