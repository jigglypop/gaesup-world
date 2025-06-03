import { calcType } from '../type';
import ground from './ground';
import moving from './moving';
import riding from './riding';
import rotate from './rotate';

export default function check(
  calcProp: calcType,
  currentActiveState: any,
  instanceId: string = 'default',
) {
  ground(calcProp);
  moving(calcProp);
  rotate(calcProp, currentActiveState);
  riding(calcProp, instanceId);
}
