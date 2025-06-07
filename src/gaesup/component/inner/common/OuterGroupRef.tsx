import { forwardRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { OuterGroupRefProps } from './types';

export const OuterGroupRef = forwardRef(
  ({ children }: OuterGroupRefProps, ref: MutableRefObject<THREE.Group>) => {
    return (
      <group ref={ref} userData={{ intangible: true }}>
        {children}
      </group>
    );
  },
);
