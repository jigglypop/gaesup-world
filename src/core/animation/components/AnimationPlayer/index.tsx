import React, { useEffect, useState } from 'react';
import { useAnimationBridge } from '../../hooks/useAnimationBridge';
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
  const { bridge, playAnimation, stopAnimation, currentType, currentAnimation } = useAnimationBridge();
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const [progress, setProgress] = useState(30);
  
  useEffect(() => {
    if (!bridge) return;

    const updateState = () => {
      const snapshot = bridge.snapshot(currentType);
      setIsPlaying(snapshot.isPlaying);
      setAvailableAnimations(snapshot.availableAnimations);
    };

    updateState();

    const unsubscribe = bridge.subscribe((snapshot, type) => {
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
      playAnimation(currentType, currentAnimation);
    }
  };

  return (
    <div className="ap-panel">
      <div className="ap-controls">
        <select 
          className="ap-select"
          value={currentAnimation}
          onChange={(e) => playAnimation(currentType, e.target.value)}
        >
          {availableAnimations.map(anim => (
            <option key={anim} value={anim}>{anim}</option>
          ))}
        </select>
        <div className="ap-buttons">
          <button className="ap-btn" aria-label="previous animation"><SkipPreviousIcon /></button>
          <button className="ap-btn-primary" onClick={handlePlayPause} aria-label={isPlaying ? 'pause' : 'play'}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="ap-btn" aria-label="next animation"><SkipNextIcon /></button>
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
