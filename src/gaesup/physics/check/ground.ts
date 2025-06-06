import * as THREE from 'three';
import { calcType } from '../type';
import { resetJumpState } from './moving';
import { eventBus } from '../stores';

export default function checkOnTheGround(prop: calcType) {
  const { rigidBodyRef, matchSizes } = prop;
  if (!rigidBodyRef.current) {
    eventBus.emit('GROUND_STATE_CHANGE', {
      isOnTheGround: false,
      isFalling: true,
    });
    return;
  }
  const velocity = rigidBodyRef.current.linvel();
  const position = rigidBodyRef.current.translation();
  let groundCheckDistance = 1.0;
  if (matchSizes && matchSizes.characterUrl) {
    const characterSize = matchSizes.characterUrl;
    groundCheckDistance = characterSize.y * 0.1;
  }
  const isNearGround = position.y <= groundCheckDistance;
  const isNotFalling = Math.abs(velocity.y) < 0.5;
  const isOnTheGround = isNearGround && isNotFalling;
  const isFalling = !isOnTheGround && velocity.y < -0.1;
  if (isOnTheGround) {
    resetJumpState();
  }
  eventBus.emit('GROUND_STATE_CHANGE', {
    isOnTheGround,
    isFalling,
  });
  eventBus.emit('POSITION_UPDATE', {
    position: new THREE.Vector3(position.x, position.y, position.z),
    velocity: new THREE.Vector3(velocity.x, velocity.y, velocity.z),
  });
}
