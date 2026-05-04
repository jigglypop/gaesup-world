import { Environment, Grid } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useEffect } from 'react';

import {
  BugSpot,
  CropPlot,
  HouseDoor,
  HousePlot,
  RoomPortal,
  RoomRoot,
  SceneRoot,
  WeatherEffect,
} from '../../../src';
import { SakuraBatch, SandBatch, SnowfieldBatch } from '../../../src/core/building';
import {
  applyRegisteredNavigationObstacles,
  NavigationSystem,
  registerNavigationObstacles,
} from '../../../src/core/navigation';
import { NPCBeacon } from '../../components/npc/NPCBeacon';
import { Pickup } from '../../components/pickup';
import { dispatchWorldGameplayEvent } from '../runtime';
import {
  BUG_SPOTS,
  CROP_PLOTS,
  HOUSE_PLOTS,
  NPCS,
  PICKUPS,
  SAKURA_TREES,
  SAND_TILES,
  SNOWFIELD_TILES,
  WORLD_WEATHER_ENABLED,
} from './data';

function ExampleNavigationObstacles() {
  useEffect(() => {
    const npcObstacles = NPCS.map((npc) => ({
      id: `example-npc-${npc.id}`,
      x: npc.pos[0],
      z: npc.pos[2],
      width: 1.6,
      depth: 1.6,
    }));
    const pickupObstacles = PICKUPS.map((pickup) => ({
      id: `example-pickup-${pickup.id}`,
      x: pickup.pos[0],
      z: pickup.pos[2],
      width: 0.9,
      depth: 0.9,
    }));
    const cropObstacles = CROP_PLOTS.map((plot) => ({
      id: `example-crop-${plot.id}`,
      x: plot.pos[0],
      z: plot.pos[2],
      width: 1.25,
      depth: 1.25,
    }));
    const treeObstacles = SAKURA_TREES.map((tree, index) => ({
      id: `example-tree-${index}`,
      x: tree.position[0],
      z: tree.position[2],
      width: Math.max(1.4, tree.size * 0.7),
      depth: Math.max(1.4, tree.size * 0.7),
    }));
    const houseObstacles = HOUSE_PLOTS.map((house) => ({
      id: `example-house-${house.id}`,
      x: house.pos[0],
      z: house.pos[2],
      width: 3.8,
      depth: 3.8,
    }));
    const unregister = registerNavigationObstacles('examples.world.scenery', [
      ...npcObstacles,
      ...pickupObstacles,
      ...cropObstacles,
      ...treeObstacles,
      ...houseObstacles,
    ]);

    const navigation = NavigationSystem.getInstance();
    void navigation.init().then(() => {
      applyRegisteredNavigationObstacles(navigation);
    });

    return unregister;
  }, []);

  return null;
}

export function Lighting() {
  return (
    <>
      <Environment background preset="sunset" backgroundBlurriness={1} />
      <ambientLight intensity={0.45} color="#ffffff" />
      <directionalLight
        castShadow
        position={[28, 36, 18]}
        intensity={1.8}
        color="#ffffff"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-top={70}
        shadow-camera-right={70}
        shadow-camera-bottom={-70}
        shadow-camera-left={-70}
        shadow-bias={-0.00015}
      />
    </>
  );
}

export function Ground() {
  return (
    <>
      <Grid
        renderOrder={-1}
        position={[0, -0.005, 0]}
        infiniteGrid
        cellSize={2}
        cellThickness={1}
        cellColor="#1d1d1d"
        sectionSize={5}
        sectionThickness={0}
        fadeDistance={400}
        fadeStrength={3}
        userData={{ intangible: true }}
      />
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -1.01, 0]}>
          <boxGeometry args={[1000, 2, 1000]} />
          <meshStandardMaterial color="#3d3d3d" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      </RigidBody>
    </>
  );
}

