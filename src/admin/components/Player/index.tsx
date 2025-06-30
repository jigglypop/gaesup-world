import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useAuthStore } from "../../store/authStore";
import * as THREE from "three";

export default function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const rigidBodyRef = useRef<any>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 2, 0]);
  const [speechBalloon, setSpeechBalloon] = useState(" 안녕하세요! ");
  const loading = useAuthStore(state => state.loading);

  useFrame(() => {
    if (rigidBodyRef.current) {
      const pos = rigidBodyRef.current.translation();
      setPosition([pos.x, pos.y, pos.z]);
    }
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!rigidBodyRef.current) return;
    
    const impulse = { x: 0, y: 0, z: 0 };
    const force = 5;
    
    switch (event.key.toLowerCase()) {
      case 'w':
        impulse.z = -force;
        break;
      case 's':
        impulse.z = force;
        break;
      case 'a':
        impulse.x = -force;
        break;
      case 'd':
        impulse.x = force;
        break;
      case ' ':
        impulse.y = force * 2;
        setSpeechBalloon(" 점프! ");
        break;
      default:
        return;
    }
    
    rigidBodyRef.current.applyImpulse(impulse, true);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        type={loading ? "fixed" : "dynamic"}
        position={[0, 2, 0]}
        canSleep={false}
      >
        <mesh ref={meshRef} castShadow>
          <capsuleGeometry args={[0.5, 1.5]} />
          <meshStandardMaterial color="#4488ff" />
        </mesh>
      </RigidBody>
      
    </>
  );
} 