import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { AnimationPlayer } from '../index';
import { useAnimationBridge } from '../../../hooks/useAnimationBridge';
import { AnimationSnapshot } from '../../../core/types';

// Mock the useAnimationBridge hook
jest.mock('../../../hooks/useAnimationBridge');
const mockUseAnimationBridge = useAnimationBridge as jest.Mock;

describe('AnimationPlayer', () => {
  const mockPlayAnimation = jest.fn();
  const mockStopAnimation = jest.fn();
  const mockSubscribe = jest.fn();
  const mockSnapshot = jest.fn();

  // A mock bridge object that our mocked hook will return
  const mockBridge = {
    subscribe: mockSubscribe,
    snapshot: mockSnapshot,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseAnimationBridge.mockReturnValue({
      bridge: mockBridge,
      playAnimation: mockPlayAnimation,
      stopAnimation: mockStopAnimation,
      currentType: 'character',
      currentAnimation: 'idle',
    });

    mockSnapshot.mockReturnValue({
      isPlaying: false,
      availableAnimations: ['idle', 'walk', 'run'],
    } as AnimationSnapshot);

    // Default mock for subscribe is to return a no-op unsubscribe function
    mockSubscribe.mockReturnValue(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('should render initial state correctly based on snapshot', () => {
    const { unmount } = render(<AnimationPlayer />);

    // Check if the select box is rendered with options
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('walk')).toBeInTheDocument();
    
    // Check for the play button, as initial state is isPlaying: false
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument();
    unmount();
  });

  it('should call playAnimation when an animation is selected from the dropdown', () => {
    const { unmount } = render(<AnimationPlayer />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'run' } });

    expect(mockPlayAnimation).toHaveBeenCalledWith('character', 'run');
    unmount();
  });

  it('should call playAnimation when play button is clicked while paused', () => {
    const { unmount } = render(<AnimationPlayer />);
    
    const playButton = screen.getByRole('button', { name: 'play' });
    fireEvent.click(playButton);
    
    expect(mockPlayAnimation).toHaveBeenCalledWith('character', 'idle');
    unmount();
  });

  it('should call stopAnimation when pause button is clicked while playing', () => {
    // Override snapshot to simulate 'playing' state
    mockSnapshot.mockReturnValue({
      isPlaying: true,
      availableAnimations: ['idle', 'walk', 'run'],
    } as AnimationSnapshot);

    const { unmount } = render(<AnimationPlayer />);
    
    const pauseButton = screen.getByRole('button', { name: 'pause' });
    fireEvent.click(pauseButton);
    
    expect(mockStopAnimation).toHaveBeenCalledWith('character');
    unmount();
  });
  
  it('should update its state when the bridge subscription notifies', () => {
    const { unmount } = render(<AnimationPlayer />);
    
    // Initial render shows Play icon
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument();

    // Find the callback passed to subscribe
    const bridgeCallback = mockSubscribe.mock.calls[0][0];

    // Simulate the bridge pushing a new state where animation is playing
    mockSnapshot.mockReturnValue({
      isPlaying: true,
      availableAnimations: ['idle', 'walk', 'run'],
    } as AnimationSnapshot);
    
    // Manually trigger the callback
    act(() => {
        bridgeCallback({ isPlaying: true }, 'character');
    });

    // Now it should show the Pause icon
    expect(screen.getByRole('button', { name: 'pause' })).toBeInTheDocument();
    unmount();
  });
}); 