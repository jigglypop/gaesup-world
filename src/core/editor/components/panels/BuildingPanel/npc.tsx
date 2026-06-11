import React from 'react';

import type {
  NPCAnimation,
  NPCBehaviorConfig,
  NPCBehaviorMode,
  NPCBrainConfig,
  NPCInstance as NPCInstanceData,
  NPCPerceptionConfig,
  NPCTemplate,
} from '../../../../npc/types';
import { FieldRow, FieldToggle } from '../../fields';
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
    <div className="building-panel__section building-panel__npc-card">
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
    <div className="building-panel__npc-card">
      <div className="building-panel__section-title">이동 설정</div>
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
              onClick={() =>
                updateBehavior(instance.id, { wanderRadius: Math.max(1, wanderRadius - 1) })
              }
            >
              -
            </button>
            <span className="building-panel__stepper-value">{wanderRadius}m</span>
            <button
              className="building-panel__stepper-btn"
              onClick={() =>
                updateBehavior(instance.id, { wanderRadius: Math.min(30, wanderRadius + 1) })
              }
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
            const point: [number, number, number] = [
              hoverPosition.x,
              hoverPosition.y,
              hoverPosition.z,
            ];
            const nextWaypoints = [...waypoints, point];
            updateBehavior(instance.id, {
              mode: 'patrol',
              waypoints: nextWaypoints,
            });
            setNavigation(instance.id, nextWaypoints, speed);
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
            const target: [number, number, number] = [
              hoverPosition.x,
              hoverPosition.y,
              hoverPosition.z,
            ];
            updateBehavior(instance.id, { mode: 'idle' });
            setNavigation(instance.id, [target], speed);
          }}
        >
          호버 위치로 1회 이동
        </button>
      </div>
    </div>
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
    <div className="building-panel__npc-card">
      <div className="building-panel__section-title">애니메이션 설정</div>
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
            onClick={() =>
              updateBehavior(instance.id, {
                idleAnimation: animation.id,
                arriveAnimation: animation.id,
              })
            }
          >
            대기:{animation.name}
          </button>
        ))}
      </div>
    </div>
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
    <div className="building-panel__npc-card">
      <div className="building-panel__section-title">지각/연동 설정</div>
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
              onClick={() =>
                updatePerception(instance.id, { sightRadius: Math.max(1, sightRadius - 1) })
              }
            >
              -
            </button>
            <span className="building-panel__stepper-value">{sightRadius}m</span>
            <button
              className="building-panel__stepper-btn"
              onClick={() =>
                updatePerception(instance.id, { sightRadius: Math.min(60, sightRadius + 1) })
              }
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
            감지 {instance.lastObservation?.perceived.length ?? 0} · 결정{' '}
            {instance.lastDecision?.source ?? '없음'}
          </span>
        </div>
      </div>
    </div>
  );
}

