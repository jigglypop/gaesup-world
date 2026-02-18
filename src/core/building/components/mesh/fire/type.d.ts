import * as THREE from 'three';

type FireMaterialJSX = {
  ref: React.RefObject<THREE.Material>;
  transparent?: boolean;
  depthWrite?: boolean;
  side?: THREE.Side;
  blending?: THREE.Blending;
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
