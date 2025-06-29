import { RideableUIProps, RideableObject } from './types';
import './styles.css';
export declare function RideableUI({ states }: RideableUIProps): import("react/jsx-runtime").JSX.Element | null;
export declare function RideableObjects({ objects, onRide, onExit, showDebugInfo }: {
    objects: RideableObject[];
    onRide?: (objectId: string) => void;
    onExit?: (objectId: string) => void;
    showDebugInfo?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export * from './types';
