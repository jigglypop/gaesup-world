import { Ref, forwardRef } from "react";
import * as THREE from "three";
import { InnerGroupRefType } from "./type";

export const InnerGroupRef = forwardRef(
  (
    { children, objectNode, animationRef, nodes }: InnerGroupRefType,
    ref: Ref<THREE.Group>
  ) => {
    return (
      <group receiveShadow castShadow ref={ref} userData={{ intangible: true }}>
        {children}
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
    );
  }
);
