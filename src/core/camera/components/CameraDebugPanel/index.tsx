import { useCallback, useEffect, useRef, useState } from 'react';

import { DebugValue } from '@core/types/common';

import { CameraMetrics, DEFAULT_DEBUG_FIELDS } from './types';
import { useStateSystem } from '../../../motions/hooks/useStateSystem';
import { useGaesupStore } from '../../../stores/gaesupStore';

import './styles.css';

type Vec3Like = { x: number; y: number; z: number };
function isVec3Like(value: unknown): value is Vec3Like {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['x'] === 'number' &&
    typeof v['y'] === 'number' &&
    typeof v['z'] === 'number'
  );
}

export function CameraDebugPanel() {
  const initialMetrics: CameraMetrics = {
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: Date.now(),
    mode: 'unknown',
    activeController: 'unknown',
    distance: null,
    fov: 0,
    position: null,
    targetPosition: null,
    velocity: null,
    rotation: null,
  };
  const [metrics, setMetrics] = useState<CameraMetrics>(initialMetrics);
  const mode = useGaesupStore((state) => state.mode);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const { activeState } = useStateSystem();
  const metricsRef = useRef<CameraMetrics>(initialMetrics);
  const checkMetricChange = useCallback((
    newValue: unknown, 
    oldValue: unknown
  ): boolean => {
    if (newValue === oldValue) return false;
    
    // Vector3 비교
    if (isVec3Like(newValue)) {
      if (!isVec3Like(oldValue)) return true;
      return newValue.x !== oldValue.x ||
             newValue.y !== oldValue.y ||
             newValue.z !== oldValue.z;
    }
    
    // 기타 객체 비교
    if (typeof newValue !== 'object' || newValue === null) return true;
    return JSON.stringify(newValue) !== JSON.stringify(oldValue);
  }, []);

  const toVec3 = useCallback((value: unknown): Vec3Like | null => {
    if (!isVec3Like(value)) return null;
    return { x: value.x, y: value.y, z: value.z };
  }, []);

  const updateMetrics = useCallback(() => {
    const distance =
      cameraOption?.xDistance !== undefined &&
      cameraOption?.yDistance !== undefined &&
      cameraOption?.zDistance !== undefined
        ? {
            x: cameraOption.xDistance,
            y: cameraOption.yDistance,
            z: cameraOption.zDistance,
          }
        : null;
    const newMetrics: CameraMetrics = {
      ...metricsRef.current,
      mode: mode?.control ?? 'unknown',
      activeController: cameraOption?.mode ?? mode?.control ?? 'unknown',
      distance,
      fov: cameraOption?.fov ?? 0,
      position: toVec3(activeState?.position),
      targetPosition: toVec3(cameraOption?.target),
      velocity: toVec3(activeState?.velocity),
      rotation: toVec3(activeState?.euler),
      lastUpdateTime: Date.now(),
      ...(cameraOption?.zoom !== undefined ? { zoom: cameraOption.zoom } : {}),
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
  }, [mode, cameraOption, activeState, checkMetricChange, toVec3]);
  
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
