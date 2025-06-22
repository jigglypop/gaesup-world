export { BaseController } from './BaseController';
export { ChaseController } from './ChaseController';
export { ThirdPersonController } from './ThirdPersonController';
export { FirstPersonController } from './FirstPersonController';

import { CameraController } from '../types';
import { ChaseController } from './ChaseController';
import { ThirdPersonController } from './ThirdPersonController';
import { FirstPersonController } from './FirstPersonController';

export const controllerMap: Record<string, CameraController> = {
  chase: new ChaseController(),
  thirdPerson: new ThirdPersonController(),
  firstPerson: new FirstPersonController(),
  normal: new ThirdPersonController(),
}; 