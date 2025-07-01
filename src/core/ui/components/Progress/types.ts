export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'linear' | 'circular';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  indeterminate?: boolean;
}

export interface CircularProgressProps extends ProgressProps {
  strokeWidth?: number;
  radius?: number;
} 