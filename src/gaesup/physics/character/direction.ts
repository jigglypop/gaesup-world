import { calcPropType } from "..";
import { V3 } from "../../utils/vector";

export default function direction(prop: calcPropType) {
  const { move, cameraRay, control } = prop;
  const [options] = prop.option;
  const [current] = prop.current;
  const [joystick] = prop.joystick;
  const { forward, backward, leftward, rightward } = control;
  const { controllerType } = options;
  if (options.camera.type === "perspective") {
    if (options.camera.control === "orbit") {
      move.direction.set(0, 0, Number(forward) - Number(backward));
      if (
        controllerType === "none" ||
        controllerType === "gameboy" ||
        controllerType === "keyboard"
      ) {
        current.euler.y +=
          ((Number(leftward) - Number(rightward)) * Math.PI) / 32;
      } else if (controllerType === "joystick") {
        current.euler.y = -joystick.angle - Math.PI / 2;
        move.direction = V3(
          Math.sin(current.euler.y),
          0,
          Math.cos(current.euler.y)
        );
      }
      current.dir = V3(
        Math.sin(current.euler.y),
        0,
        Math.cos(current.euler.y)
      ).normalize();
    } else if (options.camera.control === "normal") {
      if (
        controllerType === "none" ||
        controllerType === "gameboy" ||
        controllerType === "keyboard"
      ) {
        if (forward) {
          current.euler.y =
            cameraRay.pivot.rotation.y +
            (leftward ? Math.PI / 4 : 0) -
            (rightward ? Math.PI / 4 : 0);
        } else if (backward) {
          current.euler.y =
            cameraRay.pivot.rotation.y +
            Math.PI -
            (leftward ? Math.PI / 4 : 0) +
            (rightward ? Math.PI / 4 : 0);
        } else if (leftward) {
          current.euler.y = cameraRay.pivot.rotation.y + Math.PI / 2;
        } else if (rightward) {
          current.euler.y = cameraRay.pivot.rotation.y - Math.PI / 2;
        }
      } else if (controllerType === "joystick") {
        current.euler.y = -joystick.angle - Math.PI / 2;
      }
      move.direction.set(0, 0, 1);
    }
  } else if (options.camera.type === "orthographic") {
    if (
      controllerType === "none" ||
      controllerType === "gameboy" ||
      controllerType === "keyboard"
    ) {
      if (forward) {
        current.euler.y =
          (leftward ? Math.PI / 4 : 0) - (rightward ? Math.PI / 4 : 0);
      } else if (backward) {
        current.euler.y =
          Math.PI -
          (leftward ? Math.PI / 4 : 0) +
          (rightward ? Math.PI / 4 : 0);
      } else if (leftward) {
        current.euler.y = Math.PI / 2;
      } else if (rightward) {
        current.euler.y = -Math.PI / 2;
      }
    } else if (controllerType === "joystick") {
      current.euler.y = -joystick.angle - Math.PI / 2;
    }
    move.direction.set(0, 0, 1);
  }
}
