import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimationController } from '../index';
import { useAnimationBridge } from '../../../hooks/useAnimationBridge';

// Mock the useAnimationBridge hook
jest.mock('../../../hooks/useAnimationBridge');
const mockUseAnimationBridge = useAnimationBridge as jest.Mock;

describe('AnimationController', () => {
  const mockPlayAnimation = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Provide a default mock implementation for the hook
    mockUseAnimationBridge.mockReturnValue({
      playAnimation: mockPlayAnimation,
      currentType: 'character',
      currentAnimation: 'idle',
    });
  });

  it('should render animation buttons', () => {
    render(<AnimationController />);
    
    // Check if a few key buttons are rendered
    expect(screen.getByText('Idle')).toBeInTheDocument();
    expect(screen.getByText('Walk')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
  });

  it('should call playAnimation with the correct arguments when a button is clicked', () => {
    render(<AnimationController />);
    
    const walkButton = screen.getByText('Walk');
    fireEvent.click(walkButton);

    expect(mockPlayAnimation).toHaveBeenCalledTimes(1);
    expect(mockPlayAnimation).toHaveBeenCalledWith('character', 'walk');
  });

  it('should apply "active" class to the button of the current animation', () => {
    // Override the mock to set 'run' as the current animation
    mockUseAnimationBridge.mockReturnValue({
      playAnimation: mockPlayAnimation,
      currentType: 'character',
      currentAnimation: 'run',
    });

    render(<AnimationController />);

    const idleButton = screen.getByText('Idle');
    const runButton = screen.getByText('Run');

    expect(idleButton).not.toHaveClass('active');
    expect(runButton).toHaveClass('active');
  });
}); 