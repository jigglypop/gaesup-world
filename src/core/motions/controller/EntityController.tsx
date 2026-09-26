import { useMemo } from 'react';

import { vec3 } from '@react-three/rapier';

import { useGenericRefs } from '@hooks/useGenericRefs';
import { useKeyboard } from '@hooks/useKeyboard';

import { EntityControllerProps } from './types';
import { useBuildingStore } from '../../building/stores/buildingStore';
import { useGaesupStore } from '../../stores/gaesupStore';
import { PhysicsEntity } from '../entities/refs/PhysicsEntity';
import { useStateSystem } from '../hooks/useStateSystem';


export function EntityController({ props, children }: EntityControllerProps) {
  const mode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();
  const rideable = useGaesupStore((state) => state.rideable);
  const urls = useGaesupStore((state) => state.urls);
  const isInBuildingEditMode = useBuildingStore((state) => state.isInEditMode());
  const refs = useGenericRefs();

  // Initialize keyboard event listeners
  useKeyboard(true, true, undefined, props.enableKeyboard ?? true);
  const rideableId = gameStates?.currentRideable?.id;
  const offset = useMemo(
    () => (rideableId ? rideable?.[rideableId]?.offset : undefined) ?? vec3(),
    [rideableId, rideable],
  );

  if (isInBuildingEditMode) return null;
  if (!mode || !gameStates || !rideable || !urls) return null;
  // Avoid rendering PhysicsEntity until the required model URL exists.
  if (mode.type === 'character' && !urls.characterUrl) return null;
  if (mode.type === 'vehicle' && !urls.vehicleUrl) return null;
  if (mode.type === 'airplane' && !urls.airplaneUrl) return null;
  const { canRide, isRiding } = gameStates;
  const getEntityProps = () => {
    // Every prop the caller set reaches the entity; the controller owns activation, riding state and model URLs.
    const {
      enableKeyboard: _enableKeyboard,
      rigidBodyRef = refs.rigidBodyRef,
      outerGroupRef = refs.outerGroupRef,
      innerGroupRef = refs.innerGroupRef,
      colliderRef = refs.colliderRef,
      parts,
      baseColor,
      excludeBaseNodes,
      ...passThrough
    } = props;
    void _enableKeyboard;

    const baseProps = {
      ...passThrough,
      isActive: true,
      componentType: mode.type,
      enableRiding: canRide,
      isRiderOn: isRiding,
      offset,
      ref: rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      colliderRef,
      parts: (parts || [])
        .filter((part): part is { url: string; color?: string } => !!part.url)
        .map((part) => ({ ...part, url: part.url })),
      ...(typeof baseColor === 'string' && baseColor.trim().length > 0 ? { baseColor } : {}),
      ...(Array.isArray(excludeBaseNodes) && excludeBaseNodes.length > 0 ? { excludeBaseNodes } : {}),
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
