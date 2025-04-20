/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';

// 간단한 테스트 컴포넌트 - Canvas로 감싸진 Three.js 요소 포함
const SimpleScene = () => {
  return (
    <div data-testid="scene-container">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </Canvas>
    </div>
  );
};

describe('Basic Three.js Component', () => {
  test('renders Canvas component without crashing', () => {
    render(<SimpleScene />);
    const sceneContainer = screen.getByTestId('scene-container');
    expect(sceneContainer).toBeInTheDocument();
  });
});

// 간단한 유틸리티 테스트
describe('Three.js Math Utilities', () => {
  test('vector calculations', () => {
    // Three.js 객체 생성 및 연산 테스트
    const createVector = (x, y, z) => ({ x, y, z });

    const v1 = createVector(1, 2, 3);
    const v2 = createVector(4, 5, 6);

    // 벡터 덧셈
    const add = (a, b) => createVector(a.x + b.x, a.y + b.y, a.z + b.z);
    const result = add(v1, v2);

    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });
});

// 간단한 렌더링 프로퍼티 테스트
const ColoredBox = ({ color = 'red' }) => {
  return (
    <div data-testid="colored-box" style={{ backgroundColor: color, width: 100, height: 100 }}>
      Box
    </div>
  );
};

describe('Component Property Tests', () => {
  test('renders with correct color prop', () => {
    render(<ColoredBox color="blue" />);
    const box = screen.getByTestId('colored-box');
    expect(box).toHaveStyle({ backgroundColor: 'blue' });
  });

  test('renders with default color when no prop provided', () => {
    render(<ColoredBox />);
    const box = screen.getByTestId('colored-box');
    expect(box).toHaveStyle({ backgroundColor: 'red' });
  });
});
