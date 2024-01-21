import { CollisionEnterPayload } from "@react-three/rapier";
import { urlsType } from "../../../world/context/type";

export type passiveAirplanePropsType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
  urls: urlsType;
  currentAnimation: string;
  offset?: THREE.Vector3;
  children?: React.ReactNode;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
};
