import React, { useCallback, useMemo, useState } from 'react';

import {
  GameplayEventEngine,
  SEED_GAMEPLAY_EVENTS,
  type GameplayEventBlueprint,
  type GameplayEventAction,
  type GameplayEventCondition,
  type GameplayEventTrigger,
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

type TriggerType = GameplayEventTrigger['type'];
type ConditionType = GameplayEventCondition['type'];
type ActionType = GameplayEventAction['type'];
type InspectorValue = string | number | boolean;

const makeDefaultTrigger = (type: TriggerType): GameplayEventTrigger => {
  switch (type) {
    case 'manual':
      return { type, key: 'custom.run' };
    case 'interaction':
      return { type, targetId: 'npc:tommy', action: 'talk' };
    case 'enterArea':
      return { type, areaId: 'meadow' };
    case 'itemCollected':
      return { type, itemId: 'apple' };
    case 'timeChanged':
      return { type, hour: 9 };
    case 'calendarEventStarted':
      return { type, eventId: 'event.cherryblossom' };
    case 'questChanged':
      return { type, questId: 'welcome', status: 'active' };
    case 'custom':
      return { type, key: 'custom.event' };
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
};

const makeDefaultCondition = (type: ConditionType): GameplayEventCondition => {
  switch (type) {
    case 'always':
      return { type };
    case 'hasItem':
      return { type, itemId: 'apple', count: 1 };
    case 'questStatus':
      return { type, questId: 'welcome', status: 'active' };
    case 'eventActive':
      return { type, eventId: 'event.cherryblossom' };
    case 'flagEquals':
      return { type, key: 'gameplayReady', value: true };
    case 'custom':
      return { type, key: 'custom.condition' };
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
};

const makeDefaultAction = (type: ActionType): GameplayEventAction => {
  switch (type) {
    case 'giveItem':
      return { type, itemId: 'apple', count: 1 };
    case 'removeItem':
      return { type, itemId: 'apple', count: 1 };
    case 'startQuest':
      return { type, questId: 'welcome' };
    case 'completeQuest':
      return { type, questId: 'welcome' };
    case 'showDialog':
      return { type, dialogTreeId: 'npc.villager', npcId: 'mei' };
    case 'toast':
      return { type, kind: 'success', text: '이벤트 실행' };
    case 'setFlag':
      return { type, key: 'customFlag', value: true };
    case 'notifyQuestFlag':
      return { type, key: 'customFlag', value: true };
    case 'emit':
      return { type, eventName: 'gameplay.custom' };
    case 'custom':
      return { type, key: 'custom.action' };
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
};

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
  const [id, setId] = useState('custom-toast');
  const [name, setName] = useState('Custom Toast Event');
  const [triggerKey, setTriggerKey] = useState('custom.run');
  const [message, setMessage] = useState('커스텀 이벤트 실행');
  const [selectedId, setSelectedId] = useState<string | null>(blueprints[0]?.id ?? null);
  const selectedBlueprint = useMemo(
    () => blueprints.find((blueprint) => blueprint.id === selectedId) ?? blueprints[0] ?? null,
    [blueprints, selectedId],
  );
  const [status, setStatus] = useState<PanelStatus>({ kind: 'idle', message: 'Ready' });

  const createBlueprint = () => {
    const next: GameplayEventBlueprint = {
      id: id.trim() || `event-${Date.now()}`,
      name: name.trim() || 'Untitled Event',
      trigger: { type: 'manual', key: triggerKey.trim() || 'custom.run' },
      conditions: [{ type: 'always' }],
      actions: [
        { type: 'toast', kind: 'success', text: message.trim() || '이벤트 실행' },
        { type: 'setFlag', key: id.trim() || 'customEvent', value: true },
      ],
      policy: { run: 'repeat' },
      tags: ['editor'],
    };
    onCreate?.(next);
    setSelectedId(next.id);
    setStatus({ kind: 'success', message: `Created ${next.id}` });
  };

  const updateSelected = useCallback((patch: Partial<GameplayEventBlueprint>) => {
    if (!selectedBlueprint) return;
    const next = { ...selectedBlueprint, ...patch };
    onUpdate?.(next);
    setSelectedId(next.id);
    setStatus({ kind: 'success', message: `Updated ${next.id}` });
  }, [onUpdate, selectedBlueprint]);

  const deleteSelected = () => {
    if (!selectedBlueprint) return;
    onDelete?.(selectedBlueprint.id);
    const next = blueprints.find((blueprint) => blueprint.id !== selectedBlueprint.id) ?? null;
    setSelectedId(next?.id ?? null);
    setStatus({ kind: 'success', message: `Deleted ${selectedBlueprint.id}` });
  };

  const runBlueprint = async (blueprint: GameplayEventBlueprint) => {
    const trigger = triggerToEvent(blueprint);
    if (onRun) {
      await onRun(trigger);
    } else {
      await fallbackEngine.dispatch(trigger);
    }
    setStatus({ kind: 'success', message: `Ran ${blueprint.id}` });
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
      if (trigger.type === 'manual' && field === 'key') updateSelected({ trigger: { type: 'manual', key: String(value) } });
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
      if (trigger.type === 'custom' && field === 'key') updateSelected({ trigger: { type: 'custom', key: String(value) } });
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
          <span>{field}</span>
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
        <div className="gameplay-event-panel__title">Create Manual Event</div>
        <label className="gameplay-event-panel__field">
          <span>ID</span>
          <input value={id} onChange={(event) => setId(event.target.value)} />
        </label>
        <label className="gameplay-event-panel__field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="gameplay-event-panel__field">
          <span>Trigger Key</span>
          <input value={triggerKey} onChange={(event) => setTriggerKey(event.target.value)} />
        </label>
        <label className="gameplay-event-panel__field">
          <span>Toast Message</span>
          <input value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        <button type="button" className="gameplay-event-panel__primary" onClick={createBlueprint}>
          Create Event Blueprint
        </button>
      </section>

      <section className="gameplay-event-panel__section">
        <div className="gameplay-event-panel__title">Blueprint Library</div>
        <div className="gameplay-event-panel__list">
          {blueprints.map((blueprint) => (
            <article key={blueprint.id} className="gameplay-event-panel__card">
              <div>
                <div className="gameplay-event-panel__card-title">{blueprint.name}</div>
                <div className="gameplay-event-panel__card-meta">
                  {blueprint.id} · {blueprint.trigger.type} · {blueprint.actions.length} action(s)
                </div>
              </div>
              <div className="gameplay-event-panel__card-actions">
                <button type="button" onClick={() => setSelectedId(blueprint.id)}>
                  Edit
                </button>
                <button type="button" onClick={() => { void runBlueprint(blueprint); }}>
                  Run
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedBlueprint && (
        <section className="gameplay-event-panel__section gameplay-event-panel__detail">
          <div className="gameplay-event-panel__editor-head">
            <div>
              <div className="gameplay-event-panel__title">Event Inspector</div>
              <div className="gameplay-event-panel__hint">
                그래프 노드 대신 트리거, 조건, 액션을 섹션별 인스펙터에서 수정합니다.
              </div>
            </div>
            <label className="gameplay-event-panel__type-select">
              <span>Trigger</span>
              <select
                value={selectedBlueprint.trigger.type}
                onChange={(event) => updateSelected({ trigger: makeDefaultTrigger(event.target.value as TriggerType) })}
              >
                {(['manual', 'interaction', 'enterArea', 'itemCollected', 'timeChanged', 'calendarEventStarted', 'questChanged', 'custom'] as TriggerType[]).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="gameplay-event-panel__inspector">
            <div className="gameplay-event-panel__inspector-card">
              <div className="gameplay-event-panel__subhead">Blueprint</div>
              {renderFields('root', {
                id: selectedBlueprint.id,
                name: selectedBlueprint.name,
                description: selectedBlueprint.description ?? '',
              })}
            </div>
            <div className="gameplay-event-panel__inspector-card">
              <div className="gameplay-event-panel__subhead">Trigger</div>
              {renderFields('trigger', selectedBlueprint.trigger as unknown as Record<string, InspectorValue>)}
            </div>
            <div className="gameplay-event-panel__inspector-card">
              <div className="gameplay-event-panel__subhead">Policy</div>
              {renderFields('policy', {
                run: selectedBlueprint.policy?.run ?? 'repeat',
                cooldownMs: selectedBlueprint.policy?.cooldownMs ?? 0,
                requiresServer: selectedBlueprint.policy?.requiresServer ?? false,
              })}
            </div>
            <div className="gameplay-event-panel__inspector-card">
              <div className="gameplay-event-panel__subhead">Conditions</div>
              {(selectedBlueprint.conditions ?? []).map((condition, index) => (
                <div key={`condition-${index}`} className="gameplay-event-panel__item-editor">
                  {renderFields(`condition:${index}`, condition as unknown as Record<string, InspectorValue>)}
                  <button type="button" onClick={() => deleteInspectorItem(`condition:${index}`)}>Remove</button>
                </div>
              ))}
              {(selectedBlueprint.conditions ?? []).length === 0 && (
                <div className="gameplay-event-panel__hint">조건 없음</div>
              )}
            </div>
            <div className="gameplay-event-panel__inspector-card">
              <div className="gameplay-event-panel__subhead">Actions</div>
              {selectedBlueprint.actions.map((action, index) => (
                <div key={`action-${index}`} className="gameplay-event-panel__item-editor">
                  {renderFields(`action:${index}`, action as unknown as Record<string, InspectorValue>)}
                  <button type="button" onClick={() => deleteInspectorItem(`action:${index}`)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div className="gameplay-event-panel__node-toolbar">
            <select
              aria-label="Condition type"
              onChange={(event) => {
                updateSelected({ conditions: [...(selectedBlueprint.conditions ?? []), makeDefaultCondition(event.target.value as ConditionType)] });
                event.currentTarget.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>Add Condition</option>
              {(['always', 'hasItem', 'questStatus', 'eventActive', 'flagEquals', 'custom'] as ConditionType[]).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              aria-label="Action type"
              onChange={(event) => {
                updateSelected({ actions: [...selectedBlueprint.actions, makeDefaultAction(event.target.value as ActionType)] });
                event.currentTarget.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>Add Action</option>
              {(['giveItem', 'removeItem', 'startQuest', 'completeQuest', 'showDialog', 'toast', 'setFlag', 'notifyQuestFlag', 'emit', 'custom'] as ActionType[]).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="gameplay-event-panel__actions">
            <button type="button" onClick={deleteSelected}>Delete Blueprint</button>
            <button type="button" onClick={() => { void runBlueprint(selectedBlueprint); }}>Run Selected</button>
          </div>
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
