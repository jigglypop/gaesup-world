import { ThreeEvent } from '@react-three/fiber';

import { useClicker } from '../../../hooks/useClicker';

export function GroundClicker() {
  const { onClick } = useClicker();
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Stop propagation to prevent clicking through objects
    event.stopPropagation();
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