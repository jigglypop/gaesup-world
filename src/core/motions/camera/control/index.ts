import { ChaseController } from './chase';
import { FirstPersonController } from './firstPerson';
import { FixedController } from './fixed';
import { IsometricController } from './isometric';
import { SideScrollController } from './sideScroll';
import { ThirdPersonController } from './thirdPerson';
import { TopDownController } from './topDown';

export const controllerMap = {
  firstPerson: new FirstPersonController(),
  thirdPerson: new ThirdPersonController(),
  chase: new ChaseController(),
  topDown: new TopDownController(),
  sideScroll: new SideScrollController(),
  fixed: new FixedController(),
  isometric: new IsometricController(),
};

export {
  ChaseController,
  FirstPersonController,
  FixedController,
  IsometricController,
  SideScrollController,
  ThirdPersonController,
  TopDownController,
};
