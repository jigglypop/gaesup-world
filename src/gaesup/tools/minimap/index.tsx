import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { minimapAtom, modeStateAtom } from '../../atoms';
import { GaesupWorldContext } from '../../world/context';
import {
  avatarStyles,
  baseStyles,
  directionStyles,
  objectStyles,
  textStyles,
} from './style.css';
import { MinimapProps } from './type';
import {
  DEFAULT_SCALE,
  MIN_SCALE,
  MAX_SCALE,
  UPDATE_THRESHOLD,
  ROTATION_THRESHOLD,
  UPDATE_INTERVAL,
  MINIMAP_SIZE_PX,
} from '../constants';
import { useCanvas } from './useCanvas';
import { useMinimapControls } from './useMinimapControls';
import { useMinimapUpdates } from './useMinimapUpdates';

export function MiniMap({
  scale: initialScale = DEFAULT_SCALE,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
  blockScale = false,
  blockScaleControl = false,
  blockRotate = false,
  angle = 0,
  minimapStyle,
  textStyle,
  minimapObjectStyle,
  avatarStyle,
  scaleStyle,
  directionStyle,
  plusMinusStyle,
}: MinimapProps) {
  const { activeState } = useContext(GaesupWorldContext);
  const mode = useAtomValue(modeStateAtom);
  const [minimap] = useAtom(minimapAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    scale,
    upscale,
    downscale,
    handleWheel,
    setupWheelListener,
  } = useMinimapControls(initialScale, minScale, maxScale, blockScale, blockScaleControl);

  const { updateCanvas } = useCanvas(
    activeState,
    minimap,
    mode,
    scale,
    angle,
    blockRotate,
    {
      minimapObjectStyle,
      textStyle,
      avatarStyle,
      directionStyle,
    }
  );

  const getCurrentState = useCallback(() => {
    if (!activeState?.position) return null;
    return {
      position: activeState.position,
      euler: activeState.euler,
    };
  }, [activeState]);

  useMinimapUpdates(getCurrentState, updateCanvas, canvasRef, scale);

  useEffect(() => {
    return setupWheelListener(canvasRef);
  }, [setupWheelListener]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE_PX}
        height={MINIMAP_SIZE_PX}
        style={{
          ...baseStyles.minimap,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          ...minimapStyle,
        }}
        onWheel={handleWheel}
      />
      {!blockScaleControl && (
        <div
          style={{
            ...baseStyles.scale,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '15px',
            padding: '8px 12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            ...scaleStyle,
          }}
        >
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...plusMinusStyle,
            }}
            onClick={upscale}
          >
            +
          </div>
          <span
            style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            }}
          >
            1:{Math.round(100 / scale)}
          </span>
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...plusMinusStyle,
            }}
            onClick={downscale}
          >
            -
          </div>
        </div>
      )}
    </div>
  );
}

export { MinimapMarker, MinimapObject, MinimapPlatform } from './MinimapMarker';
