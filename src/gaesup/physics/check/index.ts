import { ActiveStateType } from '../../types';
import { PhysicsCalcProps } from '../types';
import ground from './ground';
import moving from './moving';
import riding from './riding';
import rotate from './rotate';

type StateChecker = (calcProp: PhysicsCalcProps, ...args: any[]) => void;

class PhysicsStateChecker {
  private checkers = new Map<string, { fn: StateChecker; args: any[] }>();

  register(name: string, checker: StateChecker, ...args: any[]) {
    this.checkers.set(name, { fn: checker, args });
  }

  checkAll(calcProp: PhysicsCalcProps) {
    for (const [name, { fn, args }] of this.checkers) {
      fn(calcProp, ...args);
    }
  }
}

const stateChecker = new PhysicsStateChecker();
stateChecker.register('ground', ground);
stateChecker.register('moving', moving);

export default function check(
  calcProp: PhysicsCalcProps,
  currentActiveState: ActiveStateType,
  instanceId: string = 'default',
) {
  stateChecker.register('rotate', rotate, currentActiveState);
  stateChecker.register('riding', riding, instanceId);
  stateChecker.checkAll(calcProp);
}
