import { StateCreator } from 'zustand';
import { vec3 } from '@react-three/rapier';
import { ModeSlice } from './types';
import { StoreState } from '../../gaesupStore';

export const initialModeState: ModeSlice = {
    mode: {
        type: 'character',
        controller: 'keyboard',
        control: 'thirdPerson',
    },
    controllerOptions: {
        lerp: {
            cameraTurn: 0.2,
            cameraPosition: 0.1,
        },
    },
    setMode: () => { },
    setControllerOptions: () => { },
};

export const createModeSlice: StateCreator<StoreState, [], [], ModeSlice> = (set, get) => ({
    ...initialModeState,
    controllerConfig: {
        airplane: {
            angleDelta: vec3({
                x: Math.PI / 256,
                y: Math.PI / 256,
                z: Math.PI / 256,
            }),
            maxAngle: vec3({
                x: Math.PI / 8,
                y: Math.PI / 8,
                z: Math.PI / 8,
            }),
            maxSpeed: 60,
            accelRatio: 2,
            brakeRatio: 5,
            buoyancy: 0.2,
            linearDamping: 1,
        },
        vehicle: {
            maxSpeed: 60,
            accelRatio: 2,
            brakeRatio: 5,
            wheelOffset: 0.1,
            linearDamping: 0.5,
        },
        character: {
            walkSpeed: 10,
            runSpeed: 20,
            turnSpeed: 10,
            jumpSpeed: 15,
            linearDamping: 1,
            jumpGravityScale: 1.5,
            normalGravityScale: 1.0,
            airDamping: 0.1,
            stopDamping: 3,
        },
        controllerOptions: {
            lerp: {
                cameraTurn: 1,
                cameraPosition: 1,
            },
        },
    },
    setMode: (mode) => {
        set((state) => ({
            mode: {
                ...state.mode,
                ...mode,
            },
        }));
    },
    setControllerOptions: (options) => {
        set((state) => ({
            controllerOptions: {
                ...state.controllerOptions,
                ...options,
                lerp: {
                    ...state.controllerOptions.lerp,
                    ...options.lerp,
                },
            },
        }));
    },
    currentControllerConfig: () => {
        const { mode, controllerConfig } = get();
        return controllerConfig[mode.type] || controllerConfig.character;
    },
});
