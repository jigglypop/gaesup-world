import type { SceneJsonObject, SceneJsonValue } from '../../../../scene-object';
import type { ScriptPropDefinition } from '../../../../scripting/types';

export type ScriptComponentViewProps = {
  data: SceneJsonObject;
  onChange?: (data: SceneJsonObject) => void;
};

export type ScriptPropFieldProps = {
  name: string;
  schema: ScriptPropDefinition;
  value: unknown;
  onChange?: (name: string, value: SceneJsonValue) => void;
};
