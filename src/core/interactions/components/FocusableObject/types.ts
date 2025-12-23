import type { ThreeElements, ThreeEvent } from '@react-three/fiber';

export type FocusableObjectProps = ThreeElements['group'] & {
  focusDistance?: number;
  focusDuration?: number;
  onFocus?: (event: ThreeEvent<MouseEvent>) => void;
  onBlur?: (event: ThreeEvent<PointerEvent>) => void;
};