import { Node, Edge, MarkerType } from 'reactflow';
import { AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint } from '../../../types';
import { BlueprintItem, BlueprintType } from './types';

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

export const convertBlueprintToItem = (blueprint: AnyBlueprint): BlueprintItem => {
  return {
    id: blueprint.id,
    name: blueprint.name,
    type: blueprint.type as BlueprintType,
    version: blueprint.version,
    tags: blueprint.tags || [],
    description: blueprint.description ?? '',
    lastModified: new Date().toISOString().split('T')[0],
  };
};

import { NodeFieldValue } from '../../editor/EditableNode/types';

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
    
    // Camera node (if exists)
    if (charBlueprint.camera) {
      nodes.push({
        id: 'camera',
        type: 'camera',
        position: { x: 50, y: 350 },
        data: {
          ...charBlueprint.camera,
          onChange: onNodeEdit
        }
      });
    }
    
    // Input node (if exists)
    if (charBlueprint.controls) {
      nodes.push({
        id: 'controls',
        type: 'input',
        position: { x: 450, y: 350 },
        data: {
          ...charBlueprint.controls,
          onChange: onNodeEdit
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
        style: EDGE_STYLE,
        markerEnd: MARKER_STYLE
      });
    }
  });
  
  return { nodes, edges };
}; 