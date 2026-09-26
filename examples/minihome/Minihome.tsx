import { Suspense, useLayoutEffect } from 'react';

import { Canvas } from '@react-three/fiber';

import { CascadedSun, createRenderer, DEFAULT_NPC_SCALE, GaesupController, GaesupWorld, GaesupWorldContent, useNPCStore, WorldPhysics } from 'gaesup-world';
import { BuildingController, useBuildingStore } from 'gaesup-world/building';

import { createVillage } from './village';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const PLAYER_URL = asset('gltf/trainer_green.glb');
const VILLAGER_URL = asset('gltf/trainer_red.glb');

function Villagers() {
  useLayoutEffect(() => {
    const npc = useNPCStore.getState();
    npc.addTemplate({
      id: 'villager', name: 'villager', category: 'humanoid', defaultAnimation: 'idle', clothingParts: [],
      baseParts: [{ id: 'villager-body', type: 'body', url: VILLAGER_URL, position: [0, 0, 0] }],
    });
    const ids = [[-6, 6], [8, -4]].map(([x, z], index) => {
      const id = `villager-${index}`;
      npc.addInstance({
        id, templateId: 'villager', name: index ? '모모' : '루루', position: [x!, 0, z!], rotation: [0, 0, 0],
        scale: [DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE],
        brain: { mode: 'scripted' },
        behavior: { mode: 'wander', speed: 1.2, wanderRadius: 6, waitSeconds: 2, moveAnimation: 'walk', idleAnimation: 'idle' },
      });
      return id;
    });
    return () => {
      const current = useNPCStore.getState();
      for (const id of ids) current.removeInstance(id);
      current.removeTemplate('villager');
    };
  }, []);
  return null;
}

export default function Minihome() {
  useLayoutEffect(() => { useBuildingStore.getState().hydrate(createVillage()); }, []);
  return (
    <GaesupWorld urls={{ characterUrl: PLAYER_URL }} cameraOption={{ type: 'thirdPerson' }}>
      <Canvas shadows gl={createRenderer} camera={{ position: [0, 12, 22], fov: 50 }} style={{ position: 'fixed', inset: 0 }}>
        <color attach="background" args={['#bfe3f2']} />
        <ambientLight intensity={1.2} />
        <Suspense fallback={null}>
          <GaesupWorldContent quality="auto">
            <CascadedSun position={[30, 50, 20]} intensity={2.2} />
            <WorldPhysics>
              <GaesupController parts={[]} position={[0, 2, 0]} />
              <BuildingController />
              <Villagers />
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
}
