import React from 'react';

import { useAnimationBridge } from '../../hooks/useAnimationBridge';
import './styles.css';

const ANIMATION_MODES = [
  { value: 'idle', label: 'Idle' },
  { value: 'walk', label: 'Walk' },
  { value: 'run', label: 'Run' },
  { value: 'jump', label: 'Jump' },
  { value: 'fall', label: 'Fall' },
  { value: 'dance', label: 'Dance' },
  { value: 'wave', label: 'Wave' }
];

export function AnimationController() {
  const { playAnimation, currentType, currentAnimation } = useAnimationBridge();
  const onAnimationChange = (animation: string) => {
    playAnimation(currentType, animation);
  };

  return (
    <div className="ac-panel">
      <div className="ac-grid">
        {ANIMATION_MODES.map((animationMode) => (
          <button
            key={animationMode.value}
            className={`ac-button ${
              animationMode.value === currentAnimation ? 'active' : ''
            }`}
            onClick={() => onAnimationChange(animationMode.value)}
            title={animationMode.label}
          >
            {animationMode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
