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
  Handle,
  Position,
  NodeProps,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';
import { BlueprintType, BlueprintCategory, BlueprintItem } from './types';
import { blueprintRegistry, AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint } from '../../../../blueprints';
import { useSpawnFromBlueprint } from '../../../../blueprints/hooks/useSpawnFromBlueprint';


const blueprintCategories: BlueprintCategory[] = [
  { id: 'characters', name: 'Characters', type: 'character', count: 0 },
  { id: 'vehicles', name: 'Vehicles', type: 'vehicle', count: 0 },
  { id: 'airplanes', name: 'Airplanes', type: 'airplane', count: 0 },
  { id: 'animations', name: 'Animations', type: 'animation', count: 0 },
  { id: 'behaviors', name: 'Behaviors', type: 'behavior', count: 0 },
  { id: 'items', name: 'Items', type: 'item', count: 0 },
];

const convertBlueprintToItem = (blueprint: AnyBlueprint): BlueprintItem => {
  return {
    id: blueprint.id,
    name: blueprint.name,
    type: blueprint.type as BlueprintType,
    version: blueprint.version,
    tags: blueprint.tags || [],
    description: blueprint.description,
    lastModified: new Date().toISOString().split('T')[0],
  };
};

const EditableNode = ({ data, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (field: string, currentValue: any) => {
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

  // 카테고리별 헤더 색상 정의
  const getHeaderColor = (title: string) => {
    if (title.includes('Physics') || title.includes('Force') || title.includes('Gravity') || title.includes('Buoyancy') || title.includes('Wind') || title.includes('Drag')) {
      return 'rgba(76, 175, 80, 0.3)'; // 초록색 - 물리
    } else if (title.includes('Animation') || title.includes('Trigger')) {
      return 'rgba(255, 152, 0, 0.3)'; // 주황색 - 애니메이션
    } else if (title.includes('Movement') || title.includes('Controller')) {
      return 'rgba(33, 150, 243, 0.3)'; // 파란색 - 컨트롤러
    } else if (title.includes('State') || title.includes('Behavior')) {
      return 'rgba(156, 39, 176, 0.3)'; // 보라색 - 행동
    } else if (title.includes('Sound') || title.includes('Audio')) {
      return 'rgba(255, 235, 59, 0.3)'; // 노란색 - 오디오
    } else if (title.includes('Particle') || title.includes('Effect') || title.includes('Visual')) {
      return 'rgba(233, 30, 99, 0.3)'; // 분홍색 - 비주얼
    } else if (title.includes('Stats')) {
      return 'rgba(244, 67, 54, 0.3)'; // 빨간색 - 스탯
    } else if (title.includes('Collision')) {
      return 'rgba(96, 125, 139, 0.3)'; // 회색 - 충돌
    }
    return 'rgba(0, 0, 0, 0.3)'; // 기본색
  };

  const headerColor = getHeaderColor(data.title);

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      minWidth: '180px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: 'rgba(255, 255, 255, 0.3)' }} />
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '8px', 
        color: 'var(--editor-text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: headerColor,
        margin: '-12px -12px 8px -12px',
        padding: '8px 12px',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {data.title}
        {id !== 'root' && (
          <button
            onClick={handleDelete}
            style={{
              marginLeft: 'auto',
              padding: '2px 6px',
              background: 'rgba(244, 67, 54, 0.2)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '4px',
              color: 'var(--editor-text-main)',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}
      </div>
      {data.fields && Object.entries(data.fields).map(([key, value]) => (
        <div key={key} style={{ fontSize: '11px', marginTop: '4px' }}>
          {isEditing === key ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(key);
                  if (e.key === 'Escape') handleCancel();
                }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  background: 'var(--editor-surface-1)',
                  border: '1px solid var(--editor-border-color)',
                  borderRadius: '4px',
                  color: 'var(--editor-text-main)',
                  fontSize: '11px',
                  outline: 'none'
                }}
                autoFocus
              />
              <button 
                onClick={() => handleSave(key)}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '10px',
                  background: 'rgba(76, 175, 80, 0.2)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--editor-text-main)',
                  cursor: 'pointer'
                }}
              >
                ✓
              </button>
              <button 
                onClick={handleCancel}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '10px',
                  background: 'rgba(244, 67, 54, 0.2)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--editor-text-main)',
                  cursor: 'pointer'
                }}
              >
                ✗
              </button>
            </div>
          ) : (
            <div 
              onClick={() => handleEdit(key, value)}
              style={{ 
                cursor: 'pointer', 
                padding: '4px 6px', 
                borderRadius: '4px',
                color: 'var(--editor-text-muted)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--editor-surface-1)';
                e.currentTarget.style.color = 'var(--editor-text-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--editor-text-muted)';
              }}
            >
              <span style={{ color: 'var(--editor-text-faint)' }}>{key}:</span> {String(value)}
            </div>
          )}
        </div>
      ))}
      <Handle type="source" position={Position.Bottom} style={{ background: 'rgba(255, 255, 255, 0.3)' }} />
    </div>
  );
};

