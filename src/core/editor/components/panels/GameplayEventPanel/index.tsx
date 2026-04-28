import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from 'reactflow';

import {
  GameplayEventEngine,
  type GameplayEventBlueprint,
  type GameplayEventAction,
  type GameplayEventCondition,
  type GameplayEventTrigger,
  type GameplayTriggerEvent,
} from '../../../../gameplay';
import 'reactflow/dist/style.css';
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
type NodeFieldValue = string | number | boolean | string[] | Record<string, unknown>;
type EventNodeData = {
  title: string;
  fields?: Record<string, NodeFieldValue>;
  onEdit?: (nodeId: string, field: string, value: NodeFieldValue) => void;
  onDelete?: (nodeId: string) => void;
};

const EventEditableNode = ({ data, id }: NodeProps<EventNodeData>) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const saveField = (field: string) => {
    data.onEdit?.(id, field, toBooleanValue(tempValue));
    setEditingField(null);
  };

  return (
    <div className="gameplay-event-node">
      <Handle type="target" position={Position.Top} className="gameplay-event-node__handle" />
      <div className="gameplay-event-node__header">
        <span>{data.title}</span>
        {id !== 'root' && id !== 'trigger' && id !== 'policy' && (
          <button type="button" className="gameplay-event-node__delete" onClick={() => data.onDelete?.(id)}>
            Delete
          </button>
        )}
      </div>
      {data.fields && Object.entries(data.fields).map(([field, value]) => (
        <div key={field} className="gameplay-event-node__field">
          {editingField === field ? (
            <div className="gameplay-event-node__edit">
              <input
                value={tempValue}
                onChange={(event) => setTempValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveField(field);
                  if (event.key === 'Escape') setEditingField(null);
                }}
                autoFocus
              />
              <button type="button" onClick={() => saveField(field)}>Save</button>
              <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
            </div>
          ) : (
            <button
              type="button"
              className="gameplay-event-node__value"
              onClick={() => {
                if (field === 'type') return;
                setEditingField(field);
                setTempValue(String(value));
              }}
            >
              <span>{field}</span>
              <strong>{String(value)}</strong>
            </button>
          )}
        </div>
      ))}
      <Handle type="source" position={Position.Bottom} className="gameplay-event-node__handle" />
    </div>
  );
};

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

const toNodeValue = (value: NodeFieldValue): string | number | boolean =>
  Array.isArray(value) || (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value;

const EDGE_STYLE = { stroke: '#7a86a8', strokeWidth: 2 };
const MARKER_STYLE = { type: MarkerType.ArrowClosed, color: '#7a86a8', width: 20, height: 20 };

const nodeTypes = { editable: EventEditableNode };

const generateEventFlow = (
  blueprint: GameplayEventBlueprint,
  onEdit: (nodeId: string, field: string, value: NodeFieldValue) => void,
  onDelete: (nodeId: string) => void,
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [
    {
      id: 'root',
      type: 'editable',
      position: { x: 260, y: 20 },
      data: {
        title: blueprint.name,
        fields: {
          id: blueprint.id,
          name: blueprint.name,
          description: blueprint.description ?? '',
        },
        onEdit,
        onDelete,
      },
    },
    {
      id: 'trigger',
      type: 'editable',
      position: { x: 260, y: 180 },
      data: {
        title: `Trigger: ${blueprint.trigger.type}`,
        fields: { ...blueprint.trigger },
        onEdit,
        onDelete,
      },
    },
    {
      id: 'policy',
      type: 'editable',
      position: { x: 560, y: 180 },
      data: {
        title: 'Policy',
        fields: {
          run: blueprint.policy?.run ?? 'repeat',
          cooldownMs: blueprint.policy?.cooldownMs ?? 0,
          requiresServer: blueprint.policy?.requiresServer ?? false,
        },
        onEdit,
        onDelete,
      },
    },
  ];
  const edges: Edge[] = [
    { id: 'root-trigger', source: 'root', target: 'trigger', style: EDGE_STYLE, markerEnd: MARKER_STYLE },
    { id: 'root-policy', source: 'root', target: 'policy', style: EDGE_STYLE, markerEnd: MARKER_STYLE },
  ];

  (blueprint.conditions ?? []).forEach((condition, index) => {
    const nodeId = `condition:${index}`;
    nodes.push({
      id: nodeId,
      type: 'editable',
      position: { x: 40, y: 360 + index * 150 },
      data: {
        title: `Condition: ${condition.type}`,
        fields: { ...condition },
        onEdit,
        onDelete,
      },
    });
    edges.push({ id: `trigger-${nodeId}`, source: 'trigger', target: nodeId, style: EDGE_STYLE, markerEnd: MARKER_STYLE });
  });

  blueprint.actions.forEach((action, index) => {
    const nodeId = `action:${index}`;
    nodes.push({
      id: nodeId,
      type: 'editable',
      position: { x: 420, y: 360 + index * 150 },
      data: {
        title: `Action: ${action.type}`,
        fields: { ...action },
        onEdit,
        onDelete,
      },
    });
    edges.push({
      id: `${index === 0 ? 'trigger' : `action:${index - 1}`}-${nodeId}`,
      source: index === 0 ? 'trigger' : `action:${index - 1}`,
      target: nodeId,
      style: EDGE_STYLE,
      markerEnd: MARKER_STYLE,
    });
  });

  return { nodes, edges };
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  const handleNodeEdit = useCallback((nodeId: string, field: string, rawValue: NodeFieldValue) => {
    if (!selectedBlueprint || field === 'type') return;
    const value = toNodeValue(rawValue);

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

  const handleNodeDelete = useCallback((nodeId: string) => {
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

  useEffect(() => {
    if (!selectedBlueprint) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const flow = generateEventFlow(selectedBlueprint, handleNodeEdit, handleNodeDelete);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [handleNodeDelete, handleNodeEdit, selectedBlueprint, setEdges, setNodes]);

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
          <div className="gameplay-event-panel__editor-head">
            <div>
              <div className="gameplay-event-panel__title">Blueprint Node Editor</div>
              <div className="gameplay-event-panel__hint">
                노드 필드를 클릭해서 값을 수정합니다. 타입 변경은 아래 노드 추가/변경 액션에서 처리합니다.
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
          <div className="gameplay-event-panel__flow">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
            >
              <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
              <Controls />
            </ReactFlow>
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
              <option value="" disabled>Add Condition Node</option>
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
              <option value="" disabled>Add Action Node</option>
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
    </div>
  );
}
