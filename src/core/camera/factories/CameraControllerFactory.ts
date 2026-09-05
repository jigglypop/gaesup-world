import {
  ThirdPersonController,
  FirstPersonController,
  ChaseController,
  TopDownController,
  IsometricController,
  SideScrollController,
  FixedController
} from '../controllers';
import { ICameraController } from '../core/types';

export type CameraControllerType = 
  | 'third-person'
  | 'first-person' 
  | 'chase'
  | 'top-down'
  | 'isometric'
  | 'side-scroll'
  | 'fixed'
  | string;

export type ControllerFactory = () => ICameraController;

export class CameraControllerFactory {
  private static factories = new Map<CameraControllerType, ControllerFactory>([
    ['third-person', () => new ThirdPersonController()],
    ['first-person', () => new FirstPersonController()],
    ['chase', () => new ChaseController()],
    ['top-down', () => new TopDownController()],
    ['isometric', () => new IsometricController()],
    ['side-scroll', () => new SideScrollController()],
    ['fixed', () => new FixedController()],
  ]);

  static register(type: CameraControllerType, factory: ControllerFactory): void {
    this.factories.set(type, factory);
  }

  static create(type: CameraControllerType): ICameraController {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Unknown camera controller type: ${type}`);
    }
    return factory();
  }

  static getAvailableTypes(): CameraControllerType[] {
    return Array.from(this.factories.keys());
  }

  static hasType(type: CameraControllerType): boolean {
    return this.factories.has(type);
  }
} 