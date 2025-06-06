import { Ref, forwardRef, useEffect } from 'react';
import * as THREE from 'three';
import RiderRef from '../rider';
import { InnerGroupRefType } from './type';

export const InnerGroupRef = forwardRef((props: InnerGroupRefType, ref: Ref<THREE.Group>) => {
  useEffect(() => {
    return () => {
      if (props.objectNode) {
        props.objectNode.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m: THREE.Material) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [props.objectNode]);

  return (
    <group receiveShadow castShadow ref={ref} userData={{ intangible: true }}>
      {props.isRiderOn && props.enableRiding && props.isActive && props.ridingUrl && (
        <RiderRef url={props.ridingUrl} offset={props.offset} />
      )}

      {props.children}
      {props.objectNode && props.animationRef && (
        <primitive
          object={props.objectNode}
          visible={false}
          receiveShadow
          castShadow
          ref={props.animationRef}
        />
      )}

      {Object.keys(props.nodes).map((name: string, key: number) => {
        const node = props.nodes[name];
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
});
