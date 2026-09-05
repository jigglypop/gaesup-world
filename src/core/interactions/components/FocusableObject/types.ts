import type { ThreeElements, ThreeEvent } from '@react-three/fiber';

export type FocusableBlurEvent = ThreeEvent<MouseEvent> | ThreeEvent<PointerEvent>;

export type FocusableObjectProps = ThreeElements['group'] & {
  focusDistance?: number;
  focusDuration?: number;
  onFocus?: (event: ThreeEvent<MouseEvent>) => void;
  onBlur?: (event: FocusableBlurEvent) => void;
};
