import { createStore } from 'jotai';
import * as THREE from 'three';
import {
  activeStateAtom,
  modeStateAtom,
  gameStatesAtom,
  animationStateAtom,
  controllerConfigAtom,
  currentControllerConfigAtom,
  currentAnimationAtom,
  physicsMovementAtom,
  eventBusAtom,
  publishEventAtom,
  EventType,
} from '@/gaesup/atoms/coreStateAtoms';
import { keyboardInputAtom } from '@/gaesup/atoms/inputAtom';

describe('coreStateAtoms', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should initialize with default values', () => {
    expect(store.get(activeStateAtom).position).toEqual(new THREE.Vector3(0, 5, 5));
    expect(store.get(modeStateAtom).type).toBe('character');
    expect(store.get(gameStatesAtom).isMoving).toBe(false);
    expect(store.get(animationStateAtom).character.current).toBe('idle');
  });

  describe('writable atoms', () => {
    it('should update activeStateAtom', () => {
      const newPosition = new THREE.Vector3(1, 1, 1);
      store.set(activeStateAtom, { ...store.get(activeStateAtom), position: newPosition });
      expect(store.get(activeStateAtom).position).toEqual(newPosition);
    });

    it('should update modeStateAtom', () => {
      store.set(modeStateAtom, { ...store.get(modeStateAtom), type: 'vehicle' });
      expect(store.get(modeStateAtom).type).toBe('vehicle');
    });

    it('should update gameStatesAtom', () => {
      store.set(gameStatesAtom, { ...store.get(gameStatesAtom), isJumping: true });
      expect(store.get(gameStatesAtom).isJumping).toBe(true);
    });
  });

  describe('derived atoms', () => {
    it('currentControllerConfigAtom should derive config from mode', () => {
      const characterConfig = store.get(controllerConfigAtom).character;
      expect(store.get(currentControllerConfigAtom)).toEqual(characterConfig);

      store.set(modeStateAtom, { ...store.get(modeStateAtom), type: 'airplane' });
      const airplaneConfig = store.get(controllerConfigAtom).airplane;
      expect(store.get(currentControllerConfigAtom)).toEqual(airplaneConfig);
    });

    it('currentAnimationAtom should derive animation state from mode', () => {
      const characterAnimation = store.get(animationStateAtom).character;
      expect(store.get(currentAnimationAtom)).toEqual(characterAnimation);

      store.set(modeStateAtom, { ...store.get(modeStateAtom), type: 'vehicle' });
      const vehicleAnimation = store.get(animationStateAtom).vehicle;
      expect(store.get(currentAnimationAtom)).toEqual(vehicleAnimation);
    });

    it('physicsMovementAtom should combine input and game states', () => {
      // Test initial state
      let movement = store.get(physicsMovementAtom);
      expect(movement.isMoving).toBe(false);
      expect(movement.isOnGround).toBe(false);

      // Update input
      store.set(keyboardInputAtom, { forward: true });
      movement = store.get(physicsMovementAtom);
      expect(movement.isMoving).toBe(true);

      // Update game state
      store.set(gameStatesAtom, { ...store.get(gameStatesAtom), isOnTheGround: true });
      movement = store.get(physicsMovementAtom);
      expect(movement.isOnGround).toBe(true);
    });
  });

  describe('eventBusAtom', () => {
    it('should publish and store events', () => {
      const eventData = { type: 'MODE_CHANGED' as EventType, data: { newMode: 'vehicle' } };
      store.set(publishEventAtom, eventData);

      const events = store.get(eventBusAtom);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('MODE_CHANGED');
      expect(events[0].data.newMode).toBe('vehicle');
      expect(events[0].timestamp).toBeDefined();
    });
  });
});
