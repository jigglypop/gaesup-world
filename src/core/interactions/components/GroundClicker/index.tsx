import { ThreeEvent } from '@react-three/fiber';

import { useClicker } from '../../../hooks/useClicker';
import type { ClickerMoveOptions } from '../../../hooks/useClicker/types';
import { useGaesupStoreApi } from '../../../stores/gaesupStore';

export type GroundClickerProps = {
  clickerOptions?: ClickerMoveOptions;
};

/** Pixels a press may travel and still count as a click; past that it was a drag. */
const CLICK_SLOP = 4;

export function GroundClicker({ clickerOptions }: GroundClickerProps) {
  const storeApi = useGaesupStoreApi();
  const { onClick } = useClicker(clickerOptions);
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Only a primary click moves: drags orbit the camera. Modifier clicks are reserved for tools layered behind this
    // plane (e.g. <TeleportOnClick modifierKey="altKey" />) — let them pass through.
    if (
      event.nativeEvent.button !== 0 ||
      event.delta > CLICK_SLOP ||
      event.nativeEvent.altKey ||
      event.nativeEvent.ctrlKey ||
      event.nativeEvent.metaKey ||
      event.nativeEvent.shiftKey
    ) {
      return;
    }
    event.stopPropagation();

    const { cameraOption, setCameraOption } = storeApi.getState();
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
      onClick={handleClick}
      visible={true}
      userData={{ intangible: true }}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  );
} 
