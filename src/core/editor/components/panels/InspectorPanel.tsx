import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../hooks/useEditor';

const VectorInput: React.FC<{ label: string; value: { x: number; y: number; z: number }; }> = ({ label, value }) => (
  <div className="prop-item">
    <label className="prop-label">{label}</label>
    <div className="prop-value vector-input">
      <span>X</span><input type="number" defaultValue={value.x.toFixed(2)} />
      <span>Y</span><input type="number" defaultValue={value.y.toFixed(2)} />
      <span>Z</span><input type="number" defaultValue={value.z.toFixed(2)} />
    </div>
  </div>
);

const NumberInput: React.FC<{ label: string; value: number; }> = ({ label, value }) => (
  <div className="prop-item">
    <label className="prop-label">{label}</label>
    <div className="prop-value">
      <input type="number" defaultValue={value.toFixed(2)} />
    </div>
  </div>
);

const mockProperties: Record<string, any> = {
  'player': {
    transform: { position: { x: 10.5, y: 0, z: 5.2 }, rotation: { x: 0, y: 90, z: 0 }, scale: { x: 1, y: 1, z: 1 }},
    rigidbody: { mass: 70, friction: 0.8, restitution: 0.1 },
  },
  'npc1': {
    transform: { position: { x: -5, y: 0, z: 12.8 }, rotation: { x: 0, y: -45, z: 0 }, scale: { x: 1, y: 1, z: 1 }},
    ai: { state: 'Patrolling', speed: 2.5 },
  },
  'directional': {
    light: { intensity: 1.5, color: '#FFFFFF', castShadow: true },
    transform: { position: { x: 50, y: 100, z: 25 }, rotation: { x: -45, y: 20, z: 0 }, scale: { x: 1, y: 1, z: 1 }},
  }
};

export function InspectorPanel() {
  const { selectedObjectIds } = useEditorStore();
  const [selectedObject, setSelectedObject] = useState<any>(null);

  useEffect(() => {
    const firstId = selectedObjectIds[0];
    if (firstId && mockProperties[firstId]) {
      setSelectedObject({ id: firstId, ...mockProperties[firstId] });
    } else {
      setSelectedObject(null);
    }
  }, [selectedObjectIds]);

  if (!selectedObject) {
    return (
      <div className="inspector-panel empty">
        <span>No object selected</span>
      </div>
    );
  }

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <h3>{selectedObject.id}</h3>
        <span className="object-tag">TAG_EXAMPLE</span>
      </div>

      {selectedObject.transform && (
        <div className="prop-group">
          <h4 className="prop-group-title">Transform</h4>
          <VectorInput label="Position" value={selectedObject.transform.position} />
          <VectorInput label="Rotation" value={selectedObject.transform.rotation} />
          <VectorInput label="Scale" value={selectedObject.transform.scale} />
        </div>
      )}

      {selectedObject.rigidbody && (
         <div className="prop-group">
          <h4 className="prop-group-title">Rigidbody</h4>
          <NumberInput label="Mass" value={selectedObject.rigidbody.mass} />
          <NumberInput label="Friction" value={selectedObject.rigidbody.friction} />
          <NumberInput label="Restitution" value={selectedObject.rigidbody.restitution} />
        </div>
      )}
      
      {selectedObject.light && (
         <div className="prop-group">
          <h4 className="prop-group-title">Light</h4>
          <NumberInput label="Intensity" value={selectedObject.light.intensity} />
        </div>
      )}
    </div>
  );
} 