import {
  ICameraController,
  CameraSystemState,
  CameraCalcProps,
  CameraConfig,
} from './types';
import {
  ThirdPersonController,
  FirstPersonController,
  ChaseController,
  TopDownController,
  IsometricController,
  SideScrollController,
  FixedController
} from '../controllers';
import { BaseCameraEngine } from '../bridge/BaseCameraEngine';
import { CameraEngineConfig } from '../bridge/types';

export class CameraEngine extends BaseCameraEngine {
  private controllers: Map<string, ICameraController> = new Map();
  private state: CameraSystemState;
  
  constructor(config: CameraEngineConfig) {
    super(config);
    this.state = this.createInitialState();
    this.registerControllers();
  }
  
  private createInitialState(): CameraSystemState {
    return {
      config: {
        mode: 'thirdPerson',
        distance: { x: 15, y: 8, z: 15 },
        bounds: undefined,
        enableCollision: true,
        smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
        fov: 75,
        zoom: 1,
      },
      activeController: undefined,
    };
  }
  
  registerController(controller: ICameraController): void {
    this.controllers.set(controller.name, controller);
  }
  
  updateConfig(config: Partial<CameraConfig>): void {
    Object.assign(this.state.config, config);
    
    if (config.xDistance !== undefined || config.yDistance !== undefined || config.zDistance !== undefined) {
      this.state.config.distance = {
        x: config.xDistance || this.state.config.distance.x,
        y: config.yDistance || this.state.config.distance.y,
        z: config.zDistance || this.state.config.distance.z,
      };
    }
  }
  
  update(deltaTime: number): void {
    this.trackFrameMetrics(deltaTime);
  }

  calculate(props: CameraCalcProps): void {
    try {
      const controller = this.controllers.get(this.state.config.mode);
      if (!controller) return;
      this.state.activeController = controller;
      controller.update(props, this.state);
    } catch (error) {
      this.emitError('Camera calculation failed', error);
    }
  }
  
  getState(): CameraSystemState {
    return this.state;
  }
  

  
  private registerControllers(): void {
    this.registerController(new ThirdPersonController());
    this.registerController(new FirstPersonController());
    this.registerController(new ChaseController());
    this.registerController(new TopDownController());
    this.registerController(new IsometricController());
    this.registerController(new SideScrollController());
    this.registerController(new FixedController());
  }
} 