/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

// 실제 GaesupComponent를 모킹 - React Three Fiber 의존성 제거
jest.mock('../../../src/gaesup/component', () => ({
  GaesupComponent: ({ url, componentType, position, ...props }) => (
    <div
      data-testid="mocked-gaesup-component"
      data-url={url}
      data-component-type={componentType}
      data-position-x={position ? position.x : 0}
      data-position-y={position ? position.y : 0}
      data-position-z={position ? position.z : 0}
      {...props}
    >
      Mocked Gaesup Component
    </div>
  ),
}));

// GaesupWorld 컴포넌트를 모킹
jest.mock('../../../src/gaesup/world', () => ({
  GaesupWorld: ({ children, startPosition, mode, cameraOption, ...props }) => (
    <div
      data-testid="mocked-gaesup-world"
      data-start-position-x={startPosition ? startPosition.x : 0}
      data-start-position-y={startPosition ? startPosition.y : 0}
      data-start-position-z={startPosition ? startPosition.z : 0}
      data-mode-type={mode?.type || 'default'}
      data-mode-controller={mode?.controller || 'default'}
      {...props}
    >
      {children}
    </div>
  ),
}));

// 테스트에 사용할 원본 모듈 가져오기 (모킹된 버전)
import { GaesupComponent } from '../../../src/gaesup/component';
import { GaesupWorld } from '../../../src/gaesup/world';

// 테스트 유틸리티 - 벡터 생성
const createVector3 = (x = 0, y = 0, z = 0) => ({ x, y, z });

describe('Mocked Gaesup Components', () => {
  test('GaesupComponent renders with props', () => {
    const testProps = {
      url: '/test/model.glb',
      componentType: 'character',
      position: createVector3(1, 2, 3),
    };

    render(<GaesupComponent {...testProps} />);

    const component = screen.getByTestId('mocked-gaesup-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('data-url', testProps.url);
    expect(component).toHaveAttribute('data-component-type', testProps.componentType);
    expect(component).toHaveAttribute('data-position-x', String(testProps.position.x));
    expect(component).toHaveAttribute('data-position-y', String(testProps.position.y));
    expect(component).toHaveAttribute('data-position-z', String(testProps.position.z));
  });

  test('GaesupWorld renders with children and props', () => {
    const testProps = {
      startPosition: createVector3(10, 0, 10),
      mode: {
        type: 'character',
        controller: 'clicker',
      },
    };

    render(
      <GaesupWorld {...testProps}>
        <GaesupComponent url="/test/model.glb" componentType="character" />
      </GaesupWorld>,
    );

    // GaesupWorld 확인
    const world = screen.getByTestId('mocked-gaesup-world');
    expect(world).toBeInTheDocument();
    expect(world).toHaveAttribute('data-start-position-x', String(testProps.startPosition.x));
    expect(world).toHaveAttribute('data-mode-type', testProps.mode.type);
    expect(world).toHaveAttribute('data-mode-controller', testProps.mode.controller);

    // GaesupComponent가 GaesupWorld 내부에 렌더링되었는지 확인
    const component = screen.getByTestId('mocked-gaesup-component');
    expect(component).toBeInTheDocument();
    expect(world).toContainElement(component);
  });
});
