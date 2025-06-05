import { calcType, PhysicsState } from '../type';
import damping from './damping';
import direction from './direction';
import impulse from './impulse';
import innerCalc from './innerCalc';
import landing from './landing';

export default function vehicleCalculation(calcProp: calcType, physicsState: PhysicsState) {
  if (!physicsState) return;

  const { rigidBodyRef } = calcProp;

  direction(physicsState);
  impulse(rigidBodyRef, physicsState);
  damping(rigidBodyRef, physicsState);
  landing(physicsState);
  innerCalc(rigidBodyRef, physicsState);
}
