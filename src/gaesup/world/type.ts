import { ReactNode } from "react";
import {
  airplaneColliderType,
  characterColliderType,
  vehicleColliderType,
} from "../stores/collider";
import { gaesupWorldPartialPropType, optionType } from "../stores/context";
import { urlType } from "../stores/url";

export type gaesupWorldPropsType = {
  children: ReactNode;
  props?: gaesupWorldPartialPropType;
  option?: optionType;
  url?: urlType;
  characterCollider?: characterColliderType;
  vehicleCollider?: vehicleColliderType;
  airplaneCollider?: airplaneColliderType;
};
