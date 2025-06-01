import { atom } from 'jotai';
import { ClickerOptionType } from '../types';

export const clickerOptionAtom = atom<ClickerOptionType>({
  isRun: true,
  throttle: 100,
  autoStart: false,
  track: false,
  loop: false,
  queue: [],
  line: false,
}); 