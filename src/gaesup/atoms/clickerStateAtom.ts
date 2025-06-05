import { atom } from 'jotai';
import { ClickerOptionType, ClickerType } from '../types';
import { V3 } from '../utils/vector';

export interface ClickerStateType {
  clicker: ClickerType;
  option: ClickerOptionType;
}

export const clickerStateAtom = atom<ClickerStateType>({
  clicker: {
    point: V3(0, 0, 0),
    angle: Math.PI / 2,
    isOn: false,
    isRun: false,
  },
  option: {
    isRun: true,
    throttle: 100,
    autoStart: false,
    track: false,
    loop: false,
    queue: [],
    line: false,
  },
});

// 개별 접근을 위한 derived atoms
export const clickerAtom = atom(
  (get) => get(clickerStateAtom).clicker,
  (get, set, update: Partial<ClickerType>) => {
    const current = get(clickerStateAtom);
    set(clickerStateAtom, {
      ...current,
      clicker: { ...current.clicker, ...update },
    });
  },
);

export const clickerOptionAtom = atom(
  (get) => get(clickerStateAtom).option,
  (get, set, update: Partial<ClickerOptionType>) => {
    const current = get(clickerStateAtom);
    set(clickerStateAtom, {
      ...current,
      option: { ...current.option, ...update },
    });
  },
);
