import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { minimapAtom, modeStateAtom } from '../../atoms';
import { GaesupContext } from '../../context';
import './style.css';
import { MinimapProps } from './type';
import {
  DEFAULT_SCALE,
  MIN_SCALE,
  MAX_SCALE,
  UPDATE_THRESHOLD,
  ROTATION_THRESHOLD,
  UPDATE_INTERVAL,
  MINIMAP_SIZE_PX,
  PRETENDARD_FONT,
} from '../constants';

const baseStyles = {
  minimap: {
    position: 'absolute' as const,
    bottom: '20px',
    left: '20px',
    width: `${MINIMAP_SIZE_PX}px`,
    height: `${MINIMAP_SIZE_PX}px`,
    zIndex: 100,
    cursor: 'pointer',
  },
  scale: {
    position: 'absolute' as const,
    bottom: '20px',
    left: '230px',
    zIndex: 101,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    fontFamily: PRETENDARD_FONT,
    fontWeight: '400',
    background: 'rgba(0,0,0,0.5)',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
  },
  plusMinus: {
    cursor: 'pointer',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    fontFamily: PRETENDARD_FONT,
    fontWeight: '500',
    transition: 'all 0.2s',
  },
};

const directionStyles = {
  color: 'white',
  fontSize: '1.5rem',
  fontFamily: PRETENDARD_FONT,
  fontWeight: 'bold',
};

const objectStyles = {
  background: 'rgba(0,0,0,0.3)',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
};

const avatarStyles = {
  background: '#01fff7',
  boxShadow: '0 0 10px rgba(1,255,247,0.7)',
};

const textStyles = {
  color: 'white',
  fontSize: '1rem',
  fontFamily: PRETENDARD_FONT,
  fontWeight: 'bold',
};

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
  const { activeState } = useContext(GaesupContext);
  const mode = useAtomValue(modeStateAtom);
  const [minimap] = useAtom(minimapAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scale, upscale, downscale, handleWheel, setupWheelListener } = useMinimapControls(
    initialScale,
    minScale,
    maxScale,
    blockScale,
    blockScaleControl,
  );

  const { updateCanvas } = useCanvas(activeState, minimap, mode, scale, angle, blockRotate, {
    minimapObjectStyle,
    textStyle,
    avatarStyle,
    directionStyle,
  });

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
