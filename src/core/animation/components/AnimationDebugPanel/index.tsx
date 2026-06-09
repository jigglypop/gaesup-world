import { useEffect, useState } from 'react';

import type { AnimationDebugPanelProps, AnimationMetrics, DebugField } from './types';
import { DEFAULT_DEBUG_FIELDS } from './types';
import { useAnimationBridge } from '../../hooks/useAnimationBridge';
import './styles.css';

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}

export function AnimationDebugPanel({
  position = 'top-right',
  fields,
  customFields,
  precision = 2,
  compact = false,
}: AnimationDebugPanelProps = {}) {
  const { bridge, currentType } = useAnimationBridge();
  const debugFields = [...(fields ?? DEFAULT_DEBUG_FIELDS), ...(customFields ?? [])];
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

      setMetrics((prevMetrics) => ({
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

  const formatValue = (
    value: AnimationMetrics[keyof AnimationMetrics] | undefined,
    format: string,
    fixedPrecision: number = precision,
  ): string => {
    if (value === null || value === undefined) return 'N/A';

    switch (format) {
      case 'array':
        return Array.isArray(value) ? `${value.length} animations` : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toFixed(fixedPrecision) : String(value);
      default:
        return String(value);
    }
  };

  const getValue = (key: string): AnimationMetrics[keyof AnimationMetrics] | undefined => {
    if (key in metrics) {
      return metrics[key as keyof AnimationMetrics];
    }
    return undefined;
  };

  return (
    <div className={cx('ad-panel', `ad-panel--${position}`, compact && 'ad-panel--compact')}>
      <div className="ad-content">
        {debugFields
          .filter((field) => field.enabled)
          .map((field: DebugField) => (
            <div key={field.key} className="ad-item">
              <span className="ad-label">{field.label}</span>
              <span className="ad-value">{formatValue(getValue(field.key), field.format)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
