import { useCallback, useEffect, useRef } from 'react';
import { UPDATE_THRESHOLD, ROTATION_THRESHOLD, UPDATE_INTERVAL } from '../constants';

interface ActiveState {
  position: { x: number; y: number; z: number };
  euler: { y: number };
}

export const useMinimapUpdates = (
  getCurrentState: () => ActiveState | null,
  updateCanvas: (canvasRef: React.RefObject<HTMLCanvasElement>) => void,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scale: number
) => {
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastRotationRef = useRef(0);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkForUpdates = useCallback(() => {
    const currentState = getCurrentState();
    if (!currentState) return;

    const { position, euler } = currentState;
    const rotation = euler.y;
    const lastPos = lastPositionRef.current;
    const lastRotation = lastRotationRef.current;

    const positionChanged =
      Math.abs(position.x - lastPos.x) > UPDATE_THRESHOLD ||
      Math.abs(position.z - lastPos.z) > UPDATE_THRESHOLD;

    const rotationChanged = Math.abs(rotation - lastRotation) > ROTATION_THRESHOLD;

    if (positionChanged || rotationChanged) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        updateCanvas(canvasRef);

        lastPositionRef.current = {
          x: position.x,
          y: position.y,
          z: position.z,
        };
        lastRotationRef.current = rotation;
      }, 33);
    }
  }, [getCurrentState, updateCanvas, canvasRef]);

  useEffect(() => {
    updateCanvas(canvasRef);

    intervalRef.current = setInterval(checkForUpdates, UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateCanvas, checkForUpdates, canvasRef]);

  useEffect(() => {
    updateCanvas(canvasRef);
  }, [scale, updateCanvas, canvasRef]);
}; 