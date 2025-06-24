import { useEffect } from 'react';
import { useRideable } from '@hooks/useRideable';
import { useGaesupStore } from '@stores/gaesupStore';
import { RideableUIProps, RideablePropType, RideableObject } from './types';
import './styles.css';
import React from 'react';

export function RideableUI({ states }: RideableUIProps) {
  if (!states) {
    return null;
  }

  if (!states.canRide && !states.isRiding) {
    return null;
  }

  const rideMessage = states.nearbyRideable?.rideMessage ?? 'Press R to ride';
  const exitMessage = 'Press R to exit';

  return (
    <div className="rideable-ui">
      {states.canRide && !states.isRiding && (
        <div className="rideable-prompt">
          <div className="rideable-prompt__message">{rideMessage}</div>
          <div className="rideable-prompt__key">R</div>
        </div>
      )}
      
      {states.isRiding && (
        <div className="rideable-controls">
          <div className="rideable-controls__exit">
            <div className="rideable-controls__message">{exitMessage}</div>
            <div className="rideable-controls__key">R</div>
          </div>
          
          {states.currentRideable && (
            <div className="rideable-controls__info">
              <div className="rideable-info">
                <div className="rideable-info__name">
                  {states.currentRideable.metadata?.name || 'Vehicle'}
                </div>
                <div className="rideable-info__stats">
                  <div className="stat">
                    <span className="stat__label">Speed:</span>
                    <span className="stat__value">
                      {Math.round(states.currentRideable.speed || 0)}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat__label">Max:</span>
                    <span className="stat__value">
                      {Math.round(states.currentRideable.maxSpeed || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RideableObjects({ 
  objects, 
  onRide, 
  onExit, 
  showDebugInfo = false 
}: {
  objects: RideableObject[];
  onRide?: (objectId: string) => void;
  onExit?: (objectId: string) => void;
  showDebugInfo?: boolean;
}) {
  return (
    <group name="rideable-objects">
      {objects.map((obj) => {
        const isOccupied = obj.isOccupied;
        
        return (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
            scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
          >
            <mesh
              onClick={() => !isOccupied && onRide?.(obj.id)}
              onPointerEnter={(e) => {
                if (!isOccupied) {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }
              }}
              onPointerLeave={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <boxGeometry args={[2, 1, 4]} />
              <meshStandardMaterial 
                color={isOccupied ? "#666666" : "#4488ff"} 
                wireframe={showDebugInfo}
                transparent
                opacity={isOccupied ? 0.5 : 1}
              />
            </mesh>

            {showDebugInfo && (
              <>
                <axesHelper args={[2]} />
                {obj.boundingBox && (
                  <boxHelper 
                    args={[obj.boundingBox]} 
                    color={isOccupied ? "#ff0000" : "#00ff00"}
                  />
                )}
              </>
            )}

            {!isOccupied && (
              <group position={[0, 2, 0]}>
                <sprite scale={[2, 0.5, 1]}>
                  <spriteMaterial color="#ffffff" opacity={0.8} />
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
