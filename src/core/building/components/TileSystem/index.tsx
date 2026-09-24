import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { BoxTileBatchMesh, getBoxTileBatchKey, isRaisedTile, type BoxTileBatch } from './batch';
import { createTileColliders, getRampLayout, getStairLayout, getTileShape, rotateXZ } from './layout';
import { TileSystemProps } from './types';
import { buildWaterPatches } from './waterPatches';
import { getDefaultToonMode, getToonGradient } from '../../../rendering/toon';
import { MinimapSystem } from '../../../ui/core';
import { WorldProps } from '../../../world/components/WorldProps';
import { MaterialManager } from '../../core/MaterialManager';
import { TILE_CONSTANTS } from '../../types/constants';
import { BuildingColliderBody } from '../BuildingColliders';
import type { BuildingColliderBox } from '../BuildingColliders/types';
import { GrassChunks } from '../mesh/grass/chunks';
import { SandBatch, type SandEntry } from '../mesh/sand';
import { SnowfieldBatch, type SnowfieldEntry } from '../mesh/snowfield';
import Water from '../mesh/water';

type TileLike = TileSystemProps['tileGroup']['tiles'][number];

const EMPTY_COLLIDER_BOXES: readonly BuildingColliderBox[] = [];

type TerrainRock = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

type TerrainBuild = {
  sideGeometry: THREE.BufferGeometry;
  rocks: TerrainRock[];
  /** Only cliffs cast shadows; the few-centimeter lip of a ground cover does not. */
  castShadow: boolean;
};

const SHADOW_CASTING_DROP = TILE_CONSTANTS.HEIGHT_STEP * 0.5;

type TileBounds = {
  id: string;
  topY: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  segments: number;
};

const TERRAIN_COVER_EDGE_LIFT: Partial<Record<NonNullable<TileLike['objectType']>, number>> = {
  grass: 0.05,
  sand: 0.065,
  snowfield: 0.055,
  water: 0.055,
};
const WATER_LOD = { near: 25, far: 90, strength: 4 } as const;

function fract(value: number): number {
  return value - Math.floor(value);
}

function hashNoise(...values: number[]): number {
  const seed = values.reduce((acc, value, index) => acc + value * (index * 19.19 + 7.13), 0);
  return fract(Math.sin(seed) * 43758.5453123);
}

function getTileMaterialId(tile: TileLike, fallbackId: string): string {
  return tile.materialId ?? fallbackId;
}

function buildTileBounds(tile: TileLike): TileBounds {
  const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
  const half = tileSize / 2;
  const terrainLift = tile.objectType ? (TERRAIN_COVER_EDGE_LIFT[tile.objectType] ?? 0) : 0;

  return {
    id: tile.id,
    topY: tile.position.y + terrainLift,
    minX: tile.position.x - half,
    maxX: tile.position.x + half,
    minZ: tile.position.z - half,
    maxZ: tile.position.z + half,
    centerX: tile.position.x,
    centerZ: tile.position.z,
    segments: tile.size || 1,
  };
}

function sampleSupportHeight(boundsList: TileBounds[], currentId: string, x: number, z: number): number {
  let support = 0;

  for (const bounds of boundsList) {
    if (bounds.id === currentId) continue;
    if (
      x > bounds.minX + 0.001 &&
      x < bounds.maxX - 0.001 &&
      z > bounds.minZ + 0.001 &&
      z < bounds.maxZ - 0.001
    ) {
      support = Math.max(support, bounds.topY);
    }
  }

  return support;
}

