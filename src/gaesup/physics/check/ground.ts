import * as THREE from 'three';
import { gameStore } from '../../store/gameStore';
import { calcType } from '../type';
import { resetJumpState } from './moving';

export default function checkOnTheGround(prop: calcType) {
  const { rigidBodyRef, matchSizes } = prop;
  if (!rigidBodyRef.current) {
    // gameStore 직접 업데이트
    gameStore.gameStates.isOnTheGround = false;
    gameStore.gameStates.isFalling = true;
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

  // gameStore 직접 업데이트
  gameStore.gameStates.isOnTheGround = isOnTheGround;
  gameStore.gameStates.isFalling = isFalling;

  // 물리 상태 업데이트 (ref는 리렌더링 없음)
  gameStore.physics.activeState.position.set(position.x, position.y, position.z);
  gameStore.physics.activeState.velocity.set(velocity.x, velocity.y, velocity.z);
}
