import { atom } from 'jotai';
import { ControlState } from '../types';

export const controlAtom = atom<ControlState>({
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
}); 