import React from 'react';

import {
  appendNPCBlueprintNode,
  cloneNPCBlueprintForInstance,
  createNPCBlueprintNodeId,
  getNPCBlueprintNodeDescription,
  getNPCBlueprintNodeTitle,
  getNPCBlueprintOutgoingLabel,
  removeNPCBlueprintNode,
  resetNPCBlueprint,
} from './helpers';
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
        <div className="building-panel__node-editor">
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
          </div>
          <div className="building-panel__node-list">
            {selectedBlueprint.nodes.map((node) => (
              <div key={node.id} className="building-panel__node-card">
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
              </div>
            ))}
          </div>
          <div className="building-panel__segmented">
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCBlueprintNode(selectedBlueprint, {
                id: createNPCBlueprintNodeId('condition-idle'),
                type: 'condition',
                label: 'Navigation Idle',
                condition: { type: 'navigationIdle' },
              }))}
            >
              조건 추가
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCBlueprintNode(selectedBlueprint, {
                id: createNPCBlueprintNodeId('wander'),
                type: 'action',
                label: 'Wander',
                action: { type: 'wander', radius: instance.behavior?.wanderRadius ?? 4, speed: instance.behavior?.speed ?? 2.2 },
              }))}
            >
              배회 노드 추가
            </button>
            <button
              className="building-panel__segment-btn"
              onClick={() => updateBrainBlueprint(selectedBlueprint.id, appendNPCBlueprintNode(selectedBlueprint, {
                id: createNPCBlueprintNodeId('speak'),
                type: 'action',
                label: 'Speak',
                action: { type: 'speak', text: '안녕?', duration: 2 },
              }))}
            >
              대화 노드 추가
            </button>
          </div>
        </div>
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
