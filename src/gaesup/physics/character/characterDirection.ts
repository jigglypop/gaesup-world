import useCalcControl from '@gaesup/stores/control';
import { currentAtom } from '@gaesup/stores/current';
import { joyStickOriginAtom } from '@gaesup/stores/joystick';
import { optionsAtom } from '@gaesup/stores/options';
import { propType } from '@gaesup/type';
import { V3 } from '@gaesup/utils/vector';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';

export default function characterDirection(prop: propType) {
  const { rigidBodyRef, move, cameraRay } = prop;
  const options = useAtomValue(optionsAtom);
  const current = useAtomValue(currentAtom);
  const joystick = useAtomValue(joyStickOriginAtom);
  const { forward, backward, leftward, rightward } = useCalcControl(prop);
  const { controllerType } = options;

  useFrame(() => {
    if (!rigidBodyRef || !rigidBodyRef.current) return null;
    if (options.camera.type === 'perspective') {
      if (options.camera.control === 'orbit') {
        move.direction.set(0, 0, Number(forward) - Number(backward));
        if (
          controllerType === 'none' ||
          controllerType === 'gameboy' ||
          controllerType === 'keyboard'
        ) {
          current.euler.y +=
            ((Number(leftward) - Number(rightward)) * Math.PI) / 32;
        } else if (controllerType === 'joystick') {
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
      } else if (options.camera.control === 'normal') {
        if (
          controllerType === 'none' ||
          controllerType === 'gameboy' ||
          controllerType === 'keyboard'
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
        } else if (controllerType === 'joystick') {
          current.euler.y = -joystick.angle - Math.PI / 2;
        }
        move.direction.set(0, 0, 1);
      }
    } else if (options.camera.type === 'orthographic') {
      if (
        controllerType === 'none' ||
        controllerType === 'gameboy' ||
        controllerType === 'keyboard'
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
      } else if (controllerType === 'joystick') {
        current.euler.y = -joystick.angle - Math.PI / 2;
      }
      move.direction.set(0, 0, 1);
    }
  });
}
