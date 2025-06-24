import React from 'react';
import { useEditorStore } from '../../hooks/useEditor';

export function QuickActionsPanel() {
  const { compileFSM } = useEditorStore();

  const actions = [
    { label: 'Load Asset', action: () => console.log('Load asset') },
    { label: 'Save Scene', action: () => console.log('Save scene') },
    { label: 'Build Project', action: () => console.log('Build project') },
    { label: 'Export Package', action: () => console.log('Export package') },
  ];

  return (
    <div className="quick-actions-panel">
      <h3 className="editor-title">Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className="editor-glass-button action-button"
            onClick={action.action}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
} 