const nodeTypes = {
  editable: EditableNode,
};

const generateNodesFromBlueprint = (blueprint: AnyBlueprint, onNodeEdit?: (nodeId: string, field: string, value: any) => void, onNodeDelete?: (nodeId: string) => void): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Root node
  nodes.push({
    id: 'root',
    type: 'editable',
    position: { x: 250, y: 50 },
    data: { 
      title: blueprint.name,
      fields: {
        version: blueprint.version,
        type: blueprint.type
      },
      onEdit: onNodeEdit,
      onDelete: onNodeDelete
    }
  });

  if (blueprint.type === 'character') {
    const charBlueprint = blueprint as CharacterBlueprint;
    
    // Physics node
    nodes.push({
      id: 'physics',
      type: 'editable',
      position: { x: 50, y: 150 },
      data: { 
        title: 'Physics',
        fields: {
          mass: charBlueprint.physics.mass,
          moveSpeed: charBlueprint.physics.moveSpeed,
          runSpeed: charBlueprint.physics.runSpeed,
          jumpForce: charBlueprint.physics.jumpForce,
          height: charBlueprint.physics.height,
          radius: charBlueprint.physics.radius,
          airControl: charBlueprint.physics.airControl
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Stats node
    nodes.push({
      id: 'stats',
      type: 'editable',
      position: { x: 450, y: 150 },
      data: { 
        title: 'Stats',
        fields: {
          health: charBlueprint.stats.health,
          stamina: charBlueprint.stats.stamina,
          mana: charBlueprint.stats.mana || 0,
          strength: charBlueprint.stats.strength,
          defense: charBlueprint.stats.defense,
          speed: charBlueprint.stats.speed
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Animations node
    nodes.push({
      id: 'animations',
      type: 'editable',
      position: { x: 250, y: 150 },
      data: { 
        title: 'Animations',
        fields: {
          idle: charBlueprint.animations.idle || 'none',
          walk: charBlueprint.animations.walk || 'none',
          run: charBlueprint.animations.run || 'none',
          jump_start: charBlueprint.animations.jump?.start || 'none',
          jump_loop: charBlueprint.animations.jump?.loop || 'none',
          jump_land: charBlueprint.animations.jump?.land || 'none'
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Behaviors node (if exists)
    if (charBlueprint.behaviors) {
      nodes.push({
        id: 'behaviors',
        type: 'editable',
        position: { x: 250, y: 250 },
        data: { 
          title: 'Behaviors',
          fields: {
            type: charBlueprint.behaviors.type,
            initial: (charBlueprint.behaviors.data as any)?.initial || 'idle'
          },
          onEdit: onNodeEdit,
          onDelete: onNodeDelete
        }
      });
    }
  } else if (blueprint.type === 'vehicle') {
    const vehicleBlueprint = blueprint as VehicleBlueprint;
    
    nodes.push({
      id: 'vehicle-physics',
      type: 'editable',
      position: { x: 150, y: 150 },
      data: { 
        title: 'Physics',
        fields: {
          mass: vehicleBlueprint.physics.mass,
          maxSpeed: vehicleBlueprint.physics.maxSpeed,
          acceleration: vehicleBlueprint.physics.acceleration,
          braking: vehicleBlueprint.physics.braking,
          turning: vehicleBlueprint.physics.turning
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    nodes.push({
      id: 'seats',
      type: 'editable',
      position: { x: 350, y: 150 },
      data: { 
        title: 'Seats',
        fields: {
          count: vehicleBlueprint.seats.length,
          driverSeat: vehicleBlueprint.seats.findIndex(s => s.isDriver) + 1
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
  } else if (blueprint.type === 'airplane') {
    const airplaneBlueprint = blueprint as AirplaneBlueprint;
    
    nodes.push({
      id: 'airplane-physics',
      type: 'editable',
      position: { x: 150, y: 150 },
      data: { 
        title: 'Physics',
        fields: {
          mass: airplaneBlueprint.physics.mass,
          maxSpeed: airplaneBlueprint.physics.maxSpeed,
          acceleration: airplaneBlueprint.physics.acceleration,
          turning: airplaneBlueprint.physics.turning,
          lift: airplaneBlueprint.physics.lift,
          drag: airplaneBlueprint.physics.drag
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
  }
  
  // Add edges for all node types
  nodes.forEach(node => {
    if (node.id !== 'root') {
      edges.push({
        id: `root-${node.id}`,
        source: 'root',
        target: node.id,
        animated: true,
        style: { 
          stroke: 'rgba(255, 255, 255, 0.2)',
          strokeWidth: 2
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: 'rgba(255, 255, 255, 0.3)',
          width: 20,
          height: 20
        }
      });
    }
  });
  
  return { nodes, edges };
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
    if (editingBlueprint && (editingBlueprint as any).components) {
      const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint));
      (newBlueprint as any).components = (newBlueprint as any).components.filter((comp: any) => comp.id !== nodeId);
      setEditingBlueprint(newBlueprint);
    }
  }, [setNodes, setEdges, editingBlueprint]);

  const handleNodeEdit = useCallback((nodeId: string, field: string, value: any) => {
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
      if ((newBlueprint as any).components) {
        const component = (newBlueprint as any).components.find((comp: any) => comp.id === nodeId);
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

  const handlePropertyChange = (path: string[], value: any) => {
    if (!editingBlueprint) return;
    
    const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint));
    let current: any = newBlueprint;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setEditingBlueprint(newBlueprint);
  };

  const renderPropertyEditor = (obj: any, path: string[] = []): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      const pathKey = currentPath.join('.');
      
      if (key === 'id' || key === 'type') {
        elements.push(
          <div key={pathKey} style={{ marginBottom: '8px' }}>
            <label className="editor-text-small" style={{ display: 'block', marginBottom: '2px' }}>
              {key}:
            </label>
            <input
              type="text"
              value={value as string}
              disabled
              style={{
                width: '100%',
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'not-allowed',
              }}
            />
          </div>
        );
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        elements.push(
          <div key={pathKey} style={{ marginBottom: '10px' }}>
            <div className="editor-text" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </div>
            <div style={{ marginLeft: '15px' }}>
              {renderPropertyEditor(value, currentPath)}
            </div>
          </div>
        );
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          elements.push(
            <div key={pathKey} style={{ marginBottom: '10px' }}>
              <div className="editor-text" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </div>
              <div style={{ marginLeft: '15px' }}>
                {value.map((item, index) => (
                  <div key={`${pathKey}.${index}`} style={{ marginBottom: '10px', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    <div className="editor-text-small" style={{ marginBottom: '5px' }}>Item {index + 1}</div>
                    {renderPropertyEditor(item, [...currentPath, index.toString()])}
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={pathKey} style={{ marginBottom: '8px' }}>
              <label className="editor-text-small" style={{ display: 'block', marginBottom: '2px' }}>
                {key}:
              </label>
              <input
                type="text"
                value={value.join(', ')}
                onChange={(e) => handlePropertyChange(currentPath, e.target.value.split(',').map(s => s.trim()))}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          );
        }
      } else if (typeof value === 'boolean') {
        elements.push(
          <div key={pathKey} style={{ marginBottom: '8px' }}>
            <label className="editor-text-small" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handlePropertyChange(currentPath, e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              {key}
            </label>
          </div>
        );
      } else {
        elements.push(
          <div key={pathKey} style={{ marginBottom: '8px' }}>
            <label className="editor-text-small" style={{ display: 'block', marginBottom: '2px' }}>
              {key}:
            </label>
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value as string | number}
              onChange={(e) => handlePropertyChange(currentPath, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
              }}
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
    
    let nodeData: any = {
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
        stroke: 'rgba(255, 255, 255, 0.2)',
        strokeWidth: 2
      },
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: 'rgba(255, 255, 255, 0.3)',
        width: 20,
        height: 20
      }
    };
    setEdges((eds) => [...eds, newEdge]);
    
    // Update blueprint with new component
    if (editingBlueprint) {
      const newBlueprint = JSON.parse(JSON.stringify(editingBlueprint));
      if (!(newBlueprint as any).components) {
        (newBlueprint as any).components = [];
      }
      (newBlueprint as any).components.push({
        type: nodeType,
        id: newNodeId,
        ...nodeData.fields
      });
      setEditingBlueprint(newBlueprint);
    }
  }, [nodes, setNodes, setEdges, editingBlueprint, handleNodeEdit, handleNodeDelete]);


  return (
    <div className="blueprint-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="editor-title">Blueprint Library</h3>
      
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="Search blueprints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
              flex: 1,
            padding: '6px 10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none',
          }}
        />
          <button
            onClick={handleCreateNew}
            style={{
              padding: '6px 12px',
              background: 'rgba(76, 175, 80, 0.3)',
              border: '1px solid rgba(76, 175, 80, 0.5)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + New Blueprint
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', padding: '0 8px', flexWrap: 'wrap' }}>
        {categoriesWithCounts.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.type)}
            style={{
              padding: '4px 8px',
              background: selectedCategory === category.type 
                ? 'rgba(0, 120, 212, 0.3)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedCategory === category.type 
                ? '1px solid rgba(0, 120, 212, 0.5)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{category.name}</span>
            <span style={{ opacity: 0.6 }}>({category.count})</span>
          </button>
        ))}
      </div>

      {!isEditing ? (
        <>
      {!showGraph ? (
        <div className="editor-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {filteredBlueprints.length === 0 ? (
            <div className="editor-text-small" style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px' }}>
              No blueprints found
            </div>
          ) : (
            filteredBlueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                onClick={() => handleBlueprintSelect(blueprint.id)}
                style={{
                  padding: '10px',
                  margin: '4px 0',
                  background: selectedBlueprint === blueprint.id 
                    ? 'rgba(0, 120, 212, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedBlueprint === blueprint.id 
                    ? '1px solid rgba(0, 120, 212, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="editor-text" style={{ fontWeight: 'bold' }}>
                      {blueprint.name}
                    </div>
                    <div className="editor-text-small" style={{ opacity: 0.8, marginTop: '2px' }}>
                      {blueprint.description}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {blueprint.tags.map((tag) => (
                        <span
                          key={tag}
                          className="editor-text-small"
                          style={{
                            padding: '2px 6px',
                            background: 'rgba(0, 120, 212, 0.2)',
                            borderRadius: '3px',
                            fontSize: '10px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="editor-text-small" style={{ opacity: 0.6, fontSize: '10px', textAlign: 'right' }}>
                    <div>v{blueprint.version}</div>
                    <div>{blueprint.lastModified}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
            <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '6px', margin: '8px', overflow: 'hidden', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
                nodeTypes={memoizedNodeTypes}
            fitView
          >
            <Background color="#333" variant={BackgroundVariant.Dots} />
            <Controls />
          </ReactFlow>
              

        </div>
      )}

      {selectedBlueprint && (
        <div style={{ 
          padding: '8px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ 
          display: 'flex',
          gap: '8px',
                marginBottom: '8px'
        }}>
          <button
            onClick={() => setShowGraph(!showGraph)}
            style={{
              flex: 1,
              padding: '6px',
              background: showGraph ? 'rgba(255, 152, 0, 0.3)' : 'rgba(0, 120, 212, 0.3)',
              border: showGraph ? '1px solid rgba(255, 152, 0, 0.5)' : '1px solid rgba(0, 120, 212, 0.5)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {showGraph ? 'Show List' : 'Show Graph'}
          </button>
                <button
                  onClick={handleEditBlueprint}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: 'rgba(255, 152, 0, 0.3)',
                    border: '1px solid rgba(255, 152, 0, 0.5)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Edit Blueprint
                </button>
                {showGraph && (
                  <button
                    onClick={handleSaveBlueprint}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: 'rgba(76, 175, 80, 0.3)',
                      border: '1px solid rgba(76, 175, 80, 0.5)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Save Changes
                  </button>
                )}
          <button
            onClick={handleSpawnEntity}
                  disabled={isSpawning}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: isSpawning ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.3)',
                    border: '1px solid rgba(76, 175, 80, 0.5)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: isSpawning ? 'not-allowed' : 'pointer',
                    opacity: isSpawning ? 0.5 : 1,
                  }}
                >
                  {isSpawning ? 'Spawning...' : 'Spawn Entity'}
                </button>
              </div>
              
              {showGraph && (
                <div style={{ 
                  display: 'flex', 
                  gap: '4px',
                  flexWrap: 'wrap',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}>
                  <div style={{ width: '100%', marginBottom: '8px' }}>
                    <div className="editor-text-small" style={{ marginBottom: '4px' }}>Add Component Node:</div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {['physics', 'controller', 'animation', 'behavior', 'audio', 'visual'].map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedNodeCategory(category)}
                          style={{
                            padding: '4px 8px',
                            background: selectedNodeCategory === category 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            color: 'var(--editor-text-main)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {availableNodeTypes
                        .filter(node => node.category === selectedNodeCategory)
                        .map(node => (
                          <button
                            key={node.id}
                            onClick={() => handleAddNodeFromPanel(node.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              color: 'var(--editor-text-main)',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
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
            <div className="editor-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
              {editingBlueprint && (
                <div>
                  <h4 className="editor-text" style={{ marginBottom: '10px' }}>
                    {isCreatingNew ? 'Create New Blueprint' : `Edit: ${editingBlueprint.name}`}
                  </h4>
                  {renderPropertyEditor(editingBlueprint)}
                </div>
              )}
            </div>
            
            <div style={{ 
              padding: '8px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '8px',
            }}>
              <button
                onClick={handleSaveBlueprint}
            style={{
              flex: 1,
              padding: '6px',
              background: 'rgba(76, 175, 80, 0.3)',
              border: '1px solid rgba(76, 175, 80, 0.5)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
                {isCreatingNew ? 'Create' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: 'rgba(244, 67, 54, 0.3)',
                  border: '1px solid rgba(244, 67, 54, 0.5)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
          </button>
        </div>
          </>
      )}
    </div>
  );
}; 