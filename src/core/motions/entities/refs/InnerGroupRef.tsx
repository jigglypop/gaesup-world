import { Ref, forwardRef } from 'react';

import * as THREE from 'three';

import { ModelRenderer } from './PartsGroupRef';
import { InnerGroupRefType } from './types';

/** Node names treated as tintable skin on character base models. */
export const CHARACTER_SKIN_NODE_NAMES = ['body', 'skin', 'Body', 'Skin'];

export const InnerGroupRef = forwardRef((props: InnerGroupRefType, ref: Ref<THREE.Group>) => {
  const modelYawOffset =
    typeof props.modelYawOffset === 'number'
      ? props.modelYawOffset
      : props.componentType === 'character'
        ? Math.PI
        : 0;
  const isCharacter = props.componentType === 'character';
  // Characters: never let an outfit part's color bleed onto the base body, and tint
  // only skin nodes so authored materials (eyes, face) survive.
  const baseColor = props.baseColor ?? (isCharacter ? undefined : props.parts?.[0]?.color);
  const colorNodeNames = isCharacter ? CHARACTER_SKIN_NODE_NAMES : undefined;
  return (
    <group receiveShadow castShadow ref={ref} userData={{ intangible: true }}>
      <group rotation-y={modelYawOffset}>
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
        <ModelRenderer
          nodes={props.nodes}
          skeleton={props.skeleton}
          url={props.url || ''}
          {...(baseColor ? { color: baseColor } : {})}
          {...(colorNodeNames ? { colorNodeNames } : {})}
          {...(props.excludeBaseNodes && props.excludeBaseNodes.length > 0 ? { excludeNodeNames: props.excludeBaseNodes } : {})}
        />
      </group>
    </group>
  );
});

InnerGroupRef.displayName = 'InnerGroupRef';