function HomeInterior({ returnPosition }: { returnPosition: [number, number, number] }) {
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.4, -4]} castShadow receiveShadow>
          <boxGeometry args={[8, 2.8, 0.2]} />
          <meshStandardMaterial color="#f0e0c8" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-4, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 2.8, 8]} />
          <meshStandardMaterial color="#f0e0c8" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[4, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 2.8, 8]} />
          <meshStandardMaterial color="#f0e0c8" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-2.55, 1.4, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
        <mesh position={[2.55, 1.4, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
        <mesh position={[-2.55, 1.4, -1.4]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
        <mesh position={[2.55, 1.4, -1.4]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
      </RigidBody>

      <RoomPortal id="home-foyer-living" sceneId="home-interior" fromRoomId="home-foyer" toRoomId="home-living" position={[0, 1.1, 1.2]} revealDistance={3.1} />
      <RoomPortal id="home-living-studio" sceneId="home-interior" fromRoomId="home-living" toRoomId="home-studio" position={[0, 1.1, -1.4]} revealDistance={3.1} />

      <RoomRoot sceneId="home-interior" roomId="home-foyer" bounds={{ min: [-3.9, -0.2, 1.2], max: [3.9, 3.2, 4.0] }}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0, 2.6]} receiveShadow>
            <boxGeometry args={[8, 0.2, 2.8]} />
            <meshStandardMaterial color="#caa57a" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[-2.4, 0.35, 3.0]} castShadow>
          <boxGeometry args={[1.1, 0.6, 0.8]} />
          <meshStandardMaterial color="#8f5b39" />
        </mesh>
        <mesh position={[2.3, 0.5, 2.7]} castShadow>
          <cylinderGeometry args={[0.45, 0.55, 0.9, 18]} />
          <meshStandardMaterial color="#d7c7a2" />
        </mesh>
        <HouseDoor position={[0, 0.05, 3.6]} sceneId="outdoor" entry={{ position: returnPosition, rotationY: 0 }} color="#ffd24a" radius={1} label="EXIT" />
      </RoomRoot>

      <RoomRoot sceneId="home-interior" roomId="home-living" bounds={{ min: [-3.9, -0.2, -1.4], max: [3.9, 3.2, 1.2] }}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0, -0.1]} receiveShadow>
            <boxGeometry args={[8, 0.2, 2.6]} />
            <meshStandardMaterial color="#caa57a" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[1.9, 0.45, -0.2]} castShadow>
          <boxGeometry args={[2.1, 0.8, 1.1]} />
          <meshStandardMaterial color="#7a4a2a" />
        </mesh>
        <mesh position={[-2.1, 0.3, 0.2]} castShadow>
          <boxGeometry args={[1.3, 0.5, 1.0]} />
          <meshStandardMaterial color="#9a6a43" />
        </mesh>
      </RoomRoot>

      <RoomRoot sceneId="home-interior" roomId="home-studio" bounds={{ min: [-3.9, -0.2, -4.0], max: [3.9, 3.2, -1.4] }}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0, -2.7]} receiveShadow>
            <boxGeometry args={[8, 0.2, 2.6]} />
            <meshStandardMaterial color="#caa57a" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[2.4, 0.4, -2.8]} castShadow>
          <boxGeometry args={[1.6, 0.7, 1.2]} />
          <meshStandardMaterial color="#7a4a2a" />
        </mesh>
        <mesh position={[-2.6, 0.25, -2.6]} castShadow>
          <boxGeometry args={[1.0, 0.45, 1.0]} />
          <meshStandardMaterial color="#a05030" />
        </mesh>
        <mesh position={[0, 0.85, -3.2]} castShadow>
          <boxGeometry args={[2.1, 1.5, 0.45]} />
          <meshStandardMaterial color="#c8d4e5" />
        </mesh>
      </RoomRoot>
    </>
  );
}

export function Scenery() {
  const homePlot = HOUSE_PLOTS[0]?.pos ?? [-8, 0, -4];

  return (
    <>
      <ExampleNavigationObstacles />
      <SakuraBatch trees={SAKURA_TREES} />

      {NPCS.map((n) => (
        <NPCBeacon
          key={n.id}
          id={n.id}
          name={n.name}
          position={n.pos}
          dialogTreeId={n.dialogTreeId}
          {...(n.accentColor !== undefined ? { accentColor: n.accentColor } : {})}
          onInteract={(id) => {
            void dispatchWorldGameplayEvent({ type: 'interaction', targetId: `npc:${id}`, action: 'talk' });
          }}
        />
      ))}

      {BUG_SPOTS.map((p, i) => (
        <BugSpot key={`bug-${i}`} position={p} />
      ))}

      {CROP_PLOTS.map((p) => (
        <CropPlot key={p.id} id={p.id} position={p.pos} />
      ))}

      {HOUSE_PLOTS.map((h) => (
        <HousePlot key={h.id} id={h.id} position={h.pos} size={[3.2, 3.2]} />
      ))}

      <SceneRoot scene={{ id: 'outdoor', name: 'Town', interior: false }}>
        <HouseDoor position={[homePlot[0], 0.05, homePlot[2] + 2.4]} sceneId="home-interior" entry={{ position: [0, 0, 2.6], rotationY: 0 }} color="#7fc6ff" radius={1.2} label="HOME" />
      </SceneRoot>

      <SceneRoot scene={{ id: 'home-interior', name: 'Home', interior: true, entry: { position: [0, 0, 0] } }}>
        <HomeInterior returnPosition={[homePlot[0], 0.05, homePlot[2] + 3.4]} />
      </SceneRoot>

      {WORLD_WEATHER_ENABLED && <WeatherEffect area={120} height={22} count={1500} />}

      <SandBatch entries={SAND_TILES} />
      <SnowfieldBatch entries={SNOWFIELD_TILES} />

      {PICKUPS.map((p) => (
        <Pickup key={p.id} id={p.id} itemId={p.itemId} count={p.count} position={p.pos} />
      ))}
    </>
  );
}
