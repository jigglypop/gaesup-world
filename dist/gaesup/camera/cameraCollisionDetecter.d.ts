import { propType } from "../controller/type";
export default function cameraCollisionDetector(prop: propType): {
    checkCollision: (delta: number) => void;
};
