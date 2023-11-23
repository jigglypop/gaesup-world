import { propType } from '@gaesup/type';
import { atom, useAtomValue } from 'jotai';
import { optionsAtom } from '../options';

export type controlType = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  [key: string]: boolean;
};

export const controlAtom = atom<controlType>({
  forward: false,
  backward: false,
  leftward: false,
  rightward: false
});

controlAtom.debugLabel = 'control';

export default function useCalcControl(prop: propType) {
  const control = useAtomValue(controlAtom);
  const options = useAtomValue(optionsAtom);
  const { controllerType } = options;
  const { keyControl } = prop;
  return controllerType === 'gameboy' || controllerType === 'joystick'
    ? control
    : keyControl;
}
