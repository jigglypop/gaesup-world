import { Ref, forwardRef, useMemo } from "react";

import { ObjectMap, useGraph, useLoader } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import playPassiveActions from "../../../animation/passiveActions";
import { passiveCharacterInnerType } from "../type";

export const PassiveCharacterInnerGroupRef = forwardRef(
  ({ url, current }: passiveCharacterInnerType, ref: Ref<THREE.Group>) => {
    const { materials, scene, animations }: GLTF & ObjectMap = useLoader(
      GLTFLoader,
      url
    );
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const {
      nodes,
    }: {
      nodes: {
        [name: string]: THREE.Object3D;
      };
    } = useGraph(clone);

    const { animationRef } = playPassiveActions({
      current,
      animations,
    });

    return (
      <>
        {nodes && materials && (
          <group receiveShadow castShadow ref={ref}>
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
