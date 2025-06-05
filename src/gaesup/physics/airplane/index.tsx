import { calcType, PhysicsState } from '../type';
import damping from './damping';
import direction from './direction';
import gravity from './gravity';
import impulse from './impulse';
import innerCalc from './innerCalc';
import landing from './landing';

export default function airplaneCalculation(calcProp: calcType, physicsState: PhysicsState) {
  if (!physicsState) return;

  const { rigidBodyRef, innerGroupRef, matchSizes } = calcProp;

  direction(physicsState, innerGroupRef, matchSizes);
  impulse(rigidBodyRef, physicsState);
  damping(rigidBodyRef, physicsState);
  gravity(rigidBodyRef, physicsState);
  landing(physicsState);
  innerCalc(rigidBodyRef, physicsState);
}
