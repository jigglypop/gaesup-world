/// <reference types="react" />
import { RapierRigidBody } from "@react-three/rapier";
import { activeStateType, modeType } from "../world/context/type";
export type passiveMutationType = {
    mode: modeType;
    state: activeStateType;
    delta: number;
    outerGroupRef: React.MutableRefObject<THREE.Group>;
    rigidBodyRef: React.MutableRefObject<RapierRigidBody>;
    innerGroupRef: React.MutableRefObject<THREE.Group>;
};
export type passiveMutationPropType = {
    outerGroupRef: React.MutableRefObject<THREE.Group>;
    rigidBodyRef: React.MutableRefObject<RapierRigidBody>;
    innerGroupRef: React.MutableRefObject<THREE.Group>;
    position: THREE.Vector3;
    euler: THREE.Euler;
    rotation: THREE.Euler;
    quat: THREE.Quaternion;
    delta?: number;
};
