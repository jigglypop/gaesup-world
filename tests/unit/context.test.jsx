import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import {
  GaesupProvider,
  useWorldState,
  useWorldDispatch,
  useController,
  useControllerDispatch,
} from '../../src/context';

// 테스트 후 정리
afterEach(cleanup);

// 테스트용 컴포넌트 - 컨텍스트 값 읽기
const TestConsumer = ({ callback }) => {
  const worldState = useWorldState();
  const controller = useController();

  // 부모 컴포넌트로 값 전달
  React.useEffect(() => {
    if (callback) {
      callback({ worldState, controller });
    }
  }, [worldState, controller, callback]);

  return null;
};

// 테스트용 컴포넌트 - 디스패치 실행
const TestDispatcher = ({ action, payload }) => {
  const worldDispatch = useWorldDispatch();
  const controllerDispatch = useControllerDispatch();

  React.useEffect(() => {
    if (action === 'world') {
      worldDispatch({
        type: 'update',
        payload,
      });
    } else if (action === 'controller') {
      controllerDispatch({
        type: 'update',
        payload,
      });
    }
  }, [action, payload, worldDispatch, controllerDispatch]);

  return null;
};

describe('Gaesup Context', () => {
  it('provides default context values', () => {
    // 콜백을 통해 컨텍스트 값 검증
    let contextValues = null;

    render(
      <Canvas>
        <Physics>
          <GaesupProvider>
            <TestConsumer
              callback={(values) => {
                contextValues = values;
              }}
            />
          </GaesupProvider>
        </Physics>
      </Canvas>,
    );

    // 컨텍스트 값 검증
    expect(contextValues).not.toBeNull();
    expect(contextValues.worldState).toBeDefined();
    expect(contextValues.controller).toBeDefined();

    // 세부 값 검증
    expect(contextValues.worldState.activeState).toBeDefined();
    expect(contextValues.worldState.cameraOption).toBeDefined();
    expect(contextValues.worldState.states).toBeDefined();
    expect(contextValues.controller.character).toBeDefined();
  });

  it('updates world state via dispatch', () => {
    let contextValuesBefore = null;
    let contextValuesAfter = null;

    const { rerender } = render(
      <Canvas>
        <Physics>
          <GaesupProvider>
            <TestConsumer
              callback={(values) => {
                contextValuesBefore = values;
              }}
            />
          </GaesupProvider>
        </Physics>
      </Canvas>,
    );

    // 상태 갱신 위한 리렌더링
    rerender(
      <Canvas>
        <Physics>
          <GaesupProvider>
            <TestDispatcher
              action="world"
              payload={{
                cameraOption: {
                  maxDistance: 20,
                  position: new THREE.Vector3(5, 5, 5),
                },
              }}
            />
            <TestConsumer
              callback={(values) => {
                contextValuesAfter = values;
              }}
            />
          </GaesupProvider>
        </Physics>
      </Canvas>,
    );

    // 업데이트 후 값 검증
    expect(contextValuesAfter).not.toBeNull();
    expect(contextValuesAfter.worldState.cameraOption).toBeDefined();
    expect(contextValuesAfter.worldState.cameraOption.maxDistance).toBe(20);
    expect(contextValuesAfter.worldState.cameraOption.position.x).toBe(5);
  });

  // 실제 환경에서는 더 많은 디스패치 작업과 선택기 함수 테스트가 필요
});
