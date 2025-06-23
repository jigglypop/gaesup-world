import { ObjectComponentProps } from '../types';

export function Airplane({ 
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
      <mesh>
        <boxGeometry args={[1, 0.8, 6]} />
        <meshStandardMaterial 
          color={selected ? "#ff4444" : "#88ccff"} 
          wireframe={showDebugInfo}
        />
      </mesh>
      
      <mesh position={[0, 0, 2]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshStandardMaterial 
          color={selected ? "#ff2222" : "#66aadd"} 
          wireframe={showDebugInfo}
        />
      </mesh>
      
      <mesh position={[-3, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.2, 0.1, 3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[3, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.2, 0.1, 3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      <mesh position={[0, 1, -2]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 1.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {showDebugInfo && (
        <>
          <axesHelper args={[3]} />
          {object.boundingBox && (
            <boxHelper args={[object.boundingBox]} color="#00ff00" />
          )}
        </>
      )}
    </group>
  );
}
