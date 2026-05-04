import type { ReactNode } from 'react';

import type { CameraOptionType, CameraType } from '../../../camera';
import type { GaesupRuntime } from '../../../runtime';
import type { ModeState } from '../../../stores/slices/mode';
import type { UrlsState } from '../../../stores/slices/urls/types';

export type WorldAssetUrls = Partial<UrlsState> & Partial<{
  character: string;
  vehicle: string;
  airplane: string;
  terrain: string;
  skybox: string;
}>;

export type WorldCameraOption = Pick<CameraOptionType,
  | 'distance'
  | 'xDistance'
  | 'yDistance'
  | 'zDistance'
  | 'fov'
  | 'zoom'
  | 'enableZoom'
  | 'minZoom'
  | 'maxZoom'
  | 'zoomSpeed'
  | 'enableCollision'
> & {
  type: CameraType;
  height?: number;
  smoothness?: number;
};

export type WorldData = {
  id: string;
  size: {
    width: number;
    height: number;
    depth: number;
  };
  objects: {
    total: number;
    active: number;
    passive: number;
  };
  physics: {
    enabled: boolean;
    gravity: [number, number, number];
  };
  debug: boolean;
  environment: {
    fogEnabled: boolean;
    lightsCount: number;
  };
};

export interface WorldContainerProps {
  children?: ReactNode;
  runtime?: GaesupRuntime;
  runtimeRevision?: number;
  urls?: WorldAssetUrls;
  cameraOption?: WorldCameraOption;
  mode?: Partial<ModeState> & Pick<ModeState, 'type'>;
  debug?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showDebugInfo?: boolean;
  enablePhysics?: boolean;
  gravity?: [number, number, number];
  worldSize?: {
    width: number;
    height: number;
    depth: number;
  };
  environment?: {
    fogColor?: string;
    fogNear?: number;
    fogFar?: number;
    skyColor?: string;
    groundColor?: string;
    ambientLight?: {
      color: string;
      intensity: number;
    };
    directionalLight?: {
      color: string;
      intensity: number;
      position: [number, number, number];
      castShadow?: boolean;
    };
  };
  onWorldReady?: (worldData: WorldData) => void;
  onObjectSelect?: (objectId: string) => void;
  onObjectInteract?: (objectId: string, action: string) => void;
}
