import { Ref, forwardRef, useContext } from "react";
import playActions from "../../animation/actions";
import {
  controllerInnerType,
  groundRayType,
  refsType,
} from "../../controller/type";
import initCallback from "../../initial/callback";
import { callbackType } from "../../initial/callback/type";
import { GaesupWorldContext } from "../../world/context";

export type characterGltfType = {
  props: controllerInnerType;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
};

export const InnerGroupRef = forwardRef((_, ref: Ref<THREE.Group>) => {
  return <group ref={ref} visible={false} />;
});

export const CharacterInnerGroupRef = forwardRef(
  ({ props, groundRay, refs }: characterGltfType, ref: Ref<THREE.Group>) => {
    const { characterGltf: gltf } = useContext(GaesupWorldContext);
    const { materials, nodes } = gltf;
    const { characterCollider, vehicleCollider } =
      useContext(GaesupWorldContext);

    initCallback({
      props,
    });

    playActions({
      outerGroupRef: refs.outerGroupRef,
      groundRay: groundRay,
      isRider: props.isRider,
    });

    return (
      <>
        {nodes && materials && (
          <group
            receiveShadow
            castShadow
            {...props.groupProps}
            position={[
              0,
              props.isRider
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
