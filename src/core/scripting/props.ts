import type {
  ScriptAssetRefProp,
  ScriptBooleanProp,
  ScriptColorProp,
  ScriptEnumProp,
  ScriptNumberProp,
  ScriptObjectRefProp,
  ScriptPropDefinition,
  ScriptPropIssue,
  ScriptProps,
  ScriptPropSchema,
  ScriptStringProp,
  ScriptVector3Prop,
} from './types';
import type { SceneJsonObject, SceneJsonValue, SceneVector3 } from '../scene-object/types';

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const scriptProp = {
  number: (options: Omit<ScriptNumberProp, 'kind'>): ScriptNumberProp => ({ kind: 'number', ...options }),
  boolean: (options: Omit<ScriptBooleanProp, 'kind'>): ScriptBooleanProp => ({ kind: 'boolean', ...options }),
  string: (options: Omit<ScriptStringProp, 'kind'>): ScriptStringProp => ({ kind: 'string', ...options }),
  enum: <TValue extends string>(options: Omit<ScriptEnumProp<TValue>, 'kind'>): ScriptEnumProp<TValue> => ({
    kind: 'enum',
    ...options,
  }),
  vector3: (options: Omit<ScriptVector3Prop, 'kind'>): ScriptVector3Prop => ({ kind: 'vector3', ...options }),
  color: (options: Omit<ScriptColorProp, 'kind'>): ScriptColorProp => ({ kind: 'color', ...options }),
  assetRef: (options: Omit<ScriptAssetRefProp, 'kind'>): ScriptAssetRefProp => ({ kind: 'assetRef', ...options }),
  objectRef: (options: Omit<ScriptObjectRefProp, 'kind'>): ScriptObjectRefProp => ({ kind: 'objectRef', ...options }),
};

function isVector3(value: SceneJsonValue | undefined): value is SceneVector3 {
  return Array.isArray(value) && value.length === 3 && value.every((entry) => typeof entry === 'number' && Number.isFinite(entry));
}

function resolveValue(
  definition: ScriptPropDefinition,
  raw: SceneJsonValue | undefined,
): { value: unknown; issue?: string } {
  if (raw === undefined) return { value: definition.default };
  switch (definition.kind) {
    case 'number': {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return { value: definition.default, issue: '숫자가 아닙니다' };
      const min = definition.min ?? -Infinity;
      const max = definition.max ?? Infinity;
      return raw < min || raw > max
        ? { value: Math.min(max, Math.max(min, raw)), issue: `범위(${min}~${max})를 벗어났습니다` }
        : { value: raw };
    }
    case 'boolean':
      return typeof raw === 'boolean' ? { value: raw } : { value: definition.default, issue: '불리언이 아닙니다' };
    case 'string':
      return typeof raw === 'string' ? { value: raw } : { value: definition.default, issue: '문자열이 아닙니다' };
    case 'enum':
      return typeof raw === 'string' && definition.values.includes(raw)
        ? { value: raw }
        : { value: definition.default, issue: `허용 값이 아닙니다: ${String(raw)}` };
    case 'vector3':
      return isVector3(raw) ? { value: raw } : { value: definition.default, issue: '[x, y, z] 형식이 아닙니다' };
    case 'color':
      return typeof raw === 'string' && HEX_COLOR_PATTERN.test(raw)
        ? { value: raw }
        : { value: definition.default, issue: '#RGB 또는 #RRGGBB 형식이 아닙니다' };
    case 'assetRef':
    case 'objectRef':
      return raw === null || (typeof raw === 'string' && raw.trim().length > 0)
        ? { value: raw }
        : { value: definition.default, issue: '참조 id 형식이 아닙니다' };
  }
}

export function resolveScriptProps<TSchema extends ScriptPropSchema>(
  schema: TSchema,
  raw: SceneJsonObject | undefined,
): { props: ScriptProps<TSchema>; issues: ScriptPropIssue[] } {
  const props: Record<string, unknown> = {};
  const issues: ScriptPropIssue[] = [];
  for (const [key, definition] of Object.entries(schema)) {
    const resolved = resolveValue(definition, raw?.[key]);
    props[key] = resolved.value;
    if (resolved.issue) issues.push({ prop: key, message: resolved.issue });
  }
  return { props: props as ScriptProps<TSchema>, issues };
}
