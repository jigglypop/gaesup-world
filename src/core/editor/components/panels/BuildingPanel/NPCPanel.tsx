import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import type {
  NPCAnimation,
  NPCBehaviorConfig,
  NPCBrainBlueprint,
  NPCBrainConfig,
  NPCInstance,
  NPCNavigationState,
  NPCPerceptionConfig,
  NPCTemplate,
} from '../../../../npc/types';
import { NPCInstance as NPCPreviewInstance } from '../../../../npc/components/NPCInstance';
import {
  NPCAnimationSection,
  NPCBrainSection,
  type NPCBrainPreviewState,
  NPCMovementSection,
  NPCPerceptionSection,
} from './sections';

type NPCPanelProps = {
  layout?: 'default' | 'split' | 'sidebars';
  npcTemplatesArray: NPCTemplate[];
  selectedNPCTemplateId: string | null | undefined;
  setSelectedNPCTemplate: (templateId: string) => void;
  npcInstancesArray: NPCInstance[];
  selectedNPCInstanceId: string | null;
  setSelectedNPCInstance: (instanceId: string) => void;
  selectedNPCInstance: NPCInstance | undefined;
  npcAnimationsArray: NPCAnimation[];
  selectedNPCBrainBlueprint: NPCBrainBlueprint | undefined;
  npcBrainBlueprintsArray: NPCBrainBlueprint[];
  hoverPosition: { x: number; y: number; z: number } | null;
  updateNPCBehavior: (id: string, updates: Partial<NPCBehaviorConfig | undefined>) => void;
  setNPCNavigation: (id: string, updates: Partial<NPCNavigationState>) => void;
  clearNPCNavigation: (id: string) => void;
  updateNPCInstance: (id: string, updates: Partial<NPCInstance>) => void;
  updateNPCBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
  addNPCBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
  updateNPCBrainBlueprint: (id: string, updates: NPCBrainBlueprint) => void;
  updateNPCPerception: (id: string, updates: Partial<NPCPerceptionConfig>) => void;
};

