import { type CSSProperties } from 'react';

import {
  playCameraCinematic,
  requestCameraCloseUp,
  restoreCameraCloseUp,
  useStateSystem,
} from 'gaesup-world';

const buttonStyle: CSSProperties = {
  minHeight: 32,
  padding: '0 10px',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 6,
  background: 'rgba(18,20,28,0.84)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 800,
};

const activeButtonStyle: CSSProperties = {
  background: 'rgba(125,220,131,0.22)',
};

const panelStyle: CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 84,
  zIndex: 85,
  display: 'flex',
  gap: 8,
  pointerEvents: 'auto',
};

export function CloseUpControls() {
  const { activeState } = useStateSystem();

  const closeUpPlayer = () => {
    const target = activeState.position.clone();
    target.y += 1.25;
    requestCameraCloseUp(target, {
      focusDistance: 3.8,
      focusLerpSpeed: 7.5,
      fov: 42,
      enableCollision: false,
    });
  };

  const playPreview = () => {
    const head = activeState.position.clone();
    head.y += 1.25;
    const forward = head.clone();
    forward.z -= 2;
    const left = head.clone();
    left.x -= 1.2;
    void playCameraCinematic([
      { kind: 'closeUp', target: head, durationMs: 620, focusDistance: 4.2, focusLerpSpeed: 7.5, fov: 44 },
      { kind: 'dolly', target: forward, fromDistance: 6.8, toDistance: 3.8, durationMs: 720, focusLerpSpeed: 8, fov: 40 },
      { kind: 'shake', intensity: 0.04, durationMs: 120 },
      { kind: 'orbit', target: left, radius: 5.2, angleDeg: 38, height: 0.35, durationMs: 700, focusLerpSpeed: 7, fov: 48 },
      { kind: 'event', name: 'examples:cinematic-complete', payload: { source: 'CloseUpControls' }, durationMs: 20 },
      { kind: 'restore' },
    ]).finished;
  };

  return (
    <div style={panelStyle}>
      <button style={buttonStyle} type="button" onClick={closeUpPlayer}>
        확대
      </button>
      <button style={{ ...buttonStyle, ...activeButtonStyle }} type="button" onClick={() => restoreCameraCloseUp()}>
        확대 해제
      </button>
      <button style={buttonStyle} type="button" onClick={playPreview}>
        연출
      </button>
    </div>
  );
}
