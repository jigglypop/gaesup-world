import React from 'react';

import type { AnimationControllerProps } from './types';
import { useAnimationBridge } from '../../hooks/useAnimationBridge';
import './styles.css';

const ANIMATION_MODES = [
  { value: 'idle', label: 'Idle' },
  { value: 'walk', label: 'Walk' },
  { value: 'run', label: 'Run' },
  { value: 'jump', label: 'Jump' },
  { value: 'fall', label: 'Fall' },
  { value: 'dance', label: 'Dance' },
  { value: 'wave', label: 'Wave' },
];

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}

export function AnimationController({
  position = 'bottom-left',
  showLabels = true,
  compact = false,
}: AnimationControllerProps = {}) {
  const { playAnimation, currentType, currentAnimation } = useAnimationBridge();
  const onAnimationChange = (animation: string) => {
    playAnimation(currentType, animation);
  };

  return (
    <div className={cx('ac-panel', `ac-panel--${position}`, compact && 'ac-panel--compact')}>
      <div className="ac-grid">
        {ANIMATION_MODES.map((animationMode) => (
          <button
            key={animationMode.value}
            className={`ac-button ${animationMode.value === currentAnimation ? 'active' : ''}`}
            onClick={() => onAnimationChange(animationMode.value)}
            title={animationMode.label}
          >
            {showLabels ? animationMode.label : animationMode.label.slice(0, 1)}
          </button>
        ))}
      </div>
    </div>
  );
}
