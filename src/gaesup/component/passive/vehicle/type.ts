import {
  CollisionEnterPayload,
  RigidBodyTypeString,
} from "@react-three/rapier";
import * as THREE from "three";
import { controllerOptionsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";

export type passiveVehiclePropsType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  controllerOptions: controllerOptionsType;
  urls: urlsType;
  currentAnimation: string;
  children?: React.ReactNode;
  offset?: THREE.Vector3;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  type?: RigidBodyTypeString;
  isRiderOn?: boolean;
  enableRiding?: boolean;
};
