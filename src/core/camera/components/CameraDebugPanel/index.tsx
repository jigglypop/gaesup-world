import { useState, useEffect, useCallback, useRef } from 'react';

import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';
import { CameraMetrics, DEFAULT_DEBUG_FIELDS } from './types';
import { useStateSystem } from '../../../motions/hooks/useStateSystem';

import { DebugValue } from '@core/types/common';

export function CameraDebugPanel() {
  const [metrics, setMetrics] = useState<CameraMetrics>({});
  const mode = useGaesupStore((state) => state.mode);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const { activeState } = useStateSystem();
  const characterPosition = useGaesupStore((state) => state.characterPosition);
  const characterVelocity = useGaesupStore((state) => state.characterVelocity);
  const characterRotation = useGaesupStore((state) => state.characterRotation);
  const metricsRef = useRef<CameraMetrics>({});
  const checkMetricChange = useCallback((
    newValue: any, 
    oldValue: any
  ): boolean => {
    if (newValue === oldValue) return false;
    if (typeof newValue !== 'object' || newValue === null) return true;
    
    // Vector3 비교
    if (newValue.x !== undefined) {
      return newValue.x !== oldValue?.x || 
             newValue.y !== oldValue?.y || 
             newValue.z !== oldValue?.z;
    }
    
    // 기타 객체 비교
    return JSON.stringify(newValue) !== JSON.stringify(oldValue);
  }, []);

  const updateMetrics = useCallback(() => {
    const newMetrics: CameraMetrics = {
      mode: mode?.control,
      distance: cameraOption?.distance,
      fov: cameraOption?.fov,
      position: characterPosition || activeState?.position,
      velocity: characterVelocity,
      rotation: characterRotation,
      zoom: cameraOption?.zoom,
    };
    
    const hasChanged = Object.keys(newMetrics).some(
      key => checkMetricChange(
        newMetrics[key as keyof CameraMetrics],
        metricsRef.current[key as keyof CameraMetrics]
      )
    );
    
    if (hasChanged) {
      metricsRef.current = newMetrics;
      setMetrics(newMetrics);
    }
  }, [mode, cameraOption, activeState, characterPosition, characterVelocity, characterRotation, checkMetricChange]);
  
  useEffect(() => {
    updateMetrics();
    
    const intervalId = setInterval(updateMetrics, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [updateMetrics]);

  const formatValue = useCallback((value: DebugValue, precision: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && value.x !== undefined) {
      return `X:${value.x.toFixed(precision)} Y:${value.y.toFixed(precision)} Z:${value.z.toFixed(precision)}`;
    }
    if (typeof value === 'number') {
      return value.toFixed(precision);
    }
    return value.toString();
  }, []);

  return (
    <div className="cd-panel">
      <div className="cd-grid">
        {DEFAULT_DEBUG_FIELDS.map((field) => (
          <div key={field.key} className="cd-item">
            <span className="cd-label">{field.label}</span>
            <span className="cd-value">{formatValue(metrics[field.key as keyof CameraMetrics] as DebugValue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
