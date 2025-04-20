import { forwardRef, MutableRefObject, ReactNode } from "react";
import * as THREE from "three";

export const OuterGroupRef = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: MutableRefObject<THREE.Group>
  ) => {
    return (
      <group ref={ref} userData={{ intangible: true }}>
        {children}
      </group>
    );
  }
);
