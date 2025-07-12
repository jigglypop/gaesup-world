import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';
import { BlueprintType, BlueprintCategory } from './types';
import { blueprintRegistry, AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint, BlueprintWithComponents, BlueprintComponent } from '../../../';
import { useSpawnFromBlueprint } from '../../../hooks/useSpawnFromBlueprint';
import { convertBlueprintToItem, generateNodesFromBlueprint } from './utils';
import { EditableNode } from '../../editor/EditableNode';
import { NodeFieldValue, EditableNodeData } from '../../editor/EditableNode/types';


const blueprintCategories: BlueprintCategory[] = [
  { id: 'characters', name: 'Characters', type: 'character', count: 0 },
  { id: 'vehicles', name: 'Vehicles', type: 'vehicle', count: 0 },
  { id: 'airplanes', name: 'Airplanes', type: 'airplane', count: 0 },
  { id: 'animations', name: 'Animations', type: 'animation', count: 0 },
  { id: 'behaviors', name: 'Behaviors', type: 'behavior', count: 0 },
  { id: 'items', name: 'Items', type: 'item', count: 0 },
];

const nodeTypes = {
  editable: EditableNode,
};

export const BlueprintPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<BlueprintType>('character');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<AnyBlueprint | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [selectedNodeCategory, setSelectedNodeCategory] = useState<string>('physics');
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const { spawnEntity, spawnAtCursor, isSpawning } = useSpawnFromBlueprint();

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const allBlueprints = useMemo(() => {
    return blueprintRegistry.getAll().map(convertBlueprintToItem);
  }, []);

  const categoriesWithCounts = useMemo(() => {
    const counts: Record<BlueprintType, number> = {
      character: 0,
      vehicle: 0,
      airplane: 0,
      animation: 0,
      behavior: 0,
      item: 0,
    };

    allBlueprints.forEach((blueprint) => {
      if (blueprint.type in counts) {
        counts[blueprint.type]++;
      }
    });

    return blueprintCategories.map((category) => ({
      ...category,
      count: counts[category.type],
    }));
  }, [allBlueprints]);

  const filteredBlueprints = useMemo(() => {
    return allBlueprints.filter(blueprint => {
      const matchesCategory = blueprint.type === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blueprint.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allBlueprints]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    
    // Update blueprint to remove component
    if (editingBlueprint) {
      const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint)) as BlueprintWithComponents;
      if (newBlueprint.components) {
        newBlueprint.components = newBlueprint.components.filter((comp: BlueprintComponent) => comp.id !== nodeId);
        setEditingBlueprint(newBlueprint);
      }
    }
  }, [setNodes, setEdges, editingBlueprint]);

  const handleNodeEdit = useCallback((nodeId: string, field: string, value: NodeFieldValue) => {
    if (!editingBlueprint) return;
    
    const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint));
    
    if (nodeId === 'root') {
      if (field === 'version') newBlueprint.version = value;
      if (field === 'name') newBlueprint.name = value;
    } else if (nodeId === 'physics' || nodeId === 'vehicle-physics' || nodeId === 'airplane-physics') {
      if (newBlueprint.physics) {
        newBlueprint.physics[field] = value;
      }
    } else if (nodeId === 'stats') {
      if (newBlueprint.stats) {
        newBlueprint.stats[field] = value;
      }
    } else if (nodeId === 'animations') {
      if (newBlueprint.animations) {
        if (field.startsWith('jump_')) {
          if (!newBlueprint.animations.jump) {
            newBlueprint.animations.jump = { start: '', loop: '', land: '' };
          }
          const jumpField = field.replace('jump_', '');
          newBlueprint.animations.jump[jumpField] = value;
        } else {
          newBlueprint.animations[field] = value;
        }
      }
    } else if (nodeId === 'behaviors') {
      if (newBlueprint.behaviors) {
        if (field === 'type') {
          newBlueprint.behaviors.type = value;
        } else if (field === 'initial' && newBlueprint.behaviors.data) {
          newBlueprint.behaviors.data.initial = value;
        }
      }
    } else if (nodeId === 'seats') {
      // Handle seat editing if needed
    } else {
      // Handle custom nodes
      const blueprintWithComponents = newBlueprint as BlueprintWithComponents;
      if (blueprintWithComponents.components) {
        const component = blueprintWithComponents.components.find((comp: BlueprintComponent) => comp.id === nodeId);
        if (component) {
          component[field] = value;
        }
      }
    }
    
    setEditingBlueprint(newBlueprint);
    
    // Update nodes immediately
    const { nodes: newNodes, edges: newEdges } = generateNodesFromBlueprint(newBlueprint, handleNodeEdit, handleNodeDelete);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [editingBlueprint, setNodes, setEdges, handleNodeDelete]);

  const handleBlueprintSelect = (blueprintId: string) => {
    setSelectedBlueprint(blueprintId);
    const blueprint = blueprintRegistry.get(blueprintId);
    if (blueprint) {
      setEditingBlueprint(JSON.parse(JSON.stringify(blueprint)));
      const { nodes: newNodes, edges: newEdges } = generateNodesFromBlueprint(blueprint, handleNodeEdit, handleNodeDelete);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  const handleEditBlueprint = () => {
    setIsEditing(true);
  };

  const handleSaveBlueprint = () => {
    if (editingBlueprint) {
      blueprintRegistry.register(editingBlueprint);
      setIsEditing(false);
      setIsCreatingNew(false);
      handleBlueprintSelect(editingBlueprint.id);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedBlueprint) {
      const blueprint = blueprintRegistry.get(selectedBlueprint);
      if (blueprint) {
        setEditingBlueprint(JSON.parse(JSON.stringify(blueprint)));
      }
    }
  };

  const handleCreateNew = () => {
    console.log('Creating new blueprint for category:', selectedCategory);
    let newBlueprint: AnyBlueprint;
    
    const baseProps = {
      id: `custom_${selectedCategory}_${Date.now()}`,
      name: `New ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
      version: '1.0.0',
      tags: ['custom'],
      description: 'Custom blueprint',
    };
    
    switch (selectedCategory) {
      case 'vehicle':
        newBlueprint = {
          ...baseProps,
          type: 'vehicle',
          physics: {
            mass: 1000,
            maxSpeed: 30,
            acceleration: 10,
            braking: 15,
            turning: 2
          },
          seats: [{
            position: [0, 1, 0],
            isDriver: true
          }],
          animations: {
            idle: ''
          }
        } as VehicleBlueprint;
        break;
        
      case 'airplane':
        newBlueprint = {
          ...baseProps,
          type: 'airplane',
          physics: {
            mass: 2000,
            maxSpeed: 100,
            acceleration: 20,
            turning: 1,
            lift: 50,
            drag: 10
          },
          seats: [{
            position: [0, 1, 2],
            isDriver: true
          }],
          animations: {
            idle: ''
          }
        } as AirplaneBlueprint;
        break;
        
      default:
        newBlueprint = {
          ...baseProps,
          type: 'character',
          physics: {
            mass: 70,
            height: 1.8,
            radius: 0.3,
            jumpForce: 300,
            moveSpeed: 5,
            runSpeed: 10,
            airControl: 0.2
          },
          animations: {
            idle: '',
            walk: '',
            run: '',
            jump: {
              start: '',
              loop: '',
              land: ''
            }
          },
          stats: {
            health: 100,
            stamina: 50,
            strength: 10,
            defense: 10,
            speed: 10
          }
        } as CharacterBlueprint;
    }
    
    setEditingBlueprint(newBlueprint);
    setSelectedBlueprint(newBlueprint.id);
    setIsCreatingNew(true);
    setIsEditing(true);
    
    // Generate nodes for the new blueprint
    const { nodes: newNodes, edges: newEdges } = generateNodesFromBlueprint(newBlueprint, handleNodeEdit, handleNodeDelete);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handlePropertyChange = (path: string[], value: NodeFieldValue) => {
    if (!editingBlueprint) return;
    
    const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint));
    let current: Record<string, unknown> = newBlueprint as Record<string, unknown>;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (current === undefined) return;
      current = current[path[i]];
    }
    
    if (current === undefined) return;
    current[path[path.length - 1]] = value;
    setEditingBlueprint(newBlueprint);
  };

  const renderPropertyEditor = (obj: Record<string, unknown>, path: string[] = []): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      const pathKey = currentPath.join('.');
      
      if (key === 'id' || key === 'type') {
        elements.push(
          <div key={pathKey} className="property-editor__field">
            <label className="property-editor__label editor-text-small">
              {key}:
            </label>
            <input
              type="text"
              value={value as string}
              disabled
              className="property-editor__input property-editor__input--disabled"
            />
          </div>
        );
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        elements.push(
          <div key={pathKey} className="property-editor__group">
            <div className="property-editor__group-title editor-text">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </div>
            <div className="property-editor__group-content">
              {renderPropertyEditor(value as Record<string, unknown>, currentPath)}
            </div>
          </div>
        );
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          elements.push(
            <div key={pathKey} className="property-editor__group">
              <div className="property-editor__group-title editor-text">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </div>
              <div className="property-editor__group-content">
                {value.map((item, index) => (
                  <div key={`${pathKey}.${index}`} className="property-editor__array-item">
                    <div className="property-editor__array-item-title editor-text-small">Item {index + 1}</div>
                    {renderPropertyEditor(item as Record<string, unknown>, [...currentPath, index.toString()])}
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={pathKey} className="property-editor__field">
              <label className="property-editor__label editor-text-small">
                {key}:
              </label>
              <input
                type="text"
                value={value.join(', ')}
                onChange={(e) => handlePropertyChange(currentPath, e.target.value.split(',').map(s => s.trim()))}
                className="property-editor__input"
              />
            </div>
          );
        }
      } else if (typeof value === 'boolean') {
        elements.push(
          <div key={pathKey} className="property-editor__field">
            <label className="property-editor__checkbox-label editor-text-small">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePropertyChange(currentPath, e.target.checked)}
                className="property-editor__checkbox"
              />
              {key}
            </label>
          </div>
        );
      } else {
        elements.push(
          <div key={pathKey} className="property-editor__field">
            <label className="property-editor__label editor-text-small">
              {key}:
            </label>
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value as string | number}
              onChange={(e) => handlePropertyChange(currentPath, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              className="property-editor__input"
            />
          </div>
        );
      }
    });
    
    return elements;
  };

  const handleSpawnEntity = async () => {
    if (!selectedBlueprint) return;
    
    const blueprint = blueprintRegistry.get(selectedBlueprint);
    if (!blueprint) return;
    
    console.log('Spawning entity from blueprint:', blueprint);
    
    const spawnedEntity = await spawnAtCursor(selectedBlueprint);
    
    if (spawnedEntity) {
      console.log('Successfully spawned entity:', spawnedEntity);
    } else {
      console.error('Failed to spawn entity from blueprint');
    }
  };

  const availableNodeTypes = [
    { id: 'gravity', name: 'Gravity Force', category: 'physics' },
    { id: 'buoyancy', name: 'Buoyancy Force', category: 'physics' },
    { id: 'wind', name: 'Wind Force', category: 'physics' },
    { id: 'drag', name: 'Drag Force', category: 'physics' },
    { id: 'movement', name: 'Movement Controller', category: 'controller' },
    { id: 'animation_trigger', name: 'Animation Trigger', category: 'animation' },
    { id: 'state_machine', name: 'State Machine', category: 'behavior' },
    { id: 'collision', name: 'Collision Handler', category: 'physics' },
    { id: 'sound', name: 'Sound Trigger', category: 'audio' },
    { id: 'particle', name: 'Particle Effect', category: 'visual' }
  ];



  const handleAddNodeFromPanel = useCallback((nodeType: string) => {
    const newNodeId = `${nodeType}_${Date.now()}`;
    // 새 노드를 중앙에 배치
    const centerX = 250;
    const centerY = 300 + (nodes.length - 4) * 100; // 기존 노드 아래에 배치
    
    const position = { x: centerX, y: centerY };
    
    let nodeData: EditableNodeData = {
      title: availableNodeTypes.find(n => n.id === nodeType)?.name || nodeType,
      fields: {},
      onEdit: handleNodeEdit,
      onDelete: handleNodeDelete
    };
    
    // Set default fields based on node type (기존 코드 재사용)
    switch (nodeType) {
      case 'gravity':
        nodeData.fields = {
          gravity: -9.81,
          maxFallSpeed: 50,
          enabled: true
        };
        break;
      case 'buoyancy':
        nodeData.fields = {
          density: 1.0,
          fluidDensity: 1000,
          dragCoefficient: 0.47
        };
        break;
      case 'wind':
        nodeData.fields = {
          strength: 10,
          directionX: 1,
          directionY: 0,
          directionZ: 0
        };
        break;
      case 'drag':
        nodeData.fields = {
          linearDamping: 0.1,
          angularDamping: 0.1
        };
        break;
      case 'animation_trigger':
        nodeData.fields = {
          trigger: 'onJump',
          animation: 'jump_start',
          duration: 0.5,
          loop: false
        };
        break;
      case 'movement':
        nodeData.fields = {
          walkSpeed: 5,
          runSpeed: 10,
          jumpHeight: 2,
          airControl: 0.2
        };
        break;
      case 'state_machine':
        nodeData.fields = {
          initialState: 'idle',
          states: 'idle,moving,jumping,combat'
        };
        break;
      case 'collision':
        nodeData.fields = {
          layer: 'default',
          mask: 'all',
          onEnter: 'none',
          onExit: 'none'
        };
        break;
      case 'sound':
        nodeData.fields = {
          sound: 'footstep.mp3',
          volume: 1.0,
          loop: false,
          trigger: 'onWalk'
        };
        break;
      case 'particle':
        nodeData.fields = {
          effect: 'dust',
          rate: 10,
          lifetime: 2,
          trigger: 'onMove'
        };
        break;
    }
    
    const newNode: Node = {
      id: newNodeId,
      type: 'editable',
      position,
      data: nodeData
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Auto-connect to root node
    const newEdge: Edge = {
      id: `root-${newNodeId}`,
      source: 'root',
      target: newNodeId,
      animated: true,
      style: { 
        stroke: '#666666',
        strokeWidth: 2
      },
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: '#666666',
        width: 20,
        height: 20
      }
    };
    setEdges((eds) => [...eds, newEdge]);
    
    // Update blueprint with new component
    if (editingBlueprint) {
      const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint)) as BlueprintWithComponents;
      if (!newBlueprint.components) {
        newBlueprint.components = [];
      }
      newBlueprint.components.push({
        type: nodeType,
        id: newNodeId,
        ...nodeData.fields
      } as BlueprintComponent);
      setEditingBlueprint(newBlueprint);
    }
  }, [nodes, setNodes, setEdges, editingBlueprint, handleNodeEdit, handleNodeDelete]);


  return (
    <div className="blueprint-panel">
      <h3 className="editor-title">Blueprint Library</h3>
      
      <div className="blueprint-panel__toolbar">
        <div className="blueprint-panel__search-container">
        <input
          type="text"
          placeholder="Search blueprints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="blueprint-panel__search-input"
        />
          <button
            onClick={handleCreateNew}
            className="blueprint-panel__button blueprint-panel__button--primary"
          >
            + New Blueprint
          </button>
        </div>
      </div>

      <div className="blueprint-panel__categories">
        {categoriesWithCounts.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.type)}
            className={`blueprint-panel__category-button ${selectedCategory === category.type ? 'blueprint-panel__category-button--active' : ''}`}
          >
            <span>{category.name}</span>
            <span>({category.count})</span>
          </button>
        ))}
      </div>

      {!isEditing ? (
        <>
      {!showGraph ? (
        <div className="blueprint-panel__list editor-scrollbar">
          {filteredBlueprints.length === 0 ? (
            <div className="blueprint-panel__empty-message editor-text-small">
              No blueprints found
            </div>
          ) : (
            filteredBlueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                onClick={() => handleBlueprintSelect(blueprint.id)}
                className={`blueprint-panel__list-item ${selectedBlueprint === blueprint.id ? 'blueprint-panel__list-item--selected' : ''}`}
              >
                <div className="list-item__content">
                  <div className="list-item__text-content">
                    <div className="list-item__name editor-text">
                      {blueprint.name}
                    </div>
                    <div className="list-item__description editor-text-small">
                      {blueprint.description}
                    </div>
                    <div className="list-item__tags">
                      {blueprint.tags.map((tag) => (
                        <span
                          key={tag}
                          className="list-item__tag editor-text-small"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="list-item__meta editor-text-small">
                    <div>v{blueprint.version}</div>
                    <div>{blueprint.lastModified}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="blueprint-panel__graph-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={memoizedNodeTypes}
            fitView
          >
            <Background color="var(--editor-border-color)" variant={BackgroundVariant.Dots} />
            <Controls />
          </ReactFlow>
        </div>
      )}

      {selectedBlueprint && (
        <div className="blueprint-panel__footer">
          <div className="blueprint-panel__footer-buttons">
            <button
              onClick={() => setShowGraph(!showGraph)}
              className={`blueprint-panel__button ${showGraph ? 'blueprint-panel__button--secondary' : 'blueprint-panel__button--default'}`}
            >
              {showGraph ? 'Show List' : 'Show Graph'}
            </button>
            <button
              onClick={handleEditBlueprint}
              className="blueprint-panel__button blueprint-panel__button--secondary"
            >
              Edit Blueprint
            </button>
            {showGraph && (
              <button
                onClick={handleSaveBlueprint}
                className="blueprint-panel__button blueprint-panel__button--primary"
              >
                Save Changes
              </button>
            )}
            <button
              onClick={handleSpawnEntity}
              disabled={isSpawning}
              className="blueprint-panel__button blueprint-panel__button--primary"
            >
              {isSpawning ? 'Spawning...' : 'Spawn Entity'}
            </button>
          </div>
              
              {showGraph && (
                <div className="blueprint-panel__add-node-panel">
                  <div className="add-node-panel__container">
                    <div className="add-node-panel__title editor-text-small">Add Component Node:</div>
                    <div className="add-node-panel__category-selector">
                      {['physics', 'controller', 'animation', 'behavior', 'audio', 'visual'].map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedNodeCategory(category)}
                          className={`add-node-panel__category-button ${selectedNodeCategory === category ? 'add-node-panel__category-button--active' : ''}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="add-node-panel__buttons">
                      {availableNodeTypes
                        .filter(node => node.category === selectedNodeCategory)
                        .map(node => (
                          <button
                            key={node.id}
                            onClick={() => handleAddNodeFromPanel(node.id)}
                            className="add-node-panel__button"
                          >
                            + {node.name}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
              ) : (
          <>
            <div className="blueprint-panel__property-editor-container editor-scrollbar">
              {editingBlueprint && (
                <div>
                  <h4 className="blueprint-panel__property-editor-title editor-text">
                    {isCreatingNew ? 'Create New Blueprint' : `Edit: ${editingBlueprint.name}`}
                  </h4>
                  {renderPropertyEditor(editingBlueprint)}
                </div>
              )}
            </div>
            
        <div className="blueprint-panel__footer">
          <div className="blueprint-panel__footer-buttons">
            <button
              onClick={handleSaveBlueprint}
              className="blueprint-panel__button blueprint-panel__button--primary"
            >
              {isCreatingNew ? 'Create' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="blueprint-panel__button blueprint-panel__button--danger"
            >
              Cancel
            </button>
          </div>
        </div>
          </>
      )}
    </div>
  );
}; 