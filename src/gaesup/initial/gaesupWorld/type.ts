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
} from "../../stores/context";
import { minimapType } from "../../stores/minimap";
import { urlType } from "../../stores/url";
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
  minimap?: Omit<minimapType, "props">;
};

export type innerColliderPropType = {
  gltf?: getGltfResultType;
  value: gaesupWorldPropType;
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>;
};
