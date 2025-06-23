import React, { useState, useEffect } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { MotionDebugPanelProps, DebugField, MotionMetrics, DEFAULT_DEBUG_FIELDS } from './types';
import './styles.css';

export function MotionDebugPanel({
  position = 'top-left',
  updateInterval = 100,
  customFields = [],
  precision = 2,
  compact = false,
  zIndex = 1000
}: MotionDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_DEBUG_FIELDS.map(f => f.key));
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentPrecision, setCurrentPrecision] = useState(precision);

  const { motion, metrics, config } = useGaesupStore();

  const allFields: DebugField[] = [
    ...DEFAULT_DEBUG_FIELDS,
    ...customFields
  ];

  const formatValue = (field: DebugField, value: any): string => {
    if (value === null || value === undefined) return 'N/A';

    switch (field.type) {
      case 'vector3':
        if (value.x !== undefined) {
          return `x:${value.x.toFixed(currentPrecision)} y:${value.y.toFixed(currentPrecision)} z:${value.z.toFixed(currentPrecision)}`;
        }
        return String(value);
      
      case 'angle':
        return `${(typeof value === 'number' ? value * 180 / Math.PI : value).toFixed(currentPrecision)}°`;
      
      case 'number':
        return typeof value === 'number' ? value.toFixed(currentPrecision) : String(value);
      
      case 'text':
      default:
        return String(value);
    }
  };

  const getCurrentValue = (field: DebugField): any => {
    switch (field.key) {
      case 'motionType':
        return motion?.type || 'character';
      case 'position':
        return motion?.position || { x: 0, y: 0, z: 0 };
      case 'velocity':
        return motion?.velocity || { x: 0, y: 0, z: 0 };
      case 'speed':
        return motion?.speed || 0;
      case 'direction':
        return motion?.direction || { x: 0, y: 0, z: 0 };
      case 'isGrounded':
        return motion?.grounded ? 'Yes' : 'No';
      case 'isMoving':
        return motion?.velocity ? 
          Math.abs(motion.velocity.x) + Math.abs(motion.velocity.z) > 0.1 ? 'Yes' : 'No' : 'No';
      case 'acceleration':
        return metrics?.acceleration || 15;
      case 'jumpForce':
        return config?.jumpForce || 12;
      case 'maxSpeed':
        return config?.maxSpeed || 10;
      case 'totalDistance':
        return metrics?.totalDistance || 0;
      case 'gameState':
        return metrics?.gameState || 'playing';
      default:
        return field.value || 'N/A';
    }
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(k => k !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  if (!isOpen) {
    return (
      <div className={`motion-debug-toggle motion-debug-toggle--${position}`} style={{ zIndex }}>
        <button
          className="motion-debug-toggle__button"
          onClick={() => setIsOpen(true)}
          title="모션 디버그 패널"
        >
          📊
        </button>
      </div>
    );
  }

  return (
    <div className={`motion-debug-panel motion-debug-panel--${position} ${compact ? 'motion-debug-panel--compact' : ''}`} style={{ zIndex }}>
      <div className="motion-debug-panel__header">
        <span className="motion-debug-panel__title">Motion Debug</span>
        <div className="motion-debug-panel__controls">
          <button
            className={`motion-debug-panel__customize ${showCustomization ? 'motion-debug-panel__customize--active' : ''}`}
            onClick={() => setShowCustomization(!showCustomization)}
            title="커스터마이징"
          >
            ⚙️
          </button>
          <button
            className="motion-debug-panel__close"
            onClick={() => setIsOpen(false)}
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {showCustomization && (
        <div className="motion-debug-panel__customization">
          <div className="motion-debug-panel__precision">
            <label>소수점: </label>
            <input
              type="range"
              min="0"
              max="4"
              value={currentPrecision}
              onChange={(e) => setCurrentPrecision(Number(e.target.value))}
            />
            <span>{currentPrecision}</span>
          </div>
          
          <div className="motion-debug-panel__fields">
            <div className="motion-debug-panel__fields-title">표시 필드:</div>
            <div className="motion-debug-panel__fields-grid">
              {allFields.map((field) => (
                <label key={field.key} className="motion-debug-panel__field-option">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => handleFieldToggle(field.key)}
                  />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="motion-debug-panel__content">
        {allFields
          .filter(field => selectedFields.includes(field.key))
          .map((field) => (
            <div key={field.key} className="motion-debug-panel__item">
              <span className="motion-debug-panel__label">{field.label}:</span>
              <span className="motion-debug-panel__value">
                {formatValue(field, getCurrentValue(field))}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
