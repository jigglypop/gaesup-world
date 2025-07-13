import { useMemo, useEffect, useRef } from 'react';
import { vec3 } from '@react-three/rapier';
import { useGaesupStore } from '../../stores/gaesupStore';
import { PhysicsEntity } from '../entities/refs/PhysicsEntity';
import { EntityControllerProps } from './types';
import { useStateSystem } from '../hooks/useStateSystem';
import { useGenericRefs } from '@hooks/useGenericRefs';

export function EntityController({ props, children }: EntityControllerProps) {
  const mode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();
  const rideable = useGaesupStore((state) => state.rideable);
  const urls = useGaesupStore((state) => state.urls);
  const setRefs = useGaesupStore((state) => state.setRefs);
  const refs = useGenericRefs();
  const refsSetRef = useRef(false);

  useEffect(() => {
    if (setRefs && !refsSetRef.current) {
      setRefs({
        rigidBodyRef: refs.rigidBodyRef,
        colliderRef: refs.colliderRef,
        outerGroupRef: refs.outerGroupRef,
        innerGroupRef: refs.innerGroupRef,
      });
      refsSetRef.current = true;
    }
  }, [setRefs, refs]);
  if (!mode || !gameStates || !rideable || !urls) return null;
  const { canRide, isRiding, currentRideable } = gameStates;
  const rideableId = currentRideable?.id;
  const offset = useMemo(
    () => (rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()),
    [rideableId, rideable],
  );
  const getEntityProps = () => {
    const baseProps = {
      isActive: true,
      componentType: mode.type,
      controllerOptions: props.controllerOptions,
      enableRiding: canRide,
      isRiderOn: isRiding,
      groundRay: props.groundRay,
      offset,
      children,
      ref: refs.rigidBodyRef,
      outerGroupRef: refs.outerGroupRef,
      innerGroupRef: refs.innerGroupRef,
      colliderRef: refs.colliderRef,
      onAnimate: props.onAnimate || (() => {}),
      onFrame: props.onFrame || (() => {}),
      onReady: props.onReady || (() => {}),
      onDestory: props.onDestory || (() => {}),
      rigidBodyProps: props.rigidBodyProps,
      parts: (props.parts || [])
        .filter((part): part is { url: string; color?: string } => !!part.url)
        .map((part) => ({ ...part, url: part.url })),
    };

    const ridingProps =
      isRiding && mode.type !== 'character'
        ? { ridingUrl: urls.ridingUrl }
        : { ridingUrl: undefined };

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
  return <PhysicsEntity {...entityProps} groundRay={props.groundRay as any} />;
}
