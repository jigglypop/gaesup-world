import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import { Frustum, Matrix4, Sphere } from 'three';
import { useShallow } from 'zustand/react/shallow';

import { useCanvasFrameScheduler, useEngineFrame } from '@core/runtime/frame';

import { BuildingNavigationObstacleDriver } from '../../../building/components/BuildingNavigationObstacleDriver';
import { useBuildingStore, useBuildingStoreApi } from '../../../building/stores/buildingStore';
import { applyNPCNavigationRoute, useNavigationSystem } from '../../../navigation';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { useNPCSimulation } from '../../hooks/useNPCSimulation';
import { useNPCStore, useNPCStoreApi } from '../../stores/npcStore';
import { NPCInstance } from '../NPCInstance';
import { selectVisibleNPCs } from './lod';
import { NPCViewsContext, type NPCView } from './views';
import './styles.css';

export type NPCSystemProps = {
  /** Most NPCs drawn at once, nearest to the camera first. Default: no cap. */
  maxVisible?: number;
};

const cull = { frustum: new Frustum(), matrix: new Matrix4(), sphere: new Sphere() };
/** Residents drawn, nearest first, while `quality="auto"` finds frames held back by the CPU; the simulation runs them all. */
const CPU_BOUND_VISIBLE_NPCS = 8;

/** Subscribes to one NPC, so a change to another NPC never reaches this subtree. */
const NPCInstanceSlot = memo(function NPCInstanceSlot({ id, isEditMode, onSelect }: {
  id: string;
  isEditMode: boolean;
  onSelect: (id: string) => void;
}) {
  const instance = useNPCStore((state) => state.instances.get(id));
  return instance ? <NPCInstance instance={instance} isEditMode={isEditMode} onSelect={onSelect} /> : null;
});

