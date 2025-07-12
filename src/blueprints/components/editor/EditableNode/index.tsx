import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './styles.css';
import { EditableNodeData, NodeFieldValue } from './types';

export const EditableNode = ({ data, id }: NodeProps<EditableNodeData>) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (field: string, currentValue: NodeFieldValue) => {
    setIsEditing(field);
    setTempValue(String(currentValue));
  };

  const handleSave = (field: string) => {
    if (data.onEdit) {
      data.onEdit(id, field, isNaN(Number(tempValue)) ? tempValue : Number(tempValue));
    }
    setIsEditing(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setTempValue('');
  };

  const handleDelete = () => {
    if (data.onDelete && id !== 'root') {
      data.onDelete(id);
    }
  };

  const getHeaderClass = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('physics') || lowerTitle.includes('force') || 
        lowerTitle.includes('gravity') || lowerTitle.includes('buoyancy') || 
        lowerTitle.includes('wind') || lowerTitle.includes('drag')) {
      return 'editable-node__header--physics';
    } else if (lowerTitle.includes('animation') || lowerTitle.includes('trigger')) {
      return 'editable-node__header--animation';
    } else if (lowerTitle.includes('movement') || lowerTitle.includes('controller')) {
      return 'editable-node__header--movement';
    } else if (lowerTitle.includes('state') || lowerTitle.includes('behavior')) {
      return 'editable-node__header--behavior';
    } else if (lowerTitle.includes('sound') || lowerTitle.includes('audio')) {
      return 'editable-node__header--audio';
    } else if (lowerTitle.includes('particle') || lowerTitle.includes('effect') || lowerTitle.includes('visual')) {
      return 'editable-node__header--visual';
    } else if (lowerTitle.includes('stats')) {
      return 'editable-node__header--stats';
    } else if (lowerTitle.includes('collision')) {
      return 'editable-node__header--collision';
    }
    return 'editable-node__header--default';
  };

  return (
    <div className="editable-node">
      <Handle type="target" position={Position.Top} className="editable-node__handle" />
      <div className={`editable-node__header ${getHeaderClass(data.title)}`}>
        {data.title}
        {id !== 'root' && (
          <button
            onClick={handleDelete}
            className="editable-node__delete-button"
          >
            ×
          </button>
        )}
      </div>
      {data.fields && Object.entries(data.fields).map(([key, value]) => (
        <div key={key} className="editable-node__field">
          {isEditing === key ? (
            <div className="editable-node__field-edit">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(key);
                  if (e.key === 'Escape') handleCancel();
                }}
                className="editable-node__field-input"
                autoFocus
              />
              <button 
                onClick={() => handleSave(key)}
                className="editable-node__field-button editable-node__field-button--save"
              >
                ✓
              </button>
              <button 
                onClick={handleCancel}
                className="editable-node__field-button editable-node__field-button--cancel"
              >
                ✗
              </button>
            </div>
          ) : (
            <div 
              onClick={() => handleEdit(key, value)}
              className="editable-node__field-view"
            >
              <span className="editable-node__field-label">{key}:</span> {String(value)}
            </div>
          )}
        </div>
      ))}
      <Handle type="source" position={Position.Bottom} className="editable-node__handle" />
    </div>
  );
}; 