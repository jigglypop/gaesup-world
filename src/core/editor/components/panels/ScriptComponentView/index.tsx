import { ScriptPropField } from './ScriptPropField';
import type { ScriptComponentViewProps } from './types';
import type { SceneJsonObject, SceneJsonValue } from '../../../../scene-object';
import { resolveScriptProps } from '../../../../scripting/props';
import { getScript } from '../../../../scripting/registry';

function isJsonObject(value: SceneJsonValue | undefined): value is SceneJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function ScriptComponentView({ data, onChange }: ScriptComponentViewProps) {
  const scriptId = typeof data['scriptId'] === 'string' ? data['scriptId'] : '';
  const definition = scriptId ? getScript(scriptId) : undefined;
  const rawProps = data['props'];
  const overrides = isJsonObject(rawProps) ? rawProps : undefined;

  if (!definition) {
    return (
      <div className="inspector-script inspector-script--missing">
        <div className="prop-item">
          <span className="prop-label">스크립트</span>
          <span className="prop-value prop-value--readonly">{scriptId || '(지정 안 됨)'}</span>
        </div>
        <div className="inspector-component-empty">등록되지 않은 스크립트입니다</div>
      </div>
    );
  }

  const { props, issues } = resolveScriptProps(definition.props, overrides);
  const values = props as Record<string, unknown>;
  const handlePropChange = onChange
    ? (name: string, value: SceneJsonValue) => onChange({ ...data, props: { ...overrides, [name]: value } })
    : undefined;

  return (
    <div className="inspector-script">
      <div className="prop-item">
        <span className="prop-label">스크립트</span>
        <span className="prop-value prop-value--readonly">{definition.name ?? definition.id}</span>
      </div>
      {Object.entries(definition.props).map(([name, schema]) => (
        <label className="prop-item" key={name}>
          <span className="prop-label">{name}</span>
          <ScriptPropField
            name={name}
            schema={schema}
            value={values[name]}
            {...(handlePropChange ? { onChange: handlePropChange } : {})}
          />
        </label>
      ))}
      {issues.map((issue) => (
        <div className="inspector-component-empty" key={issue.prop}>
          {issue.prop}: {issue.message}
        </div>
      ))}
    </div>
  );
}
