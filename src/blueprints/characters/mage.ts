import { CharacterBlueprint } from '../types';

export const FIRE_MAGE_BLUEPRINT: CharacterBlueprint = {
  id: 'char_mage_fire',
  name: 'Fire Mage',
  type: 'character',
  version: '1.0.0',
  tags: ['magic', 'ranged', 'fire'],
  description: 'A powerful mage specializing in fire magic',
  
  physics: {
    mass: 60,
    height: 1.75,
    radius: 0.25,
    jumpForce: 300,
    moveSpeed: 4,
    runSpeed: 8,
    airControl: 0.3
  },
  
  animations: {
    idle: 'mage_idle.glb',
    walk: 'mage_walk.glb',
    run: 'mage_run.glb',
    jump: {
      start: 'mage_jump_start.glb',
      loop: 'mage_jump_loop.glb',
      land: 'mage_jump_land.glb'
    },
    combat: {
      cast_fireball: 'cast_fireball.glb',
      cast_meteor: 'cast_meteor.glb',
      cast_firewall: 'cast_firewall.glb',
      channel: 'channel_spell.glb'
    },
    special: {
      meditate: 'meditate.glb',
      teleport: 'teleport.glb'
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
            CAST: 'casting',
            MEDITATE: 'meditating'
          }
        },
        moving: {
          on: {
            STOP: 'idle',
            CAST: 'casting'
          }
        },
        casting: {
          on: {
            FINISH: 'idle',
            INTERRUPT: 'idle'
          }
        },
        meditating: {
          on: {
            FINISH: 'idle',
            INTERRUPT: 'idle'
          }
        }
      }
    }
  },
  
  stats: {
    health: 70,
    stamina: 30,
    mana: 100,
    strength: 5,
    defense: 8,
    speed: 12
  },
  
  visuals: {
    model: 'mage_model.glb',
    textures: ['mage_diffuse.png', 'mage_normal.png', 'mage_emissive.png'],
    scale: 1.0
  }
}; 