import { RigidBodyTypeString } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import { controllerOptionsType, refsType } from "../../../controller/type";
import { propInnerType } from "../../../physics/type";
import { urlsType } from "../../../world/context/type";

export type characterInnerType = {
  children: ReactNode;
  controllerOptions: controllerOptionsType;
  refs: Partial<refsType>;
  urls: urlsType;
  position?: THREE.Vector3;
  positionLerp?: number;
  euler?: THREE.Euler;
  type?: RigidBodyTypeString;
  componentType: "character" | "vehicle" | "airplane";
  currentAnimation?: string;
  isActive?: boolean;
} & propInnerType;
