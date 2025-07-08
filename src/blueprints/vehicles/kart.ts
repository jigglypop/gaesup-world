import { VehicleBlueprint } from '../types';

export const BASIC_KART_BLUEPRINT: VehicleBlueprint = {
  id: 'vehicle_kart_basic',
  name: 'Basic Kart',
  type: 'vehicle',
  version: '1.0.0',
  tags: ['land', 'fast', 'small'],
  description: 'A small and nimble racing kart',
  
  physics: {
    mass: 150,
    maxSpeed: 30,
    acceleration: 15,
    braking: 20,
    turning: 2.5,
    suspension: {
      stiffness: 30,
      damping: 3,
      restLength: 0.3,
      maxTravel: 0.2
    }
  },
  
  seats: [
    {
      position: [0, 0.5, 0],
      isDriver: true
    }
  ],
  
  animations: {
    idle: 'kart_idle.glb',
    moving: 'kart_moving.glb',
    wheels: ['wheel_fl.glb', 'wheel_fr.glb', 'wheel_bl.glb', 'wheel_br.glb']
  }
}; 