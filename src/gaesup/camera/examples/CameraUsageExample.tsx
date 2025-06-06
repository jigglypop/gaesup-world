import { useEffect, useRef } from 'react';
import { Euler, Vector3 } from 'three';
import { BlendFunction, CameraBlendManager } from '../blend/CameraBlendManager';
import { SmartCollisionSystem } from '../collision/SmartCollisionSystem';
import { CameraEffects } from '../effects/CameraEffects';
import { CameraStateManager } from '../state/CameraStateManager';

export function CameraUsageExample() {
  const cameraSystemRef = useRef<{
    blendManager: CameraBlendManager;
    collisionSystem: SmartCollisionSystem;
    stateManager: CameraStateManager;
    effects: CameraEffects;
  } | null>(null);

  useEffect(() => {
    if (!cameraSystemRef.current) return;

    const { blendManager, stateManager, effects } = cameraSystemRef.current;

    stateManager.registerState({
      name: 'cinematic',
      type: 'fixed',
      position: new Vector3(10, 15, 10),
      rotation: new Euler(-0.3, 0.8, 0),
      fov: 45,
      config: {},
      priority: 30,
      tags: ['cinematic', 'cutscene'],
    });

    stateManager.registerTransition({
      from: 'default',
      to: 'combat',
      condition: () => {
        return false;
      },
      duration: 1.5,
      blendFunction: BlendFunction.EaseInOut,
    });

    const handleCombatMode = () => {
      stateManager.setState('combat');
      effects.quickShake(0.3, 0.2);
    };

    const handleCinematicMode = () => {
      stateManager.setState('cinematic');
      effects.zoomIn(35, 2.0);
    };

    const handleExplosion = () => {
      effects.earthquake(1.2, 1.0);
      effects.zoomOut(85, 0.5);
    };

    const handleSniper = () => {
      stateManager.setState('combat');
      effects.zoomIn(20, 1.5);
    };

    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '1':
          handleCombatMode();
          break;
        case '2':
          handleCinematicMode();
          break;
        case '3':
          handleExplosion();
          break;
        case '4':
          handleSniper();
          break;
        case '0':
          stateManager.setState('default');
          break;
      }
    });

    return () => {
      window.removeEventListener('keydown', () => {});
    };
  }, []);

  const worldContext = {
    activeState: {
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(0, 0, 0),
      euler: new Euler(0, 0, 0),
      direction: new Vector3(0, 0, -1),
    },
    mode: {
      control: 'thirdPerson',
    },
  };

  const cameraOption = {
    distance: 10,
    target: new Vector3(0, 0, 0),
    position: new Vector3(-10, 5, -10),
    shoulderOffset: new Vector3(1, 1.6, -3),
    aimOffset: new Vector3(0.3, 1.6, -1),
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, color: 'white' }}>
        <h3>고급 카메라 시스템 데모</h3>
        <p>키보드 단축키:</p>
        <ul>
          <li>1: 전투 모드 (어깨 카메라)</li>
          <li>2: 시네마틱 모드 (고정 카메라)</li>
          <li>3: 폭발 효과 (지진 + 줌아웃)</li>
          <li>4: 저격 모드 (줌인)</li>
          <li>0: 기본 모드로 복귀</li>
        </ul>
      </div>
    </div>
  );
}

export const CameraExamples = {
  basicShake: () => {
    const effects = new CameraEffects();
    effects.quickShake(0.5, 0.3);
  },

  smoothTransition: () => {
    const blendManager = new CameraBlendManager();
    blendManager.startBlend(
      {
        position: new Vector3(-10, 5, -10),
        fov: 75,
      },
      {
        position: new Vector3(5, 15, 5),
        fov: 45,
      },
      2.0,
      BlendFunction.EaseInOut,
    );
  },

  combatCamera: () => ({
    type: 'shoulder',
    shoulderOffset: new Vector3(1, 1.6, -3),
    aimOffset: new Vector3(0.3, 1.6, -1),
    fov: 60,
  }),

  cinematicCamera: () => ({
    type: 'fixed',
    fixedPosition: new Vector3(10, 15, 10),
    fixedRotation: new Euler(-0.3, 0.8, 0),
    fov: 45,
  }),

  isometricCamera: () => ({
    type: 'isometric',
    distance: 20,
    isoAngle: Math.PI / 4,
    zoom: 1,
  }),

  setupAdvancedCamera: () => {
    const blendManager = new CameraBlendManager();
    const collisionSystem = new SmartCollisionSystem({
      rayCount: 9,
      sphereCastRadius: 0.8,
      minDistance: 1.5,
      maxDistance: 15,
      avoidanceSmoothing: 0.2,
    });
    const stateManager = new CameraStateManager(blendManager);
    const effects = new CameraEffects();

    stateManager.registerState({
      name: 'exploration',
      type: 'thirdPerson',
      position: new Vector3(-8, 6, -8),
      rotation: new Euler(0, 0, 0),
      fov: 75,
      config: { distance: 8 },
      priority: 5,
      tags: ['exploration', 'gameplay'],
    });

    stateManager.registerState({
      name: 'action',
      type: 'shoulder',
      position: new Vector3(-3, 2, -5),
      rotation: new Euler(0, 0, 0),
      fov: 65,
      config: { shoulderOffset: new Vector3(1.2, 1.7, -3.5) },
      priority: 15,
      tags: ['action', 'combat'],
    });

    stateManager.registerTransition({
      from: 'exploration',
      to: 'action',
      condition: () => false,
      duration: 1.2,
      blendFunction: BlendFunction.EaseInOut,
    });

    return { blendManager, collisionSystem, stateManager, effects };
  },
};
