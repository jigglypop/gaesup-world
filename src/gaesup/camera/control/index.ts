import { ChaseController } from './chase';
import { FirstPersonController } from './firstPerson';
import { FixedController } from './fixed';
import { IsometricController } from './isometric';
import { ShoulderController } from './shoulder';
import { SideScrollController } from './sideScroll';
import { ThirdPersonController } from './thirdPerson';
import { TopDownController } from './topDown';

const thirdPerson = new ThirdPersonController();
const chase = new ChaseController();
const firstPerson = new FirstPersonController();
const fixed = new FixedController();
const isometric = new IsometricController();
const shoulder = new ShoulderController();
const sideScroll = new SideScrollController();
const topDown = new TopDownController();

export const controllerMap = {
  firstPerson: firstPerson.update.bind(firstPerson),
  thirdPerson: thirdPerson.update.bind(thirdPerson),
  normal: thirdPerson.update.bind(thirdPerson),
  chase: chase.update.bind(chase),
  topDown: topDown.update.bind(topDown),
  sideScroll: sideScroll.update.bind(sideScroll),
  shoulder: shoulder.update.bind(shoulder),
  fixed: fixed.update.bind(fixed),
  isometric: isometric.update.bind(isometric),
};

export {
  ChaseController,
  FirstPersonController,
  FixedController,
  IsometricController,
  ShoulderController,
  SideScrollController,
  ThirdPersonController,
  TopDownController,
};
