import React from 'react';
import { ProgressProps, CircularProgressProps } from './types';
import './styles.css';

const SIZE_MAP = {
  small: { linear: 4, circular: 32, strokeWidth: 3 },
  medium: { linear: 8, circular: 48, strokeWidth: 4 },
  large: { linear: 12, circular: 64, strokeWidth: 5 },
};

function LinearProgress({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = 'medium',
  color,
  className = '',
  indeterminate = false,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress progress--linear ${className}`}>
      {label && <span className="progress__label">{label}</span>}
      
      <div className={`progress__container progress__container--${size}`}>
        <div
          className={`progress__bar ${indeterminate ? 'progress__bar--indeterminate' : ''}`}
          style={{
            width: indeterminate ? undefined : `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      
      {showPercentage && !indeterminate && (
        <span className="progress__percentage">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

function CircularProgress({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = 'medium',
  color,
  className = '',
  indeterminate = false,
  strokeWidth,
  radius,
}: CircularProgressProps) {
  const sizeConfig = SIZE_MAP[size];
  const actualRadius = radius || sizeConfig.circular / 2 - (strokeWidth || sizeConfig.strokeWidth);
  const actualStrokeWidth = strokeWidth || sizeConfig.strokeWidth;
  const circumference = 2 * Math.PI * actualRadius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`progress progress--circular ${className}`}>
      {label && <span className="progress__label">{label}</span>}
      
      <div className={`progress__circular progress__circular--${size}`}>
        <svg
          className={`progress__circular-svg ${indeterminate ? 'progress__circular-bar--indeterminate' : ''}`}
          width={sizeConfig.circular}
          height={sizeConfig.circular}
        >
          <circle
            className="progress__circular-background"
            cx={sizeConfig.circular / 2}
            cy={sizeConfig.circular / 2}
            r={actualRadius}
            strokeWidth={actualStrokeWidth}
          />
          <circle
            className="progress__circular-bar"
            cx={sizeConfig.circular / 2}
            cy={sizeConfig.circular / 2}
            r={actualRadius}
            strokeWidth={actualStrokeWidth}
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: indeterminate ? circumference * 0.75 : strokeDashoffset,
            }}
          />
        </svg>
        
        {showPercentage && !indeterminate && (
          <div className="progress__circular-text">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    </div>
  );
}

export function Progress({
  variant = 'linear',
  ...props
}: ProgressProps) {
  if (variant === 'circular') {
    return <CircularProgress {...props} />;
  }
  
  return <LinearProgress {...props} />;
}

export default Progress; 