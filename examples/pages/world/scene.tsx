import { useEffect, type ReactNode } from 'react';

import { Environment } from '@react-three/drei';
import { type ThreeEvent } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

import {
  BugSpot,
  CropPlot,
  getItemRegistry,
  HouseDoor,
  HousePlot,
  LegacyGrid,
  RoomPortal,
  RoomRoot,
  SceneRoot,
  requestCameraCloseUp,
  useBuildingStore,
  WeatherEffect,
} from 'gaesup-world';
import { SakuraBatch, SandBatch, SnowfieldBatch, Water } from 'gaesup-world/building';
import {
  applyRegisteredNavigationObstacles,
  NavigationSystem,
  registerNavigationObstacles,
} from 'gaesup-world/navigation';

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
import type { WorldFocusInfo } from './focus';

export type WorldFocusHandler = (focus: WorldFocusInfo) => void;

type SceneryProps = {
  onFocus?: WorldFocusHandler | undefined;
  enableCloseUp?: boolean;
};

function focusTarget(
  position: [number, number, number],
  yOffset: number,
): [number, number, number] {
  return [position[0], position[1] + yOffset, position[2]];
}

function InspectableFeature({
  focus,
  onFocus,
  enableCloseUp = false,
  children,
}: {
  focus: WorldFocusInfo;
  onFocus?: WorldFocusHandler | undefined;
  enableCloseUp?: boolean;
  children: ReactNode;
}) {
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!onFocus && !enableCloseUp) return;
    event.stopPropagation();
    if (enableCloseUp) {
      requestCameraCloseUp(focus.target, {
        focusDistance: focus.focusDistance ?? 4.2,
        focusLerpSpeed: focus.focusLerpSpeed ?? 8,
        fov: focus.fov ?? 44,
        enableCollision: false,
      });
    }
    onFocus?.(focus);
  };

  return (
    <InspectableCloseUpTargets enabled={enableCloseUp}>
      <group onPointerDown={handlePointerDown}>{children}</group>
    </InspectableCloseUpTargets>
  );
}

