import { Dispatch, ReactNode } from "react";
import {
  airplaneColliderType,
  characterColliderType,
  vehicleColliderType,
} from "../../stores/collider";

import {
  gaesupControllerPropType,
  gaesupWorldPartialPropType,
  gaesupWorldPropType,
} from "../../stores/context/gaesupworld/type";

import { urlType } from "../../stores/url/type";
import { joyStickInnerType } from "../../tools/joystick/type";
import { minimapInnerType } from "../../tools/minimap/type";
import { getGltfResultType } from "./collider/gltf";

export type initGaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  props?: gaesupWorldPartialPropType;
  url?: urlType;
  characterCollider?: characterColliderType;
  vehicleCollider?: vehicleColliderType;
  airplaneCollider?: airplaneColliderType;
  mode?: gaesupControllerPropType;
  debug?: boolean;
  minimap?: Omit<minimapInnerType, "props">;
  joystick?: joyStickInnerType;
};

export type innerColliderPropType = {
  gltf?: getGltfResultType;
  value: gaesupWorldPropType;
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>;
};
