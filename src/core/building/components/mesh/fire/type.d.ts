import * as THREE from 'three';

type FireMaterialJSX = {
  ref?: React.RefObject<THREE.Material | null>;
  transparent?: boolean;
  depthWrite?: boolean;
  side?: THREE.Side;
  blending?: THREE.Blending;
  time?: number;
  intensity?: number;
  seed?: number;
  lean?: number;
  flare?: number;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      fireMaterial: FireMaterialJSX;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        fireMaterial: FireMaterialJSX;
      }
    }
  }
}
