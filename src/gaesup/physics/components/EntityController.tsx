import { useContext, useMemo, useEffect, useRef } from 'react';
import { vec3 } from '@react-three/rapier';
import { useGaesupContext, useGaesupDispatch } from '../../atoms';
import { PhysicsEntity } from './PhysicsEntity';
import { useGenericRefs } from './useGenericRefs';
import { controllerInnerType } from '../types';

interface EntityControllerProps {
  props: controllerInnerType;
  children?: React.ReactNode;
}

export function EntityController({ props, children }: EntityControllerProps) {
  const { mode, states, rideable, urls } = useGaesupContext();
  const dispatch = useGaesupDispatch();
  const refs = useGenericRefs();
  const refsSetRef = useRef(false);

  useEffect(() => {
    if (dispatch && !refsSetRef.current) {
      dispatch({
        type: 'update',
        payload: {
          refs: {
            rigidBodyRef: refs.rigidBodyRef,
            colliderRef: refs.colliderRef,
            outerGroupRef: refs.outerGroupRef,
            innerGroupRef: refs.innerGroupRef,
          },
        },
      });
      refsSetRef.current = true;
    }
  }, [dispatch]);

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
      onAnimate: props.onAnimate,
      onFrame: props.onFrame,
      onReady: props.onReady,
      onDestory: props.onDestory,
      rigidBodyProps: props.rigidBodyProps,
      parts: props.parts,
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
  return <PhysicsEntity {...entityProps} />;
}
