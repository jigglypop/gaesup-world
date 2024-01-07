import { Ref, Suspense, forwardRef, useContext, useMemo } from "react";
import { controllerInnerType } from "../../../controller/type";

import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playPassiveActions from "../../../animation/passiveActions";
import { GaesupWorldContext } from "../../../world/context";
import { GLTFResult } from "../../type";

export type InnerGroupRefType = {
  props: controllerInnerType;
  animationRef?: Ref<THREE.Object3D<THREE.Object3DEventMap>>;
  gltf: GLTFResult;
};

export const InnerGroupRef = forwardRef(
  ({ props, animationRef, gltf }: InnerGroupRefType, ref: Ref<THREE.Group>) => {
    const { characterGltf, rideable } = useContext(GaesupWorldContext);
    const { scene } = gltf;
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find(
      (node) => node.type === "Object3D"
    );

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
      <Suspense fallback={null}>
        <group receiveShadow castShadow {...props.groupProps} ref={ref}>
          {rideable.isRiderOn && characterAnimationRef && (
            <group position={[0, 0.5, 0]}>
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
          {objectNode && animationRef && (
            <primitive
              object={objectNode}
              visible={false}
              receiveShadow
              castShadow
              ref={animationRef}
            />
          )}
          {Object.keys(nodes).map((name: string, key: number) => {
            const node = nodes[name];
            if (node instanceof THREE.SkinnedMesh) {
              return (
                <skinnedMesh
                  castShadow
                  receiveShadow
                  material={node.material}
                  geometry={node.geometry}
                  skeleton={node.skeleton}
                  key={key}
                />
              );
            } else if (node instanceof THREE.Mesh) {
              return (
                <mesh
                  castShadow
                  receiveShadow
                  material={node.material}
                  geometry={node.geometry}
                  key={key}
                />
              );
            }
          })}
        </group>
      </Suspense>
    );
  }
);
