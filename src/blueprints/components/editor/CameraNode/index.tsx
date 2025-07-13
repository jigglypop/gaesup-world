import { Handle, Position } from 'reactflow';
import { VscSymbolStructure } from 'react-icons/vsc';
import './styles.css';

export function CameraNode({ data, id }: { data: any; id: string }) {
  const handleChange = (field: string, value: any) => {
    if (data.onChange) {
      data.onChange(id, field, value);
    }
  };

  return (
    <div className="editable-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">
        <VscSymbolStructure />
        <h3>Camera Settings</h3>
      </div>
      <div className="node-content">
        <div className="node-field">
          <label>Mode</label>
          <select 
            value={data.mode || 'thirdPerson'} 
            onChange={(e) => handleChange('mode', e.target.value)}
            className="node-input"
          >
            <option value="firstPerson">First Person</option>
            <option value="thirdPerson">Third Person</option>
            <option value="chase">Chase</option>
            <option value="topDown">Top Down</option>
            <option value="sideScroll">Side Scroll</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div className="node-field">
          <label>
            <input 
              type="checkbox" 
              checked={data.enableZoom || false}
              onChange={(e) => handleChange('enableZoom', e.target.checked)}
            />
            Enable Zoom
          </label>
        </div>
        {data.enableZoom && (
          <>
            <div className="node-field">
              <label>Zoom Speed</label>
              <input 
                type="number" 
                value={data.zoomSpeed || 1}
                onChange={(e) => handleChange('zoomSpeed', parseFloat(e.target.value))}
                className="node-input"
                step="0.1"
                min="0.1"
                max="5"
              />
            </div>
            <div className="node-field">
              <label>Min Zoom</label>
              <input 
                type="number" 
                value={data.minZoom || 5}
                onChange={(e) => handleChange('minZoom', parseFloat(e.target.value))}
                className="node-input"
                step="1"
                min="1"
                max="50"
              />
            </div>
            <div className="node-field">
              <label>Max Zoom</label>
              <input 
                type="number" 
                value={data.maxZoom || 50}
                onChange={(e) => handleChange('maxZoom', parseFloat(e.target.value))}
                className="node-input"
                step="1"
                min="1"
                max="100"
              />
            </div>
          </>
        )}
        <div className="node-field">
          <label>FOV</label>
          <input 
            type="number" 
            value={data.fov || 75}
            onChange={(e) => handleChange('fov', parseFloat(e.target.value))}
            className="node-input"
            step="5"
            min="30"
            max="120"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
} 