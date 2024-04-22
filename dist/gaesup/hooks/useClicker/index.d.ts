import { ThreeEvent } from "@react-three/fiber";
export declare function useClicker(): {
    moveClicker: (e: ThreeEvent<MouseEvent>, isRun: boolean, type: "normal" | "ground") => void;
};
