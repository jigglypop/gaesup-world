import { useMemo } from 'react';

import { vec3 } from '@react-three/rapier';

import { useGenericRefs } from '@hooks/useGenericRefs';
import { useKeyboard } from '@hooks/useKeyboard';

import { EntityControllerProps } from './types';
import { useGaesupStore } from '../../stores/gaesupStore';
import { PhysicsEntity } from '../entities/refs/PhysicsEntity';
import { useStateSystem } from '../hooks/useStateSystem';


export function EntityController({ props, children }: EntityControllerProps) {
  const mode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();
  const rideable = useGaesupStore((state) => state.rideable);
  const urls = useGaesupStore((state) => state.urls);
  const refs = useGenericRefs();
  
  // Initialize keyboard event listeners
  useKeyboard();
  if (!mode || !gameStates || !rideable || !urls) return null;
  const { canRide, isRiding, currentRideable } = gameStates;
  const rideableId = currentRideable?.id;
  const offset = useMemo(
    () => (rideableId ? rideable[rideableId]?.offset : undefined) ?? vec3(),
    [rideableId, rideable],
  );
  const getEntityProps = () => {
    const baseProps = {
      isActive: true,
      componentType: mode.type,
      enableRiding: canRide,
      isRiderOn: isRiding,
      offset,
      ref: refs.rigidBodyRef,
      outerGroupRef: refs.outerGroupRef,
      innerGroupRef: refs.innerGroupRef,
      colliderRef: refs.colliderRef,
      onAnimate: props.onAnimate || (() => {}),
      onFrame: props.onFrame || (() => {}),
      onReady: props.onReady || (() => {}),
      onDestory: props.onDestory || (() => {}),
      parts: (props.parts || [])
        .filter((part): part is { url: string; color?: string } => !!part.url)
        .map((part) => ({ ...part, url: part.url })),
      ...(props.rigidBodyProps ? { rigidBodyProps: props.rigidBodyProps } : {}),
      ...(props.controllerOptions ? { controllerOptions: props.controllerOptions } : {}),
      ...(props.groundRay ? { groundRay: props.groundRay } : {}),
      ...(props.position ? { position: props.position } : {}),
      ...(props.rotation ? { rotation: props.rotation } : {}),
      ...(props.scale ? { scale: props.scale } : {}),
    };

    const ridingUrl = isRiding && mode.type !== 'character' ? urls.ridingUrl : undefined;
    const ridingProps =
      typeof ridingUrl === 'string' && ridingUrl.length > 0 ? { ridingUrl } : {};

    switch (mode.type) {
      case 'character':
        return {
          ...baseProps,
          url: urls.characterUrl || '',
        };
      case 'vehicle':
        return {
          ...baseProps,
          ...ridingProps,
          url: urls.vehicleUrl || '',
          wheelUrl: urls.wheelUrl,
        };
      case 'airplane':
        return {
          ...baseProps,
          ...ridingProps,
          url: urls.airplaneUrl || '',
        };
      default:
        return {
          ...baseProps,
          url: urls.characterUrl || '',
        };
    }
  };
  const entityProps = getEntityProps();
  if (mode.type === 'character' && gameStates.isRiding) {
    return null;
  }
  return <PhysicsEntity {...entityProps}>{children}</PhysicsEntity>;
}
