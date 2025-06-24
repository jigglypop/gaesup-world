import React, { useState } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { AnimationType } from '../../core/types';
import './styles.css';

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);
const SkipPreviousIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
);
const SkipNextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
);

export function AnimationPlayer() {
  const { mode, animationState, setCurrentAnimation } = useGaesupStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(30);

  const currentType = mode?.type as AnimationType || 'character';
  const currentAnimation = animationState?.[currentType]?.current || 'idle';
  const animationStore = animationState?.[currentType]?.store || {};
  const availableAnimations = Object.keys(animationStore);

  return (
    <div className="ap-panel">
      <div className="ap-controls">
        <select 
          className="ap-select"
          value={currentAnimation}
          onChange={(e) => setCurrentAnimation(currentType, e.target.value)}
        >
          {availableAnimations.map(anim => (
            <option key={anim} value={anim}>{anim}</option>
          ))}
        </select>
        <div className="ap-buttons">
          <button className="ap-btn"><SkipPreviousIcon /></button>
          <button className="ap-btn-primary" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="ap-btn"><SkipNextIcon /></button>
        </div>
      </div>
      <div className="ap-timeline">
        <span className="ap-time">0:00</span>
        <input 
          type="range" 
          className="ap-slider"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
        <span className="ap-time">1:30</span>
      </div>
    </div>
  );
}
