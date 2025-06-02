import React from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  GaesupWorld, 
  useMainFrameLoop, 
  useGaesupState,
  useEventBus 
} from 'gaesup-world';

// 🚀 새로운 상태 관리 시스템을 사용하는 예제
function GameScene() {
  // ⚠️ 필수: 메인 프레임 루프 (한 번만 호출)
  useMainFrameLoop();
  
  // 선택적: 통합 상태 관리 사용
  const gaesupState = useGaesupState();
  
  // 선택적: 플레이어 이벤트 감지
  useEventBus('playerMoveStart', (payload) => {
    console.log('플레이어 이동 시작:', payload.position);
  });
  
  useEventBus('playerLanded', (payload) => {
    console.log('플레이어 착지:', payload.position, '충격:', payload.impact);
  });
  
  return (
    <GaesupWorld
      urls={{
        character: '/path/to/character.glb'
      }}
      mode={{ type: 'character' }}
    />
  );
}

// 메인 앱 컴포넌트
function App() {
  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 🎮 게임 씬 */}
      <GameScene />
    </Canvas>
  );
}

export default App; 