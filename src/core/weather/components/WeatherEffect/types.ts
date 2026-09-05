import type { BufferGeometry, Object3D, PointsMaterial } from 'three';

export type NodeWeatherProps = {
  geometry: BufferGeometry;
  material: PointsMaterial;
  onObject: (object: Object3D | null) => void;
};
