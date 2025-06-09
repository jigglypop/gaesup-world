import { useEffect } from 'react';
import { useMinimap } from '../../hooks/useMinimap';
import './style.css';
import { MinimapProps } from './types';

const MINIMAP_SIZE_PX = 200;

export function MiniMap({
  scale: initialScale = 5,
  minScale = 0.5,
  maxScale = 20,
  blockScale = false,
  blockScaleControl = false,
  blockRotate = false,
  angle = 0,
  minimapStyle,
  scaleStyle,
  plusMinusStyle,
}: MinimapProps) {
  const { canvasRef, scale, upscale, downscale, handleWheel, setupWheelListener, isReady } =
    useMinimap({
      initialScale,
      minScale,
      maxScale,
      blockScale,
      blockScaleControl,
      blockRotate,
      angle,
    });

  useEffect(() => {
    return setupWheelListener();
  }, [setupWheelListener]);

  if (!isReady) {
    return (
      <div className="minimap-loading">
        <div className="minimap-loading-text">Loading minimap...</div>
      </div>
    );
  }

  return (
    <div className="minimap-container">
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE_PX}
        height={MINIMAP_SIZE_PX}
        className="minimap-canvas"
        style={{
          ...minimapStyle,
        }}
        onWheel={handleWheel}
      />
      {!blockScaleControl && (
        <div
          className="minimap-scale-controls"
          style={{
            ...scaleStyle,
          }}
        >
          <button
            className="minimap-scale-button"
            style={{
              cursor: blockScale ? 'default' : 'pointer',
              opacity: blockScale ? 0.5 : 1,
              ...plusMinusStyle,
            }}
            onClick={upscale}
            disabled={blockScale}
            aria-label="Zoom in"
          >
            +
          </button>

          <span className="minimap-scale-text">1:{Math.round(100 / scale)}</span>

          <button
            className="minimap-scale-button"
            style={{
              cursor: blockScale ? 'default' : 'pointer',
              opacity: blockScale ? 0.5 : 1,
              ...plusMinusStyle,
            }}
            onClick={downscale}
            disabled={blockScale}
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}

// Re-export marker components
export { MinimapMarker, MinimapObject, MinimapPlatform } from './MinimapMarker';
