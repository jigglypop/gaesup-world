import { propType } from '@gaesup/type';
import checkIsRotate from './checkIsRotate';
import checkMoving from './checkMoving';
import checkOnMovingObject from './checkOnMovingObject';
import checkOnTheGround from './checkOnTheGround';
import checkOnTheSlope from './checkOnTheSlope';

export default function check(prop: propType) {
  checkOnTheGround(prop);
  checkOnTheSlope(prop);
  checkOnMovingObject(prop);
  checkMoving(prop);
  checkIsRotate(prop);
}
