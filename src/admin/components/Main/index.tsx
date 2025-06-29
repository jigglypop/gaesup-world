import Player from "../Player";
import Environment from "../Environment";

export default function Main() {
  return (
    <>
      <Environment />
      <Player />
      
      <group position={[5, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
      
      <group position={[-5, 1, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>
      
      <group position={[0, 1, 5]}>
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 2, 8]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </group>
    </>
  );
} 