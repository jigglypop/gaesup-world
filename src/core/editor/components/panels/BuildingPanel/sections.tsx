import React from 'react';

import {
  appendNPCBlueprintNode,
  appendNPCConditionNodeWithBranchTemplate,
  cloneNPCBlueprintForInstance,
  createNPCActionNode,
  createNPCConditionNode,
  getNPCBlueprintNodeDescription,
  getNPCBlueprintNodeTitle,
  getNPCBlueprintOutgoingLabel,
  removeNPCBlueprintNode,
  resetNPCBlueprint,
} from './helpers';
import { BrainFlow } from './flow';
import {
  BUILDING_FLAG_STYLE_OPTIONS,
  BUILDING_TILE_SHAPE_OPTIONS,
  BUILDING_TREE_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WEATHER_EFFECT_OPTIONS,
  type BuildingTreeKind,
  type BuildingWallKind,
  type FlagStyle,
  type TileShapeType,
  type BuildingWeatherEffect,
} from '../../../../building/types';
import type {
  NPCAnimation,
  NPCBrainBlueprint,
  NPCBrainBlueprintEdge,
  NPCBrainBlueprintNode,
  NPCBrainConfig,
  NPCBrainMode,
  NPCBehaviorConfig,
  NPCBehaviorMode,
  NPCInstance as NPCInstanceData,
  NPCPerceptionConfig,
  NPCTemplate,
} from '../../../../npc/types';
import { FieldColor, FieldRow, FieldToggle } from '../../fields';

export type BuildingPanelAction = {
  id: string;
  label: string;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
};

