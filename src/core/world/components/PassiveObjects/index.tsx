import { PassiveObjectProps } from './types';
import './styles.css';

export function PassiveObjects({ 
  objects, 
  selectedId, 
  onSelect, 
  showDebugInfo = false,
  enableInteraction = true
}: PassiveObjectProps) {
  return (
    <group name="passive-objects">
      {objects.map((obj) => {
        const isSelected = obj.id === selectedId;
        
        return (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
            scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
          >
            <mesh
              onClick={() => enableInteraction && onSelect?.(obj.id)}
              onPointerEnter={(e) => {
                if (enableInteraction) {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }
              }}
              onPointerLeave={() => {
                document.body.style.cursor = 'default';
              }}
            >
              {obj.type === 'building' && (
                <boxGeometry args={[2, 3, 2]} />
              )}
              {obj.type === 'tree' && (
                <>
                  <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                  <mesh position={[0, 2, 0]}>
                    <sphereGeometry args={[1.5, 8, 6]} />
                    <meshStandardMaterial color="#228833" />
                  </mesh>
                </>
              )}
              {obj.type === 'rock' && (
                <sphereGeometry args={[0.8, 6, 4]} />
              )}
              {obj.type === 'item' && (
                <boxGeometry args={[0.5, 0.5, 0.5]} />
              )}
              
              <meshStandardMaterial 
                color={isSelected ? "#ff4444" : obj.metadata?.color || "#888888"} 
                wireframe={showDebugInfo}
                transparent={obj.metadata?.opacity !== undefined}
                opacity={obj.metadata?.opacity || 1}
              />
            </mesh>

            {showDebugInfo && (
              <>
                <axesHelper args={[1]} />
                {obj.boundingBox && (
                  <boxHelper 
                    args={[obj.boundingBox]} 
                    color={isSelected ? "#ff0000" : "#00ff00"}
                  />
                )}
              </>
            )}

            {obj.metadata?.label && (
              <group position={[0, 2, 0]}>
                <sprite>
                  <spriteMaterial color="#ffffff" />
                </sprite>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

export * from './types';
