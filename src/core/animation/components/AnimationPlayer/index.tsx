import React, { useState } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { AnimationType } from '../../core/types';
import { AnimationPlayerProps } from './types';
import './styles.css';

export function AnimationPlayer({
  position = 'bottom-left',
  showControls = true,
  compact = false
}: AnimationPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [weight, setWeight] = useState(1.0);
  
  const {
    mode,
    animationState,
    setCurrentAnimation
  } = useGaesupStore();

  const currentType = mode?.type as AnimationType || 'character';
  const currentAnimation = animationState?.[currentType]?.current || 'idle';
  const animationStore = animationState?.[currentType]?.store || {};
  const availableAnimations = Object.keys(animationStore);

  const handlePlay = () => {
    setCurrentAnimation(currentType, currentAnimation);
  };

  const handleStop = () => {
    setCurrentAnimation(currentType, 'idle');
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
  };

  if (!isOpen) {
    return (
      <div className={`animation-player-toggle animation-player-toggle--${position}`}>
        <button
          className="animation-player-toggle__button"
          onClick={() => setIsOpen(true)}
          title="애니메이션 플레이어"
        >
          ▶️
        </button>
      </div>
    );
  }

  return (
    <div className={`animation-player animation-player--${position} ${compact ? 'animation-player--compact' : ''}`}>
      <div className="animation-player__header">
        <span className="animation-player__title">애니메이션 플레이어</span>
        <button
          className="animation-player__close"
          onClick={() => setIsOpen(false)}
          title="닫기"
        >
          ✕
        </button>
      </div>

      <div className="animation-player__current">
        <div className="animation-player__current-info">
          <span className="animation-player__current-label">재생 중:</span>
          <span className="animation-player__current-value">{currentAnimation}</span>
        </div>
        <div className="animation-player__status">
          <span className={`animation-player__status-indicator animation-player__status-indicator--playing`}>
            ●
          </span>
        </div>
      </div>

      {showControls && (
        <div className="animation-player__controls">
          <button
            className="animation-player__control-btn animation-player__control-btn--play"
            onClick={handlePlay}
            title="재생"
          >
            ▶️
          </button>
          <button
            className="animation-player__control-btn animation-player__control-btn--stop"
            onClick={handleStop}
            title="정지"
          >
            ⏹️
          </button>
        </div>
      )}

      <div className="animation-player__settings">
        <div className="animation-player__setting">
          <label className="animation-player__setting-label">속도:</label>
          <div className="animation-player__setting-control">
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="animation-player__slider"
            />
            <span className="animation-player__setting-value">{playbackSpeed.toFixed(1)}x</span>
          </div>
        </div>

        <div className="animation-player__setting">
          <label className="animation-player__setting-label">가중치:</label>
          <div className="animation-player__setting-control">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={weight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              className="animation-player__slider"
            />
            <span className="animation-player__setting-value">{weight.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="animation-player__info">
        <div className="animation-player__info-item">
          <span>타입:</span>
          <span>{currentType}</span>
        </div>
        <div className="animation-player__info-item">
          <span>사용 가능:</span>
          <span>{availableAnimations.length}개</span>
        </div>
      </div>
    </div>
  );
}
