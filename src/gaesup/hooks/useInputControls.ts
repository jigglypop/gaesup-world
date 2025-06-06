import { ThreeEvent } from '@react-three/fiber';
import { useSetAtom } from 'jotai';
import { useContext } from 'react';
import * as THREE from 'three';
import { keyboardInputAtom, pointerInputAtom } from '../atoms/inputAtom';
import { GaesupContext } from '../context';
import { V3 } from '../utils';

export function usePushKey() {
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const pushKey = (key: string, value: boolean) => {
    setKeyboardInput({
      [key]: value,
    });
  };
  return {
    pushKey,
  };
}

export function useClicker() {
  const { activeState } = useContext(GaesupContext);
  const setMouseInput = useSetAtom(pointerInputAtom);
  const moveClicker = (e: ThreeEvent<MouseEvent>, isRun: boolean, type: 'normal' | 'ground') => {
    if (type !== 'ground') return;
    const u = activeState.position;
    const v = V3(e.point.x, e.point.y, e.point.z);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    const targetY = Math.max(v.y + 0.5, 0.5);
    const targetPoint = V3(v.x, targetY, v.z);
    setMouseInput({
      target: targetPoint,
      angle: newAngle,
      isActive: true,
      shouldRun: isRun,
    });
  };
  const stopClicker = () => {
    setMouseInput({
      isActive: false,
      shouldRun: false,
    });
  };
  return {
    moveClicker,
    stopClicker,
  };
}

export function useTeleport() {
  const worldContext = useContext(GaesupContext);
  const Teleport = (position: THREE.Vector3) => {
    if (
      worldContext &&
      worldContext?.refs &&
      worldContext?.refs?.rigidBodyRef &&
      worldContext?.refs?.rigidBodyRef?.current
    )
      worldContext.refs.rigidBodyRef.current.setTranslation(position, true);
  };
  return {
    Teleport,
  };
}
