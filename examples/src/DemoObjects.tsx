import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

// 애니메이션 기반 점프 캐릭터
export function JumpingCharacter({ position = [0, 2, 0], color = '#44ccff' }) {
  const ref = useRef();
  const [isJumping, setIsJumping] = useState(false);
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  });
  
  // 점프 애니메이션 파라미터
  const jumpHeight = 3;
  const jumpDuration = 1; // 초
  const moveSpeed = 0.1;
  
  // 현재 점프 상태 관리
  const jumpTimeRef = useRef(0);
  const positionRef = useRef({ ...position });
  
  // 키보드 입력 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'Space':
          if (!isJumping) {
            setKeys(prev => ({ ...prev, jump: true }));
          }
          break;
        case 'KeyW':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, forward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, backward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: true }));
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'Space':
          setKeys(prev => ({ ...prev, jump: false }));
          break;
        case 'KeyW':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: false }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJumping]);
  
  // 애니메이션 및 움직임 처리
  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = positionRef.current;

    if (keys.jump && !isJumping) {
      setIsJumping(true);
      jumpTimeRef.current = 0;
    }
    if (isJumping) {
      jumpTimeRef.current += delta;
      const jumpTime = jumpTimeRef.current;
      const normalizedTime = Math.min(jumpTime / jumpDuration, 1);
      const jumpOffset = 4 * jumpHeight * normalizedTime * (1 - normalizedTime);
      ref.current.position.y = pos.y + jumpOffset;
      if (normalizedTime >= 1) {
        setIsJumping(false);
        ref.current.position.y = pos.y;
      }
    }
    
    // 이동 처리
    let moveX = 0;
    let moveZ = 0;
    
    if (keys.forward) moveZ -= moveSpeed;
    if (keys.backward) moveZ += moveSpeed;
    if (keys.left) moveX -= moveSpeed;
    if (keys.right) moveX += moveSpeed;
    
    // 대각선 움직임 정규화
    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.7071; // 1/sqrt(2)
      moveZ *= 0.7071;
    }
    
    // 위치 업데이트
    positionRef.current.x += moveX;
    positionRef.current.z += moveZ;
    ref.current.position.x = positionRef.current.x;
    ref.current.position.z = positionRef.current.z;
    
    // 움직이는 방향으로 회전
    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ);
      ref.current.rotation.y = angle;
    }
    
    // 점프 시 약간 돌기
    if (isJumping) {
      ref.current.rotation.x = Math.sin(jumpTimeRef.current * 5) * 0.2;
    } else {
      ref.current.rotation.x = 0;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {isJumping && (
        <group position={[0, -0.6, 0]}>
          <Sphere args={[0.2, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={1} />
          </Sphere>
        </group>
      )}
    </group>
  );
}

export function PhysicalStairs({ position = [0, 0, 0], steps = 10, width = 10, height = 0.5, depth = 1, color = '#888888' }) {
  const createSteps = () => {
    const stepsArray = [];
    
    for (let i = 0; i < steps; i++) {
      // 각 계단의 위치 계산
      const stepX = position[0];
      const stepY = position[1] + i * height;
      const stepZ = position[2] + i * depth;
      
      const stepWidth = width - (i * 0.2);
      stepsArray.push(
        <RigidBody 
          key={`step-${i}`}
          type="fixed" 
          position={[stepX, stepY, stepZ]}
          colliders="cuboid"
        >
          <Box args={[stepWidth, height, depth]} receiveShadow castShadow>
            <meshStandardMaterial 
              color={color} 
              roughness={0.7} 
              metalness={0.1} 
            />
          </Box>
        </RigidBody>
      );
    }
    return stepsArray;
  };
  return <group>{createSteps()}</group>;
}

// 물리 반응이 있는 플랫폼
export function PhysicalPlatform({ position = [0, 0, 0], size = [10, 1, 10], color = '#555555' }) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <Box args={size} receiveShadow castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </Box>
    </RigidBody>
  );
}

// 모든 데모 객체들을 포함하는 컨테이너 컴포넌트
export default function DemoObjects() {
  return (
    <group>
      <JumpingCharacter position={[5, 2, 0]} color="#44ccff" />
      <PhysicalStairs position={[0, 0, 25]} steps={12} width={8} height={0.5} depth={1} color="#777777" />
      <PhysicalStairs position={[-20, 0, 0]} steps={8} width={5} height={0.4} depth={0.8} color="#888888" />
      <PhysicalPlatform position={[0, 6, 37]} size={[12, 1, 8]} color="#555555" />
      <PhysicalPlatform position={[-20, 3.5, 6.5]} size={[6, 1, 6]} color="#666666" />
    </group>
  );
} 