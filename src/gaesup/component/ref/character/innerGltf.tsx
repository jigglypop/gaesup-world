import { Ref, forwardRef, useContext, useMemo } from "react";
import playActions from "../../../animation/actions";
import {
  controllerInnerType,
  groundRayType,
  refsType,
} from "../../../controller/type";
import { callbackType } from "../../../initial/callback/type";
import { GaesupWorldContext } from "../../../world/context";

import { useGraph } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";

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
    const {
      characterGltf: gltf,
      characterCollider,
      vehicleCollider,
      url,
    } = useContext(GaesupWorldContext);
    const { materials, scene } = gltf;

    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const {
      nodes,
    }: {
      nodes: {
        [name: string]: THREE.Object3D;
      };
    } = useGraph(clone);

    const { animationRef } = playActions({
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
                ref={animationRef}
              />
            )}
            {Object.keys(nodes).map((name: string, key: number) => {
              if (nodes[name].type === "SkinnedMesh") {
                return (
                  <skinnedMesh
                    castShadow
                    receiveShadow
                    material={materials[name]}
                    geometry={(nodes[name] as THREE.SkinnedMesh).geometry}
                    skeleton={(nodes[name] as THREE.SkinnedMesh).skeleton}
                    key={key}
                  />
                );
              } else if (nodes[name].type === "Mesh") {
                return (
                  <mesh
                    castShadow
                    receiveShadow
                    material={materials[name]}
                    geometry={(nodes[name] as THREE.Mesh).geometry}
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
