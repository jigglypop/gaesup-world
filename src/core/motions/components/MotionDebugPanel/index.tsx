import React from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { DebugField, DEFAULT_DEBUG_FIELDS } from './types';
import './styles.css';

export function MotionDebugPanel() {
  const { motion, metrics, config } = useGaesupStore();
  const formatValue = (field: DebugField, value: any, precision: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    switch (field.type) {
      case 'vector3':
        if (value.x !== undefined) {
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
      case 'isGrounded':
        return motion?.grounded;
      case 'isMoving':
        return motion?.velocity ? Math.abs(motion.velocity.x) + Math.abs(motion.velocity.z) > 0.1 : false;
      default:
        return (metrics as any)[field.key] || (config as any)[field.key] || 'N/A';
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
