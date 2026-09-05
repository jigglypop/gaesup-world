import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

import type { PlacedObject } from '../../../types';

export type FlagMaterialInstance = THREE.Material & { time: number; windStrength: number };
export type FlagSurfaceMaterialProps = {
  materialRef: React.RefObject<FlagMaterialInstance>;
  texture: THREE.Texture;
  windStrength: number;
  instanced?: boolean;
};

export type FlagMeshProps = ThreeElements['mesh'] & {
  geometry: THREE.BufferGeometry;
  pamplet_url?: string | null;
  windStrength?: number;
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  center?: [number, number, number];
};

export type FlagBatchProps = {
  flags: PlacedObject[];
};

type FlagMaterialJSX = {
  ref: React.RefObject<THREE.Material>;
  map?: THREE.Texture | null;
  transmission?: number;
  windStrength?: number;
  envMapIntensity?: number;
  side?: THREE.Side;
  transparent?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      flagMaterial: FlagMaterialJSX;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        flagMaterial: FlagMaterialJSX;
      }
    }
  }
}
