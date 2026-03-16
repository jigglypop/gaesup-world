import { useMemo } from 'react';

import * as THREE from 'three';

import { useBuildingStore } from '../../stores/buildingStore';
import { TILE_CONSTANTS } from '../../types/constants';
import './styles.css';

export function PreviewTile() {
  const {
    editMode,
    hoverPosition,
    checkTilePosition,
    currentTileMultiplier,
    currentTileHeight,
    currentTileShape,
    currentTileRotation,
    currentObjectRotation,
    selectedPlacedObjectType,
  } = useBuildingStore();
  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * currentTileMultiplier;
  const effectiveHeight = currentTileShape === 'stairs' || currentTileShape === 'ramp'
    ? Math.max(1, currentTileHeight)
    : currentTileHeight;
  const topHeight = effectiveHeight * TILE_CONSTANTS.HEIGHT_STEP;
  const previewHeight = Math.max(0.12, topHeight + 0.12);
  const treeScale = THREE.MathUtils.clamp(tileSize / TILE_CONSTANTS.GRID_CELL_SIZE, 0.95, 1.85);
  const rampGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.5, 0.0, -0.5,
      0.5, 0.0, -0.5,
      -0.5, 0.0, 0.5,
      0.5, 0.0, 0.5,
      -0.5, 1.0, 0.5,
      0.5, 1.0, 0.5,
    ]);
    const indices = [
      0, 1, 3, 0, 3, 2,
      0, 1, 5, 0, 5, 4,
      0, 2, 4,
      1, 5, 3,
      2, 3, 5, 2, 5, 4,
    ];
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  
  if ((editMode !== 'tile' && editMode !== 'object') || !hoverPosition) {
    return null;
  }
  
  const isOccupied = editMode === 'tile' ? checkTilePosition(hoverPosition) : false;
  const color = isOccupied ? '#ff0000' : '#00ff00';
  
  return (
    <group position={[hoverPosition.x, hoverPosition.y, hoverPosition.z]} rotation={[0, editMode === 'object' ? currentObjectRotation : currentTileRotation, 0]}>
      {editMode === 'tile' && (
        currentTileShape === 'round' ? (
          <mesh position={[0, topHeight > 0.02 ? topHeight / 2 : -0.02, 0]}>
            <cylinderGeometry args={[tileSize / 2, tileSize / 2, topHeight > 0.02 ? topHeight : 0.04, 24]} />
            <meshStandardMaterial color={color} transparent opacity={0.45} emissive={color} emissiveIntensity={0.25} />
          </mesh>
        ) : currentTileShape === 'stairs' ? (
          <>{Array.from({ length: 4 }, (_, index) => {
            const totalHeight = Math.max(TILE_CONSTANTS.HEIGHT_STEP, topHeight);
            const stepHeight = totalHeight / 4;
            const stepDepth = tileSize / 4;
            const centerY = stepHeight * (index + 1) - stepHeight / 2;
            const localZ = -tileSize / 2 + stepDepth * index + stepDepth / 2;
            return (
              <mesh key={index} position={[0, centerY, localZ]}>
                <boxGeometry args={[tileSize, stepHeight * (index + 1), stepDepth]} />
                <meshStandardMaterial color={color} transparent opacity={0.45} emissive={color} emissiveIntensity={0.25} />
              </mesh>
            );
          })}</>
        ) : currentTileShape === 'ramp' ? (
          <mesh position={[0, 0, 0]} scale={[tileSize, Math.max(TILE_CONSTANTS.HEIGHT_STEP, topHeight), tileSize]} geometry={rampGeometry}>
            <meshStandardMaterial color={color} transparent opacity={0.45} emissive={color} emissiveIntensity={0.25} />
          </mesh>
        ) : (
          <mesh position={[0, previewHeight / 2, 0]}>
            <boxGeometry args={[tileSize, previewHeight, tileSize]} />
            <meshStandardMaterial color={color} transparent opacity={0.45} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        )
      )}

      {editMode === 'object' && (
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 16]} />
          <meshStandardMaterial color="#00ff88" transparent opacity={0.5} emissive="#00ff88" emissiveIntensity={0.3} />
        </mesh>
      )}

      {editMode === 'object' && selectedPlacedObjectType === 'sakura' && (
        <group position={[0, Math.max(topHeight, 0.04), 0]}>
          <mesh position={[0, 1.9 * treeScale, 0]}>
            <cylinderGeometry args={[0.16 * treeScale, 0.28 * treeScale, 3.8 * treeScale, 8]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.32}
              emissive={color}
              emissiveIntensity={0.15}
            />
          </mesh>
          <mesh position={[0, 4.0 * treeScale, 0]}>
            <sphereGeometry args={[1.55 * treeScale, 10, 8]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.18}
              emissive={color}
              emissiveIntensity={0.18}
            />
          </mesh>
          <mesh position={[0.95 * treeScale, 3.55 * treeScale, 0.4 * treeScale]}>
            <sphereGeometry args={[0.92 * treeScale, 8, 6]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.14}
              emissive={color}
              emissiveIntensity={0.12}
            />
          </mesh>
          <mesh position={[-0.88 * treeScale, 3.7 * treeScale, -0.55 * treeScale]}>
            <sphereGeometry args={[1.02 * treeScale, 8, 6]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.14}
              emissive={color}
              emissiveIntensity={0.12}
            />
          </mesh>
        </group>
      )}
    </group>
  );
} 