import { GroupProps } from "@react-three/fiber";

export interface airplaneType extends GroupProps {
  angleChange?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  maxSpeed?: number;
  accelRatio?: number;
}

export interface vehicleType extends GroupProps {
  angleChange?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  maxSpeed?: number;
  accelRatio?: number;
}

export interface characterType extends GroupProps {
  angleChange?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  maxSpeed?: number;
  accelRatio?: number;
}
