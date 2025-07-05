import React from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { DebugField, DEFAULT_DEBUG_FIELDS } from './types';
import './styles.css';

export function MotionDebugPanel() {
  const motion = useGaesupStore((state) => state.motion);
  const metrics = useGaesupStore((state) => state.metrics);
  const config = useGaesupStore((state) => state.config);
  
  const formatValue = (field: DebugField, value: string | number | { x: number; y: number; z: number } | boolean | null | undefined, precision: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    switch (field.type) {
      case 'vector3':
        if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value && 'z' in value) {
          return `X:${value.x.toFixed(precision)} Y:${value.y.toFixed(precision)} Z:${value.z.toFixed(precision)}`;
        }
        return String(value);
      case 'boolean':
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
      case 'number':
        return typeof value === 'number' ? value.toFixed(precision) : String(value);
      default:
        return String(value);
    }
  };


  const getCurrentValue = (field: DebugField): string | number | { x: number; y: number; z: number } | boolean => {
    switch (field.key) {
      case 'motionType':
        return motion?.type || 'character';
      case 'position':
        return motion?.position || { x: 0, y: 0, z: 0 };
      case 'velocity':
        return motion?.velocity || { x: 0, y: 0, z: 0 };
      case 'speed':
        return motion?.speed || 0;
      case 'isGrounded':
        return motion?.grounded;
      case 'isMoving':
        return motion?.velocity ? Math.abs(motion.velocity.x) + Math.abs(motion.velocity.z) > 0.1 : false;
      default:
        const metricsValue = metrics && field.key in metrics ? (metrics as Record<string, unknown>)[field.key] : undefined;
        const configValue = config && field.key in config ? (config as Record<string, unknown>)[field.key] : undefined;
        return metricsValue || configValue || 'N/A';
    }
  };

  return (
    <div className="md-panel">
      <div className="md-content">
        {DEFAULT_DEBUG_FIELDS.map((field) => (
            <div key={field.key} className="md-item">
              <span className="md-label">{field.label}</span>
              <span className="md-value">
                {formatValue(field, getCurrentValue(field))}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
