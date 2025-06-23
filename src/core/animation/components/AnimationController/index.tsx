import React, { useState } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { AnimationType } from '../../core/types';
import { AnimationControllerProps } from './types';
import './styles.css';

const ANIMATION_MODES = [
  { value: 'idle', label: '대기', icon: '🧍' },
  { value: 'walk', label: '걷기', icon: '🚶' },
  { value: 'run', label: '달리기', icon: '🏃' },
  { value: 'jump', label: '점프', icon: '🦘' },
  { value: 'dance', label: '춤', icon: '💃' },
  { value: 'wave', label: '손흔들기', icon: '👋' }
];

export function AnimationController({
  position = 'top-right',
  showLabels = true,
  compact = false
}: AnimationControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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

  if (!isOpen) {
    return (
      <div className={`animation-controller-toggle animation-controller-toggle--${position}`}>
        <button
          className="animation-controller-toggle__button"
          onClick={() => setIsOpen(true)}
          title="애니메이션 컨트롤러"
        >
          🎭
        </button>
      </div>
    );
  }

  return (
    <div className={`animation-controller animation-controller--${position} ${compact ? 'animation-controller--compact' : ''}`}>
      <div className="animation-controller__header">
        {showLabels && <span className="animation-controller__title">애니메이션</span>}
        <button
          className="animation-controller__close"
          onClick={() => setIsOpen(false)}
          title="닫기"
        >
          ✕
        </button>
      </div>
      
      <div className="animation-controller__current">
        <span className="animation-controller__current-label">현재:</span>
        <span className="animation-controller__current-value">{currentAnimation}</span>
      </div>

      <div className="animation-controller__grid">
        {ANIMATION_MODES.map((animationMode) => (
          <button
            key={animationMode.value}
            className={`animation-controller__button ${
              animationMode.value === currentAnimation ? 'animation-controller__button--active' : ''
            }`}
            onClick={() => handleAnimationChange(animationMode.value)}
            title={animationMode.label}
          >
            <span className="animation-controller__icon">{animationMode.icon}</span>
            {showLabels && !compact && (
              <span className="animation-controller__label">{animationMode.label}</span>
            )}
          </button>
        ))}
      </div>

      <div className="animation-controller__info">
        <div className="animation-controller__info-item">
          <span>타입:</span>
          <span>{currentType}</span>
        </div>
      </div>
    </div>
  );
}
