import { ObjectComponentProps } from '../types';

export function Character({ 
  object, 
  selected = false, 
  onSelect, 
  showDebugInfo = false 
}: ObjectComponentProps) {
  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      onClick={() => onSelect?.(object.id)}
    >
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial 
          color={selected ? "#ff4444" : "#ffcc88"} 
          wireframe={showDebugInfo}
        />
      </mesh>
      
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial 
          color={selected ? "#ff2222" : "#4488ff"} 
          wireframe={showDebugInfo}
        />
      </mesh>
      
      <mesh position={[-0.35, -0.1, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      <mesh position={[0.35, -0.1, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      
      <mesh position={[-0.25, -0.8, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      <mesh position={[0.25, -0.8, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      
      <mesh position={[-0.25, -1.3, 0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.25, -1.3, 0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {showDebugInfo && (
        <>
          <axesHelper args={[1]} />
          {object.boundingBox && (
            <boxHelper args={[object.boundingBox]} color="#00ff00" />
          )}
        </>
      )}
    </group>
  );
}
