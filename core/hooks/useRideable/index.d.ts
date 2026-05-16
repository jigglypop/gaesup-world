import { CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';
import { rideableType } from './types';
export declare const rideableDefault: Omit<rideableType, 'objectkey' | 'objectType' | 'url' | 'wheelUrl'>;
export declare function useRideable(): {
    initRideable: (props: rideableType) => void;
    updateRideable: (props: rideableType) => void;
    getRideable: (objectkey: string) => rideableType | undefined;
    onRideableNear: (e: CollisionEnterPayload, props: rideableType) => Promise<void>;
    onRideableLeave: (e: CollisionExitPayload) => Promise<void>;
    enterRideable: () => Promise<void>;
    exitRideable: () => Promise<void>;
    landing: (objectkey: string) => void;
};
