import React, { useState } from 'react';
import { FSMNode } from './types';

const initialNodes: FSMNode[] = [
  { id: '1', label: 'Start State', position: { x: 250, y: 25 } },
  { id: '2', label: 'Idle State', position: { x: 100, y: 125 } },
  { id: '3', label: 'Moving State', position: { x: 400, y: 125 } },
];

export const NodeEditorPanel: React.FC = () => {
  const [nodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="editor-title">🔗 Node Editor (FSM)</h3>
      <div className="editor-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        <div className="editor-text" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          State Machine Nodes:
        </div>
        
        {nodes.map((node) => (
          <div 
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            style={{
              padding: '8px 12px',
              margin: '4px 0',
              background: selectedNode === node.id ? 'rgba(0, 120, 212, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              border: selectedNode === node.id ? '1px solid rgba(0, 120, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="editor-text" style={{ fontWeight: 'bold' }}>{node.label}</div>
            <div className="editor-text-small">
              Position: ({node.position.x}, {node.position.y})
            </div>
          </div>
        ))}
        
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: 'rgba(0, 0, 0, 0.2)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px' 
        }}>
          <div className="editor-text" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            FSM Graph Preview
          </div>
          <div className="editor-text-small" style={{ marginBottom: '6px' }}>
            Start → Idle ↔ Moving
          </div>
          <div className="editor-text-small" style={{ opacity: 0.7 }}>
            Note: React Flow integration will be added once package issues are resolved.
          </div>
        </div>
      </div>
    </div>
  );
}; 