import { atom } from 'jotai';
import { BlockType, ControlState } from '../types';

export interface ControlStateType {
  control: ControlState;
  block: BlockType;
}

export const controlStateAtom = atom<ControlStateType>({
  control: {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    shift: false,
    space: false,
  },
  block: {
    camera: false,
    control: false,
    animation: false,
    scroll: true,
  },
});

// 개별 접근을 위한 derived atoms
export const controlAtom = atom(
  (get) => get(controlStateAtom).control,
  (get, set, update: Partial<ControlState>) => {
    const current = get(controlStateAtom);
    set(controlStateAtom, {
      ...current,
      control: { ...current.control, ...update },
    });
  },
);

export const blockAtom = atom(
  (get) => get(controlStateAtom).block,
  (get, set, update: Partial<BlockType>) => {
    const current = get(controlStateAtom);
    set(controlStateAtom, {
      ...current,
      block: { ...current.block, ...update },
    });
  },
);
