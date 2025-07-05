import { Ref, forwardRef } from 'react';
import * as THREE from 'three';
import { ModelRenderer } from './PartsGroupRef';
import { InnerGroupRefType } from './types';

export const InnerGroupRef = forwardRef((props: InnerGroupRefType, ref: Ref<THREE.Group>) => {
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
  return (
    <group receiveShadow castShadow ref={ref} userData={{ intangible: true }}>
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
      <ModelRenderer nodes={props.nodes} skeleton={props.skeleton!!} url={props.url || ''} color={props?.parts?.color} />
    </group>
  );
});
