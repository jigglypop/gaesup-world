import { CharacterBlueprint } from '../types';

export const WARRIOR_BLUEPRINT: CharacterBlueprint = {
  id: 'char_warrior_basic',
  name: 'Basic Warrior',
  type: 'character',
  version: '1.0.0',
  tags: ['melee', 'tank', 'starter'],
  description: 'A basic warrior character with sword and shield',
  
  physics: {
    mass: 80,
    height: 1.8,
    radius: 0.3,
    jumpForce: 350,
    moveSpeed: 5,
    runSpeed: 10,
    airControl: 0.2
  },
  
  animations: {
    idle: 'warrior_idle.glb',
    walk: 'warrior_walk.glb',
    run: 'warrior_run.glb',
    jump: {
      start: 'warrior_jump_start.glb',
      loop: 'warrior_jump_loop.glb',
      land: 'warrior_jump_land.glb'
    },
    combat: {
      attack_light: ['attack_1.glb', 'attack_2.glb', 'attack_3.glb'],
      attack_heavy: 'attack_heavy.glb',
      block: 'block.glb',
      parry: 'parry.glb'
    }
  },
  
  behaviors: {
    type: 'state-machine',
    data: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            MOVE: 'moving',
            ATTACK: 'combat'
          }
        },
        moving: {
          on: {
            STOP: 'idle',
            ATTACK: 'combat'
          }
        },
        combat: {
          on: {
            FINISH: 'idle'
          }
        }
      }
    }
  },
  
  stats: {
    health: 100,
    stamina: 50,
    strength: 15,
    defense: 12,
    speed: 10
  },
  
  visuals: {
    parts: [
      {
        id: 'warrior-body',
        type: 'body' as const,
        url: 'gltf/ally_body.glb'
      },
      {
        id: 'warrior-cloth',
        type: 'top' as const,
        url: 'gltf/ally_cloth_rabbit.glb'
      }
    ],
    scale: 1.0
  },
  
  camera: {
    mode: 'thirdPerson',
    distance: { x: 15, y: 8, z: 15 },
    fov: 50,
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: true,
    enableZoom: true,
    zoomSpeed: 0.001,
    minZoom: 0.5,
    maxZoom: 2.0
  },
  
  controls: {
    enableKeyboard: true,
    enableMouse: true,
    enableGamepad: false,
    clickToMove: true
  }
}; 