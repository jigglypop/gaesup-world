import type { ToolKind } from '../items/types';

export type ToolUseEvent = {
  kind: ToolKind;
  origin: [number, number, number];
  direction: [number, number, number];
  range: number;
  timestamp: number;
};

export type ToolUseHandler = (event: ToolUseEvent) => void | boolean;
export type { ToolKind };
