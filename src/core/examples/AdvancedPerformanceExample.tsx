import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, Sphere, Plane } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { PerfMonitor, usePerformanceMonitor } from '../debug';

function AnimatedObjects() {
  const [boxCount, setBoxCount] = useState(10);

  const boxes = Array.from({ length: boxCount }, (_, i) => (
    <RigidBody key={i}>
      <Box
        position={[(Math.random() - 0.5) * 10, Math.random() * 5 + 2, (Math.random() - 0.5) * 10]}
        args={[0.5, 0.5, 0.5]}
      >
        <meshStandardMaterial color={`hsl(${i * 36}, 70%, 50%)`} />
      </Box>
    </RigidBody>
  ));

  return (
    <>
      {boxes}
      <RigidBody type="fixed">
        <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#404040" />
        </Plane>
      </RigidBody>
    </>
  );
}

function PerformanceControls() {
  const [objectCount, setObjectCount] = useState(10);
  const [enablePhysics, setEnablePhysics] = useState(true);
  const { metrics, exportData } = usePerformanceMonitor();

  const handleStressTest = () => {
    setObjectCount((prev) => Math.min(prev + 50, 200));
  };

  const handleReset = () => {
    setObjectCount(10);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        zIndex: 1000,
      }}
    >
      <h3>Performance Test Controls</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>Objects: {objectCount}</label>
        <input
          type="range"
          min="1"
          max="200"
          value={objectCount}
          onChange={(e) => setObjectCount(Number(e.target.value))}
          style={{ width: '200px', marginLeft: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={enablePhysics}
            onChange={(e) => setEnablePhysics(e.target.checked)}
          />
          Enable Physics
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleStressTest} style={{ marginRight: '10px' }}>
          Stress Test (+50)
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={exportData}>Export Metrics</button>
      </div>

      {metrics && (
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          <div>
            FPS: {metrics.fps.current} (avg: {metrics.fps.average})
          </div>
          <div>Frame Time: {metrics.frameTime.current}ms</div>
          <div>
            Memory: {metrics.memory.used}MB / {metrics.memory.limit}MB
          </div>
          <div>CPU Idle: {metrics.cpu.idle.toFixed(1)}ms</div>
        </div>
      )}
    </div>
  );
}

export function AdvancedPerformanceExample() {
  const [showMonitor, setShowMonitor] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <PerformanceControls />

      {showMonitor && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <PerfMonitor />
        </div>
      )}

      <button
        onClick={() => setShowMonitor(!showMonitor)}
        style={{
          position: 'absolute',
          top: '10px',
          right: showMonitor ? '320px' : '10px',
          zIndex: 1001,
          padding: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {showMonitor ? 'Hide' : 'Show'} Monitor
      </button>

      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Physics debug>
          <AnimatedObjects />
        </Physics>
      </Canvas>
    </div>
  );
}