export function PanelActionsSection({ actions }: { actions: BuildingPanelAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">커스텀 액션</div>
      <div className="building-panel__segmented">
        {actions.map((action) => (
          <button
            key={action.id}
            className="building-panel__segment-btn"
            disabled={action.disabled}
            onClick={() => { void action.onClick(); }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type EnvironmentSectionProps = {
  showSnow: boolean;
  setShowSnow: (show: boolean) => void;
  showFog: boolean;
  setShowFog: (show: boolean) => void;
  fogColor: string;
  setFogColor: (color: string) => void;
  weatherEffect: BuildingWeatherEffect;
  setWeatherEffect: (effect: BuildingWeatherEffect) => void;
};

export function EnvironmentSection({
  showSnow,
  setShowSnow,
  showFog,
  setShowFog,
  fogColor,
  setFogColor,
  weatherEffect,
  setWeatherEffect,
}: EnvironmentSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">전역 환경</div>
      <div className="building-panel__info">
        <FieldRow label="눈">
          <FieldToggle value={showSnow} onChange={setShowSnow} />
        </FieldRow>
        <FieldRow label="안개">
          <FieldToggle value={showFog} onChange={setShowFog} />
        </FieldRow>
        <FieldRow label="안개색">
          <FieldColor value={fogColor} onChange={setFogColor} />
        </FieldRow>
        <div className="building-panel__info-item" style={{ alignItems: 'flex-start' }}>
          <span className="building-panel__info-label">날씨</span>
          <div className="building-panel__grid" style={{ display: "flex" }}>
            {BUILDING_WEATHER_EFFECT_OPTIONS.map((option) => (
              <button
                key={option.type}
                className={`building-panel__grid-btn ${weatherEffect === option.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setWeatherEffect(option.type)}
              >
                {option.labelKo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const OBJECT_ROTATIONS = [
  0,
  Math.PI / 4,
  Math.PI / 2,
  Math.PI * 0.75,
  Math.PI,
  Math.PI * 1.25,
  Math.PI * 1.5,
  Math.PI * 1.75,
];

export type ObjectRotationSectionProps = {
  currentObjectRotation: number;
  setObjectRotation: (rotation: number) => void;
};

export function ObjectRotationSection({
  currentObjectRotation,
  setObjectRotation,
}: ObjectRotationSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">오브젝트 회전</div>
      <div className="building-panel__grid">
        {OBJECT_ROTATIONS.map((rotation, index) => (
          <button
            key={rotation}
            className={`building-panel__grid-btn ${Math.abs(currentObjectRotation - rotation) < 0.01 ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setObjectRotation(rotation)}
          >
            {index * 45}
          </button>
        ))}
      </div>
    </div>
  );
}

export type RotationOption = {
  value: number;
  label: string;
};

export type PlacementSectionProps = {
  isTileMode: boolean;
  currentTileMultiplier: number;
  setTileMultiplier: (multiplier: number) => void;
  currentTileHeight: number;
  setTileHeight: (height: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snapToGrid: boolean) => void;
  currentTileShape: TileShapeType;
  setTileShape: (shape: TileShapeType) => void;
  currentTileRotation: number;
  setTileRotation: (rotation: number) => void;
  rotations: RotationOption[];
  selectedTileId: string | null;
  hasSelectedTileGroup: boolean;
  onDeleteSelectedTile: () => void;
};

export function PlacementSection({
  isTileMode,
  currentTileMultiplier,
  setTileMultiplier,
  currentTileHeight,
  setTileHeight,
  snapToGrid,
  setSnapToGrid,
  currentTileShape,
  setTileShape,
  currentTileRotation,
  setTileRotation,
  rotations,
  selectedTileId,
  hasSelectedTileGroup,
  onDeleteSelectedTile,
}: PlacementSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">배치 설정</div>
      <div className="building-panel__info">
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">크기</span>
          <div className="building-panel__stepper">
            <button
              className="building-panel__stepper-btn"
              onClick={() => setTileMultiplier(Math.max(1, currentTileMultiplier - 1))}
            >
              -
            </button>
            <span className="building-panel__stepper-value">{currentTileMultiplier}</span>
            <button
              className="building-panel__stepper-btn"
              onClick={() => setTileMultiplier(Math.min(4, currentTileMultiplier + 1))}
            >
              +
            </button>
          </div>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">격자 맞춤</span>
          <button
            className={`building-panel__toggle ${snapToGrid ? 'building-panel__toggle--on' : ''}`}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            {snapToGrid ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">높이</span>
          <div className="building-panel__stepper">
            <button
              className="building-panel__stepper-btn"
              onClick={() => setTileHeight(Math.max(0, currentTileHeight - 1))}
            >
              -
            </button>
            <span className="building-panel__stepper-value">{currentTileHeight}</span>
            <button
              className="building-panel__stepper-btn"
              onClick={() => setTileHeight(Math.min(6, currentTileHeight + 1))}
            >
              +
            </button>
          </div>
        </div>
      </div>
      {isTileMode && (
        <>
          <div className="building-panel__section-subtitle">타일 형태</div>
          <div className="building-panel__grid">
            {BUILDING_TILE_SHAPE_OPTIONS.map((shape) => (
              <button
                key={shape.type}
                className={`building-panel__grid-btn ${currentTileShape === shape.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setTileShape(shape.type)}
              >
                {shape.labelKo}
              </button>
            ))}
          </div>
          <div className="building-panel__section-subtitle">타일 회전</div>
          <div className="building-panel__segmented">
            {rotations.map((rotation) => (
              <button
                key={rotation.value}
                className={`building-panel__segment-btn ${Math.abs(currentTileRotation - rotation.value) < 0.0001 ? 'building-panel__segment-btn--active' : ''}`}
                onClick={() => setTileRotation(rotation.value)}
              >
                {rotation.label}
              </button>
            ))}
          </div>
          <div className="building-panel__delete-card">
            <div>
              <strong>선택한 타일</strong>
              <span>{selectedTileId ? `ID: ${selectedTileId}` : '타일 하이라이트를 클릭해 선택하세요'}</span>
            </div>
            <button
              className="building-panel__delete-button"
              disabled={!selectedTileId || !hasSelectedTileGroup}
              onClick={onDeleteSelectedTile}
            >
              선택 타일 삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export type BlockEditSectionProps = {
  currentTileMultiplier: number;
  currentTileHeight: number;
  selectedBlockId: string | null;
  onDeleteSelectedBlock: () => void;
};

export function BlockEditSection({
  currentTileMultiplier,
  currentTileHeight,
  selectedBlockId,
  onDeleteSelectedBlock,
}: BlockEditSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">박스 편집</div>
      <div className="building-panel__info">
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">박스 크기</span>
          <span className="building-panel__info-value">{currentTileMultiplier} x {currentTileMultiplier}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">쌓기 높이</span>
          <span className="building-panel__info-value">{currentTileHeight}</span>
        </div>
      </div>
      <div className="building-panel__delete-card">
        <div>
          <strong>선택한 박스</strong>
          <span>{selectedBlockId ? `ID: ${selectedBlockId}` : '박스 하이라이트를 클릭해 선택하세요'}</span>
        </div>
        <button
          className="building-panel__delete-button"
          disabled={!selectedBlockId}
          onClick={onDeleteSelectedBlock}
        >
          선택 박스 삭제
        </button>
      </div>
    </div>
  );
}

export type WallModuleSectionProps = {
  currentWallKind: BuildingWallKind;
  currentWallKindLabel: string;
  setWallKind: (kind: BuildingWallKind) => void;
  currentWallRotation: number;
  setWallRotation: (rotation: number) => void;
  rotations: RotationOption[];
  selectedWallId: string | null;
  hasSelectedWallGroup: boolean;
  onFlipSelectedWall: () => void;
  onDeleteSelectedWall: () => void;
};

export function WallModuleSection({
  currentWallKind,
  currentWallKindLabel,
  setWallKind,
  currentWallRotation,
  setWallRotation,
  rotations,
  selectedWallId,
  hasSelectedWallGroup,
  onFlipSelectedWall,
  onDeleteSelectedWall,
}: WallModuleSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">벽 모듈 / 회전 / 삭제</div>
      <div className="building-panel__section-subtitle">벽 모듈: {currentWallKindLabel}</div>
      <div className="building-panel__grid">
        {BUILDING_WALL_KIND_OPTIONS.map((kind) => (
          <button
            key={kind.type}
            className={`building-panel__grid-btn ${currentWallKind === kind.type ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setWallKind(kind.type)}
          >
            {kind.labelKo}
          </button>
        ))}
      </div>
      <div className="building-panel__segmented">
        {rotations.map((rotation) => (
          <button
            key={rotation.value}
            className={`building-panel__segment-btn ${Math.abs(currentWallRotation - rotation.value) < 0.0001 ? 'building-panel__segment-btn--active' : ''}`}
            onClick={() => setWallRotation(rotation.value)}
          >
            {rotation.label}
          </button>
        ))}
      </div>
      <div className="building-panel__delete-card">
        <div>
          <strong>선택한 벽</strong>
          <span>{selectedWallId ? `ID: ${selectedWallId}` : '벽 마커를 클릭해 선택하세요'}</span>
        </div>
        <button
          className="building-panel__delete-button"
          disabled={!selectedWallId || !hasSelectedWallGroup}
          onClick={onFlipSelectedWall}
        >
          내외부 뒤집기
        </button>
        <button
          className="building-panel__delete-button"
          disabled={!selectedWallId || !hasSelectedWallGroup}
          onClick={onDeleteSelectedWall}
        >
          선택 벽 삭제
        </button>
      </div>
    </div>
  );
}

export type NPCTemplateSectionProps = {
  templates: NPCTemplate[];
  selectedTemplateId: string | null | undefined;
  setSelectedTemplate: (templateId: string) => void;
};

export function NPCTemplateSection({
  templates,
  selectedTemplateId,
  setSelectedTemplate,
}: NPCTemplateSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">NPC 템플릿</div>
      <div className="building-panel__asset-targets">
        <span>현재 템플릿: {selectedTemplateId ?? '선택 없음'}</span>
        <span>월드 클릭 위치에 선택 NPC를 배치합니다.</span>
      </div>
      <div className="building-panel__grid">
        {templates.map((template) => (
          <button
            key={template.id}
            className={`building-panel__grid-btn ${selectedTemplateId === template.id ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            {template.name}
          </button>
        ))}
        {templates.length === 0 && (
          <div className="building-panel__empty">사용 가능한 NPC 템플릿이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

type HoverPosition = {
  x: number;
  y: number;
  z: number;
} | null;

export type NPCMovementSectionProps = {
  instance: NPCInstanceData;
  hoverPosition: HoverPosition;
  updateBehavior: (id: string, updates: Partial<NPCBehaviorConfig>) => void;
  setNavigation: (id: string, waypoints: [number, number, number][], speed?: number) => void;
  clearNavigation: (id: string) => void;
};

const NPC_BEHAVIOR_MODES: NPCBehaviorMode[] = ['idle', 'patrol', 'wander'];

export function NPCMovementSection({
  instance,
  hoverPosition,
  updateBehavior,
  setNavigation,
  clearNavigation,
}: NPCMovementSectionProps) {
  const speed = instance.behavior?.speed ?? 2.2;
  const wanderRadius = instance.behavior?.wanderRadius ?? 4;
  const waypoints = instance.behavior?.waypoints ?? [];
  const hoverLabel = hoverPosition
    ? `${hoverPosition.x.toFixed(1)}, ${hoverPosition.z.toFixed(1)}`
    : '없음';

  return (
    <>
      <div className="building-panel__section-subtitle">행동 모드</div>
      <div className="building-panel__segmented">
        {NPC_BEHAVIOR_MODES.map((mode) => (
          <button
            key={mode}
            className={`building-panel__segment-btn ${instance.behavior?.mode === mode ? 'building-panel__segment-btn--active' : ''}`}
            onClick={() => {
              updateBehavior(instance.id, { mode, speed });
              if (mode === 'idle') clearNavigation(instance.id);
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="building-panel__info">
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">이동 속도</span>
          <div className="building-panel__stepper">
            <button
              className="building-panel__stepper-btn"
              onClick={() => updateBehavior(instance.id, { speed: Math.max(0.4, speed - 0.4) })}
            >
              -
            </button>
            <span className="building-panel__stepper-value">{speed.toFixed(1)}</span>
            <button
              className="building-panel__stepper-btn"
              onClick={() => updateBehavior(instance.id, { speed: Math.min(7, speed + 0.4) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="building-panel__info-item">
          <span className="building-panel__info-label">배회 반경</span>
          <div className="building-panel__stepper">
            <button
              className="building-panel__stepper-btn"
              onClick={() => updateBehavior(instance.id, { wanderRadius: Math.max(1, wanderRadius - 1) })}
            >
              -
            </button>
            <span className="building-panel__stepper-value">{wanderRadius}m</span>
            <button
              className="building-panel__stepper-btn"
              onClick={() => updateBehavior(instance.id, { wanderRadius: Math.min(30, wanderRadius + 1) })}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="building-panel__section-subtitle">웨이포인트</div>
      <div className="building-panel__asset-targets">
        <span>{waypoints.length}개 지정됨</span>
        <span>호버 위치: {hoverLabel}</span>
      </div>
      <div className="building-panel__segmented">
        <button
          className="building-panel__segment-btn"
          disabled={!hoverPosition}
          onClick={() => {
            if (!hoverPosition) return;
            const point: [number, number, number] = [hoverPosition.x, hoverPosition.y, hoverPosition.z];
            updateBehavior(instance.id, {
              mode: 'patrol',
              waypoints: [...waypoints, point],
            });
          }}
        >
          호버 위치 추가
        </button>
        <button
          className="building-panel__segment-btn"
          disabled={waypoints.length === 0}
          onClick={() => {
            if (waypoints.length === 0) return;
            updateBehavior(instance.id, { mode: 'patrol', waypoints });
            setNavigation(instance.id, waypoints, speed);
          }}
        >
          순찰 시작
        </button>
        <button
          className="building-panel__segment-btn"
          onClick={() => {
            updateBehavior(instance.id, { waypoints: [] });
            clearNavigation(instance.id);
          }}
        >
          경로 초기화
        </button>
        <button
          className="building-panel__segment-btn"
          disabled={!hoverPosition}
          onClick={() => {
            if (!hoverPosition) return;
            const target: [number, number, number] = [hoverPosition.x, hoverPosition.y, hoverPosition.z];
            updateBehavior(instance.id, { mode: 'idle' });
            setNavigation(instance.id, [target], speed);
          }}
        >
          호버 위치로 1회 이동
        </button>
      </div>
    </>
  );
}

export type NPCAnimationSectionProps = {
  instance: NPCInstanceData;
  animations: NPCAnimation[];
  updateInstance: (id: string, updates: Partial<NPCInstanceData>) => void;
  updateBehavior: (id: string, updates: Partial<NPCBehaviorConfig>) => void;
};

export function NPCAnimationSection({
  instance,
  animations,
  updateInstance,
  updateBehavior,
}: NPCAnimationSectionProps) {
  const applyAnimation = (animationId: string) => {
    updateInstance(instance.id, { currentAnimation: animationId });
    updateBehavior(instance.id, {
      mode: 'idle',
      idleAnimation: animationId,
      arriveAnimation: animationId,
    });
  };

  return (
    <>
      <div className="building-panel__section-subtitle">애니메이션</div>
      <div className="building-panel__grid">
        {animations.map((animation) => (
          <button
            key={animation.id}
            className={`building-panel__grid-btn ${instance.currentAnimation === animation.id ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => applyAnimation(animation.id)}
          >
            {animation.name}
          </button>
        ))}
      </div>
      <div className="building-panel__segmented">
        {animations.map((animation) => (
          <button
            key={`move-${animation.id}`}
            className={`building-panel__segment-btn ${instance.behavior?.moveAnimation === animation.id ? 'building-panel__segment-btn--active' : ''}`}
            onClick={() => updateBehavior(instance.id, { moveAnimation: animation.id })}
          >
            이동:{animation.name}
          </button>
        ))}
      </div>
      <div className="building-panel__segmented">
        {animations.map((animation) => (
          <button
            key={`idle-${animation.id}`}
            className={`building-panel__segment-btn ${instance.behavior?.idleAnimation === animation.id ? 'building-panel__segment-btn--active' : ''}`}
            onClick={() => updateBehavior(instance.id, { idleAnimation: animation.id, arriveAnimation: animation.id })}
          >
            대기:{animation.name}
          </button>
        ))}
      </div>
    </>
  );
}

const NPC_BRAIN_MODES: NPCBrainMode[] = ['none', 'scripted', 'llm', 'reinforcement'];
const NPC_QUEST_STATUS_OPTIONS = ['locked', 'available', 'active', 'completed', 'failed'] as const;
const NPC_CONDITION_TYPES = [
  'always',
  'navigationIdle',
  'perceivedAny',
  'questStatus',
  'friendshipAtLeast',
  'memoryEquals',
] as const;
const NPC_ACTION_TYPES = [
  'idle',
  'moveTo',
  'patrol',
  'wander',
  'playAnimation',
  'lookAt',
  'speak',
  'interact',
  'remember',
  'moveToTarget',
] as const;

export type NPCBrainSectionProps = {
  instance: NPCInstanceData;
  blueprints: NPCBrainBlueprint[];
  selectedBlueprint: NPCBrainBlueprint | undefined;
  updateBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
  addBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
  updateBrainBlueprint: (id: string, updates: NPCBrainBlueprint) => void;
};

export function NPCBrainSection({
  instance,
  blueprints,
  selectedBlueprint,
  updateBrain,
  addBrainBlueprint,
  updateBrainBlueprint,
}: NPCBrainSectionProps) {
  const brainEditorRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [edgeIntegrityMessage, setEdgeIntegrityMessage] = React.useState<string>('');
  const [showBlueprintWorkbench, setShowBlueprintWorkbench] = React.useState(false);
  const [showReactFlowView, setShowReactFlowView] = React.useState(true);
  const [activeNpcTab, setActiveNpcTab] = React.useState<'nodes' | 'inspector'>('nodes');
  const [isInEditorModal, setIsInEditorModal] = React.useState(false);

  React.useEffect(() => {
    const element = brainEditorRef.current;
    if (!element) return;
    setIsInEditorModal(Boolean(element.closest('.editor-panel-modal')));
  }, [selectedBlueprint]);

  React.useEffect(() => {
    if (!isInEditorModal) return;
    if (showBlueprintWorkbench) setShowBlueprintWorkbench(false);
    if (!showReactFlowView) setShowReactFlowView(true);
  }, [isInEditorModal, showBlueprintWorkbench, showReactFlowView]);

  React.useEffect(() => {
    if (!selectedBlueprint) {
      setSelectedNodeId(null);
      setShowBlueprintWorkbench(false);
      setShowReactFlowView(true);
      setActiveNpcTab('nodes');
      return;
    }
    const exists = selectedNodeId
      ? selectedBlueprint.nodes.some((node) => node.id === selectedNodeId && node.type !== 'start')
      : false;
    if (exists) return;
    const firstEditable = selectedBlueprint.nodes.find((node) => node.type !== 'start');
    setSelectedNodeId(firstEditable?.id ?? null);
  }, [selectedBlueprint, selectedNodeId]);

  const updateSelectedNode = (updater: (node: NPCBrainBlueprintNode) => NPCBrainBlueprintNode) => {
    if (!selectedBlueprint || !selectedNodeId) return;
    const nextNodes = selectedBlueprint.nodes.map((node) => {
      if (node.id !== selectedNodeId || node.type === 'start') return node;
      return updater(node);
    });
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      nodes: nextNodes,
    });
  };

  const selectedNode = selectedBlueprint?.nodes.find(
    (node): node is Exclude<NPCBrainBlueprintNode, { type: 'start' }> =>
      node.id === selectedNodeId && node.type !== 'start',
  );
  const primaryStartNode = selectedBlueprint?.nodes.find((node) => node.type === 'start') ?? null;
  const blueprintNodeIds = React.useMemo(
    () => new Set((selectedBlueprint?.nodes ?? []).map((node) => node.id)),
    [selectedBlueprint],
  );
  const danglingEdges = React.useMemo(
    () =>
      (selectedBlueprint?.edges ?? []).filter((edge) =>
        !blueprintNodeIds.has(edge.source) || !blueprintNodeIds.has(edge.target),
      ),
    [blueprintNodeIds, selectedBlueprint],
  );
  const reachableNodeIds = React.useMemo(() => {
    if (!selectedBlueprint) return new Set<string>();
    const adjacency = new Map<string, string[]>();
    for (const edge of selectedBlueprint.edges) {
      if (!blueprintNodeIds.has(edge.source) || !blueprintNodeIds.has(edge.target)) continue;
      const list = adjacency.get(edge.source) ?? [];
      list.push(edge.target);
      adjacency.set(edge.source, list);
    }
    const visited = new Set<string>();
    const startNodes = selectedBlueprint.nodes.filter((node) => node.type === 'start');
    const queue = startNodes.map((node) => node.id);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const nextTargets = adjacency.get(current) ?? [];
      for (const nextTarget of nextTargets) {
        if (!visited.has(nextTarget)) {
          queue.push(nextTarget);
        }
      }
    }
    return visited;
  }, [blueprintNodeIds, selectedBlueprint]);
  const orphanNodeIds = React.useMemo(
    () =>
      new Set(
        (selectedBlueprint?.nodes ?? [])
          .filter((node) => node.type !== 'start' && !reachableNodeIds.has(node.id))
          .map((node) => node.id),
      ),
    [reachableNodeIds, selectedBlueprint],
  );
  const conditionBranchIssues = React.useMemo(() => {
    const issues = new Map<string, string[]>();
    if (!selectedBlueprint) return issues;
    for (const node of selectedBlueprint.nodes) {
      if (node.type !== 'condition') continue;
      const outgoing = selectedBlueprint.edges.filter((edge) => edge.source === node.id);
      const branches = outgoing.map((edge) => edge.branch ?? 'next');
      const nextIssues: string[] = [];
      if (!branches.includes('true')) nextIssues.push('true branch 누락');
      if (!branches.includes('false')) nextIssues.push('false branch 누락');
      if (branches.includes('next')) nextIssues.push('condition에는 next 대신 true/false를 권장');
      if (nextIssues.length > 0) {
        issues.set(node.id, nextIssues);
      }
    }
    return issues;
  }, [selectedBlueprint]);
  const availableEdgeNodes = selectedBlueprint?.nodes.filter((node) => node.type !== 'start') ?? [];
  const selectedNodeOutgoingEdges = React.useMemo(
    () => selectedBlueprint?.edges.filter((edge) => edge.source === selectedNodeId) ?? [],
    [selectedBlueprint, selectedNodeId],
  );
  const selectedEdge = selectedNodeOutgoingEdges.find((edge) => edge.id === selectedEdgeId)
    ?? selectedNodeOutgoingEdges[0]
    ?? null;
  const selectedEdgeTarget = selectedBlueprint?.nodes.find((node) => node.id === selectedEdge?.target);

  React.useEffect(() => {
    if (selectedNodeOutgoingEdges.length === 0) {
      setSelectedEdgeId(null);
      return;
    }
    if (!selectedEdgeId || !selectedNodeOutgoingEdges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(selectedNodeOutgoingEdges[0]?.id ?? null);
    }
  }, [selectedEdgeId, selectedNodeOutgoingEdges]);

  React.useEffect(() => {
    if (!selectedBlueprint || danglingEdges.length === 0) return;
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: selectedBlueprint.edges.filter((edge) =>
        blueprintNodeIds.has(edge.source) && blueprintNodeIds.has(edge.target),
      ),
    });
    setEdgeIntegrityMessage(`유효하지 않은 edge ${danglingEdges.length}개를 자동 정리했습니다.`);
  }, [blueprintNodeIds, danglingEdges, selectedBlueprint, updateBrainBlueprint]);

  const getEdgeIntegrityError = (
    source: string,
    target: string,
    ignoreEdgeId?: string,
    edges: NPCBrainBlueprintEdge[] = selectedBlueprint?.edges ?? [],
  ): string | null => {
    if (source === target) {
      return 'self-loop는 허용하지 않습니다.';
    }
    const hasDuplicate = edges.some((edge) =>
      edge.id !== ignoreEdgeId &&
      edge.source === source &&
      edge.target === target,
    );
    if (hasDuplicate) {
      return '동일 source/target edge가 이미 있습니다.';
    }
    return null;
  };

  const updateSelectedEdge = (updater: (edge: NPCBrainBlueprintEdge) => NPCBrainBlueprintEdge) => {
    if (!selectedBlueprint || !selectedEdge) return;
    const nextEdges: NPCBrainBlueprintEdge[] = [];
    for (const edge of selectedBlueprint.edges) {
      if (edge.id !== selectedEdge.id) {
        nextEdges.push(edge);
        continue;
      }
      const candidate = updater(edge);
      const integrityError = getEdgeIntegrityError(candidate.source, candidate.target, edge.id);
      if (integrityError) {
        setEdgeIntegrityMessage(integrityError);
        nextEdges.push(edge);
      } else {
        setEdgeIntegrityMessage('');
        nextEdges.push(candidate);
      }
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
  };
  const recoverOrphanNode = (targetNodeId: string) => {
    if (!selectedBlueprint || !primaryStartNode) return;
    const nextEdge: NPCBrainBlueprintEdge = {
      id: `${primaryStartNode.id}-${targetNodeId}-${Date.now()}`,
      source: primaryStartNode.id,
      target: targetNodeId,
      branch: 'next',
    };
    const integrityError = getEdgeIntegrityError(nextEdge.source, nextEdge.target);
    if (integrityError) {
      setEdgeIntegrityMessage(integrityError);
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...selectedBlueprint.edges, nextEdge],
    });
    setEdgeIntegrityMessage(`orphan 노드 ${targetNodeId}를 start에 연결했습니다.`);
  };
  const recoverAllOrphans = () => {
    if (!selectedBlueprint || !primaryStartNode || orphanNodeIds.size === 0) return;
    let recoveredCount = 0;
    const nextEdges = [...selectedBlueprint.edges];
    for (const orphanNodeId of orphanNodeIds) {
      const integrityError = getEdgeIntegrityError(
        primaryStartNode.id,
        orphanNodeId,
        undefined,
        nextEdges,
      );
      if (integrityError) continue;
      nextEdges.push({
        id: `${primaryStartNode.id}-${orphanNodeId}-${Date.now()}-${recoveredCount}`,
        source: primaryStartNode.id,
        target: orphanNodeId,
        branch: 'next',
      });
      recoveredCount += 1;
    }
    if (recoveredCount === 0) {
      setEdgeIntegrityMessage('복구 가능한 orphan 노드가 없습니다.');
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
    setEdgeIntegrityMessage(`orphan 노드 ${recoveredCount}개를 start에 연결했습니다.`);
  };
  const addOutgoingEdge = () => {
    if (!selectedBlueprint || !selectedNodeId) return;
    const fallbackTarget = availableEdgeNodes.find((node) =>
      node.id !== selectedNodeId &&
      !selectedBlueprint.edges.some((edge) => edge.source === selectedNodeId && edge.target === node.id),
    );
    if (!fallbackTarget) return;
    const newEdge: NPCBrainBlueprintEdge = {
      id: `${selectedNodeId}-${fallbackTarget.id}-${Date.now()}`,
      source: selectedNodeId,
      target: fallbackTarget.id,
      branch: 'next',
    };
    const integrityError = getEdgeIntegrityError(newEdge.source, newEdge.target);
    if (integrityError) {
      setEdgeIntegrityMessage(integrityError);
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...selectedBlueprint.edges, newEdge],
    });
    setEdgeIntegrityMessage('');
    setSelectedEdgeId(newEdge.id);
  };
  const removeSelectedEdge = () => {
    if (!selectedBlueprint || !selectedEdge) return;
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: selectedBlueprint.edges.filter((edge) => edge.id !== selectedEdge.id),
    });
    setEdgeIntegrityMessage('');
    setSelectedEdgeId(null);
  };
  const addConditionBranchEdge = (
    conditionNodeId: string,
    branch: 'true' | 'false',
  ) => {
    if (!selectedBlueprint) return;
    const conditionNode = selectedBlueprint.nodes.find((node) => node.id === conditionNodeId);
    if (!conditionNode || conditionNode.type !== 'condition') return;
    const hasBranch = selectedBlueprint.edges.some((edge) =>
      edge.source === conditionNodeId && (edge.branch ?? 'next') === branch,
    );
    if (hasBranch) return;
    const nextEdges = [...selectedBlueprint.edges];
    const targetCandidate = availableEdgeNodes.find((node) =>
      node.id !== conditionNodeId &&
      !nextEdges.some((edge) => edge.source === conditionNodeId && edge.target === node.id),
    );
    if (!targetCandidate) {
      setEdgeIntegrityMessage(`branch ${branch}를 추가할 타겟 노드를 찾을 수 없습니다.`);
      return;
    }
    const integrityError = getEdgeIntegrityError(
      conditionNodeId,
      targetCandidate.id,
      undefined,
      nextEdges,
    );
    if (integrityError) {
      setEdgeIntegrityMessage(integrityError);
      return;
    }
    const newEdge: NPCBrainBlueprintEdge = {
      id: `${conditionNodeId}-${branch}-${targetCandidate.id}-${Date.now()}`,
      source: conditionNodeId,
      target: targetCandidate.id,
      branch,
    };
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...nextEdges, newEdge],
    });
    setSelectedEdgeId(newEdge.id);
    setEdgeIntegrityMessage(`condition ${conditionNodeId}에 ${branch} branch를 추가했습니다.`);
  };
  const fixConditionBranches = (conditionNodeId: string) => {
    if (!selectedBlueprint) return;
    const issues = conditionBranchIssues.get(conditionNodeId) ?? [];
    const needsTrue = issues.some((issue) => issue.startsWith('true branch'));
    const needsFalse = issues.some((issue) => issue.startsWith('false branch'));
    if (!needsTrue && !needsFalse) return;
    const nextEdges = [...selectedBlueprint.edges];
    const missingBranches = [
      ...(needsTrue ? (['true'] as const) : []),
      ...(needsFalse ? (['false'] as const) : []),
    ];
    let addedCount = 0;
    for (const branch of missingBranches) {
      const hasBranch = nextEdges.some((edge) =>
        edge.source === conditionNodeId && (edge.branch ?? 'next') === branch,
      );
      if (hasBranch) continue;
      const targetCandidate = availableEdgeNodes.find((node) =>
        node.id !== conditionNodeId &&
        !nextEdges.some((edge) => edge.source === conditionNodeId && edge.target === node.id),
      );
      if (!targetCandidate) continue;
      const integrityError = getEdgeIntegrityError(
        conditionNodeId,
        targetCandidate.id,
        undefined,
        nextEdges,
      );
      if (integrityError) continue;
      nextEdges.push({
        id: `${conditionNodeId}-${branch}-${targetCandidate.id}-${Date.now()}-${addedCount}`,
        source: conditionNodeId,
        target: targetCandidate.id,
        branch,
      });
      addedCount += 1;
    }
    if (addedCount === 0) {
      setEdgeIntegrityMessage('자동 보완할 분기를 찾지 못했습니다.');
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
    setEdgeIntegrityMessage(`누락 분기 ${addedCount}개를 자동 보완했습니다.`);
  };

  const parseNumeric = (value: string, fallback: number): number => {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  };
  const updateVectorAxis = (
    vector: [number, number, number],
    axis: 0 | 1 | 2,
    rawValue: string,
  ): [number, number, number] => {
    const next = [...vector] as [number, number, number];
    next[axis] = parseNumeric(rawValue, vector[axis]);
    return next;
  };

  return (
    <>
      <div className="building-panel__info-item">
        <span className="building-panel__info-label">AI 두뇌</span>
        <div className="building-panel__segmented">
          {NPC_BRAIN_MODES.map((mode) => (
            <button
              key={mode}
              className={`building-panel__segment-btn ${instance.brain?.mode === mode ? 'building-panel__segment-btn--active' : ''}`}
              onClick={() => updateBrain(instance.id, { mode })}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="building-panel__section-subtitle">행동 블루프린트</div>
      <div className="building-panel__grid">
        <button
          className={`building-panel__grid-btn ${!instance.brain?.blueprintId ? 'building-panel__grid-btn--active' : ''}`}
          onClick={() => updateBrain(instance.id, { blueprintId: '' })}
        >
          없음
        </button>
        {blueprints.map((blueprint) => (
          <button
            key={blueprint.id}
            className={`building-panel__grid-btn ${instance.brain?.blueprintId === blueprint.id ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => updateBrain(instance.id, {
              mode: 'scripted',
              blueprintId: blueprint.id,
            })}
            title={blueprint.description}
          >
            {blueprint.name}
          </button>
        ))}
      </div>
      {selectedBlueprint && (
        <>
          {showBlueprintWorkbench && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(6, 10, 18, 0.62)',
                zIndex: 188,
              }}
              onClick={() => setShowBlueprintWorkbench(false)}
            />
          )}
          <div
            ref={brainEditorRef}
            className="building-panel__node-editor"
            style={showBlueprintWorkbench
              ? {
                  position: 'fixed',
                  top: '72px',
                  left: '24px',
                  right: '24px',
                  bottom: '24px',
                  zIndex: 189,
                  margin: 0,
                  padding: '12px',
                  overflow: 'auto',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '10px',
                  background: 'rgba(18, 24, 40, 0.98)',
                }
              : undefined}
          >
          <div className="building-panel__asset-targets">
            <span>{selectedBlueprint.name}</span>
            <span>{selectedBlueprint.nodes.length} nodes · {selectedBlueprint.edges.length} edges</span>
          </div>
          <div className="building-panel__segmented">
            <button
              className="building-panel__segment-btn"
              onClick={() => {
                const cloned = cloneNPCBlueprintForInstance(selectedBlueprint, instance.id);
                addBrainBlueprint(cloned);
                updateBrain(instance.id, {
                  mode: 'scripted',
                  blueprintId: cloned.id,
                });
              }}
            >
              전용 복제본
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, resetNPCBlueprint(selectedBlueprint))}
            >
              초기화
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => {
                if (isInEditorModal) return;
                setShowBlueprintWorkbench((prev) => !prev);
              }}
              disabled={isInEditorModal}
            >
              {isInEditorModal ? '모달에서 확장 고정' : showBlueprintWorkbench ? '워크벤치 닫기' : '워크벤치 확장'}
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => setShowReactFlowView((prev) => !prev)}
            >
              {showReactFlowView ? '리액트 노드 숨기기' : '리액트 노드 보기'}
            </button>
          </div>
          {showReactFlowView && (
            <div
              className="building-panel__brain-canvas"
              style={{
                height: isInEditorModal ? '56vh' : showBlueprintWorkbench ? '46vh' : '260px',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '8px',
                background: '#0f172a',
              }}
            >
              <BrainFlow
                blueprint={selectedBlueprint}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onSelectNode={setSelectedNodeId}
                onSelectEdge={setSelectedEdgeId}
              />
            </div>
          )}
          <div className="building-panel__brain-tabs">
            <button
              type="button"
              className={`building-panel__brain-tab ${activeNpcTab === 'nodes' ? 'building-panel__brain-tab--active' : ''}`}
              onClick={() => setActiveNpcTab('nodes')}
            >
              노드 목록
            </button>
            <button
              type="button"
              className={`building-panel__brain-tab ${activeNpcTab === 'inspector' ? 'building-panel__brain-tab--active' : ''}`}
              onClick={() => setActiveNpcTab('inspector')}
            >
              노드 인스펙터
            </button>
          </div>
          {activeNpcTab === 'nodes' && (
            <div className="building-panel__node-list">
              {selectedBlueprint.nodes.map((node) => (
                <div
                  key={node.id}
                  className="building-panel__node-card"
                  style={node.id === selectedNodeId
                    ? { borderColor: '#6dd3ff', boxShadow: '0 0 0 1px #6dd3ff' }
                    : orphanNodeIds.has(node.id)
                      ? { borderColor: '#f59e0b', boxShadow: '0 0 0 1px #f59e0b' }
                      : undefined}
                  onClick={() => {
                    if (node.type === 'start') return;
                    setSelectedNodeId(node.id);
                    setActiveNpcTab('inspector');
                  }}
                >
                  <div className="building-panel__node-card-header">
                    <div className="building-panel__node-card-title">{getNPCBlueprintNodeTitle(node)}</div>
                    {node.type !== 'start' && (
                      <button
                        className="building-panel__node-card-action"
                        onClick={() => updateBrainBlueprint(
                          selectedBlueprint.id,
                          removeNPCBlueprintNode(selectedBlueprint, node.id),
                        )}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="building-panel__node-card-desc">{getNPCBlueprintNodeDescription(node)}</div>
                  <div className="building-panel__node-card-edge">
                    {getNPCBlueprintOutgoingLabel(selectedBlueprint, node.id)}
                  </div>
                  {orphanNodeIds.has(node.id) && (
                    <div className="building-panel__node-card-edge" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span>도달 불가(orphan) 노드</span>
                      <button
                        className="building-panel__node-card-action"
                        onClick={(event) => {
                          event.stopPropagation();
                          recoverOrphanNode(node.id);
                        }}
                        disabled={!primaryStartNode}
                      >
                        start 연결
                      </button>
                    </div>
                  )}
                  {conditionBranchIssues.has(node.id) && (
                    <div className="building-panel__node-card-edge" style={{ color: '#f59e0b' }}>
                      {conditionBranchIssues.get(node.id)?.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {activeNpcTab === 'inspector' && selectedNode && (
            <div className="building-panel__info" style={{ marginTop: '8px' }}>
              <div className="building-panel__section-subtitle">노드 인스펙터</div>
              <FieldRow label="라벨">
                <input
                  value={selectedNode.label ?? ''}
                  onChange={(event) => updateSelectedNode((node) => ({ ...node, label: event.target.value }))}
                  style={{ width: '100%' }}
                />
              </FieldRow>
              <FieldRow label="Outgoing Edge">
                <select
                  value={selectedEdge?.id ?? ''}
                  onChange={(event) => setSelectedEdgeId(event.target.value || null)}
                  style={{ width: '100%' }}
                  disabled={selectedNodeOutgoingEdges.length === 0}
                >
                  {selectedNodeOutgoingEdges.length === 0 && (
                    <option value="">다음 없음</option>
                  )}
                  {selectedNodeOutgoingEdges.map((edge) => (
                    <option key={edge.id} value={edge.id}>
                      {(edge.branch ?? 'next')}{' -> '}{selectedBlueprint?.nodes.find((node) => node.id === edge.target)?.label ?? edge.target}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <div className="building-panel__segmented">
                <button
                  className="building-panel__segment-btn"
                  onClick={addOutgoingEdge}
                  disabled={!selectedNode || availableEdgeNodes.length <= 1 || !availableEdgeNodes.some((node) =>
                    node.id !== selectedNode.id &&
                    !selectedBlueprint.edges.some((edge) => edge.source === selectedNode.id && edge.target === node.id),
                  )}
                >
                  엣지 추가
                </button>
                <button
                  className="building-panel__segment-btn"
                  onClick={removeSelectedEdge}
                  disabled={!selectedEdge}
                >
                  엣지 삭제
                </button>
              </div>
              {(danglingEdges.length > 0 || orphanNodeIds.size > 0) && (
                <FieldRow label="그래프 상태">
                  <span>
                    dangling edge {danglingEdges.length} · orphan node {orphanNodeIds.size}
                  </span>
                </FieldRow>
              )}
              {orphanNodeIds.size > 0 && (
                <div className="building-panel__segmented">
                  <button
                    className="building-panel__segment-btn"
                    onClick={recoverAllOrphans}
                    disabled={!primaryStartNode}
                  >
                    orphan 전체 복구
                  </button>
                  <button
                    className="building-panel__segment-btn"
                    onClick={() => {
                      if (!selectedNode || !orphanNodeIds.has(selectedNode.id)) return;
                      recoverOrphanNode(selectedNode.id);
                    }}
                    disabled={!selectedNode || !orphanNodeIds.has(selectedNode.id) || !primaryStartNode}
                  >
                    선택 노드 복구
                  </button>
                </div>
              )}
              {edgeIntegrityMessage && (
                <FieldRow label="그래프 규칙">
                  <span>{edgeIntegrityMessage}</span>
                </FieldRow>
              )}
              {selectedEdge && (
                <>
                  <FieldRow label="Source">
                    <select
                      value={selectedEdge.source}
                      onChange={(event) => updateSelectedEdge((edge) => ({
                        ...edge,
                        source: event.target.value,
                      }))}
                      style={{ width: '100%' }}
                    >
                      {availableEdgeNodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {getNPCBlueprintNodeTitle(node)}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                  <FieldRow label="Branch">
                    <select
                      value={selectedEdge.branch ?? 'next'}
                      onChange={(event) => updateSelectedEdge((edge) => ({
                        ...edge,
                        branch: event.target.value as 'true' | 'false' | 'next',
                      }))}
                      style={{ width: '100%' }}
                    >
                      <option value="next">next</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </FieldRow>
                  <FieldRow label="Target">
                    <select
                      value={selectedEdge.target}
                      onChange={(event) => updateSelectedEdge((edge) => ({
                        ...edge,
                        target: event.target.value,
                      }))}
                      style={{ width: '100%' }}
                    >
                      {availableEdgeNodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {getNPCBlueprintNodeTitle(node)}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                  {!selectedEdgeTarget && (
                    <FieldRow label="주의">
                      <span>타겟 노드를 찾을 수 없습니다.</span>
                    </FieldRow>
                  )}
                </>
              )}
              {selectedNode.type === 'condition' && conditionBranchIssues.has(selectedNode.id) && (
                <>
                  <FieldRow label="Branch 검증">
                    <span>{conditionBranchIssues.get(selectedNode.id)?.join(' · ')}</span>
                  </FieldRow>
                  <div className="building-panel__segmented">
                    <button
                      className="building-panel__segment-btn"
                      onClick={() => addConditionBranchEdge(selectedNode.id, 'true')}
                      disabled={selectedNodeOutgoingEdges.some((edge) => (edge.branch ?? 'next') === 'true')}
                    >
                      true 분기 추가
                    </button>
                    <button
                      className="building-panel__segment-btn"
                      onClick={() => addConditionBranchEdge(selectedNode.id, 'false')}
                      disabled={selectedNodeOutgoingEdges.some((edge) => (edge.branch ?? 'next') === 'false')}
                    >
                      false 분기 추가
                    </button>
                    <button
                      className="building-panel__segment-btn"
                      onClick={() => fixConditionBranches(selectedNode.id)}
                    >
                      누락 분기 자동 보완
                    </button>
                  </div>
                </>
              )}
              {selectedNode.type === 'condition' && (
                <>
                  <FieldRow label="조건 타입">
                    <select
                      value={selectedNode.condition.type}
                      onChange={(event) => {
                        const nextType = event.target.value as (typeof NPC_CONDITION_TYPES)[number];
                        updateSelectedNode((node) => {
                          if (node.type !== 'condition') return node;
                          switch (nextType) {
                            case 'always':
                              return { ...node, condition: { type: 'always' } };
                            case 'navigationIdle':
                              return { ...node, condition: { type: 'navigationIdle' } };
                            case 'perceivedAny':
                              return { ...node, condition: { type: 'perceivedAny' } };
                            case 'questStatus':
                              return { ...node, condition: { type: 'questStatus', questId: 'welcome', status: 'active' } };
                            case 'friendshipAtLeast':
                              return { ...node, condition: { type: 'friendshipAtLeast', score: 150 } };
                            case 'memoryEquals':
                              return { ...node, condition: { type: 'memoryEquals', key: 'memory.key', value: true } };
                            default:
                              return node;
                          }
                        });
                      }}
                    >
                      {NPC_CONDITION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FieldRow>
                  {selectedNode.condition.type === 'questStatus' && (
                    <>
                      <FieldRow label="Quest ID">
                        <input
                          value={selectedNode.condition.questId}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'condition' || node.condition.type !== 'questStatus') return node;
                            return { ...node, condition: { ...node.condition, questId: event.target.value } };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Status">
                        <select
                          value={selectedNode.condition.status}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'condition' || node.condition.type !== 'questStatus') return node;
                            return {
                              ...node,
                              condition: {
                                ...node.condition,
                                status: event.target.value as (typeof NPC_QUEST_STATUS_OPTIONS)[number],
                              },
                            };
                          })}
                        >
                          {NPC_QUEST_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.condition.type === 'friendshipAtLeast' && (
                    <>
                      <FieldRow label="NPC ID(optional)">
                        <input
                          value={selectedNode.condition.npcId ?? ''}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'condition' || node.condition.type !== 'friendshipAtLeast') return node;
                            const nextNpcId = event.target.value.trim();
                            return {
                              ...node,
                              condition: {
                                ...node.condition,
                                ...(nextNpcId ? { npcId: nextNpcId } : {}),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Score">
                        <input
                          type="number"
                          value={selectedNode.condition.score}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'condition' || node.condition.type !== 'friendshipAtLeast') return node;
                            const score = Number(event.target.value);
                            return {
                              ...node,
                              condition: {
                                ...node.condition,
                                score: Number.isFinite(score) ? score : node.condition.score,
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                </>
              )}
              {selectedNode.type === 'action' && (
                <>
                  <FieldRow label="액션 타입">
                    <select
                      value={selectedNode.action.type}
                      onChange={(event) => {
                        const nextType = event.target.value as (typeof NPC_ACTION_TYPES)[number];
                        updateSelectedNode((node) => {
                          if (node.type !== 'action') return node;
                          switch (nextType) {
                            case 'idle':
                              return { ...node, action: { type: 'idle', animationId: 'idle' } };
                            case 'moveTo':
                              return { ...node, action: { type: 'moveTo', target: [0, 0, 0], speed: 2.2, animationId: 'walk' } };
                            case 'patrol':
                              return {
                                ...node,
                                action: {
                                  type: 'patrol',
                                  waypoints: [[0, 0, 0], [2, 0, 2]],
                                  speed: 2.2,
                                  loop: true,
                                  animationId: 'walk',
                                },
                              };
                            case 'wander':
                              return { ...node, action: { type: 'wander', radius: 4, speed: 2.2, waitSeconds: 1.5 } };
                            case 'playAnimation':
                              return { ...node, action: { type: 'playAnimation', animationId: 'wave', loop: false, speed: 1 } };
                            case 'lookAt':
                              return { ...node, action: { type: 'lookAt', target: [0, 0, 0] } };
                            case 'speak':
                              return { ...node, action: { type: 'speak', text: '안녕?', duration: 2 } };
                            case 'interact':
                              return { ...node, action: { type: 'interact', targetId: 'target.entity' } };
                            case 'remember':
                              return { ...node, action: { type: 'remember', key: 'memory.key', value: true } };
                            case 'moveToTarget':
                              return {
                                ...node,
                                action: {
                                  type: 'moveToTarget',
                                  target: { type: 'self' },
                                  speed: 2.2,
                                  animationId: 'walk',
                                },
                              };
                            default:
                              return node;
                          }
                        });
                      }}
                    >
                      {NPC_ACTION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FieldRow>
                  {selectedNode.action.type === 'wander' && (
                    <>
                      <FieldRow label="반경">
                        <input
                          type="number"
                          value={selectedNode.action.radius ?? 4}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'wander') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                radius: parseNumeric(event.target.value, node.action.radius ?? 4),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="속도">
                        <input
                          type="number"
                          value={selectedNode.action.speed ?? 2.2}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'wander') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                speed: parseNumeric(event.target.value, node.action.speed ?? 2.2),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="대기(초)">
                        <input
                          type="number"
                          value={selectedNode.action.waitSeconds ?? 1.5}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'wander') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                waitSeconds: parseNumeric(event.target.value, node.action.waitSeconds ?? 1.5),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'speak' && (
                    <>
                      <FieldRow label="대사">
                        <input
                          value={selectedNode.action.text}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'speak') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                text: event.target.value,
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="지속시간(초)">
                        <input
                          type="number"
                          value={selectedNode.action.duration ?? 2}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'speak') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                duration: parseNumeric(event.target.value, node.action.duration ?? 2),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'playAnimation' && (
                    <>
                      <FieldRow label="Animation ID">
                        <input
                          value={selectedNode.action.animationId}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'playAnimation') return node;
                            return { ...node, action: { ...node.action, animationId: event.target.value } };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Loop">
                        <input
                          type="checkbox"
                          checked={selectedNode.action.loop ?? false}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'playAnimation') return node;
                            return { ...node, action: { ...node.action, loop: event.target.checked } };
                          })}
                        />
                      </FieldRow>
                      <FieldRow label="재생속도">
                        <input
                          type="number"
                          value={selectedNode.action.speed ?? 1}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'playAnimation') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                speed: parseNumeric(event.target.value, node.action.speed ?? 1),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'moveToTarget' && (
                    <>
                      <FieldRow label="Target">
                        <select
                          value={selectedNode.action.target.type}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveToTarget') return node;
                            const targetType = event.target.value as 'point' | 'self' | 'nearestPerceived';
                            if (targetType === 'point') {
                              return { ...node, action: { ...node.action, target: { type: 'point', value: [0, 0, 0] } } };
                            }
                            return { ...node, action: { ...node.action, target: { type: targetType } } };
                          })}
                        >
                          <option value="self">self</option>
                          <option value="nearestPerceived">nearestPerceived</option>
                          <option value="point">point</option>
                        </select>
                      </FieldRow>
                      {selectedNode.action.target.type === 'point' && (
                        <>
                          <FieldRow label="Point X">
                            <input
                              type="number"
                              value={selectedNode.action.target.value[0]}
                              onChange={(event) => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveToTarget') return node;
                                if (node.action.target.type !== 'point') return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: {
                                      type: 'point',
                                      value: updateVectorAxis(node.action.target.value, 0, event.target.value),
                                    },
                                  },
                                };
                              })}
                              style={{ width: '100%' }}
                            />
                          </FieldRow>
                          <FieldRow label="Point Y">
                            <input
                              type="number"
                              value={selectedNode.action.target.value[1]}
                              onChange={(event) => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveToTarget') return node;
                                if (node.action.target.type !== 'point') return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: {
                                      type: 'point',
                                      value: updateVectorAxis(node.action.target.value, 1, event.target.value),
                                    },
                                  },
                                };
                              })}
                              style={{ width: '100%' }}
                            />
                          </FieldRow>
                          <FieldRow label="Point Z">
                            <input
                              type="number"
                              value={selectedNode.action.target.value[2]}
                              onChange={(event) => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveToTarget') return node;
                                if (node.action.target.type !== 'point') return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: {
                                      type: 'point',
                                      value: updateVectorAxis(node.action.target.value, 2, event.target.value),
                                    },
                                  },
                                };
                              })}
                              style={{ width: '100%' }}
                            />
                          </FieldRow>
                        </>
                      )}
                      <FieldRow label="속도">
                        <input
                          type="number"
                          value={selectedNode.action.speed ?? 2.2}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveToTarget') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                speed: parseNumeric(event.target.value, node.action.speed ?? 2.2),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Animation ID">
                        <input
                          value={selectedNode.action.animationId ?? ''}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveToTarget') return node;
                            const nextAnimationId = event.target.value.trim();
                            const { animationId: _animationId, ...restAction } = node.action;
                            return {
                              ...node,
                              action: {
                                ...restAction,
                                ...(nextAnimationId ? { animationId: nextAnimationId } : {}),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'idle' && (
                    <FieldRow label="Animation ID">
                      <input
                        value={selectedNode.action.animationId ?? ''}
                        onChange={(event) => updateSelectedNode((node) => {
                          if (node.type !== 'action' || node.action.type !== 'idle') return node;
                          const nextAnimationId = event.target.value.trim();
                          const { animationId: _animationId, ...restAction } = node.action;
                          return {
                            ...node,
                            action: {
                              ...restAction,
                              ...(nextAnimationId ? { animationId: nextAnimationId } : {}),
                            },
                          };
                        })}
                        style={{ width: '100%' }}
                      />
                    </FieldRow>
                  )}
                  {selectedNode.action.type === 'interact' && (
                    <FieldRow label="Target ID">
                      <input
                        value={selectedNode.action.targetId}
                        onChange={(event) => updateSelectedNode((node) => {
                          if (node.type !== 'action' || node.action.type !== 'interact') return node;
                          return { ...node, action: { ...node.action, targetId: event.target.value } };
                        })}
                        style={{ width: '100%' }}
                      />
                    </FieldRow>
                  )}
                  {selectedNode.action.type === 'remember' && (
                    <>
                      <FieldRow label="Memory Key">
                        <input
                          value={selectedNode.action.key}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'remember') return node;
                            return { ...node, action: { ...node.action, key: event.target.value } };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Memory Value">
                        <input
                          value={String(selectedNode.action.value)}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'remember') return node;
                            return { ...node, action: { ...node.action, value: event.target.value } };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'moveTo' && (
                    <>
                      <FieldRow label="Target X">
                        <input
                          type="number"
                          value={selectedNode.action.target[0]}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveTo') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                target: updateVectorAxis(node.action.target, 0, event.target.value),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Target Y">
                        <input
                          type="number"
                          value={selectedNode.action.target[1]}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveTo') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                target: updateVectorAxis(node.action.target, 1, event.target.value),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Target Z">
                        <input
                          type="number"
                          value={selectedNode.action.target[2]}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveTo') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                target: updateVectorAxis(node.action.target, 2, event.target.value),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="속도">
                        <input
                          type="number"
                          value={selectedNode.action.speed ?? 2.2}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'moveTo') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                speed: parseNumeric(event.target.value, node.action.speed ?? 2.2),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'lookAt' && (
                    <>
                      <FieldRow label="Target X">
                        <input
                          type="number"
                          value={selectedNode.action.target[0]}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'lookAt') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                target: updateVectorAxis(node.action.target, 0, event.target.value),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Target Y">
                        <input
                          type="number"
                          value={selectedNode.action.target[1]}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'lookAt') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                target: updateVectorAxis(node.action.target, 1, event.target.value),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Target Z">
                        <input
                          type="number"
                          value={selectedNode.action.target[2]}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'lookAt') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                target: updateVectorAxis(node.action.target, 2, event.target.value),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </>
                  )}
                  {selectedNode.action.type === 'patrol' && (
                    <>
                      <FieldRow label="웨이포인트 수">
                        <span>{selectedNode.action.waypoints.length}</span>
                      </FieldRow>
                      <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                        <span className="building-panel__info-label">웨이포인트 편집</span>
                        {selectedNode.action.waypoints.map((waypoint, index) => (
                          <div
                            key={`waypoint-${index}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto auto auto',
                              gap: '4px',
                              alignItems: 'center',
                            }}
                          >
                            <input
                              type="number"
                              value={waypoint[0]}
                              onChange={(event) => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                                const nextWaypoints = [...node.action.waypoints] as [number, number, number][];
                                const currentWaypoint = nextWaypoints[index] ?? waypoint;
                                nextWaypoints[index] = updateVectorAxis(currentWaypoint, 0, event.target.value);
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: nextWaypoints,
                                  },
                                };
                              })}
                            />
                            <input
                              type="number"
                              value={waypoint[1]}
                              onChange={(event) => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                                const nextWaypoints = [...node.action.waypoints] as [number, number, number][];
                                const currentWaypoint = nextWaypoints[index] ?? waypoint;
                                nextWaypoints[index] = updateVectorAxis(currentWaypoint, 1, event.target.value);
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: nextWaypoints,
                                  },
                                };
                              })}
                            />
                            <input
                              type="number"
                              value={waypoint[2]}
                              onChange={(event) => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                                const nextWaypoints = [...node.action.waypoints] as [number, number, number][];
                                const currentWaypoint = nextWaypoints[index] ?? waypoint;
                                nextWaypoints[index] = updateVectorAxis(currentWaypoint, 2, event.target.value);
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: nextWaypoints,
                                  },
                                };
                              })}
                            />
                            <button
                              className="building-panel__segment-btn"
                              onClick={() => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                                if (index <= 0) return node;
                                const nextWaypoints = [...node.action.waypoints] as [number, number, number][];
                                const previous = nextWaypoints[index - 1];
                                const current = nextWaypoints[index];
                                if (!previous || !current) return node;
                                nextWaypoints[index - 1] = current;
                                nextWaypoints[index] = previous;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: nextWaypoints,
                                  },
                                };
                              })}
                            >
                              위
                            </button>
                            <button
                              className="building-panel__segment-btn"
                              onClick={() => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                                if (index >= node.action.waypoints.length - 1) return node;
                                const nextWaypoints = [...node.action.waypoints] as [number, number, number][];
                                const current = nextWaypoints[index];
                                const next = nextWaypoints[index + 1];
                                if (!current || !next) return node;
                                nextWaypoints[index] = next;
                                nextWaypoints[index + 1] = current;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: nextWaypoints,
                                  },
                                };
                              })}
                            >
                              아래
                            </button>
                            <button
                              className="building-panel__segment-btn"
                              onClick={() => updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                                if (node.action.waypoints.length <= 1) return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: node.action.waypoints.filter((_, waypointIndex) => waypointIndex !== index),
                                  },
                                };
                              })}
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                        <button
                          className="building-panel__segment-btn"
                          onClick={() => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                            const lastWaypoint = node.action.waypoints[node.action.waypoints.length - 1] ?? [0, 0, 0];
                            const nextWaypoint: [number, number, number] = [lastWaypoint[0] + 1, lastWaypoint[1], lastWaypoint[2] + 1];
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                waypoints: [...node.action.waypoints, nextWaypoint],
                              },
                            };
                          })}
                        >
                          웨이포인트 추가
                        </button>
                      </div>
                      <FieldRow label="속도">
                        <input
                          type="number"
                          value={selectedNode.action.speed ?? 2.2}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                            return {
                              ...node,
                              action: {
                                ...node.action,
                                speed: parseNumeric(event.target.value, node.action.speed ?? 2.2),
                              },
                            };
                          })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                      <FieldRow label="Loop">
                        <input
                          type="checkbox"
                          checked={selectedNode.action.loop ?? true}
                          onChange={(event) => updateSelectedNode((node) => {
                            if (node.type !== 'action' || node.action.type !== 'patrol') return node;
                            return { ...node, action: { ...node.action, loop: event.target.checked } };
                          })}
                        />
                      </FieldRow>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          <div className="building-panel__segmented">
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCConditionNodeWithBranchTemplate(
                selectedBlueprint,
                createNPCConditionNode('navigationIdle'),
                instance.behavior,
              ))}
            >
              조건:이동 대기
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCConditionNodeWithBranchTemplate(
                selectedBlueprint,
                createNPCConditionNode('questStatus'),
                instance.behavior,
              ))}
            >
              조건:퀘스트
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCConditionNodeWithBranchTemplate(
                selectedBlueprint,
                createNPCConditionNode('friendshipAtLeast'),
                instance.behavior,
              ))}
            >
              조건:친밀도
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCBlueprintNode(
                selectedBlueprint,
                createNPCActionNode('wander', instance.behavior),
              ))}
            >
              배회 노드 추가
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCBlueprintNode(
                selectedBlueprint,
                createNPCActionNode('speak', instance.behavior),
              ))}
            >
              대화 노드 추가
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => {
                const withQuestGate = appendNPCConditionNodeWithBranchTemplate(
                  selectedBlueprint,
                  createNPCConditionNode('questStatus'),
                  instance.behavior,
                );
                const withSpeak = appendNPCBlueprintNode(
                  withQuestGate,
                  createNPCActionNode('speak', instance.behavior),
                );
                updateBrainBlueprint(selectedBlueprint.id, withSpeak);
              }}
            >
              프리셋:퀘스트 대화
            </button>
          </div>
          </div>
        </>
      )}
    </>
  );
}

