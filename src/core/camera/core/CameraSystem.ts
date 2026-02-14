import * as THREE from 'three';

import { ManageRuntime } from '@/core/boilerplate/decorators';

import {
  ICameraController,
  CameraSystemState,
  CameraCalcProps,
  CameraConfig,
  CameraState,
  CameraTransition,
} from './types';
import { BaseCameraSystem } from '../bridge/BaseCameraSystem';
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
    this.state = this.createInitialState();
    this.registerControllers();
    this.initializeCameraStates();
  }
  
  private createInitialState(): CameraSystemState {
    return {
      config: {
        mode: 'thirdPerson',
        distance: { x: 15, y: 8, z: 15 },
        enableCollision: true,
        smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
        fov: 75,
        zoom: 1,
      },
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
  
  override updateConfig(config: Partial<CameraConfig>): void {
    Object.assign(this.state.config, config);
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
      this.state.config.mode = newState.type;
      if (newState.config.distance) {
        this.state.config.distance = newState.config.distance;
      }
      this.state.config.fov = newState.fov;
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