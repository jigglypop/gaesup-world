export { default as Camera } from './Camera';
export { CameraController } from './CameraController';
export { FirstPersonController } from './firstPerson';
export { ThirdPersonController } from './thirdPerson';
export { ChaseController } from './chase';
export { TopDownController } from './topDown';
export { IsometricController } from './isometric';
export { SideScrollController } from './sideScroll';
export { FixedController } from './fixed';

import { CameraController } from './CameraController';
import { FirstPersonController } from './firstPerson';
import { ThirdPersonController } from './thirdPerson';
import { ChaseController } from './chase';
import { TopDownController } from './topDown';
import { IsometricController } from './isometric';
import { SideScrollController } from './sideScroll';
import { FixedController } from './fixed';

export const controllerMap: Record<string, CameraController> = {
  firstPerson: new FirstPersonController(),
  thirdPerson: new ThirdPersonController(),
  chase: new ChaseController(),
  topDown: new TopDownController(),
  isometric: new IsometricController(),
  sideScroll: new SideScrollController(),
  fixed: new FixedController(),
  normal: new ThirdPersonController(),
}; 