export function NPCSystem({ maxVisible = Infinity }: NPCSystemProps = {}) {
  const visibleLimit = useGaesupStore((state) => (state.cpuBound ? Math.min(maxVisible, CPU_BOUND_VISIBLE_NPCS) : maxVisible));
  const simulation = useNPCSimulation();
  const gl = useThree((state) => state.gl);
  const getThreeState = useThree((state) => state.get);
  // Only additions and removals re-render the list; decision ticks update single NPCs.
  const instanceIds = useNPCStore(useShallow((state) => Array.from(state.instances.keys())));
  const npcStore = useNPCStoreApi();
  const buildingStore = useBuildingStoreApi();
  const selectedInstanceId = useNPCStore((state) => state.selectedInstanceId);
  const selectedTemplateId = useNPCStore((state) => state.selectedTemplateId);
  const createInstanceFromTemplate = useNPCStore(
    (state) => state.createInstanceFromTemplate
  );
  const setNavigation = useNPCStore((state) => state.setNavigation);
  const updateInstanceBehavior = useNPCStore((state) => state.updateInstanceBehavior);
  const setSelectedInstance = useNPCStore((state) => state.setSelectedInstance);
  const editMode = useBuildingStore(state => state.editMode);
  const isNPCMode = editMode === 'npc';
  const navigation = useNavigationSystem();
  const runtime = useGaesupRuntime();
  const runtimeRevision = useGaesupRuntimeRevision();
  const navigationReadyRef = useRef(false);
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    let active = true;
    navigationReadyRef.current = false;
    setNavigationReady(false);
    if (runtime && !runtime.isActive()) return;
    void navigation.init().then((ready) => {
      if (!active) return;
      navigationReadyRef.current = ready;
      setNavigationReady(ready);
    });
    return () => {
      active = false;
    };
  }, [navigation, runtime, runtimeRevision]);

  const selectInstance = useCallback((id: string) => {
    if (isNPCMode) setSelectedInstance(id);
  }, [isNPCMode, setSelectedInstance]);

  // Distance-based LOD streams far NPCs out, nearest first up to the cap. Hysteresis keeps boundary walkers from
  // remounting every check.
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const lodAccum = useRef(0);

  useEngineFrame('effects', (delta) => {
    lodAccum.current += delta;
    if (lodAccum.current < 0.5) return; // Check every 0.5s.
    lodAccum.current = 0;

    const cam = getThreeState().camera.position;
    const distances = new Map<string, number>();
    npcStore.getState().instances.forEach((inst) => {
      const [x, y, z] = simulation.getPose(inst.id)?.position ?? inst.position;
      distances.set(inst.id, Math.hypot(x - cam.x, y - cam.y, z - cam.z));
    });
    const next = selectVisibleNPCs(distances, visibleIds, isNPCMode ? Infinity : visibleLimit);

    // Only update state if the set actually changed.
    if (next.size !== visibleIds.size || [...next].some(id => !visibleIds.has(id))) {
      setVisibleIds(next);
    }
  }, { label: 'npc:lod' });

  // Every frame, mounted NPCs whose root sphere is out of view are hidden: skinned bounds stay in the bind pose, and a
  // hidden NPC also skips its shadow draws. A visible NPC that moved or turned keeps an idle frame rate drawing.
  const [views] = useState(() => new Map<string, NPCView>());
  const scheduler = useCanvasFrameScheduler();
  useEngineFrame('effects', () => {
    const camera = getThreeState().camera;
    cull.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    cull.frustum.setFromProjectionMatrix(cull.matrix, camera.coordinateSystem, camera.reversedDepth);
    let active = false;
    for (const [id, view] of views) {
      const root = view.root.current;
      const pose = simulation.getPose(id);
      if (!root || !pose) continue;
      cull.sphere.center.set(pose.position[0], pose.position[1] + view.height / 2, pose.position[2]);
      cull.sphere.radius = view.height;
      root.visible = cull.frustum.intersectsSphere(cull.sphere);
      if (!root.visible) continue;
      const revision = simulation.getPoseRevision(id);
      if (revision === view.seen) continue;
      active ||= view.seen >= 0;
      view.seen = revision;
    }
    if (active) scheduler.markActivity();
  }, { label: 'npc:view' });

  useEffect(() => {
    if (!isNPCMode) return;
    // Hover and instances are read at click time so pointer moves and NPC ticks do not re-render or re-bind.
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLCanvasElement)) return;
      if (event.defaultPrevented) return;
      const hoverPosition = buildingStore.getState().hoverPosition;
      if (!hoverPosition) return;
      if (selectedInstanceId && !event.shiftKey) {
        const selectedInstance = npcStore.getState().instances.get(selectedInstanceId);
        const moveTarget: [number, number, number] = [
          hoverPosition.x,
          hoverPosition.y,
          hoverPosition.z,
        ];
        updateInstanceBehavior(selectedInstanceId, { mode: 'idle' });
        if (selectedInstance && navigationReadyRef.current) {
          const route = applyNPCNavigationRoute(
            navigation,
            { id: selectedInstance.id, position: simulation.getPose(selectedInstance.id)?.position ?? selectedInstance.position },
            moveTarget,
            setNavigation,
          );
          if (route.length > 0) return;
        }
        setNavigation(selectedInstanceId, [moveTarget]);
        return;
      }
      if (selectedTemplateId && hoverPosition) {
        createInstanceFromTemplate(selectedTemplateId, [
          hoverPosition.x,
          hoverPosition.y,
          hoverPosition.z
        ]);
      }
    };
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [
    isNPCMode,
    selectedTemplateId,
    selectedInstanceId,
    buildingStore,
    npcStore,
    gl,
    createInstanceFromTemplate,
    setNavigation,
    updateInstanceBehavior,
  ]);

  return (
    <group name="npc-system">
      <BuildingNavigationObstacleDriver
        navigation={navigation}
        enabled={navigationReady}
      />
      <NPCViewsContext.Provider value={views}>
        {instanceIds.map((id) => {
          // In edit mode show all; otherwise respect LOD.
          if (!isNPCMode && !visibleIds.has(id)) return null;
          return <NPCInstanceSlot key={id} id={id} isEditMode={isNPCMode} onSelect={selectInstance} />;
        })}
      </NPCViewsContext.Provider>
    </group>
  );
}
