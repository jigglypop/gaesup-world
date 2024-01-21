import { ReactNode } from "react";
import { keyboardMapType } from "../tools/keyBoardToolTip/type";
import { dispatchType } from "../utils/type";
import {
  blockType,
  cameraOptionType,
  gaesupWorldContextType,
  modeType,
  urlType,
} from "./context/type";

export type gaesupWorldInitType = {
  value: gaesupWorldContextType;
  dispatch: dispatchType<gaesupWorldContextType>;
};

export type gaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  url?: urlType;
  mode?: modeType;
  debug?: boolean;
  keyBoardMap?: keyboardMapType;
  cameraOption?: cameraOptionType;
  moveTo?: (position: THREE.Vector3, target: THREE.Vector3) => void;
  block?: blockType;
};
