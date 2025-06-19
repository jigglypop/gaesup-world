import * as THREE from 'three';
import { ControllerConfig as CoreControllerConfig } from '../../../types/core';
import { ModeState as CoreModeState } from '../../../types/core';

export type ModeType = 'character' | 'vehicle' | 'airplane';
export type ControllerType = 'clicker' | 'keyboard' | 'gamepad';
export type ControlType = 'normal' | 'chase' | 'firstPerson' | 'thirdPerson' | 'topDown';

export interface ControllerOptionsType {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export type ModeState = CoreModeState;

export interface ModeSlice {
  mode: ModeState;
  controllerOptions: ControllerOptionsType;
  setMode: (update: Partial<ModeState>) => void;
  setControllerOptions: (update: Partial<ControllerOptionsType>) => void;
}
