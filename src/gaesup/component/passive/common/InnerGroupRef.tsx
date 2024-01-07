import { Ref, Suspense, forwardRef, useMemo } from "react";

import { useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playPassiveActions from "../../../animation/passiveActions";

export type InnerGroupRefType = {
  currentAnimation: string;
  url: string;
  rotation?: THREE.Euler;
};

export const InnerGroupRef = forwardRef(
  (
    { currentAnimation, url, rotation }: InnerGroupRefType,
    ref: Ref<THREE.Group>
  ) => {
    const { scene, animations } = useGLTF(url);
    const { animationRef } = playPassiveActions({
      current: currentAnimation,
      animations,
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
                  userData={{ intangible: true }}
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
                  userData={{ intangible: true }}
                />
              );
            }
          })}
        </group>
      </Suspense>
    );
  }
);
