import Player from "../Player";
import Environment from "../Environment";

export default function UpdateRoom() {
  return (
    <>
      <Environment />
      <Player />
      
      <group position={[3, 1, 3]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </mesh>
      </group>
      
      <group position={[-3, 1, 3]}>
        <mesh castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="yellow" wireframe />
        </mesh>
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial color="yellow" transparent opacity={0.3} />
        </mesh>
      </group>
      
      <group position={[0, 1, -3]}>
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 2, 8]} />
          <meshStandardMaterial color="purple" wireframe />
        </mesh>
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 1.9, 8]} />
          <meshStandardMaterial color="purple" transparent opacity={0.3} />
        </mesh>
      </group>
      
      <group position={[0, 0.1, 0]}>
        <mesh>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.1} />
        </mesh>
      </group>
    </>
  );
} 