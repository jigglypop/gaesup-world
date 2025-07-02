import React from 'react';
import { render } from '@testing-library/react';
import { RidingAnimation } from '../RidingAnimation';
import { useGLTF, useAnimations } from '@react-three/drei';

jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn(),
  useAnimations: jest.fn()
}));

const mockUseGLTF = useGLTF as jest.Mock;
const mockUseAnimations = useAnimations as jest.Mock;

describe('RidingAnimation', () => {
  let mockActions: any;

  beforeEach(() => {
    mockActions = {
      ride: {
        reset: jest.fn().mockReturnThis(),
        play: jest.fn(),
        stop: jest.fn()
      }
    };
    mockUseGLTF.mockReturnValue({ animations: [] });
    mockUseAnimations.mockReturnValue({ actions: mockActions });
  });

  it('active가 true일 때 ride 애니메이션을 실행해야 합니다.', () => {
    render(<RidingAnimation url="test.glb" active={true} />);
    expect(mockActions.ride.play).toHaveBeenCalled();
  });

  it('active가 false일 때 ride 애니메이션을 실행하지 않아야 합니다.', () => {
    render(<RidingAnimation url="test.glb" active={false} />);
    expect(mockActions.ride.play).not.toHaveBeenCalled();
  });

  it('컴포넌트가 unmount될 때 애니메이션을 중지해야 합니다.', () => {
    const { unmount } = render(<RidingAnimation url="test.glb" active={true} />);
    unmount();
    expect(mockActions.ride.stop).toHaveBeenCalled();
  });

  it('ride action이 없을 경우 오류를 발생시키지 않아야 합니다.', () => {
    mockUseAnimations.mockReturnValue({ actions: {} });
    expect(() => render(<RidingAnimation url="test.glb" active={true} />)).not.toThrow();
  });
});
 