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
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BlueprintType, BlueprintCategory, BlueprintItem } from './types';
import { blueprintRegistry, AnyBlueprint, CharacterBlueprint } from '../../../../blueprints';

const blueprintCategories: BlueprintCategory[] = [
  { id: 'characters', name: 'Characters', type: 'character', icon: '👤', count: 0 },
  { id: 'vehicles', name: 'Vehicles', type: 'vehicle', icon: '🚗', count: 0 },
  { id: 'airplanes', name: 'Airplanes', type: 'airplane', icon: '✈️', count: 0 },
  { id: 'animations', name: 'Animations', type: 'animation', icon: '🎬', count: 0 },
  { id: 'behaviors', name: 'Behaviors', type: 'behavior', icon: '🧠', count: 0 },
  { id: 'items', name: 'Items', type: 'item', icon: '📦', count: 0 },
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

const generateNodesFromBlueprint = (blueprint: AnyBlueprint): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Root node
  nodes.push({
    id: 'root',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { 
      label: (
        <div style={{ textAlign: 'center' }}>
          <strong>{blueprint.name}</strong>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>v{blueprint.version}</div>
        </div>
      )
    },
    style: {
      background: '#0078d4',
      color: 'white',
      border: '2px solid #005a9e',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '150px'
    }
  });

  if (blueprint.type === 'character') {
    const charBlueprint = blueprint as CharacterBlueprint;
    
    // Physics node
    nodes.push({
      id: 'physics',
      position: { x: 50, y: 150 },
      data: { 
        label: (
          <div>
            <strong>Physics</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              <div>Mass: {charBlueprint.physics.mass}kg</div>
              <div>Speed: {charBlueprint.physics.moveSpeed}m/s</div>
              <div>Jump: {charBlueprint.physics.jumpForce}N</div>
            </div>
          </div>
        )
      },
      style: {
        background: '#4caf50',
        color: 'white',
        border: '2px solid #388e3c',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '12px'
      }
    });
    
    // Animations node
    nodes.push({
      id: 'animations',
      position: { x: 250, y: 150 },
      data: { 
        label: (
          <div>
            <strong>Animations</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              <div>Idle, Walk, Run</div>
              <div>Jump sequence</div>
              {charBlueprint.animations.combat && <div>Combat moves</div>}
            </div>
          </div>
        )
      },
      style: {
        background: '#ff9800',
        color: 'white',
        border: '2px solid #f57c00',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '12px'
      }
    });
    
    // Stats node
    nodes.push({
      id: 'stats',
      position: { x: 450, y: 150 },
      data: { 
        label: (
          <div>
            <strong>Stats</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              <div>HP: {charBlueprint.stats.health}</div>
              <div>STR: {charBlueprint.stats.strength}</div>
              <div>DEF: {charBlueprint.stats.defense}</div>
            </div>
          </div>
        )
      },
      style: {
        background: '#e91e63',
        color: 'white',
        border: '2px solid #c2185b',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '12px'
      }
    });
    
    // Behaviors node (if exists)
    if (charBlueprint.behaviors) {
      nodes.push({
        id: 'behaviors',
        position: { x: 250, y: 250 },
        data: { 
          label: (
            <div>
              <strong>Behaviors</strong>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                <div>Type: {charBlueprint.behaviors.type}</div>
                <div>States: Idle, Moving, Combat</div>
              </div>
            </div>
          )
        },
        style: {
          background: '#9c27b0',
          color: 'white',
          border: '2px solid #7b1fa2',
          borderRadius: '6px',
          padding: '8px',
          fontSize: '12px'
        }
      });
      
      edges.push({
        id: 'root-behaviors',
        source: 'root',
        target: 'behaviors',
        animated: true,
        style: { stroke: '#9c27b0' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9c27b0' }
      });
    }
    
    // Add edges
    edges.push(
      {
        id: 'root-physics',
        source: 'root',
        target: 'physics',
        animated: true,
        style: { stroke: '#4caf50' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4caf50' }
      },
      {
        id: 'root-animations',
        source: 'root',
        target: 'animations',
        animated: true,
        style: { stroke: '#ff9800' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' }
      },
      {
        id: 'root-stats',
        source: 'root',
        target: 'stats',
        animated: true,
        style: { stroke: '#e91e63' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#e91e63' }
      }
    );
  }
  
  return { nodes, edges };
};

export const BlueprintPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<BlueprintType>('character');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  const handleBlueprintSelect = (blueprintId: string) => {
    setSelectedBlueprint(blueprintId);
    const blueprint = blueprintRegistry.get(blueprintId);
    if (blueprint) {
      const { nodes: newNodes, edges: newEdges } = generateNodesFromBlueprint(blueprint);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  const handleSpawnEntity = () => {
    if (!selectedBlueprint) return;
    
    const blueprint = blueprintRegistry.get(selectedBlueprint);
    if (!blueprint) return;
    
    console.log('Spawning entity from blueprint:', blueprint);
    
    // TODO: 실제 엔티티 생성 로직 연결
    // 예: 
    // - Character 타입이면 GaesupController에 blueprint 전달
    // - Vehicle 타입이면 Rideable 컴포넌트 생성
    // - 등등...
    
    alert(`Blueprint "${blueprint.name}" (${blueprint.type}) would be spawned here!\n\nCheck console for blueprint data.`);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="editor-title">📘 Blueprint Library</h3>
      
      <div style={{ padding: '8px' }}>
        <input
          type="text"
          placeholder="Search blueprints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none',
          }}
        />
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
            <span>{category.icon}</span>
            <span>{category.name}</span>
            <span style={{ opacity: 0.6 }}>({category.count})</span>
          </button>
        ))}
      </div>

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
        <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '6px', margin: '8px', overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
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
          display: 'flex',
          gap: '8px',
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
            onClick={handleSpawnEntity}
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
            Spawn Entity
          </button>
        </div>
      )}
    </div>
  );
}; 