function InspectableCloseUpTargets({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const handlePointerEnter = () => {
    if (!enabled || typeof document === 'undefined') return;
    document.body.style.cursor = 'zoom-in';
  };
  const handlePointerLeave = () => {
    if (!enabled || typeof document === 'undefined') return;
    document.body.style.cursor = '';
  };
  return (
    <group onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
      {children}
    </group>
  );
}

const WORLD_SURFACE_SIZE = 1000;
const WORLD_COLLIDER_DEPTH = 2;
const WORLD_WATER_SHORE = {
  north: false,
  south: false,
  east: false,
  west: false,
};

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

export function Ground({ showGrid = false }: { showGrid?: boolean }) {
  const worldSurface = useBuildingStore((state) => state.worldSurface);
  const showWaterSurface = worldSurface === 'water';
  return (
    <>
      {showWaterSurface ? (
        <Water
          width={WORLD_SURFACE_SIZE}
          depth={WORLD_SURFACE_SIZE}
          center={[0, 0, 0]}
          shore={WORLD_WATER_SHORE}
          followCamera
        />
      ) : showGrid ? (
        <LegacyGrid
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
      ) : null}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          position={[0, -1.01, 0]}
          args={[WORLD_SURFACE_SIZE / 2, WORLD_COLLIDER_DEPTH / 2, WORLD_SURFACE_SIZE / 2]}
        />
        <mesh receiveShadow position={[0, -1.01, 0]} visible={!showWaterSurface}>
          <boxGeometry args={[WORLD_SURFACE_SIZE, WORLD_COLLIDER_DEPTH, WORLD_SURFACE_SIZE]} />
          <meshStandardMaterial
            color="#71865b"
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
      </RigidBody>
    </>
  );
}

function HomeInterior({
  returnPosition,
  onFocus,
  enableCloseUp = false,
}: {
  returnPosition: [number, number, number];
  onFocus?: WorldFocusHandler | undefined;
  enableCloseUp?: boolean;
}) {
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

      <RoomPortal
        id="home-foyer-living"
        sceneId="home-interior"
        fromRoomId="home-foyer"
        toRoomId="home-living"
        position={[0, 1.1, 1.2]}
        revealDistance={3.1}
      />
      <RoomPortal
        id="home-living-studio"
        sceneId="home-interior"
        fromRoomId="home-living"
        toRoomId="home-studio"
        position={[0, 1.1, -1.4]}
        revealDistance={3.1}
      />

      <RoomRoot
        sceneId="home-interior"
        roomId="home-foyer"
        bounds={{ min: [-3.9, -0.2, 1.2], max: [3.9, 3.2, 4.0] }}
      >
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
        <InspectableFeature
          onFocus={onFocus}
          focus={{
            id: 'door:home-exit',
            category: '이동',
            title: '집 밖으로 나가기',
            description: '집을 나와 마을을 둘러보세요.',
            target: [0, 1.1, 3.6],
            details: ['설명을 닫고 문 가까이 다가가세요.', 'E 키를 누르면 마을로 나갑니다.'],
            focusDistance: 3.8,
          }}
          enableCloseUp={enableCloseUp}
        >
          <HouseDoor
            position={[0, 0.05, 3.6]}
            sceneId="outdoor"
            entry={{ position: returnPosition, rotationY: 0 }}
            color="#ffd24a"
            radius={1}
            label="나가기"
          />
        </InspectableFeature>
      </RoomRoot>

      <RoomRoot
        sceneId="home-interior"
        roomId="home-living"
        bounds={{ min: [-3.9, -0.2, -1.4], max: [3.9, 3.2, 1.2] }}
      >
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

      <RoomRoot
        sceneId="home-interior"
        roomId="home-studio"
        bounds={{ min: [-3.9, -0.2, -4.0], max: [3.9, 3.2, -1.4] }}
      >
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

export function Scenery({ onFocus, enableCloseUp = false }: SceneryProps = {}) {
  const homePlot = HOUSE_PLOTS[0]?.pos ?? [-8, 0, -4];

  return (
    <>
      <ExampleNavigationObstacles />
      <SakuraBatch trees={SAKURA_TREES} />

      {NPCS.map((n) => (
        <InspectableFeature
          key={n.id}
          onFocus={onFocus}
          focus={{
            id: `npc:${n.id}`,
            category: '주민',
            title: `${n.name} 대화`,
            description: `${n.name}에게 말을 걸어 이야기를 들어보세요.`,
            target: focusTarget(n.pos, 1.15),
            details: [
              '설명을 닫고 주민 가까이 다가가세요.',
              'E 키를 누르면 대화를 시작합니다.',
            ],
            focusDistance: 3.6,
          }}
          enableCloseUp={enableCloseUp}
        >
          <NPCBeacon
            id={n.id}
            name={n.name}
            position={n.pos}
            dialogTreeId={n.dialogTreeId}
            {...(n.accentColor !== undefined ? { accentColor: n.accentColor } : {})}
            onInteract={(id) => {
              void dispatchWorldGameplayEvent({
                type: 'interaction',
                targetId: `npc:${id}`,
                action: 'talk',
              });
            }}
          />
        </InspectableFeature>
      ))}

      {BUG_SPOTS.map((p, i) => (
        <InspectableFeature
          key={`bug-${i}`}
          onFocus={onFocus}
          focus={{
            id: `bug:${i}`,
            category: '채집',
            title: '곤충 채집 포인트',
            description:
              '잠자리채를 들고 곤충을 잡아보세요. 날씨와 계절 행사에 따라 잡히는 곤충이 달라집니다.',
            target: focusTarget(p, 1.15),
            details: [
              '잠자리채 도구로 채집',
              '계절 이벤트와 날씨 보너스 반영',
              '잡은 곤충은 가방과 도감에서 확인하세요.',
            ],
            focusDistance: 4.2,
          }}
          enableCloseUp={enableCloseUp}
        >
          <BugSpot position={p} />
        </InspectableFeature>
      ))}

      {CROP_PLOTS.map((p) => (
        <InspectableFeature
          key={p.id}
          onFocus={onFocus}
          focus={{
            id: `crop:${p.id}`,
            category: '농사',
            title: '작물 밭',
            description:
              '땅을 갈고 씨앗을 심어 작물을 키워보세요.',
            target: focusTarget(p.pos, 0.65),
            details: ['삽으로 땅을 갈아주세요.', '씨앗을 장착한 뒤 심어주세요.', '물을 주고 자라면 수확하세요.'],
            focusDistance: 4,
          }}
          enableCloseUp={enableCloseUp}
        >
          <CropPlot id={p.id} position={p.pos} />
        </InspectableFeature>
      ))}

      {HOUSE_PLOTS.map((h, index) => (
        <InspectableFeature
          key={h.id}
          onFocus={onFocus}
          focus={{
            id: `house:${h.id}`,
            category: '마을',
            title: `집터 ${index + 1}`,
            description: '주민이 머무를 집터입니다. 누가 살고 있는지 확인해보세요.',
            target: focusTarget(h.pos, 1.2),
            details: [
              '집터의 표시로 입주·예약 상태를 확인할 수 있어요.',
            ],
            focusDistance: 5,
          }}
          enableCloseUp={enableCloseUp}
        >
          <HousePlot id={h.id} position={h.pos} size={[3.2, 3.2]} />
        </InspectableFeature>
      ))}

      <SceneRoot scene={{ id: 'outdoor', name: '마을', interior: false }}>
        <InspectableFeature
          onFocus={onFocus}
          focus={{
            id: 'door:home-entry',
            category: '이동',
            title: '집 안으로 들어가기',
            description: '집 안으로 들어가 방을 둘러보세요.',
            target: [homePlot[0], 1.15, homePlot[2] + 2.4],
            details: [
              '설명을 닫고 문 가까이 다가가세요.',
              'E 키를 누르면 집 안으로 들어갑니다.',
            ],
            focusDistance: 4,
          }}
          enableCloseUp={enableCloseUp}
        >
          <HouseDoor
            position={[homePlot[0], 0.05, homePlot[2] + 2.4]}
            sceneId="home-interior"
            entry={{ position: [0, 0, 2.6], rotationY: 0 }}
            color="#7fc6ff"
            radius={1.2}
            label="집"
          />
        </InspectableFeature>
      </SceneRoot>

      <SceneRoot
        scene={{
          id: 'home-interior',
          name: '집',
          interior: true,
          entry: { position: [0, 0, 0] },
        }}
      >
        <HomeInterior
          returnPosition={[homePlot[0], 0.05, homePlot[2] + 3.4]}
          onFocus={onFocus}
          enableCloseUp={enableCloseUp}
        />
      </SceneRoot>

      {WORLD_WEATHER_ENABLED && <WeatherEffect area={120} height={22} count={1500} />}

      <SandBatch entries={SAND_TILES} />
      <SnowfieldBatch entries={SNOWFIELD_TILES} />

      {PICKUPS.map((p) => {
        const item = getItemRegistry().get(p.itemId);
        return (
          <InspectableFeature
            key={p.id}
            onFocus={onFocus}
            focus={{
              id: `pickup:${p.id}`,
              category: '아이템',
              title: `${item?.name ?? p.itemId} 줍기`,
              description:
                '바닥에 놓인 아이템을 주워 가방에 담으세요.',
              target: focusTarget(p.pos, 0.55),
              details: [`수량: ${p.count}개`, '설명을 닫고 가까이에서 E 키로 주워보세요.', '가방과 도감에서 확인할 수 있어요.'],
              focusDistance: 3.8,
            }}
            enableCloseUp={enableCloseUp}
          >
            <Pickup id={p.id} itemId={p.itemId} count={p.count} position={p.pos} />
          </InspectableFeature>
        );
      })}
    </>
  );
}
