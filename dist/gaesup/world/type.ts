import { ReactNode } from "react";
import * as THREE from "three";
import { dispatchType } from "../utils/type";
import {
  blockType,
  cameraOptionType,
  clickerOptionType,
  gaesupWorldContextType,
  modeType,
  urlsType,
} from "./context/type";

export type gaesupWorldInitType = {
  value: gaesupWorldContextType;
  dispatch: dispatchType<gaesupWorldContextType>;
};

export type gaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  urls?: urlsType;
  mode?: modeType;
  debug?: boolean;
  cameraOption?: cameraOptionType;
  block?: blockType;
  clickerOption?: clickerOptionType;
};
