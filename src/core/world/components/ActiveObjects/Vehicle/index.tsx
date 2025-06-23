import { ObjectComponentProps } from '../types';

export function Vehicle({ 
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
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial 
          color={selected ? "#ff4444" : "#4488ff"} 
          wireframe={showDebugInfo}
        />
      </mesh>
      
      <mesh position={[0, 0.5, 1.5]}>
        <boxGeometry args={[1.8, 0.8, 0.5]} />
        <meshStandardMaterial 
          color={selected ? "#ff2222" : "#3366dd"} 
          wireframe={showDebugInfo}
        />
      </mesh>
      
      <mesh position={[-0.8, -0.3, 1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.8, -0.3, 1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.8, -0.3, -1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.8, -0.3, -1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {showDebugInfo && (
        <>
          <axesHelper args={[2]} />
          {object.boundingBox && (
            <boxHelper args={[object.boundingBox]} color="#00ff00" />
          )}
        </>
      )}
    </group>
  );
}
