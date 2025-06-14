import { useContext, useMemo, useEffect, useRef } from 'react';
import { vec3 } from '@react-three/rapier';
import { useGaesupStore } from '../../stores/gaesupStore';
import { PhysicsEntity } from './PhysicsEntity';
import { useGenericRefs } from './useGenericRefs';
import { controllerInnerType } from '../../component/types';

interface EntityControllerProps {
  props: controllerInnerType;
  children?: React.ReactNode;
}

export function EntityController({ props, children }: EntityControllerProps) {
  const { mode, states, rideable, urls, refs: contextRefs } = useGaesupStore();
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

  if (!mode || !states || !rideable || !urls) return null;

  const { enableRiding, isRiderOn, rideableId } = states;
  const offset = useMemo(
    () => (rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()),
    [rideableId, rideable],
  );

  const getEntityProps = () => {
    const baseProps = {
      isActive: true,
      componentType: mode.type as 'character' | 'vehicle' | 'airplane',
      controllerOptions: props.controllerOptions,
      enableRiding,
      isRiderOn,
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

    switch (mode.type) {
      case 'character':
        return {
          ...baseProps,
          url: urls.characterUrl || '',
        };

      case 'vehicle':
        return {
          ...baseProps,
          url: urls.vehicleUrl || '',
          wheelUrl: urls.wheelUrl,
          ridingUrl: urls.ridingUrl,
        };

      case 'airplane':
        return {
          ...baseProps,
          url: urls.airplaneUrl || '',
          ridingUrl: urls.ridingUrl,
        };

      default:
        return {
          ...baseProps,
          url: urls.characterUrl || '',
        };
    }
  };

  const entityProps = getEntityProps();
  return <PhysicsEntity {...entityProps} groundRay={props.groundRay as any} />;
}
