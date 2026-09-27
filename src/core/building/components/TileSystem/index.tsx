import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { BoxTileBatchMesh, getBoxTileBatchKey, isRaisedTile, type BoxTileBatch } from './batch';
import { createTileColliders, getRampLayout, getStairLayout, getTileShape } from './layout';
import { buildTerrainGeometry, createTileSupport, shouldCloseStairBack, type TileSupport } from './terrain';
import { TileSystemProps } from './types';
import { buildWaterPatches } from './waterPatches';
import { getDefaultToonMode, getToonGradient } from '../../../rendering/toon';
import { rendererKind } from '../../../rendering/webgpu';
import { MinimapSystem } from '../../../ui/core';
import { WorldProps } from '../../../world/components/WorldProps';
import { MaterialManager } from '../../core/MaterialManager';
import { tileWorldSize } from '../../model/footprint';
import { coverSpreads } from '../../terrain/dirt';
import { BuildingColliderBody } from '../BuildingColliders';
import type { BuildingColliderBox } from '../BuildingColliders/types';
import { EditOverlay } from '../EditOverlay';
import { tileEditItem, type EditOverlayItem } from '../EditOverlay/items';
import { DirtCover } from '../mesh/dirt';
import { GrassChunks } from '../mesh/grass/chunks';
import { SandBatch, type SandEntry } from '../mesh/sand';
import { SnowfieldBatch, type SnowfieldEntry } from '../mesh/snowfield';
import Water from '../mesh/water';

type TileLike = TileSystemProps['tileGroup']['tiles'][number];

const EMPTY_COLLIDER_BOXES: readonly BuildingColliderBox[] = [];
const NO_EDIT_ITEMS: EditOverlayItem[] = [];
const NO_BATCHES: BoxTileBatch[] = [];

const WATER_LOD = { near: 25, far: 90, strength: 4 } as const;

function getTileMaterialId(tile: TileLike, fallbackId: string): string {
  return tile.materialId ?? fallbackId;
}

function pushGeometryQuad(
  positions: number[],
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
) {
  positions.push(
    a[0], a[1], a[2],
    b[0], b[1], b[2],
    c[0], c[1], c[2],
    a[0], a[1], a[2],
    c[0], c[1], c[2],
    d[0], d[1], d[2],
  );
}

