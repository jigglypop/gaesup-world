import React from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { AnimationType } from '../../core/types';
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
  const {
    mode,
    animationState,
    setCurrentAnimation
  } = useGaesupStore();

  const currentType = mode?.type as AnimationType || 'character';
  const currentAnimation = animationState?.[currentType]?.current || 'idle';

  const handleAnimationChange = (animation: string) => {
    setCurrentAnimation(currentType, animation);
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
            onClick={() => handleAnimationChange(animationMode.value)}
            title={animationMode.label}
          >
            {animationMode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
