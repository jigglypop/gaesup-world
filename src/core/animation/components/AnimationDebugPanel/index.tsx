import React from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { AnimationType } from '../../core/types';
import { AnimationMetrics, DebugField } from './types';
import { DEFAULT_DEBUG_FIELDS } from './types';
import './styles.css';

export function AnimationDebugPanel() {
  const { mode, animationState } = useGaesupStore();
  
  const currentType = mode?.type as AnimationType || 'character';
  const currentAnimationData = animationState?.[currentType];
  
  const metrics: AnimationMetrics = {
    currentAnimation: currentAnimationData?.current || 'N/A',
    animationType: currentType,
    availableAnimations: Object.keys(currentAnimationData?.store || {}),
    isPlaying: currentAnimationData?.current !== 'idle', // Simple logic
    weight: currentAnimationData?.actions?._current?.getEffectiveWeight() || 1.0,
    speed: currentAnimationData?.actions?._current?.timeScale || 1.0,
  };

  const formatValue = (value: any, format: string, precision: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'array':
        return Array.isArray(value) ? `${value.length} animations` : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  };

  const getValue = (key: string): any => {
    return (metrics as any)[key];
  };

  return (
    <div className="ad-panel">
      <div className="ad-content">
        {DEFAULT_DEBUG_FIELDS.map((field: DebugField) => (
          <div key={field.key} className="ad-item">
            <span className="ad-label">{field.label}</span>
            <span className="ad-value">
              {formatValue(getValue(field.key), field.format)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
