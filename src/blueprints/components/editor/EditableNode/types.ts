export type NodeFieldValue = string | number | boolean | string[] | Record<string, unknown>;

export type EditableNodeData = {
  title: string;
  fields?: Record<string, NodeFieldValue>;
  onEdit?: (nodeId: string, field: string, value: NodeFieldValue) => void;
  onDelete?: (nodeId: string) => void;
}; 