export function NPCPanel({
  layout = 'default',
  npcTemplatesArray,
  selectedNPCTemplateId,
  setSelectedNPCTemplate,
  npcInstancesArray,
  selectedNPCInstanceId,
  setSelectedNPCInstance,
  selectedNPCInstance,
  npcAnimationsArray,
  selectedNPCBrainBlueprint,
  npcBrainBlueprintsArray,
  hoverPosition,
  updateNPCBehavior,
  setNPCNavigation,
  clearNPCNavigation,
  updateNPCInstance,
  updateNPCBrain,
  addNPCBrainBlueprint,
  updateNPCBrainBlueprint,
  updateNPCPerception,
}: NPCPanelProps) {
  const [activeControlTab, setActiveControlTab] = React.useState<'movement' | 'animation' | 'perception'>('movement');
  const [brainPreview, setBrainPreview] = React.useState<NPCBrainPreviewState>({
    mode: 'idle',
    label: '대기',
  });

  const selectedIndex = React.useMemo(
    () => npcInstancesArray.findIndex((instance) => instance.id === selectedNPCInstanceId),
    [npcInstancesArray, selectedNPCInstanceId],
  );
  const hasNpcSelection = selectedIndex >= 0;
  const selectPreviousNpc = React.useCallback(() => {
    if (npcInstancesArray.length === 0) return;
    const nextIndex = hasNpcSelection
      ? (selectedIndex - 1 + npcInstancesArray.length) % npcInstancesArray.length
      : 0;
    const nextInstance = npcInstancesArray[nextIndex];
    if (!nextInstance) return;
    setSelectedNPCInstance(nextInstance.id);
  }, [hasNpcSelection, npcInstancesArray, selectedIndex, setSelectedNPCInstance]);
  const selectNextNpc = React.useCallback(() => {
    if (npcInstancesArray.length === 0) return;
    const nextIndex = hasNpcSelection
      ? (selectedIndex + 1) % npcInstancesArray.length
      : 0;
    const nextInstance = npcInstancesArray[nextIndex];
    if (!nextInstance) return;
    setSelectedNPCInstance(nextInstance.id);
  }, [hasNpcSelection, npcInstancesArray, selectedIndex, setSelectedNPCInstance]);

  const activeControlPanel = React.useMemo(() => {
    if (!selectedNPCInstance) return null;
    if (activeControlTab === 'movement') {
      return (
        <NPCMovementSection
          instance={selectedNPCInstance}
          hoverPosition={hoverPosition}
          updateBehavior={updateNPCBehavior}
          setNavigation={setNPCNavigation}
          clearNavigation={clearNPCNavigation}
        />
      );
    }
    if (activeControlTab === 'animation') {
      return (
        <NPCAnimationSection
          instance={selectedNPCInstance}
          animations={npcAnimationsArray}
          updateInstance={updateNPCInstance}
          updateBehavior={updateNPCBehavior}
        />
      );
    }
    return (
      <NPCPerceptionSection
        instance={selectedNPCInstance}
        updateBrain={updateNPCBrain}
        updatePerception={updateNPCPerception}
      />
    );
  }, [
    activeControlTab,
    clearNPCNavigation,
    hoverPosition,
    npcAnimationsArray,
    selectedNPCInstance,
    setNPCNavigation,
    updateNPCBehavior,
    updateNPCBrain,
    updateNPCInstance,
    updateNPCPerception,
  ]);

  const movementPanel = selectedNPCInstance ? (
    <NPCMovementSection
      instance={selectedNPCInstance}
      hoverPosition={hoverPosition}
      updateBehavior={updateNPCBehavior}
      setNavigation={setNPCNavigation}
      clearNavigation={clearNPCNavigation}
    />
  ) : null;
  const animationPanel = selectedNPCInstance ? (
    <NPCAnimationSection
      instance={selectedNPCInstance}
      animations={npcAnimationsArray}
      updateInstance={updateNPCInstance}
      updateBehavior={updateNPCBehavior}
    />
  ) : null;
  const perceptionPanel = selectedNPCInstance ? (
    <NPCPerceptionSection
      instance={selectedNPCInstance}
      updateBrain={updateNPCBrain}
      updatePerception={updateNPCPerception}
    />
  ) : null;

  const summary = (
    <div className="building-panel__asset-targets building-panel__npc-summary building-panel__npc-statusbar">
        <span>선택 NPC: {selectedNPCInstance?.name ?? selectedNPCInstanceId ?? '선택 없음'}</span>
        <span>행동: {selectedNPCInstance?.behavior?.mode ?? 'idle'} · 이동: {selectedNPCInstance?.navigation?.state ?? '없음'}</span>
        <span>현재 애니메이션: {selectedNPCInstance?.currentAnimation ?? 'idle'}</span>
    </div>
  );
  const switcher = (
    <div className="building-panel__npc-switcher">
        <button className="building-panel__segment-btn" onClick={selectPreviousNpc} disabled={npcInstancesArray.length < 2}>
          이전 NPC
        </button>
        <span>
          {hasNpcSelection ? `${selectedIndex + 1} / ${npcInstancesArray.length}` : `0 / ${npcInstancesArray.length}`}
        </span>
        <button className="building-panel__segment-btn" onClick={selectNextNpc} disabled={npcInstancesArray.length < 2}>
          다음 NPC
        </button>
    </div>
  );
  const selectionPanel = (
    <div className="building-panel__npc-head">
        <div className="building-panel__npc-head-block">
          <div className="building-panel__section-subtitle">템플릿</div>
          <div className="building-panel__npc-chip-list">
            {npcTemplatesArray.map((template) => (
              <button
                key={template.id}
                className={`building-panel__grid-btn ${selectedNPCTemplateId === template.id ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setSelectedNPCTemplate(template.id)}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
        <div className="building-panel__npc-head-block">
          <div className="building-panel__section-subtitle">NPC 선택</div>
          <div className="building-panel__npc-chip-list">
            {npcInstancesArray.map((instance) => (
              <button
                key={instance.id}
                className={`building-panel__grid-btn ${selectedNPCInstanceId === instance.id ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setSelectedNPCInstance(instance.id)}
              >
                {instance.name}
              </button>
            ))}
          </div>
        </div>
    </div>
  );
  const controlTabs = selectedNPCInstance ? (
    <div className="building-panel__npc-modal-controls">
      <div className="building-panel__brain-tabs">
        <button
          type="button"
          className={`building-panel__brain-tab ${activeControlTab === 'movement' ? 'building-panel__brain-tab--active' : ''}`}
          onClick={() => setActiveControlTab('movement')}
        >
          이동
        </button>
        <button
          type="button"
          className={`building-panel__brain-tab ${activeControlTab === 'animation' ? 'building-panel__brain-tab--active' : ''}`}
          onClick={() => setActiveControlTab('animation')}
        >
          애니메이션
        </button>
        <button
          type="button"
          className={`building-panel__brain-tab ${activeControlTab === 'perception' ? 'building-panel__brain-tab--active' : ''}`}
          onClick={() => setActiveControlTab('perception')}
        >
          지각
        </button>
      </div>
      {activeControlPanel}
    </div>
  ) : null;
  const previewCard = selectedNPCInstance ? (
    <div className="building-panel__npc-card">
      <div className="building-panel__section-title">미니 프리뷰 캔버스</div>
      <div className="building-panel__asset-targets">
        <span>노드 프리뷰: {brainPreview.label}</span>
        {brainPreview.animationId && <span>애니메이션: {brainPreview.animationId}</span>}
      </div>
      <div className="building-panel__npc-avatar-canvas">
        <NPCMotionCanvas
          state={brainPreview}
          instance={selectedNPCInstance}
        />
      </div>
    </div>
  ) : null;
  const brainEditor = selectedNPCInstance ? (
    <NPCBrainSection
      instance={selectedNPCInstance}
      blueprints={npcBrainBlueprintsArray}
      selectedBlueprint={selectedNPCBrainBlueprint}
      updateBrain={updateNPCBrain}
      addBrainBlueprint={addNPCBrainBlueprint}
      updateBrainBlueprint={updateNPCBrainBlueprint}
      onPreviewStateChange={setBrainPreview}
    />
  ) : null;
  const emptyState = (
    <>
      {npcTemplatesArray.length === 0 && (
        <div className="building-panel__empty">사용 가능한 NPC 템플릿이 없습니다.</div>
      )}
      {npcInstancesArray.length === 0 && (
        <div className="building-panel__empty">월드에 NPC를 배치하면 상세 편집이 열립니다.</div>
      )}
    </>
  );

  if (layout === 'split') {
    return (
      <div className="building-panel__section building-panel__npc-shell building-panel__npc-shell--split">
        <div className="building-panel__npc-pane building-panel__npc-pane--left">
          <div className="building-panel__section-title">선택</div>
          {summary}
          {switcher}
          {selectionPanel}
          {emptyState}
        </div>
        <div className="building-panel__npc-board">
          <div className="building-panel__npc-pane building-panel__npc-pane--movement">
            <div className="building-panel__section-title">이동</div>
            {movementPanel}
          </div>
          <div className="building-panel__npc-pane building-panel__npc-pane--animation">
            <div className="building-panel__section-title">애니메이션</div>
            {animationPanel}
          </div>
          <div className="building-panel__npc-pane building-panel__npc-pane--perception">
            <div className="building-panel__section-title">지각</div>
            {perceptionPanel}
          </div>
        </div>
        <div className="building-panel__npc-pane building-panel__npc-pane--right">
          <div className="building-panel__section-title">두뇌/프리뷰</div>
          {previewCard}
          {brainEditor}
        </div>
      </div>
    );
  }

  if (layout === 'sidebars') {
    return (
      <div className="building-panel__section building-panel__npc-shell building-panel__npc-shell--sidebars">
        <aside className="building-panel__npc-side building-panel__npc-side--left">
          <div className="building-panel__section-title">NPC 선택</div>
          {summary}
          {switcher}
          {selectionPanel}
          <div className="building-panel__npc-board">
            <div className="building-panel__npc-pane building-panel__npc-pane--movement">
              <div className="building-panel__section-title">이동</div>
              {movementPanel}
            </div>
            <div className="building-panel__npc-pane building-panel__npc-pane--animation">
              <div className="building-panel__section-title">애니메이션</div>
              {animationPanel}
            </div>
            <div className="building-panel__npc-pane building-panel__npc-pane--perception">
              <div className="building-panel__section-title">지각</div>
              {perceptionPanel}
            </div>
          </div>
          {emptyState}
        </aside>
        <aside className="building-panel__npc-side building-panel__npc-side--right">
          <div className="building-panel__npc-pane building-panel__npc-pane--brain">
            <div className="building-panel__section-title">두뇌/프리뷰</div>
            {previewCard}
            {brainEditor}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="building-panel__section building-panel__npc-shell building-panel__npc-shell--modal">
      <div className="building-panel__section-title">NPC 에디터</div>
      {summary}
      {switcher}
      {selectionPanel}
      {selectedNPCInstance && (
        <div className="building-panel__npc-workspace building-panel__npc-workspace--modal">
          <div className="building-panel__npc-column building-panel__npc-column--controls">
            {controlTabs}
          </div>

          <div className="building-panel__npc-column building-panel__npc-column--brain">
            {previewCard}
            {brainEditor}
          </div>
        </div>
      )}
      {emptyState}
    </div>
  );
}

const PREVIEW_SCALE = 0.25;

function toPreviewPoint(point: [number, number, number], origin: [number, number, number]): [number, number] {
  const x = (point[0] - origin[0]) * PREVIEW_SCALE;
  const z = (point[2] - origin[2]) * PREVIEW_SCALE;
  return [Math.max(-2.8, Math.min(2.8, x)), Math.max(-2.8, Math.min(2.8, z))];
}

function NPCMotionCanvas({
  state,
  instance,
}: {
  state: NPCBrainPreviewState;
  instance: NPCInstance;
}) {
  const origin = instance.position;
  const templateId = React.useMemo(() => {
    const fallbackFromStore = instance.templateId?.trim();
    if (fallbackFromStore) return fallbackFromStore;
    return 'ally';
  }, [instance.templateId]);
  const previewInstance = React.useMemo<NPCInstance>(() => {
    const previewId = `preview-${origin.join('-')}`;
    const baseWaypoints: [number, number, number][] = state.waypoints && state.waypoints.length > 0
      ? state.waypoints
      : [
          [origin[0] + 2, origin[1], origin[2]],
          [origin[0], origin[1], origin[2] + 2],
          [origin[0] - 2, origin[1], origin[2]],
          [origin[0], origin[1], origin[2] - 2],
        ];
    const navigation = state.mode === 'move' && state.target
      ? {
          waypoints: [state.target],
          currentIndex: 0,
          speed: 1.7,
          state: 'moving' as const,
        }
      : state.mode === 'patrol'
        ? {
            waypoints: baseWaypoints,
            currentIndex: 0,
            speed: 1.6,
            state: 'moving' as const,
          }
        : state.mode === 'wander'
          ? {
              waypoints: baseWaypoints,
              currentIndex: 0,
              speed: 1.3,
              state: 'moving' as const,
            }
          : undefined;

    return {
      id: previewId,
      templateId,
      name: `${instance.name}-preview`,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: instance.scale ?? [1, 1, 1],
      currentAnimation: state.animationId ?? instance.currentAnimation ?? 'idle',
      ...(instance.currentClothingSetId ? { currentClothingSetId: instance.currentClothingSetId } : {}),
      ...(instance.customParts ? { customParts: instance.customParts } : {}),
      ...(instance.metadata ? { metadata: instance.metadata } : {}),
      brain: { mode: 'none' },
      behavior: {
        mode: state.mode === 'patrol' ? 'patrol' : state.mode === 'wander' ? 'wander' : 'idle',
        speed: 1.6,
      },
      ...(navigation ? { navigation } : {}),
    };
  }, [instance, origin, state.animationId, state.mode, state.target, state.waypoints, templateId]);

  return (
    <Canvas camera={{ position: [0, 6.2, 11.5], fov: 34, near: 0.1, far: 120 }}>
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 8, 4]} intensity={1.0} />
      <gridHelper args={[8, 16, '#3b82f6', '#1e293b']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <Physics gravity={[0, 0, 0]}>
        <NPCPreviewInstance instance={previewInstance} isEditMode={false} />
      </Physics>
      <PreviewMarkers state={state} origin={origin} />
    </Canvas>
  );
}

function PreviewMarkers({
  state,
  origin,
}: {
  state: NPCBrainPreviewState;
  origin: [number, number, number];
}) {
  const targetPoint = state.target ? toPreviewPoint(state.target, origin) : null;
  return (
    <group>
      {targetPoint && (
        <mesh position={[targetPoint[0], 0.12, targetPoint[1]]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      )}
      {(state.waypoints ?? []).map((point, index) => {
        const local = toPreviewPoint(point, origin);
        return (
          <mesh key={`${point.join('-')}-${index}`} position={[local[0], 0.1, local[1]]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#34d399" />
          </mesh>
        );
      })}
      {state.mode === 'wander' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[Math.max(0.35, (state.radius ?? 4) * 0.16), Math.max(0.45, (state.radius ?? 4) * 0.16 + 0.07), 48]} />
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.55} />
        </mesh>
      )}
    </group>
  );
}

