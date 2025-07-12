import { ReactNode } from 'react';

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
  urls?: Partial<{
    character?: string;
    vehicle?: string;
    airplane?: string;
    terrain?: string;
    skybox?: string;
  }>;
  cameraOption?: {
    type: 'fixed' | 'chase' | 'firstPerson' | 'thirdPerson' | 'topDown';
    distance?: number;
    height?: number;
    fov?: number;
    smoothness?: number;
  };
  mode?: {
    type: 'character' | 'vehicle' | 'airplane';
    controller?: 'clicker' | 'keyboard' | 'gamepad';
    control?: 'fixed' | 'chase' | 'firstPerson' | 'thirdPerson' | 'topDown';
  };
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
