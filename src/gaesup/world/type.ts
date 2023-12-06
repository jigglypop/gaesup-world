import { ReactNode } from "react";
import {
  airplaneColliderType,
  characterColliderType,
  gaesupWorldPartialPropType,
  optionType,
  urlType,
  vehicleColliderType,
} from "../stores/context";

export type gaesupWorldPropsType = {
  children: ReactNode;
  props?: gaesupWorldPartialPropType;
  option?: optionType;
  url?: urlType;
  characterCollider?: characterColliderType;
  vehicleCollider?: vehicleColliderType;
  airplaneCollider?: airplaneColliderType;
};
