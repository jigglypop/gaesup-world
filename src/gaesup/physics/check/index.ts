import { ActiveStateType } from '../../types';
import { PhysicsCalcProps } from '../types';
import ground from './ground';
import moving from './moving';
import riding from './riding';
import rotate from './rotate';

type StateChecker = (calcProp: PhysicsCalcProps, ...args: any[]) => void;

class PhysicsStateChecker {
  private checkers = new Map<string, { fn: StateChecker; args: any[] }>();
  private rotateArgs: any[] = [];
  private ridingArgs: any[] = [];

  register(name: string, checker: StateChecker, ...args: any[]) {
    this.checkers.set(name, { fn: checker, args });
  }

  updateRotateArgs(currentActiveState: ActiveStateType) {
    this.rotateArgs = [currentActiveState];
  }

  updateRidingArgs(instanceId: string) {
    this.ridingArgs = [instanceId];
  }

  checkAll(calcProp: PhysicsCalcProps) {
    for (const [name, { fn, args }] of this.checkers) {
      if (name === 'rotate') {
        fn(calcProp, ...this.rotateArgs);
      } else if (name === 'riding') {
        fn(calcProp, ...this.ridingArgs);
      } else {
        fn(calcProp, ...args);
      }
    }
  }
}

const stateChecker = new PhysicsStateChecker();
stateChecker.register('ground', ground);
stateChecker.register('moving', moving);
stateChecker.register('rotate', rotate);
stateChecker.register('riding', riding);

export default function check(
  calcProp: PhysicsCalcProps,
  currentActiveState: ActiveStateType,
  instanceId: string = 'default',
) {
  stateChecker.updateRotateArgs(currentActiveState);
  stateChecker.updateRidingArgs(instanceId);
  stateChecker.checkAll(calcProp);
}
