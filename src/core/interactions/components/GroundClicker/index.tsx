import { ThreeEvent } from '@react-three/fiber';

import { useClicker } from '../../../hooks/useClicker';
import type { ClickerMoveOptions } from '../../../hooks/useClicker/types';
import { useGaesupStore } from '../../../stores/gaesupStore';

export type GroundClickerProps = {
  clickerOptions?: ClickerMoveOptions;
};

export function GroundClicker({ clickerOptions }: GroundClickerProps) {
  const { onClick } = useClicker(clickerOptions);
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    const { cameraOption, setCameraOption } = useGaesupStore.getState();
    if (cameraOption?.focus) {
      setCameraOption({ focus: false });
      return;
    }

    onClick(event);
  };

  
  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handleClick}
      visible={true}
      userData={{ intangible: true }}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
} 
