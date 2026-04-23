import type { BlueprintRecord } from '../../../types';

export type NodeFieldValue = string | number | boolean | string[] | BlueprintRecord;

export type EditableNodeData = {
  title: string;
  fields?: Record<string, NodeFieldValue>;
  onEdit?: (nodeId: string, field: string, value: NodeFieldValue) => void;
  onDelete?: (nodeId: string) => void;
}; 
