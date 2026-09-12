import { useEffect, useMemo, useRef, useState } from 'react';

import * as THREE from 'three';

import {
  GaesupController,
  resolveCharacterParts,
  SpeechBalloon,
  useAssetStore,
  useBuildingStore,
  useCharacterStore,
  useGaesupStore,
  usePlayerPosition,
  useStateSystem,
} from 'gaesup-world';
import {
  applyNPCNavigationRoute,
  NavigationSystem,
  type Waypoint,
} from 'gaesup-world/navigation';

import { CHARACTER_URL } from '../../config/constants';
import { resolveWorldAvatar, WORLD_EQUIPMENT } from './assets';

export const DEFAULT_CHARACTER_URL = CHARACTER_URL;
const SPEECH_BALLOON_OFFSET = new THREE.Vector3(0, 2.8, 0);
const EQUIPMENT_IDS = new Set(WORLD_EQUIPMENT.map((asset) => asset.id));

export function useWorldCharacterUrl() {
  const outfitId = useCharacterStore((state) => state.outfits.top);
  return resolveWorldAvatar(outfitId).url;
}

export function Player() {
  const isInBuildingMode = useBuildingStore((s) => s.isInEditMode());
  const mode = useGaesupStore((s) => s.mode);
  const outfits = useCharacterStore((s) => s.outfits);
  const assetRecords = useAssetStore((s) => s.records);
  const { gameStates } = useStateSystem();
  const parts = useMemo(
    () => resolveCharacterParts({
      outfits,
      assets: Object.fromEntries(Object.entries(assetRecords).filter(([id]) => EQUIPMENT_IDS.has(id))),
    }),
    [assetRecords, outfits],
  );

  if (isInBuildingMode || gameStates?.isRiding) return null;

  return (
    <GaesupController
      key={`controller-${mode.type}`}
      controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
      rigidBodyProps={{}}
      colliderSize={{ height: 2.1, radius: 0.34 }}
      parts={parts}
      modelHierarchy
      modelYawOffset={0}
    />
  );
}

const NAVIGATION_PROBE_TARGET: Waypoint = [14, 0, -14];
const NAVIGATION_PROBE_MARKER_HEIGHT = 0.3;

export function NavigationRouteProbe() {
  const [route, setRoute] = useState<Waypoint[]>([]);
  const { position } = usePlayerPosition({ updateInterval: 200 });
  const positionRef = useRef(position);
  const routeRef = useRef<Waypoint[]>([]);
  positionRef.current = position;

  useEffect(() => {
    const clearRoute = () => {
      routeRef.current = [];
      setRoute([]);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      if (routeRef.current.length > 0) {
        clearRoute();
        return;
      }
      const navigation = NavigationSystem.getInstance();
      const current = positionRef.current;
      applyNPCNavigationRoute(
        navigation,
        {
          id: 'example-player-route-probe',
          position: [current.x, current.y, current.z],
        },
        NAVIGATION_PROBE_TARGET,
        (_instanceId, waypoints) => {
          routeRef.current = waypoints;
          setRoute(waypoints);
        },
        { includeStart: true, clearOnFail: true, clearNavigation: clearRoute },
      );
    };
    window.addEventListener('keypress', onKey);
    return () => window.removeEventListener('keypress', onKey);
  }, []);

  if (route.length === 0) return null;

  return (
    <group>
      {route.map((waypoint, index) => (
        <mesh
          key={`route-probe-${index}`}
          position={[waypoint[0], waypoint[1] + NAVIGATION_PROBE_MARKER_HEIGHT, waypoint[2]]}
        >
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#7bd3a7" emissive="#2a6a4a" />
        </mesh>
      ))}
    </group>
  );
}

export function CharacterSpeechBalloon() {
  const [visible, setVisible] = useState(true);
  const { position } = usePlayerPosition({ updateInterval: 16 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') setVisible((v) => !v);
    };
    window.addEventListener('keypress', onKey);
    return () => window.removeEventListener('keypress', onKey);
  }, []);

  if (!visible) return null;

  return (
    <SpeechBalloon
      text="안녕"
      position={position}
      offset={SPEECH_BALLOON_OFFSET}
      visible
    />
  );
}
