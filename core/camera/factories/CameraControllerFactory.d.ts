import { ICameraController } from '../core/types';
export type CameraControllerType = 'third-person' | 'first-person' | 'chase' | 'top-down' | 'isometric' | 'side-scroll' | 'fixed' | string;
export type ControllerFactory = () => ICameraController;
export declare class CameraControllerFactory {
    private static factories;
    static register(type: CameraControllerType, factory: ControllerFactory): void;
    static create(type: CameraControllerType): ICameraController;
    static getAvailableTypes(): CameraControllerType[];
    static hasType(type: CameraControllerType): boolean;
}
