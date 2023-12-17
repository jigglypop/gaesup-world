import { controllerInnerType } from "../controller/type";
export default function cameraCollisionDetector(prop: controllerInnerType): {
    checkCollision: (delta: number) => void;
};
