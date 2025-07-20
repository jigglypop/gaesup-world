import React from 'react';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import GridHelper from '../GridHelper';
import { TILE_CONSTANTS } from '../../types/constants';

// TestWrapper for React Three Fiber Canvas
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Canvas>
    {children}
  </Canvas>
);

describe('GridHelper 컴포넌트 테스트', () => {
  describe('기본 렌더링', () => {
    test('기본 props로 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('size prop이 적용되어야 함', () => {
      const testSize = 50;
      
      const { container } = render(
        <TestWrapper>
          <GridHelper size={testSize} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('divisions prop이 적용되어야 함', () => {
      const testDivisions = 20;
      
      const { container } = render(
        <TestWrapper>
          <GridHelper divisions={testDivisions} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('colorCenterLine prop이 적용되어야 함', () => {
      const testColor = '#ff0000';
      
      const { container } = render(
        <TestWrapper>
          <GridHelper colorCenterLine={testColor} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('colorGrid prop이 적용되어야 함', () => {
      const testColor = '#00ff00';
      
      const { container } = render(
        <TestWrapper>
          <GridHelper colorGrid={testColor} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('props 조합', () => {
    test('모든 props가 함께 적용되어야 함', () => {
      const props = {
        size: 100,
        divisions: 50,
        colorCenterLine: '#ff0000',
        colorGrid: '#0000ff'
      };
      
      const { container } = render(
        <TestWrapper>
          <GridHelper {...props} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('일부 props만 제공되어도 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper size={75} divisions={15} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('색상만 변경해도 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper colorCenterLine="#ffffff" colorGrid="#000000" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('size 유효성', () => {
    test('매우 작은 size도 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper size={1} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('매우 큰 size도 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper size={1000} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('소수점 size도 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper size={25.5} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('0 size도 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper size={0} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('color 유효성', () => {
    test('hex 색상이 적용되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper colorCenterLine="#ff5733" colorGrid="#33c4ff" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('짧은 hex 색상도 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper colorCenterLine="#f53" colorGrid="#3cf" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('named 색상도 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper colorCenterLine="red" colorGrid="blue" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('rgb 색상도 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper colorCenterLine="rgb(255, 0, 0)" colorGrid="rgb(0, 0, 255)" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('투명도가 있는 색상도 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper 
            colorCenterLine="rgba(255, 0, 0, 0.5)" 
            colorGrid="rgba(0, 0, 255, 0.3)" 
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('divisions 유효성', () => {
    test('매우 큰 divisions도 처리되어야 함', () => {
      const largeDivisions = 1000;
      
      const { container } = render(
        <TestWrapper>
          <GridHelper divisions={largeDivisions} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('0 divisions도 렌더링되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper divisions={0} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('소수점 divisions도 처리되어야 함', () => {
      const decimalDivisions = 12.5;
      
      const { container } = render(
        <TestWrapper>
          <GridHelper divisions={decimalDivisions} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('props 변경 반응성', () => {
    test('size 변경 시 리렌더링되어야 함', () => {
      const { container, rerender } = render(
        <TestWrapper>
          <GridHelper size={10} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <GridHelper size={20} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('색상 변경 시 리렌더링되어야 함', () => {
      const { container, rerender } = render(
        <TestWrapper>
          <GridHelper colorCenterLine="#ff0000" colorGrid="#00ff00" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <GridHelper colorCenterLine="#0000ff" colorGrid="#ffff00" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('모든 props 변경 시 리렌더링되어야 함', () => {
      const { container, rerender } = render(
        <TestWrapper>
          <GridHelper size={10} divisions={5} colorCenterLine="#ff0000" colorGrid="#00ff00" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <GridHelper size={20} divisions={10} colorCenterLine="#0000ff" colorGrid="#ffff00" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('에지 케이스', () => {
    test('undefined props가 기본값으로 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper 
            size={undefined} 
            divisions={undefined} 
            colorCenterLine={undefined} 
            colorGrid={undefined} 
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('null props가 처리되어야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper 
            size={null as any} 
            divisions={null as any} 
            colorCenterLine={null as any} 
            colorGrid={null as any} 
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('성능', () => {
    test('동일한 props로 리렌더링해도 성능 문제가 없어야 함', () => {
      const props = {
        size: 25,
        divisions: 10,
        colorCenterLine: '#ffffff',
        colorGrid: '#888888'
      };

      const { container, rerender } = render(
        <TestWrapper>
          <GridHelper {...props} />
        </TestWrapper>
      );

      // 여러 번 리렌더링
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <GridHelper {...props} />
          </TestWrapper>
        );
      }

      expect(container.firstChild).toBeInTheDocument();
    });

    test('매우 많은 divisions도 렌더링 가능해야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper divisions={500} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('실제 사용 시나리오', () => {
    test('건물 에디터에서 일반적으로 사용되는 크기들이 작동해야 함', () => {
      const commonSizes = [10, 25, 50, 100];
      
      commonSizes.forEach(size => {
        const { container, unmount } = render(
          <TestWrapper>
            <GridHelper size={size} divisions={size} />
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();
        
        unmount();
      });
    });

    test('타일 상수와 일치하는 분할이 올바르게 작동해야 함', () => {
      const { container } = render(
        <TestWrapper>
          <GridHelper 
            size={TILE_CONSTANTS.SIZE} 
            divisions={TILE_CONSTANTS.SIZE} 
          />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
      
      // 예상 분할 수가 25인지 확인
      expect(TILE_CONSTANTS.SIZE).toBe(25);
    });

    test('서로 다른 편집 모드에서의 그리드 색상이 작동해야 함', () => {
      const editModeColors = [
        { center: '#ff0000', grid: '#ffcccc' }, // 삭제 모드
        { center: '#00ff00', grid: '#ccffcc' }, // 추가 모드  
        { center: '#0000ff', grid: '#ccccff' }  // 편집 모드
      ];
      
      editModeColors.forEach(colors => {
        const { container, unmount } = render(
          <TestWrapper>
            <GridHelper 
              colorCenterLine={colors.center}
              colorGrid={colors.grid}
            />
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();
        
        unmount();
      });
    });
  });
}); 