import { gaesupWorldContextType } from '@/gaesup/atoms';
import { StoreState } from '@/gaesup/stores/gaesupStore';
import { DispatchType, PhysicsBridgeData } from '@/types';

export interface StoreBridgeData {
  input: StoreState['input'];
  urls: StoreState['urls'];
  block: StoreState['block'];
  setKeyboard: StoreState['setKeyboard'];
  setPointer: StoreState['setPointer'];
}

export interface ContextBridgeData {
  worldContext: gaesupWorldContextType | null;
  worldDispatch: DispatchType<gaesupWorldContextType> | null;
}

export interface PhysicsLayerStatus {
  atomsConnected: boolean;
  contextConnected: boolean;
  bridgeReady: boolean;
  animationSynced: boolean;
}

export interface PhysicsStatusResult {
  isReady: boolean;
  error: string | null;
  layerStatus: PhysicsLayerStatus;
  rawData: {
    inputSystem: any;
    urls: any;
    block: any;
    worldContext: any;
    controllerContext: any;
    worldDispatch: any;
  };
}

export interface PhysicsResult extends PhysicsStatusResult {
  bridgeRef: React.RefObject<PhysicsBridgeData>;
}
