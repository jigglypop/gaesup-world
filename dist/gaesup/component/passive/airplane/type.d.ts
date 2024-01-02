/// <reference types="react" />
export type passiveAirplanePropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    airplaneSize: THREE.Vector3;
    airplaneUrl: string;
    currentAnimation: string;
    children?: React.ReactNode;
    gravity?: number;
};
