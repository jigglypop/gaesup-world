import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';

import 'reactflow/dist/style.css';
import {
  BlueprintType,
  BlueprintCategory,
  BlueprintEditorProps,
} from './types';
import { blueprintRegistry, AnyBlueprint } from '../../';
import { useSpawnFromBlueprint } from '../../hooks/useSpawnFromBlueprint';
import type { BlueprintRecord, BlueprintValue } from '../../types';
import { BlueprintPreview } from '../BlueprintPreview';
import { CameraNode } from '../editor/CameraNode';
import { EditableNode } from '../editor/EditableNode';
import { InputNode } from '../editor/InputNode';
import { NodeFieldValue } from '../editor/EditableNode/types';
import {
  convertBlueprintToItem,
  generateNodesFromBlueprint,
} from '../panels/BlueprintPanel/utils';
import './styles.css';

type EditableBlueprintDraft = AnyBlueprint & {
  physics?: Record<string, NodeFieldValue>;
  camera?: BlueprintRecord;
  controls?: Record<string, NodeFieldValue>;
};

const isRecord = (value: BlueprintValue | undefined): value is BlueprintRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getOrCreateRecord = (
  parent: BlueprintRecord,
  key: string,
): BlueprintRecord => {
  const current = parent[key];
  if (isRecord(current)) return current;
  const next: BlueprintRecord = {};
  parent[key] = next;
  return next;
};

const blueprintCategories: BlueprintCategory[] = [
  { id: 'characters', name: 'Characters', type: 'character', count: 0 },
  { id: 'vehicles', name: 'Vehicles', type: 'vehicle', count: 0 },
  { id: 'airplanes', name: 'Airplanes', type: 'airplane', count: 0 },
  { id: 'animations', name: 'Animations', type: 'animation', count: 0 },
  { id: 'behaviors', name: 'Behaviors', type: 'behavior', count: 0 },
  { id: 'items', name: 'Items', type: 'item', count: 0 },
];

