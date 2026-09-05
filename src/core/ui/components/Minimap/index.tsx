import { MinimapProps } from './types';
import { useMinimap } from '../../hooks';
import './styles.css';

const MINIMAP_SIZE_PX = 200;

export function MiniMap({
  size = MINIMAP_SIZE_PX,
  updateInterval = 33,
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
  const { canvasRef, scale, upscale, downscale, handleWheel } =
    useMinimap({
      size,
      updateInterval,
      initialScale,
      minScale,
      maxScale,
      blockScale,
      blockRotate,
      angle,
    });
  const positionClass = position ? `minimap--${position}` : '';

  return (
    <div className={`minimap ${positionClass}`} style={{ width: size, height: size, ...minimapStyle }}>
      <canvas
        ref={canvasRef}
        className="minimap__canvas"
        aria-label="주변 지도"
        width={size}
        height={size}
        onWheel={handleWheel}
      />
      
      {showCompass && (
        <div className="minimap__compass">
          <div style={{ transform: `rotate(${angle}deg)` }}>
            북
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
              type="button"
              aria-label="지도 확대"
              onClick={upscale}
              disabled={scale >= maxScale}
              style={plusMinusStyle}
            >
              +
            </button>
            <button
              className="minimap__control-button"
              type="button"
              aria-label="지도 축소"
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
