import { useContext } from 'react';
import * as THREE from 'three';
import { GaesupWorldContext } from '../../world/context';

export function useTeleport() {
  const worldContext = useContext(GaesupWorldContext);
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
