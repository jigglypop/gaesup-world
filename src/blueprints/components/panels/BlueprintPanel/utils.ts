import { Node, Edge, MarkerType } from 'reactflow';

import { BlueprintItem, BlueprintType } from './types';
import type { AnyBlueprint, BlueprintRecord, BlueprintValue } from '../../../types';
import { NodeFieldValue } from '../../editor/EditableNode/types';

// Edge style constants
const EDGE_STYLE = {
  stroke: '#666666',
  strokeWidth: 2
};

const MARKER_STYLE = {
  type: MarkerType.ArrowClosed,
  color: '#666666',
  width: 20,
  height: 20
};

const isRecord = (value: BlueprintValue | undefined): value is BlueprintRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getBlueprintItemType = (blueprint: AnyBlueprint): BlueprintType => {
  switch (blueprint.type) {
    case 'animation-sequence':
      return 'animation';
    case 'behavior-tree':
      return 'behavior';
    default:
      return blueprint.type;
  }
};

const getBehaviorInitial = (value: BlueprintValue | undefined): string => {
  if (!isRecord(value)) return 'idle';
  return typeof value['initial'] === 'string' ? value['initial'] : 'idle';
};

export const convertBlueprintToItem = (blueprint: AnyBlueprint): BlueprintItem => {
  return {
    id: blueprint.id,
    name: blueprint.name,
    type: getBlueprintItemType(blueprint),
    version: blueprint.version,
    tags: blueprint.tags || [],
    description: blueprint.description ?? '',
    lastModified: new Date().toISOString().split('T')[0] ?? '',
  };
};

