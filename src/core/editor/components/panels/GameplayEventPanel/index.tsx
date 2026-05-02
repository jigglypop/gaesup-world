import React, { useCallback, useMemo, useState } from 'react';

import {
  GAMEPLAY_EVENT_ACTION_TYPES,
  GAMEPLAY_EVENT_CONDITION_TYPES,
  GAMEPLAY_EVENT_TRIGGER_TYPES,
  GameplayEventEngine,
  SEED_GAMEPLAY_EVENTS,
  createGameplayEventActionTemplate,
  createGameplayEventConditionTemplate,
  createGameplayEventTriggerTemplate,
  createManualToastEventBlueprint,
  createNpcTalkStartsQuestEventBlueprint,
  type GameplayEventActionType,
  type GameplayEventBlueprint,
  type GameplayEventConditionType,
  type GameplayEventTriggerType,
  type GameplayEventAction,
  type GameplayEventCondition,
  type GameplayTriggerEvent,
} from '../../../../gameplay';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';

export type GameplayEventPanelProps = EditorPanelBaseProps & {
  blueprints?: GameplayEventBlueprint[];
  onCreate?: (blueprint: GameplayEventBlueprint) => void;
  onUpdate?: (blueprint: GameplayEventBlueprint) => void;
  onDelete?: (id: string) => void;
  onRun?: (trigger: GameplayTriggerEvent) => void | Promise<void>;
};

type PanelStatus = {
  kind: 'idle' | 'success' | 'error';
  message: string;
};

const TRIGGER_LABEL: Record<GameplayEventTriggerType, string> = {
  manual: '수동',
  interaction: '상호작용',
  enterArea: '영역 진입',
  itemCollected: '아이템 획득',
  timeChanged: '시간 변경',
  calendarEventStarted: '캘린더 이벤트',
  questChanged: '퀘스트 변경',
  custom: '커스텀',
};

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  name: '이름',
  description: '설명',
  type: '타입',
  key: '키',
  run: '실행 방식',
  cooldownMs: '쿨다운(ms)',
  requiresServer: '서버 필요',
  targetId: '대상 ID',
  action: '액션',
  areaId: '영역 ID',
  itemId: '아이템 ID',
  hour: '시간',
  eventId: '이벤트 ID',
  questId: '퀘스트 ID',
  status: '상태',
  operator: '연산자',
  value: '값',
  message: '메시지',
  toast: '토스트',
  durationMs: '지속시간(ms)',
};

const RESERVED_SHORTCUT_KEYS = new Set(['i', 'j', 'm', 'k', 'o', 'c', 'f', 'e', 't']);

const isReservedShortcutKey = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 1 && RESERVED_SHORTCUT_KEYS.has(normalized);
};

const triggerToEvent = (blueprint: GameplayEventBlueprint): GameplayTriggerEvent => {
  const trigger = blueprint.trigger;
  switch (trigger.type) {
    case 'manual':
      return { type: 'manual', key: trigger.key };
    case 'interaction':
      return {
        type: 'interaction',
        targetId: trigger.targetId,
        ...(trigger.action ? { action: trigger.action } : {}),
      };
    case 'enterArea':
      return { type: 'enterArea', areaId: trigger.areaId };
    case 'itemCollected':
      return { type: 'itemCollected', itemId: trigger.itemId };
    case 'timeChanged':
      return { type: 'timeChanged', ...(trigger.hour !== undefined ? { hour: trigger.hour } : {}) };
    case 'calendarEventStarted':
      return { type: 'calendarEventStarted', eventId: trigger.eventId };
    case 'questChanged':
      return {
        type: 'questChanged',
        questId: trigger.questId,
        ...(trigger.status ? { status: trigger.status } : {}),
      };
    case 'custom':
      return { type: 'custom', key: trigger.key };
    default: {
      const exhaustive: never = trigger;
      return exhaustive;
    }
  }
};

type InspectorValue = string | number | boolean;