export type NPCPerceptionSectionProps = {
  instance: NPCInstanceData;
  updateBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
  updatePerception: (id: string, updates: Partial<NPCPerceptionConfig>) => void;
};

export function NPCPerceptionSection({
  instance,
  updateBrain,
  updatePerception,
}: NPCPerceptionSectionProps) {
  const sightRadius = instance.perception?.sightRadius ?? 8;

  return (
    <div className="building-panel__info">
      <FieldRow label="시야 감지">
        <FieldToggle
          value={instance.perception?.enabled ?? true}
          onChange={(enabled) => updatePerception(instance.id, { enabled })}
        />
      </FieldRow>
      <div className="building-panel__info-item">
        <span className="building-panel__info-label">시야 반경</span>
        <div className="building-panel__stepper">
          <button
            className="building-panel__stepper-btn"
            onClick={() => updatePerception(instance.id, { sightRadius: Math.max(1, sightRadius - 1) })}
          >
            -
          </button>
          <span className="building-panel__stepper-value">{sightRadius}m</span>
          <button
            className="building-panel__stepper-btn"
            onClick={() => updatePerception(instance.id, { sightRadius: Math.min(60, sightRadius + 1) })}
          >
            +
          </button>
        </div>
      </div>
      <div className="building-panel__info-item">
        <span className="building-panel__info-label">Provider</span>
        <input
          value={instance.brain?.providerId ?? ''}
          onChange={(event) => updateBrain(instance.id, { providerId: event.target.value })}
          placeholder="llm provider id"
          style={{ width: '100%', minWidth: 0 }}
        />
      </div>
      <div className="building-panel__info-item">
        <span className="building-panel__info-label">Policy</span>
        <input
          value={instance.brain?.policyId ?? ''}
          onChange={(event) => updateBrain(instance.id, { policyId: event.target.value })}
          placeholder="rl policy id"
          style={{ width: '100%', minWidth: 0 }}
        />
      </div>
      <div className="building-panel__info-item">
        <span className="building-panel__info-label">관측</span>
        <span className="building-panel__info-value">
          감지 {instance.lastObservation?.perceived.length ?? 0} · 결정 {instance.lastDecision?.source ?? '없음'}
        </span>
      </div>
    </div>
  );
}

