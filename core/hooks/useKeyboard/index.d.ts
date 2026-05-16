import type { CameraOptionType } from '../../camera/core/types';
export declare const useKeyboard: (enableDiagonal?: boolean, enableClicker?: boolean, cameraOption?: CameraOptionType) => {
    pressedKeys: string[];
    pushKey: (key: string, value: boolean) => boolean;
    isKeyPressed: (key: string) => boolean;
    clearAllKeys: () => void;
};
