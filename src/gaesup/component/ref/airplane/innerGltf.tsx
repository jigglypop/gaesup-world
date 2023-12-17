import { Ref, forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";

export const AirplaneInnerGroupRef = forwardRef((_, ref: Ref<THREE.Group>) => {
  const { airplaneGltf: gltf } = useContext(GaesupWorldContext);
  const { materials, nodes } = gltf;
  return (
    <>
      {nodes && materials && (
        <group receiveShadow castShadow ref={ref}>
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
});
