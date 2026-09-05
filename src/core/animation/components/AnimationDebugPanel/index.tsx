import { useEffect, useState } from 'react';

import type { AnimationDebugPanelProps, AnimationMetrics, DebugField } from './types';
import { DEFAULT_DEBUG_FIELDS } from './types';
import { useAnimationBridge } from '../../hooks/useAnimationBridge';
import './styles.css';

const METRICS_INTERVAL_MS = 250;

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

      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        currentAnimation: snapshot.currentAnimation,
        animationType: currentType,
        availableAnimations: snapshot.availableAnimations,
        isPlaying: snapshot.isPlaying,
        weight: snapshot.weight,
        speed: snapshot.speed,
        activeActions: snapshot.metrics.activeAnimations,
        lastUpdateTime: Date.now(),
      }));
    };

    updateMetrics();

    let dirty = false;
    const unsubscribe = bridge.subscribe((_, type) => {
      if (type === currentType) {
        dirty = true;
      }
    });
    const timer = window.setInterval(() => {
      if (!dirty) return;
      dirty = false;
      updateMetrics();
    }, METRICS_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [bridge, currentType]);

  const formatValue = (
    value: AnimationMetrics[keyof AnimationMetrics] | undefined,
    format: string,
    fixedPrecision: number = precision,
  ): string => {
    if (value === null || value === undefined) return '정보 없음';
    if (typeof value === 'boolean') return value ? '재생 중' : '정지';

    switch (format) {
      case 'array':
        return Array.isArray(value) ? `${value.length}개` : String(value);
      case 'number':
        return typeof value === 'number' ? value.toFixed(fixedPrecision) : String(value);
      default:
        return String(value);
    }
  };

  const getValue = (key: string): AnimationMetrics[keyof AnimationMetrics] | undefined => {
    if (key === 'frameCount' || key === 'averageFrameTime' || key === 'blendDuration') return undefined;
    if (key === 'animationType') {
      return metrics.animationType === 'vehicle' ? '차량' : metrics.animationType === 'airplane' ? '비행기' : '캐릭터';
    }
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
