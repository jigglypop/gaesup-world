import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Environment, OrbitControls } from "@react-three/drei";
import { ReactNode } from "react";
import { ZoomCamera } from "./ZoomCamera";
import './styles.css';

interface ThreeContainerProps {
  children: ReactNode;
  isUpdate?: boolean;
}

export default function ThreeContainer({ children, isUpdate = false }: ThreeContainerProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ 
          position: [10, 10, 10], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        className="three-canvas">
        
        <Environment preset="sunset" background />
        
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-top={50}
          shadow-camera-right={50}
          shadow-camera-bottom={-50}
          shadow-camera-left={-50}
        />
        
        <ambientLight intensity={0.4} />
        
        <ZoomCamera />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <Physics debug={false} gravity={[0, -9.81, 0]}>
          <mesh receiveShadow position={[0, -0.5, 0]}>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          {children}
        </Physics>
      </Canvas>
    </div>
  );
} 