function buildStairGeometry(tile: TileLike, closeBack: boolean): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const { tileSize, stepCount, stepHeight, stepDepth, totalHeight } = getStairLayout(tile);
  const half = tileSize / 2;

  for (let i = 0; i < stepCount; i++) {
    const z0 = -half + i * stepDepth;
    const z1 = z0 + stepDepth;
    const topY = stepHeight * (i + 1);
    const prevY = stepHeight * i;

    pushGeometryQuad(
      positions,
      [-half, topY, z0],
      [-half, topY, z1],
      [half, topY, z1],
      [half, topY, z0],
    );

    pushGeometryQuad(
      positions,
      [-half, prevY, z0],
      [-half, topY, z0],
      [half, topY, z0],
      [half, prevY, z0],
    );

    pushGeometryQuad(
      positions,
      [-half, 0, z0],
      [-half, 0, z1],
      [-half, topY, z1],
      [-half, topY, z0],
    );

    pushGeometryQuad(
      positions,
      [half, 0, z1],
      [half, 0, z0],
      [half, topY, z0],
      [half, topY, z1],
    );
  }

  if (closeBack) {
    pushGeometryQuad(
      positions,
      [-half, 0, half],
      [half, 0, half],
      [half, totalHeight, half],
      [-half, totalHeight, half],
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function StairTileMesh({
  tile,
  material,
  support,
}: {
  tile: TileLike;
  material: THREE.Material;
  support: TileSupport;
}) {
  const rotation = tile.rotation ?? 0;
  const closeBack = useMemo(() => shouldCloseStairBack(tile, support), [support, tile]);
  const geometry = useMemo(() => buildStairGeometry(tile, closeBack), [tile, closeBack]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      position={[tile.position.x, 0, tile.position.z]}
      rotation={[0, rotation, 0]}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
}

/** Memoized: a building re-render for another group, a selection or a new mesh it does not use leaves it alone. */
export const TileSystem = memo(function TileSystem({
  tileGroup,
  meshes,
  isEditMode = false,
  selectedTileId = null,
  onTileClick,
  colliders = true,
  batches = true,
}: TileSystemProps) {
  const [materialManager] = useState(() => new MaterialManager());
  const floorMesh = meshes.get(tileGroup.floorMeshId);
  const localMaterialRef = useRef<THREE.Material | null>(null);

  const boxTiles = useMemo(
    () => tileGroup.tiles.filter((tile) => getTileShape(tile) === 'box'),
    [tileGroup.tiles],
  );
  const stairTiles = useMemo(
    () => tileGroup.tiles.filter((tile) => getTileShape(tile) === 'stairs'),
    [tileGroup.tiles],
  );
  const rampTiles = useMemo(
    () => tileGroup.tiles.filter((tile) => getTileShape(tile) === 'ramp'),
    [tileGroup.tiles],
  );
  const roundTiles = useMemo(
    () => tileGroup.tiles.filter((tile) => getTileShape(tile) === 'round'),
    [tileGroup.tiles],
  );

  const defaultMaterial = useMemo(() => {
    if (!floorMesh) {
      // Dispose the previous local material, when present, before creating a new one.
      localMaterialRef.current?.dispose();
      const m = getDefaultToonMode()
        ? new THREE.MeshToonMaterial({ color: '#888888', gradientMap: getToonGradient(4) })
        : new THREE.MeshStandardMaterial({ color: '#888888' });
      localMaterialRef.current = m;
      return m;
    }
    // If we switch from local -> managed material, ensure we don't leak the local one.
    localMaterialRef.current?.dispose();
    localMaterialRef.current = null;
    return materialManager.getMaterial(floorMesh);
  }, [floorMesh, materialManager]);

  const materialById = useMemo(() => {
    const materials = new Map<string, THREE.Material>();
    materials.set(tileGroup.floorMeshId, defaultMaterial);
    for (const tile of tileGroup.tiles) {
      if (!tile.materialId || materials.has(tile.materialId)) continue;
      const mesh = meshes.get(tile.materialId);
      materials.set(tile.materialId, mesh ? materialManager.getMaterial(mesh) : defaultMaterial);
    }
    return materials;
  }, [defaultMaterial, materialManager, meshes, tileGroup.floorMeshId, tileGroup.tiles]);

  // Inside BuildingSystem the world-level batches draw box tiles; a group builds its own only when it draws them.
  const boxTileBatches = useMemo<BoxTileBatch[]>(() => {
    if (!batches) return NO_BATCHES;
    const byKey = new Map<string, BoxTileBatch>();
    for (const tile of boxTiles) {
      const materialId = getTileMaterialId(tile, tileGroup.floorMeshId);
      const key = getBoxTileBatchKey(materialId, tile);
      let batch = byKey.get(key);
      if (!batch) {
        const material = materialById.get(materialId) ?? defaultMaterial;
        batch = { key, tiles: [], material, castShadow: isRaisedTile(tile) };
        byKey.set(key, batch);
      }
      batch.tiles.push(tile);
    }
    return [...byKey.values()];
  }, [batches, boxTiles, defaultMaterial, materialById, tileGroup.floorMeshId]);

  // Keyed by the color alone, so adding or editing another mesh does not rebuild the terrain sides.
  const floorColor = floorMesh?.color;
  const terrainColor = useMemo(() => new THREE.Color(floorColor || '#8a806f'), [floorColor]);

  const grassMeshOf = useCallback(
    (tile: TileLike) => meshes.get(getTileMaterialId(tile, tileGroup.floorMeshId)),
    [meshes, tileGroup.floorMeshId],
  );
  // On node renderers tall grass on a grass-growing mesh keeps that surface, so its edges get no meadow lip.
  const nodeRenderer = useThree((state) => rendererKind(state.gl) !== 'webgl');
  const keepsSurface = useCallback((tile: TileLike) => nodeRenderer && Boolean(grassMeshOf(tile)?.grass), [nodeRenderer, grassMeshOf]);
  const support = useMemo(() => createTileSupport(tileGroup.tiles, keepsSurface), [tileGroup.tiles, keepsSurface]);
  const terrain = useMemo(
    () => buildTerrainGeometry(boxTiles, support, terrainColor, keepsSurface),
    [boxTiles, support, terrainColor, keepsSurface],
  );

  const sideMaterial = useMemo(
    () =>
      getDefaultToonMode()
        ? new THREE.MeshToonMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            gradientMap: getToonGradient(4),
          })
        : new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.98,
            metalness: 0.02,
            side: THREE.DoubleSide,
          }),
    [],
  );

  const rockGeometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
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
  const rockMaterial = useMemo(
    () =>
      getDefaultToonMode()
        ? new THREE.MeshToonMaterial({
            color: '#71695f',
            gradientMap: getToonGradient(3),
          })
        : new THREE.MeshStandardMaterial({
            color: '#71695f',
            roughness: 1,
            metalness: 0.02,
          }),
    [],
  );

  const baseGeometry = useMemo(() => {
    // A single unit plane; per-tile size/position is applied via instancing.
    const geom = new THREE.PlaneGeometry(1, 1, 1, 1);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const rockRef = useRef<THREE.InstancedMesh>(null!);

  const editItems = useMemo(
    () => (isEditMode ? tileGroup.tiles.map(tileEditItem) : NO_EDIT_ITEMS),
    [isEditMode, tileGroup.tiles],
  );

  const sandTiles = useMemo(
    () => tileGroup.tiles.filter((t) => getTileShape(t) === 'box' && t.objectType === 'sand'),
    [tileGroup.tiles],
  );

  const sandEntries: SandEntry[] = useMemo(
    () => sandTiles.map((t) => ({
      position: [t.position.x, t.position.y, t.position.z] as [number, number, number],
      size: tileWorldSize(t),
      ...(t.objectConfig?.terrainColor ? { color: t.objectConfig.terrainColor } : {}),
      ...(t.objectConfig?.terrainAccentColor ? { accentColor: t.objectConfig.terrainAccentColor } : {}),
    })),
    [sandTiles],
  );

  // Dirt paths, beaches and snowfields with the flat tiles their soft edges spread onto.
  const spreads = useMemo(() => coverSpreads(tileGroup.tiles), [tileGroup.tiles]);

  const snowfieldTiles = useMemo(
    () => tileGroup.tiles.filter((t) => getTileShape(t) === 'box' && t.objectType === 'snowfield'),
    [tileGroup.tiles],
  );

  const snowfieldEntries: SnowfieldEntry[] = useMemo(
    () => snowfieldTiles.map((t) => ({
      position: [t.position.x, t.position.y, t.position.z] as [number, number, number],
      size: tileWorldSize(t),
      ...(t.objectConfig?.terrainColor ? { color: t.objectConfig.terrainColor } : {}),
      ...(t.objectConfig?.terrainAccentColor ? { accentColor: t.objectConfig.terrainAccentColor } : {}),
    })),
    [snowfieldTiles],
  );

  // Tall-grass tiles, and on node renderers every box tile whose mesh grows a grass layer.
  const grassTiles = useMemo(
    () => tileGroup.tiles.filter((t) => getTileShape(t) === 'box' && (t.objectType === 'grass' || grassMeshOf(t)?.grass)),
    [tileGroup.tiles, grassMeshOf],
  );

  // water shore mask 계산은 인접한 water 타일만 알면 충분하므로
  // 전체 tileGroup.tiles 대신 미리 필터링한 배열을 TileObject 에 전달한다.
  // 이로써 (water 타일 수) × (전체 타일 수) 였던 비용이 (water 타일 수)^2 로 줄어든다.
  const waterTiles = useMemo(
    () => tileGroup.tiles.filter((t) => getTileShape(t) === 'box' && t.objectType === 'water'),
    [tileGroup.tiles],
  );

  const waterPatches = useMemo(
    () => buildWaterPatches(waterTiles),
    [waterTiles],
  );

  const colliderBoxes = useMemo(
    () => (colliders ? createTileColliders(tileGroup.tiles) : EMPTY_COLLIDER_BOXES),
    [colliders, tileGroup.tiles],
  );

  useLayoutEffect(() => {
    const mesh = rockRef.current;
    if (mesh && terrain.rocks.length > 0) {
      mesh.count = terrain.rocks.length;
      for (let i = 0; i < terrain.rocks.length; i++) {
        const rock = terrain.rocks[i]!;
        dummy.position.set(rock.position[0], rock.position[1], rock.position[2]);
        dummy.rotation.set(rock.rotation[0], rock.rotation[1], rock.rotation[2]);
        dummy.scale.set(rock.scale[0], rock.scale[1], rock.scale[2]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [terrain.rocks, dummy]);

  useEffect(() => {
    if (tileGroup.tiles.length === 0) return undefined;
    const engine = MinimapSystem.getInstance();
    const bounds = new THREE.Box3();
    const tmp = new THREE.Vector3();
    
    tileGroup.tiles.forEach((tile) => {
      const tileSize = tileWorldSize(tile);
      const halfSize = tileSize / 2;
      
      tmp.set(tile.position.x - halfSize, tile.position.y, tile.position.z - halfSize);
      bounds.expandByPoint(tmp);
      tmp.set(tile.position.x + halfSize, tile.position.y, tile.position.z + halfSize);
      bounds.expandByPoint(tmp);
    });
    
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bounds.getCenter(center);
    bounds.getSize(size);
    
    engine.addMarker(
      `tile-group-${tileGroup.id}`,
      'ground',
      tileGroup.name || 'Tiles',
      center,
      size
    );
    
    return () => {
      engine.removeMarker(`tile-group-${tileGroup.id}`);
    };
  }, [tileGroup]);

  useEffect(() => {
    return () => {
      materialManager.dispose();
      localMaterialRef.current?.dispose();
      localMaterialRef.current = null;
      baseGeometry.dispose();
    };
  }, [baseGeometry, materialManager]);

  useEffect(() => {
    return () => {
      terrain.sideGeometry.dispose();
    };
  }, [terrain.sideGeometry]);

  useEffect(() => {
    return () => {
      sideMaterial.dispose();
      rockGeometry.dispose();
      rampGeometry.dispose();
      rockMaterial.dispose();
    };
  }, [rampGeometry, rockGeometry, rockMaterial, sideMaterial]);

  return (
    <WorldProps type="ground">
      <>
        <BuildingColliderBody boxes={colliderBoxes} />

        {isEditMode && <EditOverlay kind="wire" items={editItems} selectedId={selectedTileId} onSelect={onTileClick} />}
        
        {batches && boxTileBatches.map((batch) => (
          <BoxTileBatchMesh
            key={`${tileGroup.id}-box-${batch.key}`}
            batch={batch}
            geometry={baseGeometry}
            dummy={dummy}
          />
        ))}

        {roundTiles.map((tile) => {
          const tileSize = tileWorldSize(tile);
          const elevated = tile.position.y > 0.02;
          const height = elevated ? tile.position.y : 0.04;
          const centerY = elevated ? height / 2 : -0.02;
          const tileMaterialId = getTileMaterialId(tile, tileGroup.floorMeshId);

          return (
            <mesh
              key={`${tile.id}-round`}
              position={[tile.position.x, centerY, tile.position.z]}
              material={materialById.get(tileMaterialId) ?? defaultMaterial}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[tileSize / 2, tileSize / 2, height, 28, 1, false]} />
            </mesh>
          );
        })}

        {stairTiles.map((tile) => (
          <StairTileMesh
            key={`${tile.id}-stairs`}
            tile={tile}
            material={materialById.get(getTileMaterialId(tile, tileGroup.floorMeshId)) ?? defaultMaterial}
            support={support}
          />
        ))}

        {rampTiles.map((tile) => {
          const { tileSize, totalHeight, rotation } = getRampLayout(tile);
          const tileMaterialId = getTileMaterialId(tile, tileGroup.floorMeshId);

          return (
            <mesh
              key={`${tile.id}-ramp`}
              position={[tile.position.x, 0, tile.position.z]}
              rotation={[0, rotation, 0]}
              scale={[tileSize, totalHeight, tileSize]}
              geometry={rampGeometry}
              material={materialById.get(tileMaterialId) ?? defaultMaterial}
              castShadow
              receiveShadow
            />
          );
        })}

        {terrain.sideGeometry.getAttribute('position') && (
          <mesh
            geometry={terrain.sideGeometry}
            material={sideMaterial}
            castShadow={terrain.castShadow}
            receiveShadow
          />
        )}

        {terrain.rocks.length > 0 && (
          <instancedMesh
            ref={rockRef}
            args={[rockGeometry, rockMaterial, Math.max(1, terrain.rocks.length)]}
            castShadow
            receiveShadow
          />
        )}

        {waterPatches.map((patch) => (
          <group key={`water-${patch.key}`} position={patch.center}>
            <Water
              width={patch.width}
              depth={patch.depth}
              center={patch.center}
              shore={patch.shore}
              lod={WATER_LOD}
            />
          </group>
        ))}
        
        {grassTiles.length > 0 && <GrassChunks tiles={grassTiles} meshOf={grassMeshOf} />}

        {spreads.map((spread) => <DirtCover key={spread.cover} spread={spread} />)}

        {sandEntries.length > 0 && <SandBatch entries={sandEntries} />}

        {snowfieldEntries.length > 0 && <SnowfieldBatch entries={snowfieldEntries} />}
      </>
    </WorldProps>
  );
}); 
