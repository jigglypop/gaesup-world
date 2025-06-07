import { inputState, PhysicsBridgeOutput, ResourceUrlsType, BlockState } from '../../types';
import { gaesupWorldContextType, gaesupDisptachType } from '../../context/types';

export type RawDataType = {
  inputSystem: inputState;
  urls: ResourceUrlsType;
  block: BlockState;
  worldContext: Partial<gaesupWorldContextType>;
  controllerContext: Partial<gaesupWorldContextType>;
  worldDispatch: gaesupDisptachType;
};

export type LayerStatusType = {
  atomsConnected: boolean;
  contextConnected: boolean;
  bridgeReady: boolean;
  animationSynced: boolean;
};

export type BridgeConnectorReturnType = PhysicsBridgeOutput & {
  rawData: RawDataType;
  layerStatus: LayerStatusType;
};
