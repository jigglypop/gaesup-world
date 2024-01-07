import { Ref, useContext, useMemo } from "react";
import { controllerInnerType } from "../../../controller/type";

import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playPassiveActions from "../../../animation/passiveActions";
import { GaesupWorldContext } from "../../../world/context";

export type RiderGroupRefType = {
  props: controllerInnerType;
};

export const RiderGroup = (
  { props }: RiderGroupRefType,
  ref: Ref<THREE.Group>
) => {
  const { characterGltf, states, characterCollider } =
    useContext(GaesupWorldContext);

  const { animationRef: characterAnimationRef } = playPassiveActions({
    current: "ride",
    animations: characterGltf.animations,
  });
  const { scene: characterScene } = characterGltf;
  const characterClone = useMemo(
    () => SkeletonUtils.clone(characterScene),
    [characterScene]
  );
  const { nodes: characterNodes } = useGraph(characterClone);
  const characterObjectNode = Object.values(characterNodes).find(
    (node) => node.type === "Object3D"
  );
  return (
    <>
      {characterAnimationRef && (
        <group
          position={[
            characterCollider?.riderOffsetX || 0,
            characterCollider?.riderOffsetY || 0,
            characterCollider?.riderOffsetZ || 0,
          ]}
        >
          {characterObjectNode && (
            <primitive
              object={characterObjectNode}
              visible={false}
              receiveShadow
              castShadow
              ref={characterAnimationRef}
            />
          )}
          {Object.keys(characterNodes).map((name: string, key: number) => {
            const characterNode = characterNodes[name];
            if (characterNode instanceof THREE.SkinnedMesh) {
              return (
                <skinnedMesh
                  castShadow
                  receiveShadow
                  material={characterNode.material}
                  geometry={characterNode.geometry}
                  skeleton={characterNode.skeleton}
                  key={key}
                />
              );
            } else if (characterNode instanceof THREE.Mesh) {
              return (
                <mesh
                  castShadow
                  receiveShadow
                  material={characterNode.material}
                  geometry={characterNode.geometry}
                  key={key}
                />
              );
            }
          })}
        </group>
      )}
    </>
  );
};
