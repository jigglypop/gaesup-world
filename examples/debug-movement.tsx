import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  GaesupWorld, 
  useMainFrameLoop, 
  useEventBus,
  EventBus,
  useRefStates
} from 'gaesup-world';

function MovementDebugger() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [_, setKeyStates] = useState<Record<string, boolean>>({});
  const [physicsStates, setPhysicsStates] = useState<any>({});
  
  // 이벤트 로그 추가
  const addLog = (message: string) => {
    setEventLog(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  useEventBus('playerMoveStart', (payload) => {
    addLog(`✅ 이동 시작 - 위치: ${payload.position.x.toFixed(2)}, ${payload.position.z.toFixed(2)}`);
  });

  useEventBus('playerMoveStop', (payload) => {
    addLog(`⏹️ 이동 정지 - 위치: ${payload.position.x.toFixed(2)}, ${payload.position.z.toFixed(2)}`);
  });

  useEventBus('playerJumpStart', (payload) => {
    addLog(`🦘 점프 시작 - 속도: ${payload.velocity.y.toFixed(2)}`);
  });

  useEventBus('playerLanded', (payload) => {
    addLog(`🎯 착지 - 충격: ${payload.impact.toFixed(2)}`);
  });

  useEventBus('globalKeyEvent', (payload) => {
    addLog(`⌨️ 키 ${payload.key}: ${payload.action}`);
    setKeyStates(prev => ({
      ...prev,
      [payload.key]: payload.action === 'down'
    }));
  });
  const refStatesHook = useRefStates();
  useEffect(() => {
    const interval = setInterval(() => {
      const states = refStatesHook.refStates;
      setPhysicsStates({
        position: {
          x: states.physics.position.x.toFixed(2),
          y: states.physics.position.y.toFixed(2),
          z: states.physics.position.z.toFixed(2),
        },
        velocity: {
          x: states.physics.velocity.x.toFixed(2),
          y: states.physics.velocity.y.toFixed(2),
          z: states.physics.velocity.z.toFixed(2),
          length: states.physics.velocity.length().toFixed(2),
        },
        checks: {
          isOnTheGround: states.checks.isOnTheGround,
          isFalling: states.checks.isFalling,
        },
        input: states.input.keys,
        performance: {
          fps: states.performance.averageFPS.toFixed(1),
          frameCount: states.performance.frameCount,
        }
      });
    }, 100); // 100ms마다 업데이트

    return () => clearInterval(interval);
  }, [refStatesHook]);

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      left: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: 15,
      borderRadius: 8,
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: 400,
      zIndex: 1000,
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔧 움직임 진단 도구</h3>
      
      {/* 이벤트 버스 상태 */}
      <div style={{ marginBottom: 10 }}>
        <strong>📡 이벤트 버스 상태:</strong>
        <div style={{ fontSize: 10, color: '#ccc' }}>
          총 리스너: {EventBus.getStats().totalListeners}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>⌨️ 키 상태:</strong>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {Object.entries(physicsStates.input || {}).map(([key, pressed]) => (
            <span
              key={key}
              style={{
                background: pressed ? '#00ff00' : '#333',
                color: pressed ? '#000' : '#ccc',
                padding: '2px 4px',
                borderRadius: 3,
                fontSize: 10,
              }}
            >
              {key}
            </span>
          ))}
        </div>
      </div>

      {/* 물리 상태 */}
      <div style={{ marginBottom: 10 }}>
        <strong>🎯 물리 상태:</strong>
        <div style={{ fontSize: 10 }}>
          위치: ({physicsStates.position?.x}, {physicsStates.position?.y}, {physicsStates.position?.z})
        </div>
        <div style={{ fontSize: 10 }}>
          속도: ({physicsStates.velocity?.x}, {physicsStates.velocity?.y}, {physicsStates.velocity?.z}) 
          | 크기: {physicsStates.velocity?.length}
        </div>
        <div style={{ fontSize: 10 }}>
          지면: {physicsStates.checks?.isOnTheGround ? '✅' : '❌'} | 
          낙하: {physicsStates.checks?.isFalling ? '⬇️' : '⬆️'}
        </div>
      </div>

      {/* 성능 */}
      <div style={{ marginBottom: 10 }}>
        <strong>⚡ 성능:</strong>
        <div style={{ fontSize: 10 }}>
          FPS: {physicsStates.performance?.fps} | 
          프레임: {physicsStates.performance?.frameCount}
        </div>
      </div>

      {/* 이벤트 로그 */}
      <div>
        <strong>📋 이벤트 로그:</strong>
        <div style={{ 
          maxHeight: 150, 
          overflowY: 'auto', 
          background: '#111', 
          padding: 5, 
          marginTop: 5,
          borderRadius: 3,
        }}>
          {eventLog.map((log, i) => (
            <div key={i} style={{ fontSize: 10, marginBottom: 2 }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 게임 씬 컴포넌트
function GameScene() {
  // ⚠️ 필수: 메인 프레임 루프 (한 번만 호출)
  useMainFrameLoop();
  
  return (
    <>
      <GaesupWorld
        urls={{
          character: '/path/to/character.glb'
        }}
        mode={{ type: 'character' }}
        character={{
          walkSpeed: 10,
          runSpeed: 20,
          jumpSpeed: 15,
        }}
      />
      
      {/* 🔧 디버그 도구 */}
      <MovementDebugger />
    </>
  );
}

// 메인 앱 컴포넌트
function DebugMovementApp() {
  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      
      {/* 🎮 게임 씬 */}
      <GameScene />
    </Canvas>
  );
}

export default DebugMovementApp; 