type NumericStepperProps = {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
};

function NumericStepper({
  label,
  value,
  onDecrement,
  onIncrement,
}: NumericStepperProps) {
  return (
    <div className="building-panel__info-item">
      <span className="building-panel__info-label">{label}</span>
      <div className="building-panel__stepper">
        <button className="building-panel__stepper-btn" onClick={onDecrement}>-</button>
        <span className="building-panel__stepper-value">{value}</span>
        <button className="building-panel__stepper-btn" onClick={onIncrement}>+</button>
      </div>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: TextFieldProps) {
  return (
    <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
      <span className="building-panel__info-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '4px 6px',
          fontSize: '11px',
          background: 'var(--panel-bg, #1a1a2e)',
          border: '1px solid var(--border-color, #333)',
          borderRadius: '3px',
          color: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export type TreeSettingsSectionProps = {
  currentTreeKind: BuildingTreeKind;
  setTreeKind: (kind: BuildingTreeKind) => void;
  currentObjectPrimaryColor: string;
  setObjectPrimaryColor: (color: string) => void;
  currentObjectSecondaryColor: string;
  setObjectSecondaryColor: (color: string) => void;
};

export function TreeSettingsSection({
  currentTreeKind,
  setTreeKind,
  currentObjectPrimaryColor,
  setObjectPrimaryColor,
  currentObjectSecondaryColor,
  setObjectSecondaryColor,
}: TreeSettingsSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">나무 프리셋</div>
      <div className="building-panel__grid">
        {BUILDING_TREE_OPTIONS.map((option) => (
          <button
            key={option.type}
            className={`building-panel__grid-btn ${currentTreeKind === option.type ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setTreeKind(option.type)}
          >
            {option.labelKo}
          </button>
        ))}
      </div>
      <div className="building-panel__info">
        <FieldRow label="잎/꽃 색">
          <FieldColor value={currentObjectPrimaryColor} onChange={setObjectPrimaryColor} />
        </FieldRow>
        <FieldRow label="줄기 색">
          <FieldColor value={currentObjectSecondaryColor} onChange={setObjectSecondaryColor} />
        </FieldRow>
      </div>
    </div>
  );
}

export type FireSettingsSectionProps = {
  currentFireIntensity: number;
  setFireIntensity: (intensity: number) => void;
  currentFireWidth: number;
  setFireWidth: (width: number) => void;
  currentFireHeight: number;
  setFireHeight: (height: number) => void;
  currentFireColor: string;
  setFireColor: (color: string) => void;
};

export function FireSettingsSection({
  currentFireIntensity,
  setFireIntensity,
  currentFireWidth,
  setFireWidth,
  currentFireHeight,
  setFireHeight,
  currentFireColor,
  setFireColor,
}: FireSettingsSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">불 설정</div>
      <div className="building-panel__info">
        <NumericStepper
          label="강도"
          value={currentFireIntensity.toFixed(1)}
          onDecrement={() => setFireIntensity(Math.max(0.5, currentFireIntensity - 0.5))}
          onIncrement={() => setFireIntensity(Math.min(3.0, currentFireIntensity + 0.5))}
        />
        <NumericStepper
          label="너비"
          value={`${currentFireWidth.toFixed(1)}m`}
          onDecrement={() => setFireWidth(Math.max(0.3, currentFireWidth - 0.2))}
          onIncrement={() => setFireWidth(Math.min(4.0, currentFireWidth + 0.2))}
        />
        <NumericStepper
          label="높이"
          value={`${currentFireHeight.toFixed(1)}m`}
          onDecrement={() => setFireHeight(Math.max(0.5, currentFireHeight - 0.3))}
          onIncrement={() => setFireHeight(Math.min(5.0, currentFireHeight + 0.3))}
        />
        <FieldRow label="색상">
          <FieldColor value={currentFireColor} onChange={setFireColor} />
        </FieldRow>
      </div>
    </div>
  );
}

const BILLBOARD_COLORS = [
  { value: '#00ff88', label: '초록' },
  { value: '#00aaff', label: '파랑' },
  { value: '#f59e0b', label: '앰버' },
  { value: '#ffffff', label: '흰색' },
  { value: '#ffdd00', label: '노랑' },
];

export type BillboardSettingsSectionProps = {
  currentBillboardScale: number;
  setBillboardScale: (scale: number) => void;
  currentBillboardOffsetY: number;
  setBillboardOffsetY: (offsetY: number) => void;
  currentBillboardWidth: number;
  setBillboardWidth: (width: number) => void;
  currentBillboardHeight: number;
  setBillboardHeight: (height: number) => void;
  currentBillboardElevation: number;
  setBillboardElevation: (elevation: number) => void;
  currentBillboardIntensity: number;
  setBillboardIntensity: (intensity: number) => void;
  currentBillboardText: string;
  setBillboardText: (text: string) => void;
  currentBillboardImageUrl: string;
  setBillboardImageUrl: (url: string) => void;
  currentBillboardColor: string;
  setBillboardColor: (color: string) => void;
};

export function BillboardSettingsSection({
  currentBillboardScale,
  setBillboardScale,
  currentBillboardOffsetY,
  setBillboardOffsetY,
  currentBillboardWidth,
  setBillboardWidth,
  currentBillboardHeight,
  setBillboardHeight,
  currentBillboardElevation,
  setBillboardElevation,
  currentBillboardIntensity,
  setBillboardIntensity,
  currentBillboardText,
  setBillboardText,
  currentBillboardImageUrl,
  setBillboardImageUrl,
  currentBillboardColor,
  setBillboardColor,
}: BillboardSettingsSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">간판 설정</div>
      <div className="building-panel__info">
        <NumericStepper
          label="크기"
          value={`${currentBillboardScale.toFixed(1)}x`}
          onDecrement={() => setBillboardScale(Math.max(0.2, currentBillboardScale - 0.2))}
          onIncrement={() => setBillboardScale(Math.min(10, currentBillboardScale + 0.2))}
        />
        <NumericStepper
          label="배치 높이"
          value={`${currentBillboardOffsetY.toFixed(2)}m`}
          onDecrement={() => setBillboardOffsetY(Math.max(-4, currentBillboardOffsetY - 0.25))}
          onIncrement={() => setBillboardOffsetY(Math.min(12, currentBillboardOffsetY + 0.25))}
        />
        <NumericStepper
          label="판넬 너비"
          value={currentBillboardWidth > 0 ? `${currentBillboardWidth.toFixed(2)}m` : '자동'}
          onDecrement={() => setBillboardWidth(Math.max(0, currentBillboardWidth - 0.25))}
          onIncrement={() => setBillboardWidth(Math.min(12, currentBillboardWidth + 0.25))}
        />
        <NumericStepper
          label="판넬 높이"
          value={`${currentBillboardHeight.toFixed(2)}m`}
          onDecrement={() => setBillboardHeight(Math.max(0.3, currentBillboardHeight - 0.25))}
          onIncrement={() => setBillboardHeight(Math.min(8, currentBillboardHeight + 0.25))}
        />
        <NumericStepper
          label="기둥 높이"
          value={`${currentBillboardElevation.toFixed(2)}m`}
          onDecrement={() => setBillboardElevation(Math.max(0, currentBillboardElevation - 0.25))}
          onIncrement={() => setBillboardElevation(Math.min(8, currentBillboardElevation + 0.25))}
        />
        <NumericStepper
          label="밝기"
          value={currentBillboardIntensity.toFixed(2)}
          onDecrement={() => setBillboardIntensity(Math.max(0, currentBillboardIntensity - 0.25))}
          onIncrement={() => setBillboardIntensity(Math.min(8, currentBillboardIntensity + 0.25))}
        />
        <TextField
          label="문구"
          value={currentBillboardText}
          onChange={setBillboardText}
          placeholder="표시할 문구..."
        />
        <TextField
          label="이미지 URL"
          value={currentBillboardImageUrl}
          onChange={setBillboardImageUrl}
          placeholder="https://..."
        />
        <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
          <span className="building-panel__info-label">색상</span>
          <div className="building-panel__grid">
            {BILLBOARD_COLORS.map((color) => (
              <button
                key={color.value}
                className={`building-panel__grid-btn ${currentBillboardColor === color.value ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setBillboardColor(color.value)}
                style={{ borderBottom: `3px solid ${color.value}` }}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type FlagSettingsSectionProps = {
  currentFlagStyle: FlagStyle;
  setFlagStyle: (style: FlagStyle) => void;
  currentFlagWidth: number;
  setFlagWidth: (width: number) => void;
  currentFlagHeight: number;
  setFlagHeight: (height: number) => void;
  currentFlagImageUrl: string;
  setFlagImageUrl: (url: string) => void;
};

export function FlagSettingsSection({
  currentFlagStyle,
  setFlagStyle,
  currentFlagWidth,
  setFlagWidth,
  currentFlagHeight,
  setFlagHeight,
  currentFlagImageUrl,
  setFlagImageUrl,
}: FlagSettingsSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">깃발 설정</div>
      <div className="building-panel__info">
        <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
          <span className="building-panel__info-label">스타일</span>
          <div className="building-panel__grid">
            {BUILDING_FLAG_STYLE_OPTIONS.map(({ style: key, meta }) => (
              <button
                key={key}
                className={`building-panel__grid-btn ${currentFlagStyle === key ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setFlagStyle(key)}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
        <NumericStepper
          label="너비"
          value={`${currentFlagWidth}m`}
          onDecrement={() => setFlagWidth(Math.max(0.5, currentFlagWidth - 0.5))}
          onIncrement={() => setFlagWidth(Math.min(8, currentFlagWidth + 0.5))}
        />
        <NumericStepper
          label="높이"
          value={`${currentFlagHeight}m`}
          onDecrement={() => setFlagHeight(Math.max(0.5, currentFlagHeight - 0.5))}
          onIncrement={() => setFlagHeight(Math.min(6, currentFlagHeight + 0.5))}
        />
        <TextField
          label="이미지 URL"
          value={currentFlagImageUrl}
          onChange={setFlagImageUrl}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
