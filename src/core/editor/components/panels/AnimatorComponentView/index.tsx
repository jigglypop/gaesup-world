import type { AnimatorComponentViewProps } from './types';
import { getAnimatorController } from '../../../../animation/core/animator/registry';

function formatValue(value: unknown): string {
  if (value === undefined) return '-';
  return typeof value === 'number' ? String(Number(value.toFixed(3))) : String(value);
}

export function AnimatorComponentView({ data }: AnimatorComponentViewProps) {
  const controllerId = typeof data['controllerId'] === 'string' ? data['controllerId'] : '';
  const overrides = data['parameters'];
  const overrideValues = overrides && typeof overrides === 'object' && !Array.isArray(overrides) ? overrides : {};
  const controller = controllerId ? getAnimatorController(controllerId) : undefined;

  if (!controller) {
    return (
      <div className="inspector-animator inspector-animator--missing">
        <div className="prop-item">
          <span className="prop-label">컨트롤러</span>
          <span className="prop-value prop-value--readonly">{controllerId || '(지정 안 됨)'}</span>
        </div>
        <div className="inspector-component-empty">등록되지 않은 Animator 컨트롤러입니다</div>
      </div>
    );
  }

  return (
    <div className="inspector-animator">
      <div className="prop-item">
        <span className="prop-label">컨트롤러</span>
        <span className="prop-value prop-value--readonly">{controller.id}</span>
      </div>
      {Object.entries(controller.parameters ?? {}).map(([name, parameter]) => (
        <div className="prop-item" key={name}>
          <span className="prop-label">{name}</span>
          <span className="prop-value prop-value--readonly">
            {parameter.type} · {formatValue((overrideValues as Record<string, unknown>)[name] ?? parameter.default)}
          </span>
        </div>
      ))}
      {controller.layers.map((layer) => (
        <div className="prop-item" key={layer.name}>
          <span className="prop-label">{layer.name}</span>
          <span className="prop-value prop-value--readonly">
            {layer.states.map((state) => (state.name === layer.defaultState ? `[${state.name}]` : state.name)).join(', ')}
          </span>
        </div>
      ))}
    </div>
  );
}
