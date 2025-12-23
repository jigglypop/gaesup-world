import { useRef } from 'react';

import { Box } from '@react-three/drei';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { useMotion } from '@/core/motions';

export function MotionExample() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const motion = useMotion('player-1', {
    motionType: 'character',
    rigidBodyRef,
    position: new THREE.Vector3(0, 5, 0)
  });

  const handleJump = () => {
    motion.jump();
  };

  const handleMove = (direction: THREE.Vector3) => {
    motion.move(direction);
  };

  const handleAutomation = () => {
    const target = new THREE.Vector3(10, 0, 10);
    motion.enableAutomation(target);
  };

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        type="dynamic"
        position={[0, 5, 0]}
      >
        <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
        <Box args={[1, 2, 1]}>
          <meshStandardMaterial color={motion.isMoving ? 'orange' : 'blue'} />
        </Box>
      </RigidBody>

      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <button onClick={handleJump}>Jump</button>
        <button onClick={() => handleMove(new THREE.Vector3(1, 0, 0))}>Move Right</button>
        <button onClick={() => handleMove(new THREE.Vector3(-1, 0, 0))}>Move Left</button>
        <button onClick={() => motion.stop()}>Stop</button>
        <button onClick={handleAutomation}>Auto Move to (10, 0, 10)</button>
        <div>
          <p>Grounded: {motion.isGrounded ? 'Yes' : 'No'}</p>
          <p>Speed: {motion.speed.toFixed(2)}</p>
          <p>Position: {motion.position ? `${motion.position.x.toFixed(1)}, ${motion.position.y.toFixed(1)}, ${motion.position.z.toFixed(1)}` : 'N/A'}</p>
        </div>
      </div>
    </>
  );
} 