const toBooleanValue = (value: string): string | number | boolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && value.trim() !== '' ? numberValue : value;
};

export function GameplayEventPanel({
  blueprints = SEED_GAMEPLAY_EVENTS,
  onCreate,
  onUpdate,
  onDelete,
  onRun,
  className = '',
  style,
  children,
}: GameplayEventPanelProps) {
  const fallbackEngine = useMemo(() => new GameplayEventEngine({ blueprints }), [blueprints]);
  const [id, setId] = useState('manual-event');
  const [name, setName] = useState('수동 이벤트');
  const [triggerKey, setTriggerKey] = useState('manual.event');
  const [message, setMessage] = useState('이벤트가 실행되었습니다.');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const selectedBlueprint = useMemo(
    () => blueprints.find((blueprint) => blueprint.id === selectedId) ?? null,
    [blueprints, selectedId],
  );
  const [status, setStatus] = useState<PanelStatus>({ kind: 'idle', message: '대기 중' });

  const createBlueprint = () => {
    if (isReservedShortcutKey(triggerKey)) {
      setStatus({ kind: 'error', message: `트리거 키 "${triggerKey}" 는 HUD 단축키로 예약되어 있습니다.` });
      return;
    }
    const next = createManualToastEventBlueprint({ id, name, triggerKey, message });
    onCreate?.(next);
    setSelectedId(next.id);
    setShowInspector(true);
    setStatus({ kind: 'success', message: `이벤트를 생성했습니다: ${next.id}` });
  };

  const createNpcQuestPreset = () => {
    const trimmedId = id.trim();
    const trimmedName = name.trim();
    const next = createNpcTalkStartsQuestEventBlueprint({
      ...(trimmedId ? { id: `${trimmedId}-npc-quest` } : {}),
      ...(trimmedName ? { name: `${trimmedName} NPC 퀘스트` } : {}),
    });
    onCreate?.(next);
    setSelectedId(next.id);
    setShowInspector(true);
    setStatus({ kind: 'success', message: `NPC 퀘스트 프리셋을 추가했습니다: ${next.id}` });
  };

  const updateSelected = useCallback((patch: Partial<GameplayEventBlueprint>) => {
    if (!selectedBlueprint) return;
    const next = { ...selectedBlueprint, ...patch };
    onUpdate?.(next);
    setSelectedId(next.id);
    setStatus({ kind: 'success', message: `이벤트를 수정했습니다: ${next.id}` });
  }, [onUpdate, selectedBlueprint]);

  const deleteSelected = () => {
    if (!selectedBlueprint) return;
    onDelete?.(selectedBlueprint.id);
    const next = blueprints.find((blueprint) => blueprint.id !== selectedBlueprint.id) ?? null;
    setSelectedId(next?.id ?? null);
    setShowInspector(false);
    setStatus({ kind: 'success', message: `이벤트를 삭제했습니다: ${selectedBlueprint.id}` });
  };

  const runBlueprint = async (blueprint: GameplayEventBlueprint) => {
    const trigger = triggerToEvent(blueprint);
    if (onRun) {
      await onRun(trigger);
    } else {
      await fallbackEngine.dispatch(trigger);
    }
    setStatus({ kind: 'success', message: `이벤트를 실행했습니다: ${blueprint.id}` });
  };

  const updateCondition = useCallback((index: number, condition: GameplayEventCondition) => {
    if (!selectedBlueprint) return;
    const conditions = [...(selectedBlueprint.conditions ?? [])];
    conditions[index] = condition;
    updateSelected({ conditions });
  }, [selectedBlueprint, updateSelected]);

  const updateAction = useCallback((index: number, action: GameplayEventAction) => {
    if (!selectedBlueprint) return;
    const actions = [...selectedBlueprint.actions];
    actions[index] = action;
    updateSelected({ actions });
  }, [selectedBlueprint, updateSelected]);

  const updateInspectorField = useCallback((nodeId: string, field: string, rawValue: InspectorValue) => {
    if (!selectedBlueprint || field === 'type') return;
    const value = rawValue;

    if (nodeId === 'root') {
      updateSelected({ [field]: value } as Partial<GameplayEventBlueprint>);
      return;
    }

    if (nodeId === 'policy') {
      if (field === 'run' && (value === 'once' || value === 'repeat')) {
        updateSelected({ policy: { ...selectedBlueprint.policy, run: value } });
      }
      if (field === 'cooldownMs') {
        updateSelected({ policy: { ...selectedBlueprint.policy, cooldownMs: Number(value) } });
      }
      if (field === 'requiresServer') {
        updateSelected({ policy: { ...selectedBlueprint.policy, requiresServer: toBooleanValue(String(value)) === true } });
      }
      return;
    }

    if (nodeId === 'trigger') {
      const trigger = selectedBlueprint.trigger;
      if (trigger.type === 'manual' && field === 'key') {
        const nextKey = String(value);
        if (isReservedShortcutKey(nextKey)) {
          setStatus({ kind: 'error', message: `트리거 키 "${nextKey}" 는 HUD 단축키로 예약되어 있습니다.` });
          return;
        }
        updateSelected({ trigger: { type: 'manual', key: nextKey } });
      }
      if (trigger.type === 'interaction' && (field === 'targetId' || field === 'action')) {
        updateSelected({ trigger: { ...trigger, [field]: String(value) } });
      }
      if (trigger.type === 'enterArea' && field === 'areaId') updateSelected({ trigger: { type: 'enterArea', areaId: String(value) } });
      if (trigger.type === 'itemCollected' && field === 'itemId') updateSelected({ trigger: { type: 'itemCollected', itemId: String(value) } });
      if (trigger.type === 'timeChanged' && field === 'hour') updateSelected({ trigger: { type: 'timeChanged', hour: Number(value) } });
      if (trigger.type === 'calendarEventStarted' && field === 'eventId') updateSelected({ trigger: { type: 'calendarEventStarted', eventId: String(value) } });
      if (trigger.type === 'questChanged' && (field === 'questId' || field === 'status')) {
        updateSelected({ trigger: { ...trigger, [field]: String(value) } });
      }
      if (trigger.type === 'custom' && field === 'key') {
        const nextKey = String(value);
        if (isReservedShortcutKey(nextKey)) {
          setStatus({ kind: 'error', message: `트리거 키 "${nextKey}" 는 HUD 단축키로 예약되어 있습니다.` });
          return;
        }
        updateSelected({ trigger: { type: 'custom', key: nextKey } });
      }
      return;
    }

    if (nodeId.startsWith('condition:')) {
      const index = Number(nodeId.split(':')[1]);
      const condition = selectedBlueprint.conditions?.[index];
      if (!condition) return;
      updateCondition(index, { ...condition, [field]: field === 'value' ? toBooleanValue(String(value)) : value } as GameplayEventCondition);
      return;
    }

    if (nodeId.startsWith('action:')) {
      const index = Number(nodeId.split(':')[1]);
      const action = selectedBlueprint.actions[index];
      if (!action) return;
      updateAction(index, { ...action, [field]: field === 'value' ? toBooleanValue(String(value)) : value } as GameplayEventAction);
    }
  }, [selectedBlueprint, updateAction, updateCondition, updateSelected]);

  const deleteInspectorItem = useCallback((nodeId: string) => {
    if (!selectedBlueprint) return;
    if (nodeId.startsWith('condition:')) {
      const index = Number(nodeId.split(':')[1]);
      updateSelected({ conditions: (selectedBlueprint.conditions ?? []).filter((_, itemIndex) => itemIndex !== index) });
      return;
    }
    if (nodeId.startsWith('action:')) {
      const index = Number(nodeId.split(':')[1]);
      updateSelected({ actions: selectedBlueprint.actions.filter((_, itemIndex) => itemIndex !== index) });
    }
  }, [selectedBlueprint, updateSelected]);

  const renderFields = (
    nodeId: string,
    fields: Record<string, InspectorValue>,
  ) => (
    <div className="gameplay-event-panel__field-grid">
      {Object.entries(fields).map(([field, value]) => (
        <label key={`${nodeId}-${field}`} className="gameplay-event-panel__field">
          <span>{FIELD_LABELS[field] ?? field}</span>
          <input
            type={typeof value === 'number' ? 'number' : 'text'}
            value={String(value)}
            disabled={field === 'type'}
            onChange={(event) => updateInspectorField(nodeId, field, toBooleanValue(event.target.value))}
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className={`gameplay-event-panel ${className}`} style={style}>
      <section className="gameplay-event-panel__section">
        <div className="gameplay-event-panel__title">빠른 생성</div>
        <label className="gameplay-event-panel__field">
          <span>ID</span>
          <input value={id} onChange={(event) => setId(event.target.value)} />
        </label>
        <label className="gameplay-event-panel__field">
          <span>이름</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="gameplay-event-panel__field">
          <span>트리거 키</span>
          <input value={triggerKey} onChange={(event) => setTriggerKey(event.target.value)} />
        </label>
        <div className="gameplay-event-panel__hint">단일 문자 키(`i`, `j`, `m`, `k`, `o`, `c`, `f`, `e`, `t`)는 HUD 단축키로 예약됩니다.</div>
        <label className="gameplay-event-panel__field">
          <span>토스트 메시지</span>
          <input value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        <button type="button" className="gameplay-event-panel__primary" onClick={createBlueprint}>
          수동 이벤트 생성
        </button>
        <button type="button" onClick={createNpcQuestPreset}>
          NPC 퀘스트 프리셋 추가
        </button>
      </section>

      <section className="gameplay-event-panel__section">
        <div className="gameplay-event-panel__title">이벤트 목록</div>
        <div className="gameplay-event-panel__list">
          {blueprints.map((blueprint) => (
            <article key={blueprint.id} className="gameplay-event-panel__card">
              <div>
                <div className="gameplay-event-panel__card-title">{blueprint.name}</div>
                <div className="gameplay-event-panel__card-meta">
                  {blueprint.id} · {TRIGGER_LABEL[blueprint.trigger.type]} · 액션 {blueprint.actions.length}개
                </div>
              </div>
              <div className="gameplay-event-panel__card-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(blueprint.id);
                    setShowInspector(true);
                  }}
                >
                  편집
                </button>
                <button type="button" onClick={() => { void runBlueprint(blueprint); }}>
                  실행
                </button>
              </div>
            </article>
          ))}
          {blueprints.length === 0 && (
            <div className="gameplay-event-panel__empty">등록된 이벤트가 없습니다. 위에서 새 이벤트를 생성하세요.</div>
          )}
        </div>
      </section>

      {selectedBlueprint && (
        <section className="gameplay-event-panel__section gameplay-event-panel__detail">
          <div className="gameplay-event-panel__editor-head">
            <div>
              <div className="gameplay-event-panel__title">이벤트 인스펙터</div>
              <div className="gameplay-event-panel__hint">
                그래프 노드 대신 트리거, 조건, 액션을 섹션별 인스펙터에서 수정합니다.
              </div>
            </div>
            <div className="gameplay-event-panel__editor-tools">
              <label className="gameplay-event-panel__type-select">
                <span>트리거 타입</span>
                <select
                  value={selectedBlueprint.trigger.type}
                  onChange={(event) => updateSelected({ trigger: createGameplayEventTriggerTemplate(event.target.value as GameplayEventTriggerType) })}
                >
                  {GAMEPLAY_EVENT_TRIGGER_TYPES.map((type) => (
                    <option key={type} value={type}>{TRIGGER_LABEL[type]}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="gameplay-event-panel__primary" onClick={() => setShowInspector((open) => !open)}>
                {showInspector ? '상세 편집 접기' : '상세 편집 열기'}
              </button>
            </div>
          </div>
          {showInspector ? (
            <>
              <div className="gameplay-event-panel__inspector">
                <div className="gameplay-event-panel__inspector-card">
                  <div className="gameplay-event-panel__subhead">기본 정보</div>
                  {renderFields('root', {
                    id: selectedBlueprint.id,
                    name: selectedBlueprint.name,
                    description: selectedBlueprint.description ?? '',
                  })}
                </div>
                <div className="gameplay-event-panel__inspector-card">
                  <div className="gameplay-event-panel__subhead">트리거</div>
                  {renderFields('trigger', selectedBlueprint.trigger as unknown as Record<string, InspectorValue>)}
                </div>
                <div className="gameplay-event-panel__inspector-card">
                  <div className="gameplay-event-panel__subhead">실행 정책</div>
                  {renderFields('policy', {
                    run: selectedBlueprint.policy?.run ?? 'repeat',
                    cooldownMs: selectedBlueprint.policy?.cooldownMs ?? 0,
                    requiresServer: selectedBlueprint.policy?.requiresServer ?? false,
                  })}
                </div>
                <div className="gameplay-event-panel__inspector-card">
                  <div className="gameplay-event-panel__subhead">조건</div>
                  {(selectedBlueprint.conditions ?? []).map((condition, index) => (
                    <div key={`condition-${index}`} className="gameplay-event-panel__item-editor">
                      {renderFields(`condition:${index}`, condition as unknown as Record<string, InspectorValue>)}
                      <button type="button" onClick={() => deleteInspectorItem(`condition:${index}`)}>삭제</button>
                    </div>
                  ))}
                  {(selectedBlueprint.conditions ?? []).length === 0 && (
                    <div className="gameplay-event-panel__hint">조건 없음</div>
                  )}
                </div>
                <div className="gameplay-event-panel__inspector-card">
                  <div className="gameplay-event-panel__subhead">액션</div>
                  {selectedBlueprint.actions.map((action, index) => (
                    <div key={`action-${index}`} className="gameplay-event-panel__item-editor">
                      {renderFields(`action:${index}`, action as unknown as Record<string, InspectorValue>)}
                      <button type="button" onClick={() => deleteInspectorItem(`action:${index}`)}>삭제</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gameplay-event-panel__node-toolbar">
                <select
                  aria-label="Condition type"
                  onChange={(event) => {
                    updateSelected({ conditions: [...(selectedBlueprint.conditions ?? []), createGameplayEventConditionTemplate(event.target.value as GameplayEventConditionType)] });
                    event.currentTarget.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>조건 추가</option>
                  {GAMEPLAY_EVENT_CONDITION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  aria-label="Action type"
                  onChange={(event) => {
                    updateSelected({ actions: [...selectedBlueprint.actions, createGameplayEventActionTemplate(event.target.value as GameplayEventActionType)] });
                    event.currentTarget.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>액션 추가</option>
                  {GAMEPLAY_EVENT_ACTION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="gameplay-event-panel__hint">상세 편집이 접혀 있습니다. 필요할 때만 열어 수정하세요.</div>
          )}
          <div className="gameplay-event-panel__actions">
            <button type="button" onClick={deleteSelected}>이벤트 삭제</button>
            <button type="button" onClick={() => { void runBlueprint(selectedBlueprint); }}>선택 이벤트 실행</button>
          </div>
        </section>
      )}

      {!selectedBlueprint && (
        <section className="gameplay-event-panel__section">
          <div className="gameplay-event-panel__hint">이벤트 목록에서 `편집`을 누르면 상세 설정이 열립니다.</div>
        </section>
      )}

      <section className="gameplay-event-panel__section">
        <div className={`gameplay-event-panel__status gameplay-event-panel__status--${status.kind}`}>
          {status.message}
        </div>
      </section>
      {children}
    </div>
  );
}
