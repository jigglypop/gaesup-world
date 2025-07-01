import { GroupProps, ThreeEvent } from '@react-three/fiber';

export interface FocusableObjectProps extends GroupProps {
  focusDistance?: number;
  focusDuration?: number;
  onFocus?: (event: ThreeEvent<MouseEvent>) => void;
  onBlur?: (event: ThreeEvent<PointerEvent>) => void;
} 