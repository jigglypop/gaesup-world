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
    <div className={`minimap-container ${positionClass}`} style={minimapStyle}>
      <div className="minimap-wrapper">
        <canvas
          ref={canvasRef}
          className="minimap-canvas"
          width={MINIMAP_SIZE_PX}
          height={MINIMAP_SIZE_PX}
          onWheel={handleWheel}
        />
        
        {showCompass && (
          <div className="minimap-compass">
            <div className="compass-needle" style={{ transform: `rotate(${angle}deg)` }}>
              ↑
            </div>
          </div>
        )}

        {markers.map((marker, index) => (
          <div
            key={marker.id || index}
            className={`minimap-marker minimap-marker--${marker.type}`}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={marker.label}
          >
            {marker.icon || '●'}
          </div>
        ))}
      </div>

      {showZoom && !blockScaleControl && (
        <div className="minimap-controls" style={scaleStyle}>
          <button
            className="minimap-button"
            onClick={upscale}
            disabled={scale >= maxScale}
            style={plusMinusStyle}
          >
            +
          </button>
          <span className="minimap-scale">{scale.toFixed(1)}x</span>
          <button
            className="minimap-button"
            onClick={downscale}
            disabled={scale <= minScale}
            style={plusMinusStyle}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}

export default MiniMap;
