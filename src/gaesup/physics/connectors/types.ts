import {
  inputAtom,
  keyboardInputAtom,
  pointerInputAtom,
  gaesupWorldContextType,
} from '@/gaesup/atoms';
import { DispatchType, PhysicsBridgeData } from '@/types';
import { useAtomValue, useSetAtom } from 'jotai';

export interface AtomBridgeData {
  inputSystem: ReturnType<typeof useAtomValue<typeof inputAtom>>;
  urls: ReturnType<typeof useAtomValue<typeof urlsAtom>>;
  block: ReturnType<typeof useAtomValue<typeof blockAtom>>;
  setKeyboardInput: ReturnType<typeof useSetAtom<typeof keyboardInputAtom>>;
  setPointerInput: ReturnType<typeof useSetAtom<typeof pointerInputAtom>>;
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
