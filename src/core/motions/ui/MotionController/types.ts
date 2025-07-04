export interface MotionControllerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showLabels?: boolean;
  compact?: boolean;
  zIndex?: number;
  onPresetChange?: (presetId: string) => void;
}