function pushQuad(
  positions: number[],
  colors: number[],
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
  topColor: THREE.Color,
  bottomColor: THREE.Color,
) {
  const pushVertex = (vertex: [number, number, number], color: THREE.Color) => {
    positions.push(vertex[0], vertex[1], vertex[2]);
    colors.push(color.r, color.g, color.b);
  };

  pushVertex(a, topColor);
  pushVertex(b, topColor);
  pushVertex(c, bottomColor);
  pushVertex(a, topColor);
  pushVertex(c, bottomColor);
  pushVertex(d, bottomColor);
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

function buildTerrainGeometry(subjectTiles: TileLike[], supportTiles: TileLike[], baseColor: THREE.Color): TerrainBuild {
  const positions: number[] = [];
  const colors: number[] = [];
  const rocks: TerrainRock[] = [];
  const boundsList = supportTiles.map(buildTileBounds);
  const subjectBounds = subjectTiles.map(buildTileBounds);
  const rockWarm = new THREE.Color('#7b6a58');
  const rockDark = new THREE.Color('#433930');
  const segmentSize = TILE_CONSTANTS.GRID_CELL_SIZE;
  let castShadow = false;

  const addSide = (
    bounds: TileBounds,
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    sampleX: number,
    sampleZ: number,
    outwardX: number,
    outwardZ: number,
    seed: number,
  ) => {
    const supportY = sampleSupportHeight(boundsList, bounds.id, sampleX, sampleZ);
    if (bounds.topY <= supportY + 0.02) return;

    const drop = bounds.topY - supportY;
    if (drop >= SHADOW_CASTING_DROP) castShadow = true;
    const topTint = 0.72 + hashNoise(seed, bounds.centerX, bounds.centerZ) * 0.16;
    const bottomTint = 0.42 + hashNoise(seed, bounds.topY) * 0.08;
    const topColor = baseColor.clone().lerp(rockWarm, 0.28 + Math.min(drop, 2) * 0.08).multiplyScalar(topTint);
    const bottomColor = baseColor.clone().lerp(rockDark, 0.7).multiplyScalar(bottomTint);

    pushQuad(
      positions,
      colors,
      [x0, bounds.topY, z0],
      [x1, bounds.topY, z1],
      [x1, supportY, z1],
      [x0, supportY, z0],
      topColor,
      bottomColor,
    );

    if (drop < TILE_CONSTANTS.HEIGHT_STEP * 0.95) return;

    const rockChance = hashNoise(seed, supportY, drop);
    if (rockChance < 0.58) return;

    const midX = (x0 + x1) * 0.5;
    const midZ = (z0 + z1) * 0.5;
    const scaleBase = 0.12 + Math.min(drop, 2.5) * 0.06;
    const scaleJitter = 0.08 + rockChance * 0.08;

    rocks.push({
      position: [
        midX + outwardX * (0.18 + rockChance * 0.24),
        supportY + scaleBase * 0.65,
        midZ + outwardZ * (0.18 + rockChance * 0.24),
      ],
      rotation: [
        rockChance * Math.PI * 1.7,
        rockChance * Math.PI * 2.9,
        rockChance * Math.PI * 0.9,
      ],
      scale: [
        scaleBase + scaleJitter * 0.6,
        scaleBase * 0.9 + scaleJitter * 0.45,
        scaleBase + scaleJitter,
      ],
    });
  };

  for (const bounds of subjectBounds) {
    if (bounds.topY <= 0.02) continue;

    const tileSize = bounds.segments * segmentSize;
    const minOffset = -tileSize / 2;

    for (let i = 0; i < bounds.segments; i++) {
      const start = minOffset + i * segmentSize;
      const end = start + segmentSize;
      const segmentMid = start + segmentSize * 0.5;

      addSide(
        bounds,
        bounds.maxX,
        bounds.centerZ + start,
        bounds.maxX,
        bounds.centerZ + end,
        bounds.maxX + 0.02,
        bounds.centerZ + segmentMid,
        1,
        0,
        hashNoise(bounds.centerX, bounds.centerZ, i, 1),
      );

      addSide(
        bounds,
        bounds.minX,
        bounds.centerZ + end,
        bounds.minX,
        bounds.centerZ + start,
        bounds.minX - 0.02,
        bounds.centerZ + segmentMid,
        -1,
        0,
        hashNoise(bounds.centerX, bounds.centerZ, i, 2),
      );

      addSide(
        bounds,
        bounds.centerX + end,
        bounds.minZ,
        bounds.centerX + start,
        bounds.minZ,
        bounds.centerX + segmentMid,
        bounds.minZ - 0.02,
        0,
        -1,
        hashNoise(bounds.centerX, bounds.centerZ, i, 3),
      );

      addSide(
        bounds,
        bounds.centerX + start,
        bounds.maxZ,
        bounds.centerX + end,
        bounds.maxZ,
        bounds.centerX + segmentMid,
        bounds.maxZ + 0.02,
        0,
        1,
        hashNoise(bounds.centerX, bounds.centerZ, i, 4),
      );
    }
  }

  const sideGeometry = new THREE.BufferGeometry();
  if (positions.length > 0) {
    sideGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    sideGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    sideGeometry.computeVertexNormals();
    sideGeometry.computeBoundingBox();
    sideGeometry.computeBoundingSphere();
  }

  return { sideGeometry, rocks, castShadow };
}

function shouldCloseStairBack(tile: TileLike, supportTiles: TileLike[]): boolean {
  const boundsList = supportTiles.map(buildTileBounds);
  const { tileSize, totalHeight, rotation } = getStairLayout(tile);
  const [offsetX, offsetZ] = rotateXZ(0, tileSize / 2 + 0.04, rotation);
  const supportY = sampleSupportHeight(boundsList, tile.id, tile.position.x + offsetX, tile.position.z + offsetZ);
  return supportY + 0.02 < totalHeight;
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
  supportTiles,
}: {
  tile: TileLike;
  material: THREE.Material;
  supportTiles: TileLike[];
}) {
  const rotation = tile.rotation ?? 0;
  const closeBack = useMemo(() => shouldCloseStairBack(tile, supportTiles), [supportTiles, tile]);
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

export function TileSystem({ 
  tileGroup, 
  meshes, 
  isEditMode = false,
  selectedTileId = null,
  onTileClick,
  colliders = true,
  batches = true,
}: TileSystemProps) {
  const materialManagerRef = useRef<MaterialManager>(new MaterialManager());
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
    const manager = materialManagerRef.current;
    const floorMesh = meshes.get(tileGroup.floorMeshId);
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
    return manager.getMaterial(floorMesh);
  }, [tileGroup.floorMeshId, meshes]);

  const materialById = useMemo(() => {
    const manager = materialManagerRef.current;
    const materials = new Map<string, THREE.Material>();
    materials.set(tileGroup.floorMeshId, defaultMaterial);
    for (const tile of tileGroup.tiles) {
      if (!tile.materialId || materials.has(tile.materialId)) continue;
      const mesh = meshes.get(tile.materialId);
      materials.set(tile.materialId, mesh ? manager.getMaterial(mesh) : defaultMaterial);
    }
    return materials;
  }, [defaultMaterial, meshes, tileGroup.floorMeshId, tileGroup.tiles]);

  const boxTileBatches = useMemo<BoxTileBatch[]>(() => {
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
  }, [boxTiles, defaultMaterial, materialById, tileGroup.floorMeshId]);

  const terrainColor = useMemo(() => {
    const floorMesh = meshes.get(tileGroup.floorMeshId);
    return new THREE.Color(floorMesh?.color || '#8a806f');
  }, [tileGroup.floorMeshId, meshes]);

  const terrain = useMemo(
    () => buildTerrainGeometry(boxTiles, tileGroup.tiles, terrainColor),
    [boxTiles, tileGroup.tiles, terrainColor],
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

  const editGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const editMaterial = useMemo(
    () =>
      getDefaultToonMode()
        ? new THREE.MeshToonMaterial({
            color: '#60a5fa',
            transparent: true,
              opacity: 0.14,
            emissive: new THREE.Color('#2563eb'),
            emissiveIntensity: 0.08,
            gradientMap: getToonGradient(3),
              wireframe: true,
              depthWrite: false,
          })
        : new THREE.MeshStandardMaterial({
            color: '#60a5fa',
            transparent: true,
              opacity: 0.14,
            emissive: new THREE.Color('#2563eb'),
            emissiveIntensity: 0.08,
              wireframe: true,
              depthWrite: false,
          }),
    [],
  );
  const selectedEditMaterial = useMemo(
    () =>
      getDefaultToonMode()
        ? new THREE.MeshToonMaterial({
            color: '#bae6fd',
            transparent: true,
              opacity: 0.28,
            emissive: new THREE.Color('#60a5fa'),
            emissiveIntensity: 0.18,
            gradientMap: getToonGradient(3),
              wireframe: true,
              depthWrite: false,
          })
        : new THREE.MeshStandardMaterial({
            color: '#bae6fd',
            transparent: true,
              opacity: 0.28,
            emissive: new THREE.Color('#60a5fa'),
            emissiveIntensity: 0.18,
              wireframe: true,
              depthWrite: false,
          }),
    [],
  );

  const sandTiles = useMemo(
    () => tileGroup.tiles.filter((t) => getTileShape(t) === 'box' && t.objectType === 'sand'),
    [tileGroup.tiles],
  );

  const sandEntries: SandEntry[] = useMemo(
    () => sandTiles.map((t) => ({
      position: [t.position.x, t.position.y, t.position.z] as [number, number, number],
      size: TILE_CONSTANTS.GRID_CELL_SIZE * (t.size || 1),
      ...(t.objectConfig?.terrainColor ? { color: t.objectConfig.terrainColor } : {}),
      ...(t.objectConfig?.terrainAccentColor ? { accentColor: t.objectConfig.terrainAccentColor } : {}),
    })),
    [sandTiles],
  );

  const snowfieldTiles = useMemo(
    () => tileGroup.tiles.filter((t) => getTileShape(t) === 'box' && t.objectType === 'snowfield'),
    [tileGroup.tiles],
  );

  const snowfieldEntries: SnowfieldEntry[] = useMemo(
    () => snowfieldTiles.map((t) => ({
      position: [t.position.x, t.position.y, t.position.z] as [number, number, number],
      size: TILE_CONSTANTS.GRID_CELL_SIZE * (t.size || 1),
      ...(t.objectConfig?.terrainColor ? { color: t.objectConfig.terrainColor } : {}),
      ...(t.objectConfig?.terrainAccentColor ? { accentColor: t.objectConfig.terrainAccentColor } : {}),
    })),
    [snowfieldTiles],
  );

  const grassTiles = useMemo(
    () => tileGroup.tiles.filter((t) => t.objectType === 'grass' && getTileShape(t) === 'box'),
    [tileGroup.tiles],
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
      const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
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
      materialManagerRef.current.dispose();
      localMaterialRef.current?.dispose();
      localMaterialRef.current = null;
      baseGeometry.dispose();
      editGeometry.dispose();
      editMaterial.dispose();
      selectedEditMaterial.dispose();
    };
  }, [baseGeometry, editGeometry, editMaterial, selectedEditMaterial]);

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

        {isEditMode && tileGroup.tiles.map((tile) => {
          const selected = tile.id === selectedTileId;
          const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
          const previewHeight = Math.max(0.22, tile.position.y + 0.22);

          return (
            <group
              key={tile.id}
              position={[tile.position.x, previewHeight / 2, tile.position.z]}
              scale={[tileSize * 0.82, previewHeight, tileSize * 0.82]}
              onClick={() => onTileClick?.(tile.id)}
            >
              <mesh geometry={editGeometry} material={selected ? selectedEditMaterial : editMaterial} />
            </group>
          );
        })}
        
        {batches && boxTileBatches.map((batch) => (
          <BoxTileBatchMesh
            key={`${tileGroup.id}-box-${batch.key}`}
            batch={batch}
            geometry={baseGeometry}
            dummy={dummy}
          />
        ))}

        {roundTiles.map((tile) => {
          const tileSize = (tile.size || 1) * TILE_CONSTANTS.GRID_CELL_SIZE;
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
            supportTiles={tileGroup.tiles}
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
        
        {grassTiles.length > 0 && <GrassChunks tiles={grassTiles} />}

        {sandEntries.length > 0 && <SandBatch entries={sandEntries} />}

        {snowfieldEntries.length > 0 && <SnowfieldBatch entries={snowfieldEntries} />}
      </>
    </WorldProps>
  );
} 
