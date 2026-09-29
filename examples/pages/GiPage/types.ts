import type { MeshStandardNodeMaterial } from 'three/webgpu';

export type Triple = readonly [number, number, number];

export type GiSceneItem = {
  min: Triple;
  max: Triple;
  color: string;
  emissive?: Triple;
};

export type GiControls = {
  giEnabled: boolean;
  giStrength: number;
  azimuth: number;
  elevation: number;
  roof: boolean;
};

export type GiSceneProps = {
  controls: GiControls;
};

export type GiBinderProps = {
  lit: MeshStandardNodeMaterial[];
  enabled: boolean;
  strength: number;
};
