import React, { useState } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { AnimationType } from '../../core/types';
import { AnimationDebugPanelProps, AnimationMetrics, DebugField } from './types';
import { DEFAULT_DEBUG_FIELDS } from './types';
import './styles.css';

export function AnimationDebugPanel({
  position = 'top-left',
  fields = DEFAULT_DEBUG_FIELDS,
  customFields = [],
  precision = 2,
  compact = false
}: AnimationDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: field.enabled }), {})
  );

  const mode = useGaesupStore((state) => state.mode);
  const animationState = useGaesupStore((state) => state.animationState);
  
  const currentType = mode?.type as AnimationType || 'character';
  const currentAnimationData = animationState?.[currentType];
  
  const metrics: AnimationMetrics = {
    frameCount: Date.now(),
    averageFrameTime: 16.67,
    lastUpdateTime: Date.now(),
    currentAnimation: currentAnimationData?.current || 'idle',
    animationType: currentType,
    availableAnimations: Object.keys(currentAnimationData?.store || {}),
    isPlaying: true,
    weight: 1.0,
    speed: 1.0,
    blendDuration: 0.3,
    activeActions: Object.keys(currentAnimationData?.store || {}).length,
  };

  const formatValue = (value: any, format: string): string => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'vector3':
        if (typeof value === 'object' && value.x !== undefined) {
          return `(${value.x.toFixed(precision)}, ${value.y.toFixed(precision)}, ${value.z.toFixed(precision)})`;
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toFixed(precision) : String(value);
      case 'angle':
        return typeof value === 'number' ? `${(value * 180 / Math.PI).toFixed(precision)}°` : String(value);
      case 'array':
        return Array.isArray(value) ? `[${value.length} items]` : String(value);
      default:
        return String(value);
    }
  };

  const getValue = (key: string): any => {
    return (metrics as any)[key];
  };

  const toggleField = (fieldKey: string) => {
    setEnabledFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  if (!isOpen) {
    return (
      <div className={`animation-debug-toggle animation-debug-toggle--${position}`}>
        <button
          className="animation-debug-toggle__button"
          onClick={() => setIsOpen(true)}
          title="애니메이션 디버그 패널"
        >
          🎬
        </button>
      </div>
    );
  }

  return (
    <div className={`animation-debug-panel animation-debug-panel--${position} ${compact ? 'animation-debug-panel--compact' : ''}`}>
      <div className="animation-debug-panel__header">
        <span className="animation-debug-panel__title">애니메이션 디버그</span>
        <div className="animation-debug-panel__header-actions">
          <button
            className="animation-debug-panel__customize-btn"
            onClick={() => setShowCustomization(!showCustomization)}
            title="커스터마이징"
          >
            ⚙️
          </button>
          <button
            className="animation-debug-panel__close"
            onClick={() => setIsOpen(false)}
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {showCustomization && (
        <div className="animation-debug-panel__customization">
          <div className="animation-debug-panel__customization-header">
            <span>필드 선택</span>
          </div>
          <div className="animation-debug-panel__field-toggles">
            {fields.map((field) => (
              <label key={field.key} className="animation-debug-panel__field-toggle">
                <input
                  type="checkbox"
                  checked={enabledFields[field.key] || false}
                  onChange={() => toggleField(field.key)}
                />
                <span>{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="animation-debug-panel__content">
        {fields.filter(field => enabledFields[field.key]).map((field) => (
          <div key={field.key} className="animation-debug-panel__item">
            <span className="animation-debug-panel__label">{field.label}:</span>
            <span className="animation-debug-panel__value">
              {formatValue(getValue(field.key), field.format)}
            </span>
          </div>
        ))}

        {customFields.filter(field => enabledFields[field.key]).map((field) => (
          <div key={field.key} className="animation-debug-panel__item">
            <span className="animation-debug-panel__label">{field.label}:</span>
            <span className="animation-debug-panel__value">
              {formatValue(getValue(field.key), field.format)}
            </span>
          </div>
        ))}
      </div>

      <div className="animation-debug-panel__footer">
        <span className="animation-debug-panel__footer-text">
          {Date.now()} ms
        </span>
      </div>
    </div>
  );
}
