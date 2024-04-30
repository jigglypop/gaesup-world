/// <reference types="lodash" />
import { ThreeEvent } from "@react-three/fiber";
export declare function useClicker(): {
    moveClicker: import("lodash").DebouncedFunc<(e: ThreeEvent<MouseEvent>, isRun: boolean, type: "normal" | "ground") => void>;
};
