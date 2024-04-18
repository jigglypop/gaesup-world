import { MutableRefObject, Ref, forwardRef } from "react";
import * as THREE from "three";

export type InnerGroupRefType = {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
  nodes: {
    [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
  };
};

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
