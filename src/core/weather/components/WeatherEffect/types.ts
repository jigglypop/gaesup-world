import type { BufferGeometry, Object3D, PointsMaterial } from 'three';

import type { WeatherMotionOptions } from '../../../rendering/tsl/weather';

export type NodeWeatherProps = WeatherMotionOptions & {
  geometry: BufferGeometry;
  material: PointsMaterial;
  onObject: (object: Object3D | null) => void;
};
