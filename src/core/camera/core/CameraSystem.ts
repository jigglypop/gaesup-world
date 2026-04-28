import * as THREE from 'three';

import { ManageRuntime } from '@/core/boilerplate/decorators';

import {
  ICameraController,
  CameraSystemState,
  CameraCalcProps,
  CameraState,
  CameraTransition,
} from './types';
import { BaseCameraSystem, cloneCameraSystemConfig } from '../bridge/BaseCameraSystem';
import { CameraSystemConfig } from '../bridge/types';
import {
  ThirdPersonController,
  FirstPersonController,
  ChaseController,
  TopDownController,
  IsometricController,
  SideScrollController,
  FixedController
} from '../controllers';

@ManageRuntime({ autoStart: false })
export class CameraSystem extends BaseCameraSystem {
  private controllers: Map<string, ICameraController> = new Map();
  private state: CameraSystemState;
  private cameraStates: Map<string, CameraState> = new Map();
  private currentCameraStateName: string = 'default';
  private cameraTransitions: CameraTransition[] = [];
  
  constructor(config: CameraSystemConfig) {
    super(config);
    this.state = this.createInitialState(config);
    this.registerControllers();
    this.initializeCameraStates();
  }
  
  private createInitialState(config: CameraSystemConfig): CameraSystemState {
    return {
      config: cloneCameraSystemConfig(config),
      lastUpdate: Date.now(),
    };
  }
  
  private initializeCameraStates(): void {
    const defaultState: CameraState = {
      name: 'default',
      type: 'thirdPerson',
      position: new THREE.Vector3(0, 5, 10),
      rotation: new THREE.Euler(0, 0, 0),
      fov: 75,
      config: {
        distance: { x: 15, y: 8, z: 15 },
        height: 5,
        followSpeed: 0.1,
        rotationSpeed: 0.1,
      },
      priority: 0,
      tags: [],
    };
    this.cameraStates.set('default', defaultState);
  }
  
  registerController(controller: ICameraController): void {
    this.controllers.set(controller.name, controller);
  }
  
  override updateConfig(config: Partial<CameraSystemConfig>): void {
    super.updateConfig(config);
    this.state.config = this.getConfig();
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
      this.emitError(
        'Camera calculation failed',
        error instanceof Error ? error.message : undefined,
      );
    }
  }
  
  getCameraState(name: string): CameraState | undefined {
    return this.cameraStates.get(name);
  }
  
  getCurrentCameraState(): CameraState | undefined {
    return this.cameraStates.get(this.currentCameraStateName);
  }
  
  addCameraState(name: string, state: CameraState): void {
    this.cameraStates.set(name, state);
  }
  
  setCameraTransitions(transitions: CameraTransition[]): void {
    this.cameraTransitions = transitions;
    void this.cameraTransitions.length;
  }
  
  switchCameraState(name: string): void {
    if (this.cameraStates.has(name)) {
      this.currentCameraStateName = name;
      const newState = this.cameraStates.get(name)!;
      const nextConfig: Partial<CameraSystemConfig> = {
        mode: newState.type,
        fov: newState.fov,
      };
      if (newState.config.distance) {
        nextConfig.distance = newState.config.distance;
      }
      this.updateConfig(nextConfig);
    }
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
