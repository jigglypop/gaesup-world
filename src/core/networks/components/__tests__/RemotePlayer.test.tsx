import React from 'react';

import { useGLTF } from '@react-three/drei';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import type { PlayerState } from '../../types';
import { RemotePlayer } from '../RemotePlayer';

jest.mock('@react-three/drei', () => ({
  Text: 'Text',
  useAnimations: jest.fn(() => ({ actions: {}, ref: undefined })),
  useGLTF: jest.fn(() => ({
    animations: [],
    scene: { traverse: jest.fn() },
  })),
}));

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}));

jest.mock('@react-three/rapier', () => ({
  CapsuleCollider: 'CapsuleCollider',
  RigidBody: 'RigidBody',
}));

jest.mock('three-stdlib', () => ({
  SkeletonUtils: {
    clone: jest.fn((scene: { traverse: () => void }) => scene),
  },
}));

jest.mock('../../../ui/components/SpeechBalloon', () => ({
  SpeechBalloon: 'SpeechBalloon',
}));

const PLAYER_STATE: PlayerState = {
  name: 'Remote player',
  color: '',
  position: [1, 2, 3],
  rotation: [1, 0, 0, 0],
};

describe('RemotePlayer', () => {
  const mockedUseGLTF = jest.mocked(useGLTF);

  beforeEach(() => {
    mockedUseGLTF.mockClear();
  });

  test('supports an empty to model URL to empty transition on the same mounted instance', () => {
    let renderer!: ReactTestRenderer;

    act(() => {
      renderer = create(<RemotePlayer playerId="remote-1" state={PLAYER_STATE} />);
    });
    expect(renderer.toJSON()).toBeNull();
    expect(mockedUseGLTF).not.toHaveBeenCalled();

    act(() => {
      renderer.update(
        <RemotePlayer
          playerId="remote-1"
          state={PLAYER_STATE}
          characterUrl="/avatars/remote.glb"
        />,
      );
    });
    expect(renderer.toJSON()).not.toBeNull();
    expect(mockedUseGLTF).toHaveBeenCalledWith('/avatars/remote.glb');

    act(() => {
      renderer.update(<RemotePlayer playerId="remote-1" state={PLAYER_STATE} />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.unmount();
    });
  });
});
