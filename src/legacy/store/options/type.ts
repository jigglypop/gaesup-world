import { RootState } from "@react-three/fiber";
import { queueActionType } from "gaesup-world/dist/types/gaesup/world/context/type";
import * as THREE from "three";

export type queueFunctionType = {
  action: queueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

export type clickerOptionType = {
  autoStart: boolean;
  track: boolean;
  queue: (THREE.Vector3 | queueFunctionType)[];
  loop: boolean;
};

export type blockOptionType = {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
};
export type clickerOptionAtomType = clickerOptionType;
export type blockOptionAtomType = blockOptionType;
