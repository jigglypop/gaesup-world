import { useState, useEffect } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';
import { CameraDebugPanelProps, CameraMetrics, DebugField, DEFAULT_DEBUG_FIELDS } from './types';

export function CameraDebugPanel({ 
  position = 'top-right',
  visible = false,
  updateInterval = 100,
  zIndex = 10000,
  compact = false,
  theme = 'dark',
  fields = DEFAULT_DEBUG_FIELDS,
  precision = 2,
  width,
  height,
  customFields = []
}: CameraDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(visible);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeFields, setActiveFields] = useState<DebugField[]>(fields);
  
  const mode = useGaesupStore((state) => state.mode);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const activeState = useGaesupStore((state) => state.activeState);
  const characterPosition = useGaesupStore((state) => state.characterPosition);
  const characterVelocity = useGaesupStore((state) => state.characterVelocity);
  const characterRotation = useGaesupStore((state) => state.characterRotation);
  
  const metrics: CameraMetrics = {
    frameCount: Date.now(),
    averageFrameTime: 16.67,
    lastUpdateTime: Date.now(),
    mode: mode?.control || 'unknown',
    activeController: 'zustand-store',
    distance: cameraOption?.distance || { x: 0, y: 0, z: 0 },
    fov: cameraOption?.fov || 75,
    position: characterPosition || activeState?.position || { x: 0, y: 0, z: 0 },
    targetPosition: null,
    velocity: characterVelocity || null,
    rotation: characterRotation || null,
    zoom: cameraOption?.zoom || 1,
  };

  const formatValue = (value: any, format: string = 'text', precision: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'vector3':
        if (typeof value === 'object' && value.x !== undefined) {
          return `X: ${value.x?.toFixed(precision) || '0'}\nY: ${value.y?.toFixed(precision) || '0'}\nZ: ${value.z?.toFixed(precision) || '0'}`;
        }
        return 'N/A';
      case 'number':
        return typeof value === 'number' ? value.toFixed(precision) : value.toString();
      case 'angle':
        return typeof value === 'number' ? `${value.toFixed(precision)}°` : value.toString();
      default:
        return value.toString();
    }
  };

  const getValue = (key: string) => {
    return (metrics as any)[key];
  };

  const toggleField = (fieldKey: string) => {
    setActiveFields(prev => 
      prev.map(field => 
        field.key === fieldKey 
          ? { ...field, enabled: !field.enabled }
          : field
      )
    );
  };

  if (!isOpen) {
    return (
      <button 
        className={`camera-debug-toggle camera-debug-toggle--${position} camera-debug-toggle--${theme}`}
        onClick={() => setIsOpen(true)}
        title="카메라 디버그 정보 표시"
        style={{ zIndex }}
      >
        📷
      </button>
    );
  }

  return (
    <div 
      className={`camera-debug-panel camera-debug-panel--${position} camera-debug-panel--${theme} ${compact ? 'camera-debug-panel--compact' : ''}`}
      style={{ zIndex }}
    >
      <div className="camera-debug-panel__header">
        <span className="camera-debug-panel__title">Camera Debug</span>
        <button 
          className="camera-debug-panel__close"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
        <button 
          className="camera-debug-panel__customize"
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          {isCustomizing ? 'Done' : 'Customize'}
        </button>
      </div>
      
      <div className="camera-debug-panel__content">
        {activeFields.filter(field => field.enabled).map((field, index) => (
          <div key={index} className="camera-debug-section">
            <div className="camera-debug-section__title">{field.label}</div>
            <div className="camera-debug-value">{formatValue(getValue(field.key), field.format, precision)}</div>
          </div>
        ))}
      </div>
      
      {isCustomizing && (
        <div className="camera-debug-panel__customization">
          {fields.map((field, index) => (
            <div key={index} className="camera-debug-field">
              <input 
                type="checkbox" 
                checked={field.enabled} 
                onChange={() => toggleField(field.key)} 
              />
              <span>{field.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
