import { useEffect, useState } from 'react';

import type { AnimationPlayerProps } from './types';
import { useAnimationBridge } from '../../hooks/useAnimationBridge';
import './styles.css';

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);
const SkipPreviousIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);
const SkipNextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}

export function AnimationPlayer({
  position = 'bottom-left',
  showControls = true,
  compact = false,
}: AnimationPlayerProps = {}) {
  const { bridge, playAnimation, stopAnimation, currentType, currentAnimation } =
    useAnimationBridge();
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const selectedAnimation = availableAnimations.includes(currentAnimation)
    ? currentAnimation
    : availableAnimations[0] ?? '';

  useEffect(() => {
    const updateState = () => {
      const snapshot = bridge?.snapshot(currentType);
      setIsPlaying(snapshot?.isPlaying ?? false);
      setAvailableAnimations(snapshot?.availableAnimations ?? []);
    };

    updateState();
    if (!bridge) return;

    const unsubscribe = bridge.subscribe((_, type) => {
      if (type === currentType) {
        updateState();
      }
    });

    return unsubscribe;
  }, [bridge, currentType]);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAnimation(currentType);
    } else {
      if (selectedAnimation) playAnimation(currentType, selectedAnimation);
    }
  };

  const handleSkip = (offset: number) => {
    if (!availableAnimations.length) return;
    const index = availableAnimations.indexOf(selectedAnimation);
    const next = availableAnimations[(index + offset + availableAnimations.length) % availableAnimations.length];
    if (next) playAnimation(currentType, next);
  };

  return (
    <div className={cx('ap-panel', `ap-panel--${position}`, compact && 'ap-panel--compact')}>
      <div className="ap-controls">
        <select
          aria-label="애니메이션 선택"
          className="ap-select"
          value={selectedAnimation}
          disabled={!availableAnimations.length}
          onChange={(e) => playAnimation(currentType, e.target.value)}
        >
          {!availableAnimations.length && <option value="">등록된 애니메이션 없음</option>}
          {availableAnimations.map((anim) => (
            <option key={anim} value={anim}>
              {anim}
            </option>
          ))}
        </select>
        {showControls && (
          <div className="ap-buttons">
            <button type="button" className="ap-btn" aria-label="이전 애니메이션" disabled={availableAnimations.length < 2} onClick={() => handleSkip(-1)}>
              <SkipPreviousIcon />
            </button>
            <button
              type="button"
              className="ap-btn-primary"
              onClick={handlePlayPause}
              disabled={!selectedAnimation && !isPlaying}
              aria-label={isPlaying ? '애니메이션 정지' : '애니메이션 재생'}
            >
              {isPlaying ? <StopIcon /> : <PlayIcon />}
            </button>
            <button type="button" className="ap-btn" aria-label="다음 애니메이션" disabled={availableAnimations.length < 2} onClick={() => handleSkip(1)}>
              <SkipNextIcon />
            </button>
          </div>
        )}
      </div>
      {!availableAnimations.length && <p role="status">재생할 애니메이션이 아직 등록되지 않았습니다.</p>}
    </div>
  );
}
