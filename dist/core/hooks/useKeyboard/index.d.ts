export declare const useKeyboard: (enableDiagonal?: boolean, enableClicker?: boolean, cameraOption?: any) => {
    pressedKeys: string[];
    pushKey: (key: string, value: boolean) => boolean;
    isKeyPressed: (key: string) => boolean;
    clearAllKeys: () => void;
};
