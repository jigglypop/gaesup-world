import { useEffect, useMemo, useState } from 'react';

import { euler } from '@react-three/rapier';
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
} from '../../../src';
import { WARRIOR_BLUEPRINT } from '../../../src/blueprints';
import { CHARACTER_URL } from '../../config/constants';

const DEFAULT_CHARACTER_BLUEPRINT_PARTS = WARRIOR_BLUEPRINT.visuals?.parts ?? [];
const DEFAULT_CHARACTER_BODY = DEFAULT_CHARACTER_BLUEPRINT_PARTS.find((part) => part.type === 'body');
export const DEFAULT_CHARACTER_URL = DEFAULT_CHARACTER_BODY?.url ?? CHARACTER_URL;
const DEFAULT_CHARACTER_PARTS = DEFAULT_CHARACTER_BLUEPRINT_PARTS
  .filter((part) => part.id !== DEFAULT_CHARACTER_BODY?.id)
  .map((part) => ({ id: part.id, slot: part.type, url: part.url, ...(part.color ? { color: part.color } : {}) }));

export function Player() {
  const isInBuildingMode = useBuildingStore((s) => s.isInEditMode());
  const mode = useGaesupStore((s) => s.mode);
  const outfits = useCharacterStore((s) => s.outfits);
  const assetRecords = useAssetStore((s) => s.records);
  const { gameStates } = useStateSystem();
  const parts = useMemo(
    () => resolveCharacterParts({
      baseParts: DEFAULT_CHARACTER_PARTS,
      outfits,
      assets: assetRecords,
    }),
    [assetRecords, outfits],
  );

  if (isInBuildingMode || gameStates?.isRiding) return null;

  return (
    <GaesupController
      key={`controller-${mode.type}`}
      controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
      rigidBodyProps={{}}
      parts={parts}
      rotation={euler({ x: 0, y: Math.PI, z: 0 })}
    />
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
      offset={new THREE.Vector3(0, 5, 0)}
      visible
    />
  );
}
