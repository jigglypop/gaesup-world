import { atom } from 'jotai';
import { BlockType } from '../types';

export const blockAtom = atom<BlockType>({
  camera: false,
  control: false,
  animation: false,
  scroll: true,
});
