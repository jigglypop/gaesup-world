import React, { useMemo, useState } from 'react';

import {
  GameplayEventEngine,
  type GameplayEventBlueprint,
  type GameplayTriggerEvent,
} from '../../../../gameplay';
import './styles.css';

export type GameplayEventPanelProps = {
  blueprints: GameplayEventBlueprint[];
  onCreate?: (blueprint: GameplayEventBlueprint) => void;
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

export function GameplayEventPanel({
  blueprints,
  onCreate,
  onRun,
}: GameplayEventPanelProps) {
  const fallbackEngine = useMemo(() => new GameplayEventEngine({ blueprints }), [blueprints]);
  const [id, setId] = useState('custom-toast');
  const [name, setName] = useState('Custom Toast Event');
  const [triggerKey, setTriggerKey] = useState('custom.run');
  const [message, setMessage] = useState('커스텀 이벤트 실행');
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
    setStatus({ kind: 'success', message: `Created ${next.id}` });
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
        <div className="gameplay-event-panel__title">Blueprints</div>
        <div className="gameplay-event-panel__list">
          {blueprints.map((blueprint) => (
            <article key={blueprint.id} className="gameplay-event-panel__card">
              <div>
                <div className="gameplay-event-panel__card-title">{blueprint.name}</div>
                <div className="gameplay-event-panel__card-meta">
                  {blueprint.id} · {blueprint.trigger.type} · {blueprint.actions.length} action(s)
                </div>
              </div>
              <button type="button" onClick={() => { void runBlueprint(blueprint); }}>
                Run
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="gameplay-event-panel__section">
        <div className={`gameplay-event-panel__status gameplay-event-panel__status--${status.kind}`}>
          {status.message}
        </div>
      </section>
    </div>
  );
}
