import { CollisionEnterPayload } from "@react-three/rapier";
import {
  activeStateType,
  characterColliderType,
  modeType,
  urlType,
  urlsType,
} from "../../../world/context/type";

export type gaesupPassiveCharacterPropsType = {
  state: activeStateType;
  characterCollider?: characterColliderType;
  mode: modeType;
  url: urlType;
  currentAnimation: string;
  children?: React.ReactNode;
};

export type passiveVehiclePropsType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
  urls: urlsType;
  currentAnimation: string;
  children?: React.ReactNode;
  offset?: THREE.Vector3;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
};
