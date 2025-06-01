import { atom } from 'jotai';
import { ClickerType } from '../types';
import { V3 } from '../utils/vector';

export const clickerAtom = atom<ClickerType>({
  point: V3(0, 0, 0),
  angle: Math.PI / 2,
  isOn: false,
  isRun: false,
}); 