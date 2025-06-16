import * as THREE from 'three';
import { ControllerConfig as CoreControllerConfig } from '../../../types/core';

export type ModeType = 'character' | 'vehicle' | 'airplane';
export type ControllerType = 'clicker' | 'keyboard' | 'gamepad';
export type ControlType = 'normal' | 'chase' | 'firstPerson' | 'thirdPerson' | 'topDown';

export interface ControllerOptionsType {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export interface ModeSlice {
  mode: {
    type: ModeType;
    controller: ControllerType;
    control: ControlType;
  };
  controllerConfig: CoreControllerConfig;
  controllerOptions: ControllerOptionsType;
  setMode: (
    mode: Partial<{ type: ModeType; controller: ControllerType; control: ControlType }>,
  ) => void;
  setControllerOptions: (options: Partial<ControllerOptionsType>) => void;
  currentControllerConfig: () => CoreControllerConfig[ModeType];
}

export interface ModeState {
  type: ModeType;
  controller: ControllerType;
  control: ControlType;
}
