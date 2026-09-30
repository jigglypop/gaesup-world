import { useState } from 'react';

import type { ScriptPickerProps } from './types';
import { listScripts } from '../../../../scripting/registry';

export function ScriptPicker({ onAdd }: ScriptPickerProps) {
  const scripts = listScripts();
  const [scriptId, setScriptId] = useState('');
  if (scripts.length === 0) return null;
  const selected = scripts.some((script) => script.id === scriptId) ? scriptId : scripts[0]!.id;

  return (
    <div className="inspector-add-component">
      <select aria-label="추가할 스크립트" value={selected} onChange={(event) => setScriptId(event.target.value)}>
        {scripts.map((script) => (
          <option key={script.id} value={script.id}>{script.name ?? script.id}</option>
        ))}
      </select>
      <button type="button" onClick={() => onAdd(selected)}>
        스크립트 추가
      </button>
    </div>
  );
}