export const generateNodesFromBlueprint = (blueprint: AnyBlueprint, onNodeEdit?: (nodeId: string, field: string, value: NodeFieldValue) => void, onNodeDelete?: (nodeId: string) => void): { nodes: Node[], edges: Edge[] } => {
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
    // System core node
    nodes.push({
      id: 'system',
      type: 'editable',
      position: { x: 250, y: 250 },
      data: { 
        title: 'System Core',
        fields: {
          type: 'Character Controller'
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Physics node
    nodes.push({
      id: 'physics',
      type: 'editable',
      position: { x: 50, y: 350 },
      data: { 
        title: 'Physics',
        fields: {
          mass: blueprint.physics.mass,
          moveSpeed: blueprint.physics.moveSpeed,
          runSpeed: blueprint.physics.runSpeed,
          jumpForce: blueprint.physics.jumpForce,
          height: blueprint.physics.height,
          radius: blueprint.physics.radius,
          airControl: blueprint.physics.airControl
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Stats node
    nodes.push({
      id: 'stats',
      type: 'editable',
      position: { x: 450, y: 350 },
      data: { 
        title: 'Stats',
        fields: {
          health: blueprint.stats.health,
          stamina: blueprint.stats.stamina,
          mana: blueprint.stats.mana || 0,
          strength: blueprint.stats.strength,
          defense: blueprint.stats.defense,
          speed: blueprint.stats.speed
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Animations node
    nodes.push({
      id: 'animations',
      type: 'editable',
      position: { x: 250, y: 350 },
      data: { 
        title: 'Animations',
        fields: {
          idle: blueprint.animations.idle || 'none',
          walk: blueprint.animations.walk || 'none',
          run: blueprint.animations.run || 'none',
          jump_start: blueprint.animations.jump?.start || 'none',
          jump_loop: blueprint.animations.jump?.loop || 'none',
          jump_land: blueprint.animations.jump?.land || 'none'
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Behaviors node (if exists)
    if (blueprint.behaviors) {
      nodes.push({
        id: 'behaviors',
        type: 'editable',
        position: { x: 250, y: 450 },
        data: { 
          title: 'Behaviors',
          fields: {
            type: blueprint.behaviors.type,
            initial: getBehaviorInitial(blueprint.behaviors.data)
          },
          onEdit: onNodeEdit,
          onDelete: onNodeDelete
        }
      });
    }
    
    // Camera node (always create)
    nodes.push({
      id: 'camera',
      type: 'camera',
      position: { x: 50, y: 150 },
      data: {
        ...(blueprint.camera || {}),
        onChange: onNodeEdit
      }
    });
    
    // Camera components
    nodes.push({
      id: 'camera-controller',
      type: 'editable',
      position: { x: -150, y: 50 },
      data: { 
        title: 'Camera Controller',
        fields: {
          smoothing: blueprint.camera?.smoothing?.position || 0.25,
          collision: blueprint.camera?.enableCollision || false
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    nodes.push({
      id: 'camera-zoom',
      type: 'editable',
      position: { x: -150, y: 150 },
      data: { 
        title: 'Zoom Component',
        fields: {
          enabled: blueprint.camera?.enableZoom || true,
          speed: blueprint.camera?.zoomSpeed || 1,
          min: blueprint.camera?.minZoom || 5,
          max: blueprint.camera?.maxZoom || 50
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
    
    // Input node (always create)
    nodes.push({
      id: 'controls',
      type: 'input',
      position: { x: 450, y: 150 },
      data: {
        ...(blueprint.controls || {}),
        onChange: onNodeEdit
      }
    });
  } else if (blueprint.type === 'vehicle') {
    nodes.push({
      id: 'vehicle-physics',
      type: 'editable',
      position: { x: 150, y: 150 },
      data: { 
        title: 'Physics',
        fields: {
          mass: blueprint.physics.mass,
          maxSpeed: blueprint.physics.maxSpeed,
          acceleration: blueprint.physics.acceleration,
          braking: blueprint.physics.braking,
          turning: blueprint.physics.turning
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
          count: blueprint.seats.length,
          driverSeat: blueprint.seats.findIndex(s => s.isDriver) + 1
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
  } else if (blueprint.type === 'airplane') {
    nodes.push({
      id: 'airplane-physics',
      type: 'editable',
      position: { x: 150, y: 150 },
      data: { 
        title: 'Physics',
        fields: {
          mass: blueprint.physics.mass,
          maxSpeed: blueprint.physics.maxSpeed,
          acceleration: blueprint.physics.acceleration,
          turning: blueprint.physics.turning,
          lift: blueprint.physics.lift,
          drag: blueprint.physics.drag
        },
        onEdit: onNodeEdit,
        onDelete: onNodeDelete
      }
    });
  }
  
  // Add edges with proper hierarchy
  if (blueprint.type === 'character') {
    // Root to System
    edges.push({
      id: 'root-system',
      source: 'root',
      target: 'system',
      animated: true,
      style: EDGE_STYLE,
      markerEnd: MARKER_STYLE
    });
    
    // System to Camera and Input
    edges.push({
      id: 'system-camera',
      source: 'system',
      target: 'camera',
      animated: true,
      style: EDGE_STYLE,
      markerEnd: MARKER_STYLE
    });
    
    edges.push({
      id: 'system-controls',
      source: 'system',
      target: 'controls',
      animated: true,
      style: EDGE_STYLE,
      markerEnd: MARKER_STYLE
    });
    
    // Camera to its components
    edges.push({
      id: 'camera-controller',
      source: 'camera',
      target: 'camera-controller',
      animated: true,
      style: EDGE_STYLE,
      markerEnd: MARKER_STYLE
    });
    
    edges.push({
      id: 'camera-zoom',
      source: 'camera',
      target: 'camera-zoom',
      animated: true,
      style: EDGE_STYLE,
      markerEnd: MARKER_STYLE
    });
    
    // System to other nodes
    ['physics', 'stats', 'animations', 'behaviors'].forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        edges.push({
          id: `system-${nodeId}`,
          source: 'system',
          target: nodeId,
          animated: true,
          style: EDGE_STYLE,
          markerEnd: MARKER_STYLE
        });
      }
    });
  } else {
    // For other blueprint types, keep original edge logic
    nodes.forEach(node => {
      if (node.id !== 'root') {
        edges.push({
          id: `root-${node.id}`,
          source: 'root',
          target: node.id,
          animated: true,
          style: EDGE_STYLE,
          markerEnd: MARKER_STYLE
        });
      }
    });
  }
  
  return { nodes, edges };
}; 
