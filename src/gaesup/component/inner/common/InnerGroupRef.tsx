import { useGraph } from "@react-three/fiber";
import { Ref, Suspense, forwardRef, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

import { useAnimations, useGLTF } from "@react-three/drei";
import playActions from "../../../animation/actions";

export type InnerGroupRefType = {
  children?: React.ReactNode;
  type: "character" | "vehicle" | "airplane";
  currentAnimation: string;
  url: string;
  rotation?: THREE.Euler;
};

export const InnerGroupRef = forwardRef(
  (
    { children, type, currentAnimation, url, rotation }: InnerGroupRefType,
    ref: Ref<THREE.Group>
  ) => {
    const { scene, animations } = useGLTF(url);
    const animationResult = useAnimations(animations);
    const { animationRef } = playActions({
      type,
      animationResult,
      currentAnimation,
    });
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find(
      (node) => node.type === "Object3D"
    );

    return (
      <Suspense fallback={null}>
        <group
          receiveShadow
          castShadow
          ref={ref}
          rotation={rotation}
          userData={{ intangible: true }}
        >
          {children}
          {/* {mode.type !== "character" && states.isRiderOn && <RiderGroup />} */}
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
