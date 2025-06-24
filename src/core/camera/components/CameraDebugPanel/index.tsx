import { useState, useEffect } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';
import { CameraMetrics, DebugField, DEFAULT_DEBUG_FIELDS } from './types';

export function CameraDebugPanel() {
  const [metrics, setMetrics] = useState<CameraMetrics>({});
  const { mode, cameraOption, activeState, characterPosition, characterVelocity, characterRotation } = useGaesupStore();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        mode: mode?.control,
        distance: cameraOption?.distance,
        fov: cameraOption?.fov,
        position: characterPosition || activeState?.position,
        velocity: characterVelocity,
        rotation: characterRotation,
        zoom: cameraOption?.zoom,
      });
    }, 100);
    return () => clearInterval(interval);
  }, [mode, cameraOption, activeState, characterPosition, characterVelocity, characterRotation]);

  const formatValue = (value: any, precision: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && value.x !== undefined) {
      return `X:${value.x.toFixed(precision)} Y:${value.y.toFixed(precision)} Z:${value.z.toFixed(precision)}`;
    }
    if (typeof value === 'number') {
      return value.toFixed(precision);
    }
    return value.toString();
  };

  return (
    <div className="cd-panel">
      <div className="cd-grid">
        {DEFAULT_DEBUG_FIELDS.map((field) => (
          <div key={field.key} className="cd-item">
            <span className="cd-label">{field.label}</span>
            <span className="cd-value">{formatValue((metrics as any)[field.key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
