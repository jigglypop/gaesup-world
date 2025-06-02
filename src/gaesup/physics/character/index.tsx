import { calcType } from '../type';
import direction from './direction';
import gravity from './gravity';
import impulse from './impulse';
import innerCalc from './innerCalc';
import queue from './queue';

export default function characterCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  gravity(calcProp);
  innerCalc(calcProp);
  queue(calcProp);
}
