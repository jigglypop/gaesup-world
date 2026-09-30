import { FieldRow } from '../../../fields';
import { getNPCBlueprintNodeTitle } from '../helpers';
import type { NPCBrainEditor } from './useNPCBrainEditor';

/** The selected outgoing edge: target, branch and removal. */
export function BrainEdgeEditor({ editor }: { editor: NPCBrainEditor }) {
  const { availableEdgeNodes, selectedEdge, selectedEdgeTarget, updateSelectedEdge } = editor;
  return (
    <>
      {selectedEdge && (
        <>
          <FieldRow label="시작 노드">
            <select
              value={selectedEdge.source}
              onChange={(event) =>
                updateSelectedEdge((edge) => ({
                  ...edge,
                  source: event.target.value,
                }))
              }
              style={{ width: '100%' }}
            >
              {availableEdgeNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {getNPCBlueprintNodeTitle(node)}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="분기">
            <select
              value={selectedEdge.branch ?? 'next'}
              onChange={(event) =>
                updateSelectedEdge((edge) => ({
                  ...edge,
                  branch: event.target.value as 'true' | 'false' | 'next',
                }))
              }
              style={{ width: '100%' }}
            >
              <option value="next">다음</option>
              <option value="true">참</option>
              <option value="false">거짓</option>
            </select>
          </FieldRow>
          <FieldRow label="대상">
            <select
              value={selectedEdge.target}
              onChange={(event) =>
                updateSelectedEdge((edge) => ({
                  ...edge,
                  target: event.target.value,
                }))
              }
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
    </>
  );
}
