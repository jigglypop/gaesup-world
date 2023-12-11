import { GroupProps } from "@react-three/fiber";
import { Ref, forwardRef, useContext } from "react";
import playActions from "../../animation/actions";
import { groundRayType, propType, refsType } from "../../controller/type";
import initCallback from "../../initial/callback";
import { callbackType } from "../../initial/callback/type";
import { GaesupWorldContext } from "../../stores/context/gaesupworld";

export type characterGltfType = {
  prop: propType;
  groupProps?: GroupProps;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
  isRider?: boolean;
};

export const InnerGroupRef = forwardRef((_, ref: Ref<THREE.Group>) => {
  return <group ref={ref} visible={false} />;
});

export const CharacterInnerGroupRef = forwardRef(
  (
    {
      prop,
      groupProps,
      groundRay,
      refs,
      callbacks,
      isRider,
    }: characterGltfType,
    ref: Ref<THREE.Group>
  ) => {
    const { characterGltf: gltf } = useContext(GaesupWorldContext);
    const { materials, nodes } = gltf;
    const { characterCollider, vehicleCollider } =
      useContext(GaesupWorldContext);

    initCallback({
      prop,
      callbacks,
      outerGroupRef: refs.outerGroupRef,
    });

    playActions({
      outerGroupRef: refs.outerGroupRef,
      groundRay: groundRay,
      isRider,
    });

    return (
      <>
        {nodes && materials && (
          <group
            receiveShadow
            castShadow
            {...groupProps}
            position={[
              0,
              isRider
                ? vehicleCollider.vehicleSizeY / 2
                : -characterCollider.height,
              0,
            ]}
            ref={ref}
          >
            {Object.values(nodes).find((node) => node.type === "Object3D") && (
              <primitive
                object={Object.values(nodes).find(
                  (node) => node.type === "Object3D"
                )}
                visible={false}
                receiveShadow
                castShadow
              />
            )}
            {Object.keys(nodes).map((name: string, key: number) => {
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
        )}
      </>
    );
  }
);
