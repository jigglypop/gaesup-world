import { ReactNode } from "react";
import * as THREE from "three";
import { controllerOptionsType, refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";

export type activeVehicleInnerType = {
  children: ReactNode;
  controllerOptions: controllerOptionsType;
  enableRiding?: boolean;
  isRiderOn?: boolean;
  offset?: THREE.Vector3;
  refs: refsType;
  urls: urlsType;
};
