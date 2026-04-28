import React, { useMemo, useState } from 'react';

import {
  GameplayEventEngine,
  type GameplayEventBlueprint,
  type GameplayEventAction,
  type GameplayEventCondition,
  type GameplayEventTrigger,
  type GameplayTriggerEvent,
} from '../../../../gameplay';
import './styles.css';

export type GameplayEventPanelProps = {
  blueprints: GameplayEventBlueprint[];
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
  blueprints,
  onCreate,
  onUpdate,
  onDelete,
  onRun,
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

  const updateSelected = (patch: Partial<GameplayEventBlueprint>) => {
    if (!selectedBlueprint) return;
    const next = { ...selectedBlueprint, ...patch };
    onUpdate?.(next);
    setSelectedId(next.id);
    setStatus({ kind: 'success', message: `Updated ${next.id}` });
  };

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

  const updateCondition = (index: number, condition: GameplayEventCondition) => {
    if (!selectedBlueprint) return;
    const conditions = [...(selectedBlueprint.conditions ?? [])];
    conditions[index] = condition;
    updateSelected({ conditions });
  };

  const updateAction = (index: number, action: GameplayEventAction) => {
    if (!selectedBlueprint) return;
    const actions = [...selectedBlueprint.actions];
    actions[index] = action;
    updateSelected({ actions });
  };

  const updateInteractionAction = (action: string) => {
    if (!selectedBlueprint || selectedBlueprint.trigger.type !== 'interaction') return;
    updateSelected({ trigger: { type: 'interaction', targetId: selectedBlueprint.trigger.targetId, action } });
  };

  return (
    <div className="gameplay-event-panel">
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
          <div className="gameplay-event-panel__title">Blueprint Editor</div>
          <label className="gameplay-event-panel__field">
            <span>ID</span>
            <input value={selectedBlueprint.id} onChange={(event) => updateSelected({ id: event.target.value })} />
          </label>
          <label className="gameplay-event-panel__field">
            <span>Name</span>
            <input value={selectedBlueprint.name} onChange={(event) => updateSelected({ name: event.target.value })} />
          </label>
          <label className="gameplay-event-panel__field">
            <span>Description</span>
            <input
              value={selectedBlueprint.description ?? ''}
              onChange={(event) => updateSelected({ description: event.target.value })}
            />
          </label>
          <label className="gameplay-event-panel__field">
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
          {selectedBlueprint.trigger.type === 'manual' && (
            <label className="gameplay-event-panel__field">
              <span>Trigger Key</span>
              <input value={selectedBlueprint.trigger.key} onChange={(event) => updateSelected({ trigger: { type: 'manual', key: event.target.value } })} />
            </label>
          )}
          {selectedBlueprint.trigger.type === 'interaction' && (
            <>
              <label className="gameplay-event-panel__field">
                <span>Target ID</span>
                <input value={selectedBlueprint.trigger.targetId} onChange={(event) => updateSelected({ trigger: { ...selectedBlueprint.trigger, type: 'interaction', targetId: event.target.value } })} />
              </label>
              <label className="gameplay-event-panel__field">
                <span>Action</span>
                <input value={selectedBlueprint.trigger.action ?? ''} onChange={(event) => updateInteractionAction(event.target.value)} />
              </label>
            </>
          )}
          {selectedBlueprint.trigger.type === 'enterArea' && (
            <label className="gameplay-event-panel__field">
              <span>Area ID</span>
              <input value={selectedBlueprint.trigger.areaId} onChange={(event) => updateSelected({ trigger: { type: 'enterArea', areaId: event.target.value } })} />
            </label>
          )}
          {selectedBlueprint.trigger.type === 'calendarEventStarted' && (
            <label className="gameplay-event-panel__field">
              <span>Event ID</span>
              <input value={selectedBlueprint.trigger.eventId} onChange={(event) => updateSelected({ trigger: { type: 'calendarEventStarted', eventId: event.target.value } })} />
            </label>
          )}

          <div className="gameplay-event-panel__subhead">Conditions</div>
          {(selectedBlueprint.conditions ?? []).map((condition, index) => (
            <div key={`${condition.type}-${index}`} className="gameplay-event-panel__row">
              <select value={condition.type} onChange={(event) => updateCondition(index, makeDefaultCondition(event.target.value as ConditionType))}>
                {(['always', 'hasItem', 'questStatus', 'eventActive', 'flagEquals', 'custom'] as ConditionType[]).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {condition.type === 'hasItem' && <input value={condition.itemId} onChange={(event) => updateCondition(index, { ...condition, itemId: event.target.value })} />}
              {condition.type === 'flagEquals' && <input value={String(condition.value)} onChange={(event) => updateCondition(index, { ...condition, value: toBooleanValue(event.target.value) })} />}
              <button type="button" onClick={() => updateSelected({ conditions: (selectedBlueprint.conditions ?? []).filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => updateSelected({ conditions: [...(selectedBlueprint.conditions ?? []), { type: 'always' }] })}>
            Add Condition
          </button>

          <div className="gameplay-event-panel__subhead">Actions</div>
          {selectedBlueprint.actions.map((action, index) => (
            <div key={`${action.type}-${index}`} className="gameplay-event-panel__row">
              <select value={action.type} onChange={(event) => updateAction(index, makeDefaultAction(event.target.value as ActionType))}>
                {(['giveItem', 'removeItem', 'startQuest', 'completeQuest', 'showDialog', 'toast', 'setFlag', 'notifyQuestFlag', 'emit', 'custom'] as ActionType[]).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {action.type === 'toast' && <input value={action.text} onChange={(event) => updateAction(index, { ...action, text: event.target.value })} />}
              {(action.type === 'giveItem' || action.type === 'removeItem') && <input value={action.itemId} onChange={(event) => updateAction(index, { ...action, itemId: event.target.value })} />}
              {(action.type === 'startQuest' || action.type === 'completeQuest') && <input value={action.questId} onChange={(event) => updateAction(index, { ...action, questId: event.target.value })} />}
              <button type="button" onClick={() => updateSelected({ actions: selectedBlueprint.actions.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => updateSelected({ actions: [...selectedBlueprint.actions, { type: 'toast', kind: 'success', text: '이벤트 실행' }] })}>
            Add Action
          </button>

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
    </div>
  );
}
