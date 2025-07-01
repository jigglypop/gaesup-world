import { useEffect } from 'react';
import { useMinimap } from '@hooks/useMinimap';
import './styles.css';
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
  position = 'top-right',
  showZoom = true,
  showCompass = true,
  markers = [],
}: MinimapProps) {
  const { canvasRef, scale, upscale, downscale, handleWheel, setupWheelListener, isReady } =
    useMinimap({
      size: MINIMAP_SIZE_PX,
      initialScale,
      minScale,
      maxScale,
      blockScale,
      blockRotate,
      angle,
    });

  useEffect(() => {
    if (!blockScaleControl) {
      const cleanup = setupWheelListener();
      return cleanup;
    }
  }, [blockScaleControl, setupWheelListener]);

  const positionClass = position ? `minimap--${position}` : '';

  return (
    <div className={`minimap ${positionClass}`} style={minimapStyle}>
      <canvas
        ref={canvasRef}
        className="minimap__canvas"
        width={MINIMAP_SIZE_PX}
        height={MINIMAP_SIZE_PX}
        onWheel={handleWheel}
      />
      
      {showCompass && (
        <div className="minimap__compass">
          <div style={{ transform: `rotate(${angle}deg)` }}>
            N
          </div>
        </div>
      )}

      {markers.map((marker, index) => (
        <div
          key={marker.id || index}
          className={`minimap__marker minimap__marker--${marker.type || 'normal'}`}
          style={{
            left: `${marker.x}%`,
            top: `${marker.y}%`,
          }}
        >
          {marker.label && (
            <div className="minimap__marker-label">{marker.label}</div>
          )}
        </div>
      ))}

      {showZoom && !blockScaleControl && (
        <div className="minimap__controls" style={scaleStyle}>
          <div className="minimap__zoom-controls">
            <button
              className="minimap__control-button"
              onClick={upscale}
              disabled={scale >= maxScale}
              style={plusMinusStyle}
            >
              +
            </button>
            <button
              className="minimap__control-button"
              onClick={downscale}
              disabled={scale <= minScale}
              style={plusMinusStyle}
            >
              -
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiniMap;
