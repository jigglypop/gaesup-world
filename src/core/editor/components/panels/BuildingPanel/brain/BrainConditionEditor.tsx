import { FieldRow } from '../../../fields';
import { getNPCBrainLabel } from '../helpers';
import { NPC_CONDITION_TYPES } from './constants';
import type { NPCBrainEditor } from './useNPCBrainEditor';

type ConditionType = (typeof NPC_CONDITION_TYPES)[number];

function createCondition(type: ConditionType) {
  return type === 'memoryEquals' ? { type, key: 'memory.key', value: true } : { type };
}

/** Condition node fields. */
export function BrainConditionEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode } = editor;
  if (selectedNode?.type !== 'condition') return null;
  return (
    <FieldRow label="조건 타입">
      <select
        value={selectedNode.condition.type}
        onChange={(event) => {
          const nextType = event.target.value as ConditionType;
          updateSelectedNode((node) => (node.type === 'condition' ? { ...node, condition: createCondition(nextType) } : node));
        }}
      >
        {NPC_CONDITION_TYPES.map((type) => (
          <option key={type} value={type}>
            {getNPCBrainLabel(type)}
          </option>
        ))}
      </select>
    </FieldRow>
  );
}
