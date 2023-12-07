import { GroupProps } from "@react-three/fiber";
import { useContext } from "react";
import playActions from "../animation/actions";
import initCallback from "../initial/initCallback";
import { GaesupWorldContext, gaesupWorldPropType } from "../stores/context";
import { callbackType, groundRayType, propType, refsType } from "../type";

export type characterGltfType = {
  prop: propType;
  character?: GroupProps;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
  isRider?: boolean;
};

export default function CharacterGltf({
  prop,
  character,
  groundRay,
  refs,
  callbacks,
  isRider,
}: characterGltfType) {
  const { characterGltf: gltf } =
    useContext<gaesupWorldPropType>(GaesupWorldContext);
  const { materials, nodes, animations } = gltf;
  const { characterCollider, vehicleCollider } = useContext(GaesupWorldContext);

  initCallback({
    prop,
    callbacks,
    animations,
  });

  playActions({
    outerGroupRef: refs.outerGroupRef,
    groundRay: groundRay,
    isRider,
  });

  return (
    <group
      receiveShadow
      castShadow
      {...character}
      position={[
        0,
        isRider ? vehicleCollider.vehicleSizeY / 2 : -characterCollider.height,
        0,
      ]}
    >
      {nodes &&
        Object.values(nodes).find((node) => node.type === "Object3D") && (
          <primitive
            object={Object.values(nodes).find(
              (node) => node.type === "Object3D"
            )}
            visible={false}
            receiveShadow
            castShadow
          />
        )}
      {nodes &&
        Object.keys(nodes).map((name: string, key: number) => {
          if (nodes[name].type === "SkinnedMesh") {
            return (
              <skinnedMesh
                castShadow
                receiveShadow
                material={materials[name]}
                geometry={nodes[name].geometry}
                skeleton={(nodes[name] as THREE.SkinnedMesh).skeleton}
                key={key}
              />
            );
          }
        })}
    </group>
  );
}
