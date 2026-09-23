export type AnimatorParameterType = 'float' | 'bool' | 'trigger';

export type AnimatorParameterValue = number | boolean;

export type AnimatorParameterDefinition = {
  type: AnimatorParameterType;
  default?: AnimatorParameterValue;
};

export type AnimatorConditionOperator =
  | 'greater'
  | 'less'
  | 'equals'
  | 'notEquals'
  | 'true'
  | 'false'
  | 'trigger';

export type AnimatorCondition = {
  parameter: string;
  operator: AnimatorConditionOperator;
  value?: number;
};

export type AnimatorClipMotion = {
  kind: 'clip';
  clip: string;
  loop?: boolean;
  speed?: number;
};

export type AnimatorBlendChild = {
  clip: string;
  threshold: number;
};

export type AnimatorBlend1DMotion = {
  kind: 'blend1D';
  parameter: string;
  children: AnimatorBlendChild[];
  loop?: boolean;
  speed?: number;
};

export type AnimatorMotion = AnimatorClipMotion | AnimatorBlend1DMotion;

export type AnimatorEventDefinition = {
  name: string;
  time: number;
};

export type AnimatorStateDefinition = {
  name: string;
  motion: AnimatorMotion;
  events?: AnimatorEventDefinition[];
};

export type AnimatorTransitionDefinition = {
  from: string;
  to: string;
  conditions?: AnimatorCondition[];
  duration?: number;
  exitTime?: number;
  canTransitionToSelf?: boolean;
};

export type AnimatorLayerBlending = 'override' | 'additive';

export type AnimatorMaskDefinition = {
  bones: string[];
  includeDescendants?: boolean;
};

export type AnimatorLayerDefinition = {
  name: string;
  defaultState: string;
  states: AnimatorStateDefinition[];
  transitions?: AnimatorTransitionDefinition[];
  weight?: number;
  blending?: AnimatorLayerBlending;
  mask?: AnimatorMaskDefinition;
};

export type AnimatorControllerDefinition = {
  id: string;
  parameters?: Record<string, AnimatorParameterDefinition>;
  layers: AnimatorLayerDefinition[];
};

export type AnimatorValidationIssueCode =
  | 'empty-controller-id'
  | 'no-layers'
  | 'duplicate-layer'
  | 'empty-layer'
  | 'duplicate-state'
  | 'missing-default-state'
  | 'missing-transition-state'
  | 'unknown-parameter'
  | 'invalid-parameter-default'
  | 'invalid-condition'
  | 'invalid-blend'
  | 'invalid-event'
  | 'invalid-number';

export type AnimatorValidationIssue = {
  code: AnimatorValidationIssueCode;
  path: string;
  message: string;
};

export type AnimatorValidationResult = {
  valid: boolean;
  issues: AnimatorValidationIssue[];
};

export type AnimatorClipBinding = {
  hasClip: (layerIndex: number, clip: string) => boolean;
  getClipDuration: (layerIndex: number, clip: string) => number;
  beginFrame: () => void;
  writeClip: (
    layerIndex: number,
    clip: string,
    time: number,
    clipWeight: number,
    layerWeight: number,
  ) => void;
  endFrame: () => void;
  dispose: () => void;
};

export type AnimatorEvent = {
  controllerId: string;
  layer: string;
  state: string;
  name: string;
};

export type AnimatorEventListener = (event: AnimatorEvent) => void;

export type AnimatorLayerStatus = {
  name: string;
  state: string;
  normalizedTime: number;
  weight: number;
  override: string | null;
};
