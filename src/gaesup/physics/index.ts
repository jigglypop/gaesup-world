import { propType } from '@gaesup/type';
import accelaration from './accelaration';
import airplaneDirection from './airplane/airplaneDirection';
import airplaneImpluse from './airplane/airplaneImpluse';

import characterDirection from './character/characterDirection';
import impulse from './character/impulse';
import jump from './jump';
import stabilizing from './stabilizing';
import turn from './turn';
import vehicleDirection from './vehicle/vehicleDirection';
import vehicleImpulse from './vehicle/vehicleImpulse';

export default function calculation(prop: propType) {
  turn(prop);
  stabilizing(prop);
  accelaration(prop);
  jump(prop);
  if (prop.options.mode === 'normal') {
    impulse(prop);
    characterDirection(prop);
  } else if (prop.options.mode === 'airplane') {
    airplaneImpluse(prop);
    airplaneDirection(prop);
  } else if (prop.options.mode === 'vehicle') {
    vehicleImpulse(prop);
    vehicleDirection(prop);
  }
}
