import { useEffect, useState } from 'react';

import { AnimationMetrics, DebugField } from './types';
import { DEFAULT_DEBUG_FIELDS } from './types';
import { useAnimationBridge } from '../../hooks/useAnimationBridge';
import './styles.css';

export function AnimationDebugPanel() {
  const { bridge, currentType } = useAnimationBridge();
  const [metrics, setMetrics] = useState<AnimationMetrics>({
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: Date.now(),
    currentAnimation: 'idle',
    animationType: 'character',
    availableAnimations: [],
    isPlaying: false,
    weight: 1.0,
    speed: 1.0,
    blendDuration: 0.3,
    activeActions: 0,
  });
  
  useEffect(() => {
    if (!bridge) return;
    const updateMetrics = () => {
      const snapshot = bridge.snapshot(currentType);
      if (!snapshot) return;
      const bridgeMetrics = bridge.getMetrics(currentType);
      
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        currentAnimation: snapshot.currentAnimation,
        animationType: currentType,
        availableAnimations: snapshot.availableAnimations,
        isPlaying: snapshot.isPlaying,
        weight: snapshot.weight,
        speed: snapshot.speed,
        activeActions: snapshot.metrics.activeAnimations,
        frameCount: bridgeMetrics?.totalActions || 0,
        averageFrameTime: bridgeMetrics?.mixerTime || 0,
        lastUpdateTime: Date.now(),
      }));
    };

    updateMetrics();
    
    const unsubscribe = bridge.subscribe((_, type) => {
      if (type === currentType) {
        updateMetrics();
      }
    });

    return unsubscribe;
  }, [bridge, currentType]);

  const formatValue = (value: unknown, format: string, precision: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'array':
        return Array.isArray(value) ? `${value.length} animations` : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toFixed(precision) : String(value);
      default:
        return String(value);
    }
  };

  const getValue = (key: string): unknown => {
    return (metrics as unknown as Record<string, unknown>)[key];
  };

  return (
    <div className="ad-panel">
      <div className="ad-content">
        {DEFAULT_DEBUG_FIELDS.filter(field => field.enabled).map((field: DebugField) => (
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
