import * as THREE from 'three';
import { rideableType } from '@hooks/useRideable/types';
export interface RideableState {
    [key: string]: rideableType;
}
export interface RideableSlice {
    rideable: RideableState;
    setRideable: (key: string, value: Partial<rideableType>) => void;
    removeRideable: (key: string) => void;
}
export interface RideableType {
    offset?: THREE.Vector3;
    visible?: boolean;
    isOccupied?: boolean;
}
