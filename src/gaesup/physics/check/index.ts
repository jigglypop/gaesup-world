import { ActiveStateType } from '../../types';
import { PhysicsCalcProps } from '../types';
import ground from './ground';
import moving from './moving';
import riding from './riding';
import rotate from './rotate';

export default function check(
  calcProp: PhysicsCalcProps,
  currentActiveState: ActiveStateType,
  instanceId: string = 'default',
) {
  ground(calcProp);
  moving(calcProp);
  rotate(calcProp, currentActiveState);
  riding(calcProp, instanceId);
}
