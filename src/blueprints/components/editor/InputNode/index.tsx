import { VscVm } from 'react-icons/vsc';
import { Handle, Position } from 'reactflow';
import './styles.css';

export function InputNode({ data, id }: { data: any; id: string }) {
  const handleChange = (field: string, value: any) => {
    if (data.onChange) {
      data.onChange(id, field, value);
    }
  };

  return (
    <div className="editable-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <VscVm />
        <h3>Input Settings</h3>
      </div>
      <div className="node-content">
        <div className="node-field">
          <label>
            <input 
              type="checkbox" 
              checked={data.enableKeyboard !== false}
              onChange={(e) => handleChange('enableKeyboard', e.target.checked)}
            />
            Enable Keyboard
          </label>
        </div>
        <div className="node-field">
          <label>
            <input 
              type="checkbox" 
              checked={data.enableMouse !== false}
              onChange={(e) => handleChange('enableMouse', e.target.checked)}
            />
            Enable Mouse
          </label>
        </div>
        <div className="node-field">
          <label>
            <input 
              type="checkbox" 
              checked={data.clickToMove || false}
              onChange={(e) => handleChange('clickToMove', e.target.checked)}
            />
            Click to Move
          </label>
        </div>
        <div className="node-field">
          <label>
            <input 
              type="checkbox" 
              checked={data.enableGamepad || false}
              onChange={(e) => handleChange('enableGamepad', e.target.checked)}
            />
            Enable Gamepad
          </label>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
} 