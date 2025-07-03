import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

export function RidingAnimation({
  url,
  active = false
}: {
  url: string;
  active?: boolean;
}) {
  const { animations: ridingAnimations } = useGLTF(url);
  const { actions: ridingActions } = useAnimations(ridingAnimations);

  useEffect(() => {
    if (active && ridingActions.ride) {
      ridingActions.ride.reset().play();
    }
    return () => {
      if (ridingActions.ride) {
        ridingActions.ride.stop();
      }
    };
  }, [active, ridingActions]);

  return null;
} 