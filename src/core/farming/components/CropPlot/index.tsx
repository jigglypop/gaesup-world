import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { useTimeStore } from '../../../time/stores/timeStore';
import { notify } from '../../../ui/components/Toast/toastStore';
import { useToolUse } from '../../../tools/hooks/useToolUse';
import type { ToolUseEvent } from '../../../tools/types';
import { getCropRegistry } from '../../registry/CropRegistry';
import { usePlotStore } from '../../stores/plotStore';
import type { Plot } from '../../types';

export type CropPlotProps = {
  id: string;
  position: [number, number, number];
  size?: number;
  hitRange?: number;
};

function inRange(plot: Plot, evt: ToolUseEvent, hit: number): boolean {
  const dx = evt.origin[0] - plot.position[0];
  const dz = evt.origin[2] - plot.position[2];
  return dx * dx + dz * dz <= hit * hit;
}

export function CropPlot({ id, position, size = 1.4, hitRange = 1.6 }: CropPlotProps) {
  const registerPlot = usePlotStore((s) => s.registerPlot);
  const unregisterPlot = usePlotStore((s) => s.unregisterPlot);
  const plot = usePlotStore((s) => s.plots[id]);
  const till = usePlotStore((s) => s.till);
  const plant = usePlotStore((s) => s.plant);
  const water = usePlotStore((s) => s.water);
  const harvest = usePlotStore((s) => s.harvest);
  const tick = usePlotStore((s) => s.tick);

  useEffect(() => {
    registerPlot({ id, position });
    return () => unregisterPlot(id);
  }, [id, position, registerPlot, unregisterPlot]);

  useEffect(() => {
    let last = 0;
    const off = useTimeStore.subscribe((state) => {
      if (state.totalMinutes !== last) {
        last = state.totalMinutes;
        tick(state.totalMinutes);
      }
    });
    tick(useTimeStore.getState().totalMinutes);
    return off;
  }, [tick]);

  const onShovel = useCallback((evt: ToolUseEvent): boolean | void => {
    const cur = usePlotStore.getState().plots[id];
    if (!cur || !inRange(cur, evt, hitRange)) return;
    if (cur.state === 'mature') return harvest(id) ? true : undefined;
    if (cur.state === 'empty') {
      const ok = till(id);
      if (ok) notify('info', '땅을 갈았다');
      return ok ? true : undefined;
    }
  }, [id, hitRange, till, harvest]);

  const onSeed = useCallback((evt: ToolUseEvent): boolean | void => {
    const cur = usePlotStore.getState().plots[id];
    if (!cur || !inRange(cur, evt, hitRange)) return;
    if (cur.state !== 'tilled') return;
    const equipped = useInventoryStore.getState().getEquipped();
    if (!equipped) return;
    const def = getCropRegistry().bySeedItemId(equipped.itemId);
    if (!def) return;
    const minutes = useTimeStore.getState().totalMinutes;
    return plant(id, def.id, minutes) ? true : undefined;
  }, [id, hitRange, plant]);

  const onWater = useCallback((evt: ToolUseEvent): boolean | void => {
    const cur = usePlotStore.getState().plots[id];
    if (!cur || !inRange(cur, evt, hitRange)) return;
    if (cur.state !== 'planted' && cur.state !== 'dried') return;
    const minutes = useTimeStore.getState().totalMinutes;
    const ok = water(id, minutes);
    if (ok) notify('info', '물을 줬다');
    return ok ? true : undefined;
  }, [id, hitRange, water]);

  useToolUse('shovel', onShovel);
  useToolUse('seed', onSeed);
  useToolUse('water', onWater);

  const cropDef = plot?.cropId ? getCropRegistry().get(plot.cropId) : undefined;
  const stage = cropDef ? cropDef.stages[plot!.stageIndex] : undefined;

  const groundColor = useMemo(() => {
    if (!plot) return '#5a3f24';
    if (plot.state === 'empty') return '#5a3f24';
    if (plot.state === 'tilled') return '#4a2f18';
    if (plot.state === 'dried') return '#6b5230';
    return '#3a2810';
  }, [plot]);

  const cropRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = cropRef.current;
    if (!m) return;
    const t = clock.elapsedTime;
    m.rotation.y = Math.sin(t * 0.4) * 0.05;
    m.position.y = (stage?.scale ?? 0.3) * 0.5 + Math.sin(t * 1.2) * 0.01;
  });

  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[size, size]} />
        <meshToonMaterial color={groundColor} />
      </mesh>
      {plot && (plot.state === 'planted' || plot.state === 'mature' || plot.state === 'dried') && cropDef && stage && (
        <mesh ref={cropRef} castShadow position={[0, stage.scale * 0.5, 0]}>
          <coneGeometry args={[Math.max(0.08, stage.scale * 0.35), Math.max(0.16, stage.scale * 0.9), 10]} />
          <meshToonMaterial color={plot.state === 'dried' ? '#7a6a4a' : (stage.color ?? '#9adf90')} />
        </mesh>
      )}
      {plot?.state === 'mature' && (
        <mesh position={[0, 1.0, 0]}>
          <ringGeometry args={[0.18, 0.24, 16]} />
          <meshBasicMaterial color="#ffd84a" transparent opacity={0.85} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export default CropPlot;
