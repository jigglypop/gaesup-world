import { BrainActionTypeField } from './BrainActionTypeField';
import { BrainMoveActionEditor } from './BrainMoveActionEditor';
import { BrainPatrolEditor } from './BrainPatrolEditor';
import { BrainStateActionEditor } from './BrainStateActionEditor';
import { BrainTimedActionEditor } from './BrainTimedActionEditor';
import type { NPCBrainEditor } from './useNPCBrainEditor';

/** Action node fields; each action type shows its own editor. */
export function BrainActionEditor({ editor }: { editor: NPCBrainEditor }) {
  const { selectedNode } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
      <BrainActionTypeField editor={editor} />
      <BrainTimedActionEditor editor={editor} />
      <BrainStateActionEditor editor={editor} />
      <BrainMoveActionEditor editor={editor} />
      <BrainPatrolEditor editor={editor} />
    </>
  );
}