// Define nodeTypes outside component to prevent recreation
const nodeTypes = {
  editable: EditableNode,
  camera: CameraNode,
  input: InputNode,
};

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<BlueprintType>('character');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBlueprint, setEditingBlueprint] = useState<AnyBlueprint | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { spawnAtCursor, isSpawning } = useSpawnFromBlueprint();

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

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleNodeEditCallback = useCallback(
    (nodeId: string, field: string, value: NodeFieldValue) => {
      setEditingBlueprint(currentBlueprint => {
        if (!currentBlueprint) return null;

        const newBlueprint = JSON.parse(
          JSON.stringify(currentBlueprint),
        ) as EditableBlueprintDraft;

        if (nodeId === 'root') {
          if (field === 'version' && typeof value === 'string') {
            newBlueprint.version = value;
          } else if (field === 'name' && typeof value === 'string') {
            newBlueprint.name = value;
          }
        } else if (
          nodeId === 'physics' ||
          nodeId === 'vehicle-physics' ||
          nodeId === 'airplane-physics'
        ) {
          if ('physics' in newBlueprint && newBlueprint.physics) {
            newBlueprint.physics[field] = value;
          }
        } else if (nodeId === 'camera') {
          if ('camera' in newBlueprint) {
            newBlueprint.camera ??= {};
            newBlueprint.camera[field] = value;
          }
        } else if (nodeId === 'controls') {
          if ('controls' in newBlueprint) {
            newBlueprint.controls ??= {};
            newBlueprint.controls[field] = value;
          }
        } else if (nodeId === 'camera-controller') {
          if ('camera' in newBlueprint) {
            newBlueprint.camera ??= {};
            const camera = newBlueprint.camera;
            if (field === 'smoothing') {
              const smoothing = getOrCreateRecord(camera, 'smoothing');
              if (typeof value === 'number') {
                smoothing['position'] = value;
              }
              if (!('rotation' in smoothing)) {
                smoothing['rotation'] = 0.3;
              }
              if (!('fov' in smoothing)) {
                smoothing['fov'] = 0.2;
              }
            } else if (field === 'collision' && typeof value === 'boolean') {
              camera['enableCollision'] = value;
            }
          }
        } else if (nodeId === 'camera-zoom') {
          if ('camera' in newBlueprint) {
            newBlueprint.camera ??= {};
            const camera = newBlueprint.camera;
            if (field === 'enabled' && typeof value === 'boolean') {
              camera['enableZoom'] = value;
            } else if (field === 'speed' && typeof value === 'number') {
              camera['zoomSpeed'] = value;
            } else if (field === 'min' && typeof value === 'number') {
              camera['minZoom'] = value;
            } else if (field === 'max' && typeof value === 'number') {
              camera['maxZoom'] = value;
            }
          }
        }
        return newBlueprint;
      });
    },
    [setEditingBlueprint],
  );

  const handleNodeEdit = useRef(handleNodeEditCallback);
  useEffect(() => {
    handleNodeEdit.current = handleNodeEditCallback;
  }, [handleNodeEditCallback]);

  useEffect(() => {
    if (editingBlueprint) {
      const { nodes: newNodes, edges: newEdges } = generateNodesFromBlueprint(
        editingBlueprint,
        (...args) => handleNodeEdit.current(...args),
        handleNodeDelete,
      );
      setNodes(newNodes);
      setEdges(newEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [editingBlueprint, handleNodeDelete, setNodes, setEdges]);

  const handleBlueprintSelect = useCallback((blueprintId: string | null) => {
    setSelectedBlueprint(blueprintId);
    if (blueprintId) {
      const blueprint = blueprintRegistry.get(blueprintId);
      if (blueprint) {
        setEditingBlueprint(JSON.parse(JSON.stringify(blueprint)));
      }
    } else {
      setEditingBlueprint(null);
    }
  }, []);

  useEffect(() => {
    const isSelectedInList = filteredBlueprints.some(b => b.id === selectedBlueprint);
    if (filteredBlueprints[0]?.id && filteredBlueprints.length > 0 && !isSelectedInList) {
      handleBlueprintSelect(filteredBlueprints[0].id);
    } else if (filteredBlueprints.length === 0) {
      handleBlueprintSelect(null);
    }
  }, [filteredBlueprints, selectedBlueprint, handleBlueprintSelect]);

  const handleSpawnEntity = async () => {
    if (!selectedBlueprint) return;

    const spawnedEntity = await spawnAtCursor(selectedBlueprint);

    if (spawnedEntity) {
      console.log('Successfully spawned entity:', spawnedEntity);
      onClose();
    }
  };

  return (
    <div className="blueprint-editor">
      <div className="blueprint-editor__sidebar">
        <div className="blueprint-editor__search">
          <input
            type="text"
            placeholder="Search blueprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blueprint-editor__search-input"
          />
        </div>

        <div className="blueprint-editor__categories">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.type)}
              className={`blueprint-editor__category ${selectedCategory === category.type ? 'active' : ''}`}
            >
              <span className="blueprint-editor__category-name">{category.name}</span>
              <span className="blueprint-editor__category-count">{category.count}</span>
            </button>
          ))}
        </div>

        <div className="blueprint-editor__list">
          {filteredBlueprints.map((blueprint) => (
            <div
              key={blueprint.id}
              onClick={() => handleBlueprintSelect(blueprint.id)}
              className={`blueprint-editor__item ${selectedBlueprint === blueprint.id ? 'active' : ''}`}
            >
              <div className="blueprint-editor__item-name">{blueprint.name}</div>
              <div className="blueprint-editor__item-tags">
                {blueprint.tags.map((tag) => (
                  <span key={tag} className="blueprint-editor__tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="blueprint-editor__actions">
          <button
            onClick={handleSpawnEntity}
            disabled={!selectedBlueprint || isSpawning}
            className="blueprint-editor__spawn-button"
          >
            {isSpawning ? 'Spawning...' : 'Spawn Entity'}
          </button>
        </div>
      </div>

      <div className="blueprint-editor__main">
        <div className="blueprint-editor__preview-section">
          <div className="blueprint-editor__preview-header">
            <h3 className="blueprint-editor__preview-title">Preview</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="blueprint-editor__preview-toggle"
            >
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPreview && (
            <div className="blueprint-editor__preview-container">
              <BlueprintPreview
                key={editingBlueprint ? editingBlueprint.id : 'no-blueprint'}
                blueprint={editingBlueprint}
              />
            </div>
          )}
        </div>

        <div className="blueprint-editor__graph-section">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background variant={BackgroundVariant.Dots} />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}; 
