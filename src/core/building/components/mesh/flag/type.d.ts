import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

export type FlagMeshProps = ThreeElements["mesh"] & {
  geometry: THREE.BufferGeometry;
  pamplet_url?: string | null;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      flagMaterial: {
        ref: React.RefObject<THREE.Material>;
        map?: THREE.Texture | null;
        transmission?: number;
        roughness?: number;
        envMapIntensity?: number;
        side?: THREE.Side;
        transparent?: boolean;
      };
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        flagMaterial: {
          ref: React.RefObject<THREE.Material>;
          map?: THREE.Texture | null;
          transmission?: number;
          roughness?: number;
          envMapIntensity?: number;
          side?: THREE.Side;
          transparent?: boolean;
        };
      }
    }
  }
}
