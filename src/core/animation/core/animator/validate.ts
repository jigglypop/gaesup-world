import type {
  AnimatorCondition,
  AnimatorControllerDefinition,
  AnimatorLayerDefinition,
  AnimatorMotion,
  AnimatorParameterDefinition,
  AnimatorValidationIssue,
  AnimatorValidationResult,
} from './types';

export const ANIMATOR_ANY_STATE = '*';

const NUMERIC_OPERATORS = new Set(['greater', 'less', 'equals', 'notEquals']);
const BOOL_OPERATORS = new Set(['true', 'false']);

function isFiniteNumber(value: number | undefined): boolean {
  return value === undefined || Number.isFinite(value);
}

function validateParameterDefault(
  name: string,
  definition: AnimatorParameterDefinition,
  issues: AnimatorValidationIssue[],
): void {
  const value = definition.default;
  if (value === undefined) return;
  const ok = definition.type === 'float' ? typeof value === 'number' && Number.isFinite(value) : typeof value === 'boolean';
  if (!ok) {
    issues.push({
      code: 'invalid-parameter-default',
      path: `parameters.${name}`,
      message: `기본값이 ${definition.type} 형식이 아닙니다`,
    });
  }
}

function validateCondition(
  condition: AnimatorCondition,
  parameters: Record<string, AnimatorParameterDefinition>,
  path: string,
  issues: AnimatorValidationIssue[],
): void {
  const parameter = parameters[condition.parameter];
  if (!parameter) {
    issues.push({ code: 'unknown-parameter', path, message: `알 수 없는 파라미터: ${condition.parameter}` });
    return;
  }
  const { operator } = condition;
  const matches =
    (parameter.type === 'float' && NUMERIC_OPERATORS.has(operator) && Number.isFinite(condition.value)) ||
    (parameter.type === 'bool' && BOOL_OPERATORS.has(operator)) ||
    (parameter.type === 'trigger' && operator === 'trigger');
  if (!matches) {
    issues.push({
      code: 'invalid-condition',
      path,
      message: `${parameter.type} 파라미터 ${condition.parameter}에 ${operator} 조건을 쓸 수 없습니다`,
    });
  }
}

function validateMotion(
  motion: AnimatorMotion,
  parameters: Record<string, AnimatorParameterDefinition>,
  path: string,
  issues: AnimatorValidationIssue[],
): void {
  if (!isFiniteNumber(motion.speed)) {
    issues.push({ code: 'invalid-number', path: `${path}.speed`, message: '속도는 유한한 숫자여야 합니다' });
  }
  if (motion.kind === 'clip') {
    if (!motion.clip.trim()) {
      issues.push({ code: 'invalid-blend', path: `${path}.clip`, message: '클립 이름이 비어 있습니다' });
    }
    return;
  }
  if (parameters[motion.parameter]?.type !== 'float') {
    issues.push({
      code: 'unknown-parameter',
      path: `${path}.parameter`,
      message: `blend1D 파라미터는 float이어야 합니다: ${motion.parameter}`,
    });
  }
  if (motion.children.length === 0) {
    issues.push({ code: 'invalid-blend', path: `${path}.children`, message: 'blend1D 자식이 없습니다' });
    return;
  }
  for (let i = 0; i < motion.children.length; i++) {
    const child = motion.children[i];
    const previous = motion.children[i - 1];
    if (!child) continue;
    if (!Number.isFinite(child.threshold) || (previous && child.threshold <= previous.threshold)) {
      issues.push({
        code: 'invalid-blend',
        path: `${path}.children[${i}]`,
        message: 'blend1D 임계값은 유한하고 오름차순이어야 합니다',
      });
    }
  }
}

function validateLayer(
  layer: AnimatorLayerDefinition,
  layerIndex: number,
  parameters: Record<string, AnimatorParameterDefinition>,
  issues: AnimatorValidationIssue[],
): void {
  const path = `layers[${layerIndex}]`;
  if (layer.states.length === 0) {
    issues.push({ code: 'empty-layer', path, message: `레이어 ${layer.name}에 상태가 없습니다` });
    return;
  }
  if (layer.weight !== undefined && !(layer.weight >= 0 && layer.weight <= 1)) {
    issues.push({ code: 'invalid-number', path: `${path}.weight`, message: '레이어 가중치는 0~1이어야 합니다' });
  }
  const names = new Set<string>();
  layer.states.forEach((state, stateIndex) => {
    const statePath = `${path}.states[${stateIndex}]`;
    if (names.has(state.name)) {
      issues.push({ code: 'duplicate-state', path: statePath, message: `중복 상태: ${state.name}` });
    }
    names.add(state.name);
    validateMotion(state.motion, parameters, `${statePath}.motion`, issues);
    state.events?.forEach((event, eventIndex) => {
      if (!event.name || !(event.time >= 0 && event.time <= 1)) {
        issues.push({
          code: 'invalid-event',
          path: `${statePath}.events[${eventIndex}]`,
          message: '이벤트 이름이 필요하고 시간은 0~1이어야 합니다',
        });
      }
    });
  });
  if (!names.has(layer.defaultState)) {
    issues.push({
      code: 'missing-default-state',
      path: `${path}.defaultState`,
      message: `기본 상태가 없습니다: ${layer.defaultState}`,
    });
  }
  layer.transitions?.forEach((transition, transitionIndex) => {
    const transitionPath = `${path}.transitions[${transitionIndex}]`;
    if ((transition.from !== ANIMATOR_ANY_STATE && !names.has(transition.from)) || !names.has(transition.to)) {
      issues.push({
        code: 'missing-transition-state',
        path: transitionPath,
        message: `전이 상태를 찾을 수 없습니다: ${transition.from} -> ${transition.to}`,
      });
    }
    if (!isFiniteNumber(transition.duration) || (transition.duration ?? 0) < 0) {
      issues.push({ code: 'invalid-number', path: `${transitionPath}.duration`, message: '전이 시간은 0 이상이어야 합니다' });
    }
    if (!isFiniteNumber(transition.exitTime) || (transition.exitTime ?? 0) < 0) {
      issues.push({ code: 'invalid-number', path: `${transitionPath}.exitTime`, message: 'exitTime은 0 이상이어야 합니다' });
    }
    transition.conditions?.forEach((condition, conditionIndex) => {
      validateCondition(condition, parameters, `${transitionPath}.conditions[${conditionIndex}]`, issues);
    });
  });
}

export function validateAnimatorController(
  definition: AnimatorControllerDefinition,
): AnimatorValidationResult {
  const issues: AnimatorValidationIssue[] = [];
  const parameters = definition.parameters ?? {};
  if (!definition.id.trim()) {
    issues.push({ code: 'empty-controller-id', path: 'id', message: '컨트롤러 id가 비어 있습니다' });
  }
  Object.entries(parameters).forEach(([name, parameter]) => {
    validateParameterDefault(name, parameter, issues);
  });
  if (definition.layers.length === 0) {
    issues.push({ code: 'no-layers', path: 'layers', message: '레이어가 하나 이상 필요합니다' });
  }
  const layerNames = new Set<string>();
  definition.layers.forEach((layer, layerIndex) => {
    if (layerNames.has(layer.name)) {
      issues.push({ code: 'duplicate-layer', path: `layers[${layerIndex}]`, message: `중복 레이어: ${layer.name}` });
    }
    layerNames.add(layer.name);
    validateLayer(layer, layerIndex, parameters, issues);
  });
  return { valid: issues.length === 0, issues };
}
