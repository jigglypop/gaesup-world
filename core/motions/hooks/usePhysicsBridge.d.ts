import { PhysicsBridge } from '../bridge/PhysicsBridge';
import { type MotionsRuntime } from '../plugin';
import { PhysicsCalculationProps } from '../types';
export interface UsePhysicsBridgeOptions extends PhysicsCalculationProps {
    enabled?: boolean;
    motionsRuntime?: MotionsRuntime;
    allowLegacyFallback?: boolean;
}
export declare function usePhysicsBridge(props: UsePhysicsBridgeOptions): {
    isReady: boolean;
    bridge: PhysicsBridge | null;
};
