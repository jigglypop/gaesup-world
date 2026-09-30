import type { ScriptPropFieldProps } from './types';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  return String(value);
}

export function ScriptPropField({ name, schema, value, onChange }: ScriptPropFieldProps) {
  if (!onChange) {
    return (
      <span className="prop-value prop-value--readonly">
        {schema.kind} · {formatValue(value)}
      </span>
    );
  }

  switch (schema.kind) {
    case 'number':
      return (
        <input
          key={String(value)}
          type="number"
          aria-label={name}
          defaultValue={typeof value === 'number' ? value : schema.default}
          {...(schema.min !== undefined ? { min: schema.min } : {})}
          {...(schema.max !== undefined ? { max: schema.max } : {})}
          onBlur={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next) && next !== value) onChange(name, next);
          }}
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          aria-label={name}
          checked={value === true}
          onChange={(event) => onChange(name, event.target.checked)}
        />
      );
    case 'enum':
      return (
        <select aria-label={name} value={String(value)} onChange={(event) => onChange(name, event.target.value)}>
          {schema.values.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'color':
      return (
        <input
          type="color"
          aria-label={name}
          value={typeof value === 'string' ? value : schema.default}
          onChange={(event) => onChange(name, event.target.value)}
        />
      );
    case 'string':
      return (
        <input
          key={String(value)}
          type="text"
          aria-label={name}
          defaultValue={typeof value === 'string' ? value : schema.default}
          onBlur={(event) => {
            if (event.target.value !== value) onChange(name, event.target.value);
          }}
        />
      );
    default:
      return (
        <span className="prop-value prop-value--readonly">
          {schema.kind} · {formatValue(value)}
        </span>
      );
  }
}
