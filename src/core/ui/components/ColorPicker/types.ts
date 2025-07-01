export interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  presetColors?: string[];
  showAlpha?: boolean;
  className?: string;
}

export interface ColorPickerState {
  isOpen: boolean;
  tempColor: string;
} 