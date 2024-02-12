import { ThreeEvent } from "@react-three/fiber";
export default function useClicker(): {
    moveClicker: (e: ThreeEvent<MouseEvent>, isRun: boolean, type: "normal" | "ground") => void;
};
