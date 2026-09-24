import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import { useShallow } from 'zustand/react/shallow';

import { useEngineFrame } from '@core/runtime/frame';

import { BuildingNavigationObstacleDriver } from '../../../building/components/BuildingNavigationObstacleDriver';
import { useBuildingStore, useBuildingStoreApi } from '../../../building/stores/buildingStore';
import { applyNPCNavigationRoute, useNavigationSystem } from '../../../navigation';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
import { useNPCSimulation } from '../../hooks/useNPCSimulation';
import { useNPCStore, useNPCStoreApi } from '../../stores/npcStore';
import { NPCInstance } from '../NPCInstance';
import { isNPCInLodRange } from './lod';
import './styles.css';

/** Subscribes to one NPC, so a change to another NPC never reaches this subtree. */
const NPCInstanceSlot = memo(function NPCInstanceSlot({ id, isEditMode, onSelect }: {
  id: string;
  isEditMode: boolean;
  onSelect: (id: string) => void;
}) {
  const instance = useNPCStore((state) => state.instances.get(id));
  return instance ? <NPCInstance instance={instance} isEditMode={isEditMode} onSelect={onSelect} /> : null;
});

export function NPCSystem() {
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

  // Distance-based LOD streams far NPCs out. Hysteresis keeps boundary walkers from remounting every check.
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const lodAccum = useRef(0);

  useEngineFrame('effects', (delta) => {
    lodAccum.current += delta;
    if (lodAccum.current < 0.5) return; // Check every 0.5s.
    lodAccum.current = 0;

    const cam = getThreeState().camera.position;
    const next = new Set<string>();
    npcStore.getState().instances.forEach((inst) => {
      const [x, y, z] = simulation.getPose(inst.id)?.position ?? inst.position;
      const dx = x - cam.x, dy = y - cam.y, dz = z - cam.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (isNPCInLodRange(dist, visibleIds.has(inst.id))) next.add(inst.id);
    });

    // Only update state if the set actually changed.
    if (next.size !== visibleIds.size || [...next].some(id => !visibleIds.has(id))) {
      setVisibleIds(next);
    }
  }, { label: 'npc:lod' });

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
      {instanceIds.map((id) => {
        // In edit mode show all; otherwise respect LOD.
        if (!isNPCMode && !visibleIds.has(id)) return null;
        return <NPCInstanceSlot key={id} id={id} isEditMode={isNPCMode} onSelect={selectInstance} />;
      })}
    </group>
  );
} 
