import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../types';
import { CameraPropType } from '../types';
import { BaseCameraController } from './control/BaseCameraController';
import { ThirdPersonController } from './control/thirdPerson';
import { ChaseController } from './control/chase';

export enum CameraState {
  IDLE = 'IDLE',
  FOLLOWING = 'FOLLOWING',
  BLENDING = 'BLENDING',
  CUTSCENE = 'CUTSCENE',
  MANUAL = 'MANUAL',
}

export interface CameraTransition {
  from: CameraState;
  to: CameraState;
  duration: number;
  easing?: (t: number) => number;
  validate?: () => boolean;
}

export class CameraStateMachine {
  private currentState = CameraState.IDLE;
  private activeController: BaseCameraController | null = null;
  private controllers = new Map<string, BaseCameraController>();
  private transitions: CameraTransition[] = [];
  private isTransitioning = false;
  private transitionProgress = 0;
  private transitionDuration = 0;
  private sourcePosition = new THREE.Vector3();
  private targetPosition = new THREE.Vector3();

  constructor() {
    this.initializeControllers();
    this.setupDefaultTransitions();
  }

  private initializeControllers() {
    this.controllers.set('thirdPerson', new ThirdPersonController());
    this.controllers.set('chase', new ChaseController());
  }

  private setupDefaultTransitions() {
    this.addTransition({
      from: CameraState.IDLE,
      to: CameraState.FOLLOWING,
      duration: 1.0,
      easing: this.easeInOutCubic,
    });

    this.addTransition({
      from: CameraState.FOLLOWING,
      to: CameraState.IDLE,
      duration: 0.5,
      easing: this.easeInOutCubic,
    });

    this.addTransition({
      from: CameraState.FOLLOWING,
      to: CameraState.CUTSCENE,
      duration: 2.0,
      easing: this.easeInOutQuad,
    });
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  addTransition(transition: CameraTransition) {
    this.transitions.push(transition);
  }

  canTransition(from: CameraState, to: CameraState): boolean {
    if (this.isTransitioning) return false;

    const transition = this.transitions.find((t) => t.from === from && t.to === to);
    if (!transition) return false;

    return transition.validate ? transition.validate() : true;
  }

  transition(to: CameraState, controllerName?: string, options?: any): boolean {
    if (!this.canTransition(this.currentState, to)) {
      console.warn(`Invalid transition: ${this.currentState} -> ${to}`);
      return false;
    }

    const transition = this.transitions.find((t) => t.from === this.currentState && t.to === to);

    if (!transition) {
      console.warn(`No transition found: ${this.currentState} -> ${to}`);
      return false;
    }

    if (this.activeController) {
      this.sourcePosition.copy(this.activeController.tempVector);
    }

    this.currentState = to;

    if (controllerName && this.controllers.has(controllerName)) {
      this.activeController = this.controllers.get(controllerName)!;
    }

    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionDuration = transition.duration;

    return true;
  }

  update(prop: CameraPropType): void {
    if (this.isTransitioning) {
      this.updateTransition(prop);
    } else if (this.activeController) {
      this.activeController.update(prop);
    }
  }

  private updateTransition(prop: CameraPropType): void {
    const deltaTime = prop.state?.delta || 0.016;
    this.transitionProgress += deltaTime / this.transitionDuration;

    if (this.transitionProgress >= 1.0) {
      this.transitionProgress = 1.0;
      this.isTransitioning = false;
    }

    if (this.activeController && prop.state?.camera) {
      const targetPos = this.activeController.calculateTargetPosition(
        prop.worldContext.activeState,
        prop.state.camera,
        prop.cameraOption,
      );

      this.targetPosition.copy(targetPos);

      const t = this.easeInOutCubic(this.transitionProgress);
      prop.state.camera.position.lerpVectors(this.sourcePosition, this.targetPosition, t);

      const lookAtTarget = this.activeController.calculateLookAt(prop);
      if (lookAtTarget) {
        prop.state.camera.lookAt(lookAtTarget);
      }
    }
  }

  getCurrentState(): CameraState {
    return this.currentState;
  }

  getActiveController(): BaseCameraController | null {
    return this.activeController;
  }

  isInTransition(): boolean {
    return this.isTransitioning;
  }

  setController(name: string): boolean {
    if (this.controllers.has(name)) {
      this.activeController = this.controllers.get(name)!;
      return true;
    }
    return false;
  }

  dispose(): void {
    this.activeController = null;
    this.controllers.clear();
    this.transitions.length = 0;
  }
}
