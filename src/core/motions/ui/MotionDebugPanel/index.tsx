import React from 'react';

import type { MotionDebugPanelProps, DebugFieldValue } from './types';
import { DebugField, DEFAULT_DEBUG_FIELDS } from './types';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { useStateSystem } from '../../hooks/useStateSystem';
import './styles.css';

function getPanelStyle(
  position: MotionDebugPanelProps['position'] | undefined,
  zIndex: MotionDebugPanelProps['zIndex'] | undefined,
) {
  const pos = position ?? 'top-right';
  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: zIndex ?? 10000,
  };
  if (pos.includes('top')) style.top = 12;
  if (pos.includes('bottom')) style.bottom = 12;
  if (pos.includes('left')) style.left = 12;
  if (pos.includes('right')) style.right = 12;
  return style;
}

export function MotionDebugPanel(props: MotionDebugPanelProps) {
  const panelStyle = props.embedded ? {} : getPanelStyle(props.position, props.zIndex);
  const mode = useGaesupStore((state) => state.mode);
  const physics = useGaesupStore((state) => state.physics);
  const { activeState, gameStates } = useStateSystem();
  
  const precision = props.precision ?? 2;
  const fields = props.customFields
    ? [...DEFAULT_DEBUG_FIELDS, ...props.customFields]
    : DEFAULT_DEBUG_FIELDS;

  const formatValue = (
    field: DebugField,
    value: DebugFieldValue | null | undefined,
    fixedPrecision: number = 2,
  ): string => {
    if (value === null || value === undefined) return 'N/A';
    switch (field.type) {
      case 'vector3':
        if (Array.isArray(value) && value.length === 3) {
          const [x, y, z] = value;
          return `X:${x.toFixed(fixedPrecision)} Y:${y.toFixed(fixedPrecision)} Z:${z.toFixed(fixedPrecision)}`;
        }
        if (
          typeof value === 'object' &&
          value !== null &&
          'x' in value &&
          'y' in value &&
          'z' in value
        ) {
          const v = value as { x: number; y: number; z: number };
          return `X:${v.x.toFixed(fixedPrecision)} Y:${v.y.toFixed(fixedPrecision)} Z:${v.z.toFixed(fixedPrecision)}`;
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toFixed(fixedPrecision) : String(value);
      default:
        return String(value);
    }
  };

  const getCurrentValue = (field: DebugField): DebugFieldValue | null => {
    if (field.value !== undefined) return field.value;

    switch (field.key) {
      case 'motionType':
        return mode?.type ?? 'character';
      case 'position':
        return activeState?.position
          ? { x: activeState.position.x, y: activeState.position.y, z: activeState.position.z }
          : { x: 0, y: 0, z: 0 };
      case 'velocity':
        return activeState?.velocity
          ? { x: activeState.velocity.x, y: activeState.velocity.y, z: activeState.velocity.z }
          : { x: 0, y: 0, z: 0 };
      case 'speed':
        return activeState?.velocity ? activeState.velocity.length() : 0;
      case 'direction':
        return activeState?.direction
          ? { x: activeState.direction.x, y: activeState.direction.y, z: activeState.direction.z }
          : { x: 0, y: 0, z: 0 };
      case 'isGrounded':
        return gameStates?.isOnTheGround ? 'Yes' : 'No';
      case 'isMoving':
        return gameStates?.isMoving ? 'Yes' : 'No';
      case 'acceleration':
        return physics?.accelRatio ?? 0;
      case 'jumpForce':
        return physics?.jumpSpeed ?? 0;
      case 'maxSpeed':
        return mode?.type === 'character'
          ? physics?.runSpeed ?? 0
          : physics?.maxSpeed ?? 0;
      case 'totalDistance':
        return 0;
      case 'gameState':
        return gameStates?.isRiding ? 'riding' : gameStates?.isOnTheGround ? 'ground' : 'air';
      default:
        return null;
    }
  };

  return (
    <div
      className={`md-panel ${props.compact ? 'compact' : ''} ${props.theme ? `theme-${props.theme}` : ''}`}
      style={panelStyle}
    >
      <div className="md-content">
        {fields.map((field) => (
            <div key={field.key} className="md-item">
              <span className="md-label">{field.label}</span>
              <span className="md-value">
                {formatValue(field, getCurrentValue(field), precision)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
