import useCalcControl from '@gaesup/stores/control';
import { joyStickOriginAtom } from '@gaesup/stores/joystick';
import { statesAtom } from '@gaesup/stores/states';
import { propType } from '@gaesup/type';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';

export default function checkMoving(prop: propType) {
  const states = useAtomValue(statesAtom);
  const joyStick = useAtomValue(joyStickOriginAtom);
  const { options } = prop;
  const { forward, backward, leftward, rightward, run, jump } =
    useCalcControl(prop);
  useFrame(() => {
    const { controllerType } = options;
    if (
      controllerType === 'none' ||
      controllerType === 'gameboy' ||
      controllerType === 'keyboard'
    ) {
      states.isMoving = forward || backward || leftward || rightward;
      states.isNotMoving = !states.isMoving;
      states.isRunning = run && states.isMoving;
      states.isJumping = jump;
    } else if (controllerType === 'joystick') {
      states.isMoving = joyStick.isOn;
      states.isNotMoving = !joyStick.isOn;
      states.isRunning = joyStick.isOn && joyStick.isIn;
      states.isJumping = jump;
    }
  });
}
