import React, { useState } from 'react';
import { useEditorStore } from '../../hooks/useEditor';

const mockScene = [
  { id: 'world', name: 'World', children: [
    { id: 'lights', name: 'Lights', children: [
      { id: 'directional', name: 'Directional Light', children: [] },
      { id: 'ambient', name: 'Ambient Light', children: [] },
    ]},
    { id: 'environment', name: 'Environment', children: [
      { id: 'ground', name: 'Ground', children: [] },
      { id: 'skybox', name: 'Skybox', children: [] },
    ]},
    { id: 'actors', name: 'Actors', children: [
      { id: 'player', name: 'PlayerCharacter', children: [] },
      { id: 'npc1', name: 'NPC_Guard', children: [] },
    ]},
  ]},
];

interface SceneItem {
  id: string;
  name: string;
  children: SceneItem[];
}

const TreeNode: React.FC<{ 
  node: SceneItem; 
  level: number;
  selectedIds: string[];
  onSelect: (id: string, isCtrl: boolean) => void;
}> = ({ node, level, selectedIds, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedIds.includes(node.id);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id, e.ctrlKey || e.metaKey);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div 
        className={`hierarchy-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleSelect}
      >
        {node.children.length > 0 && (
          <span className="hierarchy-toggle" onClick={handleToggle}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span className="hierarchy-name">{node.name}</span>
      </div>
      {isExpanded && node.children.map(child => (
        <TreeNode 
          key={child.id} 
          node={child} 
          level={level + 1} 
          selectedIds={selectedIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export function HierarchyPanel() {
  const { selectedObjectIds, setSelectedObjectIds } = useEditorStore();

  const handleSelection = (id: string, isCtrl: boolean) => {
    setSelectedObjectIds(prev => {
      if (!isCtrl) return [id];
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };
  
  return (
    <div className="hierarchy-panel">
      {mockScene.map(rootNode => (
        <TreeNode 
          key={rootNode.id} 
          node={rootNode} 
          level={0}
          selectedIds={selectedObjectIds}
          onSelect={handleSelection}
        />
      ))}
    </div>
  );
} 